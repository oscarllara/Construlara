"use client";

import React from 'react';
import { LayoutGrid, Bell, User, Hammer, Receipt, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid },
    { name: 'Equipamentos', path: '/equipamentos', icon: Hammer },
    { name: 'Aluguéis', path: '/alugueis', icon: Receipt },
    { name: 'Admin', path: '/admin', icon: Shield },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logosolo.png" alt="Construlara Logo" className="h-10 w-10 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tighter text-blue-700">CONSTRULARA</span>
              <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">Locações</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50">
            <Bell className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white shadow-md">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;