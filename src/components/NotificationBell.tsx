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
    
    // Obter dados do usuário com segurança total
    const userRole = localStorage.getItem('userRole') || 'Visitante';
    const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
    const isGestor = ['Gestor', 'Vendas'].includes(userRole);

    try {
      // 1. Aluguéis
      const rentalsRaw = localStorage.getItem('app_rentals');
      if (rentalsRaw && rentalsRaw !== "undefined") {
        const rentals = JSON.parse(rentalsRaw);
        if (Array.isArray(rentals)) {
          rentals.forEach((rental, idx) => {
            if (!rental || typeof rental !== 'object' || rental.status === 'completed') return;
            
            const clientEmail = (rental.clientEmail || rental.userEmail || "").toLowerCase().trim();
            if (!isGestor && clientEmail !== userEmail) return;

            const endStr = rental.end ? String(rental.end) : null;
            if (endStr) {
              let endDate: Date | null = null;
              try {
                if (endStr.includes('/')) endDate = parse(endStr, 'dd/MM/yyyy', new Date());
                else if (endStr.includes('-')) endDate = parseISO(endStr);
              } catch (e) { endDate = null; }

              if (endDate && isValid(endDate)) {
                const days = differenceInDays(endDate, now);
                const safeId = rental.id || `notif-r-${idx}`;
                const prefix = isGestor ? `[${rental.client || 'Cliente'}] ` : "";

                if (days < 0) {
                  list.push({ id: `o-${safeId}`, title: "Atraso!", description: `${prefix}${rental.item || 'Item'} vencido.`, type: 'danger', date: endStr, path: '/perfil?tab=rentals' });
                } else if (days <= 2) {
                  list.push({ id: `n-${safeId}`, title: "Vencendo", description: `${prefix}${rental.item || 'Item'} em breve.`, type: 'warning', date: endStr, path: '/perfil?tab=rentals' });
                }
              }
            }
          });
        }
      }

      // 2. Pedidos
      const ordersRaw = localStorage.getItem('app_orders');
      if (ordersRaw && ordersRaw !== "undefined") {
        const orders = JSON.parse(ordersRaw);
        if (Array.isArray(orders)) {
          orders.forEach((order, idx) => {
            if (!order || typeof order !== 'object' || order.status !== 'Pendente') return;
            
            const orderEmail = (order.userEmail || "").toLowerCase().trim();
            if (!isGestor && orderEmail !== userEmail) return;

            list.push({ id: `ord-${order.id || idx}`, title: "Pedido Pendente", description: isGestor ? `Pedido de ${order.clientName || 'Cliente'} aguarda pagamento.` : `Seu pedido ${order.id || ''} aguarda pagamento.`, type: 'info', date: order.date || "", path: '/perfil?tab=orders' });
          });
        }
      }
    } catch (e) { console.warn("Erro ao processar notificações."); }

    setNotifications(list);
  }, []);

  useEffect(() => {
    checkNotifications();
    const update = () => checkNotifications();
    window.addEventListener('order-placed', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('order-placed', update);
      window.removeEventListener('storage', update);
    };
  }, [checkNotifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 relative h-10 w-10 focus-visible:ring-0">
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
            <div className="py-10 text-center"><p className="text-xs font-bold text-slate-400">Sem avisos.</p></div>
          ) : (
            notifications.map((notif, idx) => (
              <DropdownMenuItem key={`${notif.id}-${idx}`} onClick={() => navigate(notif.path)} className="rounded-2xl p-4 cursor-pointer focus:bg-slate-50 border border-transparent flex gap-4 transition-all">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", 
                  notif.type === 'danger' ? "bg-red-50 text-red-600" : 
                  notif.type === 'warning' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600")}>
                  {notif.type === 'danger' ? <AlertCircle className="h-5 w-5" /> : 
                   notif.type === 'info' ? <ShoppingBag className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
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