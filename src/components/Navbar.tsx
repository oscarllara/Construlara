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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-orange-600 p-2 rounded-xl">
              <Hammer className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">ToolRent</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  location.pathname === item.path 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
            <User className="h-5 w-5 text-orange-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;