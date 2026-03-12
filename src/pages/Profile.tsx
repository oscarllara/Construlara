"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Wallet, ShoppingBag, Calendar, User, DollarSign, MessageCircle, Eye, Mail, Phone, MapPin, CreditCard, CheckCircle2, TrendingUp, SearchX } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import EditOrderDialog from '@/components/EditOrderDialog';
import RentalDetailsDialog from '@/components/RentalDetailsDialog';
import PaymentActionDialog from '@/components/PaymentActionDialog';
import { UserAccount } from '@/components/UserTable';

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'data';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userRentals, setUserRentals] = useState<any[]>([]);
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<any>(null);
  
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isRentalOpen, setIsRentalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  
  const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
  const navigate = useNavigate();

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const loadData = () => {
    try {
      // 1. Carregar Usuário logado
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        if (Array.isArray(users)) {
          const found = users.find(u => u && u.email && String(u.email).toLowerCase().trim() === userEmail);
          if (found) setCurrentUser(found);
        }
      }

      // 2. Carregar Pedidos com Validação Pesada
      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders && savedOrders !== "undefined") {
        const orders = JSON.parse(savedOrders);
        if (Array.isArray(orders)) {
          // Filtra apenas pedidos válidos que pertencem a este email
          const filtered = orders.filter(o => 
            o && 
            typeof o === 'object' && 
            o.userEmail && 
            String(o.userEmail).toLowerCase().trim() === userEmail
          );
          setUserOrders(filtered);
        }
      }
      
      // 3. Carregar Aluguéis com Validação Pesada
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals && savedRentals !== "undefined") {
        const rentals = JSON.parse(savedRentals);
        if (Array.isArray(rentals)) {
          // Filtra apenas aluguéis válidos que pertencem a este email
          const filtered = rentals.filter(r => {
            if (!r || typeof r !== 'object') return false;
            const email = String(r.clientEmail || r.userEmail || "").toLowerCase().trim();
            return email === userEmail;
          });
          setUserRentals(filtered);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar dados do perfil:", e);
    }
  };

  useEffect(() => { loadData(); }, [userEmail]);

  // Sumário financeiro com fallback para cada valor
  const financialSummary = useMemo(() => {
    const safeOrders = Array.isArray(userOrders) ? userOrders : [];
    const safeRentals = Array.isArray(userRentals) ? userRentals : [];

    const allItems = [
      ...safeOrders.map(o => ({ ...o, type: 'order' })),
      ...safeRentals.map(r => ({ ...r, type: 'rental' }))
    ].filter(i => i && i.total !== undefined);

    const totalInvoiced = allItems.reduce((acc, item) => acc + (Number(item?.total) || 0), 0);
    const totalPaid = allItems.reduce((acc, item) => acc + (Number(item?.paidAmount) || 0), 0);
    const totalDebt = Math.max(0, totalInvoiced - totalPaid);

    const pendingList = allItems
      .filter(item => (Number(item?.total || 0) - Number(item?.paidAmount || 0)) > 0.05)
      .map(item => ({
        ...item,
        label: item.type === 'order' ? `Pedido ${item.id || 'N/A'}` : (item.item || 'Equipamento')
      }));

    return { totalInvoiced, totalPaid, totalDebt, pendingList };
  }, [userOrders, userRentals]);

  const handleAction = (type: 'order' | 'rental', item: any) => {
    if (!item) return;
    if (type === 'order') {
      setSelectedOrder(item);
      setIsOrderOpen(true);
    } else {
      setSelectedRental(item);
      setIsRentalOpen(true);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchParams({ tab: v }); }} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-[2.5rem] h-16 w-full shadow-sm flex overflow-hidden">
            <TabsTrigger value="data" className="flex-1 rounded-[2rem] font-bold text-xs sm:text-sm">Meus Dados</TabsTrigger>
            <TabsTrigger value="finance" className="flex-1 rounded-[2rem] font-bold text-xs sm:text-sm">Financeiro</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 rounded-[2rem] font-bold text-xs sm:text-sm">Meus Pedidos</TabsTrigger>
            <TabsTrigger value="rentals" className="flex-1 rounded-[2rem] font-bold text-xs sm:text-sm">Meus Aluguéis</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="bg-blue-700 p-10 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black">{currentUser?.name || "Minha Conta"}</CardTitle>
                    <p className="text-blue-100 font-bold opacity-80 uppercase text-[10px] tracking-widest mt-1">Dados Cadastrais Oficiais</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Informações de Contato</h3>
                    <div className="space-y-4">
                      {[
                        { icon: Mail, label: 'E-mail', value: currentUser?.email || userEmail, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { icon: Phone, label: 'WhatsApp', value: currentUser?.whatsapp || "Não informado", color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { icon: CreditCard, label: 'CPF', value: currentUser?.cpf || "Não informado", color: 'text-indigo-600', bg: 'bg-indigo-50' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors", item.bg, item.color)}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">{item.label}</p>
                            <p className="font-bold text-slate-900">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Endereço Principal</h3>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-lg leading-tight">{currentUser?.address || "Endereço não cadastrado"}</p>
                        <p className="text-sm text-slate-500 font-medium">
                          {currentUser?.neighborhood ? `${currentUser.neighborhood}, ` : ""}
                          {currentUser?.city ? `${currentUser.city} - ` : ""}
                          {currentUser?.state || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Invoiced (Bruto)', val: financialSummary.totalInvoiced, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-slate-900', text: 'text-white' },
                { title: 'Valores Quitados', val: financialSummary.totalPaid, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-white', text: 'text-slate-900' },
                { title: 'Saldo em Aberto', val: financialSummary.totalDebt, icon: Wallet, color: 'text-rose-500', bg: 'bg-white', text: 'text-rose-600', border: 'border-2 border-rose-100' }
              ].map((stat, i) => (
                <Card key={i} className={cn("border-none shadow-xl rounded-[2.5rem] p-8", stat.bg, stat.border)}>
                  <stat.icon className={cn("h-6 w-6 mb-4", stat.color)} />
                  <p className={cn("text-3xl font-black", stat.text)}>R$ {stat.val.toFixed(2)}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.title}</p>
                </Card>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Débitos Ativos</h3>
              {financialSummary.pendingList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Excelente! Suas contas estão em dia.</p>
                </div>
              ) : (
                financialSummary.pendingList.map((item, idx) => (
                  <div key={item.id || idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", item.type === 'order' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600")}>
                        {item.type === 'order' ? <ShoppingBag className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{item.label}</p>
                        <p className="text-[10px] font-bold text-slate-400">Total: R$ {Number(item.total).toFixed(2)} • Pago: R$ {Number(item.paidAmount).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-black text-rose-600">R$ {(Number(item.total) - Number(item.paidAmount)).toFixed(2)}</p>
                        <p className="text-[9px] font-black text-rose-400 uppercase">Pendente</p>
                      </div>
                      <Button onClick={() => { setSelectedPaymentItem(item); setIsPaymentOpen(true); }} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-6 font-bold text-xs shadow-md">Regularizar</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {userOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <SearchX className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">Nenhum histórico de compras encontrado.</p>
              </div>
            ) : (
              userOrders.map((order, idx) => (
                <Card key={order.id || idx} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingBag className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-black text-slate-900">{order.id}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="font-black text-blue-700">R$ {Number(order.total || 0).toFixed(2)}</p>
                      <Badge className="text-[9px] font-black uppercase rounded-lg px-2 h-4 bg-slate-50 text-slate-500 border-none">{order.status || 'Pendente'}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleAction('order', order)} className="rounded-xl hover:bg-blue-50 text-blue-600"><Eye className="h-5 w-5" /></Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rentals" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {userRentals.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <SearchX className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">Você não possui contratos de locação registrados.</p>
              </div>
            ) : (
              userRentals.map((rental, idx) => (
                <Card key={rental.id || idx} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><Calendar className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-black text-slate-900">{rental.item || 'Equipamento'}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rental.start} até {rental.end}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="font-black text-slate-900">R$ {Number(rental.total || 0).toFixed(2)}</p>
                      <Badge className="text-[9px] font-black uppercase rounded-lg px-2 h-4 border-none">{rental.status === 'completed' ? 'Finalizado' : 'Ativo'}</Badge>
                    </div>
                    <Button onClick={() => handleAction('rental', rental)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 font-bold shadow-lg shadow-blue-50">Visualizar</Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrder && <EditOrderDialog order={selectedOrder} open={isOrderOpen} onOpenChange={setIsOrderOpen} onCancel={() => {}} onSave={() => {}} />}
      {selectedRental && <RentalDetailsDialog rental={selectedRental} open={isRentalOpen} onOpenChange={setIsRentalOpen} onUpdate={loadData} />}
      {selectedPaymentItem && <PaymentActionDialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen} item={{ ...selectedPaymentItem, client: "Você", description: selectedPaymentItem.label }} onConfirm={() => {}} />}
    </AppLayout>
  );
};

export default ProfilePage;