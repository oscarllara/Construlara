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
  AlertCircle, CheckCircle2, Clock, FileText, Download, Settings2, ShoppingBag
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Equipment } from '@/components/EquipmentCard';
import { showSuccess } from '@/utils/toast';

const ReportsPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

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
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase">Volume Total</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-black">R$ {financialStats.total.toFixed(2)}</div></CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase">Recebidos</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-black text-emerald-600">R$ {financialStats.received.toFixed(2)}</div></CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase">A Receber</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-black text-blue-600">R$ {financialStats.toReceive.toFixed(2)}</div></CardContent>
              </Card>
            </div>
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
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;