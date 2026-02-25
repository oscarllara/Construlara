"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Receipt, Users, AlertCircle, ArrowRight, Sparkles, ShoppingBag, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddEquipmentDialog from '@/components/AddEquipmentDialog';
import AddRentalDialog from '@/components/AddRentalDialog';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const navigate = useNavigate();
  const [isAddEquipOpen, setIsAddEquipOpen] = useState(false);
  const [isAddRentalOpen, setIsAddRentalOpen] = useState(false);
  
  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const isInternal = isLoggedIn && ['Gestor', 'Vendas', 'Entregador'].includes(userRole);

  const [counts, setCounts] = useState({
    equipments: 0,
    products: 0,
    activeRentals: 0,
    clients: 0,
    overdue: 0
  });

  useEffect(() => {
    const loadStats = () => {
      try {
        const savedEquip = localStorage.getItem('app_equipments');
        const equipments = (savedEquip && savedEquip !== "undefined") ? JSON.parse(savedEquip) : [];
        
        const savedProducts = localStorage.getItem('app_products');
        const products = (savedProducts && savedProducts !== "undefined") ? JSON.parse(savedProducts) : [];

        const savedRentals = localStorage.getItem('app_rentals');
        const rentals = (savedRentals && savedRentals !== "undefined") ? JSON.parse(savedRentals) : [];
        
        const savedUsers = localStorage.getItem('app_users');
        const users = (savedUsers && savedUsers !== "undefined") ? JSON.parse(savedUsers) : [];

        setCounts({
          equipments: Array.isArray(equipments) ? equipments.length : 0,
          products: Array.isArray(products) ? products.length : 0,
          activeRentals: Array.isArray(rentals) ? rentals.filter((r: any) => r && r.status === 'active').length : 0,
          clients: Array.isArray(users) ? users.length : 0,
          overdue: Array.isArray(rentals) ? rentals.filter((r: any) => r && r.status === 'overdue').length : 0
        });
      } catch (e) {
        console.error("Erro ao carregar estatísticas:", e);
      }
    };

    loadStats();
    window.addEventListener('storage', loadStats);
    return () => window.removeEventListener('storage', loadStats);
  }, []);

  const internalStats = [
    { title: "Equipamentos", value: counts.equipments.toString(), icon: Hammer, color: "text-blue-600", bg: "bg-blue-50", path: "/equipamentos" },
    { title: "Aluguéis Ativos", value: counts.activeRentals.toString(), icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-50", path: "/alugueis" },
    { title: "Clientes", value: counts.clients.toString(), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", path: "/usuarios" },
    { title: "Atrasados", value: counts.overdue.toString(), icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", path: "/alugueis" },
  ];

  const clientStats = [
    { title: "Equipamentos", value: counts.equipments.toString(), icon: Hammer, color: "text-blue-600", bg: "bg-blue-50", path: "/equipamentos", description: "Ferramentas para locação" },
    { title: "Produtos", value: counts.products.toString(), icon: Package, color: "text-orange-600", bg: "bg-orange-50", path: "/loja", description: "Materiais para sua obra" },
  ];

  const activeStats = isInternal ? internalStats : clientStats;

  const handleAddEquipment = (data: any) => {
    const saved = localStorage.getItem('app_equipments');
    const current = (saved && saved !== "undefined") ? JSON.parse(saved) : [];
    const newItem = { id: `e-${Date.now()}`, ...data, status: 'available' };
    const updated = [newItem, ...current];
    localStorage.setItem('app_equipments', JSON.stringify(updated));
    setCounts(prev => ({ ...prev, equipments: updated.length }));
    setIsAddEquipOpen(false);
    showSuccess(`${data.name} cadastrado com sucesso!`);
  };

  const handleAddRental = (data: any) => {
    const savedRentals = localStorage.getItem('app_rentals');
    const currentRentals = (savedRentals && savedRentals !== "undefined") ? JSON.parse(savedRentals) : [];
    const newRental = { id: `r-${Date.now()}`, ...data, status: 'active' };
    const updatedRentals = [newRental, ...currentRentals];
    localStorage.setItem('app_rentals', JSON.stringify(updatedRentals));
    
    const savedEquip = localStorage.getItem('app_equipments');
    if (savedEquip && savedEquip !== "undefined") {
      try {
        const allEquip = JSON.parse(savedEquip);
        if (Array.isArray(allEquip)) {
          const updatedEquip = allEquip.map((e: any) => 
            e.id === data.equipmentId ? { ...e, status: 'rented', lastClient: data.clientName } : e
          );
          localStorage.setItem('app_equipments', JSON.stringify(updatedEquip));
        }
      } catch (e) { console.error(e); }
    }

    setCounts(prev => ({ ...prev, activeRentals: updatedRentals.filter((r: any) => r && r.status === 'active').length }));
    setIsAddRentalOpen(false);
    showSuccess(`Contrato gerado para ${data.clientName}!`);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 rounded-[3rem] p-8 md:p-16 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-white/10">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg animate-pulse">
                <span className="h-2 w-2 bg-white rounded-full"></span> Sistema Oficial
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
                  Olá! Eu sou o <br />
                  <span className="text-red-500 drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)] filter">Beto</span>.
                </h1>
                
                <p className="text-blue-100 text-xl max-w-lg font-bold leading-relaxed">
                  Seu assistente inteligente para gestão de locações e compras na Construlara Material de Construção.
                </p>

                <div className="bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-2xl w-fit mx-auto md:mx-0">
                  <p className="text-blue-300 text-lg font-black italic tracking-wide">"Um passo a frente em sua obra!"</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                {isInternal ? (
                  <button 
                    onClick={() => setIsAddRentalOpen(true)}
                    className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center gap-3 shadow-[0_10px_20px_rgba(220,38,38,0.4)] hover:-translate-y-1 active:scale-95 text-lg"
                  >
                    Novo Aluguel <ArrowRight className="h-6 w-6" />
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/equipamentos')}
                    className="bg-red-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-red-700 transition-all flex items-center gap-3 shadow-[0_10px_20px_rgba(220,38,38,0.4)] hover:-translate-y-1 active:scale-95 text-lg"
                  >
                    Ver Equipamentos <ArrowRight className="h-6 w-6" />
                  </button>
                )}
                <button 
                  onClick={() => navigate('/loja')}
                  className="bg-white text-blue-700 px-10 py-5 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-lg flex items-center gap-3"
                >
                  <ShoppingBag className="h-6 w-6" /> Ir para a Loja
                </button>
              </div>
            </div>

            <div className="w-64 md:w-80 shrink-0 relative">
              <div className="absolute inset-0 bg-red-600/20 blur-[120px] rounded-full"></div>
              <div className="relative bg-white p-4 rounded-[4rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-8 border-blue-600/20">
                <img src="/beto.png" alt="Mascote Beto" className="w-full h-auto rounded-[3.5rem]" />
              </div>
            </div>
          </div>
        </section>

        <div className={`grid gap-6 ${isInternal ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 max-w-4xl mx-auto'}`}>
          {activeStats.map((stat, i) => (
            <Card key={i} onClick={() => navigate(stat.path)} className="border-none shadow-sm rounded-[2.5rem] hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{stat.title}</CardTitle>
                  {!isInternal && <p className="text-[10px] text-slate-400 font-bold">{(stat as any).description}</p>}
                </div>
                <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:rotate-12`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AddEquipmentDialog open={isAddEquipOpen} onOpenChange={setIsAddEquipOpen} onAdd={handleAddEquipment} />
      <AddRentalDialog open={isAddRentalOpen} onOpenChange={setIsAddRentalOpen} onAdd={handleAddRental} />
    </AppLayout>
  );
};

export default Index;