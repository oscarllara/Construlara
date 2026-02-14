"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, UserPlus, Briefcase } from 'lucide-react';
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
      showSuccess(`Bem-vindo de volta, ${role}!`);
      navigate('/');
    } else {
      showError("Credenciais inválidas.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[520px] space-y-10">
        <div className="text-center space-y-4">
          <img src="/logosolo.png" alt="Construlara" className="h-20 w-20 mx-auto mb-2" />
          <h1 className="text-4xl font-black text-blue-700 tracking-tighter">CONSTRULARA</h1>
          <p className="text-slate-500 text-lg font-medium">Gestão Inteligente de Locações</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
          <CardHeader className="space-y-2 pb-10 pt-12 px-12">
            <CardTitle className="text-3xl font-black text-slate-900">Entrar no Sistema</CardTitle>
            <CardDescription className="text-base">Informe suas credenciais e seu nível de acesso.</CardDescription>
          </CardHeader>
          <CardContent className="px-12 pb-12 space-y-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-bold">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nome@exemplo.com" 
                    className="pl-12 rounded-2xl h-14 border-slate-200 text-base"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-bold">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-12 rounded-2xl h-14 border-slate-200 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="role" className="text-base font-bold">Nível de Acesso</Label>
                <Select onValueChange={(value) => setRole(value)}>
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
                Acessar Conta
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Ou continue com</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-bold text-base flex items-center justify-center gap-3 hover:bg-slate-50">
              <svg className="h-6 w-6" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              Microsoft / Azure
            </Button>

            <div className="pt-6 text-center">
              <p className="text-base text-slate-500">
                Não tem uma conta? <Link to="/cadastro" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">Cadastre-se agora <UserPlus className="h-4 w-4" /></Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-base text-slate-500">
          Esqueceu sua senha? <a href="#" className="text-blue-600 font-bold hover:underline">Recuperar acesso</a>
        </p>
      </div>
    </div>
  );
};

export default Login;