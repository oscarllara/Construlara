"use client";

import React, { useMemo, useState } from 'react';
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
import { ShoppingBag, Receipt, DollarSign, CheckCircle2, AlertCircle, History, ArrowRight } from 'lucide-react';
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

  const financialData = useMemo(() => {
    if (!user) return { pending: [], received: [], totals: { shop: 0, rental: 0 } };

    try {
      const savedOrders = localStorage.getItem('app_orders');
      const savedRentals = localStorage.getItem('app_rentals');
      
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      const rentals = savedRentals ? JSON.parse(savedRentals) : [];

      if (!Array.isArray(orders) || !Array.isArray(rentals)) {
        return { pending: [], received: [], totals: { shop: 0, rental: 0 } };
      }

      const userEmail = (user.email || "").toLowerCase();

      const userOrders = orders.filter((o: any) => o && (o.userEmail || "").toLowerCase() === userEmail);
      const userRentals = rentals.filter((r: any) => r && (r.clientId === user.id || (r.client || "").toLowerCase() === (user.name || "").toLowerCase()));

      const pendingOrders = userOrders.filter((o: any) => o.status !== 'Entregue' && o.status !== 'Pago');
      const receivedOrders = userOrders.filter((o: any) => o.status === 'Entregue' || o.status === 'Pago');

      const pendingRentals = userRentals.filter((r: any) => r.status !== 'completed');
      const receivedRentals = userRentals.filter((r: any) => r.status === 'completed');

      const totalShop = pendingOrders.reduce((acc: number, o: any) => acc + ((Number(o.total) || 0) - (Number(o.paidAmount) || 0)), 0);
      const totalRental = pendingRentals.reduce((acc: number, r: any) => acc + ((Number(r.total) || 0) - (Number(r.paidAmount) || 0)), 0);

      return {
        pending: [
          ...pendingOrders.map((o: any) => ({ ...o, type: 'order', displayType: 'Compra' })),
          ...pendingRentals.map((r: any) => ({ ...r, type: 'rental', displayType: 'Aluguel' }))
        ],
        received: [
          ...receivedOrders.map((o: any) => ({ ...o, type: 'order', displayType: 'Compra' })),
          ...receivedRentals.map((r: any) => ({ ...r, type: 'rental', displayType: 'Aluguel' }))
        ],
        totals: { shop: totalShop, rental: totalRental }
      };
    } catch (e) {
      console.error("Erro ao processar dados financeiros:", e);
      return { pending: [], received: [], totals: { shop: 0, rental: 0 } };
    }
  }, [user, open]);

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
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                  <DollarSign className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">{user.name}</h2>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Extrato Financeiro Consolidado</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Débito Total</p>
                <p className="text-3xl font-black text-red-500">R$ {(financialData.totals.shop + financialData.totals.rental).toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-[10px] font-black text-slate-300 uppercase">Compras na Loja</span>
                </div>
                <p className="text-xl font-black text-white">R$ {financialData.totals.shop.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-[10px] font-black text-slate-300 uppercase">Contratos de Aluguel</span>
                </div>
                <p className="text-xl font-black text-white">R$ {financialData.totals.rental.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <Tabs defaultValue="pending" className="space-y-6">
              <TabsList className="bg-slate-100 p-1 rounded-2xl h-12 w-fit">
                <TabsTrigger value="pending" className="rounded-xl px-6 font-bold data-[state=active]:bg-white">
                  Contas a Receber ({financialData.pending.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-xl px-6 font-bold data-[state=active]:bg-white">
                  Histórico de Recebidos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {financialData.pending.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                    <p className="font-bold text-slate-500">Este cliente não possui débitos pendentes.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {financialData.pending.map((item: any) => {
                      const remaining = item.total - (item.paidAmount || 0);
                      return (
                        <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-12 w-12 rounded-xl flex items-center justify-center",
                              item.type === 'order' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                            )}>
                              {item.type === 'order' ? <ShoppingBag className="h-6 w-6" /> : <Receipt className="h-6 w-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-slate-900">{item.id}</p>
                                <Badge variant="outline" className="text-[9px] font-black uppercase rounded-lg px-2 h-4">{item.displayType}</Badge>
                              </div>
                              <p className="text-xs font-bold text-slate-400">{item.date || item.start || 'Data não inf.'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-lg font-black text-red-600">R$ {remaining.toFixed(2)}</p>
                              {item.paidAmount > 0 && (
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Restante de R$ {item.total.toFixed(2)}</p>
                              )}
                              <Badge className="bg-red-50 text-red-700 border-none text-[8px] font-black uppercase">Pendente</Badge>
                            </div>
                            <Button 
                              onClick={() => handleOpenPayment(item)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-10 px-4 text-xs gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" /> Receber
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {financialData.received.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="font-bold text-slate-400">Nenhum pagamento registrado ainda.</p>
                    </div>
                  ) : (
                    financialData.received.map((item: any) => (
                      <div key={item.id} className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between opacity-80">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-100">
                            {item.type === 'order' ? <ShoppingBag className="h-5 w-5 text-slate-400" /> : <Receipt className="h-5 w-5 text-slate-400" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700">{item.id}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.displayType} • Pago</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-slate-900">R$ {(Number(item.total) || 0).toFixed(2)}</p>
                          <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] font-black uppercase">Recebido</Badge>
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