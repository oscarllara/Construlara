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
  AlertCircle, CheckCircle2, Clock, FileText, Download, Settings2, ShoppingBag, ArrowRight, SearchX
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
    { name: 'Disponíveis', value: equipments.filter(e => e.status === 'available').length, color: '#2563eb', key: 'available' },
    { name: 'Alugados', value: equipments.filter(e => e.status === 'rented').length, color: '#dc2626', key: 'rented' },
    { name: 'Manutenção', value: equipments.filter(e => e.status === 'maintenance').length, color: '#64748b', key: 'maintenance' },
  ], [equipments]);

  // Estatísticas Financeiras
  const financialStats = useMemo(() => {
    const received = rentals.filter(r => r.status === 'completed').reduce((acc, r) => acc + (r.total || 0), 0);
    const toReceive = rentals.filter(r => r.status === 'active' || r.status === 'overdue').reduce((acc, r) => acc + (r.total || 0), 0);
    return { received, toReceive, total: received + toReceive };
  }, [rentals]);

  // Estatísticas de Pedidos
  const orderStats = useMemo(() => [
    { name: 'Entregues', value: orders.filter(o => o.status === 'Entregue').length, color: '#10b981' },
    { name: 'Pendentes', value: orders.filter(o => o.status !== 'Entregue').length, color: '#f59e0b' },
  ], [orders]);

  const renderFinancialDetail = () => {
    const list = activeDetail === 'received' 
      ? rentals.filter(r => r.status === 'completed')
      : activeDetail === 'toReceive'
      ? rentals.filter(r => r.status === 'active' || r.status === 'overdue')
      : rentals;

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">
            {activeDetail === 'received' ? 'Valores Recebidos' : activeDetail === 'toReceive' ? 'Valores a Receber' : 'Todos os Contratos'}
          </h3>
          <Button variant="ghost" onClick={() => setActiveDetail(null)} className="text-xs font-bold">Voltar ao Resumo</Button>
        </div>
        <div className="grid gap-3">
          {list.map((r: any) => (
            <div key={r.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{r.client}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{r.item} • {r.end}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-blue-700">R$ {r.total?.toFixed(2)}</p>
                <Badge className={cn(
                  "text-[8px] font-black uppercase",
                  r.status === 'completed' ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                )}>{r.status}</Badge>
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
            <p className="text-slate-500 font-medium">Análise detalhada de inventário, financeiro e pedidos</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold gap-2 h-12 px-6">
            <Download className="h-5 w-5" /> Exportar PDF
          </Button>
        </div>

        <Tabs defaultValue="financial" className="space-y-8">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14">
            <TabsTrigger value="financial" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Financeiro</TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Inventário</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-8">
            {!activeDetail ? (
              <>
                <div className="grid gap-6 md:grid-cols-3">
                  <Card 
                    onClick={() => setActiveDetail('total')}
                    className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white cursor-pointer hover:scale-105 transition-transform"
                  >
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase">Volume Total</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-black">R$ {financialStats.total.toFixed(2)}</div></CardContent>
                  </Card>
                  <Card 
                    onClick={() => setActiveDetail('received')}
                    className="border-none shadow-sm rounded-[2.5rem] bg-white cursor-pointer hover:scale-105 transition-transform"
                  >
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase">Recebidos</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-black text-emerald-600">R$ {financialStats.received.toFixed(2)}</div></CardContent>
                  </Card>
                  <Card 
                    onClick={() => setActiveDetail('toReceive')}
                    className="border-none shadow-sm rounded-[2.5rem] bg-white cursor-pointer hover:scale-105 transition-transform"
                  >
                    <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase">A Receber</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-black text-blue-600">R$ {financialStats.toReceive.toFixed(2)}</div></CardContent>
                  </Card>
                </div>
                <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white">
                  <CardHeader><CardTitle className="text-xl font-black">Fluxo de Caixa Estimado</CardTitle></CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Recebido', value: financialStats.received },
                        { name: 'A Receber', value: financialStats.toReceive }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                          <Cell fill="#10b981" />
                          <Cell fill="#2563eb" />
                        </Bar>
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
                <CardHeader><CardTitle className="text-xl font-black">Status de Equipamentos</CardTitle></CardHeader>
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
                <h3 className="text-lg font-black text-slate-900">Lista de Equipamentos</h3>
                <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {equipments.map(e => (
                    <div 
                      key={e.id} 
                      onClick={() => navigate('/equipamentos')}
                      className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center",
                          e.status === 'available' ? "bg-blue-50 text-blue-600" : e.status === 'rented' ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"
                        )}>
                          <Hammer className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{e.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{e.serialNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          "text-[8px] font-black uppercase",
                          e.status === 'available' ? "bg-blue-50 text-blue-700" : e.status === 'rented' ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"
                        )}>{e.status}</Badge>
                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white">
                <CardHeader><CardTitle className="text-xl font-black">Status de Pedidos</CardTitle></CardHeader>
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
                <h3 className="text-lg font-black text-slate-900">Pedidos Recentes</h3>
                <div className="grid gap-3">
                  {orders.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <SearchX className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">Nenhum pedido registrado.</p>
                    </div>
                  ) : (
                    orders.map(o => (
                      <div 
                        key={o.id} 
                        onClick={() => navigate('/perfil')}
                        className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{o.id}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{o.date}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="text-sm font-black text-blue-700">R$ {o.total.toFixed(2)}</p>
                            <Badge className="text-[8px] font-black uppercase bg-slate-50 text-slate-600">{o.status}</Badge>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
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