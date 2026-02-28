"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ArrowLeft, Package, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserAccount } from '@/components/UserTable';

const CartPage = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Loja'>('Pix');
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [allClients, setAllClients] = useState<UserAccount[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isInternal = ['Gestor', 'Vendas'].includes(userRole);
  const currentUserEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    const loadCartData = () => {
      try {
        const savedCart = localStorage.getItem('app_cart');
        if (savedCart && savedCart !== "undefined" && savedCart !== "null") {
          const parsed = JSON.parse(savedCart);
          setCart(Array.isArray(parsed) ? parsed.filter(i => i && typeof i === 'object') : []);
        } else {
          setCart([]);
        }

        if (isInternal) {
          const savedUsers = localStorage.getItem('app_users');
          if (savedUsers) {
            const users = JSON.parse(savedUsers);
            setAllClients(Array.isArray(users) ? users.filter(u => u && u.role === 'Cliente') : []);
          }
        }
        setIsDataLoaded(true);
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        setCart([]);
        setIsDataLoaded(true);
      }
    };

    loadCartData();
  }, [isInternal]);

  const saveCart = (newCart: any[]) => {
    const cleanCart = newCart.filter(i => i !== null);
    setCart(cleanCart);
    localStorage.setItem('app_cart', JSON.stringify(cleanCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      if (!item) return acc;
      const price = Number(item.isPromo ? (item.promoPrice || item.price) : item.price) || 0;
      const amount = Number(item.isFractional ? item.totalAmount : item.quantity) || 0;
      return acc + (price * amount);
    }, 0);
  }, [cart]);

  const handleUpdateQty = (id: string, delta: number) => {
    const updated = cart.map(item => {
      if (item && item.id === id && !item.isFractional) {
        return { ...item, quantity: Math.max(1, (Number(item.quantity) || 1) + delta) };
      }
      return item;
    });
    saveCart(updated);
  };

  const handleRemove = (id: string) => {
    saveCart(cart.filter(i => i && i.id !== id));
    showSuccess("Item removido.");
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let finalEmail = currentUserEmail;
    let finalName = "Cliente";

    if (isInternal) {
      if (!selectedClientId) {
        showError("Selecione o cliente.");
        return;
      }
      const c = allClients.find(client => client.id === selectedClientId);
      if (c) {
        finalEmail = c.email;
        finalName = c.name;
      }
    }

    try {
      const orderId = `ORD-${Date.now()}`;
      const date = new Date().toLocaleDateString('pt-BR');
      const saved = localStorage.getItem('app_orders');
      const orders = saved ? JSON.parse(saved) : [];

      const newOrder = {
        id: orderId,
        date,
        userEmail: finalEmail,
        clientName: finalName,
        items: [...cart],
        total: total,
        paidAmount: 0,
        paymentMethod,
        status: 'Pendente'
      };

      localStorage.setItem('app_orders', JSON.stringify([newOrder, ...orders]));
      localStorage.removeItem('app_cart');
      setCart([]);

      const msg = `*PEDIDO - CONSTRULARA*%0A*ID:* ${orderId}%0A*CLIENTE:* ${finalName}%0A*TOTAL:* R$ ${total.toFixed(2)}`;
      window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');

      showSuccess("Pedido realizado!");
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('order-placed'));
      navigate(isInternal ? '/relatorios' : '/perfil?tab=orders');
    } catch (e) { showError("Falha ao finalizar."); }
  };

  if (!isDataLoaded) return <AppLayout><div>Carregando...</div></AppLayout>;

  if (cart.length === 0) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto text-center py-32 space-y-6">
        <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto"><ShoppingBag className="h-12 w-12 text-slate-200" /></div>
        <h2 className="text-3xl font-black">Seu carrinho está vazio</h2>
        <Button onClick={() => navigate('/loja')} className="bg-blue-600 rounded-2xl px-10 h-14 font-black">Explorar Loja</Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/loja')} className="rounded-xl h-10 w-10"><ArrowLeft className="h-6 w-6" /></Button>
          <h2 className="text-3xl font-black">Carrinho de Compras</h2>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {isInternal && (
              <div className="bg-blue-50 p-8 rounded-[3rem] border-2 border-blue-100 space-y-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <UserCheck className="h-5 w-5" />
                  <span className="font-black text-sm uppercase">Identificar Cliente</span>
                </div>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="h-14 rounded-2xl bg-white border-blue-200 shadow-sm">
                    <SelectValue placeholder="Selecione o cliente para faturar..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-white">
                    {allClients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              {cart.map((item, i) => (
                <Card key={item?.id || i} className="p-6 rounded-[2rem] border-none shadow-sm flex items-center gap-6 bg-white">
                  <div className="h-20 w-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                    <img src={item?.image || '/placeholder.svg'} className="w-full h-full object-cover" alt={item?.name} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900">{item?.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item?.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border">
                      {!item?.isFractional ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(item.id, -1)} className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
                          <span className="font-black">{item?.quantity}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(item.id, 1)} className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
                        </>
                      ) : (
                        <span className="px-4 font-black text-blue-700">{Number(item?.totalAmount).toFixed(2)} {item?.unitLabel}</span>
                      )}
                    </div>
                    <p className="font-black text-lg text-slate-900">R$ {( (item.isPromo ? (item.promoPrice || item.price) : item.price) * (item.isFractional ? item.totalAmount : item.quantity) ).toFixed(2)}</p>
                    <button onClick={() => handleRemove(item.id)} className="text-[10px] font-bold text-red-500 hover:underline">REMOVER</button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900">Pagamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setPaymentMethod('Pix')} className={cn("p-6 rounded-[2rem] border-2 text-left transition-all", paymentMethod === 'Pix' ? "border-blue-600 bg-blue-50" : "bg-white border-slate-100")}>
                  <div className="flex justify-between font-black text-blue-700">PIX <CheckCircle2 className={cn("h-5 w-5", paymentMethod === 'Pix' ? "opacity-100" : "opacity-0")} /></div>
                  <p className="text-xs text-slate-500 mt-2">CNPJ: 16.403.481/0001-16</p>
                </button>
                <button onClick={() => setPaymentMethod('Loja')} className={cn("p-6 rounded-[2rem] border-2 text-left transition-all", paymentMethod === 'Loja' ? "border-blue-600 bg-blue-50" : "bg-white border-slate-100")}>
                  <div className="flex justify-between font-black text-slate-900">LOJA <CheckCircle2 className={cn("h-5 w-5", paymentMethod === 'Loja' ? "opacity-100" : "opacity-0")} /></div>
                  <p className="text-xs text-slate-500 mt-2">Pague ao retirar o pedido</p>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-8 rounded-[3rem] shadow-xl bg-white border-none space-y-6 sticky top-32">
              <h3 className="font-black text-2xl">Resumo do Pedido</h3>
              <div className="flex justify-between text-3xl font-black text-blue-700 pt-6 border-t">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <Button onClick={handleCheckout} className="w-full bg-blue-700 hover:bg-blue-800 h-16 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95">
                {isInternal ? "Registrar Venda" : "Finalizar Pedido"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CartPage;