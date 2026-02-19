"use client";

import React, { useState, useEffect } from 'react';
import { LayoutGrid, User, Hammer, Receipt, Users, LogOut, BarChart3, PhoneCall, UserCircle, FileText, ShoppingBag, ShoppingCart, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';
import NotificationBell from './NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole') || 'Visitante';
  const userEmail = localStorage.getItem('userEmail') || '';

  const updateCartCount = () => {
    try {
      const cartData = localStorage.getItem('app_cart');
      if (!cartData) {
        setCartCount(0);
        return;
      }
      const cart = JSON.parse(cartData);
      if (Array.isArray(cart)) {
        const count = cart.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    } catch (e) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Lógica de permissões de menu
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid, roles: ['Gestor', 'Vendas', 'Entregador'] },
    { name: 'Loja', path: '/loja', icon: ShoppingBag, roles: ['all'] },
    { name: 'Equipamentos', path: '/equipamentos', icon: Hammer, roles: ['all'] },
    { name: 'Aluguéis', path: '/alugueis', icon: Receipt, roles: ['Gestor', 'Vendas', 'Entregador', 'Cliente'] },
    { name: 'Usuários', path: '/usuarios', icon: Users, roles: ['Gestor'] },
    { name: 'Relatórios', path: '/relatorios', icon: BarChart3, roles: ['Gestor', 'Vendas'] },
    { name: 'Contato', path: '/contato', icon: PhoneCall, roles: ['all'] },
  ];

  const filteredItems = navItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(userRole)
  );

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    showSuccess("Sessão encerrada.");
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-24 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={isLoggedIn ? "/" : "/loja"} className="flex items-center group">
            <div className="h-24 w-64 flex items-center justify-start transition-transform group-hover:scale-105">
              <img src="/logoconstrulara.png" alt="Construlara Logo" className="h-full w-full object-contain object-left" />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {filteredItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap",
                  location.pathname === item.path ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/carrinho')} className="rounded-2xl bg-blue-700 hover:bg-blue-800 text-white relative h-14 px-6 flex items-center gap-3 shadow-xl shadow-blue-100">
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-600 text-white text-[11px] font-black flex items-center justify-center rounded-full border-2 border-blue-700">{cartCount}</span>}
            </div>
            <span className="hidden md:inline font-black text-sm uppercase tracking-wider">Meu Carrinho</span>
          </Button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-12 w-12 rounded-full p-0 hover:bg-transparent focus-visible:ring-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border-2 border-white shadow-md hover:scale-105 transition-transform">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-[2rem] p-4 bg-white border border-slate-100 shadow-2xl mt-2 z-[100]" align="end">
                    <DropdownMenuLabel className="px-4 py-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black text-slate-900 leading-none">Minha Conta</p>
                        <p className="text-xs font-bold text-slate-400 truncate">{userEmail}</p>
                        <Badge className="w-fit mt-2 bg-blue-50 text-blue-700 border-none text-[10px] font-black uppercase">{userRole}</Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-100 my-2" />
                    <DropdownMenuItem onClick={() => navigate('/perfil')} className="rounded-xl py-3 px-4 cursor-pointer hover:bg-blue-50 group">
                      <UserCircle className="mr-3 h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                      <span className="font-bold text-slate-600 group-hover:text-blue-700">Meu Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/perfil')} className="rounded-xl py-3 px-4 cursor-pointer hover:bg-blue-50 group">
                      <ShoppingBag className="mr-3 h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                      <span className="font-bold text-slate-600 group-hover:text-blue-700">Meus Pedidos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/perfil')} className="rounded-xl py-3 px-4 cursor-pointer hover:bg-blue-50 group">
                      <FileText className="mr-3 h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                      <span className="font-bold text-slate-600 group-hover:text-blue-700">Meus Contratos</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl py-3 px-4 cursor-pointer hover:bg-red-50 group">
                      <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-red-600" />
                      <span className="font-bold text-slate-600 group-hover:text-red-700">Sair do Sistema</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => navigate('/login')} variant="ghost" className="rounded-xl font-bold gap-2 text-blue-700 hover:bg-blue-50">
                <LogIn className="h-4 w-4" /> Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;