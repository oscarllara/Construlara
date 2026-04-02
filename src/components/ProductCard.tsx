"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Tag, Star, Pencil, Package, Plus, Minus, Info, Calculator as CalcIcon, Palette, Scale } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Calculators from './Calculators';
import { cn } from "@/lib/utils";
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
  hasVariations?: boolean;
  variations?: Array<{ id: string, type: 'unit' | 'color', name: string, price: number | string }>;
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
  
  const [selectedUnitVar, setSelectedUnitVar] = useState<string>("base");
  const [selectedColorVar, setSelectedColorVar] = useState<string>("base");

  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isAdmin = ['Gestor', 'Vendas'].includes(userRole);
  
  const unitVariations = product.variations?.filter(v => v.type === 'unit') || [];
  const colorVariations = product.variations?.filter(v => v.type === 'color') || [];

  const getPrice = () => {
    let base = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
    
    if (selectedUnitVar !== "base") {
      const v = unitVariations.find(uv => uv.id === selectedUnitVar);
      if (v) base = Number(v.price);
    }
    
    if (selectedColorVar !== "base") {
      const v = colorVariations.find(cv => cv.id === selectedColorVar);
      if (v) {
        // Se a cor tiver preço diferente, ela pode somar ou substituir. 
        // Aqui vamos assumir que o preço da variação substitui o base.
        base = Number(v.price);
      }
    }
    
    return base;
  };

  const currentPrice = getPrice();
  const isPackaged = product.isFractional && product.packageSize && product.packageSize > 0;
  const hasCalculator = product.category === "Pisos e revestimentos" || product.category === "Argamassa";
  
  const currentQuantity = quantity === "" ? 0 : Number(quantity);
  const calculatedPacks = isPackaged && desiredAmount ? Math.ceil(parseFloat(desiredAmount) / product.packageSize!) : currentQuantity;
  const totalAmount = isPackaged ? calculatedPacks * product.packageSize! : currentQuantity;
  const totalPrice = totalAmount * currentPrice;

  const handleAction = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    const unitName = selectedUnitVar === "base" ? product.unitLabel : unitVariations.find(v => v.id === selectedUnitVar)?.name;
    const colorName = selectedColorVar === "base" ? "" : colorVariations.find(v => v.id === selectedColorVar)?.name;

    const productToCart = {
      ...product,
      price: currentPrice,
      unitLabel: unitName,
      selectedColor: colorName,
      name: `${product.name}${colorName ? ' (' + colorName + ')' : ''}${selectedUnitVar !== 'base' ? ' - ' + unitName : ''}`
    };

    onAddToCart(productToCart, calculatedPacks, totalAmount);
  };

  const handleCalcResult = (value: number) => {
    if (product.category === "Argamassa") {
      setQuantity(Math.ceil(value));
      setDesiredAmount(Math.ceil(value).toString());
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
      {isAdmin && (
        <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20">
          <Pencil className="h-4 w-4" />
        </Button>
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
          <Tag className="h-3 w-3" /> {product.category}
        </div>
        <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors">{product.name}</h3>
      </CardHeader>
      
      <CardContent className="px-6 pb-4 flex-1 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-blue-700">R$ {currentPrice.toFixed(2)}</span>
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
            / {selectedUnitVar === "base" ? (product.unitLabel || 'un') : unitVariations.find(v => v.id === selectedUnitVar)?.name}
          </span>
        </div>

        {/* Variations Selection */}
        {product.hasVariations && (
          <div className="space-y-3">
            {unitVariations.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Scale className="h-3 w-3" /> Unidade/Medida
                </Label>
                <Select value={selectedUnitVar} onValueChange={setSelectedUnitVar}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="base">{product.unitLabel || 'Padrão'}</SelectItem>
                    {unitVariations.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name} (R$ {Number(v.price).toFixed(2)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {colorVariations.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                  <Palette className="h-3 w-3" /> Cor/Acabamento
                </Label>
                <Select value={selectedColorVar} onValueChange={setSelectedColorVar}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-slate-50/50 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="base">Padrão</SelectItem>
                    {colorVariations.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name} (R$ {Number(v.price).toFixed(2)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {(isPackaged || hasCalculator) && (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black text-blue-600 uppercase">Quantidade Necessária</Label>
              {hasCalculator && (
                <Button variant="ghost" size="sm" onClick={() => setIsCalcOpen(true)} className="h-6 text-[9px] font-black uppercase text-blue-700 hover:bg-blue-100 rounded-lg gap-1"><CalcIcon className="h-3 w-3" /> Calcular</Button>
              )}
            </div>
            <Input type="number" placeholder={`Ex: 23 ${product.unitLabel}`} value={desiredAmount} onChange={(e) => setDesiredAmount(e.target.value)} className="h-10 rounded-xl border-blue-200 bg-white font-bold" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex flex-col gap-4">
        {!isPackaged && (
          <div className="flex items-center justify-between w-full bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
            <Button variant="ghost" size="icon" onClick={() => setQuantity(prev => Math.max(1, Number(prev) - 1))} className="h-9 w-9 rounded-xl"><Minus className="h-3 w-3" /></Button>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-16 h-9 text-center font-black text-lg border-none bg-transparent focus-visible:ring-0" />
            <Button variant="ghost" size="icon" onClick={() => setQuantity(prev => Number(prev) + 1)} className="h-9 w-9 rounded-xl"><Plus className="h-3 w-3" /></Button>
          </div>
        )}
        
        <div className="w-full space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">Subtotal</span>
            <span className="text-xl font-black text-slate-900">R$ {totalPrice.toFixed(2)}</span>
          </div>
          <Button onClick={handleAction} disabled={(isPackaged && !desiredAmount) || (!isPackaged && currentQuantity === 0)} className="w-full rounded-2xl font-black gap-3 h-14 shadow-xl transition-all bg-blue-700 hover:bg-blue-800 text-white shadow-blue-100">
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

      <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 border-none overflow-hidden">
          <Calculators onResult={handleCalcResult} hideHeader />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductCard;