"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, UserPlus, Briefcase, ShieldCheck } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
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

    if (email === 'novo@construlara.com' && password === '123456') {
      showSuccess("Primeiro acesso detectado. Por favor, altere sua senha.");
      navigate('/trocar-senha');
      return;
    }

    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);
      showSuccess(`Bem-vindo de volta, ${role}!`);
      navigate('/');
    } else {
      showError("Credenciais inválidas.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[520px] space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="h-48 w-full flex items-center justify-center mx-auto">
            <img src="/logoconstrulara.png" alt="Construlara" className="h-full w-auto object-contain drop-shadow-2xl" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">CONSTRULARA</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Gestão Inteligente de Locações</p>
          </div>
        </div>

        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3.5rem] overflow-hidden bg-white/80 backdrop-blur-sm border border-white">
          <CardHeader className="space-y-2 pb-6 pt-10 px-12">
            <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Entrar</CardTitle>
            <CardDescription className="text-base font-medium text-slate-500">Acesse sua conta para gerenciar o sistema.</CardDescription>
          </CardHeader>
          <CardContent className="px-12 pb-12 space-y-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</Label>
                <div className="relative">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center z-10 border border-slate-100">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nome@construlara.com" 
                    className="pl-14 rounded-2xl h-14 border-slate-200 bg-white text-base focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</Label>
                <div className="relative">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center z-10 border border-slate-100">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-14 rounded-2xl h-14 border-slate-200 bg-white text-base focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nível de Acesso</Label>
                <Select onValueChange={(value) => setRole(value)}>
                  <SelectTrigger className="rounded-2xl h-14 border-slate-200 bg-white pl-14 relative text-base focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center z-10 border border-blue-100">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <SelectValue placeholder="Selecione seu cargo..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                    <SelectItem value="Cliente" className="rounded-xl py-3">Cliente</SelectItem>
                    <SelectItem value="Entregador" className="rounded-xl py-3">Entregador</SelectItem>
                    <SelectItem value="Vendas" className="rounded-xl py-3">Vendas</SelectItem>
                    <SelectItem value="Gestor" className="rounded-xl py-3 font-bold text-blue-700">Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 mt-4 transition-all hover:-translate-y-1 active:scale-95">
                Acessar Sistema
              </Button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Novo por aqui? <Link to="/cadastro" className="text-blue-600 font-black hover:underline inline-flex items-center gap-1">Criar conta de acesso <UserPlus className="h-4 w-4" /></Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-6 text-slate-400">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" /> Conexão Segura
          </div>
          <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
          <a href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors">Esqueci minha senha</a>
        </div>
      </div>
    </div>
  );
};

export default Login;