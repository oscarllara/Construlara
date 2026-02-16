"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Layers, Maximize, Plus, Trash2, Calculator } from 'lucide-react';

const Calculators = () => {
  // Piso
  const [floorDim, setFloorDim] = useState({ w: "", l: "" });
  
  // Parede
  const [wallDim, setWallDim] = useState({ l: "", w: "", h: "" });
  const [openings, setOpenings] = useState<{ id: string, w: string, h: string }[]>([]);

  // Forro
  const [ceilingDim, setCeilingDim] = useState({ w: "", l: "" });

  const addOpening = () => setOpenings([...openings, { id: Date.now().toString(), w: "", h: "" }]);
  const removeOpening = (id: string) => setOpenings(openings.filter(o => o.id !== id));
  const updateOpening = (id: string, field: 'w' | 'h', val: string) => {
    setOpenings(openings.map(o => o.id === id ? { ...o, [field]: val } : o));
  };

  // Cálculos
  const floorArea = Number(floorDim.w) * Number(floorDim.l);
  const wallArea = ((2 * Number(wallDim.l)) + (2 * Number(wallDim.w))) * Number(wallDim.h);
  const openingsArea = openings.reduce((acc, o) => acc + (Number(o.w) * Number(o.h)), 0);
  const finalWallArea = Math.max(0, wallArea - openingsArea);
  const ceilingArea = Number(ceilingDim.w) * Number(ceilingDim.l);

  return (
    <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden">
      <CardHeader className="bg-slate-900 p-8 text-white">
        <CardTitle className="flex items-center gap-3 text-2xl font-black">
          <Calculator className="h-7 w-7 text-blue-400" />
          Calculadoras de Obra
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <Tabs defaultValue="piso" className="space-y-8">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-full">
            <TabsTrigger value="piso" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white">Pisos</TabsTrigger>
            <TabsTrigger value="parede" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white">Paredes</TabsTrigger>
            <TabsTrigger value="forro" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white">Forro/Telha</TabsTrigger>
          </TabsList>

          <TabsContent value="piso" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Largura (m)</Label>
                <Input type="number" value={floorDim.w} onChange={e => setFloorDim({...floorDim, w: e.target.value})} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Comprimento (m)</Label>
                <Input type="number" value={floorDim.l} onChange={e => setFloorDim({...floorDim, l: e.target.value})} className="rounded-xl h-12" />
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-[2rem] grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase">Área Útil</p>
                <p className="text-2xl font-black text-slate-900">{floorArea.toFixed(2)} m²</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase">Total (+10% Quebra)</p>
                <p className="text-2xl font-black text-blue-700">{(floorArea * 1.1).toFixed(2)} m²</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parede" className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Comprimento (m)</Label>
                <Input type="number" value={wallDim.l} onChange={e => setWallDim({...wallDim, l: e.target.value})} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Largura (m)</Label>
                <Input type="number" value={wallDim.w} onChange={e => setWallDim({...wallDim, w: e.target.value})} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Altura (m)</Label>
                <Input type="number" value={wallDim.h} onChange={e => setWallDim({...wallDim, h: e.target.value})} className="rounded-xl h-12" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-black text-slate-400 uppercase text-xs tracking-widest">Descontar Portas/Janelas</Label>
                <Button variant="outline" size="sm" onClick={addOpening} className="rounded-xl gap-2 font-bold">
                  <Plus className="h-4 w-4" /> Adicionar Vão
                </Button>
              </div>
              {openings.map((o) => (
                <div key={o.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl">
                  <Input placeholder="Largura" type="number" value={o.w} onChange={e => updateOpening(o.id, 'w', e.target.value)} className="h-10 rounded-xl" />
                  <span className="font-bold text-slate-400">X</span>
                  <Input placeholder="Altura" type="number" value={o.h} onChange={e => updateOpening(o.id, 'h', e.target.value)} className="h-10 rounded-xl" />
                  <Button variant="ghost" size="icon" onClick={() => removeOpening(o.id)} className="text-red-500 hover:bg-red-50 rounded-xl">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 p-6 rounded-[2rem] grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase">Área Líquida</p>
                <p className="text-2xl font-black text-slate-900">{finalWallArea.toFixed(2)} m²</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase">Total (+10% Quebra)</p>
                <p className="text-2xl font-black text-emerald-700">{(finalWallArea * 1.1).toFixed(2)} m²</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="forro" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Largura (m)</Label>
                <Input type="number" value={ceilingDim.w} onChange={e => setCeilingDim({...ceilingDim, w: e.target.value})} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Comprimento (m)</Label>
                <Input type="number" value={ceilingDim.l} onChange={e => setCeilingDim({...ceilingDim, l: e.target.value})} className="rounded-xl h-12" />
              </div>
            </div>
            <div className="bg-orange-50 p-6 rounded-[2rem] grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-orange-400 uppercase">Área Útil</p>
                <p className="text-2xl font-black text-slate-900">{ceilingArea.toFixed(2)} m²</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase">Total (+10% Quebra)</p>
                <p className="text-2xl font-black text-orange-700">{(ceilingArea * 1.1).toFixed(2)} m²</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Calculators;