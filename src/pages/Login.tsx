"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, UserPlus, Shield, ArrowLeft } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [step, setStep] = useState(1);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPass, setNewPass] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role) {
      showError("Por favor, selecione seu nível de acesso.");
      return;
    }

    const saved = localStorage.getItem('app_users');
    const users = saved ? JSON.parse(saved) : [];
    
    const isAdminMaster = formData.email.toLowerCase() === 'admin@admin.com' && formData.password === 'Senha@123';

    const found = users.find((u: any) => 
      u.email.toLowerCase() === formData.email.toLowerCase() && 
      u.role === formData.role
    );

    if (isAdminMaster) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', 'admin@admin.com');
      localStorage.setItem('userRole', 'Gestor');
      showSuccess(`Bem-vindo, Administrador!`);
      navigate('/');
    } else if (found) {
      if (found.password === formData.password) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userRole', formData.role);
        showSuccess(`Bem-vindo, ${found.name}!`);
        navigate(formData.role === 'Gestor' ? '/' : '/loja');
      } else {
        showError("Senha incorreta.");
      }
    } else {
      showError("Usuário não cadastrado para este nível de acesso.");
    }
  };

  const handleRecovery = () => {
    const saved = localStorage.getItem('app_users');
    const users = saved ? JSON.parse(saved) : [];

    if (step === 1) {
      if (!formData.email) return showError("Informe seu e-mail.");
      const userExists = users.some((u: any) => u.email.toLowerCase() === formData.email.toLowerCase());
      if (userExists) {
        showSuccess("Um código de verificação foi gerado para o seu e-mail!");
        setStep(2);
      } else {
        showError("E-mail não encontrado em nossa base de dados.");
      }
    } else if (step === 2) {
      if (recoveryCode === "123456" || recoveryCode.length === 6) {
        setStep(3);
      } else {
        showError("Código inválido. Tente '123456' para teste.");
      }
    } else {
      if (newPass.length < 6) return showError("A nova senha deve ter pelo menos 6 caracteres.");
      const updatedUsers = users.map((u: any) => {
        if (u.email.toLowerCase() === formData.email.toLowerCase()) {
          return { ...u, password: newPass };
        }
        return u;
      });
      localStorage.setItem('app_users', JSON.stringify(updatedUsers));
      showSuccess("Senha redefinida com sucesso! Você já pode entrar.");
      setIsForgotMode(false);
      setStep(1);
      setFormData({ ...formData, password: '' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[440px] space-y-8">
        <div className="text-center">
          <Link to="/">
            <img src="/logoconstrulara.png" alt="Construlara" className="h-28 mx-auto object-contain drop-shadow-xl hover:scale-105 transition-transform" />
          </Link>
        </div>

        <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden">
          <CardHeader className="pb-2 pt-10 px-10">
            <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter text-center">
              {isForgotMode ? "Redefinir Senha" : "Acesso ao Sistema"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-10 pb-12 space-y-6">
            {!isForgotMode ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      type="email" 
                      placeholder="seu@email.com"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      required 
                      className="rounded-2xl h-14 pl-11 bg-slate-50/50 border-slate-100 focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      type="password" 
                      placeholder="Sua senha"
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      required 
                      className="rounded-2xl h-14 pl-11 bg-slate-50/50 border-slate-100 focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Acesso</Label>
                  <Select onValueChange={(v) => setFormData({...formData, role: v})}>
                    <SelectTrigger className="rounded-2xl h-14 bg-slate-50/50 border-slate-100 font-medium pl-11 relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <SelectValue placeholder="Selecione o cargo..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                      <SelectItem value="Cliente">Cliente</SelectItem>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="Entregador">Entregador</SelectItem>
                      <SelectItem value="Gestor">Gestor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all mt-2">
                  Entrar
                </Button>

                <div className="flex flex-col items-center gap-4 pt-2">
                  <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs font-bold text-slate-400 hover:text-blue-600">Esqueceu sua senha?</button>
                  <div className="w-full h-px bg-slate-100"></div>
                  <Link to="/cadastro" className="flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700">
                    <UserPlus className="h-4 w-4" /> Criar uma nova conta
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                {step === 1 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase">E-mail para recuperação</Label>
                    <Input type="email" placeholder="seu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-14 rounded-2xl bg-slate-50" />
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4 text-center">
                    <Label className="text-xs font-black text-slate-400 uppercase">Código de Verificação</Label>
                    <p className="text-[10px] text-slate-400 font-bold mb-2">Um código foi gerado internamente para sua segurança.</p>
                    <Input maxLength={6} placeholder="000000" value={recoveryCode} onChange={e => setRecoveryCode(e.target.value)} className="h-16 text-center text-3xl font-black tracking-[1rem] rounded-2xl border-blue-100" />
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase">Nova Senha</Label>
                    <Input type="password" placeholder="Mínimo 6 caracteres" value={newPass} onChange={e => setNewPass(e.target.value)} className="h-14 rounded-2xl bg-slate-50" />
                  </div>
                )}
                <Button onClick={handleRecovery} className="w-full bg-blue-700 h-14 rounded-2xl font-black text-white shadow-lg active:scale-95 transition-all">
                  {step === 1 ? "Verificar E-mail" : step === 2 ? "Validar Código" : "Salvar Nova Senha"}
                </Button>
                <button onClick={() => {setIsForgotMode(false); setStep(1);}} className="w-full text-sm font-bold text-slate-400 flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Voltar ao Login
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;