"use client";

import React from 'react';
import { Hammer, Tag, ShieldCheck, AlertTriangle, ArrowUpRight, Wrench } from 'lucide-react';
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
  status: 'available' | 'rented' | 'maintenance';
  lastClient?: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onRent: (id: string) => void;
  onMaintenance: (id: string) => void;
}

const EquipmentCard = ({ equipment, onRent, onMaintenance }: EquipmentCardProps) => {
  const isRented = equipment.status === 'rented';
  const isMaintenance = equipment.status === 'maintenance';

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-md transition-all hover:shadow-lg",
      isRented ? "bg-orange-50/50" : isMaintenance ? "bg-rose-50/50" : "bg-white"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={cn(
            "p-2 rounded-xl",
            isRented ? "bg-orange-100 text-orange-600" : isMaintenance ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
          )}>
            <Hammer className="h-5 w-5" />
          </div>
          <Badge variant="outline" className={cn(
            "rounded-full px-3 border-none",
            isRented ? "bg-orange-100 text-orange-700" : isMaintenance ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
          )}>
            {isRented ? "Alugado" : isMaintenance ? "Manutenção" : "Disponível"}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-4">{equipment.name}</CardTitle>
        <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider">
          <Tag className="h-3 w-3" />
          {equipment.category} • {equipment.serialNumber}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Diária</span>
          <span className="text-lg font-bold text-slate-900">R$ {equipment.dailyRate.toFixed(2)}</span>
        </div>

        {isRented && (
          <div className="pt-2 border-t border-orange-100">
            <p className="text-xs text-slate-500">Cliente atual:</p>
            <p className="text-sm font-medium text-orange-700">{equipment.lastClient}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        {!isRented && !isMaintenance && (
          <>
            <Button 
              onClick={() => onRent(equipment.id)}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white rounded-xl gap-2"
            >
              <ArrowUpRight className="h-4 w-4" />
              Alugar
            </Button>
            <Button 
              variant="outline"
              onClick={() => onMaintenance(equipment.id)}
              className="rounded-xl border-slate-200"
            >
              <Wrench className="h-4 w-4 text-slate-400" />
            </Button>
          </>
        )}
        {isRented && (
          <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
            Ver Contrato
          </Button>
        )}
        {isMaintenance && (
          <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl">
            Finalizar Reparo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;