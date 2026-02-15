"use client";

import React, { useState, useEffect } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Hammer, MapPin, Phone, Mail, FileText, AlertCircle, CheckCircle2, Wrench, Hash, Tag } from 'lucide-react';
import { UserAccount } from './UserTable';
import { Equipment } from './EquipmentCard';
import { cn } from '@/lib/utils';

interface RentalDetailsDialogProps {
  rental: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedRental: any) => void;
}

const RentalDetailsDialog = ({ rental, open, onOpenChange, onUpdate }: RentalDetailsDialogProps) => {
  const [client, setClient] = useState<UserAccount | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (rental) {
      setStatus(rental.status);
      setNotes(rental.notes || "");
      
      const savedUsers = localStorage.getItem('app_users');
      if (savedUsers) {
        const allUsers = JSON.parse(savedUsers);
        const found = allUsers.find((u: any) => u.name === rental.client || u.id === rental.clientId);
        setClient(found || null);
      }

      const savedEquip = localStorage.getItem('app_equipments');
      if (savedEquip) {
        const allEquip = JSON.parse(savedEquip);
        const found = allEquip.find((e: any) => e.name === rental.item || e.id === rental.equipmentId);
        setEquipment(found || null);
      }
    }
  }, [rental, open]);

  const handleSave = () => {
    onUpdate({ ...rental, status, notes });
  };

  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter">CONTRATO DE LOCAÇÃO</h2>
                <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Nº {rental.id.toUpperCase()}</p>
              </div>
            </div>
            <Badge className={cn(
              "rounded-xl border-none font-bold px-4 py-2 text-sm",
              status === 'active' ? "bg-blue-500 text-white" :
              status === 'overdue' ? "bg-red-500 text-white" :
              status === 'completed' ? "bg-emerald-500 text-white" :
              "bg-orange-500 text-white"
            )}>
              {status === 'active' ? 'Em Aberto' : 
               status === 'overdue' ? 'Atrasado' : 
               status === 'completed' ? 'Devolvido' : 'Em Reparo'}
            </Badge>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8 max-h-[65vh] overflow-y-auto bg-white">
          <div className="space-y-8">
            {/* Dados do Cliente */}
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="h-4 w-4" /> Locatário (Cliente)
              </h3>
              {client ? (
                <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-4 border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Nome Completo</p>
                    <p className="font-black text-slate-900 text-lg">{client.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">WhatsApp</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-blue-500" /> {client.whatsapp}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Email</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-blue-500" /> {client.email}
                      </p>
                    </div>
                  </div>
                  {client.worksiteAddress && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Endereço da Obra (Entrega)</p>
                      <p className="text-sm text-slate-700 leading-tight flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> {client.worksiteAddress}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-700 text-sm font-bold">
                  Dados do cliente não vinculados.
                </div>
              )}
            </section>

            {/* Dados do Equipamento */}
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Hammer className="h-4 w-4" /> Objeto da Locação
              </h3>
              <div className="bg-blue-50/50 p-6 rounded-[2.5rem] space-y-4 border border-blue-100">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase mb-0.5">Equipamento</p>
                  <p className="font-black text-slate-900 text-lg">{rental.item}</p>
                </div>
                {equipment && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase mb-0.5">Patrimônio</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-blue-400" /> {equipment.serialNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase mb-0.5">Categoria</p>
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-blue-400" /> {equipment.category}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            {/* Detalhes Financeiros e Prazos */}
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Condições e Prazos
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Data Início</p>
                  <p className="font-black text-slate-900">{rental.start}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Previsão Devolução</p>
                  <p className="font-black text-slate-900">{rental.end}</p>
                </div>
              </div>
              <div className="bg-emerald-600 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-lg shadow-emerald-100">
                <div>
                  <p className="text-[10px] font-bold text-emerald-200 uppercase">Valor Total do Contrato</p>
                  <p className="text-2xl font-black">R$ {rental.total?.toFixed(2)}</p>
                </div>
                <Badge className="bg-emerald-500 text-white border-none font-bold uppercase text-[10px]">{rental.modality}</Badge>
              </div>
            </section>

            {/* Gestão do Contrato */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 text-sm">Alterar Status do Contrato</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="active">
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Em Aberto</div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Devolvido</div>
                    </SelectItem>
                    <SelectItem value="maintenance">
                      <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-orange-500" /> Enviado para Reparo</div>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-500" /> Atrasado</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700 text-sm">Observações e Ocorrências</Label>
                <Textarea 
                  placeholder="Registre aqui avarias, atrasos ou detalhes importantes da locação..." 
                  className="rounded-2xl min-h-[120px] border-slate-200 bg-white"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </section>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">
            Fechar
          </Button>
          <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-blue-100">
            Atualizar Contrato
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalDetailsDialog;