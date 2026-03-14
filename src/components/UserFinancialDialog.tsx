"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAccount } from './UserTable';
import { ShoppingBag, Receipt, DollarSign, CheckCircle2, AlertCircle, History, ArrowRight, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaymentActionDialog from './PaymentActionDialog';

interface UserFinancialDialogProps {
  user: UserAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsPaid: (type: 'order' | 'rental', id: string, amount?: number) => void;
}

const UserFinancialDialog = ({ user, open, onOpenChange, onMarkAsPaid }: UserFinancialDialogProps) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'order' | 'rental'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Escuta atualizações de pedidos e aluguéis para atualizar os valores em tempo real
  useEffect(() => {
    const handleRefresh = () => setRefreshKey(prev => prev + 1);
    window.addEventListener('order-placed', handleRefresh);
    window.addEventListener('storage', handleRefresh);
    return () => {
      window.removeEventListener('order-placed', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, []);

  const financialData = useMemo(() => {
    if (!user) return { pending: [], received: [], stats: { shop: { p: 0, r: 0 }, rental: { p: 0, r: 0 } } };

    try {
      const savedOrders = localStorage.getItem('app_orders');
      const savedRentals = localStorage.getItem('app_rentals');
      
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      const rentals = savedRentals ? JSON.parse(savedRentals) : [];

      if (!Array.isArray(orders) || !Array.isArray(rentals)) {
        return { pending: [], received: [], stats: { shop: { p: 0, r: 0 }, rental: { p: 0, r: 0 } } };
      }

      const userEmail = (user.email || "").toLowerCase();

      const userOrders = orders.filter((o: any) => o && (o.userEmail || "").toLowerCase() === userEmail);
      const userRentals = rentals.filter((r: any) => r && (r.clientId === user.id || (r.client || "").toLowerCase() === (user.name || "").toLowerCase()));

      const pendingOrders = userOrders.filter((o: any) => (Number(o.total) || 0) > (Number(o.paidAmount) || 0));
      const pendingRentals = userRentals.filter((r: any) => (Number(r.total) || 0) > (Number(r.paidAmount) || 0));

      const receivedOrders = userOrders.filter((o: any) => (Number(o.total) || 0) <= (Number(o.paidAmount) || 0) && Number(o.total) > 0);
      const receivedRentals = userRentals.filter((r: any) => (Number(r.total) || 0) <= (Number(r.paidAmount) || 0) && Number(r.total) > 0);

      const shopP = pendingOrders.reduce((acc: number, o: any) => acc + ((Number(o.total) || 0) - (Number(o.paidAmount) || 0)), 0);
      const shopR = userOrders.reduce((acc: number, o: any) => acc + (Number(o.paidAmount) || 0), 0);
      
      const rentalP = pendingRentals.reduce((acc: number, r: any) => acc + ((Number(r.total) || 0) - (Number(r.paidAmount) || 0)), 0);
      const rentalR = userRentals.reduce((acc: number, r: any) => acc + (Number(r.paidAmount) || 0), 0);

      const allPending = [
        ...pendingOrders.map((o: any) => ({ ...o, type: 'order', displayType: 'Compra' })),
        ...pendingRentals.map((r: any) => ({ ...r, type: 'rental', displayType: 'Aluguel' }))
      ];

      const allReceived = [
        ...receivedOrders.map((o: any) => ({ ...o, type: 'order', displayType: 'Compra' })),
        ...receivedRentals.map((r: any) => ({ ...r, type: 'rental', displayType: 'Aluguel' }))
      ];

      return {
        pending: categoryFilter === 'all' ? allPending : allPending.filter(i => i.type === categoryFilter),
        received: categoryFilter === 'all' ? allReceived : allReceived.filter(i => i.type === categoryFilter),
        stats: {
          shop: { p: shopP, r: shopR },
          rental: { p: rentalP, r: rentalR }
        }
      };
    } catch (e) {
      return { pending: [], received: [], stats: { shop: { p: 0, r: 0 }, rental: { p: 0, r: 0 } } };
    }
  }, [user, open, categoryFilter, refreshKey]);

  const handleOpenPayment = (item: any) => {
    setSelectedItem({
      ...item,
      client: user?.name || "",
      description: item.displayType === 'Compra' ? `Pedido ${item.id}` : item.item
    });
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (amount: number) => {
    if (selectedItem) {
      onMarkAsPaid(selectedItem.type, selectedItem.id, amount);
      setIsPaymentDialogOpen(false);
      setRefreshKey(prev => prev + 1); // Força atualização local imediata
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white flex flex-col">
          <div className="bg-slate-900 p-6 text-white shrink-0">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black truncate max-w-[200px]">{user.name}</h2>
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Extrato Financeiro</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase">Dívida Total</p>
                <p className="text-2xl font-black text-red-500">R$ {(financialData.stats.shop.p + financialData.stats.rental.p).toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setCategoryFilter(categoryFilter === 'order' ? 'all' : 'order')}
                className={cn(
                  "p-4 rounded-[1.5rem] border transition-all text-left relative group",
                  categoryFilter === 'order' 
                    ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40" 
                    : "bg-blue-600/10 border-blue-500/20 hover:bg-blue-600/20"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center transition-colors", categoryFilter === 'order' ? "bg-white text-blue-700" : "bg-blue-500 text-white")}>
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", categoryFilter === 'order' ? "text-white" : "text-blue-200")}>Compras</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className={cn("text-[8px] font-black uppercase", categoryFilter === 'order' ? "text-blue-100" : "text-blue-300/60")}>A Receber</p>
                    <p className="text-sm font-black">R$ {financialData.stats.shop.p.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className={cn("text-[8px] font-black uppercase", categoryFilter === 'order' ? "text-blue-100" : "text-blue-300/60")}>Recebido</p>
                    <p className="text-sm font-black text-emerald-400">R$ {financialData.stats.shop.r.toFixed(2)}</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setCategoryFilter(categoryFilter === 'rental' ? 'all' : 'rental')}
                className={cn(
                  "p-4 rounded-[1.5rem] border transition-all text-left relative group",
                  categoryFilter === 'rental' 
                    ? "bg-orange-600 border-orange-500 shadow-lg shadow-orange-900/40" 
                    : "bg-orange-600/10 border-orange-500/20 hover:bg-orange-600/20"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center transition-colors", categoryFilter === 'rental' ? "bg-white text-orange-700" : "bg-orange-500 text-white")}>
                      <Receipt className="h-3.5 w-3.5" />
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", categoryFilter === 'rental' ? "text-white" : "text-orange-200")}>Aluguéis</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className={cn("text-[8px] font-black uppercase", categoryFilter === 'rental' ? "text-orange-100" : "text-orange-300/60")}>A Receber</p>
                    <p className="text-sm font-black">R$ {financialData.stats.rental.p.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className={cn("text-[8px] font-black uppercase", categoryFilter === 'rental' ? "text-orange-100" : "text-orange-300/60")}>Recebido</p>
                    <p className="text-sm font-black text-emerald-400">R$ {financialData.stats.rental.r.toFixed(2)}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <Tabs defaultValue="pending" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList className="bg-slate-100 p-1 rounded-xl h-10 w-fit">
                  <TabsTrigger value="pending" className="rounded-lg px-4 text-xs font-bold data-[state=active]:bg-white">
                    Aberto ({financialData.pending.length})
                  </TabsTrigger>
                  <TabsTrigger value="history" className="rounded-lg px-4 text-xs font-bold data-[state=active]:bg-white">
                    Pagos ({financialData.received.length})
                  </TabsTrigger>
                </TabsList>
                {categoryFilter !== 'all' && (
                  <Badge variant="outline" className="h-8 rounded-lg px-3 border-slate-200 text-slate-400 text-[10px] font-bold gap-2">
                    {categoryFilter === 'order' ? 'Compras' : 'Aluguéis'}
                    <button onClick={() => setCategoryFilter('all')} className="hover:text-red-500">
                      <FilterX className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>

              <TabsContent value="pending" className="space-y-3">
                {financialData.pending.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Nenhuma conta em aberto.</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {financialData.pending.map((item: any) => {
                      const remaining = item.total - (item.paidAmount || 0);
                      return (
                        <div key={item.id} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group hover:shadow-sm transition-all">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center",
                              item.type === 'order' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                            )}>
                              {item.type === 'order' ? <ShoppingBag className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-black text-slate-900">{item.id}</p>
                                <Badge className={cn(
                                  "text-[8px] font-black uppercase rounded px-1.5 h-3.5 border-none",
                                  item.type === 'order' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                                )}>{item.displayType}</Badge>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400">{item.date || item.start || '---'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-black text-red-600">R$ {remaining.toFixed(2)}</p>
                              {item.paidAmount > 0 && (
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Falta de R$ {item.total.toFixed(2)}</p>
                              )}
                            </div>
                            <Button 
                              onClick={() => handleOpenPayment(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold h-8 px-3 text-[10px] gap-1.5"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Receber
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-3">
                <div className="grid gap-2">
                  {financialData.received.length === 0 ? (
                    <div className="text-center py-10">
                      <History className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">Nenhum histórico.</p>
                    </div>
                  ) : (
                    financialData.received.map((item: any) => (
                      <div key={item.id} className="bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between opacity-80">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                            {item.type === 'order' ? <ShoppingBag className="h-4 w-4 text-slate-400" /> : <Receipt className="h-4 w-4 text-slate-400" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-700">{item.id}</p>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Pago em {item.date || item.end || '---'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">R$ {(Number(item.total) || 0).toFixed(2)}</p>
                          <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] font-black uppercase">Liquidado</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentActionDialog 
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        item={selectedItem}
        onConfirm={handleConfirmPayment}
      />
    </>
  );
};

export default UserFinancialDialog;