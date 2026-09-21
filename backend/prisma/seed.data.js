/**
 * Launch content for a fresh database.
 *
 * These are the products and page copy the storefront was designed around, so
 * a newly provisioned environment looks exactly like the design instead of an
 * empty shell. Everything here is editable from the admin area afterwards.
 *
 * Prices are in paise.
 */

export const categories = [
  {
    slug: 'bags',
    name: 'Tote Bags',
    headline: 'Tote Bags & Accessories',
    description: 'Zardozi hand-embroidered clutches, velvet potlis and antique brass totes.',
    position: 0,
  },
  {
    slug: 'suits',
    name: 'Suits',
    headline: 'Exclusive Suits',
    description: 'Exclusive tailored silhouettes crafted in small batches.',
    position: 1,
  },
  {
    slug: 'kurtis',
    name: 'Kurtis',
    headline: 'Bespoke Kurtis',
    description: 'Handloom traditions, hand-drafted and dyed in custom hues.',
    position: 2,
  },
  {
    slug: 'cord-sets',
    name: 'Cord Sets',
    headline: 'Premium Cord Sets',
    description: 'Coordinated, curated, contemporary — tops and bottoms in perfect harmony.',
    position: 3,
  },
];

export const products = [
  /* ------------------------------------------------------------------ suits */
  {
    sku: 'KES-SUI-MIRA-SAGE',
    name: 'MIRA',
    subtitle: 'Sage Silk Anarkali',
    categorySlug: 'suits',
    price: 1499900,
    color: 'Green',
    tag: 'LIMITED',
    featured: true,
    inventory: { quantity: 41, capacity: 50 },
    description:
      'Hand-crafted with meticulous craftsmanship and tailored to convey elegance and grace. Features a flowing sage-silk body with fine traditional zari borders, paired with a matching georgette dupatta.',
    details: [
      { name: 'Fabric', value: '100% Pure Sage Silk' },
      { name: 'Embroidery', value: 'Fine Gold Zari & Zardozi' },
      { name: 'Include', value: 'Anarkali Kameez, Churidar & Dupatta' },
      { name: 'Care', value: 'Dry Clean Only' },
    ],
    images: [
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-SUI-MIRA-DUSTY',
    name: 'MIRA',
    subtitle: 'Dusty Silk Anarkali',
    categorySlug: 'suits',
    price: 1649900,
    color: 'Pink',
    tag: 'FEW PIECES LEFT',
    featured: true,
    inventory: { quantity: 30, capacity: 40 },
    description:
      'Crafted with premium intricate embroidery and unique Indian tailoring. The dusty rose hue gives it a gorgeous, understated luxury feel that is perfect for premium daytime events.',
    details: [
      { name: 'Fabric', value: 'Pure Banarasi Silk' },
      { name: 'Embroidery', value: 'Handmade Tilla Work' },
      { name: 'Include', value: 'Gherdar Anarkali, Churidar Pants & Dupatta' },
      { name: 'Origin', value: 'Lucknow, India' },
    ],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-SUI-MIIRA-LOVE',
    name: 'MIIRA',
    subtitle: 'Love Silk Anarkali',
    categorySlug: 'suits',
    price: 1899900,
    color: 'Purple',
    tag: 'FEW PIECES LEFT',
    inventory: { quantity: 5, capacity: 20 },
    description:
      'An exclusive masterpiece hand-dyed in soft royal lavender tones. Features rich, heavy zardozi hand embroidery on the neckline and a majestic flare. Extremely limited production.',
    details: [
      { name: 'Fabric', value: 'Premium Chanderi Silk' },
      { name: 'Embroidery', value: 'Heavy Neck & Border Zardozi' },
      { name: 'Include', value: 'Flared Kameez, Pants & Heavy Dupatta' },
      { name: 'Care', value: 'Dry Clean Only (Protect metal threads)' },
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-SUI-INDIGO',
    name: 'INDIGO',
    subtitle: 'Silk Anarkali',
    categorySlug: 'suits',
    price: 1599900,
    color: 'Blue',
    tag: 'EXCLUSIVE',
    inventory: { quantity: 10, capacity: 25 },
    description:
      'Bespoke deep indigo blue suit with signature silver embroidery details around the collar and sleeves. Inspired by royal court wear, this suit balances classic heritage with modern comfort.',
    details: [
      { name: 'Fabric', value: '100% Organza Silk Blend' },
      { name: 'Embroidery', value: 'Fine Silver Gota Patti' },
      { name: 'Coloring', value: 'Natural Indigo Vegetable Dye' },
      { name: 'Include', value: 'Anarkali Kurta & Dupatta Set' },
    ],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },

  /* ------------------------------------------------------------------- bags */
  {
    sku: 'KES-BAG-MEENAKARI',
    name: 'MEENAKARI BRASS TOTE',
    subtitle: 'Antique Brass Handle Velvet Tote',
    categorySlug: 'bags',
    price: 899900,
    salePrice: 649900,
    color: 'Maroon',
    tag: 'ROYAL TOTE',
    featured: true,
    inventory: { quantity: 18, capacity: 25 },
    description:
      'A majestic deep burgundy velvet tote bag topped with hand-engraved solid brass handles depicting traditional Indian peacock motifs. Designed for luxury enthusiasts who appreciate artisanal brassware and spacious everyday elegance.',
    details: [
      { name: 'Body', value: '9000 Micro Velvet' },
      { name: 'Handles', value: '100% Solid Brass Hand Engraved' },
      { name: 'Interior', value: 'Zippered Compartments & Card Slots' },
    ],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-BAG-GULABI',
    name: 'GULABI',
    subtitle: 'BLOCK PRINT TOTE',
    categorySlug: 'bags',
    price: 210000,
    salePrice: 145000,
    color: 'Red',
    tag: 'BESTSELLER',
    featured: true,
    inventory: { quantity: 46, capacity: 60 },
    description:
      'An elegant raw silk tote featuring intricate gold threadwork along the border, reinforced leatherette handles, and spacious compartments for tablet, cosmetics, and day-to-night essentials.',
    details: [
      { name: 'Material', value: '100% Chanderi Raw Silk & Vegan Leather' },
      { name: 'Work', value: 'Golden Zari & Marodi Threadwork' },
      { name: 'Handles', value: 'Double Shoulder Strap' },
    ],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-BAG-NOOR-ZARI',
    name: 'NOOR',
    subtitle: 'ZARI EMBROIDERED TOTE',
    categorySlug: 'bags',
    price: 260000,
    salePrice: 189000,
    color: 'Gold',
    tag: 'NEW',
    inventory: { quantity: 22, capacity: 30 },
    description:
      'A dazzling champagne gold structured tote bag embellished with real glass mirrorwork and gota patti trim. Lightweight, sturdy, and highly reflective under event lighting.',
    details: [
      { name: 'Base', value: 'Metallic Woven Tissue Canvas' },
      { name: 'Work', value: 'Real Mirror Work & Gota Patti' },
      { name: 'Strap', value: 'Reinforced Shoulder Straps' },
    ],
    images: [
      'https://images.unsplash.com/photo-1594223274512-ad480274d954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1614179689702-355944cd0918?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-BAG-RANI-AJRAKH',
    name: 'RANI',
    subtitle: 'AJRAKH PRINT TOTE',
    categorySlug: 'bags',
    price: 220000,
    salePrice: 165000,
    color: 'Multicolor',
    tag: 'POPULAR',
    inventory: { quantity: 34, capacity: 40 },
    description:
      'Authentic hand-blocked Ajrakh printed cotton tote with embroidered borders, tassel charm, and durable cotton web straps.',
    details: [
      { name: 'Fabric', value: '100% Handblock Ajrakh Cotton' },
      { name: 'Craft', value: 'Natural Indigo & Madder Dyes' },
    ],
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1614179689702-355944cd0918?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-BAG-NOOR-CLUTCH',
    name: 'NOOR MINAUDIERE CLUTCH',
    subtitle: 'Rose Gold Pearl Box Clutch',
    categorySlug: 'bags',
    price: 650000,
    salePrice: 499900,
    color: 'Pink',
    tag: 'BRIDAL FAVOURITE',
    inventory: { quantity: 12, capacity: 20 },
    description:
      'A showstopping hard-case box clutch encased in blush rose-gold metallic casing with hand-set crystal floral studs. Includes a detachable antique sling chain.',
    details: [
      { name: 'Shell', value: 'Hard Frame with Velvet Lining' },
      { name: 'Stones', value: 'Swarovski Crystals & Mother of Pearl' },
      { name: 'Chain', value: 'Detachable 24K Gold Plated Chain' },
    ],
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1614179689702-355944cd0918?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-BAG-ZARDOZI-POTLI',
    name: 'ROYAL ZARDOZI POTLI',
    subtitle: 'Emerald Pearl Tassel Potli',
    categorySlug: 'bags',
    price: 450000,
    salePrice: 349900,
    color: 'Green',
    tag: 'HERITAGE',
    inventory: { quantity: 26, capacity: 35 },
    description:
      'An enchanting royal emerald green silk velvet potli bag featuring hand-stitched Zardozi motifs, heavy pearl latkans, and 24K gold drawstring tassels.',
    details: [
      { name: 'Material', value: 'Plush Silk Velvet & Pure Raw Silk Lining' },
      { name: 'Embroidery', value: 'Hand Zardozi & Dabka Work' },
      { name: 'Hardware', value: 'Antique Gold Pearl Drawstring Tassels' },
    ],
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },

  /* ----------------------------------------------------------------- kurtis */
  {
    sku: 'KES-KUR-MIRA-PINK',
    name: 'MIRA PINK',
    subtitle: 'Rose Hand-Embroidered Kurta',
    categorySlug: 'kurtis',
    price: 499900,
    color: 'Pink',
    tag: 'NEW ARRIVAL',
    featured: true,
    inventory: { quantity: 45, capacity: 50 },
    description:
      'A masterpiece of everyday luxury, tailored from breathable, premium organic cotton. Features subtle rose-pink hand-embroidered floral motifs along the neckline and sleeves.',
    details: [
      { name: 'Fabric', value: '100% Organic Handloom Cotton' },
      { name: 'Craftsmanship', value: 'Phulkari Hand-Embroidery' },
      { name: 'Fit', value: 'Straight-cut relaxed silhouette' },
      { name: 'Styling', value: 'Pair with neutral ivory palazzos' },
    ],
    images: [
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-KUR-ZOYA-BLUE',
    name: 'ZOYA BLUE',
    subtitle: 'Royal Printed Summer Kurti',
    categorySlug: 'kurtis',
    price: 349900,
    color: 'Blue',
    tag: 'BESTSELLER',
    featured: true,
    inventory: { quantity: 35, capacity: 50 },
    description:
      'An elegant long-line Kurti with a rich royal blue base, block printed with premium gold foil accents. Designed to stay comfortable all day while looking exceptionally polished.',
    details: [
      { name: 'Fabric', value: 'Satin Cotton-Silk Blend' },
      { name: 'Print', value: 'Gold Foil Block Print' },
      { name: 'Care', value: 'Gentle hand wash inside out' },
    ],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-KUR-NOOR-PEACH',
    name: 'NOOR PEACH',
    subtitle: 'Lucknowi Chikankari Kurta',
    categorySlug: 'kurtis',
    price: 699900,
    color: 'Pink',
    tag: 'EXCLUSIVE',
    inventory: { quantity: 18, capacity: 40 },
    description:
      'A premium Lucknow georgette kurti in soft pastel peach. Showcases heavy shadow work chikankari hand-sewn by female master artisans, lined with soft premium crepe.',
    details: [
      { name: 'Fabric', value: 'Premium Faux Georgette with Crepe Inner' },
      { name: 'Embroidery', value: 'Heavy Lucknowi Chikankari Shadow Work' },
      { name: 'Origin', value: 'Lucknow, Uttar Pradesh, India' },
    ],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-KUR-KEYA-MINT',
    name: 'KEYA MINT',
    subtitle: 'Mint Organza Short Kurti',
    categorySlug: 'kurtis',
    price: 549900,
    color: 'Green',
    tag: 'LIMITED',
    inventory: { quantity: 11, capacity: 30 },
    description:
      'Exquisite lightweight mint-green organza kurti. Designed in a modern, youthful short length, and finished with delicate scalloped lace borders and fine pearl work on the collar.',
    details: [
      { name: 'Fabric', value: 'Fine Sheer Organza' },
      { name: 'Ornamentation', value: 'Scalloped Lace & Freshwater Pearl Work' },
      { name: 'Design', value: 'Short length contemporary tunic' },
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-KUR-DIYA-YELLOW',
    name: 'DIYA YELLOW',
    subtitle: 'Canary Mustard Linen Kurta',
    categorySlug: 'kurtis',
    price: 399900,
    color: 'Gold',
    tag: 'POPULAR',
    inventory: { quantity: 32, capacity: 40 },
    description:
      'Bright and energetic canary yellow linen kurti. Perfect for festive summer days, features delicate white lace paneling and detailed pintucks down the bodice.',
    details: [
      { name: 'Fabric', value: '100% Belgian Flax Linen' },
      { name: 'Detailing', value: 'Handmade Pintucks & Cotton Lace Panels' },
      { name: 'Dyeing', value: 'Organic Azo-Free Mustard Dye' },
    ],
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-KUR-GAURI-EMERALD',
    name: 'GAURI EMERALD',
    subtitle: 'Emerald Banarasi Short Kurti',
    categorySlug: 'kurtis',
    price: 599900,
    color: 'Green',
    tag: 'ROYAL SELECTION',
    inventory: { quantity: 6, capacity: 30 },
    description:
      'A striking short-length banarasi kurti in majestic emerald green. Features heavy handloom brocade work with pure copper zari, presenting a royal finish that bridges classic and modern styles.',
    details: [
      { name: 'Fabric', value: 'Banarasi Katan Silk Brocade' },
      { name: 'Zari', value: 'Pure Antique Copper Zari' },
      { name: 'Fit', value: 'Structured modern short silhouette' },
    ],
    images: [
      'https://images.unsplash.com/photo-1610030470298-4086411542a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },

  /* -------------------------------------------------------------- cord sets */
  {
    sku: 'KES-CRD-NOIR',
    name: 'NOIR ELEGANCE',
    subtitle: 'Black Silk Coord Set',
    categorySlug: 'cord-sets',
    price: 599900,
    color: 'Red',
    tag: 'NEW DROP',
    featured: true,
    inventory: { quantity: 34, capacity: 40 },
    description:
      'A sophisticated black silk coord set featuring a structured crop top with mandarin collar and matching wide-leg trousers. Effortless transition from day brunch to evening soiree.',
    details: [
      { name: 'Top', value: 'Structured Crop with Mandarin Collar' },
      { name: 'Bottom', value: 'Wide-Leg Palazzo Trousers' },
      { name: 'Fabric', value: 'Premium Satin Silk Blend' },
      { name: 'Occasion', value: 'Day to Night Versatile' },
    ],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-CRD-SAGE',
    name: 'SAGE BREEZE',
    subtitle: 'Mint Linen Coord Set',
    categorySlug: 'cord-sets',
    price: 449900,
    color: 'Green',
    tag: 'BESTSELLER',
    featured: true,
    inventory: { quantity: 26, capacity: 40 },
    description:
      'A breathable sage-green linen coord set designed for the modern woman. Features a relaxed-fit peplum top with ruffled sleeves and matching ankle-length culottes.',
    details: [
      { name: 'Top', value: 'Relaxed Peplum with Ruffle Sleeves' },
      { name: 'Bottom', value: 'Ankle-Length Culottes' },
      { name: 'Fabric', value: '100% European Flax Linen' },
      { name: 'Care', value: 'Machine Wash Cold, Line Dry' },
    ],
    images: [
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-CRD-ROSEWOOD',
    name: 'ROSEWOOD',
    subtitle: 'Blush Embroidered Set',
    categorySlug: 'cord-sets',
    price: 749900,
    color: 'Pink',
    tag: 'EXCLUSIVE',
    inventory: { quantity: 9, capacity: 30 },
    description:
      'A luxurious blush-pink coord set with heavy hand-embroidered floral motifs on the bodice. The top features a sweetheart neckline and the skirt has a structured A-line silhouette.',
    details: [
      { name: 'Top', value: 'Sweetheart Neckline Embroidered Bodice' },
      { name: 'Bottom', value: 'Structured A-Line Midi Skirt' },
      { name: 'Embroidery', value: 'Resham Thread & Mirror Work' },
      { name: 'Occasion', value: 'Festive & Wedding Guest' },
    ],
    images: [
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-CRD-COBALT',
    name: 'COBALT RUSH',
    subtitle: 'Royal Blue Power Set',
    categorySlug: 'cord-sets',
    price: 549900,
    color: 'Blue',
    tag: 'TRENDING',
    inventory: { quantity: 22, capacity: 40 },
    description:
      'A power-dressing royal blue coord set that commands attention. Features a tailored blazer-style top with gold button details and matching high-waisted straight trousers.',
    details: [
      { name: 'Top', value: 'Tailored Blazer Top with Gold Buttons' },
      { name: 'Bottom', value: 'High-Waisted Straight Trousers' },
      { name: 'Fabric', value: 'Premium Crepe Suiting' },
      { name: 'Fit', value: 'Structured Power Silhouette' },
    ],
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1610030469668-93535c17b6b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-CRD-IVORY',
    name: 'IVORY DREAM',
    subtitle: 'White Schiffli Coord Set',
    categorySlug: 'cord-sets',
    price: 399900,
    color: 'Gold',
    tag: 'POPULAR',
    inventory: { quantity: 30, capacity: 40 },
    description:
      'An ethereal white schiffli embroidered coord set perfect for summer. Features a scalloped-hem crop top and matching flared palazzo pants with delicate cutwork detailing.',
    details: [
      { name: 'Top', value: 'Scalloped Hem Schiffli Crop Top' },
      { name: 'Bottom', value: 'Flared Palazzo with Cutwork Border' },
      { name: 'Fabric', value: 'Pure Cotton Schiffli' },
      { name: 'Season', value: 'Spring/Summer Essential' },
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
  {
    sku: 'KES-CRD-TERRA',
    name: 'TERRA LUXE',
    subtitle: 'Rust Velvet Coord Set',
    categorySlug: 'cord-sets',
    price: 699900,
    color: 'Maroon',
    tag: 'LIMITED EDITION',
    inventory: { quantity: 6, capacity: 30 },
    description:
      'A sumptuous rust-toned velvet coord set for the winter festive season. The wrap-style top features antique gold zari borders and the pencil skirt has a thigh-high slit for drama.',
    details: [
      { name: 'Top', value: 'Wrap-Style Velvet Top with Zari' },
      { name: 'Bottom', value: 'Pencil Skirt with Thigh-High Slit' },
      { name: 'Fabric', value: 'Micro Velvet with Zari Border' },
      { name: 'Season', value: 'Autumn/Winter Festive' },
    ],
    images: [
      'https://images.unsplash.com/photo-1610030470298-4086411542a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
    ],
  },
];

export const coupons = [
  {
    code: 'KABEER20',
    description: 'Membership privilege: 20% off a first kurti, capped at INR 2,000.',
    discountType: 'PERCENTAGE',
    value: 20,
    minOrderValue: 300000,
    maxDiscount: 200000,
    perUserLimit: 1,
    active: true,
  },
];

const UNSPLASH = 'https://images.unsplash.com';

export const pages = [
  {
    slug: 'home',
    title: 'Home',
    description: 'Kabeer The Ethnic Store — timeless elegance, crafted legacy in every thread.',
    sections: [
      {
        key: 'hero',
        type: 'hero',
        data: {
          eyebrow: '',
          title: 'Kabeer',
          subtitle: 'Timeless Elegance',
          tagline: 'Crafting Legacy in Every Thread',
          imageUrl:
            'https://www.westside.com/cdn/shop/articles/eid_ethnic_wear_for_women.jpg?v=1650963225',
        },
      },
      {
        key: 'categories',
        type: 'categoryCarousel',
        data: {
          title: 'Our',
          titleAccent: 'Collections',
          description: 'Explore our curated selection of traditional Indian wear',
          items: [
            {
              name: 'Silk Sarees',
              description: 'Timeless elegance in pure silk',
              imageUrl: `${UNSPLASH}/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop',
            },
            {
              name: 'Bridal Lehengas',
              description: 'Royal dreams for your special day',
              imageUrl: `${UNSPLASH}/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop',
            },
            {
              name: 'Anarkali Suits',
              description: 'Graceful comfort meets style',
              imageUrl: `${UNSPLASH}/photo-1759840278862-ef629e9b0f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop?category=suits',
            },
            {
              name: 'Designer Kurtis',
              description: 'Everyday ethnic fashion',
              imageUrl: `${UNSPLASH}/photo-1769063382706-8156b3b33eac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop?category=kurtis',
            },
            {
              name: 'Banarasi Sarees',
              description: 'Heritage weaves from Banaras',
              imageUrl: `${UNSPLASH}/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop',
            },
            {
              name: 'Party Wear Gowns',
              description: 'Glamorous evenings await',
              imageUrl: `${UNSPLASH}/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop',
            },
            {
              name: 'Sharara Sets',
              description: 'Flowy elegance for celebrations',
              imageUrl: `${UNSPLASH}/photo-1759840278862-ef629e9b0f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop?category=cord-sets',
            },
            {
              name: 'Palazzo Suits',
              description: 'Contemporary fusion wear',
              imageUrl: `${UNSPLASH}/photo-1769063382706-8156b3b33eac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop?category=suits',
            },
            {
              name: 'Indo-Western',
              description: 'Best of both worlds',
              imageUrl: `${UNSPLASH}/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop?category=cord-sets',
            },
            {
              name: 'Festive Collection',
              description: 'Celebrate in style',
              imageUrl: `${UNSPLASH}/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`,
              href: '/shop',
            },
          ],
        },
      },
      {
        key: 'featured',
        type: 'featuredCollection',
        data: {
          titleAccent: 'Featured',
          title: 'Collection',
          description: 'Handpicked pieces that define elegance and celebrate your special moments',
          ctaLabel: 'View All Products',
          ctaHref: '/shop',
          limit: 8,
        },
      },
      {
        key: 'about',
        type: 'aboutSlides',
        data: {
          slides: [
            {
              videoUrl: 'https://cdn.pixabay.com/video/2020/06/18/42439-431738756_large.mp4',
              title: 'Where Tradition Meets',
              highlight: 'Elegance',
              description:
                'At Kabeer The Ethnic Store, we believe in celebrating the rich heritage of Indian craftsmanship. Each piece in our collection tells a story of tradition, artistry, and timeless beauty that transcends generations.',
              stats: [
                { icon: 'users', value: '50K+', label: 'Happy Customers' },
                { icon: 'sparkles', value: '1000+', label: 'Unique Designs' },
                { icon: 'award', value: '15+', label: 'Years of Excellence' },
                { icon: 'heart', value: '98%', label: 'Customer Satisfaction' },
              ],
            },
            {
              videoUrl: 'https://cdn.pixabay.com/video/2020/06/18/42438-431738752_large.mp4',
              title: 'Crafted With',
              highlight: 'Passion',
              description:
                'From handwoven sarees to intricately embroidered lehengas, every garment is a masterpiece. Our artisans pour generations of skill into each stitch, creating ethnic wear that empowers women to embrace their cultural roots.',
              stats: [
                { icon: 'sparkles', value: '200+', label: 'Artisan Partners' },
                { icon: 'award', value: '12', label: 'States Covered' },
                { icon: 'users', value: '5K+', label: 'Wholesale Clients' },
                { icon: 'heart', value: '100%', label: 'Authentic Fabrics' },
              ],
            },
            {
              videoUrl: 'https://cdn.pixabay.com/video/2020/07/03/43699-436797154_large.mp4',
              title: 'Delivering',
              highlight: 'Excellence',
              description:
                'We are committed to providing an exceptional shopping experience. With a vast network spanning across India, we ensure timely delivery and unmatched quality for every B2B order, making us the preferred choice for retailers nationwide.',
              stats: [
                { icon: 'award', value: '500+', label: 'Cities Delivered' },
                { icon: 'sparkles', value: '48hrs', label: 'Avg Dispatch Time' },
                { icon: 'users', value: '99.5%', label: 'Order Accuracy' },
                { icon: 'heart', value: '24/7', label: 'Support Available' },
              ],
            },
          ],
        },
      },
      {
        key: 'journey',
        type: 'exhibitions',
        data: {
          titlePrefix: 'Our',
          titleAccent: 'Journey',
          titleSuffix: 'of Excellence',
          description:
            'Milestones that shaped Kabeer The Ethnic Store into a name retailers across India trust.',
          items: [
            {
              image: `${UNSPLASH}/photo-1540575467063-178a50c2df87?w=1200&q=80`,
              title: 'India International Trade Fair',
              subtitle: 'Best Exhibitor Award',
              location: 'Pragati Maidan, New Delhi',
              year: '2025',
              description:
                'Kabeer The Ethnic Store was honored with the Best Exhibitor Award at IITF 2025, showcasing over 500 handcrafted ethnic designs to a global audience of 2 million visitors.',
              animation: 'zoomIn',
            },
            {
              image: `${UNSPLASH}/photo-1591115765373-5207764f72e7?w=1200&q=80`,
              title: 'Lakme Fashion Week',
              subtitle: 'Featured Collection Showcase',
              location: 'Jio World Centre, Mumbai',
              year: '2024',
              description:
                'Our exclusive Banarasi Heritage line graced the runway at LFW 2024, earning praise from leading fashion critics and establishing Kabeer as a bridge between traditional craftsmanship and contemporary design.',
              animation: 'panLeft',
            },
            {
              image: `${UNSPLASH}/photo-1505373877841-8d25f7d46678?w=1200&q=80`,
              title: 'National Handloom Expo',
              subtitle: 'Excellence in Craftsmanship',
              location: 'HITEX, Hyderabad',
              year: '2024',
              description:
                "Recognized for our commitment to preserving India's handloom heritage, we partnered with over 200 weaver families to bring authentic regional textiles to the national stage.",
              animation: 'panRight',
            },
            {
              image: `${UNSPLASH}/photo-1475721027785-f74eccf877e2?w=1200&q=80`,
              title: 'Global Textile Conclave',
              subtitle: 'Entrepreneur of the Year',
              location: 'BICC, Gandhinagar',
              year: '2023',
              description:
                'Our founder was awarded Entrepreneur of the Year for revolutionizing B2B ethnic wear distribution, connecting rural artisans with retailers across 500+ cities in India.',
              animation: 'zoomOut',
            },
          ],
        },
      },
      {
        key: 'newsletter',
        type: 'newsletter',
        data: {
          title: 'Stay Connected with',
          titleAccent: 'Kabeer',
          description:
            'Subscribe to our newsletter and get 15% off on your first order. Be the first to know about new arrivals and exclusive collections.',
          buttonLabel: 'Subscribe',
          note: 'We respect your privacy. Unsubscribe anytime.',
        },
      },
    ],
  },
  {
    slug: 'shop-bags',
    title: 'Tote Bags & Accessories Atelier',
    description: 'Zardozi hand-embroidered clutches, velvet potlis, and antique brass totes.',
    sections: [
      {
        key: 'hero',
        type: 'bagsHero',
        data: {
          eyebrow: 'KABEER ETHNIC ACCESSORIES',
          title: 'Tote Bags & Accessories Atelier',
          subtitle: 'Zardozi hand-embroidered clutches, velvet potlis, and antique brass totes',
          imageUrl:
            'https://media.cntraveller.com/photos/66ec1ad1dadfca083f595603/4:3/w_2240,h_1680,c_limit/This%20is%20London%27s%20surprising%20it-girl%20bag%20for%20the%20autumn-sept24-getty.jpg',
        },
      },
      {
        key: 'craft',
        type: 'pullQuote',
        data: {
          eyebrow: 'OUR CRAFT',
          quote:
            'Every print is pressed by hand. Every thread carries a prayer. We make bags for women who carry beauty — not just belongings.',
          attribution: '— THE ARTISANS OF KABEER',
        },
      },
      {
        // PLACEHOLDER customer words, shipped so the page renders as designed.
        // They are not real reviews — replace them from the admin before
        // launch. See the production checklist in the root README.
        key: 'testimonials',
        type: 'testimonials',
        data: {
          eyebrow: 'CUSTOMER WORDS',
          items: [
            {
              quote:
                '"I wore this tote with my bandhani kurta and received so many compliments. The block print is exquisite — more beautiful in person."',
              name: 'Priya Menon',
              location: 'Mumbai',
              avatarUrl: `${UNSPLASH}/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=120`,
              rating: 5,
            },
            {
              quote:
                '"Finally a tote that feels made for ethnic wear. The zari stitching is stunning. Ordered two — one for Diwali, one to gift my sister."',
              name: 'Ananya Sharma',
              location: 'Jaipur',
              avatarUrl: `${UNSPLASH}/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=120`,
              rating: 5,
            },
            {
              quote:
                '"The quality exceeds the price. Canvas is thick, handles are reinforced, and the print does not fade. Absolutely love it."',
              name: 'Meera Raghunathan',
              location: 'Bengaluru',
              avatarUrl: `${UNSPLASH}/photo-1517841905240-472988babdf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=120`,
              rating: 5,
            },
          ],
        },
      },
    ],
  },
  /*
   * Store policies. These are ordinary CMS pages so the owner edits them in the
   * same place as everything else, and the storefront renders them at
   * /policies/<name>. The shipped text is a STARTING POINT, not legal advice —
   * review it against your own terms before launch.
   */
  {
    slug: 'policy-terms',
    title: 'Terms of Service',
    description: 'The terms you agree to when you shop with Kabeer.',
    sections: [
      {
        key: 'body',
        type: 'richText',
        data: {
          title: 'Terms of',
          titleAccent: 'Service',
          body: 'By placing an order with Kabeer The Ethnic Store you agree to these terms. Prices are shown in Indian rupees and include applicable taxes unless stated otherwise. We may correct pricing errors and decline or cancel an order at our discretion, refunding anything already paid. Products are handmade in small batches, so slight variation in colour, weave and finish is a characteristic of the craft rather than a defect. Replace this text with your own terms before launch.',
        },
      },
    ],
  },
  {
    slug: 'policy-privacy',
    title: 'Privacy Policy',
    description: 'What we collect, why, and what we do with it.',
    sections: [
      {
        key: 'body',
        type: 'richText',
        data: {
          title: 'Privacy',
          titleAccent: 'Policy',
          body: 'We collect only what we need to run the shop: your name, email address, phone number and delivery address, and a record of your orders. Payment card details are handled entirely by our payment provider and never reach our servers. We do not sell your data. You can ask us to correct or delete your account by raising an issue from your account page. Replace this text with your own policy before launch.',
        },
      },
    ],
  },
  {
    slug: 'policy-refunds',
    title: 'Refunds & Returns',
    description: 'How returns, exchanges and refunds work.',
    sections: [
      {
        key: 'body',
        type: 'richText',
        data: {
          title: 'Refunds &',
          titleAccent: 'Returns',
          body: 'Tell us within 7 days of delivery if something is not right and we will arrange a return or exchange. Items must be unworn, unwashed and in their original packaging with tags attached. Refunds are issued to the original payment method once the piece is back with us, usually within 7 working days. Made-to-measure and altered pieces cannot be returned unless they are faulty. Replace this text with your own policy before launch.',
        },
      },
    ],
  },
  {
    slug: 'policy-shipping',
    title: 'Shipping Policy',
    description: 'Dispatch times, delivery and charges.',
    sections: [
      {
        key: 'body',
        type: 'richText',
        data: {
          title: 'Shipping',
          titleAccent: 'Policy',
          body: 'Orders are dispatched within 2 to 3 working days. Delivery usually takes a further 3 to 7 working days depending on your location. You will receive an email when your payment is confirmed and again when your order is on its way. Shipping charges, where they apply, are shown at checkout before you pay. Replace this text with your own policy before launch.',
        },
      },
    ],
  },
  {
    slug: 'shop-suits',
    title: 'Exclusive Suits',
    description: 'Echos of elegance — limited suits, tailored in small batches.',
    sections: [
      {
        key: 'hero',
        type: 'suitsHero',
        data: {
          eyebrow: 'ARIA BOUTIQUE',
          title: 'ECHOS OF ELEGANCE | LIMITED SUITS.',
          subtitle:
            'Exclusive tailored silhouettes crafted in small batches for women of unique taste.',
          // Blank keeps the hand-selected artwork that ships with the lookbook.
          imageUrl: '',
        },
      },
    ],
  },
  {
    slug: 'shop-kurtis',
    title: 'Bespoke Kurtis',
    description: "Celebrating India's rich handloom traditions.",
    sections: [
      {
        key: 'hero',
        type: 'kurtisHero',
        data: {
          eyebrow: 'Kabeer Boutique Exclusive',
          title: 'Bespoke',
          titleAccent: 'Kurtis',
          quote:
            "Celebrating India's rich handloom traditions. Every Kurti in our collection is hand-drafted, dyed in custom hues, and designed to convey elegance in daily luxury.",
          promoBadge: 'Privilege Savings',
          promoTitle: 'Enjoy 20% Off Your First Kurti',
          promoDescription: 'Apply exclusive membership privilege code at checkout.',
          promoCode: 'KABEER20',
          leftPanel: {
            label: 'Lace & Silks',
            title: 'THE PINK EDIT',
            imageUrl: `${UNSPLASH}/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000`,
          },
          centerPanel: {
            label: 'Lucknowi Craft',
            title: 'THE GEORGETTE EDIT',
            imageUrl: `${UNSPLASH}/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000`,
          },
          rightPanel: {
            label: 'Printed Luxury',
            title: 'THE ROYAL EDIT',
            imageUrl: `${UNSPLASH}/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000`,
          },
        },
      },
    ],
  },
  {
    slug: 'shop-cord-sets',
    title: 'Premium Cord Sets',
    description: 'Coordinated. Curated. Contemporary.',
    sections: [
      {
        key: 'hero',
        type: 'cordSetsHero',
        data: {
          badge: "SS'26 Collection",
          eyebrow: 'New Category',
          title: 'CORD',
          titleAccent: 'SETS',
          tagline: 'Coordinated. Curated. Contemporary.',
          taglineMuted: 'Where tops meet bottoms in perfect harmony.',
          ctaLabel: 'Explore Collection',
          // Blank keeps the hand-selected artwork that ships with the lookbook.
          imageUrl: '',
          marquee: [
            'CORD SETS',
            'COORDINATED LUXURY',
            'HANDCRAFTED',
            'KABEER BOUTIQUE',
            'NEW ARRIVALS',
            "SS'26",
            'CURATED PAIRS',
            'PREMIUM FABRICS',
          ],
          stats: [
            { value: '6', label: 'Styles', accent: false },
            { value: 'INR 3.9k', label: 'Starting', accent: false },
            { value: 'NEW', label: 'Season', accent: true },
          ],
        },
      },
    ],
  },
];
