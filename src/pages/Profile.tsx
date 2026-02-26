"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, Mail, Phone, MapPin, Receipt, Calendar, 
  ShoppingBag, MessageCircle, Package, Camera,
  RefreshCw, DollarSign, Wallet, AlertCircle, CheckCircle2,
  Home, CreditCard, Facebook, Instagram, Save, History, LayoutGrid, Eye, Send, Pencil, ExternalLink, MoreVertical
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
  const [user, setUser] = useState<any>(null);
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

  // MÁSCARAS E FORMATAÇÃO
  const maskCPF = (val: string) => {
    return val.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})/, "$1-$2").slice(0, 14);
  };

  const maskPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    const clean = digits.startsWith("55") ? digits.slice(2) : digits;
    if (clean.length === 0) return "";
    if (clean.length <= 2) return `+55 (${clean}`;
    if (clean.length <= 7) return `+55 (${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `+55 (${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const maskCEP = (val: string) => {
    return val.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  const toTitleCase = (val: string) => {
    return val.replace(/\b\w/g, char => char.toUpperCase()).replace(/(\w)(\w+)/g, (match, p1, p2) => p1 + p2.toLowerCase());
  };

  const loadProfileData = () => {
    const email = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
    const savedUsers = localStorage.getItem('app_users');
    const savedRentals = localStorage.getItem('app_rentals');
    const savedOrders = localStorage.getItem('app_orders');

    if (!email) {
      navigate('/login');
      return;
    }

    let foundUser: any;
    if (savedUsers) {
      const users: any[] = JSON.parse(savedUsers);
      foundUser = users.find(u => u.email.toLowerCase().trim() === email);
    }

    if (foundUser) {
      setUser({
        ...foundUser,
        avatar: foundUser.avatar || null,
        cep: foundUser.cep || "",
        facebook: foundUser.facebook || "https://facebook.com/",
        instagram: foundUser.instagram || "https://instagram.com/"
      });
    }

    if (savedRentals) {
      const rentals = JSON.parse(savedRentals);
      const filtered = rentals.filter((r: any) => 
        (r.clientId && r.clientId === foundUser?.id) || 
        (r.clientEmail && r.clientEmail.toLowerCase().trim() === email) ||
        (r.client && r.client.toLowerCase() === (foundUser?.name || "").toLowerCase())
      );
      setUserRentals(filtered);
    }

    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      setUserOrders(orders.filter((o: any) => (o.userEmail || '').toLowerCase().trim() === email));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadProfileData();
    window.addEventListener('order-placed', loadProfileData);
    return () => window.removeEventListener('order-placed', loadProfileData);
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      const users: any[] = JSON.parse(savedUsers);
      const index = users.findIndex(u => u.email.toLowerCase().trim() === user.email.toLowerCase().trim());
      if (index > -1) {
        users[index] = { ...user };
        localStorage.setItem('app_users', JSON.stringify(users));
        showSuccess("Perfil atualizado!");
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, avatar: reader.result as string });
        showSuccess("Foto carregada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialFocus = (field: 'facebook' | 'instagram') => {
    const prefix = field === 'facebook' ? 'https://facebook.com/' : 'https://instagram.com/';
    if (!user[field] || user[field] === prefix) {
      setUser({ ...user, [field]: prefix });
    }
  };

  const financialSummary = useMemo(() => {
    const shopTotal = userOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const shopPaid = userOrders.reduce((acc, o) => acc + (Number(o.paidAmount) || 0), 0);
    const rentalTotal = userRentals.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
    const rentalPaid = userRentals.reduce((acc, r) => acc + (Number(r.paidAmount) || 0), 0);

    const movements = [
      ...userOrders.map(o => ({ ...o, type: 'order', label: 'Compra', description: `Pedido ${o.id}` })),
      ...userRentals.map(r => ({ ...r, type: 'rental', label: 'Aluguel', description: r.item }))
    ].sort((a, b) => new Date(b.date || b.start || 0).getTime() - new Date(a.date || a.start || 0).getTime());

    return { total: shopTotal + rentalTotal, paid: shopPaid + rentalPaid, pending: (shopTotal + rentalTotal) - (shopPaid + rentalPaid), movements };
  }, [userOrders, userRentals]);

  const filteredMovements = useMemo(() => {
    if (activeFinanceTab === 'pending') return financialSummary.movements.filter(m => (Number(m.total) || 0) > (Number(m.paidAmount) || 0));
    if (activeFinanceTab === 'paid') return financialSummary.movements.filter(m => (Number(m.total) || 0) <= (Number(m.paidAmount) || 0) && Number(m.total) > 0);
    return financialSummary.movements;
  }, [financialSummary, activeFinanceTab]);

  const handleWhatsAppAction = (order: any) => {
    const itemsList = order.items.map((it: any) => `• ${it.name} (${it.quantity})`).join('%0A');
    const msg = `*MEU PEDIDO - CONSTRULARA*%0A*ID:* ${order.id}%0A*Itens:*%0A${itemsList}%0A*Total:* R$ ${Number(order.total).toFixed(2)}`;
    window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');
  };

  if (isLoading || !user) return null;

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
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="h-16 w-16 text-slate-300" />}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-[1.8rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white h-8 w-8" />
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <h2 className="text-2xl font-black text-slate-900 mt-6">{user.name}</h2>
                <Badge className="bg-blue-100 text-blue-700 border-none rounded-xl font-bold px-6 py-1 mt-2">Cliente VIP</Badge>
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
                <TabsTrigger value="data" className="flex-1 rounded-2xl font-bold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">Meus Dados</TabsTrigger>
                <TabsTrigger value="orders" className="flex-1 rounded-2xl font-bold data-[state=active]:bg-blue-50">Pedidos</TabsTrigger>
                <TabsTrigger value="rentals" className="flex-1 rounded-2xl font-bold data-[state=active]:bg-blue-50">Contratos</TabsTrigger>
                <TabsTrigger value="finance" className="flex-1 rounded-2xl font-bold data-[state=active]:bg-blue-50">Minha Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="data">
                <form onSubmit={handleUpdateProfile} className="bg-white p-10 rounded-[3rem] shadow-sm space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><User className="h-4 w-4 text-blue-600" /> Nome</Label><Input value={user.name} onChange={e => setUser({...user, name: toTitleCase(e.target.value)})} className="h-12 rounded-xl" /></div>
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-600" /> CPF</Label><Input value={user.cpf} onChange={e => setUser({...user, cpf: maskCPF(e.target.value)})} className="h-12 rounded-xl" /></div>
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-blue-600" /> E-mail</Label><Input value={user.email} disabled className="h-12 rounded-xl bg-slate-50" /></div>
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><Phone className="h-4 w-4 text-blue-600" /> WhatsApp</Label><Input value={user.whatsapp} onChange={e => setUser({...user, whatsapp: maskPhone(e.target.value)})} className="h-12 rounded-xl" /></div>
                  </div>
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-2"><Label className="font-bold">Logradouro e Número</Label><Input value={user.address} onChange={e => setUser({...user, address: toTitleCase(e.target.value)})} className="h-12 rounded-xl" /></div>
                      <div className="space-y-2"><Label className="font-bold">CEP</Label><Input value={user.cep} onChange={e => setUser({...user, cep: maskCEP(e.target.value)})} className="h-12 rounded-xl" /></div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-700" /> Facebook</Label><Input value={user.facebook} onFocus={() => handleSocialFocus('facebook')} onChange={e => setUser({...user, facebook: e.target.value})} className="h-12 rounded-xl" /></div>
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-600" /> Instagram</Label><Input value={user.instagram} onFocus={() => handleSocialFocus('instagram')} onChange={e => setUser({...user, instagram: e.target.value})} className="h-12 rounded-xl" /></div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-700 h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-100"><Save className="mr-2" /> Salvar Alterações</Button>
                </form>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-16 text-center border-dashed border-2 border-slate-200"><ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-500 font-bold">Nenhum pedido realizado.</p></div>
                ) : (
                  userOrders.map(order => (
                    <Card key={order.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4"><div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Package className="h-6 w-6" /></div><div><h4 className="font-black">{order.id}</h4><p className="text-[10px] font-bold text-slate-400 uppercase">{order.date}</p></div></div>
                      <div className="flex items-center gap-4"><div className="text-right"><p className="text-lg font-black">R$ {Number(order.total).toFixed(2)}</p><Badge className="bg-blue-50 text-blue-700 rounded-lg">{order.status}</Badge></div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="rounded-xl font-bold border-slate-100">Detalhes</Button></DropdownMenuTrigger>
                          <DropdownMenuContent className="rounded-2xl w-48 shadow-2xl p-2" align="end">
                            <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => handleWhatsAppAction(order)}><Send className="mr-2 h-4 w-4 text-emerald-600" /> Reenviar WhatsApp</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => showSuccess("PIX Copiado!")}><DollarSign className="mr-2 h-4 w-4 text-blue-600" /> Pagar via PIX</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => showSuccess("Editando pedido...")}><Pencil className="mr-2 h-4 w-4 text-slate-400" /> Editar Pedido</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="rentals" className="space-y-4">
                {userRentals.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-16 text-center border-dashed border-2 border-slate-200"><Receipt className="h-12 w-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-500 font-bold">Nenhum contrato ativo.</p></div>
                ) : (
                  userRentals.map(rental => (
                    <Card key={rental.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4"><div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><Calendar className="h-6 w-6" /></div><div><h4 className="font-black">{rental.item}</h4><p className="text-[10px] font-bold text-slate-400 uppercase">Devolver em: {rental.end}</p></div></div>
                      <div className="flex items-center gap-4"><div className="text-right"><p className="text-lg font-black">R$ {Number(rental.total).toFixed(2)}</p><Badge className="bg-blue-100 text-blue-700">{rental.status}</Badge></div>
                      <Button onClick={() => { setSelectedRental(rental); setIsRentalDialogOpen(true); }} className="rounded-xl bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold"><Eye className="mr-2 h-4 w-4" /> Visualizar</Button></div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="finance" className="space-y-6">
                <div className="flex gap-2"><Button variant={activeFinanceTab === 'all' ? 'default' : 'outline'} onClick={() => setActiveFinanceTab('all')} className="rounded-xl font-bold h-10 px-6">Tudo</Button><Button variant={activeFinanceTab === 'pending' ? 'default' : 'outline'} onClick={() => setActiveFinanceTab('pending')} className="rounded-xl font-bold h-10 px-6">Pendente</Button></div>
                <div className="space-y-3">
                  {filteredMovements.map(move => {
                    const balance = Number(move.total) - (Number(move.paidAmount) || 0);
                    const isPaid = balance <= 0.01;
                    return (
                      <Card key={move.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4"><div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", move.type === 'order' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600")}>{move.type === 'order' ? <ShoppingBag className="h-6 w-6" /> : <Receipt className="h-6 w-6" />}</div><div><h4 className="font-black">{move.id}</h4><p className="text-[10px] font-bold text-slate-400">{move.label}</p></div></div>
                        <div className="flex items-center gap-4"><div className="text-right"><p className={cn("text-lg font-black", isPaid ? "text-emerald-600" : "text-red-600")}>{isPaid ? `R$ ${Number(move.total).toFixed(2)}` : `R$ ${balance.toFixed(2)}`}</p><Badge className={isPaid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}>{isPaid ? "Pago" : "Aberto"}</Badge></div>
                        {!isPaid && <Button onClick={() => handleOpenPayment(move)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold h-10 px-6"><DollarSign className="h-4 w-4 mr-2" /> Pagar</Button>}</div>
                      </Card>
                    );
                  })}
                </div>
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