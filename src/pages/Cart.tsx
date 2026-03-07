"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ArrowLeft, CheckCircle2, UserCheck, Info, UserRoundSearch } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserAccount } from '@/components/UserTable';

const CartPage = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Loja'>('Pix');
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [allClients, setAllClients] = useState<UserAccount[]>([]);
  
  const [pixInfo, setPixInfo] = useState({
    key: "16403481000116",
    name: "BTM Design",
    bank: "CC Crediplus"
  });

  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isInternal = ['Gestor', 'Vendas'].includes(userRole);
  const currentUserEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    const saved = localStorage.getItem('app_cart');
    if (saved) setCart(JSON.parse(saved));
    
    const savedPix = localStorage.getItem('app_pix_info');
    if (savedPix) setPixInfo(JSON.parse(savedPix));

    if (isInternal) {
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) {
        try {
          const parsed = JSON.parse(savedUsers);
          setAllClients(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setAllClients([]);
        }
      }
    }
  }, [isInternal]);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('app_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.isPromo ? (item.promoPrice || item.price) : item.price;
      const amount = item.isFractional ? item.totalAmount : item.quantity;
      return acc + (price * amount);
    }, 0);
  }, [cart]);

  const handleUpdateQty = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        if (item.isFractional) {
          const step = item.packageSize || 1;
          const currentAmount = Number(item.totalAmount) || step;
          const currentPacks = Math.round(currentAmount / step);
          const nextPacks = Math.max(1, currentPacks + delta);
          return { 
            ...item, 
            quantity: nextPacks, 
            totalAmount: nextPacks * step 
          };
        }
        return { ...item, quantity: Math.max(1, (Number(item.quantity) || 1) + delta) };
      }
      return item;
    });
    saveCart(updated);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    let finalEmail = currentUserEmail;
    let finalName = "Cliente";

    if (isInternal) {
      if (!selectedClientId) return showError("Selecione o cliente.");
      const c = allClients.find(client => client.id === selectedClientId);
      if (c) { finalEmail = c.email; finalName = c.name; }
    }

    const orderId = `ORD-${Date.now()}`;
    const date = new Date().toLocaleDateString('pt-BR');
    const savedOrders = JSON.parse(localStorage.getItem('app_orders') || '[]');

    const newOrder = { 
      id: orderId, 
      date, 
      userEmail: finalEmail, 
      clientName: finalName, 
      items: [...cart], 
      total, 
      paidAmount: 0, 
      paymentMethod, 
      status: 'Pendente' 
    };
    
    localStorage.setItem('app_orders', JSON.stringify([newOrder, ...savedOrders]));
    
    let itemsText = cart.map(it => `• ${it.name}: ${it.isFractional ? it.totalAmount.toFixed(2) + (it.unitLabel || 'm²') : it.quantity + ' un'}`).join('%0A');
    
    const pixText = paymentMethod === 'Pix' 
      ? `%0A%0A*DADOS PIX:*%0AChave: ${pixInfo.key}%0A${pixInfo.name}%0A${pixInfo.bank}` 
      : '';

    const whatsappMsg = `*PEDIDO CONSTRULARA*%0A*ID:* ${orderId}%0A*Cliente:* ${finalName}%0A*Pagamento:* ${paymentMethod}%0A%0A*Itens:*%0A${itemsText}%0A%0A*TOTAL: R$ ${total.toFixed(2)}*${pixText}`;
    
    window.open(`https://wa.me/5532999625979?text=${whatsappMsg}`, '_blank');
    localStorage.removeItem('app_cart');
    showSuccess("Pedido realizado!");
    window.dispatchEvent(new Event('order-placed'));
    navigate(isInternal ? '/relatorios' : '/perfil?tab=orders');
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/loja')} className="rounded-xl h-10 px-4 gap-2 font-bold text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" /> Continuar Comprando
          </Button>
          <h2 className="text-3xl font-black text-slate-900">Meu Carrinho</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {isInternal && (
              <div className="bg-blue-50 p-8 rounded-[3rem] border-2 border-blue-100 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-black text-blue-900 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <UserCheck className="h-4 w-4" /> Cliente Responsável
                  </Label>
                  {selectedClientId && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setSelectedClientId("")}
                      className="h-6 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-100 rounded-lg gap-1"
                    >
                      <UserRoundSearch className="h-3 w-3" /> Trocar Usuário
                    </Button>
                  )}
                </div>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="h-14 bg-white rounded-2xl border-none shadow-sm text-lg font-bold">
                    <SelectValue placeholder="Selecione o cliente para esta venda..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl max-h-[300px]">
                    {allClients.map(c => (
                      <SelectItem key={c.id} value={c.id} className="rounded-xl font-bold py-3">
                        {c.name} <span className="text-[10px] font-normal text-slate-400 ml-2">({c.email})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <ShoppingBag className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">Seu carrinho está vazio.</p>
                </div>
              ) : (
                cart.map(item => (
                  <Card key={item.id} className="p-6 rounded-[2.5rem] border-none shadow-sm flex items-center gap-6 bg-white hover:shadow-md transition-all">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900 text-lg">{item.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</p>
                      {item.isFractional && (
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className="text-[9px] font-bold h-5 rounded-lg bg-blue-50/50 border-blue-100 text-blue-600">
                            Cx {item.packageSize}{item.unitLabel}
                          </Badge>
                          <span className="text-[9px] text-slate-400 font-bold italic">Edição apenas em caixas fechadas</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                      <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(item.id, -1)} className="h-9 w-9 rounded-xl hover:bg-white"><Minus className="h-3 w-3" /></Button>
                      <div className="flex flex-col items-center min-w-[60px]">
                        <span className="font-black text-slate-900 text-lg leading-none">{item.isFractional ? item.totalAmount.toFixed(2) : item.quantity}</span>
                        <span className="text-[9px] font-black uppercase text-slate-400">{item.unitLabel || 'un'}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(item.id, 1)} className="h-9 w-9 rounded-xl hover:bg-white"><Plus className="h-3 w-3" /></Button>
                    </div>
                    <div className="w-28 text-right">
                      <p className="font-black text-xl text-blue-700">R$ {( (item.isPromo ? (item.promoPrice || item.price) : item.price) * (item.isFractional ? item.totalAmount : item.quantity) ).toFixed(2)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => saveCart(cart.filter(i => i.id !== item.id))} 
                      className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-8 rounded-[3rem] shadow-xl bg-white border-none h-fit space-y-8">
              <div className="space-y-4">
                <Label className="font-black text-slate-400 uppercase text-xs tracking-widest">Resumo do Pedido</Label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total</span>
                    <span className="text-blue-700">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="font-black text-slate-400 uppercase text-xs tracking-widest">Forma de Pagamento</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant={paymentMethod === 'Pix' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Pix')}
                    className={cn("rounded-2xl h-14 font-black text-xs gap-2", paymentMethod === 'Pix' && "bg-blue-700 shadow-lg shadow-blue-100")}
                  >
                    <CreditCard className="h-4 w-4" /> PIX
                  </Button>
                  <Button 
                    variant={paymentMethod === 'Loja' ? 'default' : 'outline'}
                    onClick={() => setPaymentMethod('Loja')}
                    className={cn("rounded-2xl h-14 font-black text-xs gap-2", paymentMethod === 'Loja' && "bg-blue-700 shadow-lg shadow-blue-100")}
                  >
                    <ShoppingBag className="h-4 w-4" /> NA LOJA
                  </Button>
                </div>
              </div>

              {paymentMethod === 'Pix' && (
                <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                    <Info className="h-4 w-4" /> Dados para Pagamento
                  </h4>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-700">Chave: <span className="text-slate-900 font-black">{pixInfo.key}</span></p>
                    <p className="text-xs font-bold text-emerald-700">{pixInfo.name}</p>
                    <p className="text-xs font-bold text-emerald-700">{pixInfo.bank}</p>
                  </div>
                  <p className="text-[10px] text-emerald-600 italic font-medium">O comprovante será enviado no WhatsApp junto com o pedido.</p>
                </div>
              )}

              <Button 
                onClick={handleCheckout} 
                disabled={cart.length === 0}
                className="w-full bg-blue-700 hover:bg-blue-800 h-16 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95"
              >
                Finalizar via WhatsApp
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CartPage;