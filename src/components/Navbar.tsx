"use client";

import React from 'react';
import { LayoutGrid, Bell, User, Hammer, Receipt, Users, LogOut, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid },
    { name: 'Equipamentos', path: '/equipamentos', icon: Hammer },
    { name: 'Aluguéis', path: '/alugueis', icon: Receipt },
    { name: 'Usuários', path: '/usuarios', icon: Users },
    { name: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    showSuccess("Sessão encerrada com sucesso.");
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-24 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center group">
            <div className="h-24 w-80 flex items-center justify-start transition-transform group-hover:scale-105">
              <img 
                src="/logoconstrulara.png" 
                alt="Construlara Logo" 
                className="h-full w-full object-contain object-left" 
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 relative">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-2 border-white shadow-md">
              <User className="h-5 w-5 text-white" />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"
              title="Sair do sistema"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;