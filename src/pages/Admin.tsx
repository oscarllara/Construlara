"use client";

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import UserTable, { UserAccount, UserRole } from '@/components/UserTable';
import AddUserDialog from '@/components/AddUserDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, ShieldCheck, Users } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const INITIAL_USERS: UserAccount[] = [
  { id: 'u1', name: 'Admin Sistema', email: 'admin@empresa.com', role: 'Gestor', status: 'active', lastAccess: 'Hoje, 09:45' },
  { id: 'u2', name: 'Porteiro João', email: 'joao.portaria@empresa.com', role: 'Operador de Chaves', status: 'active', lastAccess: 'Ontem, 18:20' },
  { id: 'u3', name: 'Ricardo Frota', email: 'ricardo.frota@empresa.com', role: 'Operador de Carros', status: 'active', lastAccess: '24/05/2024' },
  { id: 'u4', name: 'Ex-Funcionário', email: 'antigo@empresa.com', role: 'Visitante', status: 'inactive', lastAccess: '15/03/2024' },
];

const AdminPage = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id === id) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        showSuccess(`Usuário ${user.name} ${newStatus === 'active' ? 'ativado' : 'bloqueado'} com sucesso.`);
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const handleAddUser = (userData: any) => {
    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      ...userData,
      status: 'active',
      lastAccess: 'Nunca'
    };
    setUsers(prev => [newUser, ...prev]);
    setIsAddDialogOpen(false);
    showSuccess(`Usuário ${userData.name} provisionado com sucesso.`);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Gestão de Acesso</h2>
            <p className="text-slate-500">Controle de usuários, permissões e auditoria de segurança</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total de Usuários</p>
              <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ativos no Sistema</p>
              <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-rose-100 rounded-2xl flex items-center justify-center">
              <UserX className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Acessos Bloqueados</p>
              <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.status === 'inactive').length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome ou email..." 
              className="pl-10 rounded-xl border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <UserTable users={filteredUsers} onToggleStatus={handleToggleStatus} />
        </div>
      </div>

      <AddUserDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onAdd={handleAddUser} 
      />
    </AppLayout>
  );
};

export default AdminPage;