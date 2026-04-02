"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Hammer, Receipt, DollarSign, TrendingUp, 
  AlertCircle, CheckCircle2, Clock, FileText, Download, Settings2, ShoppingBag, ArrowRight, SearchX, ArrowLeft, Save, CreditCard, Wrench, Package, Megaphone
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  const [bannerConfig, setBannerConfig] = useState({ active: false, text: "", link: "", color: "bg-blue-700" });
  
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
      if (savedPix) setPixInfo(JSON.parse(savedPix));

      const savedBanner = localStorage.getItem('app_promo_banner');
      if (savedBanner) setBannerConfig(JSON.parse(savedBanner));
    } catch (e) { }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePix = () => {
    localStorage.setItem('app_pix_info', JSON.stringify(pixInfo));
    showSuccess("Configurações de Pix atualizadas!");
  };

  const handleSaveBanner = () => {
    localStorage.setItem('app_promo_banner', JSON.stringify(bannerConfig));
    window.dispatchEvent(new Event('banner-updated'));
    showSuccess("Banner promocional atualizado!");
  };

  const maintenanceEquipments = useMemo(() => {
    return (equipments || []).filter(e => e && e.status === 'maintenance');
  }, [equipments]);

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

  const detailedList = useMemo(() => {
    if (!activeDetail) return [];
    const all = [
      ...orders.map(o => ({ ...o, type: 'Venda', displayIcon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' })),
      ...rentals.map(r => ({ ...r, type: 'Aluguel', displayIcon: Receipt, color: 'text-orange-600', bg: 'bg-orange-50' }))
    ];
    if (activeDetail === 'received') return all.filter(item => (Number(item.paidAmount) || 0) > 0);
    if (activeDetail === 'pending') return all.filter(item => (Number(item.total) || 0) > (Number(item.paidAmount) || 0));
    return all;
  }, [activeDetail, orders, rentals]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Painel Administrativo</h2>
            <p className="text-slate-500 font-medium">Gestão financeira e operacional</p>
          </div>
        </div>

        <Tabs defaultValue="financial" className="space-y-8">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-fit">
            <TabsTrigger value="financial" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Financeiro</TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Oficina</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-8 font-bold data-[state=active]:bg-white">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <button onClick={() => setActiveDetail('total')} className="text-left p-8 rounded-[2.5rem] border bg-white hover:border-slate-300 transition-all">
                <p className="text-[10px] font-black uppercase text-slate-400">Faturamento Total</p>
                <div className="text-3xl font-black mt-2 text-slate-900">R$ {financialStats.grandTotal.toFixed(2)}</div>
              </button>
              <button onClick={() => setActiveDetail('received')} className="text-left p-8 rounded-[2.5rem] border bg-white hover:border-emerald-200 transition-all">
                <p className="text-[10px] font-black uppercase text-slate-400">Já Recebidos</p>
                <div className="text-3xl font-black mt-2 text-emerald-600">R$ {financialStats.totalReceived.toFixed(2)}</div>
              </button>
              <button onClick={() => setActiveDetail('pending')} className="text-left p-8 rounded-[2.5rem] border bg-white hover:border-blue-200 transition-all">
                <p className="text-[10px] font-black uppercase text-slate-400">Saldo a Receber</p>
                <div className="text-3xl font-black mt-2 text-blue-600">R$ {financialStats.totalToReceive.toFixed(2)}</div>
              </button>
            </div>

            {activeDetail && (
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900">Detalhes do Financeiro</h3>
                  <Button variant="ghost" onClick={() => setActiveDetail(null)} className="h-8 text-xs font-bold text-slate-400">Esconder</Button>
                </div>
                <div className="grid gap-3">
                  {detailedList.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", item.bg)}>
                          <item.displayIcon className={cn("h-6 w-6", item.color)} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{item.id}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{item.client || item.clientName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">R$ {Number(item.total).toFixed(2)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Pago: R$ {Number(item.paidAmount).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-2xl font-black text-slate-900">Equipamentos na Oficina</h3>
              {maintenanceEquipments.length === 0 ? (
                <p className="text-slate-500 font-bold text-center py-10">Nenhum item em manutenção.</p>
              ) : (
                <div className="grid gap-3">
                  {maintenanceEquipments.map((e) => (
                    <div key={e.id} className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Hammer className="h-6 w-6 text-slate-400" />
                        <div>
                          <p className="font-black text-slate-900">{e.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{e.serialNumber}</p>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/equipamentos')} variant="outline" className="rounded-xl h-10 px-4 font-bold text-xs">Ver Detalhes</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            {/* Banner Config */}
            <Card className="border-none shadow-xl rounded-[3rem] p-10 bg-white">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center"><Megaphone className="h-7 w-7 text-orange-600" /></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Banner Promocional</h3>
                  <p className="text-slate-500 font-medium">Configure um aviso em destaque no topo do site.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <Label className="font-black text-slate-900">Ativar Banner</Label>
                    <p className="text-xs text-slate-500 font-medium">Exibir o banner para todos os usuários.</p>
                  </div>
                  <Switch 
                    checked={bannerConfig.active} 
                    onCheckedChange={(v) => setBannerConfig({...bannerConfig, active: v})}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Texto do Banner</Label>
                    <Input 
                      placeholder="Ex: Promoção de Pisos: 20% OFF!" 
                      value={bannerConfig.text} 
                      onChange={e => setBannerConfig({...bannerConfig, text: e.target.value})} 
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Link (Opcional)</Label>
                    <Input 
                      placeholder="Ex: /loja?category=Pisos" 
                      value={bannerConfig.link} 
                      onChange={e => setBannerConfig({...bannerConfig, link: e.target.value})} 
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Cor de Fundo</Label>
                  <div className="flex gap-3">
                    {['bg-blue-700', 'bg-red-600', 'bg-emerald-600', 'bg-slate-900', 'bg-orange-600'].map(color => (
                      <button 
                        key={color}
                        onClick={() => setBannerConfig({...bannerConfig, color})}
                        className={cn(
                          "h-10 w-10 rounded-full border-4 transition-all",
                          color,
                          bannerConfig.color === color ? "border-white shadow-lg scale-110" : "border-transparent"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={handleSaveBanner} className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl h-14 px-10 font-black gap-2 shadow-xl shadow-orange-100">
                  <Save className="h-5 w-5" /> Salvar Banner
                </Button>
              </div>
            </Card>

            {/* Pix Config */}
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
                <Button onClick={handleSavePix} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl h-14 px-10 font-black gap-2 shadow-xl shadow-blue-100"><Save className="h-5 w-5" /> Salvar Pix</Button>
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