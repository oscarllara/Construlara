"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }

    showSuccess("Senha alterada com sucesso! Agora você pode acessar o sistema.");
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="h-16 w-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-8 w-8 text-blue-700" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Segurança da Conta</h1>
          <p className="text-slate-500 mt-2">Para sua proteção, você deve definir uma nova senha em seu primeiro acesso.</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem]">
          <CardHeader className="px-10 pt-10">
            <CardTitle className="text-xl font-bold">Nova Senha</CardTitle>
            <CardDescription>Crie uma senha forte que você não use em outros sites.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="new-password" 
                    type="password" 
                    className="pl-10 rounded-2xl h-12 border-slate-200"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    className="pl-10 rounded-2xl h-12 border-slate-200"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requisitos:</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className={`h-3 w-3 ${newPassword.length >= 6 ? 'text-emerald-500' : 'text-slate-300'}`} />
                  Mínimo de 6 caracteres
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className={`h-3 w-3 ${newPassword === confirmPassword && newPassword !== '' ? 'text-emerald-500' : 'text-slate-300'}`} />
                  As senhas devem ser iguais
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white h-12 rounded-2xl font-bold shadow-lg shadow-blue-100">
                Salvar e Continuar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;