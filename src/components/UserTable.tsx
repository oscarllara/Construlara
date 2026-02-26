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
import { 
  UserX, UserCheck, Mail, Trash2, Phone, 
  Pencil, MapPin, SearchX, CreditCard, 
  DollarSign, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { cn } from "@/lib/utils";

export type UserRole = 'Cliente' | 'Entregador' | 'Vendas' | 'Gestor';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  cpf?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastAccess: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  worksiteAddress?: string;
  debt?: number;
}

interface UserTableProps {
  users: UserAccount[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (user: UserAccount) => void;
  onOpenFinance: (user: UserAccount) => void;
}

const UserTable = ({ users, onToggleStatus, onDelete, onEdit, onOpenFinance }: UserTableProps) => {
  const getRoleBadge = (role: UserRole) => {
    const styles = {
      'Gestor': "bg-purple-100 text-purple-700 border-purple-200",
      'Vendas': "bg-blue-100 text-blue-700 border-blue-200",
      'Entregador': "bg-orange-100 text-orange-700 border-orange-200",
      'Cliente': "bg-slate-100 text-slate-700 border-slate-200"
    };
    return <Badge variant="outline" className={cn("rounded-lg font-bold text-[10px] uppercase px-2 py-0.5", styles[role])}>{role}</Badge>;
  };

  const calculateUserDebt = (user: UserAccount) => {
    try {
      const savedOrders = localStorage.getItem('app_orders');
      const savedRentals = localStorage.getItem('app_rentals');
      
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      const rentals = savedRentals ? JSON.parse(savedRentals) : [];

      const userEmail = (user.email || "").toLowerCase();
      const userName = (user.name || "").toLowerCase();

      // Filtra pedidos deste cliente específico
      const userOrders = orders.filter((o: any) => o && (o.userEmail || "").toLowerCase() === userEmail);
      
      // Filtra aluguéis deste cliente específico
      const userRentals = rentals.filter((r: any) => 
        r && (r.clientId === user.id || (r.clientEmail || "").toLowerCase() === userEmail || (r.client || "").toLowerCase() === userName)
      );

      const totalOrdersDebt = userOrders.reduce((acc: number, o: any) => {
        const remaining = (Number(o.total) || 0) - (Number(o.paidAmount) || 0);
        return acc + Math.max(0, remaining);
      }, 0);

      const totalRentalsDebt = userRentals.reduce((acc: number, r: any) => {
        const remaining = (Number(r.total) || 0) - (Number(r.paidAmount) || 0);
        return acc + Math.max(0, remaining);
      }, 0);

      return totalOrdersDebt + totalRentalsDebt;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="font-bold text-slate-900 py-6 pl-8">Usuário</TableHead>
            <TableHead className="font-bold text-slate-900">Financeiro / Débito</TableHead>
            <TableHead className="font-bold text-slate-900">Acesso & Contato</TableHead>
            <TableHead className="font-bold text-slate-900">Status</TableHead>
            <TableHead className="text-right pr-8 font-bold text-slate-900">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                  <SearchX className="h-12 w-12 opacity-20" />
                  <p className="font-bold">Nenhum usuário encontrado.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const debt = calculateUserDebt(user);
              return (
                <TableRow key={user.id} className={cn("hover:bg-slate-50/50 border-slate-50 transition-colors", user.status === 'inactive' && "opacity-60")}>
                  <TableCell className="py-5 pl-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900">{user.name}</span>
                      <div className="flex flex-col gap-0.5 mt-1">
                        {user.cpf && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <CreditCard className="h-2.5 w-2.5" /> CPF: {user.cpf}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div 
                      className="cursor-pointer group"
                      onClick={() => onOpenFinance(user)}
                    >
                      {debt > 0.01 ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-red-600 flex items-center gap-1 group-hover:underline">
                            <AlertCircle className="h-3 w-3" /> R$ {debt.toFixed(2)}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Em débito</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Em dia
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{user.email}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Phone className="h-2.5 w-2.5" /> {user.whatsapp}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={user.status === 'active'} 
                      onCheckedChange={() => onToggleStatus(user.id)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onOpenFinance(user)}
                        className="h-10 w-10 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                        title="Financeiro"
                      >
                        <DollarSign className="h-5 w-5" />
                      </Button>
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
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;