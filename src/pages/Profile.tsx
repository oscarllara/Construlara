"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Calendar, User, Mail, Phone, CreditCard, SearchX, Eye } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import EditOrderDialog from '@/components/EditOrderDialog';
import RentalDetailsDialog from '@/components/RentalDetailsDialog';
import AddRentalDialog from '@/components/AddRentalDialog';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'data';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userRentals, setUserRentals] = useState<any[]>([]);
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [selectedEquipId, setSelectedEquipId] = useState<string>("");
  
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isRentalOpen, setIsRentalOpen] = useState(false);
  const [isAddRentalOpen, setIsAddRentalOpen] = useState(false);
  
  const navigate = useNavigate();
  const rawEmail = localStorage.getItem('userEmail') || '';
  const userEmail = rawEmail.toLowerCase().trim();
  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isGestor = ['Gestor', 'Vendas'].includes(userRole);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const loadData = () => {
    try {
      // 1. Carregar Usuário Atual
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) {
        const users = JSON.parse(savedUsers);
        if (Array.isArray(users)) {
          const found = users.find(u => u && u.email && String(u.email).toLowerCase().trim() === userEmail);
          setCurrentUser(found || null);
        }
      }

      // 2. Carregar Pedidos (Filtrar por gestor ou dono)
      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        if (Array.isArray(orders)) {
          const valid = orders.filter(o => o && typeof o === 'object');
          const filtered = isGestor ? valid : valid.filter(o => 
            o.userEmail && String(o.userEmail).toLowerCase().trim() === userEmail
          );
          setUserOrders(filtered);
        }
      }
      
      // 3. Carregar Aluguéis (Filtrar por gestor ou dono)
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals) {
        const rentals = JSON.parse(savedRentals);
        if (Array.isArray(rentals)) {
          const valid = rentals.filter(r => r && typeof r === 'object');
          const filtered = isGestor ? valid : valid.filter(r => {
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

  useEffect(() => { 
    loadData(); 
  }, [userEmail, isGestor]);

  const financialSummary = useMemo(() => {
    const orders = Array.isArray(userOrders) ? userOrders : [];
    const rentals = Array.isArray(userRentals) ? userRentals : [];
    const all = [...orders, ...rentals];

    const totalInvoiced = all.reduce((acc, item) => acc + (Number(item?.total) || 0), 0);
    const totalPaid = all.reduce((acc, item) => acc + (Number(item?.paidAmount) || 0), 0);

    return { 
      totalInvoiced, 
      totalPaid, 
      totalDebt: Math.max(0, totalInvoiced - totalPaid) 
    };
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
            <TabsTrigger value="data" className="flex-1 rounded-[2rem] font-bold">Meus Dados</TabsTrigger>
            <TabsTrigger value="finance" className="flex-1 rounded-[2rem] font-bold">Financeiro</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 rounded-[2rem] font-bold">{isGestor ? 'Todos Pedidos' : 'Meus Pedidos'}</TabsTrigger>
            <TabsTrigger value="rentals" className="flex-1 rounded-[2rem] font-bold">{isGestor ? 'Todos Aluguéis' : 'Meus Aluguéis'}</TabsTrigger>
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
                    <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest mt-1">Cargo: {userRole}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Contatos</h3>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-slate-700">{currentUser?.email || userEmail}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-slate-700">{currentUser?.whatsapp || "---"}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Identificação</h3>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-indigo-600" />
                    <span className="font-bold text-slate-700">CPF: {currentUser?.cpf || "---"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-8 rounded-[2.5rem] bg-slate-900 text-white border-none shadow-xl">
                <p className="text-3xl font-black">R$ {financialSummary.totalInvoiced.toFixed(2)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Geral</p>
              </Card>
              <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl">
                <p className="text-3xl font-black text-emerald-600">R$ {financialSummary.totalPaid.toFixed(2)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Recebido</p>
              </Card>
              <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl border-2 border-rose-100">
                <p className="text-3xl font-black text-rose-600">R$ {financialSummary.totalDebt.toFixed(2)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase">Saldo Pendente</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            {userOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <SearchX className="h-12 w-12 text-slate-200 mx-auto mb-4"/>
                <p className="text-slate-500 font-bold">Nenhum pedido encontrado.</p>
              </div>
            ) : (
              userOrders.map((order, idx) => (
                <Card key={order?.id || idx} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingBag className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-black text-slate-900">{order?.id || "Nº ?"} {isGestor && <span className="text-blue-600 text-[10px] ml-2 font-bold">[{order?.clientName || "S/N"}]</span>}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{order?.date || "---"} • R$ {(Number(order?.total) || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="rounded-lg text-[9px] uppercase h-6 font-black">{order?.status || "Pendente"}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleAction('order', order)} className="text-blue-600"><Eye className="h-5 w-5"/></Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rentals" className="space-y-4">
            {userRentals.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <SearchX className="h-12 w-12 text-slate-200 mx-auto mb-4"/>
                <p className="text-slate-500 font-bold">Nenhum contrato encontrado.</p>
              </div>
            ) : (
              userRentals.map((rental, idx) => (
                <Card key={rental?.id || idx} className="p-6 rounded-[2.5rem] bg-white border-none shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><Calendar className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-black text-slate-900">{rental?.item || "Equipamento"} {isGestor && <span className="text-orange-600 text-[10px] ml-2 font-bold">[{rental?.client || "S/N"}]</span>}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{rental?.start} - {rental?.end} • R$ {(Number(rental?.total) || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="rounded-lg text-[9px] uppercase h-6 font-black">{rental?.status === 'completed' ? 'Finalizado' : 'Ativo'}</Badge>
                    <Button onClick={() => handleAction('rental', rental)} className="bg-blue-600 text-white rounded-xl px-6 font-bold">Ver</Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {isOrderOpen && selectedOrder && (
        <EditOrderDialog 
          order={selectedOrder} 
          open={isOrderOpen} 
          onOpenChange={setIsOrderOpen} 
          onCancel={() => {}} 
          onSave={loadData} 
        />
      )}
      {isRentalOpen && selectedRental && (
        <RentalDetailsDialog 
          rental={selectedRental} 
          open={isRentalOpen} 
          onOpenChange={setIsRentalOpen} 
          onUpdate={loadData} 
        />
      )}
    </AppLayout>
  );
};

export default ProfilePage;