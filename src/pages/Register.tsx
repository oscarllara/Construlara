"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, ArrowLeft, Briefcase } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const INITIAL_USERS = [
  { id: 'u1', name: 'Admin Sistema', email: 'admin@empresa.com', role: 'Gestor', status: 'active', lastAccess: 'Hoje, 09:45' },
  { id: 'u2', name: 'João Silva', email: 'joao.silva@empresa.com', role: 'Entregador', status: 'active', lastAccess: 'Ontem, 18:20' },
  { id: 'u3', name: 'Ricardo Vendas', email: 'ricardo.vendas@empresa.com', role: 'Vendas', status: 'active', lastAccess: '24/05/2024' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

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

    if (formData.password.length < 6) {
      showError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const stored = localStorage.getItem('app_users');
    const currentUsers = stored ? JSON.parse(stored) : INITIAL_USERS;
    
    const newUser = {
      id: `u-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active',
      lastAccess: 'Recém-chegado'
    };
    
    localStorage.setItem('app_users', JSON.stringify([newUser, ...currentUsers]));

    showSuccess(`Conta de ${formData.role} criada com sucesso!`);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[520px] space-y-10">
        <div className="text-center space-y-4">
          <img src="/logosolo.png" alt="Construlara" className="h-20 w-20 mx-auto mb-2" />
          <h1 className="text-4xl font-black text-blue-700 tracking-tighter">CONSTRULARA</h1>
          <p className="text-slate-500 text-lg font-medium">Crie sua conta de acesso</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
          <CardHeader className="space-y-2 pb-10 pt-12 px-12">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-black text-slate-900">Cadastro</CardTitle>
              <Link to="/login" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-base font-bold">
                <ArrowLeft className="h-5 w-5" /> Voltar
              </Link>
            </div>
            <CardDescription className="text-base">Preencha seus dados e escolha seu nível de acesso.</CardDescription>
          </CardHeader>
          <CardContent className="px-12 pb-12 space-y-8">
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-bold">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    id="name" 
                    placeholder="Seu nome" 
                    className="pl-12 rounded-2xl h-14 border-slate-200 text-base"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-bold">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nome@exemplo.com" 
                    className="pl-12 rounded-2xl h-14 border-slate-200 text-base"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-base font-bold">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-12 rounded-2xl h-14 border-slate-200 text-base"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-base font-bold">Confirmar</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      className="pl-12 rounded-2xl h-14 border-slate-200 text-base"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="role" className="text-base font-bold">Nível de Acesso</Label>
                <Select onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger className="rounded-2xl h-14 border-slate-200 pl-12 relative text-base">
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

              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 mt-4">
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