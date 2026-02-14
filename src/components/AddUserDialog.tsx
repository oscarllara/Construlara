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
import { Shield, UserPlus, Mail, Lock, KeyRound } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <UserPlus className="h-6 w-6 text-blue-700" />
            Provisionar Usuário
          </DialogTitle>
          <DialogDescription className="font-medium">
            Cadastre um novo funcionário e defina suas permissões de acesso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold">Nome Completo</Label>
            <Input 
              placeholder="Ex: João Silva" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="rounded-2xl border-slate-200 h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" /> Email Corporativo
            </Label>
            <Input 
              type="email"
              placeholder="joao.silva@construlara.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="rounded-2xl border-slate-200 h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" /> Nível de Acesso
            </Label>
            <Select 
              value={formData.role} 
              onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
            >
              <SelectTrigger className="rounded-2xl border-slate-200 h-12">
                <SelectValue placeholder="Selecione o papel..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="Gestor">Gestor (Admin)</SelectItem>
                <SelectItem value="Operador de Chaves">Operador de Chaves</SelectItem>
                <SelectItem value="Operador de Carros">Operador de Carros</SelectItem>
                <SelectItem value="Visitante">Visitante (Apenas Leitura)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100 flex gap-4">
            <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
              <KeyRound className="h-5 w-5 text-blue-700" />
            </div>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Uma <strong>senha temporária</strong> será enviada para o e-mail informado. O usuário será <strong>obrigado</strong> a alterá-la no primeiro acesso para garantir a segurança da conta.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 shadow-lg shadow-blue-100">
            Criar Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;