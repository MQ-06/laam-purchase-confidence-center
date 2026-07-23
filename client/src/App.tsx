import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

function MainLayout() {
  const [currency, setCurrency] = useState<'USD' | 'PKR'>('USD');
  const [womenOpen, setWomenOpen] = useState(true);
  const location = useLocation();

  const isDetailPage = location.pathname.startsWith('/product/');

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-body antialiased">
      {/* ── Top Announcement Bar (No Emojis) ── */}
      <div className="bg-black text-white text-[11px] font-semibold py-1.5 px-4 text-center tracking-wider flex items-center justify-center gap-2">
        <span>Flat $39 Shipping! | Duties & Customs Included | T&C Apply</span>
      </div>

      {/* ── Main Sticky Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
              <img
                src="/Laam-Logo.jpg"
                alt="LAAM Official Logo"
                className="h-14 sm:h-14 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
            </Link>

            {/* Central Search Bar with Dropdown */}
            <div className="flex-1 max-w-2xl hidden md:flex items-center bg-gray-100/80 rounded-lg border border-gray-200 focus-within:border-black focus-within:bg-white transition-all overflow-hidden">
              <button className="px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 border-r border-gray-200 flex items-center gap-1 cursor-pointer">
                All
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="flex-1 flex items-center px-3 gap-2">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder='Search for "embroidered pashmina shawl"'
                  className="w-full bg-transparent text-xs py-2 outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Right Utility Bar (Currency with SVG Globe icon, Share, Bag) */}
            <div className="flex items-center gap-4 text-xs font-medium shrink-0">
              {/* Deliver To / Currency Picker */}
              <button
                onClick={() => setCurrency(currency === 'USD' ? 'PKR' : 'USD')}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 cursor-pointer bg-white"
              >
                <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V7a2 2 0 00-2-2h-1.5a.5.5 0 01-.5-.5V3.935M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
                <div className="text-left text-[10px] leading-tight">
                  <span className="text-gray-400 block font-normal">Deliver To / Currency</span>
                  <span className="font-bold text-gray-900">{currency === 'USD' ? 'US / USD' : 'PK / PKR'}</span>
                </div>
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Share Icon */}
              <button className="p-2 text-gray-600 hover:text-black transition-colors rounded-full hover:bg-gray-100 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>

              {/* Shopping Bag Icon */}
              <button className="p-2 text-gray-600 hover:text-black transition-colors relative rounded-full hover:bg-gray-100 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute top-1 right-1 bg-gray-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Layout Body ── */}
      <div className="flex-1 max-w-[1500px] w-full mx-auto flex">
        {/* Left Sidebar Navigation */}
        {!isDetailPage && (
          <aside className="w-56 shrink-0 border-r border-gray-200 py-6 px-4 hidden lg:block text-xs text-gray-700">
            <ul className="space-y-4 font-medium">
              <li>
                <Link to="/" className="text-gray-900 font-bold hover:text-black no-underline">
                  All
                </Link>
              </li>
              <li>
                <span className="hover:text-black cursor-pointer">New In</span>
              </li>

              {/* Accordion: Women */}
              <li>
                <button
                  onClick={() => setWomenOpen(!womenOpen)}
                  className="w-full flex justify-between items-center text-gray-900 font-bold hover:text-black cursor-pointer"
                >
                  <span>Women</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${womenOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {womenOpen && (
                  <ul className="mt-2.5 ml-3 space-y-2.5 text-gray-600 font-normal">
                    <li className="hover:text-black cursor-pointer">Clothing</li>
                    <li className="hover:text-black cursor-pointer">Accessories</li>
                    <li className="hover:text-black cursor-pointer">Footwear</li>
                    <li className="hover:text-black cursor-pointer">Lingerie and Sleepwear</li>
                  </ul>
                )}
              </li>

              <li className="flex justify-between items-center hover:text-black cursor-pointer">
                <span>Men</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </li>
              <li className="flex justify-between items-center hover:text-black cursor-pointer">
                <span>Beauty</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </li>
              <li className="flex justify-between items-center hover:text-black cursor-pointer">
                <span>Kids</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </li>
              <li className="pt-2 hover:text-black cursor-pointer">West</li>
              <li className="hover:text-black cursor-pointer">Jewellery</li>
              <li className="hover:text-black cursor-pointer">Brands</li>
              <li className="hover:text-black cursor-pointer">Top Curations</li>
              <li className="pt-2 hover:text-black cursor-pointer">Orders</li>
              <li className="hover:text-black cursor-pointer">Rewards</li>
            </ul>
          </aside>
        )}

        {/* Content Region */}
        <main className="flex-1 py-6 px-4 sm:px-6">
          <Routes>
            <Route path="/" element={<ProductList currency={currency} />} />
            <Route path="/product/:id" element={<ProductDetail currency={currency} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
