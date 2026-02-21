"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle2 } from 'lucide-react';

interface NicknameDialogProps {
  open: boolean;
  onConfirm: (nickname: string) => void;
}

const NicknameDialog = ({ open, onConfirm }: NicknameDialogProps) => {
  const [nickname, setNickname] = useState("");

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[400px] rounded-[3rem] p-8 border-none shadow-2xl bg-white">
        <DialogHeader className="text-center">
          <div className="h-16 w-16 bg-purple-100 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
            <UserCircle2 className="h-8 w-8 text-purple-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">Como quer ser chamado?</DialogTitle>
          <DialogDescription className="font-medium">
            Escolha um apelido para entrar na sala. Sua identidade real será preservada.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Seu Apelido</Label>
            <Input 
              placeholder="Ex: Viajante_SP" 
              className="rounded-2xl h-12" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase">
            * Apelidos repetidos na mesma sala não são permitidos.
          </p>
        </div>
        <DialogFooter>
          <Button 
            disabled={!nickname}
            onClick={() => onConfirm(nickname)}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-100"
          >
            Entrar na Sala
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NicknameDialog;