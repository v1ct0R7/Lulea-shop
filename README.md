# 🌸 Lulea – Dyqan Lulesh Online

React (Vite) + Node/Express. Pa login për klientët, admin panel i mbrojtur, pagesë cash në dorëzim,
porosi të personalizuara dhe SEO.

## Nisja

```bash
npm run install:all   # instalon root + server + client
npm run dev           # API në :4000, faqja në http://localhost:5173
```

- Admin: http://localhost:5173/admin  → përdoruesi `admin`, fjalëkalimi `lulea2026`
- **Ndryshoni fjalëkalimin**: kopjoni `server/.env.example` → `server/.env` dhe vendosni vlerat tuaja.

Prodhimi: `npm run build && npm start` – serveri shërben edhe React-in (një port i vetëm, 4000).
Vendosni `SITE_URL=https://domeni-juaj.com` në `.env` që sitemap/robots të kenë URL-në e saktë.

## Docker

Kopjoni `server/.env.example` në `server/.env` dhe vendosni një fjalëkalim admini
(minimumi 10 karaktere) dhe një `TOKEN_SECRET` të rastësishëm (minimumi 32 karaktere;
gjenerojeni me `openssl rand -hex 32`).
Nëse po kaloni nga kontejneri i nisur më parë me `docker run`, hiqeni atë pa
fshirë volumes; të dhënat ruhen:

```bash
docker rm -f lulea
```

Pastaj niseni aplikacionin nga rrënja e projektit:

```bash
docker compose up --build -d
```

Aplikacioni hapet në `http://localhost:4000`. Të dhënat e porosive dhe imazhet
e ngarkuara ruhen në Docker volumes edhe pas rikrijimit të kontejnerit.
Për ta ndalur aplikacionin përdorni `docker compose down`.

## Struktura

```
lulea/
├── client/                      # React (Vite)
│   ├── public/                  # logo.png, manifest
│   └── src/
│       ├── api/                 # client.js (fetch + token), index.js (të gjitha endpoint-et)
│       ├── context/             # ShopContext, CartContext, AuthContext
│       ├── hooks/               # useFetch
│       ├── utils/               # format.js (çmime, data, statuse), seo.js (JSON-LD)
│       ├── styles/              # variables.css (ngjyrat), global.css, admin.css
│       ├── components/
│       │   ├── layout/          # Header, Footer, Layout, AnnouncementBar
│       │   ├── ui/              # Button, Seo, Icon, ProductImage, FloralArt, Spinner, ...
│       │   ├── product/         # ProductCard, ProductGrid
│       │   ├── category/        # CategoryCard
│       │   ├── cart/            # CartLine, OrderSummary
│       │   ├── checkout/        # DeliveryForm (përdoret në checkout + porosi të personalizuar)
│       │   └── admin/           # AdminLayout, Modal, ImageUpload, StatusBadge, ProtectedRoute
│       └── pages/               # Home, Shop, Product, Cart, Checkout, OrderSuccess,
│           │                    # CustomOrder, About, Contact, NotFound
│           └── admin/           # Login, Dashboard, Orders (+OrderDetail), Products, Categories
└── server/                      # Express API
    ├── routes/                  # auth, categories, products, orders, meta (uploads), seo
    ├── middleware/              # auth (token HMAC), upload (multer), errors
    ├── utils/                   # db.js (JSON), helpers.js, makeSeed.mjs
    ├── data/seed.json           # kategoritë, llojet, produktet fillestare, opsionet e personalizimit
    └── uploads/                 # fotot e ngarkuara nga admini
```

Çdo komponent ka folderin e vet me `.jsx` + `.module.css`.

## Rrugët (URL në shqip, të mira për SEO)

`/` · `/dyqani` · `/kategori/:slug?lloji=` · `/produkt/:slug` · `/porosi-e-personalizuar` ·
`/shporta` · `/porosia` · `/rreth-nesh` · `/kontakt` · `/admin`

## SEO
- `react-helmet-async`: title, description, canonical, Open Graph, Twitter për çdo faqe
- JSON-LD: `Florist` (ballina), `Product` + `BreadcrumbList` (produktet/kategoritë)
- `/sitemap.xml` dinamik (përfshin çdo produkt/kategori) dhe `/robots.txt` (bllokon /admin)
- HTML semantik, një H1 për faqe, alt në imazhe, lazy-loading, code-splitting (admini ngarkohet veç)

## Porositë
- Çmimet llogariten **në server** (klienti s’mund t’i ndryshojë).
- Çdo porosi (nga shporta ose e personalizuar) shfaqet në **Admin → Porositë**; paneli kontrollon
  çdo 15 sekonda dhe jep njoftim zanor + toast + njoftim në browser.
- Statuset: E re → Konfirmuar → Në përgatitje → Në dërgesë → Dorëzuar (shënohet automatikisht “Paguar”).
- Opsionet e porosisë së personalizuar (lulet, çmimi për kërcell, ngjyrat, stilet, shtesat, oraret)
  ndryshohen te `server/data/seed.json` → `customOptions`.

## Mbrojtja nga porositë fake
- **Honeypot** – fushë e fshehur në formular; botët e plotësojnë dhe porosia refuzohet.
- **Koha e plotësimit** – formularët e dërguar në më pak se 4 sekonda refuzohen.
- **Validim i telefonit** – 8–15 shifra, jo numra si `000000000`; `044…`, `+383 44…`, `00383…` njihen si i njëjti numër.
- **Kufizime** – max 5 porosi/orë nga e njëjta IP dhe max 3 porosi të hapura për numër telefoni.
- **Historiku i klientit** – në admin çdo porosi shënohet *Klient i ri*, *Klient i njohur* ose *Kujdes* (ka porosi të anuluara).
- **Bllokim numri** – butoni “Blloko numrin” anulon porosinë dhe ndalon porositë online nga ai numër (zhbllokohet nga lista poshtë Porosive).
- Rregull pune: **telefononi çdo klient të ri** dhe kalojeni porosinë në “Konfirmuar” vetëm pasi të përgjigjet.

Kufijtë ndryshohen te `LIMITS` në `server/routes/orders.js`.

> Baza e të dhënave është një skedar JSON (`server/data/db.json`, krijohet automatikisht nga seed).
> Për trafik të madh mund të zëvendësohet me MongoDB/PostgreSQL vetëm te `server/utils/db.js`.
