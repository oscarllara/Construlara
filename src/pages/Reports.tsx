"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Hammer, Receipt, DollarSign, TrendingUp, 
  AlertCircle, CheckCircle2, Clock, FileText, Download, Settings2, ShoppingBag, ArrowRight, SearchX, ArrowLeft, Save, CreditCard, Wrench, Package
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Equipment } from '@/components/EquipmentCard';
import { Product } from '@/components/ProductCard';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import PaymentActionDialog from '@/components/PaymentActionDialog';

const ReportsPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeDetail, setActiveDetail] = useState<'total' | 'received' | 'pending' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const [pixInfo, setPixInfo] = useState({ key: "16403481000116", name: "BTM Design", bank: "CC Crediplus" });
  const navigate = useNavigate();

  const loadData = () => {
    try {
      const getSafeParsed = (key: string) => {
        const val = localStorage.getItem(key);
        if (!val || val === "undefined" || val === "null") return [];
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
      };

      setEquipments(getSafeParsed('app_equipments'));
      setProducts(getSafeParsed('app_products'));
      setRentals(getSafeParsed('app_rentals'));
      setOrders(getSafeParsed('app_orders'));
      
      const savedPix = localStorage.getItem('app_pix_info');
      if (savedPix && savedPix !== "undefined") {
        try { setPixInfo(JSON.parse(savedPix)); } catch(e) {}
      }
    } catch (e) { 
      console.error("Erro ao carregar dados dos relatórios:", e);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('order-placed', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('order-placed', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const handleSavePix = () => {
    localStorage.setItem('app_pix_info', JSON.stringify(pixInfo));
    showSuccess("Configurações de Pix atualizadas!");
    window.dispatchEvent(new Event('pix-updated'));
  };

  const maintenanceEquipments = useMemo(() => {
    return (equipments || []).filter(e => e && e.status === 'maintenance');
  }, [equipments]);

  const financialStats = useMemo(() => {
    const safeRentals = Array.isArray(rentals) ? rentals : [];
    const safeOrders = Array.isArray(orders) ? orders : [];
    
    const totalReceived = [...safeRentals, ...safeOrders].reduce((acc, item) => {
      if (!item) return acc;
      return acc + (Number(item.paidAmount) || 0);
    }, 0);

    const totalToReceive = [...safeRentals, ...safeOrders].reduce((acc, item) => {
      if (!item) return acc;
      const balance = (Number(item.total) || 0) - (Number(item.paidAmount) || 0);
      return acc + Math.max(0, balance);
    }, 0);

    return { totalReceived, totalToReceive, grandTotal: totalReceived + totalToReceive };
  }, [rentals, orders]);

  const detailedList = useMemo(() => {
    if (!activeDetail) return [];
    
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeRentals = Array.isArray(rentals) ? rentals : [];

    const all = [
      ...safeOrders.map(o => ({ ...o, type: 'Venda', displayIcon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' })),
      ...safeRentals.map(r => ({ ...r, type: 'Aluguel', displayIcon: Receipt, color: 'text-orange-600', bg: 'bg-orange-50' }))
    ].filter(item => item && (item.id || item.item));

    if (activeDetail === 'received') {
      return all.filter(item => (Number(item.paidAmount) || 0) > 0);
    }
    if (activeDetail === 'pending') {
      return all.filter(item => (Number(item.total) || 0) > (Number(item.paidAmount) || 0));
    }
    return all;
  }, [activeDetail, orders, rentals]);

  const handleOpenPayment = (item: any) => {
    if (!item) return;
    setSelectedItem({
      ...item,
      client: item.client || item.clientName || "Cliente",
      description: item.type === 'Venda' ? `Pedido ${item.id}` : (item.item || "Serviço")
    });
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (amountToPay: number) => {
    if (!selectedItem) return;
    const key = selectedItem.type === 'Venda' ? 'app_orders' : 'app_rentals';
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const current = JSON.parse(saved);
        if (Array.isArray(current)) {
          const updated = current.map((o: any) => {
            if (o && o.id === selectedItem.id) {
              const nextPaid = (Number(o.paidAmount) || 0) + amountToPay;
              const total = (Number(o.total) || 0);
              return { 
                ...o, 
                paidAmount: nextPaid, 
                status: nextPaid >= total - 0.01 ? (key === 'app_orders' ? 'Pago' : 'completed') : o.status 
              };
            }
            return o;
          });
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } catch(e) {}
    }
    showSuccess("Recebimento registrado!");
    setIsPaymentDialogOpen(false);
    loadData();
    window.dispatchEvent(new Event('order-placed'));
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Painel Administrativo</h2>
            <p className="text-slate-500 font-medium">Gestão financeira e operacional</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold gap-2 h-12 px-6">
            <Download className="h-5 w-5" /> Exportar Relatório
          </Button>
        </div>

        <Tabs defaultValue="financial" className="space-y-8">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-fit">
            <TabsTrigger value="financial" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Financeiro</TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Oficina</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <button 
                onClick={() => setActiveDetail(activeDetail === 'total' ? null : 'total')}
                className={cn(
                  "text-left p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group",
                  activeDetail === 'total' ? "bg-slate-900 border-slate-900 shadow-2xl scale-[1.02]" : "bg-white border-slate-100 hover:border-slate-300"
                )}
              >
                <div className="relative z-10">
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", activeDetail === 'total' ? "text-slate-400" : "text-slate-400")}>Faturamento Total</p>
                  <div className={cn("text-3xl font-black mt-2", activeDetail === 'total' ? "text-white" : "text-slate-900")}>R$ {financialStats.grandTotal.toFixed(2)}</div>
                </div>
                {activeDetail === 'total' && <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><TrendingUp className="h-12 w-12 text-white" /></div>}
              </button>

              <button 
                onClick={() => setActiveDetail(activeDetail === 'received' ? null : 'received')}
                className={cn(
                  "text-left p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group",
                  activeDetail === 'received' ? "bg-emerald-600 border-emerald-600 shadow-2xl scale-[1.02]" : "bg-white border-slate-100 hover:border-emerald-200"
                )}
              >
                <div className="relative z-10">
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", activeDetail === 'received' ? "text-emerald-100" : "text-slate-400")}>Já Recebidos (Caixa)</p>
                  <div className={cn("text-3xl font-black mt-2", activeDetail === 'received' ? "text-white" : "text-emerald-600")}>R$ {financialStats.totalReceived.toFixed(2)}</div>
                </div>
                {activeDetail === 'received' && <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><CheckCircle2 className="h-12 w-12 text-white" /></div>}
              </button>

              <button 
                onClick={() => setActiveDetail(activeDetail === 'pending' ? null : 'pending')}
                className={cn(
                  "text-left p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group",
                  activeDetail === 'pending' ? "bg-blue-600 border-blue-600 shadow-2xl scale-[1.02]" : "bg-white border-slate-100 hover:border-blue-200"
                )}
              >
                <div className="relative z-10">
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", activeDetail === 'pending' ? "text-blue-100" : "text-slate-400")}>Saldo a Receber</p>
                  <div className={cn("text-3xl font-black mt-2", activeDetail === 'pending' ? "text-white" : "text-blue-600")}>R$ {financialStats.totalToReceive.toFixed(2)}</div>
                </div>
                {activeDetail === 'pending' && <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><Clock className="h-12 w-12 text-white" /></div>}
              </button>
            </div>

            {activeDetail && (
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900">
                    {activeDetail === 'total' ? 'Todos os Lançamentos' : activeDetail === 'received' ? 'Entradas Realizadas' : 'Contas Pendentes'}
                  </h3>
                  <Button variant="ghost" onClick={() => setActiveDetail(null)} className="h-8 text-xs font-bold text-slate-400 hover:text-red-500">Esconder Detalhes</Button>
                </div>

                <div className="grid gap-3">
                  {detailedList.length === 0 ? (
                    <div className="text-center py-10"><p className="text-slate-400 font-bold">Nenhum registro nesta categoria.</p></div>
                  ) : (
                    detailedList.map((item, idx) => {
                      if (!item) return null;
                      const balance = (Number(item.total) || 0) - (Number(item.paidAmount) || 0);
                      return (
                        <div key={idx} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", item.bg)}>
                              <item.displayIcon className={cn("h-6 w-6", item.color)} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-slate-900">{item.id || "S/ID"}</p>
                                <Badge variant="outline" className="text-[8px] font-black uppercase h-4 px-1.5 border-slate-200">{item.type}</Badge>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {item.client || item.clientName || "Cliente"} • {item.date || item.start || "Sem data"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase">Valor Total</p>
                              <p className="font-black text-slate-900">R$ {(Number(item.total) || 0).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase">Falta Receber</p>
                              <p className={cn("font-black", balance > 0.01 ? "text-red-600" : "text-emerald-600")}>
                                R$ {balance.toFixed(2)}
                              </p>
                            </div>
                            {balance > 0.01 && (
                              <Button 
                                onClick={() => handleOpenPayment(item)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 font-bold text-xs shadow-lg shadow-emerald-100"
                              >
                                Receber
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Equipamentos na Oficina</h3>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-none font-bold px-4 py-1.5 rounded-full">
                  {maintenanceEquipments.length} Itens
                </Badge>
              </div>

              {maintenanceEquipments.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Todos os equipamentos estão prontos!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {maintenanceEquipments.map((e) => (
                    <div key={e.id} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                          <Hammer className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{e.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.serialNumber}</p>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/equipamentos')} variant="outline" className="rounded-xl h-10 px-4 font-bold text-xs gap-2">
                        Ver Detalhes <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-none shadow-xl rounded-[3rem] p-10 bg-white">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center"><Settings2 className="h-7 w-7 text-blue-600" /></div>
                <div><h3 className="text-2xl font-black text-slate-900">Dados Financeiros</h3><p className="text-slate-500 font-medium">Configure sua chave Pix para recebimentos.</p></div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2"><Label className="font-bold">Chave Pix</Label><Input value={pixInfo.key} onChange={e => setPixInfo({...pixInfo, key: e.target.value})} className="h-12 rounded-xl"/></div>
                <div className="space-y-2"><Label className="font-bold">Favorecido</Label><Input value={pixInfo.name} onChange={e => setPixInfo({...pixInfo, name: e.target.value})} className="h-12 rounded-xl"/></div>
                <div className="space-y-2"><Label className="font-bold">Banco</Label><Input value={pixInfo.bank} onChange={e => setPixInfo({...pixInfo, bank: e.target.value})} className="h-12 rounded-xl"/></div>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100">
                <Button onClick={handleSavePix} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl h-14 px-10 font-black gap-2 shadow-xl shadow-blue-100"><Save className="h-5 w-5" /> Salvar</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PaymentActionDialog 
        open={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen} 
        item={selectedItem} 
        onConfirm={handleConfirmPayment} 
      />
    </AppLayout>
  );
};

export default ReportsPage;