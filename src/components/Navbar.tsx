"use client";

import React from 'react';
import { LayoutGrid, Bell, User } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-indigo-900">AppBuilder</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;