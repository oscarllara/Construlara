"use client";

import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { differenceInDays, parse } from 'date-fns';
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
  const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();

  const checkNotifications = () => {
    const newNotifications: Notification[] = [];
    const today = new Date();

    try {
      // 1. Aluguéis Próximos ou Atrasados
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals) {
        const rentals = JSON.parse(savedRentals);
        if (Array.isArray(rentals)) {
          rentals.forEach((rental: any) => {
            if (rental.status === 'completed' || !rental.end) return;
            
            const isGestor = localStorage.getItem('userRole') === 'Gestor';
            const isMyRental = (rental.clientEmail || "").toLowerCase().trim() === userEmail;
            
            if (!isGestor && !isMyRental) return;

            let endDate = rental.end.includes('/') ? parse(rental.end, 'dd/MM/yyyy', new Date()) : new Date(rental.end);
            const daysLeft = differenceInDays(endDate, today);

            if (daysLeft < 0) {
              newNotifications.push({
                id: `notif-overdue-${rental.id}`,
                title: "Contrato Atrasado!",
                description: `O item ${rental.item} (${rental.client}) venceu em ${rental.end}.`,
                type: 'danger',
                date: rental.end,
                path: '/perfil?tab=rentals'
              });
            } else if (daysLeft <= 2) {
              newNotifications.push({
                id: `notif-near-${rental.id}`,
                title: "Devolução Próxima",
                description: `O item ${rental.item} deve ser devolvido em breve (${rental.end}).`,
                type: 'warning',
                date: rental.end,
                path: '/perfil?tab=rentals'
              });
            }
          });
        }
      }

      // 2. Pedidos Recentes
      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        if (Array.isArray(orders)) {
          const myRecentOrders = orders.filter((o: any) => 
            (o.userEmail || "").toLowerCase().trim() === userEmail && o.status === 'Pendente'
          );
          
          myRecentOrders.slice(0, 3).forEach((order: any) => {
            newNotifications.push({
              id: `notif-order-${order.id}`,
              title: "Pedido Registrado",
              description: `Seu pedido ${order.id} está em processamento.`,
              type: 'success',
              date: order.date,
              path: '/perfil?tab=orders'
            });
          });
        }
      }
    } catch (e) { console.error(e); }

    setNotifications(newNotifications);
  };

  useEffect(() => {
    checkNotifications();
    window.addEventListener('order-placed', checkNotifications);
    window.addEventListener('storage', checkNotifications);
    return () => {
      window.removeEventListener('order-placed', checkNotifications);
      window.removeEventListener('storage', checkNotifications);
    };
  }, [userEmail]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 relative h-10 w-10">
          <Bell className="h-5 w-5 text-slate-600" />
          {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white">{notifications.length}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-[2rem] p-4 bg-white border border-slate-100 shadow-2xl mt-2 z-[100]" align="end">
        <DropdownMenuLabel className="px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-black text-slate-900">Notificações</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 my-2" />
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto" />
              <p className="text-xs font-bold text-slate-400">Tudo em dia!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id} 
                onClick={() => navigate(notif.path)}
                className="rounded-2xl p-4 cursor-pointer focus:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex gap-4"
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", notif.type === 'danger' ? "bg-red-50 text-red-600" : notif.type === 'warning' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                  {notif.type === 'danger' ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900 leading-none">{notif.title}</p>
                  <p className="text-xs font-medium text-slate-500 leading-tight">{notif.description}</p>
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