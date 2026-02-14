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
import { Shield, UserPlus, Mail, Hammer } from 'lucide-react';
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
    role: "Cliente" as UserRole
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email) return;
    onAdd(formData);
    setFormData({ name: "", email: "", role: "Cliente" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-8">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-3xl font-black text-slate-900">
            <UserPlus className="h-8 w-8 text-blue-700" />
            Provisionar Usuário
          </DialogTitle>
          <DialogDescription className="text-lg font-medium">
            Cadastre um novo usuário e defina seu nível de acesso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-base">Nome Completo</Label>
              <Input 
                placeholder="Ex: João Silva" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-2xl border-slate-200 h-14 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-400" /> Nível de Acesso
              </Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
              >
                <SelectTrigger className="rounded-2xl border-slate-200 h-14 text-base">
                  <SelectValue placeholder="Selecione o nível..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Entregador">Entregador</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold text-base flex items-center gap-2">
              <Mail className="h-5 w-5 text-slate-400" /> Email Corporativo
            </Label>
            <Input 
              type="email"
              placeholder="joao.silva@construlara.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="rounded-2xl border-slate-200 h-14 text-base"
            />
          </div>

          <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-orange-100 flex gap-5 mt-12">
            <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
              <Hammer className="h-6 w-6 text-orange-700" />
            </div>
            <p className="text-sm text-orange-800 leading-relaxed font-medium">
              Uma <strong>senha temporária</strong> será enviada para o e-mail informado. O usuário será <strong>obrigado</strong> a alterá-la no primeiro acesso para garantir a segurança da conta.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-14 px-8 text-base">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-10 h-14 text-base shadow-xl shadow-blue-100">
            Criar Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;