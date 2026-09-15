import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { Star, Heart, ShoppingBag, Truck, Shield, ArrowLeft } from 'lucide-react';
import { products } from '../data/products';

const themes = {
  Suits: {
    bg: 'bg-[#FAF8F5] text-[#2D2A26] font-cormorant',
    heading: 'text-[#2D2A26] font-cormorant font-light italic',
    subtitleText: 'text-[#8C7E7A] font-sans tracking-[0.2em] font-semibold text-xs',
    accentText: 'text-[#7F8C76]',
    textMuted: 'text-[#8C7E7A]',
    border: 'border-[#2D2A26]/10',
    divider: 'border-[#2D2A26]/10',
    buttonAccent: 'bg-[#2D2A26] hover:bg-[#7F8C76] text-white font-sans text-xs tracking-wider uppercase',
    qtyBg: 'bg-[#2D2A26]/5 border-[#2D2A26]/15 text-[#2D2A26]',
    featureBg: 'bg-[#FAF8F5] border-[#2D2A26]/10 text-[#2D2A26]/80',
    backLink: 'text-[#8C7E7A] hover:text-[#2D2A26] font-sans text-xs uppercase tracking-wider',
    starColor: 'text-[#7F8C76] fill-[#7F8C76]',
    detailsHeading: 'font-cormorant text-2xl italic border-b border-[#2D2A26]/10 pb-2 mb-4 text-[#2D2A26]'
  },
  Sarees: {
    bg: 'bg-gradient-to-b from-[#07140B] via-[#0B1E13] to-[#07140B] text-white font-cinzel',
    heading: 'text-white font-cinzel font-medium uppercase tracking-widest',
    subtitleText: 'text-[#D4AF37] tracking-[0.2em] font-semibold text-xs',
    accentText: 'text-[#D4AF37]',
    textMuted: 'text-white/60',
    border: 'border-white/10',
    divider: 'border-white/15',
    buttonAccent: 'bg-[#D4AF37] hover:bg-[#bfa032] text-black font-semibold uppercase tracking-wider text-xs',
    qtyBg: 'bg-white/5 border-white/10 text-white',
    featureBg: 'bg-white/[0.03] border-white/10 text-white/80',
    backLink: 'text-white/60 hover:text-[#D4AF37] uppercase tracking-wider text-xs',
    starColor: 'text-[#D4AF37] fill-[#D4AF37]',
    detailsHeading: 'font-cinzel text-xl uppercase border-b border-white/10 pb-2 mb-4 text-white'
  },
  Lehengas: {
    bg: 'bg-gradient-to-b from-[#FFF5F6] via-[#FAF0F1] to-[#FFF5F6] text-[#3D1B20] font-serif',
    heading: 'text-[#3D1B20] font-serif font-light',
    subtitleText: 'text-[#E3A857] tracking-[0.2em] font-semibold font-sans text-xs',
    accentText: 'text-[#E3A857]',
    textMuted: 'text-[#3D1B20]/60',
    border: 'border-[#3D1B20]/10',
    divider: 'border-[#3D1B20]/15',
    buttonAccent: 'bg-[#3D1B20] hover:bg-[#251013] text-white uppercase tracking-wider text-xs',
    qtyBg: 'bg-[#3D1B20]/5 border-[#3D1B20]/10 text-[#3D1B20]',
    featureBg: 'bg-white/60 border-[#3D1B20]/10 text-[#3D1B20]/80',
    backLink: 'text-[#3D1B20]/60 hover:text-[#E3A857] uppercase tracking-wider text-xs',
    starColor: 'text-[#E3A857] fill-[#E3A857]',
    detailsHeading: 'font-serif text-2xl italic border-b border-[#3D1B20]/10 pb-2 mb-4 text-[#3D1B20]'
  },
  Default: {
    bg: 'bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] text-white font-sans',
    heading: 'text-white font-serif',
    subtitleText: 'text-[#E89B3C] tracking-[0.2em] font-semibold text-xs',
    accentText: 'text-[#E89B3C]',
    textMuted: 'text-white/60',
    border: 'border-white/10',
    divider: 'border-white/15',
    buttonAccent: 'bg-[#531323] hover:bg-[#731830] text-white uppercase tracking-wider text-xs',
    qtyBg: 'bg-white/5 border-white/20 text-white',
    featureBg: 'bg-white/5 border-white/5 text-white/70',
    backLink: 'text-white/60 hover:text-[#E89B3C] uppercase tracking-wider text-xs',
    starColor: 'text-[#E89B3C] fill-[#E89B3C]',
    detailsHeading: 'font-serif text-xl border-b border-white/10 pb-2 mb-4 text-white'
  }
};

export function ProductDetails() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Look up product dynamically from shared products database
  const product = useMemo(() => {
    const prodId = Number(id);
    return products.find(p => p.id === prodId) || products[0];
  }, [id]);

  // Derive theme dynamically based on the product category
  const theme = useMemo(() => {
    const category = product.category;
    if (category === 'Suits') return themes.Suits;
    if (category === 'Sarees') return themes.Sarees;
    if (category === 'Lehengas') return themes.Lehengas;
    return themes.Default;
  }, [product.category]);

  return (
    <div className={`pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen transition-colors duration-700 ${theme.bg}`}>
      
      {/* Background with dynamic glows */}
      {product.category === 'Suits' ? (
        <>
          <div className="absolute inset-0 bg-[#FAF8F5] -z-10"></div>
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-[#ECE8E1]/80 rounded-full blur-[100px] -z-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#DFD9CE]/40 rounded-full blur-[100px] -z-10"></div>
        </>
      ) : product.category === 'Sarees' ? (
        <>
          <div className="absolute inset-0 bg-[#06120A]/95 -z-10"></div>
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-[#D4AF37]/[0.02] rounded-full blur-[100px] -z-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#800020]/[0.03] rounded-full blur-[100px] -z-10"></div>
        </>
      ) : product.category === 'Lehengas' ? (
        <>
          <div className="absolute inset-0 bg-[#FFF5F6] -z-10"></div>
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-[#FAF0F1] rounded-full blur-[90px] -z-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#E3A857]/[0.04] rounded-full blur-[100px] -z-10"></div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[#0F2418] -z-10"></div>
          <div className="absolute top-20 right-1/4 w-[600px] h-[600px] bg-[#FFF5EB]/[0.02] rounded-full blur-[100px] -z-10"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#E89B3C]/[0.03] rounded-full blur-[100px] -z-10"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link 
          to={`/shop?category=${product.category.toLowerCase()}`} 
          className={`inline-flex items-center gap-2 mb-8 transition-colors ${theme.backLink}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {product.category}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col-reverse md:flex-row gap-4"
          >
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible py-2 md:py-0 w-full md:w-24 flex-shrink-0">
              {product.images.map((img, idx) => {
                const isSelected = selectedImage === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-24 md:w-24 md:h-32 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      isSelected 
                        ? product.category === 'Suits'
                          ? 'border-[#7F8C76]'
                          : product.category === 'Sarees'
                            ? 'border-[#D4AF37]'
                            : 'border-[#3D1B20]'
                        : `border-transparent opacity-60 hover:opacity-100`
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
            
            {/* Main Image */}
            <div className="flex-1 rounded-2xl overflow-hidden relative" style={{ minHeight: '520px' }}>
              <img 
                src={product.images[selectedImage]} 
                alt={product.name} 
                className="w-full h-full object-cover absolute inset-0 rounded-2xl"
              />
              {/* Image framing overlay for Premium Suits */}
              {product.category === 'Suits' && (
                <div className="absolute inset-0 border-[10px] border-[#FAF8F5]/80 pointer-events-none rounded-2xl"></div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <p className={`${theme.subtitleText} uppercase tracking-[0.2em] mb-3`}>
              {product.category} {product.tag ? `· ${product.tag}` : ''}
            </p>
            
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl mb-4 leading-tight tracking-wide ${theme.heading}`}>
              {product.name} {product.subtitle ? <span className="font-light">| {product.subtitle}</span> : ''}
            </h1>
            
            {/* Pricing and Reviews */}
            <div className={`flex items-end gap-4 mb-6 border-b pb-6 ${theme.divider}`}>
              <span className="text-3xl font-light">{product.price}</span>
              <div className={`flex items-center gap-2 mb-1 border-l pl-4 ${theme.divider}`}>
                <div className="flex items-center gap-1">
                  <Star className={`w-4 h-4 ${theme.starColor}`} />
                  <span className="text-sm font-semibold">{product.rating}</span>
                </div>
                <span className={`text-xs underline cursor-pointer hover:opacity-100 transition-all font-sans ${theme.textMuted}`}>
                  {product.reviews} authentic reviews
                </span>
              </div>
            </div>

            {/* Custom Stock progress indicators for Suits (matching user picture) */}
            {product.category === 'Suits' && product.stockPercentage && (
              <div className="mb-8 font-sans">
                {product.stockPercentage > 50 ? (
                  <div className="inline-flex items-center gap-3 bg-[#7F8C76]/10 text-[#7F8C76] font-semibold text-xs px-4 py-2.5 rounded-full border border-[#7F8C76]/20 shadow-sm">
                    <span>AVAILABLE: {product.stockPercentage}% OF LIMITED EDITION</span>
                    <div className="w-28 h-1 bg-[#FAF8F5] border border-[#7F8C76]/20 rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#7F8C76]" style={{ width: `${product.stockPercentage}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 bg-[#B88F8A]/10 text-[#B88F8A] font-semibold text-xs px-4 py-2.5 rounded-full border border-[#B88F8A]/20 shadow-sm">
                    <span>{product.stockPercentage}% - LIMITED PIECES LEFT IN BOUTIQUE</span>
                    <div className="w-20 h-1 bg-[#FAF8F5] border border-[#B88F8A]/20 rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#B88F8A]" style={{ width: `${product.stockPercentage}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className={`text-base sm:text-lg mb-8 leading-relaxed font-light ${theme.textMuted}`}>
              {product.description}
            </p>

            {/* Actions: Quantity selection + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 font-sans">
              <div className={`flex border rounded-full overflow-hidden w-full sm:w-auto h-[56px] backdrop-blur-sm p-1 ${theme.qtyBg}`}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 flex items-center justify-center font-semibold hover:opacity-70 cursor-pointer"
                >-</button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 bg-transparent text-center focus:outline-none font-semibold"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 flex items-center justify-center font-semibold hover:opacity-70 cursor-pointer"
                >+</button>
              </div>

              <button className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${theme.buttonAccent}`}>
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>

              <button className={`w-[56px] h-[56px] flex items-center justify-center rounded-full border hover:bg-white/10 transition-all duration-300 cursor-pointer ${theme.divider}`}>
                <Heart className="w-4 h-4 text-current" />
              </button>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-2 gap-4 mb-10 font-sans text-xs">
              <div className={`flex items-center gap-3 py-4 px-5 rounded-2xl border ${theme.featureBg}`}>
                <Truck className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentText.includes('#') ? theme.accentText : undefined }} />
                <div>
                  <p className="font-semibold">Complimentary Shipping</p>
                  <p className="opacity-70">Fully insured courier</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 py-4 px-5 rounded-2xl border ${theme.featureBg}`}>
                <Shield className="w-4 h-4 flex-shrink-0" style={{ color: theme.accentText.includes('#') ? theme.accentText : undefined }} />
                <div>
                  <p className="font-semibold">Boutique Guarantee</p>
                  <p className="opacity-70">100% Authentic fabrics</p>
                </div>
              </div>
            </div>

            {/* Product Details List */}
            <div className="space-y-4 font-sans text-sm">
              <h3 className={theme.detailsHeading}>Product Specifications</h3>
              {product.details.map((detail, idx) => (
                <div key={idx} className={`flex justify-between border-b pb-3 ${theme.divider}`}>
                  <span className={`${theme.textMuted} text-xs uppercase tracking-wider`}>{detail.name}</span>
                  <span className="font-medium text-right">{detail.value}</span>
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
