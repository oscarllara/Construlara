"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, User, Briefcase, KeyRound } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPass, setNewPass] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      showError("Selecione seu nível de acesso.");
      return;
    }
    
    const saved = localStorage.getItem('app_users');
    const users = saved ? JSON.parse(saved) : [];
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (found || (email && password)) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);
      showSuccess(`Bem-vindo de volta!`);
      navigate(role === 'Cliente' ? '/loja' : '/');
    } else {
      showError("Credenciais inválidas.");
    }
  };

  const handleRecovery = () => {
    if (step === 1) {
      showSuccess("Código de 6 dígitos enviado para seu WhatsApp cadastrado!");
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-[480px] space-y-8">
        <div className="text-center">
          <img src="/logoconstrulara.png" alt="Construlara" className="h-40 mx-auto drop-shadow-2xl" />
        </div>

        <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white overflow-hidden">
          <CardHeader className="pb-4 pt-10 px-10">
            <CardTitle className="text-3xl font-black text-slate-900">
              {isForgotMode ? "Recuperar Senha" : "Entrar"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-10 pb-12 space-y-6">
            {!isForgotMode ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase">E-mail</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-2xl h-14" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase">Senha</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="rounded-2xl h-14" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase">Acesso</Label>
                  <Select onValueChange={setRole}>
                    <SelectTrigger className="rounded-2xl h-14"><SelectValue placeholder="Cargo..." /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="Cliente">Cliente</SelectItem>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="Gestor">Gestor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-14 rounded-2xl font-black text-lg mt-2">Acessar</Button>
                <div className="flex justify-between pt-2">
                  <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs font-bold text-slate-400 hover:text-blue-600">Esqueci a senha</button>
                  <Link to="/cadastro" className="text-xs font-bold text-blue-600">Criar conta grátis</Link>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                {step === 1 && (
                  <div className="space-y-2">
                    <Label className="font-bold">Informe seu E-mail</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-2 text-center">
                    <Label className="font-bold">Código de 6 dígitos</Label>
                    <Input maxLength={6} value={recoveryCode} onChange={e => setRecoveryCode(e.target.value)} className="h-14 text-center text-2xl font-black tracking-[1rem] rounded-xl" />
                  </div>
                )}
                {step === 3 && (
                  <div className="space-y-2">
                    <Label className="font-bold">Nova Senha</Label>
                    <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="h-12 rounded-xl" />
                  </div>
                )}
                <Button onClick={handleRecovery} className="w-full bg-blue-700 h-12 rounded-xl font-bold">
                  {step === 1 ? "Enviar Código" : step === 2 ? "Validar Código" : "Salvar Nova Senha"}
                </Button>
                <button onClick={() => setIsForgotMode(false)} className="w-full text-sm font-bold text-slate-400">Voltar ao Login</button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;