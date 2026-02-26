"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Hammer, Receipt, DollarSign, TrendingUp, 
  AlertCircle, CheckCircle2, Clock, FileText, Download, Settings2, ShoppingBag, ArrowRight, SearchX, ArrowLeft
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Equipment } from '@/components/EquipmentCard';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import PaymentActionDialog from '@/components/PaymentActionDialog';

const ReportsPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const navigate = useNavigate();

  const loadData = () => {
    try {
      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip) setEquipments(JSON.parse(savedEquip));

      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals) setRentals(JSON.parse(savedRentals));

      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error("Erro ao carregar dados dos relatórios:", e);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('order-placed', loadData);
    return () => window.removeEventListener('order-placed', loadData);
  }, []);

  const equipmentStats = useMemo(() => [
    { name: 'Disponíveis', value: (equipments || []).filter(e => e && e.status === 'available').length, color: '#2563eb' },
    { name: 'Alugados', value: (equipments || []).filter(e => e && e.status === 'rented').length, color: '#dc2626' },
    { name: 'Manutenção', value: (equipments || []).filter(e => e && e.status === 'maintenance').length, color: '#64748b' },
  ], [equipments]);

  // Lógica Financeira Corrigida: Filtra apenas o que é de cliente
  const financialStats = useMemo(() => {
    const safeRentals = Array.isArray(rentals) ? rentals : [];
    const safeOrders = Array.isArray(orders) ? orders : [];

    const totalReceived = [...safeRentals, ...safeOrders].reduce((acc, item) => acc + (Number(item?.paidAmount) || 0), 0);
    const totalToReceive = [...safeRentals, ...safeOrders].reduce((acc, item) => {
      const balance = (Number(item?.total) || 0) - (Number(item?.paidAmount) || 0);
      return acc + Math.max(0, balance);
    }, 0);

    const rentalsReceived = safeRentals.reduce((acc, r) => acc + (Number(r?.paidAmount) || 0), 0);
    const rentalsToReceive = safeRentals.reduce((acc, r) => acc + Math.max(0, (Number(r?.total) || 0) - (Number(r?.paidAmount) || 0)), 0);

    const salesReceived = safeOrders.reduce((acc, o) => acc + (Number(o?.paidAmount) || 0), 0);
    const salesToReceive = safeOrders.reduce((acc, o) => acc + Math.max(0, (Number(o?.total) || 0) - (Number(o?.paidAmount) || 0)), 0);

    return { 
      rentalsReceived, 
      rentalsToReceive, 
      salesReceived, 
      salesToReceive,
      totalReceived,
      totalToReceive,
      grandTotal: totalReceived + totalToReceive
    };
  }, [rentals, orders]);

  const orderStats = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    return [
      { name: 'Entregues', value: safeOrders.filter(o => o && (o.status === 'Entregue' || o.status === 'Pago')).length, color: '#10b981' },
      { name: 'Pendentes', value: safeOrders.filter(o => o && o.status !== 'Entregue' && o.status !== 'Pago').length, color: '#f59e0b' },
    ];
  }, [orders]);

  const handleOpenPayment = (item: any) => {
    setSelectedItem(item);
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (amountToPay: number) => {
    if (!selectedItem) return;

    if (selectedItem.type === 'Venda') {
      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders) {
        const currentOrders = JSON.parse(savedOrders);
        const updated = currentOrders.map((o: any) => {
          if (o.id === selectedItem.id) {
            const currentPaid = Number(o.paidAmount || 0);
            const total = Number(o.total || 0);
            const nextPaid = currentPaid + amountToPay;
            return { 
              ...o, 
              paidAmount: nextPaid,
              status: nextPaid >= total - 0.01 ? 'Pago' : o.status 
            };
          }
          return o;
        });
        localStorage.setItem('app_orders', JSON.stringify(updated));
      }
    } else {
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals) {
        const currentRentals = JSON.parse(savedRentals);
        const updated = currentRentals.map((r: any) => {
          if (r.id === selectedItem.id) {
            const currentPaid = Number(r.paidAmount || 0);
            const total = Number(r.total || 0);
            const nextPaid = currentPaid + amountToPay;
            return { 
              ...r, 
              paidAmount: nextPaid,
              status: nextPaid >= total - 0.01 ? 'completed' : r.status 
            };
          }
          return r;
        });
        localStorage.setItem('app_rentals', JSON.stringify(updated));
      }
    }
    
    showSuccess("Recebimento registrado!");
    setIsPaymentDialogOpen(false);
    loadData();
    window.dispatchEvent(new Event('order-placed'));
  };

  const renderFinancialDetail = () => {
    const safeRentals = Array.isArray(rentals) ? rentals : [];
    const safeOrders = Array.isArray(orders) ? orders : [];

    const allEntries = [
      ...safeRentals.filter(r => r).map(r => ({
        id: r.id,
        client: r.client || 'Cliente não identificado',
        description: r.item || 'Item não especificado',
        date: r.end || r.start || '---',
        total: Number(r.total) || 0,
        paidAmount: Number(r.paidAmount) || 0,
        type: 'Aluguel' as const,
        isFullyPaid: Number(r.paidAmount) >= Number(r.total) - 0.01
      })),
      ...safeOrders.filter(o => o).map(o => ({
        id: o.id,
        client: o.clientName || (o.userEmail || 'Desconhecido').split('@')[0],
        description: `Pedido ${o.id}`,
        date: o.date || '---',
        total: Number(o.total) || 0,
        paidAmount: Number(o.paidAmount) || 0,
        type: 'Venda' as const,
        isFullyPaid: Number(o.paidAmount) >= Number(o.total) - 0.01
      }))
    ];
    
    const list = activeDetail === 'received' 
      ? allEntries.filter(e => e.paidAmount > 0)
      : activeDetail === 'toReceive'
      ? allEntries.filter(e => !e.isFullyPaid)
      : allEntries;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveDetail(null)} 
              className="rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-2xl font-black text-slate-900">
              {activeDetail === 'received' ? 'Recebimentos Registrados' : activeDetail === 'toReceive' ? 'Saldo Devedor Total' : 'Fluxo de Caixa Total'}
            </h3>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-none px-4 py-2 rounded-xl font-bold">
            {list.length} registros
          </Badge>
        </div>
        <div className="grid gap-3">
          {list.map((entry: any) => {
            const balance = entry.total - entry.paidAmount;
            return (
              <div key={entry.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center",
                    entry.type === 'Aluguel' ? "bg-blue-50" : "bg-emerald-50"
                  )}>
                    {entry.type === 'Aluguel' ? <Receipt className="h-6 w-6 text-blue-600" /> : <ShoppingBag className="h-6 w-6 text-emerald-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-black text-slate-900">{entry.client}</p>
                      <Badge variant="outline" className="text-[9px] font-black uppercase rounded-lg px-2 h-4">{entry.type}</Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase">{entry.description} • {entry.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={cn("text-lg font-black", activeDetail === 'received' ? "text-emerald-600" : "text-blue-700")}>
                      {activeDetail === 'received' ? `R$ ${entry.paidAmount.toFixed(2)}` : `R$ ${balance.toFixed(2)}`}
                    </p>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={cn(
                        "text-[10px] font-black uppercase rounded-lg",
                        entry.isFullyPaid ? "bg-emerald-50 text-emerald-700" : "bg-blue-100 text-blue-700"
                      )}>{entry.isFullyPaid ? 'Liquidado' : 'Aberto'}</Badge>
                      {entry.paidAmount > 0 && !entry.isFullyPaid && (
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Parcialmente Pago</span>
                      )}
                    </div>
                  </div>
                  {!entry.isFullyPaid && activeDetail !== 'received' && (
                    <Button 
                      onClick={() => handleOpenPayment(entry)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-10 px-4 text-xs gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Receber
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Relatórios & Inteligência</h2>
            <p className="text-slate-500 font-medium">Análise consolidada de Aluguéis e Vendas de Produtos</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold gap-2 h-12 px-6">
            <Download className="h-5 w-5" /> Exportar Relatório
          </Button>
        </div>

        <Tabs defaultValue="financial" className="space-y-8">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14">
            <TabsTrigger value="financial" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Financeiro</TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Aluguéis</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Vendas</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-8">
            {!activeDetail ? (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  <Card 
                    onClick={() => setActiveDetail('total')}
                    className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Total</CardTitle></CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black">R$ {financialStats.grandTotal.toFixed(2)}</div>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">Valor Global de Contratos e Pedidos</p>
                    </CardContent>
                  </Card>
                  <Card 
                    onClick={() => setActiveDetail('received')}
                    className="border-none shadow-sm rounded-[2.5rem] bg-white cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Já Recebidos (Caixa)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black text-emerald-600">R$ {financialStats.totalReceived.toFixed(2)}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-[8px] font-black">Aluguéis: R${financialStats.rentalsReceived.toFixed(0)}</Badge>
                        <Badge variant="outline" className="text-[8px] font-black">Vendas: R${financialStats.salesReceived.toFixed(0)}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card 
                    onClick={() => setActiveDetail('toReceive')}
                    className="border-none shadow-sm rounded-[2.5rem] bg-white cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo a Receber / Devedores</CardTitle></CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black text-blue-600">R$ {financialStats.totalToReceive.toFixed(2)}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-[8px] font-black">Aluguéis: R${financialStats.rentalsToReceive.toFixed(0)}</Badge>
                        <Badge variant="outline" className="text-[8px] font-black">Vendas: R${financialStats.salesToReceive.toFixed(0)}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white">
                  <CardHeader><CardTitle className="text-xl font-black">Distribuição de Receita</CardTitle></CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Aluguéis (Rec.)', value: financialStats.rentalsReceived, fill: '#10b981' },
                        { name: 'Aluguéis (Pend.)', value: financialStats.rentalsToReceive, fill: '#3b82f6' },
                        { name: 'Vendas (Rec.)', value: financialStats.salesReceived, fill: '#059669' },
                        { name: 'Vendas (Pend.)', value: financialStats.salesToReceive, fill: '#60a5fa' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} fontWeights="bold" />
                        <YAxis />
                        <Tooltip formatter={(value) => `R$ ${value}`} />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : renderFinancialDetail()}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white">
                <CardHeader><CardTitle className="text-xl font-black">Ocupação do Inventário</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={equipmentStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {equipmentStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">Estado dos Aluguéis</h3>
                <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {(rentals || []).filter(r => r).map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => navigate('/alugueis')}
                      className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center",
                          r.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                        )}>
                          <Receipt className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{r.item}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{r.client} • R$ {Number(r.total || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase",
                        r.status === 'completed' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                      )}>{r.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white">
                <CardHeader><CardTitle className="text-xl font-black">Eficiência de Vendas</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orderStats} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {orderStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900">Histórico de Vendas Recentes</h3>
                <div className="grid gap-3">
                  {(orders || []).length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <SearchX className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">Nenhuma venda registrada.</p>
                    </div>
                  ) : (
                    orders.filter(o => o).map(o => (
                      <div 
                        key={o.id} 
                        onClick={() => navigate('/perfil')}
                        className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{o.id}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{o.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-700">R$ {Number(o.total || 0).toFixed(2)}</p>
                          <Badge className="text-[8px] font-black uppercase bg-slate-50 text-slate-600">{o.status}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PaymentActionDialog 
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        item={selectedItem ? {
          id: selectedItem.id,
          total: selectedItem.total,
          paidAmount: selectedItem.paidAmount,
          client: selectedItem.client,
          description: selectedItem.description
        } : null}
        onConfirm={handleConfirmPayment}
      />
    </AppLayout>
  );
};

export default ReportsPage;