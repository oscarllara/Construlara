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

    // Simulação de lógica de primeiro acesso
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <img src="/logosolo.png" alt="Construlara" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-blue-700 tracking-tighter">CONSTRULARA</h1>
          <p className="text-slate-500 font-medium">Gestão Inteligente de Locações</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-1 pb-8 pt-10 px-10">
            <CardTitle className="text-2xl font-black text-slate-900">Entrar no Sistema</CardTitle>
            <CardDescription>Informe suas credenciais e seu nível de acesso.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nome@exemplo.com" 
                    className="pl-10 rounded-2xl h-12 border-slate-200"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Nível de Acesso</Label>
                <Select onValueChange={(value) => setRole(value)}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 pl-10 relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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

              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-12 rounded-2xl font-bold shadow-lg shadow-blue-100">
                Acessar Conta
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold">Ou continue com</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-200 font-bold flex items-center justify-center gap-3 hover:bg-slate-50">
              <svg className="h-5 w-5" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              Microsoft / Azure
            </Button>

            <div className="pt-4 text-center">
              <p className="text-sm text-slate-500">
                Não tem uma conta? <Link to="/cadastro" className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1">Cadastre-se agora <UserPlus className="h-3 w-3" /></Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Esqueceu sua senha? <a href="#" className="text-blue-600 font-bold hover:underline">Recuperar acesso</a>
        </p>
      </div>
    </div>
  );
};

export default Login;