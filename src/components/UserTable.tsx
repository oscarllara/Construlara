"use client";

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { UserX, UserCheck, Mail, Trash2, Phone, Pencil, MapPin, SearchX } from 'lucide-react';
import { cn } from "@/lib/utils";

export type UserRole = 'Cliente' | 'Entregador' | 'Vendas' | 'Gestor';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastAccess: string;
  address?: string;
  worksiteAddress?: string;
}

interface UserTableProps {
  users: UserAccount[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (user: UserAccount) => void;
}

const UserTable = ({ users, onToggleStatus, onDelete, onEdit }: UserTableProps) => {
  const getRoleBadge = (role: UserRole) => {
    const styles = {
      'Gestor': "bg-purple-100 text-purple-700 border-purple-200",
      'Vendas': "bg-blue-100 text-blue-700 border-blue-200",
      'Entregador': "bg-orange-100 text-orange-700 border-orange-200",
      'Cliente': "bg-slate-100 text-slate-700 border-slate-200"
    };
    return <Badge variant="outline" className={cn("rounded-lg font-bold text-[10px] uppercase px-2 py-0.5", styles[role])}>{role}</Badge>;
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="font-bold text-slate-900 py-6 pl-8">Usuário</TableHead>
            <TableHead className="font-bold text-slate-900">Acesso & Contato</TableHead>
            <TableHead className="font-bold text-slate-900">Status</TableHead>
            <TableHead className="font-bold text-slate-900">Último Acesso</TableHead>
            <TableHead className="text-right pr-8 font-bold text-slate-900">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                  <SearchX className="h-12 w-12 opacity-20" />
                  <p className="font-bold">Nenhum usuário encontrado com este termo.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className={cn("hover:bg-slate-50/50 border-slate-50 transition-colors", user.status === 'inactive' && "opacity-60")}>
                <TableCell className="py-5 pl-8">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900">{user.name}</span>
                    {user.role === 'Cliente' && user.worksiteAddress && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-2.5 w-2.5" /> Obra: {user.worksiteAddress.substring(0, 30)}...
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {getRoleBadge(user.role)}
                      <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {user.email}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 pl-1">
                      <Phone className="h-3 w-3" /> {user.whatsapp}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.status === 'active' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none gap-1 rounded-xl font-bold px-3 py-1">
                        <UserCheck className="h-3 w-3" /> Ativo
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none gap-1 rounded-xl font-bold px-3 py-1">
                        <UserX className="h-3 w-3" /> Bloqueado
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 font-bold text-sm">{user.lastAccess}</TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex items-center gap-2 mr-2">
                      <Switch 
                        checked={user.status === 'active'} 
                        onCheckedChange={() => onToggleStatus(user.id)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(user)}
                      className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDelete(user.id)}
                      className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;