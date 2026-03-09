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
  AlertCircle, CheckCircle2, Clock, FileText, Download, Settings2, ShoppingBag, ArrowRight, SearchX, ArrowLeft, Save, CreditCard, Wrench, Package, PackageX
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Equipment } from '@/components/EquipmentCard';
import { Product } from '@/components/ProductCard';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import PaymentActionDialog from '@/components/PaymentActionDialog';

const ReportsPage = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const [pixInfo, setPixInfo] = useState({ key: "16403481000116", name: "BTM Design", bank: "CC Crediplus" });
  const navigate = useNavigate();

  const loadData = () => {
    try {
      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip) setEquipments(JSON.parse(savedEquip));
      
      const savedProd = localStorage.getItem('app_products');
      if (savedProd) setProducts(JSON.parse(savedProd));

      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals) setRentals(JSON.parse(savedRentals));
      
      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      
      const savedPix = localStorage.getItem('app_pix_info');
      if (savedPix) setPixInfo(JSON.parse(savedPix));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('order-placed', loadData);
    return () => window.removeEventListener('order-placed', loadData);
  }, []);

  const handleSavePix = () => {
    localStorage.setItem('app_pix_info', JSON.stringify(pixInfo));
    showSuccess("Configurações de Pix atualizadas!");
    window.dispatchEvent(new Event('pix-updated'));
  };

  const maintenanceEquipments = useMemo(() => {
    return (equipments || []).filter(e => e && e.status === 'maintenance');
  }, [equipments]);

  const lowStockProducts = useMemo(() => {
    return (products || []).filter(p => p && (p.stock || 0) <= 5);
  }, [products]);

  const financialStats = useMemo(() => {
    const safeRentals = Array.isArray(rentals) ? rentals : [];
    const safeOrders = Array.isArray(orders) ? orders : [];
    const totalReceived = [...safeRentals, ...safeOrders].reduce((acc, item) => acc + (Number(item?.paidAmount) || 0), 0);
    const totalToReceive = [...safeRentals, ...safeOrders].reduce((acc, item) => {
      const balance = (Number(item?.total) || 0) - (Number(item?.paidAmount) || 0);
      return acc + Math.max(0, balance);
    }, 0);
    return { totalReceived, totalToReceive, grandTotal: totalReceived + totalToReceive };
  }, [rentals, orders]);

  const handleOpenPayment = (item: any) => {
    setSelectedItem(item);
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (amountToPay: number) => {
    if (!selectedItem) return;
    const key = selectedItem.type === 'Venda' ? 'app_orders' : 'app_rentals';
    const saved = localStorage.getItem(key);
    if (saved) {
      const current = JSON.parse(saved);
      const updated = current.map((o: any) => {
        if (o.id === selectedItem.id) {
          const nextPaid = Number(o.paidAmount || 0) + amountToPay;
          return { ...o, paidAmount: nextPaid, status: nextPaid >= (Number(o.total) || 0) - 0.01 ? (key === 'app_orders' ? 'Pago' : 'completed') : o.status };
        }
        return o;
      });
      localStorage.setItem(key, JSON.stringify(updated));
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
            <h2 className="text-3xl font-black text-slate-900">Relatórios & Inteligência</h2>
            <p className="text-slate-500 font-medium">Gestão administrativa e financeira consolidada</p>
          </div>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold gap-2 h-12 px-6">
            <Download className="h-5 w-5" /> Exportar Relatório
          </Button>
        </div>

        <Tabs defaultValue="financial" className="space-y-8">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-fit">
            <TabsTrigger value="financial" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Financeiro</TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Estoque Crítico</TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Oficina</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <Card onClick={() => setActiveDetail('total')} className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white cursor-pointer hover:scale-[1.02] transition-transform">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Total</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-black">R$ {financialStats.grandTotal.toFixed(2)}</div></CardContent>
              </Card>
              <Card onClick={() => setActiveDetail('received')} className="border-none shadow-sm rounded-[2.5rem] bg-white cursor-pointer hover:scale-[1.02] transition-transform">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Já Recebidos (Caixa)</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-black text-emerald-600">R$ {financialStats.totalReceived.toFixed(2)}</div></CardContent>
              </Card>
              <Card onClick={() => setActiveDetail('toReceive')} className="border-none shadow-sm rounded-[2.5rem] bg-white cursor-pointer hover:scale-[1.02] transition-transform">
                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo a Receber</CardTitle></CardHeader>
                <CardContent><div className="text-3xl font-black text-blue-600">R$ {financialStats.totalToReceive.toFixed(2)}</div></CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                    <PackageX className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Alerta de Estoque Crítico</h3>
                </div>
                <Badge className="bg-rose-100 text-rose-700 border-none font-bold px-4 py-1.5 rounded-full">
                  {lowStockProducts.length} Produtos Abaixo do Mínimo
                </Badge>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="text-center py-20 bg-emerald-50 rounded-[2.5rem] border border-dashed border-emerald-200">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-emerald-700 font-bold">Todos os produtos possuem estoque saudável!</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{p.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.code} • {p.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={cn("text-xl font-black", (p.stock || 0) === 0 ? "text-rose-600" : "text-amber-600")}>
                            {p.stock} {p.unitLabel || 'un'}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400">Restante</p>
                        </div>
                        <Button onClick={() => navigate('/loja')} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-4 font-bold text-xs gap-2">
                          Repor <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Itens em Manutenção</h3>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-none font-bold px-4 py-1.5 rounded-full">
                  {maintenanceEquipments.length} Itens na Oficina
                </Badge>
              </div>

              {maintenanceEquipments.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Todas as ferramentas estão prontas para locação!</p>
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.serialNumber} • {e.category}</p>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/equipamentos')} variant="outline" className="rounded-xl h-10 px-4 font-bold text-xs gap-2">
                        Ver no Inventário <ArrowRight className="h-4 w-4" />
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
                <div><h3 className="text-2xl font-black text-slate-900">Configurações de Pagamento</h3><p className="text-slate-500 font-medium">Dados para finalização de pedidos via Pix.</p></div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2"><Label className="font-bold">Chave Pix</Label><Input value={pixInfo.key} onChange={e => setPixInfo({...pixInfo, key: e.target.value})} className="h-12 rounded-xl"/></div>
                <div className="space-y-2"><Label className="font-bold">Favorecido</Label><Input value={pixInfo.name} onChange={e => setPixInfo({...pixInfo, name: e.target.value})} className="h-12 rounded-xl"/></div>
                <div className="space-y-2"><Label className="font-bold">Banco</Label><Input value={pixInfo.bank} onChange={e => setPixInfo({...pixInfo, bank: e.target.value})} className="h-12 rounded-xl"/></div>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100">
                <Button onClick={handleSavePix} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl h-14 px-10 font-black gap-2 shadow-xl shadow-blue-100"><Save className="h-5 w-5" /> Salvar Configurações</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PaymentActionDialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} item={selectedItem} onConfirm={handleConfirmPayment} />
    </AppLayout>
  );
};

export default ReportsPage;