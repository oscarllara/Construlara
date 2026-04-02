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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Package, Plus, Layers, Percent, DollarSign, Trash2, Palette, Scale } from 'lucide-react';
import { Product } from './ProductCard';
import AddUnitDialog from './AddUnitDialog';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: any) => void;
  product?: Product | null;
  categories: string[];
  defaultCategory?: string;
}

const DEFAULT_UNITS = ["un", "m²", "m", "kg", "L", "cx", "saco", "metro³", "carrinho", "caminhão"];

const AddProductDialog = ({ open, onOpenChange, onSave, product, categories, defaultCategory }: AddProductDialogProps) => {
  const [units, setUnits] = useState<string[]>(DEFAULT_UNITS);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [promoMode, setPromoMode] = useState<'value' | 'percent'>('value');
  
  const [formData, setFormData] = useState<any>({
    name: "",
    code: "",
    description: "",
    category: "",
    price: "",
    promoPrice: "",
    promoPercent: "",
    image: "",
    isPromo: false,
    isFeatured: false,
    isFractional: false,
    packageSize: "",
    unitLabel: "un",
    hasCalculator: false,
    hasVariations: false,
    variations: [] // { id, type: 'unit' | 'color', name, price }
  });

  useEffect(() => {
    const savedUnits = localStorage.getItem('app_units');
    if (savedUnits) setUnits(JSON.parse(savedUnits));
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: product.price.toString(),
        promoPrice: product.promoPrice?.toString() || "",
        promoPercent: "",
        packageSize: product.packageSize?.toString() || "",
        hasVariations: (product as any).hasVariations || false,
        variations: (product as any).variations || []
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        category: defaultCategory || (categories[0] !== "Todas" ? categories[0] : categories[1] || ""),
        price: "",
        promoPrice: "",
        promoPercent: "",
        image: "",
        isPromo: false,
        isFeatured: false,
        isFractional: false,
        packageSize: "",
        unitLabel: "un",
        hasCalculator: false,
        hasVariations: false,
        variations: []
      });
    }
  }, [product, open, defaultCategory, categories]);

  const handleAddVariation = (type: 'unit' | 'color') => {
    const newVar = { id: Date.now().toString(), type, name: "", price: formData.price };
    setFormData({ ...formData, variations: [...formData.variations, newVar] });
  };

  const removeVariation = (id: string) => {
    setFormData({ ...formData, variations: formData.variations.filter((v: any) => v.id !== id) });
  };

  const updateVariation = (id: string, field: string, val: any) => {
    setFormData({
      ...formData,
      variations: formData.variations.map((v: any) => v.id === id ? { ...v, [field]: val } : v)
    });
  };

  const calculateFinalPromoPrice = () => {
    const basePrice = parseFloat(formData.price);
    if (isNaN(basePrice)) return undefined;
    if (promoMode === 'percent') {
      const discount = parseFloat(formData.promoPercent);
      if (isNaN(discount)) return undefined;
      return basePrice * (1 - discount / 100);
    } else {
      const finalPrice = parseFloat(formData.promoPrice);
      if (isNaN(finalPrice)) return undefined;
      return finalPrice;
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.category) return;
    const finalPromo = calculateFinalPromoPrice();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      promoPrice: finalPromo,
      packageSize: formData.packageSize ? parseFloat(formData.packageSize) : undefined
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-none shadow-2xl p-8 max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
              <Package className="h-7 w-7 text-blue-600" />
              {product ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Nome do Produto</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-2xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Código/SKU</Label>
                <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="rounded-2xl h-12" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Categoria</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="rounded-2xl h-12 bg-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-white border shadow-xl">
                    {categories.filter(c => c !== "Todas").map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Unidade Base</Label>
                <Select value={formData.unitLabel} onValueChange={(v) => setFormData({...formData, unitLabel: v})}>
                  <SelectTrigger className="rounded-2xl h-12 bg-white">
                    <SelectValue placeholder="un, m², kg..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-white border shadow-xl">
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">Preço Base (R$)</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="rounded-2xl h-12" />
            </div>

            {/* Variations Section */}
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  <Label className="font-black text-slate-900 text-sm">Atributos (Quantidade/Unidade e Cor)</Label>
                </div>
                <Switch 
                  checked={formData.hasVariations} 
                  onCheckedChange={(v) => setFormData({...formData, hasVariations: v})}
                />
              </div>

              {formData.hasVariations && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddVariation('unit')} className="rounded-xl gap-2 font-bold h-10">
                      <Plus className="h-4 w-4" /> Add Unidade (m³, Caminhão...)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAddVariation('color')} className="rounded-xl gap-2 font-bold h-10">
                      <Palette className="h-4 w-4" /> Add Cor
                    </Button>
                  </div>

                  {formData.variations.map((v: any) => (
                    <div key={v.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        {v.type === 'unit' ? <Scale className="h-4 w-4 text-blue-600" /> : <Palette className="h-4 w-4 text-purple-600" />}
                      </div>
                      <Input 
                        placeholder={v.type === 'unit' ? "Ex: Caminhão" : "Ex: Azul"} 
                        value={v.name} 
                        onChange={(e) => updateVariation(v.id, 'name', e.target.value)}
                        className="h-10 rounded-xl border-slate-200 flex-1"
                      />
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">R$</span>
                        <Input 
                          type="number" 
                          value={v.price} 
                          onChange={(e) => updateVariation(v.id, 'price', e.target.value)}
                          className="h-10 rounded-xl border-slate-200 pl-8"
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeVariation(v.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">URL da Imagem</Label>
              <Input value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="rounded-2xl h-12" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Label className="text-[10px] font-black uppercase text-slate-400">Oferta</Label>
                <Switch checked={formData.isPromo} onCheckedChange={(v) => setFormData({...formData, isPromo: v})} />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Label className="text-[10px] font-black uppercase text-slate-400">Destaque</Label>
                <Switch checked={formData.isFeatured} onCheckedChange={(v) => setFormData({...formData, isFeatured: v})} />
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Label className="text-[10px] font-black uppercase text-blue-600">Calculadora</Label>
                <Switch checked={formData.hasCalculator} onCheckedChange={(v) => setFormData({...formData, hasCalculator: v})} />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-6">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-blue-100">Salvar Produto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddProductDialog;