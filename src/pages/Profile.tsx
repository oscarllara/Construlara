"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Wallet, ShoppingBag, Calendar, User, DollarSign, MessageCircle, Eye } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import EditOrderDialog from '@/components/EditOrderDialog';
import RentalDetailsDialog from '@/components/RentalDetailsDialog';
import PaymentActionDialog from '@/components/PaymentActionDialog';

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'data');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userRentals, setUserRentals] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState<any>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isRentalOpen, setIsRentalOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  
  const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase();
  const navigate = useNavigate();

  const loadData = () => {
    const orders = JSON.parse(localStorage.getItem('app_orders') || '[]');
    setUserOrders(orders.filter((o: any) => o.userEmail.toLowerCase() === userEmail));
    
    const rentals = JSON.parse(localStorage.getItem('app_rentals') || '[]');
    setUserRentals(rentals.filter((r: any) => (r.clientEmail || "").toLowerCase() === userEmail));
  };

  useEffect(() => { loadData(); }, [userEmail]);

  const debtSummary = useMemo(() => {
    const pending = [
      ...userOrders.filter(o => o.status !== 'Pago' && o.status !== 'Cancelado').map(o => ({ ...o, type: 'order', label: `Pedido ${o.id}` })),
      ...userRentals.filter(r => r.status !== 'completed').map(r => ({ ...r, type: 'rental', label: r.item }))
    ];
    const totalDebt = pending.reduce((acc, item) => acc + (Number(item.total) - Number(item.paidAmount || 0)), 0);
    return { totalDebt, pending };
  }, [userOrders, userRentals]);

  const handleResendWhatsApp = (order: any) => {
    let itemsText = order.items.map((it: any) => `• ${it.name}: ${it.isFractional ? it.totalAmount.toFixed(2) + (it.unitLabel || 'm²') : it.quantity + ' un'}`).join('%0A');
    const msg = `*REENVIO DE PEDIDO*%0A*ID:* ${order.id}%0A*Total:* R$ ${Number(order.total).toFixed(2)}%0A%0A*Itens:*%0A${itemsText}`;
    window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');
  };

  const handlePayment = (amount: number) => {
    if (!selectedPaymentItem) return;
    const type = selectedPaymentItem.type === 'order' ? 'app_orders' : 'app_rentals';
    const saved = JSON.parse(localStorage.getItem(type) || '[]');
    const updated = saved.map((item: any) => {
      if (item.id === selectedPaymentItem.id) {
        const nextPaid = Number(item.paidAmount || 0) + amount;
        return { ...item, paidAmount: nextPaid, status: nextPaid >= Number(item.total) - 0.01 ? (type === 'app_orders' ? 'Pago' : 'completed') : item.status };
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

          <TabsContent value="finance">
            <Card className="border-none shadow-xl rounded-[3rem] p-10 bg-slate-900 text-white">
              <h3 className="text-3xl font-black text-rose-500 mb-2">R$ {debtSummary.totalDebt.toFixed(2)}</h3>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-8">Saldo Devedor Total</p>
              <div className="space-y-3">
                {debtSummary.pending.map((item: any) => (
                  <div key={item.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{item.label}</p>
                      <p className="text-[10px] text-slate-500">Saldo: R$ {(item.total - (item.paidAmount || 0)).toFixed(2)}</p>
                    </div>
                    <Button onClick={() => { setSelectedPaymentItem(item); setIsPaymentOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 h-10 px-4 rounded-xl font-bold text-xs">Pagar Agora</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {userOrders.map(order => (
              <Card key={order.id} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingBag className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-black">{order.id}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-blue-700 mr-4">R$ {Number(order.total).toFixed(2)}</p>
                  <Button variant="ghost" onClick={() => { setSelectedOrder(order); setIsOrderOpen(true); }} className="rounded-xl"><Eye className="h-5 w-5" /></Button>
                  <Button variant="ghost" onClick={() => handleResendWhatsApp(order)} className="text-emerald-600"><MessageCircle className="h-5 w-5" /></Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="rentals" className="space-y-4">
            {userRentals.map(rental => (
              <Card key={rental.id} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><Calendar className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-black">{rental.item}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{rental.start} até {rental.end}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-slate-900 mr-4">R$ {Number(rental.total).toFixed(2)}</p>
                  <Button onClick={() => { setSelectedRental(rental); setIsRentalOpen(true); }} className="bg-blue-600 rounded-xl h-10 px-6 font-bold">Ver Contrato</Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <EditOrderDialog order={selectedOrder} open={isOrderOpen} onOpenChange={setIsOrderOpen} onCancel={() => {}} onSave={() => {}} />
      <RentalDetailsDialog rental={selectedRental} open={isRentalOpen} onOpenChange={setIsRentalOpen} onUpdate={() => {}} />
      <PaymentActionDialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen} item={selectedPaymentItem ? { ...selectedPaymentItem, client: "Você", description: selectedPaymentItem.label } : null} onConfirm={handlePayment} />
    </AppLayout>
  );
};

export default ProfilePage;