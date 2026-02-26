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
  Save, Eye, Send, Pencil, Instagram, Facebook,
  MapPin, CreditCard, Home, SearchX
} from 'lucide-react';
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

      if (!foundUser) {
        foundUser = { 
          name: localStorage.getItem('userName') || "Usuário", 
          email: email, 
          role: localStorage.getItem('userRole') || "Visitante",
          whatsapp: "",
          cpf: "",
          address: "",
          neighborhood: "",
          city: "",
          state: "",
          cep: ""
        };
      }

      setUserData({ ...foundUser });

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
          showSuccess("Perfil atualizado com sucesso!");
        }
      } catch (e) { showError("Falha ao salvar."); }
    }
  };

  const handleEditOrder = (orderId: string) => {
    showSuccess(`Edição do pedido ${orderId} habilitada.`);
    // Em uma implementação real aqui abriria um dialog de edição
  };

  if (isLoading || !userData) return <div className="min-h-screen flex items-center justify-center">Carregando perfil...</div>;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white text-center p-8">
              <div className="h-32 w-32 rounded-[2rem] bg-slate-100 mx-auto flex items-center justify-center mb-4">
                <User className="h-16 w-16 text-slate-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">{userData.name}</h2>
              <Badge className="bg-blue-100 text-blue-700 border-none rounded-xl mt-2">{userData.role}</Badge>
            </Card>

            <Card className="border-none shadow-xl rounded-[3rem] bg-slate-900 text-white p-8">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-400" /> Financeiro</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end"><span className="text-xs text-slate-400 uppercase font-bold">A Pagar</span><span className="text-2xl font-black text-red-400">R$ {financialSummary.pending.toFixed(2)}</span></div>
                <div className="flex justify-between items-end"><span className="text-xs text-emerald-400 uppercase font-bold">Pago</span><span className="text-xl font-black text-emerald-400">R$ {financialSummary.paid.toFixed(2)}</span></div>
              </div>
            </Card>
          </div>

          <div className="flex-1">
            <Tabs defaultValue="data" className="space-y-6">
              <TabsList className="bg-white p-1 rounded-[2rem] h-16 w-full shadow-sm">
                <TabsTrigger value="data" className="flex-1 rounded-2xl font-bold">Meus Dados</TabsTrigger>
                <TabsTrigger value="orders" className="flex-1 rounded-2xl font-bold">Pedidos</TabsTrigger>
                <TabsTrigger value="rentals" className="flex-1 rounded-2xl font-bold">Contratos</TabsTrigger>
              </TabsList>

              <TabsContent value="data">
                <form onSubmit={handleUpdateProfile} className="bg-white p-10 rounded-[3rem] shadow-sm space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><User className="h-4 w-4" /> Nome</Label><Input value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><CreditCard className="h-4 w-4" /> CPF</Label><Input value={userData.cpf} onChange={e => setUserData({...userData, cpf: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><Phone className="h-4 w-4" /> WhatsApp</Label><Input value={userData.whatsapp} onChange={e => setUserData({...userData, whatsapp: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label className="font-bold flex items-center gap-2"><Mail className="h-4 w-4" /> E-mail</Label><Input value={userData.email} disabled className="rounded-xl h-12 bg-slate-50" /></div>
                    <div className="space-y-2 md:col-span-2"><Label className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Endereço Completo</Label><Input value={userData.address} onChange={e => setUserData({...userData, address: e.target.value})} className="rounded-xl h-12" placeholder="Rua, Número" /></div>
                    <div className="space-y-2"><Label className="font-bold">Bairro</Label><Input value={userData.neighborhood} onChange={e => setUserData({...userData, neighborhood: e.target.value})} className="rounded-xl h-12" /></div>
                    <div className="space-y-2"><Label className="font-bold">Cidade</Label><Input value={userData.city} onChange={e => setUserData({...userData, city: e.target.value})} className="rounded-xl h-12" /></div>
                  </div>
                  <Button type="submit" className="bg-blue-700 w-full h-14 rounded-2xl font-black text-lg"><Save className="mr-2" /> Salvar Meus Dados</Button>
                </form>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <SearchX className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="font-bold text-slate-400">Nenhum pedido realizado ainda.</p>
                  </div>
                ) : userOrders.map(order => (
                  <Card key={order.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingBag className="h-6 w-6" /></div>
                      <div>
                        <h4 className="font-black text-slate-900">{order.id}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-black text-blue-700 mr-4">R$ {Number(order.total || 0).toFixed(2)}</p>
                      <Button variant="outline" size="sm" onClick={() => handleEditOrder(order.id)} className="rounded-xl font-bold gap-2">
                        <Pencil className="h-4 w-4" /> Editar
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="rentals" className="space-y-4">
                {userRentals.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <SearchX className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="font-bold text-slate-400">Nenhum aluguel ativo.</p>
                  </div>
                ) : userRentals.map(rental => (
                  <Card key={rental.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><Calendar className="h-6 w-6" /></div>
                      <div>
                        <h4 className="font-black text-slate-900">{rental.item}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Até {rental.end}</p>
                      </div>
                    </div>
                    <Button onClick={() => { setSelectedRental(rental); setIsRentalDialogOpen(true); }} className="bg-blue-600 rounded-xl font-bold px-6">Ver Detalhes</Button>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <RentalDetailsDialog rental={selectedRental} open={isRentalDialogOpen} onOpenChange={setIsRentalDialogOpen} onUpdate={loadProfileData} />
    </AppLayout>
  );
};

export default ProfilePage;