"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KeyCard from '@/components/KeyCard';
import KeyHistory from '@/components/KeyHistory';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';
import { Key as KeyIcon, Users } from 'lucide-react';

// Mock Data
const INITIAL_KEYS = [
  { id: '1', name: 'Laboratório de Informática 01', room: 'Bloco A - Sala 102', status: 'available' as const },
  { id: '2', name: 'Auditório Principal', room: 'Bloco C - Térreo', status: 'in-use' as const, currentHolder: 'Prof. Ricardo Silva', lastAction: '08:30' },
  { id: '3', name: 'Sala de Reuniões', room: 'Administrativo', status: 'available' as const },
  { id: '4', name: 'Almoxarifado Central', room: 'Bloco B - Fundos', status: 'available' as const },
];

const PEOPLE = [
  { id: 'p1', name: 'Prof. Ricardo Silva' },
  { id: 'p2', name: 'Ana Oliveira (Coordenação)' },
  { id: 'p3', name: 'Carlos Santos (Manutenção)' },
  { id: 'p4', name: 'Mariana Costa (TI)' },
];

const INITIAL_HISTORY = [
  { id: 'h1', keyName: 'Auditório Principal', personName: 'Prof. Ricardo Silva', action: 'checkout' as const, timestamp: '24/05/2024 08:30', operator: 'Porteiro João' },
];

const KeysPage = () => {
  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string>("");

  const handleCheckoutClick = (id: string) => {
    setSelectedKeyId(id);
    setIsCheckoutOpen(true);
  };

  const confirmCheckout = () => {
    if (!selectedPersonId || !selectedKeyId) {
      showError("Por favor, selecione uma pessoa.");
      return;
    }

    const person = PEOPLE.find(p => p.id === selectedPersonId);
    const key = keys.find(k => k.id === selectedKeyId);

    if (!person || !key) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullDateStr = now.toLocaleString('pt-BR');

    // Update Key Status
    setKeys(prev => prev.map(k => 
      k.id === selectedKeyId 
        ? { ...k, status: 'in-use', currentHolder: person.name, lastAction: timeStr } 
        : k
    ));

    // Add to History
    const newEntry = {
      id: `h-${Date.now()}`,
      keyName: key.name,
      personName: person.name,
      action: 'checkout' as const,
      timestamp: fullDateStr,
      operator: 'Porteiro Atual'
    };
    setHistory(prev => [newEntry, ...prev]);

    showSuccess(`Chave "${key.name}" retirada por ${person.name}`);
    setIsCheckoutOpen(false);
    setSelectedPersonId("");
    setSelectedKeyId(null);
  };

  const handleReturn = (id: string) => {
    const key = keys.find(k => k.id === id);
    if (!key) return;

    const now = new Date();
    const fullDateStr = now.toLocaleString('pt-BR');

    // Update Key Status
    setKeys(prev => prev.map(k => 
      k.id === id 
        ? { ...k, status: 'available', currentHolder: undefined, lastAction: undefined } 
        : k
    ));

    // Add to History
    const newEntry = {
      id: `h-${Date.now()}`,
      keyName: key.name,
      personName: key.currentHolder || "Ninguém",
      action: 'return' as const,
      timestamp: fullDateStr,
      operator: 'Porteiro Atual'
    };
    setHistory(prev => [newEntry, ...prev]);

    showSuccess(`Chave "${key.name}" devolvida com sucesso.`);
  };

  return (
    <AppLayout>
      <div className="space-y-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Gestão de Chaves</h2>
              <p className="text-slate-500">Controle de acesso e movimentação da portaria</p>
            </div>
            <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-sm font-medium text-indigo-700">Portaria Ativa</span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {keys.map(key => (
              <KeyCard 
                key={key.id} 
                keyItem={key} 
                onCheckout={handleCheckoutClick}
                onReturn={handleReturn}
              />
            ))}
          </div>
        </section>

        <section className="pt-4">
          <KeyHistory history={history} />
        </section>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyIcon className="h-5 w-5 text-indigo-600" />
              Registrar Retirada
            </DialogTitle>
            <DialogDescription>
              Selecione a pessoa responsável pela retirada desta chave.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="person" className="text-slate-700 font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Responsável
              </Label>
              <Select onValueChange={setSelectedPersonId} value={selectedPersonId}>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Selecione uma pessoa..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PEOPLE.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCheckoutOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={confirmCheckout} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              Confirmar Retirada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default KeysPage;