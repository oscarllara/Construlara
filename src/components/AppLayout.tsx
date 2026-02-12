"use client";

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;