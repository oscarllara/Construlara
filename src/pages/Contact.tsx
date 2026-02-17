"use client";

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Facebook, Instagram, MapPin, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ContactPage = () => {
  const contacts = [
    { 
      title: "E-mail Corporativo", 
      value: "btmdesign01@gmail.com", 
      icon: Mail, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      link: "mailto:btmdesign01@gmail.com"
    },
    { 
      title: "Telefone Fixo", 
      value: "+55 (32) 3374-1135", 
      icon: Phone, 
      color: "text-slate-600", 
      bg: "bg-slate-100",
      link: "tel:+553233741135"
    },
    { 
      title: "WhatsApp Suporte", 
      value: "+55 (32) 99962-5979", 
      icon: MessageCircle, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      link: "https://wa.me/5532999625979"
    },
  ];

  const socials = [
    { 
      name: "Facebook", 
      handle: "construlara rdm", 
      icon: Facebook, 
      color: "text-blue-700", 
      link: "https://facebook.com/construlara.rdm" 
    },
    { 
      name: "Instagram", 
      handle: "@construlara.rdm", 
      icon: Instagram, 
      color: "text-pink-600", 
      link: "https://instagram.com/construlara.rdm" 
    },
  ];

  const handleOpenMaps = () => {
    window.open("https://www.google.com/maps/search/Construlara+São+João+del-Rei", "_blank");
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Canais de Atendimento</h2>
          <p className="text-slate-500 font-medium text-lg">Estamos aqui para ajudar você com qualquer dúvida ou suporte técnico.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {contacts.map((contact, i) => (
            <a 
              key={i} 
              href={contact.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="border-none shadow-sm rounded-[2.5rem] hover:shadow-xl hover:-translate-y-2 transition-all bg-white h-full">
                <CardHeader className="flex flex-col items-center pb-2 pt-8">
                  <div className={`${contact.bg} p-5 rounded-[2rem] mb-4 group-hover:scale-110 transition-transform`}>
                    <contact.icon className={`h-8 w-8 ${contact.color}`} />
                  </div>
                  <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">{contact.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <p className="text-sm font-black text-slate-900 break-all">{contact.value}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl rounded-[3rem] p-10 bg-blue-600 text-white overflow-hidden relative">
            <div className="relative z-10 space-y-8">
              <h3 className="text-2xl font-black tracking-tight">Redes Sociais</h3>
              <div className="space-y-6">
                {socials.map((social, i) => (
                  <a 
                    key={i} 
                    href={social.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-white/15 rounded-[2rem] hover:bg-white/25 transition-all group border border-white/10"
                  >
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <social.icon className={`h-8 w-8 ${social.color}`} />
                      </div>
                      <div>
                        <p className="font-black text-lg leading-none">{social.name}</p>
                        <p className="text-sm text-blue-100 font-bold mt-1">{social.handle}</p>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <ExternalLink className="h-5 w-5 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
          </Card>

          <Card className="border-none shadow-xl rounded-[3rem] p-10 bg-white border border-slate-100 flex flex-col justify-center items-center text-center space-y-6">
            <div className="h-20 w-20 bg-red-50 rounded-[2rem] flex items-center justify-center">
              <MapPin className="h-10 w-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Localização</h3>
              <p className="text-slate-500 font-medium">
                Visite nossa unidade física para conhecer nosso catálogo completo de equipamentos.
              </p>
            </div>
            <Button 
              onClick={handleOpenMaps}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold px-8 h-12 shadow-lg shadow-blue-100"
            >
              Ver no Google Maps
            </Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ContactPage;