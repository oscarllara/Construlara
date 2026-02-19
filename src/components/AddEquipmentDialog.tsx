"use client";

import React, { useState } from 'react';
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
import { Hammer, PlusCircle, Hash, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Equipment } from './EquipmentCard';

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (equipment: Omit<Equipment, 'id' | 'status'>) => void;
}

const AddEquipmentDialog = ({ open, onOpenChange, onAdd }: AddEquipmentDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Construção",
    serialNumber: "",
    dailyRate: "",
    weeklyRate: "",
    biweeklyRate: "",
    monthlyRate: "",
    image: ""
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.serialNumber || !formData.dailyRate) return;
    
    onAdd({
      name: formData.name,
      category: formData.category,
      serialNumber: formData.serialNumber,
      dailyRate: parseFloat(formData.dailyRate),
      weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : undefined,
      biweeklyRate: formData.biweeklyRate ? parseFloat(formData.biweeklyRate) : undefined,
      monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : undefined,
      image: formData.image
    });
    
    setFormData({ 
      name: "", 
      category: "Construção", 
      serialNumber: "", 
      dailyRate: "",
      weeklyRate: "",
      biweeklyRate: "",
      monthlyRate: "",
      image: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <PlusCircle className="h-7 w-7 text-orange-600" />
            Novo Equipamento
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Adicione uma nova ferramenta ao seu inventário de locação.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-2">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Nome do Equipamento</Label>
            <div className="relative">
              <Hammer className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Ex: Betoneira 400L" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="pl-12 rounded-2xl border-slate-200 h-12 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({...formData, category: v})}
              >
                <SelectTrigger className="rounded-2xl border-slate-200 h-12 text-base">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Construção">Construção</SelectItem>
                  <SelectItem value="Ferramentas Elétricas">Ferramentas Elétricas</SelectItem>
                  <SelectItem value="Energia">Energia</SelectItem>
                  <SelectItem value="Acesso">Acesso</SelectItem>
                  <SelectItem value="Limpeza">Limpeza</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-sm">Nº de Patrimônio</Label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Ex: BT-001" 
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                  className="pl-12 rounded-2xl border-slate-200 h-12 text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">URL da Imagem</Label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="https://exemplo.com/imagem.jpg" 
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="pl-12 rounded-2xl border-slate-200 h-12 text-base"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tabela de Preços (R$)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Diária</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number"
                    placeholder="0.00" 
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({...formData, dailyRate: e.target.value})}
                    className="pl-9 rounded-xl border-slate-200 h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Semanal</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number"
                    placeholder="0.00" 
                    value={formData.weeklyRate}
                    onChange={(e) => setFormData({...formData, weeklyRate: e.target.value})}
                    className="pl-9 rounded-xl border-slate-200 h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Quinzenal</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number"
                    placeholder="0.00" 
                    value={formData.biweeklyRate}
                    onChange={(e) => setFormData({...formData, biweeklyRate: e.target.value})}
                    className="pl-9 rounded-xl border-slate-200 h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Mensal</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    type="number"
                    placeholder="0.00" 
                    value={formData.monthlyRate}
                    onChange={(e) => setFormData({...formData, monthlyRate: e.target.value})}
                    className="pl-9 rounded-xl border-slate-200 h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6 text-base">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold px-8 h-12 text-base shadow-xl shadow-orange-100">
            Cadastrar Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;