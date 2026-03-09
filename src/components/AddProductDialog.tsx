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
import { Package, Plus, Layers } from 'lucide-react';
import { Product } from './ProductCard';
import AddUnitDialog from './AddUnitDialog';
import { showSuccess } from '@/utils/toast';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: any) => void;
  product?: Product | null;
  categories: string[];
  defaultCategory?: string;
}

const DEFAULT_UNITS = ["un", "m²", "m", "kg", "L", "cx", "saco"];

const AddProductDialog = ({ open, onOpenChange, onSave, product, categories, defaultCategory }: AddProductDialogProps) => {
  const [units, setUnits] = useState<string[]>(DEFAULT_UNITS);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    category: "",
    price: "",
    promoPrice: "",
    image: "",
    isPromo: false,
    isFeatured: false,
    isFractional: false,
    packageSize: "",
    unitLabel: "un"
  });

  useEffect(() => {
    const savedUnits = localStorage.getItem('app_units');
    if (savedUnits) {
      setUnits(JSON.parse(savedUnits));
    }
  }, []);

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
        isFeatured: product.isFeatured,
        isFractional: product.isFractional || false,
        packageSize: product.packageSize?.toString() || "",
        unitLabel: product.unitLabel || "un"
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
        isFeatured: false,
        isFractional: false,
        packageSize: "",
        unitLabel: "un"
      });
    }
  }, [product, open, defaultCategory, categories]);

  const handleAddUnit = (newUnit: string) => {
    if (units.includes(newUnit)) return;
    const newUnits = [...units, newUnit];
    setUnits(newUnits);
    localStorage.setItem('app_units', JSON.stringify(newUnits));
    setFormData({ ...formData, unitLabel: newUnit });
    setIsAddUnitOpen(false);
    showSuccess(`Unidade "${newUnit}" adicionada.`);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.category) return;
    
    onSave({
      id: product?.id,
      ...formData,
      price: parseFloat(formData.price),
      promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : undefined,
      packageSize: formData.packageSize ? parseFloat(formData.packageSize) : undefined
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px] rounded-[3rem] border-none shadow-2xl p-8 max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
              <Package className="h-7 w-7 text-blue-600" />
              {product ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription className="text-base font-medium">
              Informe as características do produto para exibição na loja.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Nome do Produto</Label>
                <Input 
                  placeholder="Ex: Argamassa AC-III 20kg" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Código/SKU</Label>
                <Input 
                  placeholder="AR-001" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12"
                />
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
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700 font-bold text-sm">Unidade de Venda</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsAddUnitOpen(true)}
                    className="h-6 text-[9px] font-black uppercase text-blue-700 hover:bg-blue-50 rounded-lg gap-1"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Select value={formData.unitLabel} onValueChange={(v) => setFormData({...formData, unitLabel: v})}>
                  <SelectTrigger className="rounded-2xl h-12 bg-white">
                    <SelectValue placeholder="un, m², kg..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl bg-white border shadow-xl">
                    {units.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <Label className="font-black text-blue-900 text-sm">Venda por Embalagem/Caixa</Label>
                </div>
                <Switch 
                  checked={formData.isFractional} 
                  onCheckedChange={(v) => setFormData({...formData, isFractional: v})}
                />
              </div>
              
              {formData.isFractional && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-blue-600 uppercase">Tamanho da Embalagem</Label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 2.43" 
                      value={formData.packageSize}
                      onChange={(e) => setFormData({...formData, packageSize: e.target.value})}
                      className="rounded-xl border-blue-200 h-11"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <p className="text-[10px] text-blue-500 font-medium leading-tight">
                      O cliente informará quanto precisa em <strong>{formData.unitLabel}</strong> e o sistema arredondará para caixas fechadas.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Preço por {formData.unitLabel} (R$)</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-sm">Preço Oferta (Opcional)</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  value={formData.promoPrice}
                  onChange={(e) => setFormData({...formData, promoPrice: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">URL da Imagem</Label>
              <Input 
                placeholder="https://..." 
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="rounded-2xl border-slate-200 h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Label className="text-xs font-bold">Ativar Oferta</Label>
                <Switch 
                  checked={formData.isPromo} 
                  onCheckedChange={(v) => setFormData({...formData, isPromo: v})}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Label className="text-xs font-bold">Destaque</Label>
                <Switch 
                  checked={formData.isFeatured} 
                  onCheckedChange={(v) => setFormData({...formData, isFeatured: v})}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-6">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-blue-100">
              Salvar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddUnitDialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen} onAdd={handleAddUnit} />
    </>
  );
};

export default AddProductDialog;