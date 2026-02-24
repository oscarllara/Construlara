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
import { Shield, UserPlus, Mail, Hammer, Phone, MapPin, Home, CreditCard } from 'lucide-react';
import { UserRole, UserAccount } from './UserTable';
import { showError } from '@/utils/toast';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (user: any) => void;
}

const AddUserDialog = ({ open, onOpenChange, onAdd }: AddUserDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    cpf: "",
    role: "Cliente" as UserRole,
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    worksiteAddress: ""
  });

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

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setFormData({ ...formData, whatsapp: formatted });
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.whatsapp || !formData.role || !formData.cpf) return;

    // Verificar CPF Duplicado
    const saved = localStorage.getItem('app_users');
    if (saved) {
      const users: UserAccount[] = JSON.parse(saved);
      const exists = users.find(u => u.cpf === formData.cpf);
      if (exists) {
        showError("Já existe um usuário cadastrado com este CPF.");
        return;
      }
    }

    onAdd(formData);
    setFormData({ 
      name: "", 
      email: "", 
      whatsapp: "", 
      cpf: "",
      role: "Cliente", 
      address: "", 
      neighborhood: "",
      city: "",
      state: "",
      worksiteAddress: "" 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-none shadow-2xl p-6 max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
            <UserPlus className="h-7 w-7 text-blue-700" />
            Provisionar Usuário
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Cadastre um novo usuário e defina seu nível de acesso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm">Nome Completo</Label>
              <Input 
                placeholder="Ex: João Silva" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="rounded-2xl border-slate-200 h-12 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                CPF
              </Label>
              <div className="relative">
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center z-10 border border-slate-200">
                  <CreditCard className="h-5 w-5 text-slate-500" />
                </div>
                <Input 
                  placeholder="000.000.000-00" 
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  maxLength={14}
                  className="pl-14 rounded-2xl border-slate-200 h-12 text-base"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                Email
              </Label>
              <div className="relative">
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center z-10 border border-slate-200">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <Input 
                  type="email"
                  placeholder="joao.silva@construlara.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-14 rounded-2xl border-slate-200 h-12 text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                Nível de Acesso
              </Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
              >
                <SelectTrigger className="rounded-2xl border-slate-200 h-12 text-base pl-14 relative bg-white">
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-blue-100 rounded-xl flex items-center justify-center z-10 border border-blue-200">
                    <Shield className="h-5 w-5 text-blue-700" />
                  </div>
                  <SelectValue placeholder="Selecione o nível..." />
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

          <div className="space-y-1.5">
            <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
              WhatsApp
            </Label>
            <div className="relative">
              <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center z-10 border border-slate-200">
                <Phone className="h-5 w-5 text-slate-500" />
              </div>
              <Input 
                placeholder="(00) 00000-0000" 
                value={formData.whatsapp}
                onChange={handleWhatsAppChange}
                maxLength={15}
                className="pl-14 rounded-2xl border-slate-200 h-12 text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-100 mt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                Endereço (Rua e Número)
              </Label>
              <div className="relative">
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center z-10 border border-slate-200">
                  <Home className="h-5 w-5 text-slate-500" />
                </div>
                <Input 
                  placeholder="Rua Exemplo, 123" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="pl-14 rounded-2xl border-slate-200 h-12 text-base"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-sm">Bairro</Label>
                <Input 
                  placeholder="Centro" 
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-sm">Cidade</Label>
                <Input 
                  placeholder="São João del-Rei" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-bold text-sm">Estado</Label>
                <Input 
                  placeholder="MG" 
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="rounded-2xl border-slate-200 h-12 text-base"
                  maxLength={2}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-slate-700 font-bold text-sm flex items-center gap-2">
                Endereço da Obra
              </Label>
              <div className="relative">
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center z-10 border border-slate-100">
                  <MapPin className="h-5 w-5 text-slate-500" />
                </div>
                <Input 
                  placeholder="Local onde o equipamento será entregue..." 
                  value={formData.worksiteAddress}
                  onChange={(e) => setFormData({...formData, worksiteAddress: e.target.value})}
                  className="pl-14 rounded-2xl border-slate-200 h-12 text-base"
                />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-5 rounded-[2.5rem] border border-orange-100 flex gap-4 mt-4">
            <div className="h-10 w-10 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
              <Hammer className="h-5 w-5 text-orange-700" />
            </div>
            <p className="text-xs text-orange-800 leading-relaxed font-medium">
              Uma <strong>senha temporária</strong> será enviada para o e-mail informado. O usuário será <strong>obrigado</strong> a alterá-la no primeiro acesso.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6 text-base">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 text-base shadow-xl shadow-blue-100">
            Criar Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;