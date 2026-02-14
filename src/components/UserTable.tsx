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
import { UserX, UserCheck, Mail, Trash2, Phone } from 'lucide-react';
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
}

interface UserTableProps {
  users: UserAccount[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const UserTable = ({ users, onToggleStatus, onDelete }: UserTableProps) => {
  const getRoleBadge = (role: UserRole) => {
    const styles = {
      'Gestor': "bg-purple-100 text-purple-700 border-purple-200",
      'Vendas': "bg-blue-100 text-blue-700 border-blue-200",
      'Entregador': "bg-orange-100 text-orange-700 border-orange-200",
      'Cliente': "bg-slate-100 text-slate-700 border-slate-200"
    };
    return <Badge variant="outline" className={cn("rounded-lg font-medium", styles[role])}>{role}</Badge>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Nível de Acesso</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último Acesso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={cn(user.status === 'inactive' && "opacity-60")}>
              <TableCell>
                <span className="font-semibold text-slate-900">{user.name}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {user.email}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {user.whatsapp}
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
                <div className="flex items-center justify-end gap-4">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={user.status === 'active'} 
                      onCheckedChange={() => onToggleStatus(user.id)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(user.id)}
                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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