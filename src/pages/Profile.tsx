"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Receipt, Calendar, ShieldCheck } from 'lucide-react';
import { UserAccount } from '@/components/UserTable';

const ProfilePage = () => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [userRentals, setUserRentals] = useState<any[]>([]);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const savedUsers = localStorage.getItem('app_users');
    const savedRentals = localStorage.getItem('app_rentals');

    if (email && savedUsers) {
      const users: UserAccount[] = JSON.parse(savedUsers);
      const foundUser = users.find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser);
        
        if (savedRentals) {
          const rentals = JSON.parse(savedRentals);
          // Filtra contratos onde o nome do cliente ou ID coincide
          const filtered = rentals.filter((r: any) => 
            r.client === foundUser.name || r.clientId === foundUser.id
          );
          setUserRentals(filtered);
        }
      }
    }
  }, []);

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-slate-500 font-bold">Carregando perfil...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Coluna da Esquerda: Dados Pessoais */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
              <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-800"></div>
              <CardContent className="relative pt-0 px-8 pb-8">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <div className="h-24 w-24 rounded-[2rem] bg-white p-1 shadow-xl">
                    <div className="h-full w-full rounded-[1.8rem] bg-slate-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-16 text-center space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                  <Badge className="bg-blue-100 text-blue-700 border-none rounded-xl font-bold px-4 py-1">
                    {user.role}
                  </Badge>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase">E-mail</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Phone className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">WhatsApp</p>
                      <p className="text-sm font-bold text-slate-700">{user.whatsapp}</p>
                    </div>
                  </div>
                  {user.worksiteAddress && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Endereço da Obra</p>
                        <p className="text-sm font-bold text-slate-700 leading-tight">{user.worksiteAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-900 rounded-[2.5rem] p-8 text-white space-y-4 shadow-2xl shadow-blue-900/20">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
                <h3 className="font-black text-lg">Segurança</h3>
              </div>
              <p className="text-sm text-blue-200 font-medium">Sua conta está protegida. Último acesso registrado em {user.lastAccess}.</p>
            </div>
          </div>

          {/* Coluna da Direita: Contratos/Pedidos */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Receipt className="h-7 w-7 text-blue-600" />
                Meus Contratos
              </h3>
              <Badge className="bg-slate-100 text-slate-600 border-none rounded-xl font-bold px-4 py-1">
                {userRentals.length} Total
              </Badge>
            </div>

            {userRentals.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                <Receipt className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">Você ainda não possui contratos registrados.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {userRentals.map((rental) => (
                  <Card key={rental.id} className="border-none shadow-sm rounded-[2rem] bg-white hover:shadow-md transition-all overflow-hidden group">
                    <div className="flex items-center p-6 gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <Calendar className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-black text-slate-900">{rental.item}</h4>
                          <span className="text-lg font-black text-blue-700">R$ {rental.total?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span>Início: {rental.start}</span>
                          <span>Fim: {rental.end}</span>
                        </div>
                      </div>
                      <Badge className={cn(
                        "rounded-xl border-none font-bold px-4 py-2",
                        rental.status === 'active' ? "bg-blue-100 text-blue-700" :
                        rental.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {rental.status === 'active' ? 'Ativo' : 
                         rental.status === 'completed' ? 'Finalizado' : 'Atrasado'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

import { cn } from '@/lib/utils';
export default ProfilePage;