"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Calculators = () => {
  const navigate = useNavigate();
  
  // Piso
  const [floorDim, setFloorDim] = useState({ w: "", l: "" });
  
  // Parede
  const [wallDim, setWallDim] = useState({ l: "", w: "", h: "" });
  const [openings, setOpenings] = useState<{ id: string, w: string, h: string }[]>([]);

  // Argamassa
  const [mortarArea, setMortarArea] = useState("");
  const [applicationType, setApplicationType] = useState<"simple" | "double">("simple");

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
  
  const consumption = applicationType === "simple" ? 5 : 8.5;
  const totalMortarKg = Number(mortarArea) * consumption;
  const bags20kg = Math.ceil(totalMortarKg / 20);

  const goToCategory = (category: string) => {
    navigate(`/?category=${encodeURIComponent(category)}`);
  };

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
            <TabsTrigger value="argamassa" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white">Argamassa</TabsTrigger>
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
            <button 
              onClick={() => goToCategory("Pisos e revestimentos")}
              className="w-full bg-blue-50 p-6 rounded-[2rem] grid grid-cols-2 gap-4 hover:bg-blue-100 transition-all group text-left"
            >
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase">Área Útil</p>
                <p className="text-2xl font-black text-slate-900">{floorArea.toFixed(2)} m²</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase">Total (+10%)</p>
                  <p className="text-2xl font-black text-blue-700">{(floorArea * 1.1).toFixed(2)} m²</p>
                </div>
                <ArrowRight className="h-6 w-6 text-blue-400 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
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
                <p className="text-[10px] font-black text-emerald-600 uppercase">Total (+10%)</p>
                <p className="text-2xl font-black text-emerald-700">{(finalWallArea * 1.1).toFixed(2)} m²</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="argamassa" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold">Área Total a Revestir (m²)</Label>
                <Input 
                  type="number" 
                  value={mortarArea} 
                  onChange={e => setMortarArea(e.target.value)} 
                  placeholder="Ex: 50"
                  className="rounded-xl h-12" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Tipo de Aplicação</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant={applicationType === "simple" ? "default" : "outline"}
                    onClick={() => setApplicationType("simple")}
                    className="rounded-xl h-12 font-bold"
                  >
                    Camada Simples
                  </Button>
                  <Button 
                    variant={applicationType === "double" ? "default" : "outline"}
                    onClick={() => setApplicationType("double")}
                    className="rounded-xl h-12 font-bold"
                  >
                    Camada Dupla
                  </Button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => goToCategory("Material de construção")}
              className="w-full bg-orange-50 p-6 rounded-[2rem] grid grid-cols-2 gap-4 hover:bg-orange-100 transition-all group text-left"
            >
              <div>
                <p className="text-[10px] font-black text-orange-400 uppercase">Total Estimado</p>
                <p className="text-2xl font-black text-slate-900">{totalMortarKg.toFixed(1)} kg</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-orange-600 uppercase">Sacos de 20kg</p>
                  <p className="text-2xl font-black text-orange-700">{bags20kg} sacos</p>
                </div>
                <ArrowRight className="h-6 w-6 text-orange-400 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Calculators;