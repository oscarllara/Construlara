import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Equipments from "./pages/Equipments";
import Rentals from "./pages/Rentals";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChangePassword from "./pages/ChangePassword";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole') || '';

  if (!isLoggedIn) return <Navigate to="/loja" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/loja" replace />;

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/loja" element={<Products />} />
          <Route path="/equipamentos" element={<Equipments />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />

          {/* Rotas Privadas (Página Inicial é o Dashboard) */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute allowedRoles={['Gestor']}><Users /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute allowedRoles={['Gestor', 'Vendas']}><Reports /></ProtectedRoute>} />
          <Route path="/alugueis" element={<ProtectedRoute><Rentals /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/carrinho" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/trocar-senha" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;