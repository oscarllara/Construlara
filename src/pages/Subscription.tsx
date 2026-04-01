"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Cloud, BarChart3, ShieldCheck, Zap, ArrowRight, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Subscription = () => {
  const benefits = [
    {
      title: "Sincronização em Nuvem",
      desc: "Acesse seus dados de qualquer lugar. Seus clientes, estoque e aluguéis salvos com segurança máxima.",
      icon: Cloud,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Beto AI Avançado",
      desc: "O Beto agora analisa fotos e projetos para calcular materiais e sugerir orçamentos inteligentes.",
      icon: Sparkles,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Relatórios de Performance",
      desc: "Gráficos de faturamento mensal, produtos mais vendidos e lucratividade real por equipamento.",
      icon: BarChart3,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Marca Branca (White Label)",
      desc: "Gere contratos e cupons com a sua logo e cores, removendo qualquer menção ao sistema.",
      icon: ShieldCheck,
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <Crown className="h-4 w-4" /> Upgrade Disponível
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Leve sua obra para o <span className="text-blue-700">Próximo Nível</span></h1>
          <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">
            Desbloqueie ferramentas exclusivas de gestão e inteligência artificial para crescer com a Construlara.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((b, i) => (
            <Card key={i} className="border-none shadow-sm rounded-[3rem] p-8 bg-white hover:shadow-xl transition-all group">
              <div className="flex gap-6">
                <div className={cn("h-16 w-16 rounded-[2rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", b.bg)}>
                  <b.icon className={cn("h-8 w-8", b.color)} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">{b.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{b.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-2xl rounded-[4rem] bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Zap className="h-64 w-64 text-white" />
          </div>
          <CardContent className="p-12 md:p-20 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-4xl font-black tracking-tighter">Plano Construlara <span className="text-blue-400">PRO</span></h2>
              <ul className="space-y-3">
                {["Usuários Ilimitados", "Suporte 24/7 via WhatsApp", "Backup Automático Diário", "API para Integrações"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-[3.5rem] border border-white/10 text-center space-y-6 min-w-[300px]">
              <div>
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Assinatura Mensal</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold">R$</span>
                  <span className="text-6xl font-black">97</span>
                  <span className="text-xl font-bold text-slate-400">/mês</span>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 gap-2">
                Assinar Agora <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Cancele quando quiser • Sem fidelidade</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Subscription;