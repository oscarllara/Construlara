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
import { Shield, UserCog, Mail, Phone, Home, CreditCard, Lock } from 'lucide-react';
import { UserAccount, UserRole } from './UserTable';

interface EditUserDialogProps {
  user: UserAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: UserAccount) => void;
}

const EditUserDialog = ({ user, open, onOpenChange, onSave }: EditUserDialogProps) => {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: (user as any).password || "" });
    }
  }, [user, open]);

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleSubmit = () => {
    if (!formData || !formData.name || !formData.email || !formData.whatsapp || !formData.role) return;
    onSave(formData);
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-none shadow-2xl p-6 max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <UserCog className="h-7 w-7 text-blue-700" />
            Editar Usuário
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Atualize as informações cadastrais, nível de acesso ou senha.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm">Nome Completo</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-2xl border-slate-200 h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm">CPF</Label>
              <Input 
                value={formData.cpf || ""}
                onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                maxLength={14}
                className="rounded-2xl border-slate-200 h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm">Email</Label>
              <Input 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="rounded-2xl border-slate-200 h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm">Senha de Acesso</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="text"
                  placeholder="Defina uma nova senha"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-10 rounded-2xl border-slate-200 h-12 font-bold text-blue-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm">WhatsApp</Label>
              <Input 
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: formatWhatsApp(e.target.value)})}
                className="rounded-2xl border-slate-200 h-12"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm">Nível de Acesso</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
              >
                <SelectTrigger className="rounded-2xl border-slate-200 h-12 bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-white border shadow-xl">
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Entregador">Entregador</SelectItem>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-blue-100">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;