import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout/Layout';
import Spinner from './components/ui/Spinner/Spinner';
import Home from './pages/Home/Home';

// Faqet ngarkohen sipas nevojës (code-splitting) për shpejtësi më të mirë – edhe për SEO
const Shop = lazy(() => import('./pages/Shop/Shop'));
const Product = lazy(() => import('./pages/Product/Product'));
const Cart = lazy(() => import('./pages/Cart/Cart'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess/OrderSuccess'));
const CustomOrder = lazy(() => import('./pages/CustomOrder/CustomOrder'));
const About = lazy(() => import('./pages/About/About'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

// Admin – paketë e veçantë, nuk ngarkohet fare për klientët
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute/ProtectedRoute'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/Login/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders/Orders'));
const AdminProducts = lazy(() => import('./pages/admin/Products/Products'));
const AdminCategories = lazy(() => import('./pages/admin/Categories/Categories'));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dyqani" element={<Shop />} />
          <Route path="kategori/:slug" element={<Shop />} />
          <Route path="produkt/:slug" element={<Product />} />
          <Route path="shporta" element={<Cart />} />
          <Route path="porosia" element={<Checkout />} />
          <Route path="porosia/sukses" element={<OrderSuccess />} />
          <Route path="porosi-e-personalizuar" element={<CustomOrder />} />
          <Route path="rreth-nesh" element={<About />} />
          <Route path="kontakt" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin/hyrje" element={<AdminLogin />} />
        <Route path="admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="porosite" element={<AdminOrders />} />
          <Route path="produktet" element={<AdminProducts />} />
          <Route path="kategorite" element={<AdminCategories />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
