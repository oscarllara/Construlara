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
import { Shield, UserX, UserCheck, Mail } from 'lucide-react';
import { cn } from "@/lib/utils";

export type UserRole = 'Gestor' | 'Operador de Chaves' | 'Operador de Carros' | 'Visitante';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastAccess: string;
}

interface UserTableProps {
  users: UserAccount[];
  onToggleStatus: (id: string) => void;
}

const UserTable = ({ users, onToggleStatus }: UserTableProps) => {
  const getRoleBadge = (role: UserRole) => {
    const styles = {
      'Gestor': "bg-purple-100 text-purple-700 border-purple-200",
      'Operador de Chaves': "bg-amber-100 text-amber-700 border-amber-200",
      'Operador de Carros': "bg-blue-100 text-blue-700 border-blue-200",
      'Visitante': "bg-slate-100 text-slate-700 border-slate-200"
    };
    return <Badge variant="outline" className={cn("rounded-lg font-medium", styles[role])}>{role}</Badge>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Permissão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último Acesso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={cn(user.status === 'inactive' && "opacity-60")}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900">{user.name}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {user.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.status === 'active' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none gap-1">
                      <UserCheck className="h-3 w-3" /> Ativo
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none gap-1">
                      <UserX className="h-3 w-3" /> Bloqueado
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-slate-500 text-sm">{user.lastAccess}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-xs font-medium text-slate-400">
                    {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                  </span>
                  <Switch 
                    checked={user.status === 'active'} 
                    onCheckedChange={() => onToggleStatus(user.id)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;