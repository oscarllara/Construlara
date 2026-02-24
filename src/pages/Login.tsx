"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      showError("Por favor, selecione seu nível de acesso.");
      return;
    }
    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);
      // Salva o nome se for um novo login para persistência simples
      if (name) {
        const savedUsers = localStorage.getItem('app_users');
        const users = savedUsers ? JSON.parse(savedUsers) : [];
        if (!users.find((u: any) => u.email === email)) {
          users.push({ name, email, role, status: 'active' });
          localStorage.setItem('app_users', JSON.stringify(users));
        }
      }
      
      showSuccess(`Bem-vindo de volta, ${name || role}!`);
      navigate(role === 'Cliente' ? '/loja' : '/');
    } else {
      showError("Credenciais inválidas.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      <div className="w-full max-w-[520px] space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="h-48 w-full flex items-center justify-center mx-auto">
            <img src="/logoconstrulara.png" alt="Construlara" className="h-full w-auto object-contain drop-shadow-2xl" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">CONSTRULARA</h1>
            <p className="text-blue-600 text-sm font-black italic tracking-wide">"Um passo a frente em sua obra!"</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white">
          <CardHeader className="space-y-2 pb-6 pt-10 px-12">
            <CardTitle className="text-3xl font-black text-slate-900">Entrar</CardTitle>
            <CardDescription className="text-base font-medium">Acesse sua conta Construlara.</CardDescription>
          </CardHeader>
          <CardContent className="px-12 pb-12 space-y-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase">Nome</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Seu nome completo" 
                    className="flex h-14 w-full rounded-2xl border border-slate-200 bg-white px-12 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type="email" 
                    placeholder="nome@construlara.com" 
                    className="pl-12 rounded-2xl h-14 border-slate-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-12 rounded-2xl h-14 border-slate-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase">Nível de Acesso</Label>
                <Select onValueChange={(value) => setRole(value)}>
                  <SelectTrigger className="rounded-2xl h-14 border-slate-200 pl-12">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <SelectValue placeholder="Selecione seu cargo..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Cliente">Cliente</SelectItem>
                    <SelectItem value="Entregador">Entregador</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Gestor">Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-black text-lg shadow-2xl mt-4">
                Acessar Sistema
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;