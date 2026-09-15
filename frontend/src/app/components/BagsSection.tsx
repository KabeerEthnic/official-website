import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, Heart, Sparkles, ArrowRight, Gem, Layers, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { products, Product } from '../data/products';

const bagCategories = [
  { id: 'all', label: 'All Creations' },
  { id: 'potli', label: 'Royal Potlis' },
  { id: 'clutch', label: 'Zardozi Clutches' },
  { id: 'bridal', label: 'Bridal Velvet' },
];

export function BagsSection() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBagIndex, setSelectedBagIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [addedToCart, setAddedToCart] = useState<number[]>([]);

  // Filter bags category from dataset
  const bagProducts = products.filter((p) => p.category === 'Bags');

  // Spotlight hero bag
  const heroBag = bagProducts[selectedBagIndex] || bagProducts[0];

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (id: number) => {
    if (!addedToCart.includes(id)) {
      setAddedToCart((prev) => [...prev, id]);
      setTimeout(() => {
        setAddedToCart((prev) => prev.filter((item) => item !== id));
      }, 2500);
    }
  };

  const filteredBags = bagProducts.filter((bag) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'potli') return bag.name.toLowerCase().includes('potli');
    if (activeTab === 'clutch') return bag.name.toLowerCase().includes('clutch');
    if (activeTab === 'bridal') return bag.tag?.toLowerCase().includes('bridal') || bag.name.toLowerCase().includes('bridal');
    if (activeTab === 'tote') return bag.name.toLowerCase().includes('tote');
    return true;
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#FAF8F5] text-[#2D2A26]">
      {/* Soft Ivory Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#E89B3C]/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#7F8C76]/[0.05] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6 border-b border-[#2D2A26]/10 pb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8C7E7A]/10 border border-[#8C7E7A]/20 text-[#8C7E7A] text-xs uppercase tracking-[0.25em] font-semibold mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E89B3C]" />
              <span>Kabeer Ethnic Accessories</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-cormorant text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#2D2A26] font-light"
            >
              Royal Ethnic <span className="font-serif italic font-normal text-[#E89B3C]">Potlis & Clutches</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#8C7E7A] max-w-md text-sm md:text-base leading-relaxed italic font-serif"
          >
            Handcrafted with Zardozi gold embroidery, pearl latkans, and plush velvet linings — designed as the perfect finishing touch for celebrations.
          </motion.p>
        </div>

        {/* ---------------------------------------------------- */}
        {/* HERO SPOTLIGHT BAG CARD (Light Kurti Theme Aesthetic) */}
        {/* ---------------------------------------------------- */}
        {heroBag && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mb-16 rounded-3xl overflow-hidden border border-[#2D2A26]/10 bg-[#FCFAF7] shadow-[0_20px_60px_rgba(0,0,0,0.04)] p-6 lg:p-10"
          >
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Details & Hotspots */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#2D2A26] text-white mb-3 shadow-sm">
                    {heroBag.tag || 'FEATURED SELECTION'}
                  </span>
                  <h3 className="font-cormorant text-3xl sm:text-4xl uppercase tracking-wide text-[#2D2A26] font-semibold mb-2">
                    {heroBag.name}
                  </h3>
                  <p className="text-[#8C7E7A] font-medium text-sm mb-4">
                    {heroBag.subtitle} — <span className="text-[#2D2A26] font-bold text-lg">{heroBag.price}</span>
                  </p>
                  <p className="text-[#8C7E7A] text-xs sm:text-sm leading-relaxed mb-6 font-light">
                    {heroBag.description}
                  </p>
                </div>

                {/* Craftsmanship Highlights */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2D2A26]/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#E89B3C]/10 text-[#E89B3C]">
                      <Gem className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#2D2A26] uppercase tracking-wider">Artisanal Zardozi</h4>
                      <p className="text-[11px] text-[#8C7E7A]">Hand-sewn gold threads</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#E89B3C]/10 text-[#E89B3C]">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#2D2A26] uppercase tracking-wider">Raw Silk & Velvet</h4>
                      <p className="text-[11px] text-[#8C7E7A]">Plush luxury inner</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button
                    onClick={() => handleAddToCart(heroBag.id)}
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-full bg-[#2D2A26] text-white font-semibold text-xs uppercase tracking-widest hover:bg-[#E89B3C] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{addedToCart.includes(heroBag.id) ? 'Added to Bag ✓' : 'Add to Shopping Bag'}</span>
                  </button>

                  <Link
                    to={`/product/${heroBag.id}`}
                    className="px-6 py-3.5 rounded-full border border-[#2D2A26]/20 text-[#2D2A26] hover:bg-[#2D2A26] hover:text-white transition-all duration-300 flex items-center gap-2 text-xs uppercase tracking-widest font-semibold"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Floating Image Showcase */}
              <div className="lg:col-span-7 relative">
                <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#F3EFE9] border border-[#2D2A26]/5 shadow-md group">
                  <img
                    src={heroBag.images[0]}
                    alt={heroBag.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Rating Overlay */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-[#2D2A26]/10 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-[#2D2A26] shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-[#E3A857] text-[#E3A857]" />
                    <span className="font-bold">{heroBag.rating}</span>
                    <span className="text-[#8C7E7A]">({heroBag.reviews} reviews)</span>
                  </div>

                  {/* Thumbnail Selector strip */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/90 backdrop-blur-md border border-[#2D2A26]/10 p-2 rounded-2xl shadow-sm">
                    <span className="text-xs text-[#8C7E7A] px-2 font-medium">Select Showcase Style:</span>
                    <div className="flex gap-2">
                      {bagProducts.slice(0, 4).map((bag, idx) => (
                        <button
                          key={bag.id}
                          onClick={() => setSelectedBagIndex(idx)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            selectedBagIndex === idx
                              ? 'border-[#E89B3C] scale-105'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={bag.images[0]} alt={bag.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* FILTER CATEGORY TABS */}
        {/* ---------------------------------------------------- */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {bagCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-[#2D2A26] text-white shadow-md'
                  : 'bg-white text-[#2D2A26]/70 border border-[#2D2A26]/10 hover:border-[#2D2A26]/30 hover:text-[#2D2A26]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ---------------------------------------------------- */}
        {/* PRODUCT CARDS GRID (Light Kurti Style) */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {filteredBags.map((bag, index) => {
              const isFav = favorites.includes(bag.id);
              const isAdded = addedToCart.includes(bag.id);

              return (
                <motion.div
                  key={bag.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden bg-[#FCFAF7] border border-[#2D2A26]/8 hover:border-[#E89B3C]/30 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F3EFE9]">
                    <img
                      src={bag.images[0]}
                      alt={bag.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Tag Badge */}
                    {bag.tag && (
                      <span className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full bg-white border border-[#2D2A26]/10 text-[#2D2A26] shadow-sm">
                        {bag.tag}
                      </span>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(bag.id)}
                      className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#2D2A26]/10 text-[#2D2A26] hover:text-rose-500 transition-colors shadow-sm cursor-pointer"
                      aria-label="Add to favorites"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] tracking-wider text-[#8C7E7A] uppercase font-semibold">
                          {bag.color} Ethnic Accessory
                        </span>
                        <div className="flex items-center gap-1 text-xs text-[#2D2A26]">
                          <Star className="w-3.5 h-3.5 fill-[#E3A857] text-[#E3A857]" />
                          <span className="font-semibold">{bag.rating}</span>
                        </div>
                      </div>

                      <Link to={`/product/${bag.id}`}>
                        <h3 className="font-cormorant text-2xl font-semibold text-[#2D2A26] group-hover:text-[#E89B3C] transition-colors duration-300 uppercase tracking-wide mb-1">
                          {bag.name}
                        </h3>
                      </Link>

                      <p className="text-[#8C7E7A] text-xs font-light leading-relaxed mb-4 line-clamp-2">
                        {bag.subtitle} — {bag.description}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-4 border-t border-[#2D2A26]/5 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[10px] text-[#8C7E7A] uppercase tracking-widest block">Price</span>
                        <span className="text-xl font-bold text-[#2D2A26]">{bag.price}</span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(bag.id)}
                        className={`px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#2D2A26] text-white hover:bg-[#E89B3C]'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isAdded ? 'Added ✓' : 'Add Bag'}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* ---------------------------------------------------- */}
        {/* BESPOKE BRIDAL ATELIER BANNER (Light Theme) */}
        {/* ---------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-3xl p-8 lg:p-12 border border-[#E89B3C]/20 bg-gradient-to-r from-[#F7F3EE] via-[#FCFAF7] to-[#F7F3EE] relative overflow-hidden shadow-sm"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left items-center">
            <div className="md:col-span-2">
              <span className="text-[#E89B3C] text-xs uppercase tracking-[0.2em] font-semibold mb-2 block">
                Bespoke Accessories Service
              </span>
              <h3 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#2D2A26] uppercase mb-2">
                Need a Custom Potli to Match Your Bridal Outfit?
              </h3>
              <p className="text-[#8C7E7A] text-xs sm:text-sm leading-relaxed max-w-xl font-light">
                Our master craftsmen hand-dye raw silk, embroider custom Zardozi initials, and match your outfit’s exact fabric motif within 7 business days.
              </p>
            </div>

            <div className="flex md:justify-end">
              <Link
                to="/shop?category=Bags"
                className="px-8 py-3.5 rounded-full bg-[#2D2A26] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#E89B3C] transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Browse All Bags</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
