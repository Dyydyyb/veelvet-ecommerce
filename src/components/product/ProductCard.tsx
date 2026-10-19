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
  const fallbackColor = product.colors?.[0] || { name: 'Único', hex: '#000000', class: 'bg-black' };
  const [selectedColor, setSelectedColor] = useState(
    product.selectedColorVariant
      ? product.colors?.find((c) => c.name === product.selectedColorVariant) || fallbackColor
      : fallbackColor
  );
  const [hasUserSwatched, setHasUserSwatched] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCartStore();

  // Sync if product changes
  React.useEffect(() => {
    setHasUserSwatched(false);
    let colorCandidate = fallbackColor;
    if (product.selectedColorVariant) {
      const match = product.colors?.find((c) => c.name === product.selectedColorVariant);
      if (match) colorCandidate = match;
    } else if (product.colors?.[0]) {
      colorCandidate = product.colors[0];
    }
    setSelectedColor(colorCandidate);

    if (product.sizes?.[0]) {
      if (colorCandidate.stock_por_talle && Object.keys(colorCandidate.stock_por_talle).length > 0) {
        const available = product.sizes.find((s) => (colorCandidate.stock_por_talle?.[s] ?? 0) > 0);
        setSelectedSize(available || product.sizes[0]);
      } else {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  // Stock tracking helpers for current color
  const hasColorStockTracking = Boolean(
    selectedColor?.stock_por_talle && Object.keys(selectedColor.stock_por_talle).length > 0
  );

  const getSizeStock = (size: string): number => {
    if (hasColorStockTracking && selectedColor.stock_por_talle) {
      return selectedColor.stock_por_talle[size] ?? 0;
    }
    return product.inStock ? 99 : 0;
  };

  const isSizeAvailable = (size: string): boolean => {
    if (!hasColorStockTracking) return product.inStock;
    return getSizeStock(size) > 0;
  };

  const isCurrentSelectionInStock = isSizeAvailable(selectedSize);

  const totalStockInColor = hasColorStockTracking
    ? Object.values(selectedColor.stock_por_talle || {}).reduce((acc, count) => acc + (Number(count) || 0), 0)
    : (product.inStock ? 99 : 0);

  const isColorCompletelyOutOfStock = hasColorStockTracking && totalStockInColor === 0;

  // Si el usuario no hizo clic en un color específico, la imagen principal de la grilla tiene prioridad
  const displayPrimaryImage = hasUserSwatched
    ? (selectedColor?.images?.[0] || product.mainGridImage || product.images?.primary || '')
    : (product.mainGridImage || product.images?.primary || selectedColor?.images?.[0] || '');

  const displaySecondaryImage = hasUserSwatched
    ? (selectedColor?.images?.[1] || product.images?.secondary || displayPrimaryImage)
    : (product.images?.secondary && product.images?.secondary !== displayPrimaryImage
        ? product.images.secondary
        : (selectedColor?.images?.[1] || displayPrimaryImage));

  const productTargetUrl = selectedColor?.name
    ? `/producto/${product.slug}?color=${encodeURIComponent(selectedColor.name)}`
    : `/producto/${product.slug}`;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCurrentSelectionInStock) return;
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
      <Link to={productTargetUrl} className="relative aspect-[3/4] w-full bg-beige-100 overflow-hidden block">
        {/* Primary Image */}
        <motion.img
          src={displayPrimaryImage}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered && displaySecondaryImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          transition={{ duration: 0.4 }}
        />

        {/* Secondary Image on Hover */}
        {displaySecondaryImage && (
          <motion.img
            src={displaySecondaryImage}
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

        {/* Agotado Badge for current color */}
        {isColorCompletelyOutOfStock && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-red-900/90 backdrop-blur-xs text-white text-[10px] font-bold font-montserrat tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
              Agotado
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
              {product.sizes.map((size) => {
                const available = isSizeAvailable(size);
                const stock = getSizeStock(size);
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!available}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (available) {
                        setSelectedSize(size);
                      }
                    }}
                    title={
                      hasColorStockTracking
                        ? available
                          ? `${stock} unidades disponibles en ${selectedColor.name}`
                          : `Sin stock en ${selectedColor.name}`
                        : undefined
                    }
                    className={`min-w-[24px] h-6 px-1.5 text-[10px] font-bold rounded flex items-center justify-center transition-colors ${
                      !available
                        ? 'bg-beige-200/50 text-navy/30 line-through cursor-not-allowed opacity-50'
                        : isSelected
                        ? 'bg-navy text-white cursor-pointer shadow-xs'
                        : 'bg-beige-100 text-navy hover:bg-beige-200 cursor-pointer'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            disabled={!isCurrentSelectionInStock || isAdded}
            onClick={handleQuickAdd}
            className={`w-full py-2 px-3 text-xs font-bold uppercase tracking-wider rounded transition-all duration-200 flex items-center justify-center space-x-1.5 ${
              !isCurrentSelectionInStock
                ? 'bg-beige-300 text-navy/40 cursor-not-allowed'
                : isAdded
                ? 'bg-green-700 text-white cursor-default'
                : 'bg-navy hover:bg-navy-500 text-white cursor-pointer'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>¡Agregado!</span>
              </>
            ) : !isCurrentSelectionInStock ? (
              <span>Sin stock en talle {selectedSize}</span>
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(color);
                  setHasUserSwatched(true);
                  if (color.stock_por_talle && Object.keys(color.stock_por_talle).length > 0) {
                    const currentStock = color.stock_por_talle[selectedSize] ?? 0;
                    if (currentStock <= 0) {
                      const firstAvailable = product.sizes.find(
                        (s) => (color.stock_por_talle?.[s] ?? 0) > 0
                      );
                      if (firstAvailable) {
                        setSelectedSize(firstAvailable);
                      }
                    }
                  }
                }}
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
          <Link to={productTargetUrl}>
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
