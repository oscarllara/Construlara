"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Receipt, Calendar, ShieldCheck, ShoppingBag, MessageCircle, Pencil, ArrowRight, Package, RefreshCw } from 'lucide-react';
import { UserAccount } from '@/components/UserTable';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [userRentals, setUserRentals] = useState<any[]>([]);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadProfileData = () => {
    const email = (localStorage.getItem('userEmail') || '').toLowerCase().trim();
    const savedUsers = localStorage.getItem('app_users');
    const savedRentals = localStorage.getItem('app_rentals');
    const savedOrders = localStorage.getItem('app_orders');

    if (!email) {
      navigate('/login');
      return;
    }

    // 1. Carregar Dados do Usuário
    let foundUser: UserAccount | undefined;
    if (savedUsers) {
      const users: UserAccount[] = JSON.parse(savedUsers);
      foundUser = users.find(u => u.email.toLowerCase().trim() === email);
    }

    if (foundUser) {
      setUser(foundUser);
    } else {
      // Fallback para perfil temporário
      const role = localStorage.getItem('userRole') || 'Usuário';
      const tempUser: UserAccount = {
        id: 'temp',
        name: email.split('@')[0],
        email: email,
        whatsapp: '(32) 99999-9999',
        role: role as any,
        status: 'active',
        lastAccess: 'Agora'
      };
      setUser(tempUser);
      foundUser = tempUser;
    }

    // 2. Carregar Aluguéis
    if (savedRentals) {
      const rentals = JSON.parse(savedRentals);
      const filtered = rentals.filter((r: any) => 
        (r.clientId && r.clientId === foundUser?.id) || 
        (r.client && r.client.toLowerCase() === foundUser?.name.toLowerCase())
      );
      setUserRentals(filtered);
    }

    // 3. Carregar Pedidos (Lógica Reforçada)
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      const filteredOrders = foundUser.role === 'Gestor' 
        ? orders 
        : orders.filter((o: any) => {
            const orderEmail = (o.userEmail || '').toLowerCase().trim();
            return orderEmail === email;
          });
      setUserOrders(filteredOrders);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadProfileData();
    
    // Listener para atualizações em tempo real se o usuário mudar algo em outra aba
    window.addEventListener('storage', loadProfileData);
    window.addEventListener('order-placed', loadProfileData);
    
    return () => {
      window.removeEventListener('storage', loadProfileData);
      window.removeEventListener('order-placed', loadProfileData);
    };
  }, []);

  const handleResendOrder = (order: any) => {
    const itemsList = order.items.map((item: any) => {
      const price = item.isPromo ? (item.promoPrice || item.price) : item.price;
      const detail = item.isFractional 
        ? `${item.quantity} cx (${(item.totalAmount || 0).toFixed(2)}${item.unitLabel || 'un'})`
        : `${item.quantity} un`;
      return `• ${item.name} [${detail}] - R$ ${(price * (item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0))).toFixed(2)}`;
    }).join('\n');

    const methodLabel = order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'store' ? 'Pagar na Loja' : 'WhatsApp';

    const message = `*REENVIO DE PEDIDO - CONSTRULARA*\n` +
      `*ID:* ${order.id}\n` +
      `*Data Original:* ${order.date}\n\n` +
      `*Itens:*\n${itemsList}\n\n` +
      `*Total:* R$ ${order.total.toFixed(2)}\n` +
      `*Pagamento:* ${methodLabel}\n\n` +
      `Estou reenviando meu pedido para confirmação!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5532999625979?text=${encoded}`, '_blank');
    showSuccess("WhatsApp aberto para reenvio.");
  };

  const handleEditOrder = (order: any) => {
    localStorage.setItem('app_cart', JSON.stringify(order.items));
    window.dispatchEvent(new Event('cart-updated'));
    showSuccess("Itens carregados no carrinho para edição!");
    navigate('/carrinho');
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-bold">Carregando seu perfil...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Coluna da Esquerda: Dados Pessoais */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
              <div className="h-32 bg-gradient-to-br from-blue-600 to-blue-800"></div>
              <CardContent className="relative pt-0 px-8 pb-8">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <div className="h-24 w-24 rounded-[2rem] bg-white p-1 shadow-xl">
                    <div className="h-full w-full rounded-[1.8rem] bg-slate-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-16 text-center space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
                  <Badge className="bg-blue-100 text-blue-700 border-none rounded-xl font-bold px-4 py-1">
                    {user?.role}
                  </Badge>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-slate-400 uppercase">E-mail</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Phone className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">WhatsApp</p>
                      <p className="text-sm font-bold text-slate-700">{user?.whatsapp}</p>
                    </div>
                  </div>
                  {user?.worksiteAddress && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Endereço da Obra</p>
                        <p className="text-sm font-bold text-slate-700 leading-tight">{user.worksiteAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-900 rounded-[2.5rem] p-8 text-white space-y-4 shadow-2xl shadow-blue-900/20">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
                <h3 className="font-black text-lg">Segurança</h3>
              </div>
              <p className="text-sm text-blue-200 font-medium">Sua conta está protegida. Último acesso registrado em {user?.lastAccess}.</p>
            </div>
          </div>

          {/* Coluna da Direita: Abas de Atividade */}
          <div className="flex-1 space-y-6">
            <Tabs defaultValue="orders" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-full md:w-auto">
                  <TabsTrigger value="orders" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <ShoppingBag className="h-4 w-4 mr-2" /> Meus Pedidos
                  </TabsTrigger>
                  <TabsTrigger value="rentals" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Receipt className="h-4 w-4 mr-2" /> Meus Contratos
                  </TabsTrigger>
                </TabsList>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadProfileData}
                  className="rounded-xl font-bold text-slate-400 hover:text-blue-600 gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Atualizar
                </Button>
              </div>

              <TabsContent value="orders" className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                    <ShoppingBag className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Você ainda não realizou compras na loja.</p>
                    <Button onClick={() => navigate('/')} variant="link" className="text-blue-600 font-black mt-2">
                      Ir para a Loja <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {userOrders.map((order) => (
                      <Card key={order.id} className="border-none shadow-sm rounded-[2rem] bg-white hover:shadow-md transition-all overflow-hidden group">
                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Package className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900">{order.id}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{order.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-black text-blue-700">R$ {order.total.toFixed(2)}</p>
                              <Badge className="bg-slate-100 text-slate-600 border-none text-[10px] font-black uppercase">
                                {order.paymentMethod === 'store' ? 'Pagar na Loja' : order.paymentMethod.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Itens do Pedido</p>
                            <div className="space-y-1">
                              {order.items.map((item: any, idx: number) => (
                                <p key={idx} className="text-xs font-bold text-slate-600 flex justify-between">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>R$ {((item.isPromo ? (item.promoPrice || item.price) : item.price) * (item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0))).toFixed(2)}</span>
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <Button 
                              onClick={() => handleResendOrder(order)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-2 h-10 text-xs"
                            >
                              <MessageCircle className="h-4 w-4" /> Reenviar WhatsApp
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleEditOrder(order)}
                              className="flex-1 rounded-xl border-slate-200 font-bold gap-2 h-10 text-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                            >
                              <Pencil className="h-4 w-4" /> Editar Pedido
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="rentals" className="space-y-4">
                {userRentals.length === 0 ? (
                  <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-slate-200">
                    <Receipt className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">Você ainda não possui contratos registrados.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {userRentals.map((rental) => (
                      <Card key={rental.id} className="border-none shadow-sm rounded-[2rem] bg-white hover:shadow-md transition-all overflow-hidden group">
                        <div className="flex items-center p-6 gap-6">
                          <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <Calendar className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-black text-slate-900">{rental.item}</h4>
                              <span className="text-lg font-black text-blue-700">R$ {rental.total?.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <span>Início: {rental.start}</span>
                              <span>Fim: {rental.end}</span>
                            </div>
                          </div>
                          <Badge className={cn(
                            "rounded-xl border-none font-bold px-4 py-2",
                            rental.status === 'active' ? "bg-blue-100 text-blue-700" :
                            rental.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {rental.status === 'active' ? 'Ativo' : 
                             rental.status === 'completed' ? 'Finalizado' : 'Atrasado'}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;