"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, AlertCircle, Clock, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { differenceInDays, parse, isValid, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  date: string;
  path: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  const checkNotifications = useCallback(() => {
    const newNotifications: Notification[] = [];
    const today = new Date();
    
    // Pegar dados do usuário com segurança
    const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
    const userRole = localStorage.getItem('userRole') || 'Visitante';
    const isGestor = ['Gestor', 'Vendas'].includes(userRole);

    try {
      // 1. Processar Aluguéis
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals && savedRentals !== "undefined" && savedRentals !== "null") {
        const rentals = JSON.parse(savedRentals);
        if (Array.isArray(rentals)) {
          rentals.forEach((rental: any, idx: number) => {
            // Pular se o item for inválido ou já finalizado
            if (!rental || typeof rental !== 'object' || rental.status === 'completed') return;
            
            const rentalEmail = String(rental.clientEmail || rental.userEmail || "").toLowerCase().trim();
            const isMyRental = userEmail !== "" && rentalEmail === userEmail;
            
            // Regra: Gestor vê tudo, Cliente vê só o dele
            if (!isGestor && !isMyRental) return;

            // Tentar processar a data de devolução
            const endStr = rental.end ? String(rental.end) : null;
            if (endStr) {
              let endDate: Date | null = null;
              if (endStr.includes('/')) {
                endDate = parse(endStr, 'dd/MM/yyyy', new Date());
              } else if (endStr.includes('-')) {
                endDate = parseISO(endStr);
              }

              if (endDate && isValid(endDate)) {
                const daysLeft = differenceInDays(endDate, today);
                const safeId = rental.id || `notif-r-${idx}`;
                const clientPrefix = isGestor ? `[${rental.client || 'Cliente'}] ` : "";
                const itemName = rental.item || 'Equipamento';

                if (daysLeft < 0) {
                  newNotifications.push({
                    id: `overdue-${safeId}`,
                    title: "Locação Vencida!",
                    description: `${clientPrefix}O item ${itemName} está com prazo de devolução expirado.`,
                    type: 'danger',
                    date: endStr,
                    path: '/perfil?tab=rentals'
                  });
                } else if (daysLeft <= 2) {
                  newNotifications.push({
                    id: `near-${safeId}`,
                    title: "Prazo Vencendo",
                    description: `${clientPrefix}A devolução do item ${itemName} está próxima.`,
                    type: 'warning',
                    date: endStr,
                    path: '/perfil?tab=rentals'
                  });
                }
              }
            }
          });
        }
      }

      // 2. Processar Pedidos
      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders && savedOrders !== "undefined" && savedOrders !== "null") {
        const orders = JSON.parse(savedOrders);
        if (Array.isArray(orders)) {
          orders.forEach((order: any, idx: number) => {
            if (!order || typeof order !== 'object' || order.status !== 'Pendente') return;
            
            const orderEmail = String(order.userEmail || "").toLowerCase().trim();
            const isMyOrder = userEmail !== "" && orderEmail === userEmail;

            if (!isGestor && !isMyOrder) return;

            newNotifications.push({
              id: `order-${order.id || idx}`,
              title: "Pagamento Pendente",
              description: isGestor 
                ? `Pedido de ${order.clientName || 'Cliente'} aguarda confirmação de pagamento.`
                : `Seu pedido ${order.id || ''} está aguardando o pagamento.`,
              type: 'info',
              date: order.date || "",
              path: '/perfil?tab=orders'
            });
          });
        }
      }
    } catch (e) { 
      console.warn("Erro ao processar notificações:", e);
    }

    setNotifications(newNotifications);
  }, []); // Dependências vazias pois usamos localStorage diretamente

  useEffect(() => {
    checkNotifications();
    const handleEvents = () => checkNotifications();
    
    window.addEventListener('order-placed', handleEvents);
    window.addEventListener('storage', handleEvents);
    
    return () => {
      window.removeEventListener('order-placed', handleEvents);
      window.removeEventListener('storage', handleEvents);
    };
  }, [checkNotifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 relative h-10 w-10">
          <Bell className="h-5 w-5 text-slate-600" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-[2rem] p-4 bg-white border border-slate-100 shadow-2xl mt-2 z-[100]" align="end">
        <DropdownMenuLabel className="px-4 py-2 text-sm font-black text-slate-900">Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 my-2" />
        <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-slate-200 mx-auto" />
              <p className="text-xs font-bold text-slate-400">Nenhum aviso no momento.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id} 
                onClick={() => { if (notif.path) navigate(notif.path); }}
                className="rounded-2xl p-4 cursor-pointer focus:bg-slate-50 border border-transparent flex gap-4 transition-all"
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", 
                  notif.type === 'danger' ? "bg-red-50 text-red-600" : 
                  notif.type === 'warning' ? "bg-amber-50 text-amber-600" : 
                  "bg-blue-50 text-blue-600")}>
                  {notif.type === 'danger' ? <AlertCircle className="h-5 w-5" /> : 
                   notif.type === 'info' ? <ShoppingBag className="h-5 w-5" /> :
                   <Clock className="h-5 w-5" />}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <p className="text-sm font-black text-slate-900 leading-tight truncate">{notif.title}</p>
                  <p className="text-[11px] font-medium text-slate-500 leading-snug line-clamp-2">{notif.description}</p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;