"use client";

import React from 'react';
import { ShoppingCart, Tag, Star, Pencil } from 'lucide-react';
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
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onEdit }: ProductCardProps) => {
  const hasPromo = product.isPromo && product.promoPrice;

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-md transition-all hover:shadow-xl rounded-[2.5rem] bg-white group relative",
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
      
      <div className="aspect-square overflow-hidden bg-slate-100 relative">
        <img 
          src={product.image || "/placeholder.svg"} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
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
      
      <CardContent className="px-6 pb-4">
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

      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={() => onAddToCart(product)}
          className="w-full bg-slate-900 hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 h-12 transition-all shadow-lg shadow-slate-200"
        >
          <ShoppingCart className="h-4 w-4" />
          Comprar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;