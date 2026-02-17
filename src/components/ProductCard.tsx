"use client";

import React, { useState } from 'react';
import { ShoppingCart, Tag, Star, Pencil, Package, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onEdit: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onEdit }: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const hasPromo = product.isPromo && product.promoPrice;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-md transition-all hover:shadow-xl rounded-[2.5rem] bg-white group relative flex flex-col h-full",
      product.isFeatured && "ring-2 ring-blue-500 ring-offset-2"
    )}>
      {/* Botão de Edição Flutuante */}
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
        {hasPromo && (
          <div className="absolute top-4 right-4 group-hover:opacity-0 transition-opacity">
            <Badge className="bg-red-600 text-white border-none rounded-full px-3 py-1 text-[10px] font-black uppercase">
              Oferta
            </Badge>
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
      
      <CardContent className="px-6 pb-4 flex-1">
        <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4">
          {product.description}
        </p>
        
        <div className="flex flex-col">
          {hasPromo ? (
            <>
              <span className="text-xs text-slate-400 line-through font-bold">R$ {product.price.toFixed(2)}</span>
              <span className="text-2xl font-black text-red-600">R$ {product.promoPrice?.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-2xl font-black text-blue-700">R$ {product.price.toFixed(2)}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col gap-4">
        {/* Seletor de Quantidade */}
        <div className="flex items-center justify-between w-full bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDecrement}
            className="h-9 w-9 rounded-xl hover:bg-white hover:text-blue-600 transition-all"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-black text-slate-900 text-lg">{quantity}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleIncrement}
            className="h-9 w-9 rounded-xl hover:bg-white hover:text-blue-600 transition-all"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          onClick={() => onAddToCart(product, quantity)}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black gap-3 h-14 transition-all shadow-xl shadow-blue-100 hover:-translate-y-1 active:scale-95"
        >
          <ShoppingCart className="h-5 w-5" />
          Comprar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;