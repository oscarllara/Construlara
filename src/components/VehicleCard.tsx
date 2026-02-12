"use client";

import React from 'react';
import { Car, User, MapPin, Gauge, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  status: 'available' | 'in-transit';
  currentKm: number;
  lastDriver?: string;
  destination?: string;
  departureKm?: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onDeparture: (id: string) => void;
  onReturn: (id: string) => void;
}

const VehicleCard = ({ vehicle, onDeparture, onReturn }: VehicleCardProps) => {
  const isTransit = vehicle.status === 'in-transit';

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-md transition-all hover:shadow-lg",
      isTransit ? "bg-blue-50/50" : "bg-white"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={cn(
            "p-2 rounded-xl",
            isTransit ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
          )}>
            <Car className="h-5 w-5" />
          </div>
          <Badge variant={isTransit ? "secondary" : "success"} className={cn(
            "rounded-full px-3",
            isTransit ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          )}>
            {isTransit ? "Em Trânsito" : "Disponível"}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-4">{vehicle.model}</CardTitle>
        <p className="text-sm font-mono text-slate-500 uppercase tracking-wider">{vehicle.plate}</p>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Gauge className="h-4 w-4 text-slate-400" />
          <span className="font-medium">{vehicle.currentKm.toLocaleString()} KM</span>
        </div>

        {isTransit ? (
          <div className="space-y-2 pt-1 border-t border-blue-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4 text-blue-400" />
              <span className="font-medium">{vehicle.lastDriver}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="truncate">{vehicle.destination}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic pt-1 border-t border-slate-50">Pronto para uso</p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {isTransit ? (
          <Button 
            onClick={() => onReturn(vehicle.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Registrar Retorno
          </Button>
        ) : (
          <Button 
            onClick={() => onDeparture(vehicle.id)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2"
          >
            <ArrowUpRight className="h-4 w-4" />
            Registrar Saída
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;