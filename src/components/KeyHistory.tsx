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
import { Search, Calendar as CalendarIcon, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface HistoryEntry {
  id: string;
  keyName: string;
  personName: string;
  action: 'checkout' | 'return';
  timestamp: string;
  operator: string;
}

const KeyHistory = ({ history }: { history: HistoryEntry[] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(entry => 
    entry.keyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.personName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Histórico de Movimentações</h3>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Filtrar por chave ou pessoa..." 
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
              <TableHead>Chave</TableHead>
              <TableHead>Pessoa</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Operador</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.keyName}</TableCell>
                  <TableCell>{entry.personName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entry.action === 'checkout' ? (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none gap-1">
                          <ArrowUpRight className="h-3 w-3" /> Retirada
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none gap-1">
                          <ArrowDownLeft className="h-3 w-3" /> Devolução
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {entry.timestamp}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{entry.operator}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-400 italic">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default KeyHistory;