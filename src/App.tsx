import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./pages/Products";
import Equipments from "./pages/Equipments";
import Rentals from "./pages/Rentals";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          {/* Rotas Principais Construlara */}
          <Route path="/" element={<Products />} />
          <Route path="/loja" element={<Products />} />
          <Route path="/equipamentos" element={<Equipments />} />
          <Route path="/alugueis" element={<Rentals />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/perfil" element={<Profile />} />
          
          {/* Institucional e Segurança */}
          <Route path="/contato" element={<Contact />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/alterar-senha" element={<ChangePassword />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;