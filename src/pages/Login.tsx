"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Lock, ChevronDown } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: ''
  });
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [step, setStep] = useState(1);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPass, setNewPass] = useState('');
  
  const navigate = useNavigate();

  const maskPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    const clean = digits.startsWith("55") ? digits.slice(2) : digits;
    if (clean.length === 0) return "";
    if (clean.length <= 2) return `+55 (${clean}`;
    if (clean.length <= 7) return `+55 (${clean.slice(0, 2)}) ${clean.slice(2)}`;
    return `+55 (${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      showError("Selecione seu nível de acesso.");
      return;
    }
    
    // Simulação de login - Em um app real, verificaríamos os dados no banco/localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', formData.role);
    localStorage.setItem('userEmail', formData.email);
    localStorage.setItem('userName', formData.name);

    showSuccess(`Bem-vindo, ${formData.name}!`);
    navigate(formData.role === 'Cliente' ? '/loja' : '/');
  };

  const handleRecovery = () => {
    if (step === 1) {
      showSuccess("Código de 6 dígitos enviado para seu WhatsApp!");
      setStep(2);
    } else if (step === 2) {
      if (recoveryCode.length === 6) {
        setStep(3);
      } else {
        showError("Insira o código de 6 dígitos.");
      }
    } else {
      showSuccess("Senha alterada com sucesso! Entre agora.");
      setIsForgotMode(false);
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[480px] space-y-6">
        <div className="text-center mb-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm inline-block">
            <img src="/logoconstrulara.png" alt="Construlara" className="h-24 object-contain" />
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden">
          <CardHeader className="pb-2 pt-10 px-10 text-left">
            <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">
              {isForgotMode ? "Recuperar" : "Entrar"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-10 pb-12 space-y-6">
            {!isForgotMode ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      placeholder="Seu nome completo"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      required 
                      className="rounded-2xl h-14 pl-11 bg-slate-50/50 border-slate-100 focus:bg-white transition-all" 
                    />
                  </div>
                </div>

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
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      placeholder="+55 (00) 00000-0000"
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})} 
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
                      placeholder="••••••••"
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
                    <SelectTrigger className="rounded-2xl h-14 bg-slate-50/50 border-slate-100 font-medium">
                      <SelectValue placeholder="Cargo..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                      <SelectItem value="Cliente">Cliente</SelectItem>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="Gestor">Gestor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-black text-lg mt-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
                  Acessar
                </Button>

                <div className="flex justify-between pt-2 px-1">
                  <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">Esqueci a senha</button>
                  <Link to="/cadastro" className="text-xs font-bold text-blue-600 hover:underline">Criar conta grátis</Link>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                {step === 1 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase">Informe seu E-mail</Label>
                    <Input 
                      type="email" 
                      placeholder="seu@email.com"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="h-14 rounded-2xl bg-slate-50" 
                    />
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-4 text-center">
                    <Label className="text-xs font-black text-slate-400 uppercase">Código de 6 dígitos enviado por WhatsApp</Label>
                    <Input 
                      maxLength={6} 
                      placeholder="000000"
                      value={recoveryCode} 
                      onChange={e => setRecoveryCode(e.target.value)} 
                      className="h-16 text-center text-3xl font-black tracking-[1rem] rounded-2xl border-blue-100 focus:border-blue-300" 
                    />
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase">Nova Senha</Label>
                    <Input 
                      type="password" 
                      placeholder="Mínimo 6 caracteres"
                      value={newPass} 
                      onChange={e => setNewPass(e.target.value)} 
                      className="h-14 rounded-2xl bg-slate-50" 
                    />
                  </div>
                )}
                <Button onClick={handleRecovery} className="w-full bg-blue-700 hover:bg-blue-800 h-14 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95">
                  {step === 1 ? "Enviar Código" : step === 2 ? "Validar Código" : "Salvar Nova Senha"}
                </Button>
                <button onClick={() => {setIsForgotMode(false); setStep(1);}} className="w-full text-sm font-bold text-slate-400 hover:text-slate-600">Voltar ao Login</button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;