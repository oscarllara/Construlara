"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import ProductCard, { Product } from '@/components/ProductCard';
import Calculators from '@/components/Calculators';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, ShoppingCart, Calculator as CalcIcon } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  "Pisos e revestimentos", "Louças e acabamentos", "Gabinetes, pias e tanques", 
  "Caixas d’água", "Mangueiras", "Material hidráulico", "Material elétrico", 
  "Parafusos e Pregos", "Ferramentas elétricas", "Ferramentas manuais", 
  "Tintas e Solventes", "Cimento e Ferragens", "Blocos e Tijolos", "Telhas", 
  "Diversos", "Utilidades para o lar", "Eletroportáteis", "Móveis e decorações", 
  "Jardinagem", "Rações pet", "Produtos pet"
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', code: 'PR-001', name: 'Porcelanato Polido 60x60', description: 'Piso de alta qualidade para áreas internas.', category: 'Pisos e revestimentos', price: 89.90, promoPrice: 74.90, isPromo: true, isFeatured: true, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80' },
  { id: 'p2', code: 'PR-002', name: 'Cimento CP-II 50kg', description: 'Cimento de alta resistência para obras em geral.', category: 'Cimento e Ferragens', price: 32.00, isPromo: false, isFeatured: false, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80' },
  { id: 'p3', code: 'PT-001', name: 'Ração Premium Cães 15kg', description: 'Nutrição completa para cães adultos.', category: 'Rações pet', price: 185.00, promoPrice: 159.00, isPromo: true, isFeatured: true, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&q=80' },
];

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [showCalculators, setShowCalculators] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('app_products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('app_products', JSON.stringify(INITIAL_PRODUCTS));
    }
  }, []);

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem('app_cart') || '[]');
    const existing = cart.find((item: any) => item.id === product.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('app_cart', JSON.stringify(cart));
    showSuccess(`${product.name} adicionado ao carrinho!`);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Loja Construlara</h2>
            <p className="text-slate-500 font-medium">Materiais de construção e linha pet completa</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowCalculators(!showCalculators)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 h-12 px-6 shadow-lg shadow-blue-100"
            >
              <CalcIcon className="h-5 w-5" />
              Calculadoras
            </Button>
            <Button 
              onClick={() => navigate('/carrinho')}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold gap-2 h-12 px-6 shadow-lg shadow-slate-200"
            >
              <ShoppingCart className="h-5 w-5" />
              Ver Carrinho
            </Button>
          </div>
        </div>

        {showCalculators && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Calculators />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Categorias</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedCategory("Todas")}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all",
                    selectedCategory === "Todas" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  Todas
                </button>
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      selectedCategory === cat ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Buscar por nome ou código do produto..." 
                className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-slate-500 font-bold">Nenhum produto encontrado nesta categoria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductsPage;