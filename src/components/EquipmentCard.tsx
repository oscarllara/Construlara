"use client";

import React, { useState } from 'react';
import { Hammer, Tag, ArrowUpRight, Wrench, FileText, CheckCircle2, RotateCcw, Pencil, Package, Lock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/utils";
import { useNavigate } from 'react-router-dom';

export interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  dailyRate: number;
  weeklyRate?: number;
  biweeklyRate?: number;
  monthlyRate?: number;
  status: 'available' | 'rented' | 'maintenance';
  lastClient?: string;
  image?: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onRent: (id: string) => void;
  onMaintenance: (id: string) => void;
  onFinishRepair: (id: string) => void;
  onViewContract: (id: string) => void;
  onReturn: (equipment: Equipment) => void;
  onEdit: (equipment: Equipment) => void;
}

const EquipmentCard = ({ equipment, onRent, onMaintenance, onFinishRepair, onViewContract, onReturn, onEdit }: EquipmentCardProps) => {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole') || 'Visitante';
  
  // Preços agora são visíveis para todos
  const canSeePrice = true;
  const canEdit = isLoggedIn && ['Gestor', 'Vendas'].includes(userRole);

  const isRented = equipment.status === 'rented';
  const isMaintenance = equipment.status === 'maintenance';

  const handleRentAction = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    onRent(equipment.id);
  };

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-md transition-all hover:shadow-xl rounded-[2rem] relative group flex flex-col h-full",
      isRented ? "bg-red-50/30" : isMaintenance ? "bg-slate-50" : "bg-white"
    )}>
      {canEdit && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onEdit(equipment)}
          className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-blue-50 hover:text-blue-600 z-10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      <div className="aspect-video overflow-hidden bg-white relative flex items-center justify-center shrink-0 p-4 border-b border-slate-50">
        {!imgError && equipment.image ? (
          <img 
            src={equipment.image} 
            alt={equipment.name} 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-200">
            <Hammer className="h-12 w-12 mb-2" />
            <span className="text-[8px] font-black uppercase tracking-widest">Sem Foto</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={cn(
            "rounded-full px-4 py-1 border-none font-bold text-[10px] uppercase tracking-widest",
            isRented ? "bg-red-600 text-white" : isMaintenance ? "bg-slate-500 text-white" : "bg-blue-600 text-white"
          )}>
            {isRented ? "Alugado" : isMaintenance ? "Manutenção" : "Disponível"}
          </Badge>
        </div>
        <CardTitle className="text-lg font-black mt-2 text-slate-900 line-clamp-1">{equipment.name}</CardTitle>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Tag className="h-3 w-3" />
          {equipment.category} • {equipment.serialNumber}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-3 flex-1">
        {canSeePrice ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-2 rounded-xl text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase">Diária</p>
              <p className="text-sm font-black text-blue-700">R$ {equipment.dailyRate.toFixed(2)}</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl text-center">
              <p className="text-[8px] font-bold text-slate-400 uppercase">Mensal</p>
              <p className="text-sm font-black text-blue-700">R$ {equipment.monthlyRate?.toFixed(2) || '---'}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
            <Lock className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Preços sob consulta</span>
          </div>
        )}

        {isRented && canEdit && (
          <div className="pt-2 border-t border-red-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Cliente atual</p>
            <p className="text-sm font-black text-red-600 truncate">{equipment.lastClient || "Não informado"}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2 pb-6">
        {!isRented && !isMaintenance && (
          <>
            <Button 
              onClick={handleRentAction}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 shadow-lg shadow-blue-100"
            >
              <ArrowUpRight className="h-4 w-4" />
              {!isLoggedIn ? 'Entrar p/ Alugar' : 'Alugar'}
            </Button>
            {canEdit && (
              <Button 
                variant="outline"
                onClick={() => onMaintenance(equipment.id)}
                className="rounded-2xl border-slate-200 hover:bg-slate-50"
                title="Enviar para manutenção"
              >
                <Wrench className="h-4 w-4 text-slate-400" />
              </Button>
            )}
          </>
        )}
        {isRented && (canEdit || (isLoggedIn && userRole === 'Cliente')) && (
          <div className="flex flex-col w-full gap-2">
            {canEdit && (
              <Button 
                onClick={() => onReturn(equipment)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 shadow-lg shadow-blue-100"
              >
                <RotateCcw className="h-4 w-4" />
                Devolver
              </Button>
            )}
            <Button 
              variant="ghost"
              onClick={() => onViewContract(equipment.id)}
              className="w-full text-slate-500 hover:text-slate-900 font-bold text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              Ver Contrato
            </Button>
          </div>
        )}
        {isMaintenance && canEdit && (
          <Button 
            onClick={() => onFinishRepair(equipment.id)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Finalizar Reparo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;