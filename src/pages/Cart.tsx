"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle, CreditCard, ArrowLeft, Copy, CheckCircle2, Box, Store, PlusCircle, FileText } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
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
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error("Erro ao carregar carrinho:", e);
      setCart([]);
    }
  }, []);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('app_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        const newTotalAmount = item.isFractional ? newQty * (item.packageSize || 1) : newQty;
        return { ...item, quantity: newQty, totalAmount: newTotalAmount };
      }
      return item;
    });
    saveCart(newCart);
  };

  const handleManualQuantity = (id: string, val: string) => {
    const num = parseInt(val);
    if (isNaN(num)) return;
    
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, num);
        const newTotalAmount = item.isFractional ? newQty * (item.packageSize || 1) : newQty;
        return { ...item, quantity: newQty, totalAmount: newTotalAmount };
      }
      return item;
    });
    saveCart(newCart);
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    saveCart(newCart);
    showSuccess("Item removido do carrinho.");
  };

  const handleAddManualItem = () => {
    if (!manualItem.name) return;
    
    const newItem = {
      id: `manual-${Date.now()}`,
      name: manualItem.name,
      quantity: parseInt(manualItem.quantity) || 1,
      price: 0,
      isManual: true,
      notes: manualItem.notes,
      image: "",
      code: "MANUAL",
      category: "Pedido Manual"
    };
    
    saveCart([...cart, newItem]);
    setManualItem({ name: "", quantity: "1", notes: "" });
    setIsManualOpen(false);
    showSuccess("Item manual adicionado!");
  };

  const total = cart.reduce((acc, item) => {
    if (item.isManual) return acc;
    const price = item.isPromo ? (item.promoPrice || item.price) : item.price;
    const amount = item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0);
    return acc + (price * amount);
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const orderId = `ORD-${Date.now()}`;
    const orderDate = new Date().toLocaleString('pt-BR');
    const userEmail = localStorage.getItem('userEmail') || '';
    
    try {
      const savedOrders = localStorage.getItem('app_orders');
      const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
      const newOrder = {
        id: orderId,
        date: orderDate,
        userEmail: userEmail,
        items: [...cart],
        total: total,
        paymentMethod: paymentMethod,
        status: 'Pendente'
      };
      localStorage.setItem('app_orders', JSON.stringify([newOrder, ...currentOrders]));

      const itemsList = cart.map(item => {
        if (item.isManual) {
          return `• [MANUAL] ${item.quantity}x ${item.name} ${item.notes ? `(${item.notes})` : ''} - R$ A combinar`;
        }
        const price = item.isPromo ? (item.promoPrice || item.price) : item.price;
        const detail = item.isFractional 
          ? `${item.quantity} cx (${(item.totalAmount || 0).toFixed(2)}${item.unitLabel || 'un'})`
          : `${item.quantity} un`;
        return `• ${item.name} [${detail}] - R$ ${(price * (item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0))).toFixed(2)}`;
      }).join('\n');

      const methodLabel = paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'store' ? 'Pagar na Loja' : 'WhatsApp';

      const message = `*NOVO PEDIDO - CONSTRULARA*\n` +
        `*ID:* ${orderId}\n` +
        `*Data:* ${orderDate}\n\n` +
        `*Itens:*\n${itemsList}\n\n` +
        `*Total:* R$ ${total > 0 ? total.toFixed(2) : 'A combinar'}\n` +
        `*Pagamento:* ${methodLabel}\n\n` +
        `Por favor, confirme meu pedido!`;

      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/5532999625979?text=${encoded}`, '_blank');
      
      localStorage.removeItem('app_cart');
      setCart([]);
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('order-placed'));
      showSuccess("Pedido registrado com sucesso!");
      navigate('/perfil');
    } catch (e) {
      showError("Erro ao processar pedido. Tente novamente.");
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    showSuccess("Chave PIX copiada!");
  };

  if (cart.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center py-20 space-y-6">
          <div className="h-24 w-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Seu carrinho está vazio</h2>
          <p className="text-slate-500 font-medium">Que tal dar uma olhada nos nossos produtos?</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/loja')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold px-8 h-12">
              Ir para a Loja
            </Button>
            <Button variant="outline" onClick={() => setIsManualOpen(true)} className="rounded-2xl font-bold px-8 h-12 border-slate-200">
              Pedido Manual
            </Button>
          </div>
        </div>

        <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-8 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <PlusCircle className="h-7 w-7 text-blue-600" /> Pedido Manual
              </DialogTitle>
              <DialogDescription className="font-medium">
                Adicione um item que não encontrou no catálogo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold">Nome do Produto/Material</Label>
                <Input 
                  placeholder="Ex: Areia Lavada (m³)" 
                  value={manualItem.name}
                  onChange={(e) => setManualItem({...manualItem, name: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Quantidade</Label>
                <Input 
                  type="number" 
                  value={manualItem.quantity}
                  onChange={(e) => setManualItem({...manualItem, quantity: e.target.value})}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Observações (Opcional)</Label>
                <Textarea 
                  placeholder="Detalhes como cor, marca ou especificações..." 
                  value={manualItem.notes}
                  onChange={(e) => setManualItem({...manualItem, notes: e.target.value})}
                  className="rounded-xl min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsManualOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
              <Button onClick={handleAddManualItem} className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold px-8">Adicionar ao Carrinho</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/loja')} className="rounded-xl gap-2 font-bold text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Continuar Comprando
          </Button>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setIsManualOpen(true)} className="rounded-xl gap-2 font-bold border-slate-200 h-10">
              <PlusCircle className="h-4 w-4" /> Item Manual
            </Button>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Meu Carrinho</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden group">
                <div className="flex items-center p-4 gap-6">
                  <div className="h-24 w-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="h-10 w-10 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-200">
                        {item.code}
                      </Badge>
                      {item.isFractional && (
                        <Badge className="bg-blue-50 text-blue-700 border-none text-[10px] font-black uppercase flex items-center gap-1">
                          <Box className="h-3 w-3" /> Venda por Caixa
                        </Badge>
                      )}
                      {item.isManual && (
                        <Badge className="bg-orange-50 text-orange-700 border-none text-[10px] font-black uppercase">
                          Item Manual
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-3 flex items-center gap-6">
                      <div className="flex items-center bg-slate-100 rounded-xl p-1">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-lg">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => handleManualQuantity(item.id, e.target.value)}
                          className="w-12 h-8 text-center font-black text-sm border-none bg-transparent focus-visible:ring-0 p-0"
                        />
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-lg">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {!item.isManual && (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Total {item.unitLabel || 'un'}</span>
                          <span className="font-black text-slate-900">
                            {item.isFractional ? (item.totalAmount || 0).toFixed(2) : (item.quantity || 0)} {item.unitLabel || 'un'}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col ml-auto pr-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Subtotal</span>
                        <span className="font-black text-blue-700">
                          {item.isManual ? "A combinar" : `R$ ${((item.isPromo ? (item.promoPrice || item.price) : item.price) * (item.isFractional ? (item.totalAmount || 0) : (item.quantity || 0))).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(item.id)}
                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-[3rem] bg-white p-8 space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="text-xl font-black">Resumo do Pedido</CardTitle>
              </CardHeader>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold text-slate-500">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-600">
                  <span>Frete</span>
                  <span>A combinar</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="text-3xl font-black text-blue-700">
                    {total > 0 ? `R$ ${total.toFixed(2)}` : "A combinar"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forma de Pagamento</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                      paymentMethod === 'whatsapp' ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400"
                    )}
                  >
                    <MessageCircle className="h-5 w-5 mb-1" />
                    <span className="text-[8px] font-black uppercase">WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('pix')}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                      paymentMethod === 'pix' ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400"
                    )}
                  >
                    <CreditCard className="h-5 w-5 mb-1" />
                    <span className="text-[8px] font-black uppercase">PIX</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('store')}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all",
                      paymentMethod === 'store' ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400"
                    )}
                  >
                    <Store className="h-5 w-5 mb-1" />
                    <span className="text-[8px] font-black uppercase">Na Loja</span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'pix' && (
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Chave PIX (CNPJ)</p>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                    <code className="text-sm font-bold">{PIX_KEY}</code>
                    <Button variant="ghost" size="icon" onClick={copyPix} className="h-8 w-8 text-white hover:bg-white/20">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCheckout}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-100"
              >
                Concluir Pedido
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isManualOpen} onOpenChange={setIsManualOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <PlusCircle className="h-7 w-7 text-blue-600" /> Pedido Manual
            </DialogTitle>
            <DialogDescription className="font-medium">
              Adicione um item que não encontrou no catálogo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold">Nome do Produto/Material</Label>
              <Input 
                placeholder="Ex: Areia Lavada (m³)" 
                value={manualItem.name}
                onChange={(e) => setManualItem({...manualItem, name: e.target.value})}
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Quantidade</Label>
              <Input 
                type="number" 
                value={manualItem.quantity}
                onChange={(e) => setManualItem({...manualItem, quantity: e.target.value})}
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Observações (Opcional)</Label>
              <Textarea 
                placeholder="Detalhes como cor, marca ou especificações..." 
                value={manualItem.notes}
                onChange={(e) => setManualItem({...manualItem, notes: e.target.value})}
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsManualOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
            <Button onClick={handleAddManualItem} className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold px-8">Adicionar ao Carrinho</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CartPage;