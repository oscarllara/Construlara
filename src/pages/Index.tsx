"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Heart, Star, Sparkles, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CATEGORIES = ["Sexo", "Amizade", "Namoro", "Relacionamento", "Amizade Evangélico"];
const REGIONS = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Salvador", "Porto Alegre"];

const Index = () => {
  const [selectedRegion, setSelectedRegion] = useState("São Paulo");
  const [selectedCategory, setSelectedCategory] = useState("Amizade");
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <section className="relative rounded-[3.5rem] bg-gradient-to-br from-purple-600 to-indigo-700 p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <MessageCircle size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <Badge className="bg-white/20 text-white border-none py-1 px-4 rounded-full font-black text-xs uppercase tracking-widest backdrop-blur-md">
                <Sparkles className="h-3 w-3 mr-2" /> 2,450 usuários online agora
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
                Sua próxima conversa <br /> começa aqui.
              </h1>
              <p className="text-purple-100 text-xl font-medium max-w-lg">
                Encontre salas dinâmicas, faça amigos ou algo mais. Tudo de forma anônima e segura.
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Regiões
              </h3>
              <div className="space-y-2">
                {REGIONS.map(region => (
                  <button 
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={cn(
                      "w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all",
                      selectedRegion === region ? "bg-purple-600 text-white shadow-lg shadow-purple-100" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input placeholder="Buscar sala específica..." className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
                {CATEGORIES.map(cat => (
                  <Button 
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "rounded-full px-6 font-bold h-11 border-slate-200",
                      selectedCategory === cat && "bg-purple-600 hover:bg-purple-700"
                    )}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  onClick={() => navigate(`/sala/sala-${i}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <Users className="h-6 w-6 text-purple-600 group-hover:text-white" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase">
                      {Math.floor(Math.random() * 50) + 10} Online
                    </Badge>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                    Sala {selectedRegion} {i}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium mt-2">
                    Tópico: Conversas sobre {selectedCategory.toLowerCase()}.
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100" />
                      ))}
                    </div>
                    <span className="text-xs font-black text-purple-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Entrar →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Index;