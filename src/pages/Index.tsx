"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Receipt, Users, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const stats = [
    { title: "Equipamentos", value: "124", icon: Hammer, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Aluguéis Ativos", value: "18", icon: Receipt, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Clientes", value: "85", icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Atrasados", value: "3", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500">Bem-vindo ao ToolRent. Aqui está o resumo da sua operação hoje.</p>
        </section>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-sm rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
                <div className={`${stat.bg} p-2 rounded-xl`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Atividades Recentes</h2>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="space-y-4">
              {[
                { action: "Novo Aluguel", item: "Betoneira 400L", user: "Construtora Silva", time: "10 min atrás" },
                { action: "Devolução", item: "Martelete Rompedor", user: "Carlos Santos", time: "1 hora atrás" },
                { action: "Manutenção", item: "Gerador 5500W", user: "Equipe Técnica", time: "3 horas atrás" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.action}: {item.item}</p>
                      <p className="text-xs text-slate-500">{item.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-600 p-8 rounded-3xl text-white space-y-6">
            <h2 className="text-xl font-bold">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-colors">
                <Hammer className="h-6 w-6 mb-2" />
                <p className="font-semibold">Novo Item</p>
                <p className="text-xs text-orange-100">Cadastrar ferramenta</p>
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-left transition-colors">
                <Receipt className="h-6 w-6 mb-2" />
                <p className="font-semibold">Novo Aluguel</p>
                <p className="text-xs text-orange-100">Iniciar contrato</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Index;