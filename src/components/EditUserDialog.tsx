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
import { Shield, UserCog, Mail, Phone } from 'lucide-react';
import { UserAccount, UserRole } from './UserTable';

interface EditUserDialogProps {
  user: UserAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: UserAccount) => void;
}

const EditUserDialog = ({ user, open, onOpenChange, onSave }: EditUserDialogProps) => {
  const [formData, setFormData] = useState<UserAccount | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user, open]);

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const formatted = formatWhatsApp(e.target.value);
    setFormData({ ...formData, whatsapp: formatted });
  };

  const handleSubmit = () => {
    if (!formData || !formData.name || !formData.email || !formData.whatsapp || !formData.role) return;
    onSave(formData);
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <UserCog className="h-7 w-7 text-blue-700" />
            Editar Usuário
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Atualize as informações cadastrais ou o nível de acesso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-1.5">
            <Label className="text-slate-700 font-bold text-sm">Nome Completo</Label>
            <Input 
              placeholder="Ex: João Silva" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="rounded-2xl border-slate-200 h-12 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-400" /> Nível de Acesso
              </Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
              >
                <SelectTrigger className="rounded-2xl border-slate-200 h-12 text-base">
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

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" /> Email
              </Label>
              <Input 
                type="email"
                placeholder="joao.silva@construlara.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="rounded-2xl border-slate-200 h-12 text-base"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" /> WhatsApp
            </Label>
            <Input 
              placeholder="(00) 00000-0000" 
              value={formData.whatsapp}
              onChange={handleWhatsAppChange}
              maxLength={15}
              className="rounded-2xl border-slate-200 h-12 text-base"
            />
          </div>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6 text-base">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 text-base shadow-xl shadow-blue-100">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;