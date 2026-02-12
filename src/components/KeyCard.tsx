"use client";

import React from 'react';
import { Key, User, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KeyItem {
  id: string;
  name: string;
  room: string;
  status: 'available' | 'in-use';
  currentHolder?: string;
  lastAction?: string;
}

interface KeyCardProps {
  keyItem: KeyItem;
  onCheckout: (id: string) => void;
  onReturn: (id: string) => void;
}

const KeyCard = ({ keyItem, onCheckout, onReturn }: KeyCardProps) => {
  const isInUse = keyItem.status === 'in-use';

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-md transition-all hover:shadow-lg",
      isInUse ? "bg-amber-50/50" : "bg-white"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={cn(
            "p-2 rounded-xl",
            isInUse ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
          )}>
            <Key className="h-5 w-5" />
          </div>
          <Badge variant={isInUse ? "warning" : "success"} className={cn(
            "rounded-full px-3",
            isInUse ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          )}>
            {isInUse ? "Em Uso" : "Disponível"}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-4">{keyItem.name}</CardTitle>
        <p className="text-sm text-slate-500">{keyItem.room}</p>
      </CardHeader>
      
      <CardContent className="pb-4">
        {isInUse ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4" />
              <span className="font-medium">{keyItem.currentHolder}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3.3 w-3.3" />
              <span>Retirada às {keyItem.lastAction}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Pronta para retirada</p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {isInUse ? (
          <Button 
            onClick={() => onReturn(keyItem.id)}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-2"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Registrar Devolução
          </Button>
        ) : (
          <Button 
            onClick={() => onCheckout(keyItem.id)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2"
          >
            <ArrowUpRight className="h-4 w-4" />
            Registrar Retirada
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default KeyCard;