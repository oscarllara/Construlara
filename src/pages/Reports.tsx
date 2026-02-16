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
  AlertCircle, CheckCircle2, Clock, FileText, Download, Settings2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Equipment } from '@/components/EquipmentCard';
import ReturnEquipmentDialog from '@/components/ReturnEquipmentDialog';
import { showSuccess } from '@/utils/toast';

const ReportsPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState<Equipment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip) setEquipments(JSON.parse(savedEquip));

    const savedRentals = localStorage.getItem('app_rentals');
    if (savedRentals) setRentals(JSON.parse(savedRentals));
  };

  const handleStatusAction = (equip: Equipment) => {
    if (equip.status === 'rented') {
      setSelectedEquip(equip);
      setIsReturnOpen(true);
    } else if (equip.status === 'maintenance') {
      updateStatus(equip.id, 'available');
      showSuccess(`${equip.name} agora está disponível.`);
    } else {
      updateStatus(equip.id, 'maintenance');
      showSuccess(`${equip.name} enviado para manutenção.`);
    }
  };

  const updateStatus = (id: string, nextStatus: 'available' | 'maintenance' | 'rented', notes?: string) => {
    const newEquipments = equipments.map(e => 
      e.id === id ? { ...e, status: nextStatus, lastClient: nextStatus === 'rented' ? e.lastClient : undefined } : e
    );
    
    localStorage.setItem('app_equipments', JSON.stringify(newEquipments));
    setEquipments(newEquipments);

    if (notes) {
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals) {
        const rentalsList = JSON.parse(savedRentals);
        const updatedRentals = rentalsList.map((r: any) => 
          (r.equipmentId === id && r.status === 'active') ? { ...r, status: 'completed', notes: notes } : r
        );
        localStorage.setItem('app_rentals', JSON.stringify(updatedRentals));
        setRentals(updatedRentals);
      }
    }
  };

  const handleConfirmReturn = (id: string, nextStatus: 'available' | 'maintenance', notes: string) => {
    updateStatus(id, nextStatus, notes);
    setIsReturnOpen(false);
    showSuccess("Devolução processada com sucesso.");
  };

  // Dados para o Relatório de Equipamentos
  const equipmentStats = useMemo(() => {
    const available = equipments.filter(e => e.status === 'available').length;
    const rented = equipments.filter(e => e.status === 'rented').length;
    const maintenance = equipments.filter(e => e.status === 'maintenance').length;

    return [
      { name: 'Disponíveis', value: available, color: '#2563eb' },
      { name: 'Alugados', value: rented, color: '#dc2626' },
      { name: 'Manutenção', value: maintenance, color: '#64748b' },
    ];
  }, [equipments]);

  // Dados para o Relatório Financeiro
  const financialStats = useMemo(() => {
    const total = rentals.reduce((acc, r) => acc + (r.total || 0), 0);
    const received = rentals.filter(r => r.status === 'completed').reduce((acc, r) => acc + (r.total || 0), 0);
    const toReceive = rentals.filter(r => r.status === 'active' || r.status === 'overdue').reduce((acc, r) => acc + (r.total || 0), 0);
    const overdue = rentals.filter(r => r.status === 'overdue').reduce((acc, r) => acc + (r.total || 0), 0);
    const onTime = rentals.filter(r => r.status === 'active').reduce((acc, r) => acc + (r.total || 0), 0);

    return { total, received, toReceive, overdue, onTime };
  }, [rentals]);

  const financialChartData = [
    { name: 'Recebidos', valor: financialStats.received },
    { name: 'A Receber', valor: financialStats.toReceive },
    { name: 'Atrasados', valor: financialStats.overdue },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Relatórios & Inteligência</h2>
            <p className="text-slate-500 font-medium">Análise detalhada de inventário e performance financeira</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold gap-2 h-12 px-6">
            <Download className="h-5 w-5" />
            Exportar PDF
          </Button>
        </div>

        <Tabs defaultValue="equipments" className="space-y-8">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14">
            <TabsTrigger value="equipments" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Hammer className="h-4 w-4 mr-2" /> Inventário
            </TabsTrigger>
            <TabsTrigger value="financial" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <DollarSign className="h-4 w-4 mr-2" /> Financeiro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipments" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              {equipmentStats.map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-[2.5rem] bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-slate-900">{stat.value}</div>
                    <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000" 
                        style={{ width: `${(stat.value / (equipments.length || 1)) * 100}%`, backgroundColor: stat.color }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-black">Distribuição de Status</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={equipmentStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {equipmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-black">Lista de Status</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto">
                  <div className="space-y-4">
                    {equipments.map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group">
                        <div>
                          <p className="font-bold text-slate-900">{e.name}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase">{e.serialNumber}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                            e.status === 'available' ? 'bg-blue-100 text-blue-700' :
                            e.status === 'rented' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {e.status === 'available' ? 'Disponível' : e.status === 'rented' ? 'Alugado' : 'Manutenção'}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleStatusAction(e)}
                            className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 hover:text-blue-700"
                            title="Alterar Status"
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total em Contratos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black">R$ {financialStats.total.toFixed(2)}</div>
                  <p className="text-[10px] text-blue-400 font-bold mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Volume total gerado
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recebidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-emerald-600">R$ {financialStats.received.toFixed(2)}</div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Contratos finalizados
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Em Dia (A Receber)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-blue-600">R$ {financialStats.onTime.toFixed(2)}</div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Contratos ativos
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atrasados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-red-600">R$ {financialStats.overdue.toFixed(2)}</div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Cobrança pendente
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-black">Fluxo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontWeight: 'bold', fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="valor" radius={[10, 10, 0, 0]}>
                      {financialChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ReturnEquipmentDialog 
        equipment={selectedEquip}
        open={isReturnOpen}
        onOpenChange={setIsReturnOpen}
        onConfirm={handleConfirmReturn}
      />
    </AppLayout>
  );
};

export default ReportsPage;