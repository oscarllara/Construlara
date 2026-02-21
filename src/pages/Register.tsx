"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck, User, Calendar, CreditCard } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    birthDate: '',
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de idade simples
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      toast.error("Acesso permitido apenas para maiores de 18 anos.");
      return;
    }

    toast.success("Cadastro realizado com sucesso!");
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg">
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden">
          <div className="bg-purple-600 h-32 flex items-center justify-center">
            <ShieldCheck className="h-12 w-12 text-white/50" />
          </div>
          <CardHeader className="text-center -mt-10 px-8">
            <div className="bg-white w-20 h-20 rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-4 border-4 border-slate-50">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Finalize seu Cadastro</CardTitle>
            <CardDescription className="font-medium">Precisamos validar sua identidade para garantir a segurança da comunidade.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Nome Completo</Label>
                  <Input required className="rounded-2xl h-12" placeholder="Seu nome" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">CPF</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input required className="rounded-2xl h-12 pl-12" placeholder="000.000.000-00" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">E-mail</Label>
                <Input type="email" required className="rounded-2xl h-12" placeholder="exemplo@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Data de Nascimento</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="date" required className="rounded-2xl h-12 pl-12" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} />
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-2xl flex items-start gap-3">
                <div className="h-5 w-5 bg-purple-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-purple-700">18+</span>
                </div>
                <p className="text-xs text-purple-800 font-medium leading-relaxed">
                  Ao se cadastrar, você confirma que possui mais de 18 anos e aceita as normas de conduta do <strong>Ki papo</strong>.
                </p>
              </div>

              <Button type="submit" className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-purple-100 transition-all active:scale-95">
                Concluir Cadastro
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;