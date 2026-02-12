"use client";

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Calendar as CalendarIcon, Gauge, AlertCircle, MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface VehicleHistoryEntry {
  id: string;
  vehicleModel: string;
  plate: string;
  driverName: string;
  destination: string;
  departureKm: number;
  returnKm?: number;
  departureTime: string;
  returnTime?: string;
  occurrence?: string;
}

const VehicleHistory = ({ history }: { history: VehicleHistoryEntry[] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(entry => 
    entry.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Histórico de Viagens</h3>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Filtrar por veículo, placa ou motorista..." 
            className="pl-10 rounded-xl border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>KM (Saída/Retorno)</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{entry.vehicleModel}</span>
                      <span className="text-xs text-slate-400 uppercase">{entry.plate}</span>
                    </div>
                  </TableCell>
                  <TableCell>{entry.driverName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {entry.destination}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-3.5 w-3.5 text-slate-400" />
                      <span>{entry.departureKm}</span>
                      <span className="text-slate-300">→</span>
                      <span className={entry.returnKm ? "text-slate-900" : "text-slate-400 italic"}>
                        {entry.returnKm || "Em trânsito"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> {entry.departureTime}
                      </div>
                      {entry.returnTime && (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" /> {entry.returnTime}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!entry.returnKm ? (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Em Viagem</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none">Concluída</Badge>
                      )}
                      {entry.occurrence && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-none rounded-lg">
                              <p className="max-w-xs">{entry.occurrence}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400 italic">
                  Nenhum registro de viagem encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default VehicleHistory;