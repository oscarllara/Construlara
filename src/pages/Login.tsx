"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageCircle, Mail, Phone, Facebook, Chrome as Google, Apple } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center text-white">
          <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-xl border border-white/30">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Ki papo</h1>
          <p className="text-purple-100 font-medium">Conecte-se com pessoas da sua região</p>
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-bold text-slate-900">Bem-vindo de volta!</CardTitle>
            <CardDescription>Escolha como deseja acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pb-10 px-8">
            <Button variant="outline" className="h-12 rounded-2xl gap-3 border-slate-200 hover:bg-slate-50" onClick={() => navigate('/registro')}>
              <Mail className="h-5 w-5 text-slate-600" /> E-mail
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl gap-3 border-slate-200 hover:bg-slate-50">
              <Phone className="h-5 w-5 text-emerald-600" /> Telefone
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold">Ou continue com</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-12 rounded-2xl border-slate-200 hover:bg-blue-50">
                <Facebook className="h-5 w-5 text-blue-600" />
              </Button>
              <Button variant="outline" className="h-12 rounded-2xl border-slate-200 hover:bg-red-50">
                <Google className="h-5 w-5 text-red-500" />
              </Button>
              <Button variant="outline" className="h-12 rounded-2xl border-slate-200 hover:bg-slate-100">
                <Apple className="h-5 w-5 text-slate-900" />
              </Button>
            </div>

            <p className="text-center text-sm text-slate-500 mt-4">
              Não tem uma conta? <span className="text-purple-600 font-bold cursor-pointer hover:underline" onClick={() => navigate('/registro')}>Cadastre-se</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;