"use client";

import React, { useState } from 'react';
import { ShoppingCart, Tag, Star, Pencil, Package, Plus, Minus, Info, Calculator as CalcIcon, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import Calculators from './Calculators';
import { cn } from "@/utils/utils";
import { useNavigate } from 'react-router-dom';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;
  promoPrice?: number;
  image: string;
  isPromo: boolean;
  isFeatured: boolean;
  isFractional?: boolean;
  packageSize?: number;
  unitLabel?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, totalAmount?: number) => void;
  onEdit: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onEdit }: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [desiredAmount, setDesiredAmount] = useState<string>("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const navigate = useNavigate();
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole') || 'Visitante';
  
  const canEdit = isLoggedIn && ['Gestor', 'Vendas'].includes(userRole);
  const hasPromo = product.isPromo && product.promoPrice;
  const currentPrice = hasPromo ? product.promoPrice! : product.price;

  const isPackaged = product.isFractional && product.packageSize && product.packageSize > 0;
  
  // A calculadora aparece se estiver ativada no cadastro OU se for das categorias padrão
  const hasCalculator = (product as any).hasCalculator || product.category === "Pisos e revestimentos" || product.category === "Argamassa";
  
  const currentQuantity = quantity === "" ? 0 : Number(quantity);

  const calculatedPacks = isPackaged && desiredAmount 
    ? Math.ceil(parseFloat(desiredAmount) / product.packageSize!) 
    : currentQuantity;

  const totalAmount = isPackaged 
    ? calculatedPacks * product.packageSize! 
    : currentQuantity;

  const totalPrice = totalAmount * currentPrice;

  const handleIncrement = () => setQuantity(prev => (prev === "" ? 1 : Number(prev) + 1));
  const handleDecrement = () => setQuantity(prev => (prev === "" ? 1 : Math.max(1, Number(prev) - 1)));
  
  const handleQuantityChange = (val: string) => {
    if (val === "") {
      setQuantity("");
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) setQuantity(num);
  };

  const handleAction = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    onAddToCart(product, calculatedPacks, totalAmount);
  };

  const handleCalcResult = (value: number) => {
    if (product.category === "Argamassa") {
      const bags = Math.ceil(value);
      setQuantity(bags);
      setDesiredAmount(bags.toString());
    } else {
      setDesiredAmount(value.toFixed(2));
    }
    setIsCalcOpen(false);
  };

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-md transition-all hover:shadow-xl rounded-[2.5rem] bg-white group relative flex flex-col h-full",
      product.isFeatured && "ring-2 ring-blue-500 ring-offset-2"
    )}>
      {canEdit && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onEdit(product)}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {product.isFeatured && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-blue-600 text-white border-none rounded-full px-3 py-1 flex items-center gap-1 text-[10px] font-black uppercase">
            <Star className="h-3 w-3 fill-white" /> Destaque
          </Badge>
        </div>
      )}
      
      <div className="aspect-square overflow-hidden bg-slate-100 relative flex items-center justify-center cursor-zoom-in" onClick={() => setIsZoomOpen(true)}>
        {!imgError && product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImgError(true)} />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <Package className="h-16 w-16 mb-2" />
            <span className="text-[10px] font-black uppercase">Sem Imagem</span>
          </div>
        )}
      </div>

      <CardHeader className="p-6 pb-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase mb-1">
          <Tag className="h-3 w-3" /> {product.category} • {product.code}
        </div>
        <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">{product.name}</h3>
      </CardHeader>
      
      <CardContent className="px-6 pb-4 flex-1 space-y-4">
        <p className="text-xs text-slate-500 font-medium line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-blue-700">R$ {currentPrice.toFixed(2)}</span>
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">/ {product.unitLabel || 'un'}</span>
        </div>

        {(isPackaged || hasCalculator) && (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-blue-600 uppercase">Quanto você precisa?</Label>
                {hasCalculator && (
                  <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-blue-700 hover:bg-blue-100 rounded-lg gap-1"><CalcIcon className="h-3 w-3" /> Calcular</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 border-none overflow-hidden"><Calculators onResult={handleCalcResult} hideHeader /></DialogContent>
                  </Dialog>
                )}
              </div>
              <Input 
                type="number" 
                placeholder={`Ex: 23 ${product.unitLabel}`} 
                value={desiredAmount} 
                onChange={(e) => setDesiredAmount(e.target.value)} 
                className="h-10 rounded-xl border-blue-200 bg-white font-bold" 
              />
            </div>
            {isPackaged && calculatedPacks > 0 && (
              <p className="text-[10px] font-bold text-blue-800 leading-tight flex gap-2"><Info className="h-4 w-4 shrink-0" /> Serão necessárias {calculatedPacks} embalagens ({totalAmount.toFixed(2)}{product.unitLabel}).</p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col gap-4">
        {!isPackaged && (
          <div className="flex items-center justify-between w-full bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <Button variant="ghost" size="icon" onClick={handleDecrement} className="h-9 w-9 rounded-xl"><Minus className="h-3 w-3" /></Button>
            <Input type="number" value={quantity} onChange={(e) => handleQuantityChange(e.target.value)} className="w-16 h-9 text-center font-black text-lg border-none bg-transparent focus-visible:ring-0" />
            <Button variant="ghost" size="icon" onClick={handleIncrement} className="h-9 w-9 rounded-xl"><Plus className="h-3 w-3" /></Button>
          </div>
        )}
        
        <div className="w-full space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">Subtotal</span>
            <span className="text-xl font-black text-slate-900">R$ {totalPrice.toFixed(2)}</span>
          </div>
          
          <Button 
            onClick={handleAction} 
            disabled={(isPackaged && !desiredAmount) || (!isPackaged && currentQuantity === 0)} 
            className="w-full rounded-2xl font-black gap-3 h-14 shadow-xl transition-all bg-blue-700 hover:bg-blue-800 text-white shadow-blue-100 hover:-translate-y-1"
          >
            <ShoppingCart className="h-5 w-5" /> 
            {isPackaged ? `Levar ${calculatedPacks} caixas` : 'Adicionar ao Carrinho'}
          </Button>
        </div>
      </CardFooter>

      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[700px] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden w-full max-w-[600px] aspect-square flex items-center justify-center p-4">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductCard;