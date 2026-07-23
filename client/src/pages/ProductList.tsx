import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { ProductListItem } from '../types/product.types';

interface ProductListProps {
  currency?: 'USD' | 'PKR';
}

export function ProductList({ currency = 'USD' }: ProductListProps) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await apiClient.get<ProductListItem[]>('/products');
        setProducts(data);
      } catch (err) {
        setError('Failed to fetch product catalog.');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const formatPrice = (amountUsd: number) => {
    if (currency === 'PKR') {
      const pkrAmount = Math.round(amountUsd * 280);
      return `Rs. ${pkrAmount.toLocaleString('en-PK')}`;
    }
    return `$ ${amountUsd.toFixed(2)}`;
  };

  // Mock confidence scores for browse view cards
  const mockConfidenceScores: Record<string, { score: number; label: string }> = {
    'prod-001': { score: 96, label: 'High Confidence' },
    'prod-002': { score: 88, label: 'High Confidence' },
    'prod-003': { score: 90, label: 'High Confidence' },
    'prod-004': { score: 92, label: 'High Confidence' },
    'prod-005': { score: 85, label: 'High Confidence' },
    'prod-006': { score: 48, label: 'Limited Stock' },
    'prod-007': { score: 82, label: 'Good Confidence' },
    'prod-008': { score: 94, label: 'High Confidence' },
  };

  const categories = [
    'All',
    'Maxi',
    'Pishwas',
    'Kaftan',
    'Sharara',
    'Lehenga',
    'Co Ord Sets',
    'Gharara',
    'Angrakha',
    'Anarkali',
    'Kurti',
    'Wrap',
    'Saree',
    'Gown',
    'Khussa',
    'Heels',
    'Sandals',
  ];

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-3 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold uppercase tracking-wider">Loading LAAM Catalog…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 inline-block text-xs font-medium">
          {error}
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    const catStr = p.category as string;
    if (selectedCategory === 'Khussa' || selectedCategory === 'Footwear' || selectedCategory === 'Heels' || selectedCategory === 'Sandals') {
      return catStr === 'Footwear' || catStr === selectedCategory;
    }
    return catStr === selectedCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header & Item Count ── */}
      <div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-gray-900 tracking-tight">
          Kurta Set & Designer Collections
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          {filteredProducts.length * 382 + 30588} Items available &bull; Powered by Purchase Confidence Center
        </p>
      </div>

      {/* ── Scrollable Category Pills Bar ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                : 'bg-gray-100/80 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Filter Controls Bar ── */}
      <div className="flex flex-wrap items-center gap-2 text-xs py-2 border-y border-gray-200">
        <button className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>

        <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
          <span>Sort By</span>
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* In-stock toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-medium">
          <span>In-stock</span>
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
              inStockOnly ? 'bg-black' : 'bg-gray-300'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${
                inStockOnly ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {['Fabric', 'Price', 'Size', 'Color', 'Brands', 'Season'].map((f) => (
          <button key={f} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
            <span>{f}</span>
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ))}
      </div>

      {/* ── 4-Column Product Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((p) => {
          const discountedPrice = p.price * (1 - p.discountPercent / 100);
          const confidence = mockConfidenceScores[p.id] || { score: 90, label: 'High Confidence' };

          return (
            <div key={p.id} className="group bg-white rounded-2xl border border-gray-200 p-3 shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between">
              <div>
                {/* Image Container */}
                <div className="aspect-[3/4] w-full bg-gray-100 rounded-xl relative overflow-hidden mb-3">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/1.webp';
                    }}
                  />

                  {/* Top Left: Discount Tag (-40%) */}
                  {p.discountPercent > 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-gray-950 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
                      -{p.discountPercent}%
                    </span>
                  )}

                  {/* Top Right: Live Purchase Confidence Score Pill Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md border border-emerald-400/40 flex items-center gap-1">
                    <svg className="w-3 h-3 text-emerald-400 fill-current" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.681-.056-1.35-.166-2A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
                    </svg>
                    <span className="font-mono">{confidence.score} Score</span>
                  </div>

                  {/* Bottom Right: Quick View Icon */}
                  <Link
                    to={`/product/${p.id}`}
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-all no-underline"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </Link>
                </div>

                {/* Price Display (Clean Black/Dark Gray) */}
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-900 font-black text-base font-mono">
                    {formatPrice(discountedPrice)}
                  </span>
                  {p.discountPercent > 0 && (
                    <span className="text-xs text-gray-400 line-through font-mono">
                      {formatPrice(p.price)}
                    </span>
                  )}
                </div>

                {/* Brand Name • Product Name */}
                <Link to={`/product/${p.id}`} className="no-underline text-inherit block mt-1">
                  <h3 className="text-xs font-medium text-gray-800 line-clamp-1 group-hover:text-black transition-colors">
                    <strong className="font-bold text-gray-900">{p.brandName}</strong> • {p.title}
                  </h3>
                </Link>

                {/* Rating Badge */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
                    <svg className="w-3 h-3 text-amber-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>4.4 (12 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Prominent High-Impact Feature Button */}
              <Link
                to={`/product/${p.id}`}
                className="mt-3.5 py-2.5 px-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl text-center transition-all no-underline flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md"
              >
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Inspect Purchase Confidence</span>
                <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
