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
import { Shield, UserPlus, Mail, Lock } from 'lucide-react';
import { UserRole } from './UserTable';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (user: any) => void;
}

const AddUserDialog = ({ open, onOpenChange, onAdd }: AddUserDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Operador de Chaves" as UserRole
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email) return;
    onAdd(formData);
    setFormData({ name: "", email: "", role: "Operador de Chaves" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            Provisionar Usuário
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo funcionário e defina suas permissões de acesso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Nome Completo</Label>
            <Input 
              placeholder="Ex: João Silva" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" /> Email Corporativo
            </Label>
            <Input 
              type="email"
              placeholder="joao.silva@empresa.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" /> Nível de Acesso
            </Label>
            <Select 
              value={formData.role} 
              onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
            >
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue placeholder="Selecione o papel..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="Gestor">Gestor (Admin)</SelectItem>
                <SelectItem value="Operador de Chaves">Operador de Chaves</SelectItem>
                <SelectItem value="Operador de Carros">Operador de Carros</SelectItem>
                <SelectItem value="Visitante">Visitante (Apenas Leitura)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
            <Lock className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Uma <strong>senha temporária</strong> será enviada para o email informado. O usuário deverá alterá-la no primeiro acesso.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            Criar Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;