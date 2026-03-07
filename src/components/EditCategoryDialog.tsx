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
import { Pencil, Tag } from 'lucide-react';

interface EditCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (oldName: string, newName: string) => void;
  categoryName: string;
}

const EditCategoryDialog = ({ open, onOpenChange, onSave, categoryName }: EditCategoryDialogProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(categoryName);
  }, [open, categoryName]);

  const handleSubmit = () => {
    if (!name.trim() || name.trim() === categoryName) {
      onOpenChange(false);
      return;
    }
    onSave(categoryName, name.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[3rem] border-none shadow-2xl p-8 bg-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <Pencil className="h-7 w-7 text-blue-600" />
            Editar Categoria
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Altere o nome da categoria. Isso atualizará todos os produtos vinculados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-sm">Novo Nome</Label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
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
            Salvar Alteração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryDialog;