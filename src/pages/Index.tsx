"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Receipt, Users, AlertCircle, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const stats = [
    { title: "Equipamentos", value: "124", icon: Hammer, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Aluguéis Ativos", value: "18", icon: Receipt, color: "text-red-600", bg: "bg-red-50" },
    { title: "Clientes", value: "85", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Atrasados", value: "3", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Boas-vindas com Mascote */}
        <section className="relative bg-gradient-to-r from-blue-700 to-blue-800 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Olá! Eu sou o <span className="text-red-400">Beto</span>.
              </h1>
              <p className="text-blue-100 text-lg max-w-md">
                Pronto para gerenciar as locações da Construlara hoje? Tudo está sob controle por aqui!
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                <button className="bg-white text-blue-700 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg">
                  Novo Aluguel <ArrowRight className="h-4 w-4" />
                </button>
                <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg">
                  Ver Inventário
                </button>
              </div>
            </div>
            <div className="w-48 md:w-64 shrink-0 animate-bounce-slow">
              <img src="/beto.png" alt="Beto Mascote" className="w-full h-auto drop-shadow-2xl" />
            </div>
          </div>
          {/* Elementos decorativos */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-[2rem] hover:scale-105 transition-transform">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
                <div className={`${stat.bg} p-3 rounded-2xl`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Atividades Recentes</h2>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-4">
              {[
                { action: "Novo Aluguel", item: "Betoneira 400L", user: "Construtora Silva", time: "10 min atrás" },
                { action: "Devolução", item: "Martelete Rompedor", user: "Carlos Santos", time: "1 hora atrás" },
                { action: "Manutenção", item: "Gerador 5500W", user: "Equipe Técnica", time: "3 horas atrás" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      <Clock className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.action}: {item.item}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.user}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Ações Rápidas</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 p-6 rounded-[2rem] text-left transition-all group shadow-lg shadow-blue-200">
                  <Hammer className="h-8 w-8 mb-3 text-white group-hover:scale-110 transition-transform" />
                  <p className="font-black text-white">Novo Item</p>
                  <p className="text-xs text-blue-100">Cadastrar ferramenta</p>
                </button>
                <button className="bg-red-600 hover:bg-red-700 p-6 rounded-[2rem] text-left transition-all group shadow-lg shadow-red-200">
                  <Receipt className="h-8 w-8 mb-3 text-white group-hover:scale-110 transition-transform" />
                  <p className="font-black text-white">Novo Aluguel</p>
                  <p className="text-xs text-red-100">Iniciar contrato</p>
                </button>
              </div>
            </div>
            {/* Logo de fundo sutil */}
            <img src="/logosolo.png" alt="" className="absolute -bottom-10 -right-10 w-48 h-48 opacity-5 pointer-events-none" />
          </div>
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Index;