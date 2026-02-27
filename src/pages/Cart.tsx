"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ArrowLeft, Package, Info, SearchX, CheckCircle2, UserCheck, Users, AlertTriangle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserAccount } from '@/components/UserTable';

const CartPage = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Loja'>('Pix');
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [allClients, setAllClients] = useState<UserAccount[]>([]);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isInternal = ['Gestor', 'Vendas'].includes(userRole);
  const currentUserEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_cart');
      if (saved && saved !== "undefined" && saved !== "null") {
        const parsed = JSON.parse(saved);
        setCart(Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object') : []);
      } else {
        setCart([]);
      }

      if (isInternal) {
        const savedUsers = localStorage.getItem('app_users');
        if (savedUsers) {
          const users: UserAccount[] = JSON.parse(savedUsers);
          setAllClients(Array.isArray(users) ? users.filter(u => u && u.role === 'Cliente') : []);
        }
      }
    } catch (e) { 
      console.error("Erro ao carregar carrinho:", e);
      setHasError(true);
      setCart([]); 
    }
  }, [isInternal]);

  const saveCart = (newCart: any[]) => {
    try {
      const cleanCart = newCart.filter(item => item !== null && item !== undefined);
      setCart(cleanCart);
      localStorage.setItem('app_cart', JSON.stringify(cleanCart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      showError("Erro ao salvar carrinho.");
    }
  };

  const cartTotal = useMemo(() => {
    if (!Array.isArray(cart)) return 0;
    try {
      return cart.reduce((acc, item) => {
        if (!item) return acc;
        const price = item.isPromo ? (Number(item.promoPrice) || Number(item.price) || 0) : (Number(item.price) || 0);
        const amount = item.isFractional ? (Number(item.totalAmount) || 0) : (Number(item.quantity) || 0);
        return acc + (price * amount);
      }, 0);
    } catch (e) {
      return 0;
    }
  }, [cart]);

  const handleUpdateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item && item.id === id && !item.isFractional) {
        const currentQty = Number(item.quantity) || 1;
        const newQty = Math.max(1, currentQty + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(newCart);
  };

  const handleRemove = (id: string) => {
    const newCart = cart.filter(i => i && i.id !== id);
    saveCart(newCart);
    showSuccess("Item removido.");
  };

  const resetCart = () => {
    localStorage.removeItem('app_cart');
    setCart([]);
    setHasError(false);
    showSuccess("Carrinho redefinido.");
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleCheckout = () => {
    if (!Array.isArray(cart) || cart.length === 0) return;

    let finalUserEmail = currentUserEmail;
    let clientName = "Cliente";

    if (isInternal) {
      if (!selectedClientId) {
        showError("Você deve identificar o cliente para este pedido.");
        return;
      }
      const client = allClients.find(c => c.id === selectedClientId);
      if (client) {
        finalUserEmail = client.email;
        clientName = client.name;
      }
    }

    try {
      const orderId = `ORD-${Date.now()}`;
      const now = new Date();
      const orderDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      
      const savedOrders = localStorage.getItem('app_orders');
      const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
      
      const newOrder = {
        id: orderId,
        date: orderDate,
        userEmail: finalUserEmail,
        clientName: clientName,
        items: [...cart.filter(i => i !== null)],
        total: cartTotal,
        paidAmount: 0,
        paymentMethod: paymentMethod,
        status: 'Pendente'
      };

      localStorage.setItem('app_orders', JSON.stringify([newOrder, ...currentOrders]));
      localStorage.removeItem('app_cart');
      setCart([]);
      
      const itemsList = cart.filter(i => i !== null).map(it => `• ${it.name} (${it.isFractional ? (Number(it.totalAmount) || 0).toFixed(2) + (it.unitLabel || 'm²') : (Number(it.quantity) || 1) + ' un'})`).join('%0A');
      
      let payInfo = "";
      if (paymentMethod === 'Pix') {
        payInfo = `%0A*PAGAMENTO PIX:*%0AChave CNPJ: 16403481000116%0ABTM DESIGN%0A`;
      } else {
        payInfo = `%0A*PAGAMENTO:* Pagar na Loja%0A`;
      }

      const msg = `*PEDIDO - CONSTRULARA*%0A*CLIENTE:* ${clientName}%0A*ID:* ${orderId}${payInfo}*Itens:*%0A${itemsList}%0A*Total:* R$ ${cartTotal.toFixed(2)}`;
      window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');

      showSuccess(isInternal ? `Venda registrada para ${clientName}!` : "Pedido realizado!");
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('order-placed'));
      
      if (isInternal) navigate('/relatorios');
      else navigate('/perfil?tab=orders');
    } catch (e) {
      showError("Erro ao finalizar pedido.");
    }
  };

  if (hasError) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto text-center py-32 space-y-6">
        <div className="h-24 w-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto"><AlertTriangle className="h-12 w-12 text-red-500" /></div>
        <h2 className="text-3xl font-black">Ops! Dados corrompidos detectados</h2>
        <p className="text-slate-500 font-bold">Encontramos um erro nos dados salvos do seu carrinho.</p>
        <Button onClick={resetCart} className="bg-red-600 rounded-2xl px-10 h-14 font-black">Limpar Dados e Recomeçar</Button>
      </div>
    </AppLayout>
  );

  if (!Array.isArray(cart) || cart.length === 0) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto text-center py-32 space-y-6">
        <div className="h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto"><ShoppingBag className="h-12 w-12 text-slate-200" /></div>
        <h2 className="text-3xl font-black">Seu carrinho está vazio</h2>
        <Button onClick={() => navigate('/loja')} className="bg-blue-600 rounded-2xl px-10 h-14 font-black">Voltar para a Loja</Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center gap-4"><Button variant="ghost" onClick={() => navigate('/loja')} className="rounded-xl h-10 w-10"><ArrowLeft className="h-6 w-6" /></Button><h2 className="text-3xl font-black">Meu Carrinho</h2></div>
        
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {isInternal && (
              <Card className="p-8 rounded-[3rem] border-4 border-blue-600/10 bg-blue-50/30 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none">Venda Assistida</h3>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Identifique o cliente para faturar</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Selecione o Cliente</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="h-14 rounded-2xl border-blue-200 bg-white shadow-sm">
                      <SelectValue placeholder="Buscar cliente na base..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl max-h-[300px] bg-white border shadow-xl">
                      {allClients.map(c => (
                        <SelectItem key={c.id} value={c.id || "unknown"}>{c.name || "Sem Nome"} ({c.email || ""})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {cart.map((item, idx) => {
                if (!item || !item.id) return null;
                const unitPrice = item.isPromo ? (Number(item.promoPrice) || Number(item.price) || 0) : (Number(item.price) || 0);
                const itemAmount = item.isFractional ? Number(item.totalAmount) : Number(item.quantity);
                const totalItem = unitPrice * (itemAmount || 0);
                
                return (
                  <Card key={`${item.id}-${idx}`} className="p-6 rounded-[2rem] border-none shadow-sm flex items-center gap-6 bg-white">
                    <div className="h-20 w-20 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                      {item.image ? <img src={item.image} className="w-full h-full object-cover" alt={item.name} /> : <Package className="h-10 w-10 text-slate-200" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900">{item.name || "Item sem nome"}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category || "Geral"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border">
                        {!item.isFractional ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, -1)} className="h-8 w-8"><Minus className="h-3 w-3" /></Button>
                            <span className="font-black">{item.quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, 1)} className="h-8 w-8"><Plus className="h-3 w-3" /></Button>
                          </>
                        ) : (
                          <span className="px-4 font-black text-blue-700">{Number(item.totalAmount || 0).toFixed(2)} {item.unitLabel || "un"}</span>
                        )}
                      </div>
                      <p className="font-black text-lg text-slate-900">R$ {totalItem.toFixed(2)}</p>
                      <button onClick={() => handleRemove(item.id)} className="text-[10px] font-bold text-red-500 hover:underline">REMOVER</button>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900">Forma de Pagamento</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('Pix')}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-2",
                    paymentMethod === 'Pix' ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <CheckCircle2 className={cn("h-5 w-5", paymentMethod === 'Pix' ? "text-blue-600" : "text-slate-200")} />
                    <span className="font-black text-blue-700">PIX</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Aprovação imediata</p>
                  <p className="text-xs font-medium text-slate-600 mt-2">16403481000116<br/>BTM DESIGN</p>
                </button>
                <button 
                  onClick={() => setPaymentMethod('Loja')}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 text-left transition-all flex flex-col gap-2",
                    paymentMethod === 'Loja' ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <CheckCircle2 className={cn("h-5 w-5", paymentMethod === 'Loja' ? "text-blue-600" : "text-slate-200")} />
                    <span className="font-black text-slate-900 uppercase">Na Loja</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pague ao retirar</p>
                  <p className="text-xs font-medium text-slate-600 mt-2">Dinheiro, Cartão ou Pix direto no caixa.</p>
                </button>
              </div>
            </div>
          </div>

          <Card className="p-8 rounded-[3rem] shadow-xl bg-white border-none h-fit space-y-8 sticky top-32">
            <h3 className="font-black text-2xl">Resumo</h3>
            <div className="space-y-4">
              <div className="flex justify-between font-bold text-slate-400"><span>Subtotal</span><span>R$ {cartTotal.toFixed(2)}</span></div>
              <div className="pt-6 border-t flex justify-between items-end"><span className="font-black text-slate-900">Total</span><span className="text-3xl font-black text-blue-700">R$ {cartTotal.toFixed(2)}</span></div>
            </div>
            <Button onClick={handleCheckout} className="w-full bg-blue-700 hover:bg-blue-800 h-16 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95">
              {isInternal ? "Registrar Venda" : "Finalizar Pedido"}
            </Button>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              {isInternal ? "A venda será vinculada ao histórico financeiro do cliente selecionado." : "Você será redirecionado para o WhatsApp para confirmar seu pedido."}
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CartPage;