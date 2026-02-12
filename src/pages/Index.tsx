"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, CheckCircle2, Clock } from 'lucide-react';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center space-y-4 py-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Estrutura <span className="text-indigo-600">Pronta</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            O projeto foi inicializado com sucesso. Agora estamos prontos para transformar seus épicos e histórias de usuário em realidade.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none shadow-lg shadow-indigo-100/50 rounded-3xl">
            <CardHeader>
              <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-2">
                <Rocket className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">Pronto para Iniciar</CardTitle>
              <CardDescription>Aguardando o primeiro épico para começar o desenvolvimento.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg shadow-indigo-100/50 rounded-3xl">
            <CardHeader>
              <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Stack Moderna</CardTitle>
              <CardDescription>React, Tailwind CSS e Shadcn/UI configurados e prontos.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-lg shadow-indigo-100/50 rounded-3xl">
            <CardHeader>
              <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Desenvolvimento Ágil</CardTitle>
              <CardDescription>Estrutura modular preparada para iterações rápidas.</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Próximos Passos</h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-600" />
              Envie o primeiro Épico do projeto.
            </li>
            <li className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-600" />
              Definiremos as Histórias de Usuário juntas.
            </li>
            <li className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-600" />
              Implementaremos as funcionalidades passo a passo.
            </li>
          </ul>
        </div>
      </div>
      <MadeWithDyad />
    </AppLayout>
  );
};

export default Index;