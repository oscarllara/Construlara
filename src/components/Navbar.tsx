"use client";

import React from 'react';
import { MessageCircle, LogIn, UserPlus, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-purple-600 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-purple-100">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Ki papo</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:bg-purple-50">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="h-8 w-px bg-slate-100 mx-2" />
          <Button variant="ghost" className="rounded-xl font-black text-slate-500 uppercase tracking-widest text-xs gap-2" onClick={() => navigate('/login')}>
            <LogIn className="h-4 w-4" /> Entrar
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black uppercase tracking-widest text-xs gap-2 px-6 shadow-lg shadow-purple-100" onClick={() => navigate('/registro')}>
            <UserPlus className="h-4 w-4" /> Criar Conta
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;