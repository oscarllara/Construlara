"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parse } from 'date-fns';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'danger' | 'info';
  date: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const checkRentals = () => {
      const savedRentals = localStorage.getItem('app_rentals');
      if (!savedRentals) return;

      const rentals = JSON.parse(savedRentals);
      const newNotifications: Notification[] = [];
      const today = new Date();

      rentals.forEach((rental: any) => {
        if (rental.status === 'completed') return;

        // Tenta converter a data (formato DD/MM/YYYY ou YYYY-MM-DD)
        let endDate: Date;
        try {
          if (rental.end.includes('/')) {
            endDate = parse(rental.end, 'dd/MM/yyyy', new Date());
          } else {
            endDate = new Date(rental.end);
          }
        } catch (e) {
          return;
        }

        const daysLeft = differenceInDays(endDate, today);

        if (rental.status === 'overdue' || daysLeft < 0) {
          newNotifications.push({
            id: `notif-overdue-${rental.id}`,
            title: "Contrato Atrasado!",
            description: `O item ${rental.item} deveria ter sido devolvido.`,
            type: 'danger',
            date: rental.end
          });
        } else if (daysLeft <= 2) {
          newNotifications.push({
            id: `notif-near-${rental.id}`,
            title: "Devolução Próxima",
            description: `O item ${rental.item} vence em ${daysLeft === 0 ? 'hoje' : daysLeft === 1 ? 'amanhã' : daysLeft + ' dias'}.`,
            type: 'warning',
            date: rental.end
          });
        }
      });

      setNotifications(newNotifications);
    };

    checkRentals();
    // Verifica a cada 1 minuto
    const interval = setInterval(checkRentals, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 relative h-10 w-10">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-[2rem] p-4 border-none shadow-2xl mt-2" align="end">
        <DropdownMenuLabel className="px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-black text-slate-900">Notificações</span>
          {unreadCount > 0 && (
            <Badge className="bg-blue-50 text-blue-700 border-none text-[10px] font-black">
              {unreadCount} NOVAS
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 my-2" />
        
        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
          {notifications.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto" />
              <p className="text-xs font-bold text-slate-400">Tudo em dia por aqui!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem 
                key={notif.id} 
                className="rounded-2xl p-4 cursor-pointer focus:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    notif.type === 'danger' ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {notif.type === 'danger' ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 leading-none">{notif.title}</p>
                    <p className="text-xs font-medium text-slate-500 leading-tight">{notif.description}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase pt-1">
                      <Calendar className="h-3 w-3" /> {notif.date}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-slate-100 my-2" />
            <Button variant="ghost" className="w-full rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Marcar todas como lidas
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;