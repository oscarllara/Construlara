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
    const list: Notification[] = [];
    const now = new Date();
    
    // 1. Obter dados do usuário de forma segura
    const rawRole = localStorage.getItem('userRole');
    const rawEmail = localStorage.getItem('userEmail');
    const userRole = rawRole ? String(rawRole) : 'Visitante';
    const userEmail = rawEmail ? String(rawEmail).toLowerCase().trim() : '';
    const isGestor = ['Gestor', 'Vendas'].includes(userRole);

    try {
      // 2. Processar Aluguéis (Rentals)
      const rentalsData = localStorage.getItem('app_rentals');
      if (rentalsData && rentalsData !== "undefined" && rentalsData !== "null") {
        const rentals = JSON.parse(rentalsData);
        if (Array.isArray(rentals)) {
          rentals.forEach((rental, idx) => {
            if (!rental || typeof rental !== 'object' || rental.status === 'completed') return;
            
            const clientEmail = String(rental.clientEmail || rental.userEmail || "").toLowerCase().trim();
            const isMyRental = userEmail !== "" && clientEmail === userEmail;
            
            // Regra: Gestor vê tudo, Cliente vê só o dele
            if (!isGestor && !isMyRental) return;

            const endStr = rental.end ? String(rental.end) : null;
            if (endStr) {
              let endDate: Date | null = null;
              try {
                if (endStr.includes('/')) {
                  endDate = parse(endStr, 'dd/MM/yyyy', new Date());
                } else if (endStr.includes('-')) {
                  endDate = parseISO(endStr);
                }
              } catch (e) { endDate = null; }

              if (endDate && isValid(endDate)) {
                const days = differenceInDays(endDate, now);
                const clientLabel = isGestor ? `[${rental.client || 'Cliente'}] ` : "";
                const itemLabel = rental.item || 'Equipamento';
                const baseId = rental.id || `r-${idx}`;

                if (days < 0) {
                  list.push({
                    id: `overdue-${baseId}`,
                    title: "Locação Vencida!",
                    description: `${clientLabel}O item ${itemLabel} está com prazo expirado.`,
                    type: 'danger',
                    date: endStr,
                    path: '/perfil?tab=rentals'
                  });
                } else if (days <= 2) {
                  list.push({
                    id: `near-${baseId}`,
                    title: "Prazo Final",
                    description: `${clientLabel}Devolução do item ${itemLabel} em breve.`,
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

      // 3. Processar Pedidos (Orders)
      const ordersData = localStorage.getItem('app_orders');
      if (ordersData && ordersData !== "undefined" && ordersData !== "null") {
        const orders = JSON.parse(ordersData);
        if (Array.isArray(orders)) {
          orders.forEach((order, idx) => {
            if (!order || typeof order !== 'object' || order.status !== 'Pendente') return;
            
            const orderEmail = String(order.userEmail || "").toLowerCase().trim();
            const isMyOrder = userEmail !== "" && orderEmail === userEmail;

            if (!isGestor && !isMyOrder) return;

            list.push({
              id: `order-${order.id || idx}`,
              title: "Pagamento Pendente",
              description: isGestor 
                ? `Pedido de ${order.clientName || 'Cliente'} aguarda conferência.`
                : `Seu pedido ${order.id || ''} aguarda o pagamento.`,
              type: 'info',
              date: order.date || "",
              path: '/perfil?tab=orders'
            });
          });
        }
      }
    } catch (error) {
      console.error("Erro Crítico nas Notificações:", error);
    }

    setNotifications(list);
  }, []);

  useEffect(() => {
    checkNotifications();
    
    // Ouvinte para atualizações globais
    const onUpdate = () => checkNotifications();
    window.addEventListener('order-placed', onUpdate);
    window.addEventListener('storage', onUpdate);
    
    return () => {
      window.removeEventListener('order-placed', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, [checkNotifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 relative h-10 w-10 outline-none">
          <Bell className="h-5 w-5 text-slate-600" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm pointer-events-none">
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
              <p className="text-xs font-bold text-slate-400">Tudo em ordem por aqui.</p>
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <DropdownMenuItem 
                key={`${notif.id}-${idx}`} 
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