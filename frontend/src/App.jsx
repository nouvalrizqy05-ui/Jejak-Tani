import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BottomNav from './components/BottomNav.jsx';
import AccessibilityMenu from './components/AccessibilityMenu.jsx';

import Home from './pages/Home.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import TracePublic from './pages/TracePublic.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import PetaniDashboard from './pages/PetaniDashboard.jsx';
import Akun from './pages/Akun.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import HargaReferensi from './pages/HargaReferensi.jsx';
import JadiMitra from './pages/JadiMitra.jsx';
import NotFound from './pages/NotFound.jsx';
import RuteOptimasi from './pages/RuteOptimasi.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-white md:bg-stone-100 selection:bg-teal-200 selection:text-teal-900 flex flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full md:max-w-7xl md:mx-auto md:bg-white md:shadow-xl pb-20 md:pb-8">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produk/:id" element={<ProductDetail />} />
            <Route path="/trace/:id" element={<TracePublic />} />
            <Route path="/harga" element={<HargaReferensi />} />
            <Route path="/jadi-mitra" element={<JadiMitra />} />
            <Route path="/masuk" element={<Login />} />
            <Route path="/daftar" element={<Register />} />

            <Route path="/keranjang" element={
              <ProtectedRoute roles={['buyer']}><Cart /></ProtectedRoute>
            } />
            <Route path="/akun/*" element={
              <ProtectedRoute roles={['buyer']}><Akun /></ProtectedRoute>
            } />
            <Route path="/petani" element={
              <ProtectedRoute roles={['petani']}><PetaniDashboard /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/rute" element={
              <ProtectedRoute roles={['admin']}><RuteOptimasi /></ProtectedRoute>
            } />

          </Routes>
      </main>
      
      {/* Footer bisa dikembalikan jika dibutuhkan untuk desktop */}
      <div className="hidden md:block">
        <Footer />
      </div>
      
      <div className="md:hidden">
        <BottomNav />
      </div>
      <AccessibilityMenu />
    </div>
  );
}
