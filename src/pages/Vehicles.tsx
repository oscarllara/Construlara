"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import VehicleCard, { Vehicle } from '@/components/VehicleCard';
import VehicleHistory, { VehicleHistoryEntry } from '@/components/VehicleHistory';
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from '@/utils/toast';
import { Car, User, MapPin, Gauge, AlertTriangle } from 'lucide-react';

// Mock Data
const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v1', model: 'Toyota Corolla', plate: 'ABC-1234', status: 'available', currentKm: 45200 },
  { id: 'v2', model: 'Fiat Toro', plate: 'XYZ-9876', status: 'in-transit', currentKm: 12850, lastDriver: 'Carlos Santos', destination: 'Viagem - Curitiba/PR', departureKm: 12700 },
  { id: 'v3', model: 'VW Gol', plate: 'KJH-4455', status: 'available', currentKm: 89300 },
  { id: 'v4', model: 'Chevrolet Onix', plate: 'PLM-0011', status: 'available', currentKm: 15600 },
];

const DRIVERS = [
  { id: 'd1', name: 'Carlos Santos' },
  { id: 'd2', name: 'Mariana Costa' },
  { id: 'd3', name: 'João Pereira' },
  { id: 'd4', name: 'Ana Oliveira' },
];

const INITIAL_HISTORY: VehicleHistoryEntry[] = [
  { 
    id: 'h1', 
    vehicleModel: 'Fiat Toro', 
    plate: 'XYZ-9876', 
    driverName: 'Carlos Santos', 
    destination: 'Viagem - Curitiba/PR', 
    departureKm: 12700, 
    departureTime: '24/05/2024 07:15',
    operator: 'Porteiro João'
  },
];

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [filter, setFilter] = useState<'all' | 'transit'>('all');
  
  // Departure State
  const [isDepartureOpen, setIsDepartureOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [departureData, setDepartureData] = useState({
    driverId: "",
    destination: "",
    purpose: "",
    km: ""
  });

  // Return State
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnKm, setReturnKm] = useState("");
  const [occurrence, setOccurrence] = useState("");

  const handleDepartureClick = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      setSelectedVehicleId(id);
      setDepartureData({ ...departureData, km: vehicle.currentKm.toString() });
      setIsDepartureOpen(true);
    }
  };

  const handleReturnClick = (id: string) => {
    setSelectedVehicleId(id);
    setIsReturnOpen(true);
  };

  const confirmDeparture = () => {
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    const driver = DRIVERS.find(d => d.id === departureData.driverId);
    const kmValue = parseInt(departureData.km);

    if (!driver || !departureData.destination || !departureData.km) {
      showError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (vehicle && kmValue < vehicle.currentKm) {
      showError(`A KM de saída não pode ser menor que a KM atual (${vehicle.currentKm}).`);
      return;
    }

    const now = new Date();
    const fullDateStr = now.toLocaleString('pt-BR');

    // Update Vehicle
    setVehicles(prev => prev.map(v => 
      v.id === selectedVehicleId 
        ? { 
            ...v, 
            status: 'in-transit', 
            lastDriver: driver.name, 
            destination: departureData.destination,
            departureKm: kmValue,
            currentKm: kmValue
          } 
        : v
    ));

    // Add to History
    const newEntry: VehicleHistoryEntry = {
      id: `vh-${Date.now()}`,
      vehicleModel: vehicle!.model,
      plate: vehicle!.plate,
      driverName: driver.name,
      destination: departureData.destination,
      departureKm: kmValue,
      departureTime: fullDateStr,
    };
    setHistory(prev => [newEntry, ...prev]);

    showSuccess(`Saída do veículo ${vehicle!.model} registrada.`);
    setIsDepartureOpen(false);
    setDepartureData({ driverId: "", destination: "", purpose: "", km: "" });
  };

  const confirmReturn = () => {
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    const kmValue = parseInt(returnKm);

    if (!kmValue) {
      showError("Informe a quilometragem de retorno.");
      return;
    }

    if (vehicle && kmValue <= vehicle.departureKm!) {
      showError(`A KM de retorno deve ser maior que a KM de saída (${vehicle.departureKm}).`);
      return;
    }

    const now = new Date();
    const fullDateStr = now.toLocaleString('pt-BR');

    // Update Vehicle
    setVehicles(prev => prev.map(v => 
      v.id === selectedVehicleId 
        ? { 
            ...v, 
            status: 'available', 
            currentKm: kmValue,
            lastDriver: undefined,
            destination: undefined,
            departureKm: undefined
          } 
        : v
    ));

    // Update History Entry
    setHistory(prev => prev.map(entry => 
      (entry.plate === vehicle!.plate && !entry.returnKm)
        ? { ...entry, returnKm: kmValue, returnTime: fullDateStr, occurrence: occurrence || undefined }
        : entry
    ));

    showSuccess(`Retorno do veículo ${vehicle!.model} registrado com sucesso.`);
    setIsReturnOpen(false);
    setReturnKm("");
    setOccurrence("");
  };

  const filteredVehicles = filter === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.status === 'in-transit');

  return (
    <AppLayout>
      <div className="space-y-10">
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Gestão de Frota</h2>
              <p className="text-slate-500">Controle de saídas, retornos e quilometragem dos veículos</p>
            </div>
            
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="bg-slate-100 p-1 rounded-2xl">
                <TabsTrigger value="all" className="rounded-xl px-6">Todos</TabsTrigger>
                <TabsTrigger value="transit" className="rounded-xl px-6">Em Trânsito</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredVehicles.map(vehicle => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onDeparture={handleDepartureClick}
                onReturn={handleReturnClick}
              />
            ))}
            {filteredVehicles.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Car className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Nenhum veículo em trânsito no momento.</p>
              </div>
            )}
          </div>
        </section>

        <section className="pt-4">
          <VehicleHistory history={history} />
        </section>
      </div>

      {/* Departure Dialog */}
      <Dialog open={isDepartureOpen} onOpenChange={setIsDepartureOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-indigo-600" />
              Registrar Saída de Veículo
            </DialogTitle>
            <DialogDescription>
              Informe os detalhes da viagem para liberar o veículo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  <User className="h-4 w-4" /> Motorista
                </Label>
                <Select onValueChange={(v) => setDepartureData({...departureData, driverId: v})}>
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {DRIVERS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4" /> KM de Saída
                </Label>
                <Input 
                  type="number" 
                  value={departureData.km}
                  onChange={(e) => setDepartureData({...departureData, km: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Destino
              </Label>
              <Input 
                placeholder="Ex: Viagem - São Paulo/SP ou Local" 
                value={departureData.destination}
                onChange={(e) => setDepartureData({...departureData, destination: e.target.value})}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Finalidade</Label>
              <Textarea 
                placeholder="Descreva o motivo do uso..." 
                value={departureData.purpose}
                onChange={(e) => setDepartureData({...departureData, purpose: e.target.value})}
                className="rounded-xl border-slate-200 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDepartureOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={confirmDeparture} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              Confirmar Saída
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-blue-600" />
              Registrar Retorno
            </DialogTitle>
            <DialogDescription>
              Confirme a quilometragem final e registre ocorrências se houver.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <Gauge className="h-4 w-4" /> KM de Retorno
              </Label>
              <Input 
                type="number" 
                placeholder="Informe a KM atual do painel"
                value={returnKm}
                onChange={(e) => setReturnKm(e.target.value)}
                className="rounded-xl border-slate-200 text-lg font-bold"
              />
              <p className="text-xs text-slate-400">
                KM de saída: {vehicles.find(v => v.id === selectedVehicleId)?.departureKm}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Ocorrências (Opcional)
              </Label>
              <Textarea 
                placeholder="Ex: Carro sujo, barulho no freio, etc..." 
                value={occurrence}
                onChange={(e) => setOccurrence(e.target.value)}
                className="rounded-xl border-slate-200 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsReturnOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={confirmReturn} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              Confirmar Retorno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default VehiclesPage;