"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, ArrowLeft, Briefcase, Phone, CreditCard, Home, MapPin } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const INITIAL_USERS = [
  { id: 'u1', name: 'Admin Sistema', email: 'admin@empresa.com', whatsapp: '+55 (11) 99999-9999', cpf: '000.000.000-01', role: 'Gestor', status: 'active', lastAccess: 'Hoje, 09:45' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    cpf: '',
    role: 'Cliente',
    password: '',
    confirmPassword: '',
    address: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const navigate = useNavigate();

  const maskCPF = (val: string) => {
    return val.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14);
  };

  const maskPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    const clean = digits.startsWith("55") ? digits.slice(2) : digits;
    if (clean.length === 0) return "";
    if (clean.length <= 2) return `+55 (${clean}`;
    if (clean.length <= 7) return `+55 (${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `+55 (${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }

    const stored = localStorage.getItem('app_users');
    const currentUsers = stored ? JSON.parse(stored) : INITIAL_USERS;
    
    // Trava de CPF Único
    const cpfExists = currentUsers.some((u: any) => u.cpf === formData.cpf);
    if (cpfExists) {
      showError("Este CPF já está cadastrado no sistema.");
      return;
    }

    const userExists = currentUsers.some((u: any) => u.email.toLowerCase() === formData.email.toLowerCase());
    if (userExists) {
      showError("Este e-mail já está cadastrado.");
      return;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      ...formData,
      status: 'active',
      lastAccess: 'Agora'
    };
    
    localStorage.setItem('app_users', JSON.stringify([newUser, ...currentUsers]));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', formData.role);
    localStorage.setItem('userEmail', formData.email);

    showSuccess(`Bem-vindo, ${formData.name}!`);
    navigate(formData.role === 'Cliente' ? '/loja' : '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[600px] space-y-6">
        <div className="text-center">
          <img src="/logoconstrulara.png" alt="Construlara" className="h-32 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-black text-blue-700">Cadastro de Conta</h1>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem]">
          <CardContent className="p-10 space-y-4">
            <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="font-bold">Nome Completo</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">CPF</Label>
                <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: maskCPF(e.target.value)})} maxLength={14} required className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">WhatsApp</Label>
                <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: maskPhone(e.target.value)})} placeholder="+55 (00) 00000-0000" required className="rounded-xl h-12" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="font-bold">E-mail</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Senha</Label>
                <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Confirmar</Label>
                <Input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required className="rounded-xl h-12" />
              </div>
              <Button type="submit" className="col-span-2 bg-blue-700 hover:bg-blue-800 text-white h-12 rounded-2xl font-bold mt-4 shadow-lg">
                Finalizar Cadastro
              </Button>
            </form>
            <div className="text-center pt-4">
              <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-blue-600">Já tem conta? Entre aqui</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;