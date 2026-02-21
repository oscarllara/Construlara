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

const ReportsPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) setEquipments(JSON.parse(savedEquip));

    const savedRentals = localStorage.getItem('app_rentals');
    if (savedRentals) setRentals(JSON.parse(savedRentals));

    const savedOrders = localStorage.getItem('app_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Estatísticas de Inventário
  const equipmentStats = useMemo(() => [
    { name: 'Disponíveis', value: equipments.filter(e => e.status === 'available').length, color: '#2563eb' },
    { name: 'Alugados', value: equipments.filter(e => e.status === 'rented').length, color: '#dc2626' },
    { name: 'Manutenção', value: equipments.filter(e => e.status === 'maintenance').length, color: '#64748b' },
  ], [equipments]);

  // Estatísticas Financeiras Consolidadas
  const financialStats = useMemo(() => {
    // Receita de Aluguéis
    const rentalsReceived = rentals
      .filter(r => r.status === 'completed')
      .reduce((acc, r) => acc + (Number(r.total) || 0), 0);
    
    const rentalsToReceive = rentals
      .filter(r => r.status === 'active' || r.status === 'overdue')
      .reduce((acc, r) => acc + (Number(r.total) || 0), 0);

    // Receita de Vendas (Pedidos)
    const salesReceived = orders
      .filter(o => o.status === 'Entregue')
      .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    
    const salesToReceive = orders
      .filter(o => o.status !== 'Entregue')
      .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    return { 
      rentalsReceived, 
      rentalsToReceive, 
      salesReceived, 
      salesToReceive,
      totalReceived: rentalsReceived + salesReceived,
      totalToReceive: rentalsToReceive + salesToReceive,
      grandTotal: rentalsReceived + salesReceived + rentalsToReceive + salesToReceive
    };
  }, [rentals, orders]);

  // Estatísticas de Pedidos
  const orderStats = useMemo(() => [
    { name: 'Entregues', value: orders.filter(o => o.status === 'Entregue').length, color: '#10b981' },
    { name: 'Pendentes', value: orders.filter(o => o.status !== 'Entregue').length, color: '#f59e0b' },
  ], [orders]);

  const renderFinancialDetail = () => {
    // Combinar rentals e orders para exibição na lista de detalhes financeiros
    const rentalEntries = rentals.map(r => ({
      id: r.id,
      client: r.client,
      description: r.item,
      date: r.end,
      value: Number(r.total) || 0,
      type: 'Aluguel',
      status: r.status === 'completed' ? 'Recebido' : 'Pendente',
      originalStatus: r.status
    }));

    const orderEntries = orders.map(o => ({
      id: o.id,
      client: o.userEmail.split('@')[0],
      description: `Pedido ${o.id}`,
      date: o.date,
      value: Number(o.total) || 0,
      type: 'Venda',
      status: o.status === 'Entregue' ? 'Recebido' : 'Pendente',
      originalStatus: o.status
    }));

    const allEntries = [...rentalEntries, ...orderEntries];
    
    const list = activeDetail === 'received' 
      ? allEntries.filter(e => e.status === 'Recebido')
      : activeDetail === 'toReceive'
      ? allEntries.filter(e => e.status === 'Pendente')
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
              {activeDetail === 'received' ? 'Valores Recebidos' : activeDetail === 'toReceive' ? 'Valores a Receber' : 'Fluxo de Caixa Total'}
            </h3>
          </div>
          <Badge className="bg-blue-50 text-blue-700 border-none px-4 py-2 rounded-xl font-bold">
            {list.length} registros
          </Badge>
        </div>
        <div className="grid gap-3">
          {list.map((entry: any) => (
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
              <div className="text-right">
                <p className="text-lg font-black text-blue-700">R$ {entry.value.toFixed(2)}</p>
                <Badge className={cn(
                  "text-[10px] font-black uppercase rounded-lg",
                  entry.status === 'Recebido' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                )}>{entry.status}</Badge>
              </div>
            </div>
          ))}
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
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">Consolidado Vendas + Aluguéis</p>
                    </CardContent>
                  </Card>
                  <Card 
                    onClick={() => setActiveDetail('received')}
                    className="border-none shadow-sm rounded-[2.5rem] bg-white cursor-pointer hover:scale-[1.02] transition-transform"
                  >
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Já Recebidos</CardTitle></CardHeader>
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
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">A Receber / Pendentes</CardTitle></CardHeader>
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
                  {rentals.map(r => (
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{r.client} • R$ {Number(r.total).toFixed(2)}</p>
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
                  {orders.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <SearchX className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">Nenhuma venda registrada.</p>
                    </div>
                  ) : (
                    orders.map(o => (
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
                          <p className="text-sm font-black text-emerald-700">R$ {Number(o.total).toFixed(2)}</p>
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
    </AppLayout>
  );
};

export default ReportsPage;