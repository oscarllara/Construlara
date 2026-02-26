"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, CreditCard, Home, MapPin, Lock, ArrowLeft, Search } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    cpf: '',
    role: 'Cliente',
    password: '',
    confirmPassword: '',
    cep: '',
    address: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [isFetchingCEP, setIsFetchingCEP] = useState(false);
  const navigate = useNavigate();

  const maskCPF = (val: string) => {
    return val.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})/, "$1-$2").slice(0, 14);
  };

  const maskPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    const clean = digits.startsWith("55") ? digits.slice(2) : digits;
    if (clean.length === 0) return "";
    if (clean.length <= 2) return `+55 (${clean}`;
    if (clean.length <= 7) return `+55 (${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `+55 (${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const maskCEP = (val: string) => {
    return val.replace(/\D/g, "").replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9);
  };

  const fetchAddress = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) return;

    setIsFetchingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        showError("CEP não encontrado.");
      } else {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf
        }));
        showSuccess("Endereço preenchido!");
      }
    } catch (e) {
      showError("Erro ao buscar CEP.");
    } finally {
      setIsFetchingCEP(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }

    const saved = localStorage.getItem('app_users');
    const users = saved ? JSON.parse(saved) : [];
    
    if (users.some((u: any) => u.cpf === formData.cpf)) {
      showError("Este CPF já está cadastrado.");
      return;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      ...formData,
      status: 'active',
      lastAccess: 'Agora'
    };
    
    localStorage.setItem('app_users', JSON.stringify([newUser, ...users]));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', formData.role);
    localStorage.setItem('userEmail', formData.email);

    showSuccess(`Bem-vindo, ${formData.name}!`);
    navigate(formData.role === 'Gestor' ? '/' : '/loja');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-[800px] space-y-8 py-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/login')} className="rounded-xl gap-2 font-bold text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Login
          </Button>
          <img src="/logoconstrulara.png" alt="Construlara" className="h-16 object-contain" />
        </div>

        <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden">
          <CardHeader className="bg-blue-700 p-10 text-white">
            <CardTitle className="text-3xl font-black">Crie sua Conta</CardTitle>
            <p className="text-blue-100 font-bold">Preencha seus dados para acessar o catálogo e gerenciar seus pedidos.</p>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <form onSubmit={handleRegister} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">1. Dados Pessoais</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label className="font-bold">Nome Completo</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">CPF</Label>
                    <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: maskCPF(e.target.value)})} maxLength={14} required className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">E-mail</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">WhatsApp</Label>
                    <Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: maskPhone(e.target.value)})} placeholder="+55 (00) 00000-0000" required className="rounded-xl h-12" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">2. Endereço</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">CEP</Label>
                    <div className="relative">
                      <Input value={formData.cep} onChange={e => setFormData({...formData, cep: maskCEP(e.target.value)})} onBlur={() => fetchAddress(formData.cep)} maxLength={9} placeholder="00000-000" className="rounded-xl h-12" />
                      {isFetchingCEP && <RefreshCw className="absolute right-3 top-3 h-5 w-5 animate-spin text-blue-600" />}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-bold">Logradouro e Número</Label>
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rua, Av + Número" className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Bairro</Label>
                    <Input value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2 md:col-span-3">
                    <Label className="font-bold">Cidade</Label>
                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Estado (UF)</Label>
                    <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} maxLength={2} className="rounded-xl h-12" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">3. Acesso</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Nível de Acesso</Label>
                    <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                      <SelectTrigger className="rounded-xl h-12 font-medium">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="Cliente">Cliente</SelectItem>
                        <SelectItem value="Vendas">Vendas</SelectItem>
                        <SelectItem value="Entregador">Entregador</SelectItem>
                        <SelectItem value="Gestor">Gestor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Senha</Label>
                    <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2 md:col-start-2">
                    <Label className="font-bold">Confirmar Senha</Label>
                    <Input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required className="rounded-xl h-12" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-16 rounded-2xl font-black text-xl shadow-xl shadow-blue-100 transition-all active:scale-95">
                Concluir Cadastro
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;