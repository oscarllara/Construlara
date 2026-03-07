"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Wallet, ShoppingBag, Calendar, User, DollarSign, MessageCircle, Eye, Mail, Phone, MapPin, CreditCard, CheckCircle2, TrendingUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import EditOrderDialog from '@/components/EditOrderDialog';
import RentalDetailsDialog from '@/components/RentalDetailsDialog';
import PaymentActionDialog from '@/components/PaymentActionDialog';
import { UserAccount } from '@/components/UserTable';

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'data');
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

  const loadData = () => {
    // Carregar dados do usuário
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      const users: UserAccount[] = JSON.parse(savedUsers);
      const found = users.find(u => u.email.toLowerCase().trim() === userEmail);
      if (found) setCurrentUser(found);
    }

    // Carregar Pedidos
    const orders = JSON.parse(localStorage.getItem('app_orders') || '[]');
    setUserOrders(orders.filter((o: any) => o.userEmail.toLowerCase().trim() === userEmail));
    
    // Carregar Aluguéis
    const rentals = JSON.parse(localStorage.getItem('app_rentals') || '[]');
    setUserRentals(rentals.filter((r: any) => (r.clientEmail || "").toLowerCase().trim() === userEmail));
  };

  useEffect(() => { loadData(); }, [userEmail]);

  const financialSummary = useMemo(() => {
    const allItems = [
      ...userOrders.map(o => ({ ...o, type: 'order' })),
      ...userRentals.map(r => ({ ...r, type: 'rental' }))
    ];

    const totalInvoiced = allItems.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
    const totalPaid = allItems.reduce((acc, item) => acc + (Number(item.paidAmount) || 0), 0);
    const totalDebt = Math.max(0, totalInvoiced - totalPaid);

    const pendingList = allItems
      .filter(item => (Number(item.total) - Number(item.paidAmount || 0)) > 0.01)
      .map(item => ({
        ...item,
        label: item.type === 'order' ? `Pedido ${item.id}` : item.item
      }));

    return { totalInvoiced, totalPaid, totalDebt, pendingList };
  }, [userOrders, userRentals]);

  const handleResendWhatsApp = (order: any) => {
    const pixData = localStorage.getItem('app_pix_info');
    const pixInfo = pixData ? JSON.parse(pixData) : { key: "16403481000116", name: "BTM Design", bank: "CC Crediplus" };

    let itemsText = order.items.map((it: any) => `• ${it.name}: ${it.isFractional ? it.totalAmount.toFixed(2) + (it.unitLabel || 'm²') : it.quantity + ' un'}`).join('%0A');
    
    const pixText = order.paymentMethod === 'Pix' 
      ? `%0A%0A*DADOS PIX:*%0AChave: ${pixInfo.key}%0A${pixInfo.name}%0A${pixInfo.bank}` 
      : '';

    const msg = `*REENVIO DE PEDIDO - CONSTRULARA*%0A*ID:* ${order.id}%0A*Data:* ${order.date}%0A*Total:* R$ ${Number(order.total).toFixed(2)}${pixText}%0A%0A*Itens:*%0A${itemsText}`;
    
    window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');
    showSuccess("Redirecionando para o WhatsApp...");
  };

  const handleCancelOrder = (id: string) => {
    if (window.confirm("Deseja realmente cancelar este pedido?")) {
      const orders = JSON.parse(localStorage.getItem('app_orders') || '[]');
      const updated = orders.filter((o: any) => o.id !== id);
      localStorage.setItem('app_orders', JSON.stringify(updated));
      showSuccess("Pedido cancelado com sucesso.");
      setIsOrderOpen(false);
      loadData();
      window.dispatchEvent(new Event('order-placed'));
    }
  };

  const handleSaveOrder = (updatedOrder: any) => {
    const orders = JSON.parse(localStorage.getItem('app_orders') || '[]');
    const updated = orders.map((o: any) => o.id === updatedOrder.id ? updatedOrder : o);
    localStorage.setItem('app_orders', JSON.stringify(updated));
    showSuccess("Pedido atualizado!");
    setIsOrderOpen(false);
    loadData();
    window.dispatchEvent(new Event('order-placed'));
  };

  const handlePayment = (amount: number) => {
    if (!selectedPaymentItem) return;
    const type = selectedPaymentItem.type === 'order' ? 'app_orders' : 'app_rentals';
    const saved = JSON.parse(localStorage.getItem(type) || '[]');
    const updated = saved.map((item: any) => {
      if (item.id === selectedPaymentItem.id) {
        const nextPaid = Number(item.paidAmount || 0) + amount;
        return { 
          ...item, 
          paidAmount: nextPaid, 
          status: nextPaid >= Number(item.total) - 0.01 ? (type === 'app_orders' ? 'Pago' : 'completed') : item.status 
        };
      }
      return item;
    });
    localStorage.setItem(type, JSON.stringify(updated));
    showSuccess("Pagamento registrado!");
    setIsPaymentOpen(false);
    loadData();
    window.dispatchEvent(new Event('order-placed'));
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchParams({ tab: v }); }} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-[2.5rem] h-16 w-full shadow-sm">
            <TabsTrigger value="data" className="flex-1 rounded-[2rem] font-bold">Meus Dados</TabsTrigger>
            <TabsTrigger value="finance" className="flex-1 rounded-[2rem] font-bold">Financeiro</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 rounded-[2rem] font-bold">Meus Pedidos</TabsTrigger>
            <TabsTrigger value="rentals" className="flex-1 rounded-[2rem] font-bold">Meus Aluguéis</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="animate-in fade-in slide-in-from-bottom-2">
            <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="bg-blue-700 p-10 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black">{currentUser?.name || "Carregando..."}</CardTitle>
                    <p className="text-blue-100 font-bold opacity-80 uppercase text-[10px] tracking-widest mt-1">Dados Cadastrais Oficiais</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Informações de Contato</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 group">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">E-mail</p>
                          <p className="font-bold text-slate-900">{currentUser?.email || "---"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">WhatsApp</p>
                          <p className="font-bold text-slate-900">{currentUser?.whatsapp || "---"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">Documento (CPF)</p>
                          <p className="font-bold text-slate-900">{currentUser?.cpf || "---"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Endereço de Entrega</h3>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-lg leading-tight">{currentUser?.address || "Não informado"}</p>
                        <p className="text-sm text-slate-500 font-medium">
                          {currentUser?.neighborhood ? `${currentUser.neighborhood}, ` : ""}
                          {currentUser?.city ? `${currentUser.city} - ` : ""}
                          {currentUser?.state || ""}
                        </p>
                      </div>
                    </div>
                    {currentUser?.worksiteAddress && (
                      <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Endereço da Obra</p>
                        <p className="text-sm font-bold text-blue-900">{currentUser.worksiteAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-slate-900 text-white">
                  <TrendingUp className="h-6 w-6 text-blue-400 mb-4" />
                  <p className="text-3xl font-black">R$ {financialSummary.totalInvoiced.toFixed(2)}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Faturamento Total</p>
                </Card>
                <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white border border-slate-100">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-4" />
                  <p className="text-3xl font-black text-slate-900">R$ {financialSummary.totalPaid.toFixed(2)}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Valores Quitados</p>
                </Card>
                <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white border-2 border-rose-100">
                  <Wallet className="h-6 w-6 text-rose-500 mb-4" />
                  <p className="text-3xl font-black text-rose-600">R$ {financialSummary.totalDebt.toFixed(2)}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Saldo Devedor Total</p>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-4">Detalalhamento de Débitos</h3>
                {financialSummary.pendingList.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Você está totalmente em dia! Parabéns.</p>
                  </div>
                ) : (
                  financialSummary.pendingList.map((item: any) => (
                    <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm group hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                          item.type === 'order' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                        )}>
                          {item.type === 'order' ? <ShoppingBag className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{item.label}</p>
                          <p className="text-[10px] font-bold text-slate-400">Total: R$ {item.total.toFixed(2)} • Pago: R$ {(item.paidAmount || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xl font-black text-rose-600">R$ {(item.total - (item.paidAmount || 0)).toFixed(2)}</p>
                          <p className="text-[9px] font-black text-rose-400 uppercase tracking-tighter">Pendente</p>
                        </div>
                        <Button 
                          onClick={() => { setSelectedPaymentItem(item); setIsPaymentOpen(true); }} 
                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-6 font-bold text-xs shadow-lg shadow-slate-100"
                        >
                          Pagar Agora
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {userOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">Você ainda não realizou pedidos.</p>
              </div>
            ) : (
              userOrders.map(order => (
                <Card key={order.id} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingBag className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-black text-slate-900">{order.id}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="font-black text-blue-700">R$ {Number(order.total).toFixed(2)}</p>
                      <Badge className="text-[9px] font-black uppercase rounded-lg px-2 h-4 bg-slate-50 text-slate-500 border-none">{order.status}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedOrder(order); setIsOrderOpen(true); }} className="rounded-xl hover:bg-blue-50 text-blue-600"><Eye className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleResendWhatsApp(order)} className="text-emerald-600 hover:bg-emerald-50 rounded-xl" title="Reenviar Pedido"><MessageCircle className="h-5 w-5" /></Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rentals" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {userRentals.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">Você ainda não possui contratos de locação.</p>
              </div>
            ) : (
              userRentals.map(rental => (
                <Card key={rental.id} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><Calendar className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-black text-slate-900">{rental.item}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rental.start} até {rental.end}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="font-black text-slate-900">R$ {Number(rental.total).toFixed(2)}</p>
                      <Badge className="text-[9px] font-black uppercase rounded-lg px-2 h-4 border-none">{rental.status}</Badge>
                    </div>
                    <Button onClick={() => { setSelectedRental(rental); setIsRentalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-6 font-bold shadow-lg shadow-blue-50">Ver Contrato</Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EditOrderDialog order={selectedOrder} open={isOrderOpen} onOpenChange={setIsOrderOpen} onCancel={handleCancelOrder} onSave={handleSaveOrder} />
      <RentalDetailsDialog rental={selectedRental} open={isRentalOpen} onOpenChange={setIsRentalOpen} onUpdate={() => {}} />
      <PaymentActionDialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen} item={selectedPaymentItem ? { ...selectedPaymentItem, client: "Você", description: selectedPaymentItem.label } : null} onConfirm={handlePayment} />
    </AppLayout>
  );
};

export default ProfilePage;