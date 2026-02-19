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
import { Scale, Plus } from 'lucide-react';

interface AddUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (unit: string) => void;
}

const AddUnitDialog = ({ open, onOpenChange, onAdd }: AddUnitDialogProps) => {
  const [unit, setUnit] = useState("");

  const handleSubmit = () => {
    if (!unit.trim()) return;
    onAdd(unit.trim());
    setUnit("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[3rem] border-none shadow-2xl p-8 bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <Scale className="h-7 w-7 text-blue-600" />
            Nova Unidade
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Adicione uma nova unidade de medida (ex: Par, Rolo, Kit).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Sigla ou Nome</Label>
            <Input 
              placeholder="Ex: Par" 
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-2xl border-slate-200 h-12"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-blue-100">
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUnitDialog;