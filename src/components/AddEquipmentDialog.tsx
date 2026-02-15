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
import { Hammer, PlusCircle, Hash, DollarSign } from 'lucide-react';
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
    dailyRate: ""
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.serialNumber || !formData.dailyRate) return;
    
    onAdd({
      name: formData.name,
      category: formData.category,
      serialNumber: formData.serialNumber,
      dailyRate: parseFloat(formData.dailyRate)
    });
    
    setFormData({ name: "", category: "Construção", serialNumber: "", dailyRate: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-[3rem] border-none shadow-2xl p-8">
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
            <Label className="text-slate-700 font-bold text-sm">Valor da Diária (R$)</Label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                type="number"
                placeholder="0.00" 
                value={formData.dailyRate}
                onChange={(e) => setFormData({...formData, dailyRate: e.target.value})}
                className="pl-12 rounded-2xl border-slate-200 h-12 text-base"
              />
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