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
  { id: 'u1', name: 'Admin Sistema', email: 'admin@empresa.com', whatsapp: '11999999999', role: 'Gestor', status: 'active', lastAccess: 'Hoje, 09:45' },
  { id: 'u2', name: 'João Silva', email: 'joao.silva@empresa.com', whatsapp: '11988888888', role: 'Entregador', status: 'active', lastAccess: 'Ontem, 18:20' },
  { id: 'u3', name: 'Ricardo Vendas', email: 'ricardo.vendas@empresa.com', whatsapp: '11977777777', role: 'Vendas', status: 'active', lastAccess: '24/05/2024' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    cpf: '',
    role: '',
    password: '',
    confirmPassword: '',
    address: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const navigate = useNavigate();

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role) {
      showError("Por favor, selecione seu nível de acesso.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }

    const stored = localStorage.getItem('app_users');
    const currentUsers = stored ? JSON.parse(stored) : INITIAL_USERS;
    
    const userExists = currentUsers.some((u: any) => u.email.toLowerCase() === formData.email.toLowerCase());
    if (userExists) {
      showError("Este e-mail já está cadastrado no sistema.");
      return;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      whatsapp: formData.whatsapp,
      cpf: formData.cpf,
      role: formData.role,
      address: formData.address,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
      status: 'active',
      lastAccess: 'Recém-chegado'
    };
    
    localStorage.setItem('app_users', JSON.stringify([newUser, ...currentUsers]));

    showSuccess(`Conta de ${formData.role} criada com sucesso!`);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[600px] space-y-6">
        <div className="text-center space-y-2">
          <div className="h-32 w-full flex items-center justify-center mx-auto mb-2">
            <img src="/logoconstrulara.png" alt="Construlara" className="h-full w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-black text-blue-700 tracking-tighter">CONSTRULARA</h1>
          <p className="text-slate-500 text-base font-medium">Crie sua conta de acesso</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
          <CardHeader className="space-y-1 pb-6 pt-8 px-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-black text-slate-900">Cadastro</CardTitle>
              <Link to="/login" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-bold">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Link>
            </div>
            <CardDescription className="text-sm">Preencha seus dados e escolha seu nível de acesso.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-8 space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="name" 
                      placeholder="Seu nome" 
                      className="pl-12 rounded-2xl h-12 border-slate-200 text-base"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-sm font-bold">CPF</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="cpf" 
                      placeholder="000.000.000-00" 
                      className="pl-12 rounded-2xl h-12 border-slate-200 text-base"
                      value={formData.cpf}
                      onChange={handleCPFChange}
                      maxLength={14}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="nome@exemplo.com" 
                      className="pl-12 rounded-2xl h-12 border-slate-200 text-base"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-bold">WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="whatsapp" 
                      placeholder="(00) 00000-0000" 
                      className="pl-12 rounded-2xl h-12 border-slate-200 text-base"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Endereço (Rua e Número)</Label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    placeholder="Rua Exemplo, 123" 
                    className="pl-12 rounded-2xl h-12 border-slate-200 text-base"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Bairro</Label>
                  <Input 
                    placeholder="Centro" 
                    className="rounded-2xl h-12 border-slate-200 text-base"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Cidade</Label>
                  <Input 
                    placeholder="Cidade" 
                    className="rounded-2xl h-12 border-slate-200 text-base"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Estado</Label>
                  <Input 
                    placeholder="UF" 
                    className="rounded-2xl h-12 border-slate-200 text-base"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-12 rounded-2xl h-12 border-slate-200 text-base"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-bold">Confirmar</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      className="pl-12 rounded-2xl h-12 border-slate-200 text-base"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-bold">Nível de Acesso</Label>
                <Select onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 pl-12 relative text-base">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Selecione seu nível..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Entregador">Entregador</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Gestor">Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-12 rounded-2xl font-bold text-base shadow-xl shadow-blue-100 mt-2">
                Criar Minha Conta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;