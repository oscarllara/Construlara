"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import UserTable, { UserAccount } from '@/components/UserTable';
import AddUserDialog from '@/components/AddUserDialog';
import EditUserDialog from '@/components/EditUserDialog';
import UserFinancialDialog from '@/components/UserFinancialDialog';
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
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem('app_users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        setUsers(INITIAL_USERS);
      }
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
    if (user && window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      const newUsers = users.filter(u => u.id !== id);
      saveUsers(newUsers);
      showSuccess(`Usuário ${user.name} removido.`);
    }
  };

  const handleAddUser = (userData: any) => {
    const userExists = users.some(u => u.email?.toLowerCase() === userData.email?.toLowerCase());
    if (userExists) {
      showError("Este e-mail já está em uso.");
      return;
    }

    const newUser: UserAccount = {
      id: `u-${Date.now()}`,
      ...userData,
      status: 'active',
      lastAccess: 'Nunca'
    };
    saveUsers([newUser, ...users]);
    setIsAddDialogOpen(false);
    showSuccess(`Usuário ${userData.name} criado.`);
  };

  const handleEditClick = (user: UserAccount) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (updatedUser: UserAccount) => {
    const newUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    saveUsers(newUsers);
    setIsEditDialogOpen(false);
    showSuccess(`Dados de ${updatedUser.name} atualizados.`);
  };

  const handleOpenFinance = (user: UserAccount) => {
    setSelectedUser(user);
    setIsFinanceOpen(true);
  };

  const handleMarkAsPaid = (type: 'order' | 'rental', id: string) => {
    if (type === 'order') {
      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const newOrders = orders.map((o: any) => o.id === id ? { ...o, status: 'Pago' } : o);
        localStorage.setItem('app_orders', JSON.stringify(newOrders));
      }
    } else {
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals) {
        const rentals = JSON.parse(savedRentals);
        const newRentals = rentals.map((r: any) => {
          if (r.id === id) {
            // Se o item ainda está alugado (active/overdue), ao pagar ele marca como concluído
            // mas o equipamento deve ser liberado separadamente na devolução ou aqui?
            // Para finanças, apenas marcamos como completed para indicar que o ciclo financeiro fechou.
            return { ...r, status: 'completed' };
          }
          return r;
        });
        localStorage.setItem('app_rentals', JSON.stringify(newRentals));
      }
    }
    
    // Forçar atualização da UI
    setSelectedUser(prev => prev ? { ...prev } : null);
    showSuccess("Recebimento registrado com sucesso!");
    window.dispatchEvent(new Event('order-placed')); // Atualiza dashboards e relatórios
  };

  const filteredUsers = (users || []).filter(user => {
    const search = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Gestão de Usuários</h2>
            <p className="text-slate-500 font-medium">Controle de acessos e situação financeira de clientes</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold gap-2 h-12 px-6"
          >
            <UserPlus className="h-5 w-5" />
            Novo Usuário
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Usuários</p>
              <p className="text-2xl font-black text-slate-900">{users.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Em Dia</p>
              <p className="text-2xl font-black text-slate-900">32</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-rose-100 rounded-2xl flex items-center justify-center">
              <UserX className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Com Débito</p>
              <p className="text-2xl font-black text-slate-900">08</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar usuário..." 
              className="pl-12 rounded-2xl border-slate-200 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <UserTable 
            users={filteredUsers} 
            onToggleStatus={handleToggleStatus} 
            onDelete={handleDeleteUser}
            onEdit={handleEditClick}
            onOpenFinance={handleOpenFinance}
          />
        </div>
      </div>

      <AddUserDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onAdd={handleAddUser} 
      />

      <EditUserDialog 
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveEdit}
      />

      <UserFinancialDialog 
        user={selectedUser}
        open={isFinanceOpen}
        onOpenChange={setIsFinanceOpen}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </AppLayout>
  );
};

export default UsersPage;