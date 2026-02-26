"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, CreditCard, ArrowLeft, Copy, Box, PlusCircle, FileText } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PIX_KEY = "16403481000116";

const CartPage = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'whatsapp' | 'store'>('whatsapp');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualItem, setManualItem] = useState({ name: "", quantity: "1", notes: "" });
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('app_cart');
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        setCart(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) { setCart([]); }
  }, []);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('app_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    try {
      const orderId = `ORD-${Date.now()}`;
      const orderDate = new Date().toLocaleString('pt-BR');
      const userEmail = localStorage.getItem('userEmail') || '';
      
      const savedOrders = localStorage.getItem('app_orders');
      const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
      
      const total = cart.reduce((acc, item) => {
        if (item.isManual) return acc;
        const price = item.isPromo ? (item.promoPrice || item.price) : item.price;
        const amount = item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0);
        return acc + (price * amount);
      }, 0);

      const newOrder = {
        id: orderId,
        date: orderDate,
        userEmail: userEmail,
        items: [...cart],
        total: total,
        paidAmount: 0,
        paymentMethod: paymentMethod,
        status: 'Pendente'
      };

      localStorage.setItem('app_orders', JSON.stringify([newOrder, ...currentOrders]));
      localStorage.removeItem('app_cart');
      setCart([]);
      
      // WhatsApp Message
      const itemsList = cart.map(it => `• ${it.name} (${it.quantity})`).join('%0A');
      const msg = `*NOVO PEDIDO - CONSTRULARA*%0A*ID:* ${orderId}%0A*Itens:*%0A${itemsList}%0A*Pagamento:* ${paymentMethod}`;
      window.open(`https://wa.me/5532999625979?text=${msg}`, '_blank');

      showSuccess("Pedido realizado!");
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('order-placed'));
      
      // Pequeno delay para garantir que o storage atualizou antes do redirect
      setTimeout(() => navigate('/perfil'), 100);
    } catch (e) {
      showError("Erro ao finalizar pedido.");
    }
  };

  if (cart.length === 0) return (
    <AppLayout>
      <div className="max-w-2xl mx-auto text-center py-20">
        <ShoppingBag className="h-16 w-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-2xl font-black">Carrinho Vazio</h2>
        <Button onClick={() => navigate('/loja')} className="mt-6 bg-blue-600 rounded-xl px-8 h-12">Ver Loja</Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        <h2 className="text-3xl font-black">Meu Carrinho</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-4">
            {cart.map(item => (
              <Card key={item.id} className="p-4 rounded-[2rem] border-none shadow-sm flex items-center gap-4 bg-white">
                <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Package className="h-8 w-8 text-slate-300" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.quantity} un</p>
                </div>
                <Button variant="ghost" onClick={() => {
                  const newCart = cart.filter(i => i.id !== item.id);
                  saveCart(newCart);
                }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </Card>
            ))}
          </div>
          <Card className="p-8 rounded-[3rem] shadow-xl bg-white border-none h-fit space-y-6">
            <h3 className="font-black text-xl">Resumo</h3>
            <div className="space-y-4">
              <div className="flex justify-between font-bold text-slate-500"><span>Subtotal</span><span>R$ {cart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span></div>
              <div className="pt-4 border-t flex justify-between items-end"><span className="font-black">Total</span><span className="text-2xl font-black text-blue-700">R$ {cart.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span></div>
            </div>
            <Button onClick={handleCheckout} className="w-full bg-blue-700 h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-100">Concluir Pedido</Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CartPage;