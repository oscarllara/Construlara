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
import { cn } from "@/lib/utils";

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
  
  const hasPromo = product.isPromo && product.promoPrice;
  const currentPrice = hasPromo ? product.promoPrice! : product.price;

  const isPackaged = product.isFractional && product.packageSize && product.packageSize > 0;
  const isFloorCategory = product.category === "Pisos e revestimentos";
  
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
    const num = parseInt(val);
    if (!isNaN(num)) setQuantity(num);
  };

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-md transition-all hover:shadow-xl rounded-[2.5rem] bg-white group relative flex flex-col h-full",
      product.isFeatured && "ring-2 ring-blue-500 ring-offset-2"
    )}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onEdit(product)}
        className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-blue-50 hover:text-blue-600 z-20"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {product.isFeatured && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-blue-600 text-white border-none rounded-full px-3 py-1 flex items-center gap-1 text-[10px] font-black uppercase">
            <Star className="h-3 w-3 fill-white" /> Destaque
          </Badge>
        </div>
      )}
      
      <div 
        className="aspect-square overflow-hidden bg-slate-100 relative flex items-center justify-center shrink-0 cursor-zoom-in"
        onClick={() => setIsZoomOpen(true)}
      >
        {!imgError && product.image ? (
          <>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImgError(true)} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <Package className="h-16 w-16 mb-2" />
            <span className="text-[10px] font-black uppercase">Sem Imagem</span>
          </div>
        )}
      </div>

      <CardHeader className="p-6 pb-2">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          <Tag className="h-3 w-3" /> {product.category} • {product.code}
        </div>
        <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
          {product.name}
        </h3>
      </CardHeader>
      
      <CardContent className="px-6 pb-4 flex-1 space-y-4">
        <p className="text-xs text-slate-500 font-medium line-clamp-2">{product.description}</p>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-700">R$ {currentPrice.toFixed(2)}</span>
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border border-blue-100">
              / {product.unitLabel || 'un'}
            </span>
          </div>
          {hasPromo && <span className="text-xs text-slate-400 line-through font-bold">De R$ {product.price.toFixed(2)}</span>}
        </div>

        {isPackaged && (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">Quanto você precisa ({product.unitLabel})?</Label>
                {isFloorCategory && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black uppercase text-blue-700 hover:bg-blue-100 rounded-lg gap-1">
                        <CalcIcon className="h-3 w-3" /> Calcular Área
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 border-none overflow-hidden"><Calculators /></DialogContent>
                  </Dialog>
                )}
              </div>
              <Input type="number" placeholder={`Ex: 23 ${product.unitLabel}`} value={desiredAmount} onChange={(e) => setDesiredAmount(e.target.value)} className="h-10 rounded-xl border-blue-200 bg-white font-bold" />
            </div>
            {calculatedPacks > 0 && (
              <div className="flex items-start gap-2 text-blue-800">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-tight">Serão necessárias <strong>{calculatedPacks} embalagens</strong>, totalizando <strong>{totalAmount.toFixed(2)}{product.unitLabel}</strong>.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col gap-4">
        {!isPackaged && (
          <div className="flex items-center justify-between w-full bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <Button variant="ghost" size="icon" onClick={handleDecrement} className="h-9 w-9 rounded-xl"><Minus className="h-4 w-4" /></Button>
            <Input type="number" value={quantity} onChange={(e) => handleQuantityChange(e.target.value)} className="w-16 h-9 text-center font-black text-lg border-none bg-transparent focus-visible:ring-0" />
            <Button variant="ghost" size="icon" onClick={handleIncrement} className="h-9 w-9 rounded-xl"><Plus className="h-4 w-4" /></Button>
          </div>
        )}

        <div className="w-full space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">Subtotal</span>
            <span className="text-xl font-black text-slate-900">R$ {totalPrice.toFixed(2)}</span>
          </div>
          <Button 
            onClick={() => onAddToCart(product, calculatedPacks, totalAmount)}
            disabled={(isPackaged && !desiredAmount) || (!isPackaged && currentQuantity === 0)}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black gap-3 h-14 transition-all shadow-xl shadow-blue-100 hover:-translate-y-1 active:scale-95"
          >
            <ShoppingCart className="h-5 w-5" />
            {isPackaged ? `Levar ${calculatedPacks} caixas` : 'Comprar'}
          </Button>
        </div>
      </CardFooter>

      {/* Modal de Zoom Padronizado */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[700px] p-0 border-none bg-transparent shadow-none overflow-hidden flex items-center justify-center">
          <div className="relative w-full flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden w-full aspect-square max-w-[600px] flex items-center justify-center border-8 border-white">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="mt-6 bg-white/90 backdrop-blur-md px-10 py-5 rounded-[2.5rem] shadow-xl text-center border border-white/50 max-w-[90%]">
              <h2 className="text-2xl font-black text-slate-900 leading-tight">{product.name}</h2>
              <div className="flex items-center justify-center gap-3 mt-2">
                <Badge className="bg-blue-50 text-blue-700 border-none text-[10px] font-black uppercase px-3 py-1">{product.category}</Badge>
                <span className="text-lg font-black text-blue-700">R$ {currentPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductCard;