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
import { User, Hammer, MapPin, Phone, Mail, FileText, AlertCircle, CheckCircle2, Wrench } from 'lucide-react';
import { UserAccount } from './UserTable';

interface RentalDetailsDialogProps {
  rental: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedRental: any) => void;
}

const RentalDetailsDialog = ({ rental, open, onOpenChange, onUpdate }: RentalDetailsDialogProps) => {
  const [client, setClient] = useState<UserAccount | null>(null);
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
    }
  }, [rental, open]);

  const handleSave = () => {
    onUpdate({ ...rental, status, notes });
  };

  if (!rental) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Contrato #{rental.id}</span>
              </div>
              <h2 className="text-3xl font-black">{rental.item}</h2>
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

        <div className="p-8 grid md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="h-4 w-4" /> Dados do Cliente
              </h3>
              {client ? (
                <div className="bg-slate-50 p-5 rounded-[2rem] space-y-3 border border-slate-100">
                  <p className="font-black text-slate-900 text-lg">{client.name}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {client.whatsapp}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> {client.email}
                    </p>
                    {client.worksiteAddress && (
                      <div className="pt-2 border-t border-slate-200 mt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Endereço da Obra</p>
                        <p className="text-sm text-slate-700 leading-tight flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" /> {client.worksiteAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-700 text-sm font-bold">
                  Cliente não encontrado no cadastro.
                </div>
              )}
            </section>

            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Hammer className="h-4 w-4" /> Detalhes da Locação
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Início</p>
                  <p className="font-black text-blue-700">{rental.start}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Previsão</p>
                  <p className="font-black text-slate-700">{rental.end}</p>
                </div>
              </div>
              <div className="mt-4 bg-emerald-50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-700">Valor Total</span>
                <span className="text-xl font-black text-emerald-700">R$ {rental.total?.toFixed(2)}</span>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-4">Ações do Contrato</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Alterar Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="rounded-2xl h-12 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="active">
                        <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-blue-500" /> Em Aberto</div>
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
                  <Label className="font-bold text-slate-700">Observações / Ocorrências</Label>
                  <Textarea 
                    placeholder="Descreva avarias, atrasos ou detalhes da devolução..." 
                    className="rounded-2xl min-h-[150px] border-slate-200"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl font-bold h-12 px-6">
            Fechar
          </Button>
          <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-bold px-8 h-12 shadow-xl shadow-blue-100">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalDetailsDialog;