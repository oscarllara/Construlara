"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { UserAccount } from '@/components/UserTable';

const CartPage = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Loja'>('Pix');
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [allClients, setAllClients] = useState<UserAccount[]>([]);
  const navigate = useNavigate();

  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isInternal = ['Gestor', 'Vendas'].includes(userRole);
  const currentUserEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    const saved = localStorage.getItem('app_cart');
    if (saved) setCart(JSON.parse(saved));
    if (isInternal) {
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) setAllClients(JSON.parse(savedUsers).filter((u: any) => u.role === 'Cliente'));
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
          return { ...item, totalAmount: Math.max(step, (Number(item.totalAmount) || step) + (delta * step)) };
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

    const newOrder = { id: orderId, date, userEmail: finalEmail, clientName: finalName, items: [...cart], total, paidAmount: 0, paymentMethod, status: 'Pendente' };
    localStorage.setItem('app_orders', JSON.stringify([newOrder, ...savedOrders]));
    
    let itemsText = cart.map(it => `• ${it.name}: ${it.isFractional ? it.totalAmount.toFixed(2) + (it.unitLabel || 'm²') : it.quantity + ' un'}`).join('%0A');
    const whatsappMsg = `*PEDIDO CONSTRULARA*%0A*ID:* ${orderId}%0A*Cliente:* ${finalName}%0A*Pagamento:* ${paymentMethod}%0A%0A*Itens:*%0A${itemsText}%0A%0A*TOTAL: R$ ${total.toFixed(2)}*`;
    
    window.open(`https://wa.me/5532999625979?text=${whatsappMsg}`, '_blank');
    localStorage.removeItem('app_cart');
    showSuccess("Pedido realizado!");
    window.dispatchEvent(new Event('order-placed'));
    navigate(isInternal ? '/relatorios' : '/perfil?tab=orders');
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <h2 className="text-3xl font-black">Meu Carrinho</h2>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {isInternal && (
              <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-100 space-y-4">
                <Label className="font-bold flex items-center gap-2"><UserCheck className="h-4 w-4" /> Cliente da Venda</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="h-12 bg-white rounded-xl">
                    <SelectValue placeholder="Selecione o cliente..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {allClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-4">
              {cart.map(item => (
                <Card key={item.id} className="p-6 rounded-3xl border-none shadow-sm flex items-center gap-6 bg-white">
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900">{item.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border">
                    <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                    <span className="font-black">{item.isFractional ? item.totalAmount.toFixed(2) : item.quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleUpdateQty(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <p className="font-black text-lg text-blue-700 w-24 text-right">R$ {( (item.isPromo ? (item.promoPrice || item.price) : item.price) * (item.isFractional ? item.totalAmount : item.quantity) ).toFixed(2)}</p>
                  <Button variant="ghost" onClick={() => saveCart(cart.filter(i => i.id !== item.id))} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          </div>
          <Card className="p-8 rounded-[3rem] shadow-xl bg-white border-none h-fit space-y-8">
            <h3 className="font-black text-2xl text-center">Total: R$ {total.toFixed(2)}</h3>
            <Button onClick={handleCheckout} className="w-full bg-blue-700 hover:bg-blue-800 h-16 rounded-[2rem] font-black text-xl shadow-2xl">Finalizar via WhatsApp</Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CartPage;