"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Receipt, Users, AlertCircle, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const stats = [
    { title: "Equipamentos", value: "124", icon: Hammer, color: "text-blue-600", bg: "bg-blue-50", path: "/equipamentos" },
    { title: "Aluguéis Ativos", value: "18", icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-50", path: "/alugueis" },
    { title: "Clientes", value: "85", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", path: "/usuarios" },
    { title: "Atrasados", value: "3", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", path: "/alugueis" },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Section - Boas-vindas com o Beto Oficial */}
        <section className="relative bg-slate-900 rounded-[3rem] p-8 md:p-16 overflow-hidden shadow-2xl border border-slate-800">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-500/20">
                <Sparkles className="h-3 w-3" /> Sistema Online
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                Olá! Eu sou o <span className="text-blue-500">Beto</span>.
              </h1>
              <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
                Seu assistente inteligente para gestão de locações na Construlara. Tudo pronto para começarmos?
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                <button 
                  onClick={() => navigate('/alugueis')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-900/20 hover:-translate-y-1"
                >
                  Novo Aluguel <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => navigate('/equipamentos')}
                  className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-700 transition-all border border-slate-700 hover:-translate-y-1"
                >
                  Ver Inventário
                </button>
              </div>
            </div>
            <div className="w-64 md:w-80 shrink-0 relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
              <div className="relative animate-bounce-slow">
                <img 
                  src="/beto.png" 
                  alt="Mascote Beto" 
                  className="w-full h-auto drop-shadow-[0_20px_50px_rgba(59,130,246,0.5)]" 
                />
                <div className="mt-4 text-center">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20">BETO OFICIAL</span>
                </div>
              </div>
            </div>
          </div>
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full -ml-48 -mb-48 blur-[120px]"></div>
        </section>

        {/* Estatísticas Rápidas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card 
              key={i} 
              onClick={() => navigate(stat.path)}
              className="border-none shadow-sm rounded-[2.5rem] hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group bg-white"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{stat.title}</CardTitle>
                <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:rotate-12`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Atualizado agora</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Atividades Recentes */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Atividades Recentes</h2>
              <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-6">
              {[
                { action: "Novo Aluguel", item: "Betoneira 400L", user: "Construtora Silva", time: "10 min atrás", icon: Receipt, color: "text-blue-600", bg: "bg-blue-50" },
                { action: "Devolução", item: "Martelete Rompedor", user: "Carlos Santos", time: "1 hora atrás", icon: Hammer, color: "text-emerald-600", bg: "bg-emerald-50" },
                { action: "Manutenção", item: "Gerador 5500W", user: "Equipe Técnica", time: "3 horas atrás", icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex gap-5">
                    <div className={`h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center border border-transparent group-hover:border-slate-200 transition-all`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.action}: {item.item}</p>
                      <p className="text-xs text-slate-500 font-bold">{item.user}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200/50 shadow-inner space-y-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Ações Rápidas</h2>
              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => navigate('/equipamentos')}
                  className="bg-white hover:bg-blue-600 p-8 rounded-[2.5rem] text-left transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1 border border-slate-200/60"
                >
                  <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                    <Hammer className="h-6 w-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <p className="font-black text-slate-900 group-hover:text-white text-lg">Novo Item</p>
                  <p className="text-xs text-slate-500 group-hover:text-blue-100 font-bold">Cadastrar ferramenta</p>
                </button>
                <button 
                  onClick={() => navigate('/alugueis')}
                  className="bg-white hover:bg-red-600 p-8 rounded-[2.5rem] text-left transition-all group shadow-sm hover:shadow-xl hover:-translate-y-1 border border-slate-200/60"
                >
                  <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                    <Receipt className="h-6 w-6 text-red-600 group-hover:text-white" />
                  </div>
                  <p className="font-black text-slate-900 group-hover:text-white text-lg">Novo Aluguel</p>
                  <p className="text-xs text-slate-500 group-hover:text-red-100 font-bold">Iniciar contrato</p>
                </button>
              </div>
            </div>
            {/* Logo de fundo sutil */}
            <img src="/logoconstrulara.png" className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 -rotate-12 pointer-events-none grayscale" />
          </div>
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Index;