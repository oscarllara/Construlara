"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import UserTable, { UserAccount } from '@/components/UserTable';
import AddUserDialog from '@/components/AddUserDialog';
import EditUserDialog from '@/components/EditUserDialog';
import UserFinancialDialog from '@/components/UserFinancialDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, ShieldCheck, Users as UsersIcon, UserX, X, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const INITIAL_USERS: UserAccount[] = [
  { id: 'u1', name: 'Admin Sistema', email: 'admin@empresa.com', whatsapp: '(11) 99999-9999', cpf: '000.000.000-01', role: 'Gestor', status: 'active', lastAccess: 'Hoje, 09:45' },
  { id: 'u2', name: 'João Silva', email: 'joao.silva@empresa.com', whatsapp: '(11) 98888-8888', cpf: '000.000.000-02', role: 'Entregador', status: 'active', lastAccess: 'Ontem, 18:20' },
  { id: 'u3', name: 'Ricardo Vendas', email: 'ricardo.vendas@empresa.com', whatsapp: '(11) 97777-7777', cpf: '000.000.000-03', role: 'Vendas', status: 'active', lastAccess: '24/05/2024' },
];

const UsersPage = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'debt' | 'clean'>('all');
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

  const usersWithDebtInfo = useMemo(() => {
    const savedOrders = localStorage.getItem('app_orders');
    const savedRentals = localStorage.getItem('app_rentals');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    const rentals = savedRentals ? JSON.parse(savedRentals) : [];

    return users.map(user => {
      const email = (user.email || "").toLowerCase();
      const name = (user.name || "").toLowerCase();

      const pOrders = orders.filter((o: any) => 
        o && (o.userEmail || "").toLowerCase() === email && 
        o.status !== 'Entregue' && o.status !== 'Pago'
      );
      
      const pRentals = rentals.filter((r: any) => 
        r && (r.clientId === user.id || (r.client || "").toLowerCase() === name) && 
        r.status !== 'completed'
      );

      const debtTotal = pOrders.reduce((acc: number, o: any) => acc + ((Number(o.total) || 0) - (Number(o.paidAmount) || 0)), 0) +
                        pRentals.reduce((acc: number, r: any) => acc + ((Number(r.total) || 0) - (Number(r.paidAmount) || 0)), 0);

      return { ...user, debtTotal };
    });
  }, [users]);

  const stats = useMemo(() => {
    const total = users.length;
    const withDebt = usersWithDebtInfo.filter(u => u.debtTotal > 0.01).length;
    const clean = total - withDebt;
    return { total, withDebt, clean };
  }, [usersWithDebtInfo]);

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

  const handleMarkAsPaid = (type: 'order' | 'rental', id: string, amountToPay?: number) => {
    if (type === 'order') {
      const savedOrders = localStorage.getItem('app_orders');
      if (savedOrders) {
        const orders = JSON.parse(savedOrders);
        const updated = orders.map((o: any) => {
          if (o.id === id) {
            const currentPaid = Number(o.paidAmount || 0);
            const total = Number(o.total || 0);
            const nextPaid = amountToPay !== undefined ? currentPaid + amountToPay : total;
            
            return { 
              ...o, 
              paidAmount: nextPaid,
              status: nextPaid >= total - 0.01 ? 'Pago' : o.status 
            };
          }
          return o;
        });
        localStorage.setItem('app_orders', JSON.stringify(updated));
      }
    } else {
      const savedRentals = localStorage.getItem('app_rentals');
      if (savedRentals) {
        const rentals = JSON.parse(savedRentals);
        const updated = rentals.map((r: any) => {
          if (r.id === id) {
            const currentPaid = Number(r.paidAmount || 0);
            const total = Number(r.total || 0);
            const nextPaid = amountToPay !== undefined ? currentPaid + amountToPay : total;
            
            return { 
              ...r, 
              paidAmount: nextPaid,
              status: nextPaid >= total - 0.01 ? 'completed' : r.status 
            };
          }
          return r;
        });
        localStorage.setItem('app_rentals', JSON.stringify(updated));
      }
    }
    
    setUsers([...users]); 
    showSuccess(amountToPay ? "Amortização registrada!" : "Recebimento total efetuado!");
    window.dispatchEvent(new Event('order-placed'));
  };

  const filteredUsers = useMemo(() => {
    return usersWithDebtInfo.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === 'debt') return matchesSearch && user.debtTotal > 0.01;
      if (filterType === 'clean') return matchesSearch && user.debtTotal <= 0.01;
      return matchesSearch;
    });
  }, [usersWithDebtInfo, searchTerm, filterType]);

  // Exportar para CSV
  const exportCSV = () => {
    const headers = ["Nome", "Email", "WhatsApp", "CPF", "Nível", "Status", "Dívida Total"];
    const rows = filteredUsers.map(u => [
      u.name, 
      u.email, 
      u.whatsapp, 
      u.cpf || "-", 
      u.role, 
      u.status === 'active' ? 'Ativo' : 'Bloqueado',
      u.debtTotal.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "usuarios_construlara.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Exportação CSV concluída!");
  };

  // Exportar para PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Usuários - Construlara", 14, 15);
    
    const tableData = filteredUsers.map(u => [
      u.name,
      u.cpf || "-",
      u.role,
      u.status === 'active' ? 'Ativo' : 'Bloqueado',
      `R$ ${u.debtTotal.toFixed(2)}`
    ]);

    (doc as any).autoTable({
      head: [['Nome', 'CPF', 'Nível', 'Status', 'Débito']],
      body: tableData,
      startY: 20,
    });

    doc.save("usuarios_construlara.pdf");
    showSuccess("Relatório PDF gerado!");
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Gestão de Usuários</h2>
            <p className="text-slate-500 font-medium">Controle de acessos e situação financeira de clientes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={exportCSV} className="rounded-2xl border-slate-200 font-bold gap-2 h-12 bg-white">
              <FileSpreadsheet className="h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" onClick={exportPDF} className="rounded-2xl border-slate-200 font-bold gap-2 h-12 bg-white">
              <FileText className="h-4 w-4" /> PDF
            </Button>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold gap-2 h-12 px-6 shadow-lg shadow-indigo-100 ml-2"
            >
              <UserPlus className="h-5 w-5" />
              Novo Usuário
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <button 
            onClick={() => setFilterType('all')}
            className={cn(
              "text-left p-6 rounded-[2.5rem] border transition-all flex items-center gap-4 group",
              filterType === 'all' ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100" : "bg-white border-slate-100 hover:border-indigo-200 shadow-sm"
            )}
          >
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors", filterType === 'all' ? "bg-white/20" : "bg-indigo-100")}>
              <UsersIcon className={cn("h-6 w-6", filterType === 'all' ? "text-white" : "text-indigo-600")} />
            </div>
            <div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", filterType === 'all' ? "text-indigo-200" : "text-slate-400")}>Total Usuários</p>
              <p className={cn("text-2xl font-black", filterType === 'all' ? "text-white" : "text-slate-900")}>{stats.total}</p>
            </div>
          </button>

          <button 
            onClick={() => setFilterType('clean')}
            className={cn(
              "text-left p-6 rounded-[2.5rem] border transition-all flex items-center gap-4 group",
              filterType === 'clean' ? "bg-emerald-600 border-emerald-600 shadow-xl shadow-emerald-100" : "bg-white border-slate-100 hover:border-emerald-200 shadow-sm"
            )}
          >
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors", filterType === 'clean' ? "bg-white/20" : "bg-emerald-100")}>
              <ShieldCheck className={cn("h-6 w-6", filterType === 'clean' ? "text-white" : "text-emerald-600")} />
            </div>
            <div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", filterType === 'clean' ? "text-emerald-200" : "text-slate-400")}>Em Dia</p>
              <p className={cn("text-2xl font-black", filterType === 'clean' ? "text-white" : "text-slate-900")}>{stats.clean}</p>
            </div>
          </button>

          <button 
            onClick={() => setFilterType('debt')}
            className={cn(
              "text-left p-6 rounded-[2.5rem] border transition-all flex items-center gap-4 group",
              filterType === 'debt' ? "bg-rose-600 border-rose-600 shadow-xl shadow-rose-100" : "bg-white border-slate-100 hover:border-rose-200 shadow-sm"
            )}
          >
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors", filterType === 'debt' ? "bg-white/20" : "bg-rose-100")}>
              <UserX className={cn("h-6 w-6", filterType === 'debt' ? "text-white" : "text-rose-600")} />
            </div>
            <div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", filterType === 'debt' ? "text-rose-200" : "text-slate-400")}>Com Débito</p>
              <p className={cn("text-2xl font-black", filterType === 'debt' ? "text-white" : "text-slate-900")}>{stats.withDebt}</p>
            </div>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar usuário..." 
                className="pl-12 rounded-2xl border-slate-200 h-12 shadow-sm focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {filterType !== 'all' && (
              <Button 
                variant="ghost" 
                onClick={() => setFilterType('all')}
                className="rounded-xl font-bold text-slate-400 hover:text-rose-600 gap-2"
              >
                <X className="h-4 w-4" /> Limpar Filtro
              </Button>
            )}
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