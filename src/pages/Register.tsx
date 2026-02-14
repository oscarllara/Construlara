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
      showError("Por favor, selecione seu perfil de acesso.");
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

    // Salvar no localStorage para aparecer na aba Usuários
    const savedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const newUser = {
      id: `u-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active',
      lastAccess: 'Nunca'
    };
    
    localStorage.setItem('app_users', JSON.stringify([newUser, ...savedUsers]));

    showSuccess(`Conta de ${formData.role} criada com sucesso!`);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <img src="/logosolo.png" alt="Construlara" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-blue-700 tracking-tighter">CONSTRULARA</h1>
          <p className="text-slate-500 font-medium">Crie sua conta de acesso</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-1 pb-8 pt-10 px-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-black text-slate-900">Cadastro</CardTitle>
              <Link to="/login" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-bold">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Link>
            </div>
            <CardDescription>Escolha seu perfil e preencha os dados.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="name" 
                    placeholder="Seu nome" 
                    className="pl-10 rounded-2xl h-12 border-slate-200"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil de Acesso</Label>
                <Select onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 pl-10 relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Selecione seu cargo..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Gestor">Gestor</SelectItem>
                    <SelectItem value="Entregador">Entregador</SelectItem>
                    <SelectItem value="Vendedor">Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nome@exemplo.com" 
                    className="pl-10 rounded-2xl h-12 border-slate-200"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 rounded-2xl h-12 border-slate-200"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    className="pl-10 rounded-2xl h-12 border-slate-200"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-12 rounded-2xl font-bold shadow-lg shadow-blue-100">
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