"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import UserTable, { UserAccount } from '@/components/UserTable';
import AddUserDialog from '@/components/AddUserDialog';
import EditUserDialog from '@/components/EditUserDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, ShieldCheck, Users as UsersIcon, UserX } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const INITIAL_USERS: UserAccount[] = [
  { id: 'u1', name: 'Admin Sistema', email: 'admin@empresa.com', whatsapp: '(11) 99999-9999', role: 'Gestor', status: 'active', lastAccess: 'Hoje, 09:45' },
  { id: 'u2', name: 'João Silva', email: 'joao.silva@empresa.com', whatsapp: '(11) 98888-8888', role: 'Entregador', status: 'active', lastAccess: 'Ontem, 18:20' },
  { id: 'u3', name: 'Ricardo Vendas', email: 'ricardo.vendas@empresa.com', whatsapp: '(11) 97777-7777', role: 'Vendas', status: 'active', lastAccess: '24/05/2024' },
];

const UsersPage = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('app_users', JSON.stringify(INITIAL_USERS));
    }
  }, []);

  const saveUsers = (newUsers: UserAccount[]) => {
    setUsers(newUsers);
    localStorage.setItem('app_users', JSON.stringify(newUsers));
  };

  const handleToggleStatus = (id: string) => {
    const newUsers = users.map(user => {
      if (user.id === id) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        showSuccess(`Usuário ${user.name} ${newStatus === 'active' ? 'ativado' : 'bloqueado'} com sucesso.`);
        return { ...user, status: newStatus as 'active' | 'inactive' };
      }
      return user;
    });
    saveUsers(newUsers);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user && window.confirm(`Tem certeza que deseja excluir definitivamente o usuário ${user.name}?`)) {
      const newUsers = users.filter(u => u.id !== id);
      saveUsers(newUsers);
      showSuccess(`Usuário ${user.name} removido permanentemente.`);
    }
  };

  const handleAddUser = (userData: any) => {
    const userExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (userExists) {
      showError("Este e-mail já está em uso por outro usuário.");
      return;
    }

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      ...userData,
      status: 'active',
      lastAccess: 'Nunca'
    };
    const newUsers = [newUser, ...users];
    saveUsers(newUsers);
    setIsAddDialogOpen(false);
    showSuccess(`Usuário ${userData.name} provisionado com sucesso.`);
  };

  const handleEditClick = (user: UserAccount) => {
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedUser: UserAccount) => {
    const emailExists = users.some(u => u.id !== updatedUser.id && u.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (emailExists) {
      showError("Este e-mail já está sendo usado por outro usuário.");
      return;
    }

    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveUsers(newUsers);
    setIsEditDialogOpen(false);
    setUserToEdit(null);
    showSuccess(`Dados de ${updatedUser.name} atualizados.`);
  };

  // Lógica de busca aprimorada
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;

    // Remove caracteres não numéricos para busca de telefone
    const cleanSearch = search.replace(/\D/g, "");
    const cleanPhone = user.whatsapp.replace(/\D/g, "");

    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (cleanSearch !== "" && cleanPhone.includes(cleanSearch)) ||
      user.whatsapp.includes(search)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Gestão de Usuários</h2>
            <p className="text-slate-500">Controle de acessos e permissões do sistema</p>
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
              <UsersIcon className="h-6 w-6 text-indigo-600" />
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
              <p className="text-sm text-slate-500">Ativos</p>
              <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-rose-100 rounded-2xl flex items-center justify-center">
              <UserX className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bloqueados</p>
              <p className="text-2xl font-bold text-slate-900">{users.filter(u => u.status === 'inactive').length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome, email ou whatsapp..." 
              className="pl-10 rounded-xl border-slate-200 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <UserTable 
            users={filteredUsers} 
            onToggleStatus={handleToggleStatus} 
            onDelete={handleDeleteUser}
            onEdit={handleEditClick}
          />
        </div>
      </div>

      <AddUserDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onAdd={handleAddUser} 
      />

      <EditUserDialog 
        user={userToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveEdit}
      />
    </AppLayout>
  );
};

export default UsersPage;