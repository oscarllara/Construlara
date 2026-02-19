"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';
import ProductCard, { Product } from '@/components/ProductCard';
import Calculators from '@/components/Calculators';
import AddProductDialog from '@/components/AddProductDialog';
import AddCategoryDialog from '@/components/AddCategoryDialog';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calculator as CalcIcon, Plus, PackagePlus, ArrowUpDown } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const DEFAULT_CATEGORIES = [
  "Pisos e revestimentos", "Louças e acabamentos", "Gabinetes, pias e tanques", 
  "Caixas d’água", "Mangueiras", "Material hidráulico", "Material elétrico", 
  "Parafusos e Pregos", "Ferramentas elétricas", "Ferramentas manuais", 
  "Tintas e Solventes", "Cimento e Ferragens", "Blocos e Tijolos", "Telhas", 
  "Diversos", "Utilidades para o lar", "Eletroportáteis", "Móveis e decorações", 
  "Jardinagem", "Rações pet", "Produtos pet"
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', code: 'PR-001', name: 'Porcelanato Polido 60x60', description: 'Piso de alta qualidade para áreas internas.', category: 'Pisos e revestimentos', price: 89.90, promoPrice: 74.90, isPromo: true, isFeatured: true, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80', isFractional: true, packageSize: 2.43, unitLabel: 'm²' },
  { id: 'p2', code: 'PR-002', name: 'Cimento CP-II 50kg', description: 'Cimento de alta resistência para obras em geral.', category: 'Cimento e Ferragens', price: 32.00, isPromo: false, isFeatured: false, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80' },
  { id: 'p3', code: 'PT-001', name: 'Ração Premium Cães 15kg', description: 'Nutrição completa para cães adultos.', category: 'Rações pet', price: 185.00, promoPrice: 159.00, isPromo: true, isFeatured: true, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&q=80' },
];

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [showCalculators, setShowCalculators] = useState(false);
  const [sortBy, setSortBy] = useState<'alpha' | 'popular'>('alpha');
  
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
      setShowCalculators(false);
    }

    try {
      const savedProducts = localStorage.getItem('app_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        setProducts(Array.isArray(parsed) ? parsed : INITIAL_PRODUCTS);
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('app_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } catch (e) {
      setProducts(INITIAL_PRODUCTS);
    }

    try {
      const savedCategories = localStorage.getItem('app_categories');
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        setCategories(Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES);
      } else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem('app_categories', JSON.stringify(DEFAULT_CATEGORIES));
      }
    } catch (e) {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [searchParams]);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('app_products', JSON.stringify(newProducts));
  };

  const saveCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    localStorage.setItem('app_categories', JSON.stringify(newCategories));
  };

  const handleSaveProduct = (data: any) => {
    if (data.id) {
      const newProducts = products.map(p => p.id === data.id ? data : p);
      saveProducts(newProducts);
      showSuccess("Produto atualizado!");
    } else {
      const newProduct = { ...data, id: `p-${Date.now()}` };
      saveProducts([newProduct, ...products]);
      showSuccess("Produto cadastrado!");
    }
    setIsAddProductOpen(false);
    setProductToEdit(null);
  };

  const handleAddCategory = (name: string) => {
    if (categories.includes(name)) {
      showSuccess("Esta categoria já existe.");
      return;
    }
    const newCategories = [...categories, name];
    saveCategories(newCategories);
    setIsAddCategoryOpen(false);
    showSuccess("Categoria adicionada!");
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsAddProductOpen(true);
  };

  const handleAddToCart = (product: Product, quantity: number, totalAmount?: number) => {
    const safeQuantity = isNaN(quantity) || quantity <= 0 ? 1 : quantity;
    const safeTotalAmount = isNaN(totalAmount || 0) || (totalAmount || 0) <= 0 ? safeQuantity : totalAmount;

    try {
      const cartData = localStorage.getItem('app_cart');
      let cart = [];
      
      if (cartData) {
        try {
          const parsed = JSON.parse(cartData);
          cart = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          cart = [];
        }
      }
      
      const existingIndex = cart.findIndex((item: any) => item.id === product.id);
      
      if (existingIndex > -1) {
        cart[existingIndex].quantity += safeQuantity;
        cart[existingIndex].totalAmount = (cart[existingIndex].totalAmount || 0) + (safeTotalAmount || safeQuantity);
      } else {
        cart.push({ 
          ...product, 
          quantity: safeQuantity, 
          totalAmount: safeTotalAmount || safeQuantity 
        });
      }
      
      localStorage.setItem('app_cart', JSON.stringify(cart));
      showSuccess(`${safeQuantity}x ${product.name} adicionado ao carrinho!`);
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      showError("Erro ao salvar no carrinho. Tente novamente.");
    }
  };

  // Lógica de popularidade baseada em pedidos reais
  const productPopularity = useMemo(() => {
    const savedOrders = localStorage.getItem('app_orders');
    const popularityMap: Record<string, number> = {};
    
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      orders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          popularityMap[item.id] = (popularityMap[item.id] || 0) + 1;
        });
      });
    }
    return popularityMap;
  }, [products]);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Todas" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === 'popular') {
        const popA = productPopularity[a.id] || 0;
        const popB = productPopularity[b.id] || 0;
        if (popA !== popB) return popB - popA;
      }
      // Fallback para alfabético
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [products, searchTerm, selectedCategory, sortBy, productPopularity]);

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
              variant="outline"
              onClick={() => setSortBy(sortBy === 'alpha' ? 'popular' : 'alpha')}
              className="rounded-2xl border-slate-200 font-bold gap-2 h-12 px-6 bg-white"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortBy === 'alpha' ? 'Ordem Alfabética' : 'Mais Vendidos'}
            </Button>
            <Button 
              onClick={() => setShowCalculators(!showCalculators)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold gap-2 h-12 px-6 shadow-lg shadow-blue-100"
            >
              <CalcIcon className="h-5 w-5" />
              Calculadoras
            </Button>
          </div>
        </div>

        {showCalculators && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <Calculators />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-72 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Categorias</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsAddCategoryOpen(true)}
                  className="h-8 w-8 rounded-xl hover:bg-blue-50 text-blue-600"
                  title="Nova Categoria"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <Button 
                onClick={() => {
                  setProductToEdit(null);
                  setIsAddProductOpen(true);
                }}
                className="w-full mb-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold gap-2 h-12 shadow-lg shadow-emerald-100"
              >
                <PackagePlus className="h-5 w-5" />
                Novo Produto
              </Button>

              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <button 
                  onClick={() => {
                    setSelectedCategory("Todas");
                    setSearchParams({});
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    selectedCategory === "Todas" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  Todas
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearchParams({ category: cat });
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all",
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
                  onEdit={handleEditProduct}
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

      <AddProductDialog 
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onSave={handleSaveProduct}
        product={productToEdit}
        categories={categories}
        defaultCategory={selectedCategory !== "Todas" ? selectedCategory : undefined}
      />

      <AddCategoryDialog 
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onAdd={handleAddCategory}
      />
    </AppLayout>
  );
};

export default ProductsPage;