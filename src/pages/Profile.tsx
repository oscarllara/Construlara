"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, Mail, Phone, Receipt, Calendar, 
  ShoppingBag, Package, Camera,
  DollarSign, Wallet, 
  Save, Eye, Send, Pencil, Instagram, Facebook
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import RentalDetailsDialog from '@/components/RentalDetailsDialog';
import PaymentActionDialog from '@/components/PaymentActionDialog';

const ProfilePage = () => {
  const [userData, setUserData] = useState<any>(null);
  const [userRentals, setUserRentals] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFinanceTab, setActiveFinanceTab] = useState<'all' | 'pending' | 'paid'>('all');
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [isRentalDialogOpen, setIsRentalDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadProfileData = () => {
    const email = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
    if (!email) {
      navigate('/login');
      return;
    }

    try {
      const savedUsers = localStorage.getItem('app_users');
      const savedRentals = localStorage.getItem('app_rentals');
      const savedOrders = localStorage.getItem('app_orders');

      let foundUser: any = null;
      if (savedUsers) {
        const users: any[] = JSON.parse(savedUsers);
        foundUser = users.find(u => (u.email || "").toLowerCase().trim() === email);
      }

      // Fallback para usuário logado se não encontrado na lista (ex: admin de teste)
      if (!foundUser) {
        foundUser = { 
          name: localStorage.getItem('userName') || "Usuário", 
          email: email, 
          role: localStorage.getItem('userRole') || "Visitante",
          whatsapp: "" 
        };
      }

      setUserData({
        ...foundUser,
        avatar: foundUser.avatar || null,
        cep: foundUser.cep || "",
        facebook: foundUser.facebook || "https://facebook.com/",
        instagram: foundUser.instagram || "https://instagram.com/"
      });

      if (savedRentals) {
        const rentals = JSON.parse(savedRentals);
        const filtered = Array.isArray(rentals) ? rentals.filter((r: any) => 
          r && (
            (r.clientId && r.clientId === foundUser?.id) || 
            (r.clientEmail && r.clientEmail.toLowerCase().trim() === email) ||
            (r.client && r.client.toLowerCase() === (foundUser?.name || "").toLowerCase())
          )
        ) : [];
        setUserRentals(filtered);
      }

      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const filtered = Array.isArray(orders) ? orders.filter((o: any) => 
          o && (o.userEmail || '').toLowerCase().trim() === email
        ) : [];
        setUserOrders(filtered);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do perfil:", e);
      showError("Erro ao carregar seus dados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const financialSummary = useMemo(() => {
    const shopTotal = userOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const shopPaid = userOrders.reduce((acc, o) => acc + (Number(o.paidAmount) || 0), 0);
    const rentalTotal = userRentals.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
    const rentalPaid = userRentals.reduce((acc, r) => acc + (Number(r.paidAmount) || 0), 0);

    const movements = [
      ...userOrders.map(o => ({ ...o, type: 'order', label: 'Compra', description: `Pedido ${o.id}` })),
      ...userRentals.map(r => ({ ...r, type: 'rental', label: 'Aluguel', description: r.item }))
    ].sort((a, b) => {
      const dateA = new Date(a.date || a.start || 0).getTime();
      const dateB = new Date(b.date || b.start || 0).getTime();
      return dateB - dateA;
    });

    return { 
      total: shopTotal + rentalTotal, 
      paid: shopPaid + rentalPaid, 
      pending: Math.max(0, (shopTotal + rentalTotal) - (shopPaid + rentalPaid)), 
      movements 
    };
  }, [userOrders, userRentals]);

  const filteredMovements = useMemo(() => {
    if (activeFinanceTab === 'pending') return financialSummary.movements.filter(m => (Number(m.total) || 0) > (Number(m.paidAmount) || 0));
    if (activeFinanceTab === 'paid') return financialSummary.movements.filter(m => (Number(m.total) || 0) <= (Number(m.paidAmount) || 0) && Number(m.total) > 0);
    return financialSummary.movements;
  }, [financialSummary, activeFinanceTab]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      try {
        const users: any[] = JSON.parse(savedUsers);
        const index = users.findIndex(u => (u.email || "").toLowerCase().trim() === userData.email.toLowerCase().trim());
        if (index > -1) {
          users[index] = { ...userData };
          localStorage.setItem('app_users', JSON.stringify(users));
          showSuccess("Perfil atualizado!");
        }
      } catch (e) { showError("Falha ao salvar."); }
    }
  };

  const handleConfirmPayment = (amount: number) => {
    if (!selectedMovement) return;
    
    try {
      if (selectedMovement.type === 'order') {
        const saved = localStorage.getItem('app_orders');
        if (saved) {
          const orders = JSON.parse(saved);
          const updated = orders.map((o: any) => o.id === selectedMovement.id ? { ...o, paidAmount: (Number(o.paidAmount) || 0) + amount } : o);
          localStorage.setItem('app_orders', JSON.stringify(updated));
        }
      } else {
        const saved = localStorage.getItem('app_rentals');
        if (saved) {
          const rentals = JSON.parse(saved);
          const updated = rentals.map((r: any) => r.id === selectedMovement.id ? { ...r, paidAmount: (Number(r.paidAmount) || 0) + amount } : r);
          localStorage.setItem('app_rentals', JSON.stringify(updated));
        }
      }
      showSuccess("Pagamento registrado!");
      setIsPaymentDialogOpen(false);
      loadProfileData();
    } catch (e) { showError("Falha ao processar."); }
  };

  if (isLoading || !userData) return <div className="min-h-screen flex items-center justify-center">Carregando perfil...</div>;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white text-center p-8 relative">
              <div className="h-32 bg-blue-700 absolute inset-0"></div>
              <div className="relative z-10 pt-16">
                <div className="h-32 w-32 rounded-[2rem] bg-white p-1.5 shadow-2xl mx-auto group cursor-pointer relative" onClick={() => fileInputRef.current?.click()}>
                  <div className="h-full w-full rounded-[1.8rem] bg-slate-100 flex items-center justify-center overflow-hidden">
                    {userData.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : <User className="h-16 w-16 text-slate-300" />}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-[1.8rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white h-8 w-8" />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setUserData({ ...userData, avatar: reader.result as string });
                    reader.readAsDataURL(file);
                  }
                }} />
                <h2 className="text-2xl font-black text-slate-900 mt-6">{userData.name}</h2>
                <Badge className="bg-blue-100 text-blue-700 border-none rounded-xl font-bold px-6 py-1 mt-2">{userData.role}</Badge>
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[3rem] bg-slate-900 text-white p-8 space-y-6">
              <div className="flex items-center gap-3 text-emerald-400"><Wallet className="h-6 w-6" /><h3 className="font-black text-lg">Finanças</h3></div>
              <div className="space-y-4">
                <div className="flex justify-between items-end"><span className="text-[10px] font-black text-slate-400 uppercase">A Pagar</span><span className="text-2xl font-black text-red-400">R$ {financialSummary.pending.toFixed(2)}</span></div>
                <div className="flex justify-between items-end"><span className="text-[10px] font-black text-emerald-400 uppercase">Já Pagos</span><span className="text-xl font-black text-emerald-400">R$ {financialSummary.paid.toFixed(2)}</span></div>
              </div>
            </Card>
          </div>

          <div className="flex-1">
            <Tabs defaultValue="data" className="space-y-6">
              <TabsList className="bg-white p-1 rounded-[2rem] h-16 w-full shadow-sm">
                <TabsTrigger value="data" className="flex-1 rounded-2xl font-bold">Meus Dados</TabsTrigger>
                <TabsTrigger value="orders" className="flex-1 rounded-2xl font-bold">Pedidos</TabsTrigger>
                <TabsTrigger value="rentals" className="flex-1 rounded-2xl font-bold">Contratos</TabsTrigger>
                <TabsTrigger value="finance" className="flex-1 rounded-2xl font-bold">Financeiro</TabsTrigger>
              </TabsList>

              <TabsContent value="data">
                <form onSubmit={handleUpdateProfile} className="bg-white p-10 rounded-[3rem] shadow-sm space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="font-bold">Nome Completo</Label><Input value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} className="h-12 rounded-xl" /></div>
                    <div className="space-y-2"><Label className="font-bold">WhatsApp</Label><Input value={userData.whatsapp} onChange={e => setUserData({...userData, whatsapp: e.target.value})} className="h-12 rounded-xl" /></div>
                    <div className="space-y-2"><Label className="font-bold">E-mail</Label><Input value={userData.email} disabled className="h-12 rounded-xl bg-slate-50" /></div>
                  </div>
                  <Button type="submit" className="bg-blue-700 w-full h-14 rounded-2xl font-black text-lg shadow-xl"><Save className="mr-2" /> Salvar Alterações</Button>
                </form>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {userOrders.length === 0 ? <p className="text-center py-10">Nenhum pedido realizado.</p> : userOrders.map(order => (
                  <Card key={order.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4"><div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Package className="h-6 w-6" /></div><div><h4 className="font-black">{order.id}</h4><p className="text-[10px] font-bold text-slate-400 uppercase">{order.date}</p></div></div>
                    <div className="text-right">
                      <p className="text-lg font-black">R$ {Number(order.total || 0).toFixed(2)}</p>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const items = order.items?.map((it: any) => `• ${it.name} (${it.quantity})`).join('%0A') || '';
                        window.open(`https://wa.me/5532999625979?text=*PEDIDO:* ${order.id}%0A${items}`, '_blank');
                      }}><Send className="h-4 w-4 mr-1 text-emerald-600" /> WhatsApp</Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="rentals" className="space-y-4">
                {userRentals.length === 0 ? <p className="text-center py-10">Nenhum contrato ativo.</p> : userRentals.map(rental => (
                  <Card key={rental.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4"><div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><Calendar className="h-6 w-6" /></div><div><h4 className="font-black">{rental.item}</h4><p className="text-[10px] font-bold text-slate-400">Vence em: {rental.end}</p></div></div>
                    <Button onClick={() => { setSelectedRental(rental); setIsRentalDialogOpen(true); }} className="bg-blue-600 rounded-xl"><Eye className="mr-2 h-4 w-4" /> Ver</Button>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="finance" className="space-y-4">
                <div className="flex gap-2"><Button variant={activeFinanceTab === 'all' ? 'default' : 'outline'} onClick={() => setActiveFinanceTab('all')}>Tudo</Button><Button variant={activeFinanceTab === 'pending' ? 'default' : 'outline'} onClick={() => setActiveFinanceTab('pending')}>A Pagar</Button></div>
                {filteredMovements.map(move => {
                  const balance = (Number(move.total) || 0) - (Number(move.paidAmount) || 0);
                  return (
                    <Card key={move.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4"><div><h4 className="font-black">{move.id}</h4><p className="text-xs font-bold text-slate-400">{move.label}</p></div></div>
                      <div className="text-right">
                        <p className={cn("text-lg font-black", balance <= 0 ? "text-emerald-600" : "text-red-600")}>R$ {balance <= 0 ? (Number(move.total) || 0).toFixed(2) : balance.toFixed(2)}</p>
                        {balance > 0 && <Button size="sm" onClick={() => { setSelectedMovement(move); setIsPaymentDialogOpen(true); }} className="bg-emerald-600 h-8">Pagar</Button>}
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <RentalDetailsDialog rental={selectedRental} open={isRentalDialogOpen} onOpenChange={setIsRentalDialogOpen} onUpdate={loadProfileData} />
      <PaymentActionDialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} item={selectedMovement} onConfirm={handleConfirmPayment} />
    </AppLayout>
  );
};

export default ProfilePage;