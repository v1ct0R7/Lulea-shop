// Gjeneron data/seed.json – ekzekuto: node utils/makeSeed.mjs
import fs from 'node:fs';
import crypto from 'node:crypto';
const id = () => crypto.randomUUID();
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const cats = [
  { name: 'Buqeta', accent: '#c98b8b', description: 'Buqeta të punuara me dorë për çdo moment – nga romantike te pranverore.', types: ['Romantike', 'Pranverore', 'Pastel', 'Minimaliste'] },
  { name: 'Trëndafila', accent: '#b5535b', description: 'Trëndafila të freskët ekuadorianë dhe vendas, në ngjyra klasike dhe të rralla.', types: ['Të kuq', 'Të bardhë', 'Rozë', 'Trëndafila të përjetshëm'] },
  { name: 'Kuti me Lule', accent: '#8f7a6b', description: 'Kuti elegante luksoze me lule, ideale si dhuratë.', types: ['Kuti të rrumbullakëta', 'Kuti zemër', 'Kuti me çokollata'] },
  { name: 'Bimë Shtëpie', accent: '#7f9774', description: 'Bimë dekorative në saksi që sjellin jetë në shtëpi dhe zyrë.', types: ['Orkide', 'Sukulente', 'Bimë të gjelbra'] },
  { name: 'Dasma & Nuse', accent: '#c7b299', description: 'Buqeta nusesh, dekor tavolinash dhe aranzhime për ditën tuaj të veçantë.', types: ['Buqeta nuseje', 'Lule për krushqit', 'Dekor tavoline'] },
  { name: 'Ngushëllime', accent: '#8a8f99', description: 'Kurora dhe aranzhime me respekt për momentet e vështira.', types: ['Kurora', 'Aranzhime', 'Buqeta ngushëllimi'] },
];
const categories = cats.map((c, i) => ({
  id: id(), slug: slug(c.name.replace('ë', 'e')), name: c.name, description: c.description,
  image: '', accent: c.accent, order: i + 1, types: c.types.map((t) => ({ id: id(), name: t })),
}));
const C = Object.fromEntries(categories.map((c) => [c.name, c]));
const T = (cat, type) => C[cat].types.find((t) => t.name === type).id;

const raw = [
  ['Buqeta “Dashuri e Butë”', 'Buqeta', 'Romantike', 45, 55, true, 'Trëndafila rozë, eustoma dhe gjethe eukalipti, të mbështjella në letër kraft krem.'],
  ['Buqeta “Mëngjes Pranvere”', 'Buqeta', 'Pranverore', 38, null, true, 'Tulipanë, narcisë dhe zymbylë – freski e pastër pranverore.'],
  ['Buqeta “Re Pastel”', 'Buqeta', 'Pastel', 52, null, false, 'Hortensia, trëndafila spray dhe lisianthus në tone pastel.'],
  ['Buqeta “Thjeshtësi”', 'Buqeta', 'Minimaliste', 29, null, false, 'Kala të bardha me gjelbërim minimal – eleganca e qetë.'],
  ['25 Trëndafila të Kuq', 'Trëndafila', 'Të kuq', 65, null, true, 'Njëzet e pesë trëndafila të kuq me kërcell të gjatë, simboli klasik i dashurisë.'],
  ['Trëndafila të Bardhë “Pastërti”', 'Trëndafila', 'Të bardhë', 48, null, false, '15 trëndafila të bardhë me gjelbërim të freskët.'],
  ['Trëndafila Rozë “Ëmbëlsi”', 'Trëndafila', 'Rozë', 49, null, false, '15 trëndafila rozë të butë, të lidhur me fjongo mëndafshi.'],
  ['Trëndafil i Përjetshëm në Kupolë', 'Trëndafila', 'Trëndafila të përjetshëm', 59, 69, true, 'Trëndafil i stabilizuar që zgjat deri në 3 vite, nën kupolë xhami.'],
  ['Kuti “Elegancë” e Rrumbullakët', 'Kuti me Lule', 'Kuti të rrumbullakëta', 72, null, true, 'Kuti e zezë kadifeje me trëndafila të kuq të renditur me kujdes.'],
  ['Kuti Zemër “Përgjithmonë”', 'Kuti me Lule', 'Kuti zemër', 85, null, false, 'Kuti në formë zemre me trëndafila rozë dhe të bardhë.'],
  ['Kuti me Lule & Çokollata', 'Kuti me Lule', 'Kuti me çokollata', 79, null, false, 'Kombinim i luleve sezonale me çokollata belge.'],
  ['Orkide e Bardhë Phalaenopsis', 'Bimë Shtëpie', 'Orkide', 34, null, true, 'Orkide me dy degë në saksi qeramike – lehtë për t’u kujdesur.'],
  ['Set Sukulentesh', 'Bimë Shtëpie', 'Sukulente', 22, null, false, 'Tre sukulente në saksi betoni, perfekte për tavolinë pune.'],
  ['Monstera Deliciosa', 'Bimë Shtëpie', 'Bimë të gjelbra', 39, null, false, 'Bimë tropikale me gjethe të mëdha, në saksi dekorative.'],
  ['Buqetë Nuseje “Klasike”', 'Dasma & Nuse', 'Buqeta nuseje', 120, null, false, 'Trëndafila të bardhë, peoni dhe gjelbërim i butë – punuar sipas fustanit tuaj.'],
  ['Kurorë “Kujtim”', 'Ngushëllime', 'Kurora', 95, null, false, 'Kurorë me krizantema të bardha dhe gjelbërim, me shirit mesazhi.'],
];
const now = Date.now();
const products = raw.map(([name, cat, type, price, oldPrice, featured, description], i) => ({
  id: id(), slug: slug(name.replace(/ë/g, 'e').replace(/ç/g, 'c')), name, description, price, oldPrice,
  categoryId: C[cat].id, typeId: T(cat, type), image: '', featured, inStock: true,
  createdAt: new Date(now - i * 3600_000).toISOString(),
}));

const customOptions = {
  flowers: [
    { id: 'rose', name: 'Trëndafil', price: 2.5, colors: ['E kuqe', 'E bardhë', 'Rozë', 'E verdhë', 'Portokalli'] },
    { id: 'tulip', name: 'Tulipan', price: 2, colors: ['E kuqe', 'E bardhë', 'Rozë', 'E verdhë', 'Vjollcë'] },
    { id: 'peony', name: 'Peoni', price: 4.5, colors: ['Rozë', 'E bardhë', 'Koral'] },
    { id: 'lily', name: 'Zambak', price: 3.5, colors: ['E bardhë', 'Rozë', 'Portokalli'] },
    { id: 'gerbera', name: 'Gerbera', price: 1.8, colors: ['E verdhë', 'Portokalli', 'Rozë', 'E kuqe'] },
    { id: 'lisianthus', name: 'Eustoma', price: 2.8, colors: ['E bardhë', 'Vjollcë', 'Rozë'] },
    { id: 'hydrangea', name: 'Hortensia', price: 5, colors: ['Blu', 'E bardhë', 'Rozë'] },
    { id: 'sunflower', name: 'Luledielli', price: 3, colors: ['E verdhë'] },
  ],
  styles: [
    { id: 'classic', name: 'Buqetë klasike', price: 0, description: 'E rrumbullakët dhe e balancuar' },
    { id: 'garden', name: 'Stil kopshti', price: 5, description: 'E lirë, natyrale, me gjelbërim' },
    { id: 'box', name: 'Në kuti', price: 15, description: 'Kuti luksoze kadifeje' },
    { id: 'basket', name: 'Në shportë', price: 12, description: 'Shportë thurur me dorë' },
  ],
  wrappings: [
    { id: 'kraft', name: 'Letër kraft', price: 0 },
    { id: 'cream', name: 'Letër krem mat', price: 2 },
    { id: 'blush', name: 'Rozë pudër', price: 2 },
    { id: 'black', name: 'E zezë elegante', price: 3 },
  ],
  extras: [
    { id: 'eucalyptus', name: 'Gjelbërim eukalipti', price: 4 },
    { id: 'ribbon', name: 'Fjongo mëndafshi', price: 2 },
    { id: 'chocolate', name: 'Çokollata belge', price: 8 },
    { id: 'teddy', name: 'Arush i vogël', price: 10 },
    { id: 'vase', name: 'Vazo qelqi', price: 12 },
  ],
  colorThemes: ['Romantike (të kuqe/rozë)', 'Pastel e butë', 'E bardhë & e gjelbër', 'Të ndezura & gazmore', 'Lëreni floristin të zgjedhë'],
  occasions: ['Ditëlindje', 'Përvjetor', 'Dashuri', 'Urime', 'Faleminderit', 'Ngushëllim', 'Pa arsye'],
  timeSlots: ['09:00 – 12:00', '12:00 – 15:00', '15:00 – 18:00', '18:00 – 21:00'],
};

const settings = {
  shopName: 'Lulea', tagline: 'The Best-Looking Flowers in Town',
  phone: '+383 44 000 000', email: 'info@lulea.com', address: 'Rruga e Luleve 12, Prishtinë',
  hours: 'E Hënë – E Shtunë: 08:00 – 21:00', currency: 'EUR',
  deliveryFee: 3, freeDeliveryFrom: 50, cities: ['Prishtinë', 'Fushë Kosovë', 'Podujevë', 'Lipjan', 'Obiliq', 'Prizren', 'Pejë', 'Gjakovë', 'Ferizaj', 'Gjilan', 'Mitrovicë'],
};

fs.writeFileSync(new URL('../data/seed.json', import.meta.url), JSON.stringify({ settings, categories, products, orders: [], blockedPhones: [], customOptions }, null, 2));
console.log('seed.json u krijua');
