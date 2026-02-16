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
import { FolderPlus, Tag } from 'lucide-react';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (category: string) => void;
}

const AddCategoryDialog = ({ open, onOpenChange, onAdd }: AddCategoryDialogProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[3rem] border-none shadow-2xl p-8">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <FolderPlus className="h-7 w-7 text-blue-600" />
            Nova Categoria
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Crie uma nova seção para organizar seus produtos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Nome da Categoria</Label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Ex: Ferramentas Manuais" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 rounded-2xl border-slate-200 h-12"
                autoFocus
              />
            </div>
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

export default AddCategoryDialog;