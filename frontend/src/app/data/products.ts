export interface Product {
  id: number;
  name: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  priceNum: number;
  images: string[];
  rating: number;
  reviews: number;
  category: string;
  color: string;
  stockPercentage?: number;
  tag?: string;
  description: string;
  details: { name: string; value: string }[];
}

export const products: Product[] = [
  // SUITS (Premium, Boutique style - Inspired by user request)
  {
    id: 9,
    name: 'MIRA',
    subtitle: 'Sage Silk Anarkali',
    price: '₹14,999',
    priceNum: 14999,
    images: [
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.8,
    reviews: 145,
    category: 'Suits',
    color: 'Green',
    stockPercentage: 82,
    tag: 'LIMITED',
    description: 'Hand-crafted with meticulous craftsmanship and tailored to convey elegance and grace. Features a flowing sage-silk body with fine traditional zari borders, paired with a matching georgette dupatta.',
    details: [
      { name: 'Fabric', value: '100% Pure Sage Silk' },
      { name: 'Embroidery', value: 'Fine Gold Zari & Zardozi' },
      { name: 'Include', value: 'Anarkali Kameez, Churidar & Dupatta' },
      { name: 'Care', value: 'Dry Clean Only' }
    ]
  },
  {
    id: 10,
    name: 'MIRA',
    subtitle: 'Dusty Silk Anarkali',
    price: '₹16,499',
    priceNum: 16499,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 5.0,
    reviews: 112,
    category: 'Suits',
    color: 'Pink',
    stockPercentage: 75,
    tag: 'FEW PIECES LEFT',
    description: 'Crafted with premium intricate embroidery and unique Indian tailoring. The dusty rose hue gives it a gorgeous, understated luxury feel that is perfect for premium daytime events.',
    details: [
      { name: 'Fabric', value: 'Pure Banarasi Silk' },
      { name: 'Embroidery', value: 'Handmade Tilla Work' },
      { name: 'Include', value: 'Gherdar Anarkali, Churidar Pants & Dupatta' },
      { name: 'Origin', value: 'Lucknow, India' }
    ]
  },
  {
    id: 11,
    name: 'MIIRA',
    subtitle: 'Love Silk Anarkali',
    price: '₹18,999',
    priceNum: 18999,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.9,
    reviews: 98,
    category: 'Suits',
    color: 'Purple',
    stockPercentage: 25,
    tag: 'FEW PIECES LEFT',
    description: 'An exclusive masterpiece hand-dyed in soft royal lavender tones. Features rich, heavy zardozi hand embroidery on the neckline and a majestic flare. Extremely limited production.',
    details: [
      { name: 'Fabric', value: 'Premium Chanderi Silk' },
      { name: 'Embroidery', value: 'Heavy Neck & Border Zardozi' },
      { name: 'Include', value: 'Flared Kameez, Pants & Heavy Dupatta' },
      { name: 'Care', value: 'Dry Clean Only (Protect metal threads)' }
    ]
  },
  {
    id: 12,
    name: 'INDIGO',
    subtitle: 'Silk Anarkali',
    price: '₹15,999',
    priceNum: 15999,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.7,
    reviews: 84,
    category: 'Suits',
    color: 'Blue',
    stockPercentage: 40,
    tag: 'EXCLUSIVE',
    description: 'Bespoke deep indigo blue suit with signature silver embroidery details around the collar and sleeves. Inspired by royal court wear, this suit balances classic heritage with modern comfort.',
    details: [
      { name: 'Fabric', value: '100% Organza Silk Blend' },
      { name: 'Embroidery', value: 'Fine Silver Gota Patti' },
      { name: 'Coloring', value: 'Natural Indigo Vegetable Dye' },
      { name: 'Include', value: 'Anarkali Kurta & Dupatta Set' }
    ]
  },

  // BAGS & TOTE BAGS (Tote Bags, Royal Zardozi Clutches & Velvet Potlis)
  {
    id: 1,
    name: 'MEENAKARI BRASS TOTE',
    subtitle: 'Antique Brass Handle Velvet Tote',
    price: '₹6,499',
    originalPrice: '₹8,999',
    priceNum: 6499,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.8,
    reviews: 156,
    category: 'Bags',
    color: 'Maroon',
    tag: 'ROYAL TOTE',
    description: 'A majestic deep burgundy velvet tote bag topped with hand-engraved solid brass handles depicting traditional Indian peacock motifs. Designed for luxury enthusiasts who appreciate artisanal brassware and spacious everyday elegance.',
    details: [
      { name: 'Body', value: '9000 Micro Velvet' },
      { name: 'Handles', value: '100% Solid Brass Hand Engraved' },
      { name: 'Interior', value: 'Zippered Compartments & Card Slots' }
    ]
  },
  {
    id: 2,
    name: 'GULABI',
    subtitle: 'BLOCK PRINT TOTE',
    price: '₹1,450',
    originalPrice: '₹2,100',
    priceNum: 1450,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.9,
    reviews: 234,
    category: 'Bags',
    color: 'Red',
    tag: 'BESTSELLER',
    description: 'An elegant raw silk tote featuring intricate gold threadwork along the border, reinforced leatherette handles, and spacious compartments for tablet, cosmetics, and day-to-night essentials.',
    details: [
      { name: 'Material', value: '100% Chanderi Raw Silk & Vegan Leather' },
      { name: 'Work', value: 'Golden Zari & Marodi Threadwork' },
      { name: 'Handles', value: 'Double Shoulder Strap' }
    ]
  },
  {
    id: 3,
    name: 'NOOR',
    subtitle: 'ZARI EMBROIDERED TOTE',
    price: '₹1,890',
    originalPrice: '₹2,600',
    priceNum: 1890,
    images: [
      'https://images.unsplash.com/photo-1594223274512-ad480274d954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1614179689702-355944cd0918?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.7,
    reviews: 142,
    category: 'Bags',
    color: 'Gold',
    tag: 'NEW',
    description: 'A dazzling champagne gold structured tote bag embellished with real glass mirrorwork and gota patti trim. Lightweight, sturdy, and highly reflective under event lighting.',
    details: [
      { name: 'Base', value: 'Metallic Woven Tissue Canvas' },
      { name: 'Work', value: 'Real Mirror Work & Gota Patti' },
      { name: 'Strap', value: 'Reinforced Shoulder Straps' }
    ]
  },
  {
    id: 4,
    name: 'RANI',
    subtitle: 'AJRAKH PRINT TOTE',
    price: '₹1,650',
    originalPrice: '₹2,200',
    priceNum: 1650,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1614179689702-355944cd0918?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.8,
    reviews: 178,
    category: 'Bags',
    color: 'Multicolor',
    tag: 'POPULAR',
    description: 'Authentic hand-blocked Ajrakh printed cotton tote with embroidered borders, tassel charm, and durable cotton web straps.',
    details: [
      { name: 'Fabric', value: '100% Handblock Ajrakh Cotton' },
      { name: 'Craft', value: 'Natural Indigo & Madder Dyes' }
    ]
  },
  {
    id: 5,
    name: 'NOOR MINAUDIÈRE CLUTCH',
    subtitle: 'Rose Gold Pearl Box Clutch',
    price: '₹4,999',
    originalPrice: '₹6,500',
    priceNum: 4999,
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1614179689702-355944cd0918?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 5.0,
    reviews: 189,
    category: 'Bags',
    color: 'Pink',
    tag: 'BRIDAL FAVOURITE',
    description: 'A showstopping hard-case box clutch encased in blush rose-gold metallic casing with hand-set crystal floral studs. Includes a detachable antique sling chain.',
    details: [
      { name: 'Shell', value: 'Hard Frame with Velvet Lining' },
      { name: 'Stones', value: 'Swarovski Crystals & Mother of Pearl' },
      { name: 'Chain', value: 'Detachable 24K Gold Plated Chain' }
    ]
  },
  {
    id: 6,
    name: 'ROYAL ZARDOZI POTLI',
    subtitle: 'Emerald Pearl Tassel Potli',
    price: '₹3,499',
    originalPrice: '₹4,500',
    priceNum: 3499,
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.9,
    reviews: 210,
    category: 'Bags',
    color: 'Green',
    tag: 'HERITAGE',
    description: 'An enchanting royal emerald green silk velvet potli bag featuring hand-stitched Zardozi motifs, heavy pearl latkans, and 24K gold drawstring tassels.',
    details: [
      { name: 'Material', value: 'Plush Silk Velvet & Pure Raw Silk Lining' },
      { name: 'Embroidery', value: 'Hand Zardozi & Dabka Work' },
      { name: 'Hardware', value: 'Antique Gold Pearl Drawstring Tassels' }
    ]
  },
  // KURTIS (Premium Handcrafted Everyday Luxury)
  {
    id: 20,
    name: 'MIRA PINK',
    subtitle: 'Rose Hand-Embroidered Kurta',
    price: '₹4,999',
    priceNum: 4999,
    images: [
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.8,
    reviews: 82,
    category: 'Kurtis',
    color: 'Pink',
    stockPercentage: 90,
    tag: 'NEW ARRIVAL',
    description: 'A masterpiece of everyday luxury, tailored from breathable, premium organic cotton. Features subtle rose-pink hand-embroidered floral motifs along the neckline and sleeves.',
    details: [
      { name: 'Fabric', value: '100% Organic Handloom Cotton' },
      { name: 'Craftsmanship', value: 'Phulkari Hand-Embroidery' },
      { name: 'Fit', value: 'Straight-cut relaxed silhouette' },
      { name: 'Styling', value: 'Pair with neutral ivory palazzos' }
    ]
  },
  {
    id: 21,
    name: 'ZOYA BLUE',
    subtitle: 'Royal Printed Summer Kurti',
    price: '₹3,499',
    priceNum: 3499,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.6,
    reviews: 64,
    category: 'Kurtis',
    color: 'Blue',
    stockPercentage: 70,
    tag: 'BESTSELLER',
    description: 'An elegant long-line Kurti with a rich royal blue base, block printed with premium gold foil accents. Designed to stay comfortable all day while looking exceptionally polished.',
    details: [
      { name: 'Fabric', value: 'Satin Cotton-Silk Blend' },
      { name: 'Print', value: 'Gold Foil Block Print' },
      { name: 'Care', value: 'Gentle hand wash inside out' }
    ]
  },
  {
    id: 22,
    name: 'NOOR PEACH',
    subtitle: 'Lucknowi Chikankari Kurta',
    price: '₹6,999',
    priceNum: 6999,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 5.0,
    reviews: 128,
    category: 'Kurtis',
    color: 'Pink',
    stockPercentage: 45,
    tag: 'EXCLUSIVE',
    description: 'A premium Lucknow georgette kurti in soft pastel peach. Showcases heavy shadow work chikankari hand-sewn by female master artisans, lined with soft premium crepe.',
    details: [
      { name: 'Fabric', value: 'Premium Faux Georgette with Crepe Inner' },
      { name: 'Embroidery', value: 'Heavy Lucknowi Chikankari Shadow Work' },
      { name: 'Origin', value: 'Lucknow, Uttar Pradesh, India' }
    ]
  },
  {
    id: 23,
    name: 'KEYA MINT',
    subtitle: 'Mint Organza Short Kurti',
    price: '₹5,499',
    priceNum: 5499,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.7,
    reviews: 95,
    category: 'Kurtis',
    color: 'Green',
    stockPercentage: 35,
    tag: 'LIMITED',
    description: 'Exquisite lightweight mint-green organza kurti. Designed in a modern, youthful short length, and finished with delicate scalloped lace borders and fine pearl work on the collar.',
    details: [
      { name: 'Fabric', value: 'Fine Sheer Organza' },
      { name: 'Ornamentation', value: 'Scalloped Lace & Freshwater Pearl Work' },
      { name: 'Design', value: 'Short length contemporary tunic' }
    ]
  },
  {
    id: 24,
    name: 'DIYA YELLOW',
    subtitle: 'Canary Mustard Linen Kurta',
    price: '₹3,999',
    priceNum: 3999,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.9,
    reviews: 58,
    category: 'Kurtis',
    color: 'Gold',
    stockPercentage: 80,
    tag: 'POPULAR',
    description: 'Bright and energetic canary yellow linen kurti. Perfect for festive summer days, features delicate white lace paneling and detailed pintucks down the bodice.',
    details: [
      { name: 'Fabric', value: '100% Belgian Flax Linen' },
      { name: 'Detailing', value: 'Handmade Pintucks & Cotton Lace Panels' },
      { name: 'Dyeing', value: 'Organic Azo-Free Mustard Dye' }
    ]
  },
  {
    id: 25,
    name: 'GAURI EMERALD',
    subtitle: 'Emerald Banarasi Short Kurti',
    price: '₹5,999',
    priceNum: 5999,
    images: [
      'https://images.unsplash.com/photo-1610030470298-4086411542a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 5.0,
    reviews: 87,
    category: 'Kurtis',
    color: 'Green',
    stockPercentage: 20,
    tag: 'ROYAL SELECTION',
    description: 'A striking short-length banarasi kurti in majestic emerald green. Features heavy handloom brocade work with pure copper zari, presenting a royal finish that bridges classic and modern styles.',
    details: [
      { name: 'Fabric', value: 'Banarasi Katan Silk Brocade' },
      { name: 'Zari', value: 'Pure Antique Copper Zari' },
      { name: 'Fit', value: 'Structured modern short silhouette' }
    ]
  },

  // CORD SETS (Contemporary Coordinated Luxury)
  {
    id: 30,
    name: 'NOIR ELEGANCE',
    subtitle: 'Black Silk Coord Set',
    price: '₹5,999',
    priceNum: 5999,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.9,
    reviews: 134,
    category: 'Cord Sets',
    color: 'Red',
    stockPercentage: 85,
    tag: 'NEW DROP',
    description: 'A sophisticated black silk coord set featuring a structured crop top with mandarin collar and matching wide-leg trousers. Effortless transition from day brunch to evening soirée.',
    details: [
      { name: 'Top', value: 'Structured Crop with Mandarin Collar' },
      { name: 'Bottom', value: 'Wide-Leg Palazzo Trousers' },
      { name: 'Fabric', value: 'Premium Satin Silk Blend' },
      { name: 'Occasion', value: 'Day to Night Versatile' }
    ]
  },
  {
    id: 31,
    name: 'SAGE BREEZE',
    subtitle: 'Mint Linen Coord Set',
    price: '₹4,499',
    priceNum: 4499,
    images: [
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.7,
    reviews: 89,
    category: 'Cord Sets',
    color: 'Green',
    stockPercentage: 65,
    tag: 'BESTSELLER',
    description: 'A breathable sage-green linen coord set designed for the modern woman. Features a relaxed-fit peplum top with ruffled sleeves and matching ankle-length culottes.',
    details: [
      { name: 'Top', value: 'Relaxed Peplum with Ruffle Sleeves' },
      { name: 'Bottom', value: 'Ankle-Length Culottes' },
      { name: 'Fabric', value: '100% European Flax Linen' },
      { name: 'Care', value: 'Machine Wash Cold, Line Dry' }
    ]
  },
  {
    id: 32,
    name: 'ROSEWOOD',
    subtitle: 'Blush Embroidered Set',
    price: '₹7,499',
    priceNum: 7499,
    images: [
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 5.0,
    reviews: 76,
    category: 'Cord Sets',
    color: 'Pink',
    stockPercentage: 30,
    tag: 'EXCLUSIVE',
    description: 'A luxurious blush-pink coord set with heavy hand-embroidered floral motifs on the bodice. The top features a sweetheart neckline and the skirt has a structured A-line silhouette.',
    details: [
      { name: 'Top', value: 'Sweetheart Neckline Embroidered Bodice' },
      { name: 'Bottom', value: 'Structured A-Line Midi Skirt' },
      { name: 'Embroidery', value: 'Resham Thread & Mirror Work' },
      { name: 'Occasion', value: 'Festive & Wedding Guest' }
    ]
  },
  {
    id: 33,
    name: 'COBALT RUSH',
    subtitle: 'Royal Blue Power Set',
    price: '₹5,499',
    priceNum: 5499,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.8,
    reviews: 112,
    category: 'Cord Sets',
    color: 'Blue',
    stockPercentage: 55,
    tag: 'TRENDING',
    description: 'A power-dressing royal blue coord set that commands attention. Features a tailored blazer-style top with gold button details and matching high-waisted straight trousers.',
    details: [
      { name: 'Top', value: 'Tailored Blazer Top with Gold Buttons' },
      { name: 'Bottom', value: 'High-Waisted Straight Trousers' },
      { name: 'Fabric', value: 'Premium Crepe Suiting' },
      { name: 'Fit', value: 'Structured Power Silhouette' }
    ]
  },
  {
    id: 34,
    name: 'IVORY DREAM',
    subtitle: 'White Schiffli Coord Set',
    price: '₹3,999',
    priceNum: 3999,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.6,
    reviews: 98,
    category: 'Cord Sets',
    color: 'Gold',
    stockPercentage: 75,
    tag: 'POPULAR',
    description: 'An ethereal white schiffli embroidered coord set perfect for summer. Features a scalloped-hem crop top and matching flared palazzo pants with delicate cutwork detailing.',
    details: [
      { name: 'Top', value: 'Scalloped Hem Schiffli Crop Top' },
      { name: 'Bottom', value: 'Flared Palazzo with Cutwork Border' },
      { name: 'Fabric', value: 'Pure Cotton Schiffli' },
      { name: 'Season', value: 'Spring/Summer Essential' }
    ]
  },
  {
    id: 35,
    name: 'TERRA LUXE',
    subtitle: 'Rust Velvet Coord Set',
    price: '₹6,999',
    priceNum: 6999,
    images: [
      'https://images.unsplash.com/photo-1610030470298-4086411542a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600'
    ],
    rating: 4.9,
    reviews: 67,
    category: 'Cord Sets',
    color: 'Maroon',
    stockPercentage: 20,
    tag: 'LIMITED EDITION',
    description: 'A sumptuous rust-toned velvet coord set for the winter festive season. The wrap-style top features antique gold zari borders and the pencil skirt has a thigh-high slit for drama.',
    details: [
      { name: 'Top', value: 'Wrap-Style Velvet Top with Zari' },
      { name: 'Bottom', value: 'Pencil Skirt with Thigh-High Slit' },
      { name: 'Fabric', value: 'Micro Velvet with Zari Border' },
      { name: 'Season', value: 'Autumn/Winter Festive' }
    ]
  }
];
