"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Tag, Star, Pencil, Package, Plus, Minus, Info } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [quantity, setQuantity] = useState(1);
  const [desiredAmount, setDesiredAmount] = useState<string>("");
  
  const hasPromo = product.isPromo && product.promoPrice;
  const currentPrice = hasPromo ? product.promoPrice! : product.price;

  // Lógica para produtos vendidos por embalagem (ex: Pisos)
  const isPackaged = product.isFractional && product.packageSize && product.packageSize > 0;
  
  const calculatedPacks = isPackaged && desiredAmount 
    ? Math.ceil(parseFloat(desiredAmount) / product.packageSize!) 
    : quantity;

  const totalAmount = isPackaged 
    ? calculatedPacks * product.packageSize! 
    : quantity;

  const totalPrice = totalAmount * currentPrice;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

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
      
      <div className="aspect-square overflow-hidden bg-slate-100 relative flex items-center justify-center shrink-0">
        {!imgError && product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
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
        <p className="text-xs text-slate-500 font-medium line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-blue-700">R$ {currentPrice.toFixed(2)}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">/ {product.unitLabel || 'un'}</span>
          </div>
          {hasPromo && (
            <span className="text-xs text-slate-400 line-through font-bold">De R$ {product.price.toFixed(2)}</span>
          )}
        </div>

        {isPackaged && (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
                Quanto você precisa ({product.unitLabel})?
              </Label>
              <Input 
                type="number" 
                placeholder={`Ex: 23 ${product.unitLabel}`}
                value={desiredAmount}
                onChange={(e) => setDesiredAmount(e.target.value)}
                className="h-10 rounded-xl border-blue-200 bg-white font-bold"
              />
            </div>
            {calculatedPacks > 0 && (
              <div className="flex items-start gap-2 text-blue-800">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-tight">
                  Serão necessárias <strong>{calculatedPacks} embalagens</strong>, totalizando <strong>{totalAmount.toFixed(2)}{product.unitLabel}</strong>.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col gap-4">
        {!isPackaged && (
          <div className="flex items-center justify-between w-full bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <Button variant="ghost" size="icon" onClick={handleDecrement} className="h-9 w-9 rounded-xl">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-black text-slate-900 text-lg">{quantity}</span>
            <Button variant="ghost" size="icon" onClick={handleIncrement} className="h-9 w-9 rounded-xl">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="w-full space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">Subtotal</span>
            <span className="text-xl font-black text-slate-900">R$ {totalPrice.toFixed(2)}</span>
          </div>
          <Button 
            onClick={() => onAddToCart(product, calculatedPacks, totalAmount)}
            disabled={isPackaged && !desiredAmount}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black gap-3 h-14 transition-all shadow-xl shadow-blue-100 hover:-translate-y-1 active:scale-95"
          >
            <ShoppingCart className="h-5 w-5" />
            {isPackaged ? `Levar ${calculatedPacks} caixas` : 'Comprar'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;