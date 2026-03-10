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
import { differenceInDays, parse, isValid } from 'date-fns';
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
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals && savedRentals !== "null") {
        const rentals = JSON.parse(savedRentals);
        if (Array.isArray(rentals)) {
          rentals.forEach((rental: any, idx: number) => {
            if (!rental || rental.status === 'completed' || !rental.end) return;
            
            const isGestor = localStorage.getItem('userRole') === 'Gestor';
            const isMyRental = rental.clientEmail && String(rental.clientEmail).toLowerCase().trim() === userEmail;
            
            if (!isGestor && !isMyRental) return;

            try {
              const endStr = String(rental.end);
              let endDate: Date;
              if (endStr.includes('/')) {
                endDate = parse(endStr, 'dd/MM/yyyy', new Date());
              } else {
                endDate = new Date(endStr);
              }

              if (isValid(endDate)) {
                const daysLeft = differenceInDays(endDate, today);
                const safeId = rental.id || `notif-${idx}`;

                if (daysLeft < 0) {
                  newNotifications.push({
                    id: `overdue-${safeId}`,
                    title: "Aluguel Atrasado!",
                    description: `O item ${rental.item || 'Equipamento'} venceu em ${endStr}.`,
                    type: 'danger',
                    date: endStr,
                    path: '/perfil?tab=rentals'
                  });
                } else if (daysLeft <= 2) {
                  newNotifications.push({
                    id: `near-${safeId}`,
                    title: "Entrega Próxima",
                    description: `O item ${rental.item || 'Equipamento'} vence em ${endStr}.`,
                    type: 'warning',
                    date: endStr,
                    path: '/perfil?tab=rentals'
                  });
                }
              }
            } catch (e) {}
          });
        }
      }

      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        if (Array.isArray(orders)) {
          const myPending = orders.filter((o: any) => 
            o && o.userEmail && String(o.userEmail).toLowerCase().trim() === userEmail && o.status === 'Pendente'
          );
          
          myPending.slice(0, 2).forEach((order: any, idx: number) => {
            newNotifications.push({
              id: `order-${order.id || idx}`,
              title: "Pedido em Aberto",
              description: `O seu pedido ${order.id} está pendente.`,
              type: 'info',
              date: order.date || "",
              path: '/perfil?tab=orders'
            });
          });
        }
      }
    } catch (e) {
      console.error("Erro ao carregar notificações:", e);
    }

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
        <DropdownMenuLabel className="px-4 py-2 text-sm font-black text-slate-900">Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 my-2" />
        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto" />
              <p className="text-xs font-bold text-slate-400">Nenhum aviso no momento.</p>
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <DropdownMenuItem 
                key={notif.id || idx} 
                onClick={() => navigate(notif.path)}
                className="rounded-2xl p-4 cursor-pointer focus:bg-slate-50 border border-transparent hover:border-slate-100 flex gap-4"
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", notif.type === 'danger' ? "bg-red-50 text-red-600" : notif.type === 'warning' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600")}>
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