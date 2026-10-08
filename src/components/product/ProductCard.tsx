import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../data/products';
import { useCartStore } from '../../store/cartStore';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(
    product.selectedColorVariant
      ? product.colors.find((c) => c.name === product.selectedColorVariant) || product.colors[0]
      : product.colors[0]
  );
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();

  // Sync if product changes
  React.useEffect(() => {
    if (product.selectedColorVariant) {
      const match = product.colors.find((c) => c.name === product.selectedColorVariant);
      if (match) setSelectedColor(match);
    } else if (product.colors?.[0]) {
      setSelectedColor(product.colors[0]);
    }
    if (product.sizes?.[0]) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, selectedSize as any, selectedColor.name, selectedColor.hex, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedComparePrice = product.compareAtPrice
    ? new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
      }).format(product.compareAtPrice)
    : null;

  return (
    <div
      className="group relative flex flex-col bg-[#FAF7F0] rounded-xl overflow-hidden border border-beige-300 hover:border-beige-400 hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link to={`/producto/${product.slug}`} className="relative aspect-[3/4] w-full bg-beige-100 overflow-hidden block">
        {/* Primary Image */}
        <motion.img
          src={product.images.primary}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered && product.images.secondary ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          transition={{ duration: 0.4 }}
        />

        {/* Secondary Image on Hover */}
        {product.images.secondary && (
          <motion.img
            src={product.images.secondary}
            alt={`${product.name} detalle`}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        )}

        {/* Tag Badge */}
        {product.tag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-[#f3eee3]/95 backdrop-blur-xs text-navy text-[10px] font-bold font-montserrat tracking-wider uppercase px-2.5 py-1 rounded shadow-xs border border-beige-300/80">
              {product.tag}
            </span>
          </div>
        )}

        {/* Quick Size Selector Overlay sliding up from bottom */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-[#f3eee3]/95 backdrop-blur-md border-t border-beige-300/80 transition-all duration-300 transform z-20 ${
            isHovered ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-navy/70">
              Talle rápido:
            </span>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`min-w-[24px] h-6 px-1.5 text-[10px] font-bold rounded flex items-center justify-center transition-colors cursor-pointer ${
                    selectedSize === size
                      ? 'bg-navy text-white'
                      : 'bg-beige-100 text-navy hover:bg-beige-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`w-full py-2 px-3 text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer ${
              isAdded
                ? 'bg-green-700 text-white'
                : 'bg-navy hover:bg-navy-500 text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Agregar talle {selectedSize}</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#FAF7F0]">
        <div>
          {/* Color Dots */}
          <div className="flex items-center space-x-1.5 mb-2">
            {product.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                title={color.name}
                aria-label={`Color ${color.name}`}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 cursor-pointer ${
                  selectedColor.name === color.name
                    ? 'ring-1 ring-navy scale-110 border-white'
                    : 'border-beige-400/80 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            <span className="text-[10px] text-navy/50 font-medium ml-1">
              {product.colors.length} {product.colors.length === 1 ? 'color' : 'colores'}
            </span>
          </div>

          {/* Title */}
          <Link to={`/producto/${product.slug}`}>
            <h3 className="font-montserrat font-bold text-sm text-navy uppercase tracking-tight group-hover:text-navy-500 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-[11px] text-navy/60 font-light mt-0.5 line-clamp-1">
            {product.subtitle}
          </p>
        </div>

        {/* Price Row */}
        <div className="mt-3 pt-3 border-t border-beige-200/70 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-montserrat font-black text-base text-navy">
              {formattedPrice}
            </span>
            {formattedComparePrice && (
              <span className="text-xs text-navy/40 line-through">
                {formattedComparePrice}
              </span>
            )}
          </div>
          {product.allowInstallments && (
            <span className="text-[10px] uppercase font-bold text-navy/60 tracking-wider">
              3 cuotas s/int
            </span>
          )}
          {!product.allowInstallments && product.allowTransferDiscount && (
            <span className="text-[10px] uppercase font-bold text-green-800 tracking-wider">
              10% OFF transf.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
