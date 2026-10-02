import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { SectionTitle } from '../components/common/SectionTitle';
import { PRODUCTS, CATEGORIES, PRODUCT_COLORS } from '../data/products';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('cat') || 'todos';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category with URL query param if present
  React.useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'todos') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', catId);
    }
    setSearchParams(searchParams);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('todos');
    setSelectedSizes([]);
    setSelectedColors([]);
    setSortBy('featured');
    searchParams.delete('cat');
    setSearchParams(searchParams);
  };

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((prod) => {
      // Category filter
      if (selectedCategory !== 'todos' && prod.category !== selectedCategory) {
        return false;
      }
      // Size filter
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some((s) => prod.sizes.includes(s as any));
        if (!hasSize) return false;
      }
      // Color filter
      if (selectedColors.length > 0) {
        const hasColor = selectedColors.some((c) =>
          prod.colors.some((col) => col.name.toLowerCase().includes(c.toLowerCase()))
        );
        if (!hasColor) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default order
    });
  }, [selectedCategory, selectedSizes, selectedColors, sortBy]);

  const activeFiltersCount =
    (selectedCategory !== 'todos' ? 1 : 0) + selectedSizes.length + selectedColors.length;

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Title */}
      <SectionTitle
        overline="Catálogo Oficial"
        title="Colección Veelvet"
        subtitle="Explorá todas las prendas unisex diseñadas para un uso cotidiano prémium. Buzos, pantalones y conjuntos completos."
        align="center"
      />

      {/* Filter and Controls Bar */}
      <div className="bg-beige-100/90 rounded-2xl p-4 sm:p-5 border border-beige-300 mb-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-xs font-montserrat font-bold uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white text-navy hover:bg-beige-200 border border-beige-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right Controls: Sort & Mobile Filter Toggle */}
          <div className="flex items-center justify-between sm:justify-end space-x-3">
            {/* Sort Selector */}
            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-beige-300 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-navy/70" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-navy font-bold uppercase tracking-wide focus:outline-none cursor-pointer"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="rating">Mejor Calificados</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden inline-flex items-center space-x-1.5 bg-white text-navy px-3.5 py-2 rounded-xl border border-beige-300 text-xs font-bold uppercase"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros ({activeFiltersCount})</span>
            </button>
          </div>
        </div>

        {/* Detailed Desktop Filters (Size & Color) */}
        <div className={`mt-4 pt-4 border-t border-beige-200/80 ${isMobileFilterOpen ? 'block' : 'hidden lg:flex'} flex-col lg:flex-row lg:items-center justify-between gap-4`}>
          <div className="flex flex-wrap items-center gap-6">
            {/* Size filters */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy/70">
                Talle:
              </span>
              <div className="flex space-x-1.5">
                {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`w-7 h-7 text-xs font-bold rounded-md flex items-center justify-center transition-colors ${
                      selectedSizes.includes(size)
                        ? 'bg-navy text-white'
                        : 'bg-white text-navy border border-beige-300 hover:bg-beige-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color filters */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy/70">
                Color:
              </span>
              <div className="flex space-x-2">
                {[
                  { name: 'Negro', hex: '#161616' },
                  { name: 'Gris', hex: '#9B9B9B' },
                  { name: 'Beige', hex: '#E2DAC8' },
                  { name: 'Chocolate', hex: '#3B291D' },
                ].map((color) => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`group relative flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-white border-navy text-navy font-bold shadow-xs'
                          : 'bg-white border-beige-300 text-navy/80 hover:bg-beige-50'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filter Clear */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-navy/60 hover:text-navy underline flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar filtros ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Count */}
      <div className="flex items-center justify-between text-xs text-navy/60 uppercase font-semibold tracking-wider mb-6 px-1">
        <span>Mostrando {filteredProducts.length} productos</span>
        <span>Moldería Unisex • Calce Boxy</span>
      </div>

      {/* Product Grid */}
      <AnimatePresence mode="popLayout">
        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="bg-beige-100 rounded-2xl p-12 text-center border border-beige-300 my-8">
            <Filter className="w-10 h-10 text-navy/40 mx-auto mb-3" />
            <p className="font-montserrat font-bold text-lg text-navy uppercase">
              No encontramos productos con esos filtros
            </p>
            <p className="text-xs text-navy/70 mt-1 max-w-sm mx-auto font-light">
              Intentá seleccionar otros talles o colores, o hacé clic en limpiar filtros para ver todo.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 text-xs font-bold uppercase tracking-wider bg-navy text-white px-5 py-2.5 rounded-lg hover:bg-navy-500 transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
