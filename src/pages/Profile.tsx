"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Mail, Phone, MapPin, Receipt, Calendar, ShieldCheck, 
  ShoppingBag, MessageCircle, Pencil, ArrowRight, Package, 
  RefreshCw, DollarSign, Wallet, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { UserAccount } from '@/components/UserTable';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [userRentals, setUserRentals] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadProfileData = () => {
    const email = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
    const savedUsers = localStorage.getItem('app_users');
    const savedRentals = localStorage.getItem('app_rentals');
    const savedOrders = localStorage.getItem('app_orders');

    if (!email) {
      navigate('/login');
      return;
    }

    // 1. Carregar Dados do Usuário
    let foundUser: UserAccount | undefined;
    if (savedUsers) {
      const users: UserAccount[] = JSON.parse(savedUsers);
      foundUser = users.find(u => u.email.toLowerCase().trim() === email);
    }

    if (foundUser) {
      setUser(foundUser);
    } else {
      const role = localStorage.getItem('userRole') || 'Usuário';
      const tempUser: UserAccount = {
        id: 'temp',
        name: email.split('@')[0],
        email: email,
        whatsapp: '(32) 99999-9999',
        role: role as any,
        status: 'active',
        lastAccess: 'Agora'
      };
      setUser(tempUser);
      foundUser = tempUser;
    }

    // 2. Carregar Aluguéis (Lógica Corrigida)
    if (savedRentals) {
      const rentals = JSON.parse(savedRentals);
      const filtered = rentals.filter((r: any) => 
        (r.clientId && r.clientId === foundUser?.id) || 
        (r.clientEmail && r.clientEmail.toLowerCase().trim() === email) ||
        (r.client && r.client.toLowerCase() === foundUser?.name.toLowerCase())
      );
      setUserRentals(filtered);
    }

    // 3. Carregar Pedidos
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      const filteredOrders = orders.filter((o: any) => {
        const orderEmail = (o.userEmail || '').toLowerCase().trim();
        return orderEmail === email;
      });
      setUserOrders(filteredOrders);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadProfileData();
    window.addEventListener('storage', loadProfileData);
    window.addEventListener('order-placed', loadProfileData);
    return () => {
      window.removeEventListener('storage', loadProfileData);
      window.removeEventListener('order-placed', loadProfileData);
    };
  }, []);

  // Cálculos Financeiros
  const financialSummary = React.useMemo(() => {
    const shopTotal = userOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const shopPaid = userOrders.reduce((acc, o) => acc + (Number(o.paidAmount) || 0), 0);
    
    const rentalTotal = userRentals.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
    const rentalPaid = userRentals.reduce((acc, r) => acc + (Number(r.paidAmount) || 0), 0);

    return {
      total: shopTotal + rentalTotal,
      paid: shopPaid + rentalPaid,
      pending: (shopTotal + rentalTotal) - (shopPaid + rentalPaid)
    };
  }, [userOrders, userRentals]);

  const handleResendOrder = (order: any) => {
    const itemsList = order.items.map((item: any) => {
      const price = item.isPromo ? (item.promoPrice || item.price) : item.price;
      const detail = item.isFractional 
        ? `${item.quantity} cx (${(item.totalAmount || 0).toFixed(2)}${item.unitLabel || 'un'})`
        : `${item.quantity} un`;
      return `• ${item.name} [${detail}] - R$ ${(price * (item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0))).toFixed(2)}`;
    }).join('\n');

    const message = `*REENVIO DE PEDIDO - CONSTRULARA*\nID: ${order.id}\nTotal: R$ ${order.total.toFixed(2)}\n\nEstou reenviando meu pedido para confirmação!`;
    window.open(`https://wa.me/5532999625979?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) return null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Coluna Lateral */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
              <div className="h-24 bg-gradient-to-br from-blue-600 to-blue-800"></div>
              <CardContent className="relative pt-0 px-8 pb-8 text-center">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                  <div className="h-20 w-20 rounded-[1.5rem] bg-white p-1 shadow-xl">
                    <div className="h-full w-full rounded-[1.3rem] bg-slate-100 flex items-center justify-center">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="mt-12 space-y-1">
                  <h2 className="text-xl font-black text-slate-900">{user?.name}</h2>
                  <Badge className="bg-blue-100 text-blue-700 border-none rounded-xl font-bold px-4">{user?.role}</Badge>
                </div>
                <div className="mt-6 space-y-3 text-left">
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600 truncate">{user?.email}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{user?.whatsapp}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[3rem] bg-slate-900 text-white p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-emerald-400" />
                <h3 className="font-black text-lg">Minha Conta</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Total Acumulado</span>
                  <span className="text-xl font-black">R$ {financialSummary.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-emerald-400 uppercase">Total Pago</span>
                  <span className="text-xl font-black text-emerald-400">R$ {financialSummary.paid.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-[10px] font-black text-red-400 uppercase">Saldo Devedor</span>
                  <span className="text-2xl font-black text-red-400">R$ {financialSummary.pending.toFixed(2)}</span>
                </div>
              </div>
              {financialSummary.pending > 0 && (
                <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-[10px] font-bold text-red-200 leading-tight">Você possui faturas pendentes. Entre em contato com a loja para regularizar.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Área de Conteúdo principal */}
          <div className="flex-1 space-y-6">
            <Tabs defaultValue="orders" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="bg-slate-100 p-1 rounded-2xl h-14">
                  <TabsTrigger value="orders" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">
                    <ShoppingBag className="h-4 w-4 mr-2" /> Compras
                  </TabsTrigger>
                  <TabsTrigger value="rentals" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">
                    <Receipt className="h-4 w-4 mr-2" /> Aluguéis
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" onClick={loadProfileData} className="rounded-xl font-bold text-slate-400 gap-2">
                  <RefreshCw className="h-4 w-4" /> Atualizar
                </Button>
              </div>

              <TabsContent value="orders" className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                    <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Nenhum pedido encontrado.</p>
                  </div>
                ) : (
                  userOrders.map((order) => {
                    const balance = order.total - (order.paidAmount || 0);
                    return (
                      <Card key={order.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                              <Package className="h-7 w-7 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900">{order.id}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{order.date}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-8">
                            <div className="text-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                              <p className="font-black text-slate-900">R$ {order.total.toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-black text-emerald-400 uppercase">Pago</p>
                              <p className="font-black text-emerald-600">R$ {(order.paidAmount || 0).toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-black text-red-400 uppercase">Pendente</p>
                              <p className={cn("font-black", balance > 0 ? "text-red-600" : "text-slate-300")}>R$ {balance.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {balance <= 0.01 ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-none rounded-xl h-10 px-4 font-black">
                                <CheckCircle2 className="h-4 w-4 mr-2" /> PAGO
                              </Badge>
                            ) : (
                              <Button onClick={() => handleResendOrder(order)} className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold h-10 px-4">
                                <MessageCircle className="h-4 w-4 mr-2" /> Detalhes
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="rentals" className="space-y-4">
                {userRentals.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                    <Receipt className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Nenhum contrato de aluguel encontrado.</p>
                  </div>
                ) : (
                  userRentals.map((rental) => {
                    const balance = rental.total - (rental.paidAmount || 0);
                    return (
                      <Card key={rental.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                              <Calendar className="h-7 w-7 text-orange-600" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900">{rental.item}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">FIM: {rental.end}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-8">
                            <div className="text-center">
                              <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                              <p className="font-black text-slate-900">R$ {rental.total.toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-black text-emerald-400 uppercase">Pago</p>
                              <p className="font-black text-emerald-600">R$ {(rental.paidAmount || 0).toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-black text-red-400 uppercase">Pendente</p>
                              <p className={cn("font-black", balance > 0 ? "text-red-600" : "text-slate-300")}>R$ {balance.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "rounded-xl border-none font-bold px-4 h-10 flex items-center",
                              rental.status === 'active' ? "bg-blue-100 text-blue-700" :
                              rental.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                              "bg-red-100 text-red-700"
                            )}>
                              {rental.status === 'active' ? 'Ativo' : rental.status === 'completed' ? 'Finalizado' : 'Atrasado'}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;