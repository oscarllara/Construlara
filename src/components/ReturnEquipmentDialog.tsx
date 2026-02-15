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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Wrench, RotateCcw, AlertCircle } from 'lucide-react';
import { Equipment } from './EquipmentCard';

interface ReturnEquipmentDialogProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string, nextStatus: 'available' | 'maintenance', notes: string) => void;
}

const ReturnEquipmentDialog = ({ equipment, open, onOpenChange, onConfirm }: ReturnEquipmentDialogProps) => {
  const [notes, setNotes] = useState("");
  const [nextStatus, setNextStatus] = useState<'available' | 'maintenance'>('available');

  const handleConfirm = () => {
    if (!equipment) return;
    onConfirm(equipment.id, nextStatus, notes);
    setNotes("");
    setNextStatus('available');
  };

  if (!equipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-8">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <RotateCcw className="h-7 w-7 text-blue-600" />
            Devolução de Item
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Registrando a entrega de: <span className="text-blue-700 font-bold">{equipment.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-2">
          <div className="space-y-3">
            <Label className="text-slate-700 font-bold text-sm">Estado do Equipamento</Label>
            <RadioGroup 
              value={nextStatus} 
              onValueChange={(v) => setNextStatus(v as 'available' | 'maintenance')}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="available" id="available" className="peer sr-only" />
                <Label
                  htmlFor="available"
                  className="flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="mb-2 h-6 w-6 text-emerald-600" />
                  <span className="text-xs font-bold uppercase">Pronto p/ Uso</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="maintenance" id="maintenance" className="peer sr-only" />
                <Label
                  htmlFor="maintenance"
                  className="flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-50 cursor-pointer transition-all"
                >
                  <Wrench className="mb-2 h-6 w-6 text-orange-600" />
                  <span className="text-xs font-bold uppercase">Manutenção</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-slate-400" /> Observações da Devolução
            </Label>
            <Textarea 
              placeholder="Descreva se há avarias, peças faltando ou se o item retornou em perfeito estado..." 
              className="rounded-2xl min-h-[120px] border-slate-200 text-base"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-blue-100"
          >
            Confirmar Recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnEquipmentDialog;