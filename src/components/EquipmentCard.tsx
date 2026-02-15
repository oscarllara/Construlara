"use client";

import React from 'react';
import { Hammer, Tag, ArrowUpRight, Wrench, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
}

interface EquipmentCardProps {
  equipment: Equipment;
  onRent: (id: string) => void;
  onMaintenance: (id: string) => void;
  onFinishRepair: (id: string) => void;
  onViewContract: (id: string) => void;
  onReturn: (equipment: Equipment) => void;
}

const EquipmentCard = ({ equipment, onRent, onMaintenance, onFinishRepair, onViewContract, onReturn }: EquipmentCardProps) => {
  const isRented = equipment.status === 'rented';
  const isMaintenance = equipment.status === 'maintenance';

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-md transition-all hover:shadow-xl rounded-[2rem]",
      isRented ? "bg-red-50/30" : isMaintenance ? "bg-slate-50" : "bg-white"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={cn(
            "p-3 rounded-2xl shadow-sm",
            isRented ? "bg-red-100 text-red-600" : isMaintenance ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-600"
          )}>
            <Hammer className="h-5 w-5" />
          </div>
          <Badge variant="outline" className={cn(
            "rounded-full px-4 py-1 border-none font-bold text-[10px] uppercase tracking-widest",
            isRented ? "bg-red-600 text-white" : isMaintenance ? "bg-slate-500 text-white" : "bg-blue-600 text-white"
          )}>
            {isRented ? "Alugado" : isMaintenance ? "Manutenção" : "Disponível"}
          </Badge>
        </div>
        <CardTitle className="text-xl font-black mt-4 text-slate-900">{equipment.name}</CardTitle>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Tag className="h-3 w-3" />
          {equipment.category} • {equipment.serialNumber}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-3">
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

        {isRented && (
          <div className="pt-2 border-t border-red-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Cliente atual</p>
            <p className="text-sm font-black text-red-600">{equipment.lastClient || "Não informado"}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        {!isRented && !isMaintenance && (
          <>
            <Button 
              onClick={() => onRent(equipment.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 shadow-lg shadow-blue-100"
            >
              <ArrowUpRight className="h-4 w-4" />
              Alugar
            </Button>
            <Button 
              variant="outline"
              onClick={() => onMaintenance(equipment.id)}
              className="rounded-2xl border-slate-200 hover:bg-slate-50"
              title="Enviar para manutenção"
            >
              <Wrench className="h-4 w-4 text-slate-400" />
            </Button>
          </>
        )}
        {isRented && (
          <div className="flex flex-col w-full gap-2">
            <Button 
              onClick={() => onReturn(equipment)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 shadow-lg shadow-blue-100"
            >
              <RotateCcw className="h-4 w-4" />
              Devolver
            </Button>
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
        {isMaintenance && (
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