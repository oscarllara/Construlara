"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Package, Tag, DollarSign, Image as ImageIcon, Hash } from 'lucide-react';
import { Product } from './ProductCard';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: any) => void;
  product?: Product | null;
  categories: string[];
  defaultCategory?: string;
}

const AddProductDialog = ({ open, onOpenChange, onSave, product, categories, defaultCategory }: AddProductDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "",
    price: "",
    promoPrice: "",
    image: "",
    isPromo: false,
    isFeatured: false
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        code: product.code,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        promoPrice: product.promoPrice?.toString() || "",
        image: product.image,
        isPromo: product.isPromo,
        isFeatured: product.isFeatured
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        category: defaultCategory || (categories[0] !== "Todas" ? categories[0] : categories[1] || ""),
        price: "",
        promoPrice: "",
        image: "",
        isPromo: false,
        isFeatured: false
      });
    }
  }, [product, open, defaultCategory, categories]);

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.category) return;
    
    onSave({
      id: product?.id,
      ...formData,
      price: parseFloat(formData.price),
      promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            {product ? <Package className="h-7 w-7 text-blue-600" /> : <Package className="h-7 w-7 text-emerald-600" />}
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            {product ? "Atualize as informações do item no catálogo." : "Adicione um novo item ao catálogo da loja."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">Nome do Produto</Label>
              <Input 
                placeholder="Ex: Porcelanato 60x60" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-2xl border-slate-200 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">Código/SKU</Label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="PR-001" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="pl-10 rounded-2xl border-slate-200 h-12"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Categoria</Label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData({...formData, category: v})}
            >
              <SelectTrigger className="rounded-2xl border-slate-200 h-12">
                <SelectValue placeholder="Selecione a categoria..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {categories.filter(c => c !== "Todas").map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Descrição Curta</Label>
            <Textarea 
              placeholder="Detalhes do produto..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="rounded-2xl border-slate-200 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">Preço Base (R$)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="number"
                  placeholder="0.00" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="pl-10 rounded-2xl border-slate-200 h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">Preço Oferta (Opcional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="number"
                  placeholder="0.00" 
                  value={formData.promoPrice}
                  onChange={(e) => setFormData({...formData, promoPrice: e.target.value})}
                  className="pl-10 rounded-2xl border-slate-200 h-12"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">URL da Imagem</Label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="https://..." 
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="pl-10 rounded-2xl border-slate-200 h-12"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">Ativar Oferta</Label>
              <p className="text-xs text-slate-500">Exibir preço promocional</p>
            </div>
            <Switch 
              checked={formData.isPromo} 
              onCheckedChange={(v) => setFormData({...formData, isPromo: v})} 
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold">Produto em Destaque</Label>
              <p className="text-xs text-slate-500">Exibir selo de destaque</p>
            </div>
            <Switch 
              checked={formData.isFeatured} 
              onCheckedChange={(v) => setFormData({...formData, isFeatured: v})} 
            />
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-blue-100">
            {product ? "Salvar Alterações" : "Cadastrar Produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;