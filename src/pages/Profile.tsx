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
  MapPin, CreditCard, Home, SearchX, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import RentalDetailsDialog from '@/components/RentalDetailsDialog';

const ProfilePage = () => {
  const [userData, setUserData] = useState<any>(null);
  const [userRentals, setUserRentals] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFinanceFilter, setActiveFinanceFilter] = useState<'all' | 'debt' | 'paid'>('all');
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [isRentalDialogOpen, setIsRentalDialogOpen] = useState(false);
  
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
          cep: "",
          facebook: "https://facebook.com/",
          instagram: "https://instagram.com/",
          photo: ""
        };
      } else {
        // Garantir que os campos sociais existam
        if (!foundUser.facebook) foundUser.facebook = "https://facebook.com/";
        if (!foundUser.instagram) foundUser.instagram = "https://instagram.com/";
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
    const movements = [
      ...userOrders.map(o => ({ 
        id: o.id, 
        type: 'order', 
        label: 'Compra', 
        description: `Pedido ${o.id}`, 
        total: Number(o.total) || 0,
        paid: Number(o.paidAmount) || 0,
        date: o.date, // Já deve estar no formato dd/mm/yyyy
        status: o.status === 'Pago' || (Number(o.paidAmount) >= Number(o.total) - 0.01) ? 'paid' : 'debt'
      })),
      ...userRentals.map(r => ({ 
        id: r.id, 
        type: 'rental', 
        label: 'Aluguel', 
        description: r.item, 
        total: Number(r.total) || 0,
        paid: Number(r.paidAmount) || 0,
        date: r.start, // Data de início como referência
        status: r.status === 'completed' || (Number(r.paidAmount) >= Number(r.total) - 0.01) ? 'paid' : 'debt'
      }))
    ].sort((a, b) => {
      // Ordenação simples por data (as datas estão como string dd/mm/yyyy)
      const partA = a.date.split('/');
      const partB = b.date.split('/');
      const dateA = new Date(Number(partA[2]), Number(partA[1])-1, Number(partA[0])).getTime();
      const dateB = new Date(Number(partB[2]), Number(partB[1])-1, Number(partB[0])).getTime();
      return dateB - dateA;
    });

    const totalToPay = movements.reduce((acc, m) => acc + (m.status === 'debt' ? (m.total - m.paid) : 0), 0);
    const totalPaid = movements.reduce((acc, m) => acc + m.paid, 0);

    return { 
      total: totalToPay + totalPaid, 
      paid: totalPaid, 
      pending: totalToPay, 
      movements 
    };
  }, [userOrders, userRentals]);

  const filteredMovements = useMemo(() => {
    if (activeFinanceFilter === 'all') return financialSummary.movements;
    return financialSummary.movements.filter(m => m.status === activeFinanceFilter);
  }, [financialSummary.movements, activeFinanceFilter]);

  const handleUpdateProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUserData({ ...userData, photo: base64String });
        // Auto salvar a foto
        const savedUsers = localStorage.getItem('app_users');
        if (savedUsers) {
          const users: any[] = JSON.parse(savedUsers);
          const index = users.findIndex(u => (u.email || "").toLowerCase().trim() === userData.email.toLowerCase().trim());
          if (index > -1) {
            users[index] = { ...userData, photo: base64String };
            localStorage.setItem('app_users', JSON.stringify(users));
            showSuccess("Foto atualizada!");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialChange = (field: 'facebook' | 'instagram', value: string) => {
    const prefix = field === 'facebook' ? "https://facebook.com/" : "https://instagram.com/";
    // Não permitir apagar o prefixo
    if (!value.startsWith(prefix)) {
      setUserData({ ...userData, [field]: prefix });
    } else {
      setUserData({ ...userData, [field]: value });
    }
  };

  const handleSocialFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Colocar cursor no final
    e.target.setSelectionRange(val.length, val.length);
  };

  if (isLoading || !userData) return <div className="min-h-screen flex items-center justify-center">Carregando perfil...</div>;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white text-center p-8">
              <div className="relative group w-32 h-32 mx-auto mb-4">
                <div className="h-32 w-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                  {userData.photo ? (
                    <img src={userData.photo} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-slate-300" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-10 w-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl hover:scale-110 transition-transform"
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">{userData.name}</h2>
              <Badge className="bg-blue-100 text-blue-700 border-none rounded-xl mt-2 px-4 py-1 text-[10px] font-black uppercase tracking-widest">{userData.role}</Badge>
            </Card>

            <Card className="border-none shadow-xl rounded-[3rem] bg-slate-900 text-white p-8">
              <h3 className="font-black text-lg mb-6 flex items-center gap-2">
                <Wallet className="h-6 w-6 text-emerald-400" /> 
                Resumo Financeiro
              </h3>
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Saldo Devedor</span>
                  <p className="text-3xl font-black text-rose-500">R$ {financialSummary.pending.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Total Pago</span>
                  <p className="text-2xl font-black text-emerald-400">R$ {financialSummary.paid.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex-1">
            <Tabs defaultValue="data" className="space-y-6">
              <TabsList className="bg-white p-1 rounded-[2.5rem] h-16 w-full shadow-sm flex overflow-x-auto custom-scrollbar">
                <TabsTrigger value="data" className="flex-1 rounded-[2rem] font-bold h-full min-w-[120px]">Meus Dados</TabsTrigger>
                <TabsTrigger value="finance" className="flex-1 rounded-[2rem] font-bold h-full min-w-[120px]">Financeiro</TabsTrigger>
                <TabsTrigger value="orders" className="flex-1 rounded-[2rem] font-bold h-full min-w-[120px]">Meus Pedidos</TabsTrigger>
                <TabsTrigger value="rentals" className="flex-1 rounded-[2rem] font-bold h-full min-w-[120px]">Meus Aluguéis</TabsTrigger>
              </TabsList>

              <TabsContent value="data">
                <form onSubmit={handleUpdateProfile} className="bg-white p-10 rounded-[3.5rem] shadow-sm space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><User className="h-4 w-4" /> Dados Pessoais</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label className="font-bold">Nome Completo</Label><Input value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label className="font-bold">CPF</Label><Input value={userData.cpf} onChange={e => setUserData({...userData, cpf: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label className="font-bold">WhatsApp</Label><Input value={userData.whatsapp} onChange={e => setUserData({...userData, whatsapp: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label className="font-bold">E-mail</Label><Input value={userData.email} disabled className="rounded-xl h-12 bg-slate-50" /></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> Localização</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2"><Label className="font-bold">Endereço (Rua e Nº)</Label><Input value={userData.address} onChange={e => setUserData({...userData, address: e.target.value})} className="rounded-xl h-12" placeholder="Ex: Rua Maestro José Cândido, 38A" /></div>
                      <div className="space-y-2"><Label className="font-bold">Bairro</Label><Input value={userData.neighborhood} onChange={e => setUserData({...userData, neighborhood: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label className="font-bold">Cidade</Label><Input value={userData.city} onChange={e => setUserData({...userData, city: e.target.value})} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label className="font-bold">Estado (UF)</Label><Input value={userData.state} onChange={e => setUserData({...userData, state: e.target.value.toUpperCase()})} maxLength={2} className="rounded-xl h-12" /></div>
                      <div className="space-y-2"><Label className="font-bold">CEP</Label><Input value={userData.cep} onChange={e => setUserData({...userData, cep: e.target.value})} className="rounded-xl h-12" /></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2 flex items-center gap-2"><Instagram className="h-4 w-4" /> Redes Sociais</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-700" /> Facebook</Label>
                        <Input 
                          value={userData.facebook} 
                          onChange={e => handleSocialChange('facebook', e.target.value)} 
                          onFocus={handleSocialFocus}
                          className="rounded-xl h-12 font-medium" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-600" /> Instagram</Label>
                        <Input 
                          value={userData.instagram} 
                          onChange={e => handleSocialChange('instagram', e.target.value)} 
                          onFocus={handleSocialFocus}
                          className="rounded-xl h-12 font-medium" 
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white w-full h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95">
                    <Save className="mr-2 h-5 w-5" /> Salvar Alterações
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="finance">
                <div className="bg-white p-8 rounded-[3.5rem] shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-black text-slate-900">Extrato de Movimentações</h3>
                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                      <button onClick={() => setActiveFinanceFilter('all')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", activeFinanceFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>Todos</button>
                      <button onClick={() => setActiveFinanceFilter('debt')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", activeFinanceFilter === 'debt' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400")}>Débitos</button>
                      <button onClick={() => setActiveFinanceFilter('paid')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", activeFinanceFilter === 'paid' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}>Pagos</button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredMovements.length === 0 ? (
                      <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                        <DollarSign className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                        <p className="font-bold text-slate-400">Nenhuma movimentação para este filtro.</p>
                      </div>
                    ) : (
                      filteredMovements.map((move: any) => (
                        <div key={`${move.type}-${move.id}`} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between hover:shadow-md transition-all group">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-12 w-12 rounded-2xl flex items-center justify-center",
                              move.type === 'order' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                            )}>
                              {move.type === 'order' ? <ShoppingBag className="h-6 w-6" /> : <Receipt className="h-6 w-6" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900">{move.description}</span>
                                <Badge className={cn("text-[8px] font-black uppercase border-none rounded-lg", move.type === 'order' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700")}>{move.label}</Badge>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{move.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className={cn("text-lg font-black", move.status === 'debt' ? "text-rose-600" : "text-emerald-600")}>
                                R$ {move.status === 'debt' ? (move.total - move.paid).toFixed(2) : move.total.toFixed(2)}
                              </p>
                              <div className="flex items-center justify-end gap-1">
                                {move.status === 'paid' ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-none text-[8px] font-black uppercase">Liquidado</Badge>
                                ) : (
                                  <Badge className="bg-rose-50 text-rose-700 border-none text-[8px] font-black uppercase">Pendente</Badge>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                if (move.type === 'rental') {
                                  const r = userRentals.find(x => x.id === move.id);
                                  setSelectedRental(r);
                                  setIsRentalDialogOpen(true);
                                } else {
                                  showSuccess("Detalhes do pedido em desenvolvimento.");
                                }
                              }}
                              className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 group-hover:text-blue-600"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <SearchX className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="font-bold text-slate-400">Nenhum pedido realizado ainda.</p>
                  </div>
                ) : userOrders.map(order => (
                  <Card key={order.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingBag className="h-7 w-7" /></div>
                      <div>
                        <h4 className="font-black text-lg text-slate-900">{order.id}</h4>
                        <div className="flex items-center gap-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.date}</p>
                          <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black uppercase rounded-lg">{order.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-black text-blue-700 mr-4">R$ {Number(order.total || 0).toFixed(2)}</p>
                      <Button variant="outline" size="sm" onClick={() => handleEditOrder(order.id)} className="rounded-xl font-bold gap-2 hover:bg-blue-50 hover:text-blue-700 h-10 px-4 border-slate-100">
                        <Pencil className="h-4 w-4" /> Editar Pedido
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="rentals" className="space-y-4">
                {userRentals.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <SearchX className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="font-bold text-slate-400">Nenhum aluguel ativo ou histórico.</p>
                  </div>
                ) : userRentals.map(rental => (
                  <Card key={rental.id} className="border-none shadow-sm rounded-[2.5rem] bg-white p-6 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><Calendar className="h-7 w-7" /></div>
                      <div>
                        <h4 className="font-black text-lg text-slate-900">{rental.item}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Início: {rental.start} • Término: {rental.end}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900">R$ {Number(rental.total || 0).toFixed(2)}</p>
                        <Badge className={cn(
                          "text-[8px] font-black uppercase border-none rounded-lg",
                          rental.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                        )}>{rental.status}</Badge>
                      </div>
                      <Button onClick={() => { setSelectedRental(rental); setIsRentalDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black h-12 px-6 shadow-lg shadow-blue-50">Visualizar</Button>
                    </div>
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