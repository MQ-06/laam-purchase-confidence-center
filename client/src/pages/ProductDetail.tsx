import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductConfidence } from '../hooks/useProductConfidence';
import { ConfidencePanel } from '../components/ConfidencePanel/ConfidencePanel';

interface ProductDetailProps {
  currency?: 'USD' | 'PKR';
}

export function ProductDetail({ currency = 'USD' }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const productId = id || 'prod-001';

  const { data, loading, error, setSelectedSize } = useProductConfidence(productId);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold uppercase tracking-wider">Calculating Purchase Confidence & Availability SLA…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 space-y-4">
          <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="font-serif font-bold text-2xl text-red-900">Product Not Found</h2>
          <p className="text-xs text-red-700 max-w-md mx-auto">
            {error || 'The requested product could not be loaded from LAAM servers.'}
          </p>
          <Link
            to="/"
            className="inline-block bg-black text-white font-semibold text-xs px-5 py-2.5 rounded-xl no-underline hover:bg-gray-800 transition-colors"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const { product } = data;
  const currentImage = product.images[selectedImageIndex] || product.images[0];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <Link to="/" className="hover:text-black transition-colors no-underline">
          Home
        </Link>
        <span>/</span>
        <span className="hover:text-black cursor-pointer">{product.category}</span>
        <span>/</span>
        <span className="text-gray-900 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Gallery & Specifications (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Hero Product Image */}
          <div className="aspect-[3/4] w-full bg-gray-50 rounded-3xl overflow-hidden border border-[#ECE6DA] shadow-xs relative">
            <img
              src={currentImage}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/1.webp';
              }}
            />
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 justify-center">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx ? 'border-black shadow-xs scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Product Specifications & Fabric Details */}
          <div className="bg-[#FDFBF7] rounded-3xl p-6 border border-[#ECE6DA] shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#B89355]">
              Product Fabric & Craft Specifications
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(product.attributes).map(([key, val]) => (
                <div key={key} className="bg-white/80 p-3.5 rounded-2xl border border-[#ECE6DA]">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    {key}
                  </span>
                  <span className="text-xs font-bold text-gray-900 block mt-0.5">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Single Unified Nude & Black Buy Box (6 cols) */}
        <div className="lg:col-span-6 lg:sticky lg:top-20">
          <ConfidencePanel data={data} onSelectSize={setSelectedSize} currency={currency} />
        </div>
      </div>
    </div>
  );
}
