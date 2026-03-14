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
import AddRentalDialog from '@/components/AddRentalDialog';
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
  const [selectedEquipId, setSelectedEquipId] = useState<string>("");
  
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isRentalOpen, setIsRentalOpen] = useState(false);
  const [isAddRentalOpen, setIsAddRentalOpen] = useState(false);
  
  const userEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isGestor = ['Gestor', 'Vendas'].includes(userRole);
  const navigate = useNavigate();

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const loadData = () => {
    try {
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers && savedUsers !== "undefined") {
        const users = JSON.parse(savedUsers);
        if (Array.isArray(users)) {
          const found = users.find(u => u && u.email && String(u.email).toLowerCase().trim() === userEmail);
          if (found) setCurrentUser(found);
        }
      }

      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders && savedOrders !== "undefined") {
        const orders = JSON.parse(savedOrders);
        if (Array.isArray(orders)) {
          // Se for gestor, vê todos os pedidos. Se não, vê só os seus.
          const filtered = isGestor ? orders : orders.filter(o => 
            o && typeof o === 'object' && o.userEmail && 
            String(o.userEmail).toLowerCase().trim() === userEmail
          );
          setUserOrders(filtered);
        }
      }
      
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals && savedRentals !== "undefined") {
        const rentals = JSON.parse(savedRentals);
        if (Array.isArray(rentals)) {
          // Se for gestor, vê todos os aluguéis. Se não, vê só os seus.
          const filtered = isGestor ? rentals : rentals.filter(r => {
            if (!r || typeof r !== 'object') return false;
            const email = String(r.clientEmail || r.userEmail || "").toLowerCase().trim();
            return email === userEmail;
          });
          setUserRentals(filtered);
        }
      }
    } catch (e) {
      console.error("Erro no Profile:", e);
    }
  };

  useEffect(() => { loadData(); }, [userEmail, isGestor]);

  const financialSummary = useMemo(() => {
    const safeOrders = (Array.isArray(userOrders) ? userOrders : []).filter(o => o && typeof o === 'object');
    const safeRentals = (Array.isArray(userRentals) ? userRentals : []).filter(r => r && typeof r === 'object');

    const allItems = [
      ...safeOrders.map(o => ({ ...o, type: 'order' })),
      ...safeRentals.map(r => ({ ...r, type: 'rental' }))
    ].filter(i => i && i.total !== undefined);

    const totalInvoiced = allItems.reduce((acc, item) => acc + (Number(item?.total) || 0), 0);
    const totalPaid = allItems.reduce((acc, item) => acc + (Number(item?.paidAmount) || 0), 0);
    const totalDebt = Math.max(0, totalInvoiced - totalPaid);

    return { totalInvoiced, totalPaid, totalDebt };
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

  const handleCancelOrder = (id: string) => {
    if (window.confirm("Deseja realmente cancelar este pedido?")) {
      try {
        const savedOrders = localStorage.getItem('app_orders');
        if (savedOrders) {
          const orders = JSON.parse(savedOrders);
          const updated = orders.filter((o: any) => o.id !== id);
          localStorage.setItem('app_orders', JSON.stringify(updated));
          showSuccess("Pedido cancelado com sucesso.");
          setIsOrderOpen(false);
          loadData();
          window.dispatchEvent(new Event('order-placed'));
        }
      } catch (e) {
        showError("Erro ao cancelar pedido.");
      }
    }
  };

  const handleUpdateOrder = (updatedOrder: any) => {
    try {
      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const updated = orders.map((o: any) => o.id === updatedOrder.id ? updatedOrder : o);
        localStorage.setItem('app_orders', JSON.stringify(updated));
        showSuccess("Pedido atualizado.");
        setIsOrderOpen(false);
        loadData();
        window.dispatchEvent(new Event('order-placed'));
      }
    } catch (e) {
      showError("Erro ao atualizar pedido.");
    }
  };

  const handleRentAgain = (id: string) => {
    setIsRentalOpen(false);
    setSelectedEquipId(id);
    setIsAddRentalOpen(true);
  };

  const handleAddRental = (data: any) => {
    const savedRentals = localStorage.getItem('app_rentals');
    const currentRentals = savedRentals ? JSON.parse(savedRentals) : [];
    const newRental = { id: `r-${Date.now()}`, ...data, status: 'active' };
    localStorage.setItem('app_rentals', JSON.stringify([newRental, ...currentRentals]));
    
    // Atualizar status do equipamento
    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) {
      const allEquip = JSON.parse(savedEquip);
      const updatedEquip = allEquip.map((e: any) => 
        e.id === data.equipmentId ? { ...e, status: 'rented', lastClient: data.clientName } : e
      );
      localStorage.setItem('app_equipments', JSON.stringify(updatedEquip));
    }

    loadData();
    setIsAddRentalOpen(false);
    showSuccess("Novo contrato gerado!");
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearchParams({ tab: v }); }} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-[2.5rem] h-16 w-full shadow-sm flex overflow-hidden">
            <TabsTrigger value="data" className="flex-1 rounded-[2rem] font-bold text-xs sm:text-sm">Meus Dados</TabsTrigger>
            <TabsTrigger value="finance" className="flex-1 rounded-[2rem] font-bold text-xs sm:text-sm">Financeiro</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 rounded-[2rem] font-bold text-xs sm:text-sm">{isGestor ? 'Todos os Pedidos' : 'Meus Pedidos'}</TabsTrigger>
            <TabsTrigger value="rentals" className="flex-1 rounded-[2rem] font-bold text-xs sm:text-sm">{isGestor ? 'Todos os Aluguéis' : 'Meus Aluguéis'}</TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <Card className="border-none shadow-xl rounded-[3rem] bg-white overflow-hidden">
              <CardHeader className="bg-blue-700 p-10 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black">{currentUser?.name || "Minha Conta"}</CardTitle>
                    <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest mt-1">Dados Cadastrais Oficiais</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Informações de Contato</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Mail className="h-5 w-5" /></div>
                        <div><p className="text-[10px] font-black text-slate-400">E-MAIL</p><p className="font-bold text-slate-900">{currentUser?.email || userEmail}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Phone className="h-5 w-5" /></div>
                        <div><p className="text-[10px] font-black text-slate-400">WHATSAPP</p><p className="font-bold text-slate-900">{currentUser?.whatsapp || "---"}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><CreditCard className="h-5 w-5" /></div>
                        <div><p className="text-[10px] font-black text-slate-400">CPF</p><p className="font-bold text-slate-900">{currentUser?.cpf || "---"}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-slate-900 text-white">
                <p className="text-3xl font-black text-white">R$ {financialSummary.totalInvoiced.toFixed(2)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Total {isGestor ? 'Geral' : 'Faturado'}</p>
              </Card>
              <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white">
                <p className="text-3xl font-black text-emerald-600">R$ {financialSummary.totalPaid.toFixed(2)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Total Recebido</p>
              </Card>
              <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white border-2 border-rose-100">
                <p className="text-3xl font-black text-rose-600">R$ {financialSummary.totalDebt.toFixed(2)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Total a Receber</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {userOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200"><SearchX className="h-12 w-12 text-slate-200 mx-auto mb-4"/><p className="text-slate-500 font-bold">Nenhum pedido registrado.</p></div>
            ) : (
              userOrders.map((order, idx) => (
                <Card key={order?.id || idx} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingBag className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-black text-slate-900">{order?.id} {isGestor && <span className="text-blue-600 text-xs ml-2">[{order.clientName}]</span>}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{order?.date} • R$ {Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("rounded-lg font-black text-[9px] uppercase tracking-widest h-6", order.status === 'Pago' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100")}>{order.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleAction('order', order)} className="rounded-xl text-blue-600"><Eye className="h-5 w-5"/></Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rentals" className="space-y-4">
            {userRentals.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200"><SearchX className="h-12 w-12 text-slate-200 mx-auto mb-4"/><p className="text-slate-500 font-bold">Nenhum aluguel registrado.</p></div>
            ) : (
              userRentals.map((rental, idx) => (
                <Card key={rental?.id || idx} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><Calendar className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-black text-slate-900">{rental?.item} {isGestor && <span className="text-orange-600 text-xs ml-2">[{rental.client}]</span>}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{rental?.start} - {rental?.end} • R$ {Number(rental.total).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={cn("rounded-lg font-black text-[9px] uppercase tracking-widest h-6", rental.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100")}>{rental.status === 'completed' ? 'Finalizado' : 'Ativo'}</Badge>
                    <Button onClick={() => handleAction('rental', rental)} className="bg-blue-600 text-white rounded-xl px-6 font-bold shadow-lg shadow-blue-50">Ver</Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedOrder && (
        <EditOrderDialog 
          order={selectedOrder} 
          open={isOrderOpen} 
          onOpenChange={setIsOrderOpen} 
          onCancel={handleCancelOrder} 
          onSave={handleUpdateOrder} 
        />
      )}
      {selectedRental && <RentalDetailsDialog rental={selectedRental} open={isRentalOpen} onOpenChange={setIsRentalOpen} onUpdate={loadData} onRentAgain={handleRentAgain} />}
      
      {isAddRentalOpen && (
        <AddRentalDialog 
          open={isAddRentalOpen} 
          onOpenChange={setIsAddRentalOpen} 
          onAdd={handleAddRental} 
          initialEquipmentId={selectedEquipId} 
        />
      )}
    </AppLayout>
  );
};

export default ProfilePage;