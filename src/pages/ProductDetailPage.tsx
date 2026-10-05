import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Ruler, Truck, ShieldCheck, Heart, Share2, Plus, Minus, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Product, ProductColor } from '../data/products';
import { CatalogService, computeVariantTitle } from '../services/catalogService';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { Accordion } from '../components/common/Accordion';
import { ProductCard } from '../components/product/ProductCard';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const colorParam = searchParams.get('color');
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { openSizeGuide, showToast } = useUIStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<ProductColor>({
    name: 'Negro Washed',
    hex: '#161616',
    class: 'bg-[#161616]',
  });
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isAdded, setIsAdded] = useState(false);

  // Obtener la galería de fotos activa (si el color tiene fotos propias, mostrar esas, sino fotos generales)
  const currentGalleryImages = React.useMemo(() => {
    if (!product) return [];
    if (selectedColor.images && selectedColor.images.length > 0) {
      return selectedColor.images;
    }
    if (product.allImages && product.allImages.length > 0) {
      return product.allImages;
    }
    return [product.images.primary, product.images.secondary, product.images.lookbook].filter(Boolean) as string[];
  }, [product, selectedColor]);

  // Título dinámico que refleja el color seleccionado
  const currentProductTitle = React.useMemo(() => {
    if (!product) return '';
    if (product.colors && product.colors.length > 1 && selectedColor) {
      return computeVariantTitle(product.name, selectedColor, product.colors);
    }
    return product.name;
  }, [product, selectedColor]);

  // Load product dynamically from Supabase
  React.useEffect(() => {
    if (id) {
      setLoading(true);
      CatalogService.getProductBySlug(id).then((found) => {
        if (found) {
          setProduct(found);
          let targetColor = found.colors && found.colors.length > 0 ? found.colors[0] : null;
          if (colorParam && found.colors) {
            const matched = found.colors.find(
              (c) => c.name.toLowerCase() === colorParam.toLowerCase()
            );
            if (matched) targetColor = matched;
          }

          if (targetColor) {
            setSelectedColor(targetColor);
            if (targetColor.images && targetColor.images.length > 0) {
              setActiveImage(targetColor.images[0]);
            } else {
              setActiveImage(found.images.primary);
            }
          } else {
            setActiveImage(found.images.primary);
          }

          if (found.sizes && found.sizes.length > 0) {
            setSelectedSize(found.sizes[0]);
          }
          setQuantity(1);
        } else {
          setProduct(null);
        }
        setLoading(false);
      });

      CatalogService.getProducts().then((all) => {
        const related = all.filter((p) => p.id !== id && p.slug !== id && (!p.baseId || p.baseId !== id)).slice(0, 3);
        setRelatedProducts(related);
      });
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Sincronizar el color seleccionado cuando cambia el parámetro ?color= en la URL
  React.useEffect(() => {
    if (product && colorParam && product.colors) {
      const matched = product.colors.find(
        (c) => c.name.toLowerCase() === colorParam.toLowerCase()
      );
      if (matched && matched.name !== selectedColor.name) {
        setSelectedColor(matched);
        if (matched.images && matched.images.length > 0) {
          setActiveImage(matched.images[0]);
        }
      }
    }
  }, [colorParam, product]);

  const handleSelectColor = (color: ProductColor) => {
    setSelectedColor(color);
    setSearchParams({ color: color.name }, { replace: true });
    if (color.images && color.images.length > 0) {
      setActiveImage(color.images[0]);
    } else if (product?.images.primary) {
      setActiveImage(product.images.primary);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, selectedSize, selectedColor.name, selectedColor.hex, quantity);
    setIsAdded(true);
    showToast(`¡${currentProductTitle} agregado al carrito!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
          <div className="lg:col-span-7 h-[500px] bg-beige-200 rounded-3xl" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-6 bg-beige-200 rounded w-1/3" />
            <div className="h-10 bg-beige-200 rounded w-3/4" />
            <div className="h-8 bg-beige-200 rounded w-1/2" />
            <div className="h-24 bg-beige-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 px-4 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-beige-200 rounded-full flex items-center justify-center mx-auto mb-4 text-navy">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-montserrat font-black text-2xl uppercase tracking-tight text-navy mb-2">
          Prenda no encontrada
        </h2>
        <p className="text-xs text-navy/70 mb-6 font-light">
          La prenda solicitada no existe o fue retirada del catálogo de Supabase.
        </p>
        <Link
          to="/tienda"
          className="inline-flex items-center space-x-2 bg-navy text-white text-xs font-montserrat font-bold uppercase tracking-wider px-6 py-3 rounded-xl shadow-md hover:bg-navy-500 transition-colors"
        >
          <span>Volver a la Tienda</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

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

  const installmentAmount = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Math.round(product.price / 3));

  // Accordion data
  const accordionItems = [
    {
      id: 'cuidados',
      title: 'Cuidados de la Prenda',
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-navy/80">
          <p>Para conservar la textura original y evitar encogimientos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Lavar con agua fría (máximo 30°C) con colores similares.</li>
            <li>Lavar y planchar siempre del revés.</li>
            <li>Secar al aire libre a la sombra. No utilizar secarropas.</li>
            <li>Guardar doblado para no deformar los hombros.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'envios',
      title: 'Envíos y Tiempos de Entrega',
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-navy/80">
          <p>
            <strong>Envíos a todo el país:</strong> Andreani y Correo Argentino a domicilio o sucursal (3 a 5 días hábiles).
          </p>
          <p>
            <strong>Quilmes y GBA Sur:</strong> Envío rápido por Veelvet en 24 a 48 hs hábiles.
          </p>
          <p>
            <strong>Showroom Quilmes Oeste:</strong> Retiro inmediato gratuito reservando tu turno online.
          </p>
        </div>
      ),
    },
    {
      id: 'detalles',
      title: 'Composición y Calce',
      content: (
        <div className="space-y-2 text-xs sm:text-sm text-navy/80">
          <p><strong>Composición:</strong> {product.composition}</p>
          <p><strong>Calce:</strong> {product.fit}</p>
          <p><strong>Género:</strong> 100% Unisex con silueta holgada.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-navy/60 uppercase font-semibold tracking-wider mb-8">
        <Link to="/" className="hover:text-navy">Inicio</Link>
        <span>/</span>
        <Link to="/tienda" className="hover:text-navy">Colección</Link>
        <span>/</span>
        <span className="text-navy font-bold">{currentProductTitle}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        
        {/* Left: Gallery with Zoom */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="flex sm:flex-col space-x-3 sm:space-x-0 sm:space-y-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[520px] pb-2 sm:pb-0 scrollbar-none">
            {currentGalleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 bg-beige-100 cursor-pointer ${
                  activeImage === img ? 'border-navy shadow-sm ring-2 ring-navy' : 'border-beige-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Zoomable Image Canvas */}
          <div
            className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-beige-100 border border-beige-300 cursor-crosshair select-none"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={activeImage}
              alt={currentProductTitle}
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }
                  : undefined
              }
            />

            {/* Tag badge */}
            {product.tag && (
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-navy text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded shadow-xs border border-beige-300">
                {product.tag}
              </span>
            )}

            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-[10px] uppercase font-bold text-navy/70 px-2.5 py-1 rounded pointer-events-none">
              Pasa el cursor para zoom
            </div>
          </div>
        </div>

        {/* Right: Product Buy Box */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-navy/60 font-montserrat">
              Veelvet Official • Unisex
            </span>
            <h1 className="font-montserrat font-black text-2xl sm:text-3xl lg:text-4xl text-navy uppercase tracking-tight mt-1">
              {currentProductTitle}
            </h1>
            <p className="text-xs sm:text-sm text-navy/70 font-light mt-1">
              {product.subtitle}
            </p>
          </div>

          {/* Price Box */}
          <div className="bg-beige-100/80 p-4 rounded-xl border border-beige-300/80">
            <div className="flex items-baseline space-x-3">
              <span className="font-montserrat font-black text-2xl sm:text-3xl text-navy">
                {formattedPrice}
              </span>
              {formattedComparePrice && (
                <span className="text-sm text-navy/40 line-through">
                  {formattedComparePrice}
                </span>
              )}
            </div>
            {product.allowInstallments && (
              <p className="text-xs text-navy/80 font-medium mt-1">
                Hasta <strong>3 cuotas fijas de {installmentAmount}</strong> sin interés
              </p>
            )}
            {product.allowTransferDiscount && (
              <p className="text-[11px] text-green-800 font-bold uppercase tracking-wider mt-1">
                10% OFF pagando por transferencia bancaria
              </p>
            )}
          </div>

          {/* Color Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy">
                Color: <strong className="text-navy-500">{selectedColor.name}</strong>
              </span>
              {selectedColor.images && selectedColor.images.length > 0 && (
                <span className="text-[10px] text-navy/50 font-medium">
                  {selectedColor.images.length} fotos de este color
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2.5">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleSelectColor(color)}
                  className={`group relative p-0.5 rounded-full border-2 transition-all cursor-pointer ${
                    selectedColor.name === color.name
                      ? 'border-navy scale-110 shadow-sm'
                      : 'border-transparent hover:border-beige-400'
                  }`}
                  aria-label={`Seleccionar color ${color.name}`}
                  title={color.name}
                >
                  <span
                    className="block w-6 h-6 rounded-full border border-black/20 shadow-xs"
                    style={{ backgroundColor: color.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector & Size Guide Trigger */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy">
                Talle: <strong className="text-navy-500">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => openSizeGuide(product.measureType === 'pantalon' ? 'pantalon' : 'buzo')}
                className="inline-flex items-center space-x-1 text-xs font-bold text-navy hover:text-navy-500 underline uppercase cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Ver tabla de talles</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[50px] py-2.5 px-3.5 text-xs font-montserrat font-bold uppercase tracking-wider rounded-lg border-2 transition-all cursor-pointer ${
                    selectedSize === size
                      ? 'bg-navy text-white border-navy shadow-sm'
                      : 'bg-white text-navy border-beige-300 hover:border-beige-400 hover:bg-beige-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex space-x-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border-2 border-beige-300 rounded-lg bg-white px-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-navy hover:text-navy-500 transition-colors"
                  aria-label="Restar cantidad"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-sm text-navy">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-navy hover:text-navy-500 transition-colors"
                  aria-label="Sumar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-lg font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-200 shadow-md ${
                  isAdded
                    ? 'bg-green-700 text-white'
                    : 'bg-navy hover:bg-navy-500 text-white cursor-pointer'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>¡Agregado a tu bolsa!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Agregar al carrito</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct WhatsApp consultation */}
            <a
              href={`https://wa.me/5491136291392?text=Hola%20Veelvet!%20Tengo%20una%20consulta%20sobre%20el%20producto%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-beige-100 hover:bg-beige-200 text-navy font-bold text-xs uppercase tracking-wider rounded-lg transition-colors border border-beige-300 flex items-center justify-center space-x-2"
            >
              <span>Consultar por WhatsApp (11 3629-1392)</span>
            </a>
          </div>

          {/* Description Paragraph */}
          <div className="pt-2 text-xs sm:text-sm text-navy/80 font-light leading-relaxed whitespace-pre-line">
            {product.description}
          </div>

          {/* Accordions */}
          <div className="pt-4 border-t border-beige-200">
            <Accordion items={accordionItems} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-24 pt-16 border-t border-beige-300">
        <h2 className="font-montserrat font-black text-2xl uppercase tracking-tight text-navy mb-8">
          Completá Tu Conjunto
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
