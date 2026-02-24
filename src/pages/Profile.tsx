"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, Mail, Phone, MapPin, Receipt, Calendar, 
  ShoppingBag, MessageCircle, Package, 
  RefreshCw, DollarSign, Wallet, AlertCircle, CheckCircle2,
  Home, CreditCard, Facebook, Instagram, Save, History, LayoutGrid
} from 'lucide-react';
import { UserAccount } from '@/components/UserTable';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [userRentals, setUserRentals] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFinanceTab, setActiveFinanceTab] = useState<'all' | 'pending' | 'paid'>('all');
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

    let foundUser: any;
    if (savedUsers) {
      const users: any[] = JSON.parse(savedUsers);
      foundUser = users.find(u => u.email.toLowerCase().trim() === email);
    }

    if (foundUser) {
      setUser({
        ...foundUser,
        cep: foundUser.cep || "",
        facebook: foundUser.facebook || "",
        instagram: foundUser.instagram || ""
      });
    } else {
      const role = localStorage.getItem('userRole') || 'Cliente';
      const tempUser: any = {
        id: 'temp-' + Date.now(),
        name: email.split('@')[0],
        email: email,
        whatsapp: "",
        cpf: "",
        address: "",
        neighborhood: "",
        city: "",
        state: "",
        cep: "",
        facebook: "",
        instagram: "",
        role: role,
        status: 'active',
        lastAccess: 'Agora'
      };
      setUser(tempUser);
      foundUser = tempUser;
    }

    if (savedRentals) {
      const rentals = JSON.parse(savedRentals);
      const filtered = rentals.filter((r: any) => 
        (r.clientId && r.clientId === foundUser?.id) || 
        (r.clientEmail && r.clientEmail.toLowerCase().trim() === email) ||
        (r.client && r.client.toLowerCase() === (foundUser?.name || "").toLowerCase())
      );
      setUserRentals(filtered);
    }

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
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      const users: any[] = JSON.parse(savedUsers);
      const index = users.findIndex(u => u.email.toLowerCase().trim() === user.email.toLowerCase().trim());
      
      if (index > -1) {
        users[index] = { ...user };
        localStorage.setItem('app_users', JSON.stringify(users));
        showSuccess("Seu perfil foi atualizado com sucesso!");
      } else {
        users.push({ ...user });
        localStorage.setItem('app_users', JSON.stringify(users));
        showSuccess("Perfil criado e atualizado!");
      }
    }
  };

  const financialSummary = useMemo(() => {
    const shopTotal = userOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const shopPaid = userOrders.reduce((acc, o) => acc + (Number(o.paidAmount) || 0), 0);
    
    const rentalTotal = userRentals.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
    const rentalPaid = userRentals.reduce((acc, r) => acc + (Number(r.paidAmount) || 0), 0);

    const movements = [
      ...userOrders.map(o => ({ ...o, type: 'order', label: 'Compra' })),
      ...userRentals.map(r => ({ ...r, type: 'rental', label: 'Aluguel' }))
    ].sort((a, b) => {
      const dateA = new Date(a.date || a.start || 0).getTime();
      const dateB = new Date(b.date || b.start || 0).getTime();
      return dateB - dateA;
    });

    return {
      total: shopTotal + rentalTotal,
      paid: shopPaid + rentalPaid,
      pending: (shopTotal + rentalTotal) - (shopPaid + rentalPaid),
      movements
    };
  }, [userOrders, userRentals]);

  const filteredMovements = useMemo(() => {
    if (activeFinanceTab === 'pending') return financialSummary.movements.filter(m => (Number(m.total) || 0) > (Number(m.paidAmount) || 0));
    if (activeFinanceTab === 'paid') return financialSummary.movements.filter(m => (Number(m.total) || 0) <= (Number(m.paidAmount) || 0) && Number(m.total) > 0);
    return financialSummary.movements;
  }, [financialSummary, activeFinanceTab]);

  if (isLoading) return null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
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
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[3rem] bg-slate-900 text-white p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-emerald-400" />
                <h3 className="font-black text-lg">Resumo Financeiro</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Movimentação Total</span>
                  <span className="text-xl font-black">R$ {financialSummary.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-emerald-400 uppercase">Valores Pagos</span>
                  <span className="text-xl font-black text-emerald-400">R$ {financialSummary.paid.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-[10px] font-black text-red-400 uppercase">Valores a Pagar</span>
                  <span className="text-2xl font-black text-red-400">R$ {financialSummary.pending.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            <Tabs defaultValue="data" className="space-y-6">
              <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-full flex">
                <TabsTrigger value="data" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="orders" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white">Meus Pedidos</TabsTrigger>
                <TabsTrigger value="rentals" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white">Meus Contratos</TabsTrigger>
                <TabsTrigger value="finance" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white">Minha Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="animate-in fade-in slide-in-from-bottom-4">
                <form onSubmit={handleUpdateProfile}>
                  <Card className="border-none shadow-sm rounded-[3rem] p-8 space-y-8 bg-white">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold flex items-center gap-2"><User className="h-4 w-4 text-blue-600" /> Nome Completo</Label>
                        <Input value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-600" /> CPF</Label>
                        <Input value={user.cpf} onChange={e => setUser({...user, cpf: e.target.value})} className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" /> E-mail</Label>
                        <Input value={user.email} disabled className="rounded-xl h-12 bg-slate-50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold flex items-center gap-2"><Phone className="h-4 w-4 text-blue-600" /> Telefone / WhatsApp</Label>
                        <Input value={user.whatsapp} onChange={e => setUser({...user, whatsapp: e.target.value})} className="rounded-xl h-12" />
                      </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Endereço de Entrega
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label className="font-bold">Logradouro e Número</Label>
                          <Input value={user.address} onChange={e => setUser({...user, address: e.target.value})} className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Bairro</Label>
                          <Input value={user.neighborhood} onChange={e => setUser({...user, neighborhood: e.target.value})} className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Cidade</Label>
                          <Input value={user.city} onChange={e => setUser({...user, city: e.target.value})} className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">Estado (UF)</Label>
                          <Input value={user.state} onChange={e => setUser({...user, state: e.target.value})} maxLength={2} className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">CEP</Label>
                          <Input value={user.cep} onChange={e => setUser({...user, cep: e.target.value})} className="rounded-xl h-12" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> Redes Sociais (Opcional)
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-700" /> Facebook</Label>
                          <Input placeholder="Link ou usuário" value={user.facebook} onChange={e => setUser({...user, facebook: e.target.value})} className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-600" /> Instagram</Label>
                          <Input placeholder="@usuario" value={user.instagram} onChange={e => setUser({...user, instagram: e.target.value})} className="rounded-xl h-12" />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-100">
                      <Save className="mr-2 h-6 w-6" /> Salvar Alterações
                    </Button>
                  </Card>
                </form>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                    <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Nenhum pedido realizado.</p>
                  </div>
                ) : (
                  userOrders.map((order) => (
                    <Card key={order.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900">{order.id}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{order.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">R$ {order.total.toFixed(2)}</p>
                        <Badge className={cn("rounded-lg text-[9px] font-black uppercase", order.status === 'Pago' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700")}>{order.status}</Badge>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="rentals" className="space-y-4">
                {userRentals.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                    <Receipt className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Nenhum contrato de aluguel.</p>
                  </div>
                ) : (
                  userRentals.map((rental) => (
                    <Card key={rental.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900">{rental.item}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Fim: {rental.end}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-slate-900">R$ {rental.total.toFixed(2)}</p>
                        <Badge className="bg-blue-50 text-blue-700 rounded-lg text-[9px] font-black uppercase">{rental.status}</Badge>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="finance" className="space-y-6">
                <div className="flex gap-2">
                  <Button variant={activeFinanceTab === 'all' ? 'default' : 'outline'} onClick={() => setActiveFinanceTab('all')} className="rounded-xl font-bold h-10 px-6 gap-2">
                    <LayoutGrid className="h-4 w-4" /> Tudo
                  </Button>
                  <Button variant={activeFinanceTab === 'pending' ? 'default' : 'outline'} onClick={() => setActiveFinanceTab('pending')} className="rounded-xl font-bold h-10 px-6 gap-2">
                    <AlertCircle className="h-4 w-4" /> A Receber
                  </Button>
                  <Button variant={activeFinanceTab === 'paid' ? 'default' : 'outline'} onClick={() => setActiveFinanceTab('paid')} className="rounded-xl font-bold h-10 px-6 gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Recebidos
                  </Button>
                </div>

                <div className="space-y-3">
                  {filteredMovements.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="font-bold text-slate-400">Nenhuma movimentação para este filtro.</p>
                    </div>
                  ) : (
                    filteredMovements.map((move: any) => {
                      const balance = Number(move.total) - (Number(move.paidAmount) || 0);
                      const isPaid = balance <= 0.01;
                      return (
                        <Card key={move.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", move.type === 'order' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600")}>
                              {move.type === 'order' ? <ShoppingBag className="h-6 w-6" /> : <Receipt className="h-6 w-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-slate-900">{move.id}</h4>
                                <Badge variant="outline" className="text-[9px] font-black uppercase rounded-lg">{move.label}</Badge>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{move.date || move.end}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn("text-lg font-black", isPaid ? "text-emerald-600" : "text-red-600")}>
                              {isPaid ? `R$ ${Number(move.total).toFixed(2)}` : `R$ ${balance.toFixed(2)}`}
                            </p>
                            <Badge className={cn("rounded-lg text-[8px] font-black uppercase", isPaid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                              {isPaid ? "Recebido / Pago" : "A Receber / Pendente"}
                            </Badge>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;