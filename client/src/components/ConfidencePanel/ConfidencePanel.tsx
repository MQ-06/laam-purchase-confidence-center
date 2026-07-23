import { useState } from 'react';
import type { ConfidenceResponse, Size } from '../../types/product.types';
import { ConfidenceScore } from './ConfidenceScore';
import { SizeSelector } from './SizeSelector';
import { PriceBreakdown } from './PriceBreakdown';
import { DeliveryConfidence } from './DeliveryConfidence';
import { SellerTrustBadge } from './SellerTrustBadge';
import { AlternativesList } from './AlternativesList';

interface ConfidencePanelProps {
  data: ConfidenceResponse;
  onSelectSize: (size: Size) => void;
  currency?: 'USD' | 'PKR';
}

export function ConfidencePanel({ data, onSelectSize, currency = 'USD' }: ConfidencePanelProps) {
  const [addedToBag, setAddedToBag] = useState(false);

  const selectedSizeInfo = data.sizes.find((s) => s.size === data.selectedSize);
  const isOutOfStock = selectedSizeInfo?.status === 'out_of_stock';
  const allSizesOutOfStock = data.sizes.every((s) => s.status === 'out_of_stock');

  const handleAddToBag = () => {
    if (isOutOfStock) return;
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2500);
  };

  const formatPrice = (amountUsd: number) => {
    if (currency === 'PKR') {
      const pkrAmount = Math.round(amountUsd * 280);
      return `Rs. ${pkrAmount.toLocaleString('en-PK')}`;
    }
    return `$ ${amountUsd.toFixed(2)}`;
  };

  const { product } = data;

  return (
    <div className="bg-[#FDFBF7] rounded-3xl border border-[#ECE6DA] p-6 space-y-5 shadow-xs text-gray-900">
      {/* 1. Product Title & Price Header */}
      <div className="space-y-2 pb-4 border-b border-[#ECE6DA]">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#B89355] block">
          {product.brand.name}
        </span>
        <h1 className="font-serif font-bold text-3xl text-gray-900 tracking-tight leading-snug">
          {product.title}
        </h1>

        {/* Price Display */}
        <div className="flex items-baseline gap-3 pt-1">
          <span className="font-mono font-bold text-2xl text-gray-900">
            {formatPrice(data.pricing.total)}
          </span>
          {data.pricing.discountPercent > 0 && (
            <span className="text-sm text-gray-400 line-through font-mono">
              {formatPrice(data.pricing.basePrice)}
            </span>
          )}
          {data.pricing.discountPercent > 0 && (
            <span className="bg-[#18181B] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              -{data.pricing.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-2 text-xs pt-1">
          <div className="flex items-center text-[#B89355]">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="font-mono font-bold text-gray-900">{product.brand.rating}</span>
          <span className="text-gray-500 text-xs">({product.brand.reviewCount} verified reviews)</span>
        </div>
      </div>

      {/* All Sizes Out of Stock Banner */}
      {allSizesOutOfStock && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong>Product Currently Unavailable:</strong> All sizes for this item are out of stock. Check matched alternatives below.
          </div>
        </div>
      )}

      {/* 2. Purchase Confidence Score Gauge */}
      <ConfidenceScore confidence={data.confidence} />

      {/* 3. Interactive Size Selector */}
      <SizeSelector
        sizes={data.sizes}
        selectedSize={data.selectedSize}
        onSelectSize={onSelectSize}
      />

      {/* 4. Primary CTA Button */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleAddToBag}
          disabled={isOutOfStock}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs tracking-[0.12em] uppercase transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
            isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
              : addedToBag
              ? 'bg-emerald-700 text-white'
              : 'bg-[#18181B] text-white hover:bg-black active:scale-[0.99] hover:shadow-md'
          }`}
        >
          {isOutOfStock ? (
            <>
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
              Size {data.selectedSize || ''} Out of Stock
            </>
          ) : addedToBag ? (
            <>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added to Bag!
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-[#B89355]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Add to Bag &bull; Size {data.selectedSize}
            </>
          )}
        </button>

        {isOutOfStock && (
          <p className="text-[11px] text-center text-red-600 font-semibold">
            Please choose another size or check recommended alternatives below.
          </p>
        )}
      </div>

      {/* 5. Smart Alternatives Strip (Renders ONLY when out of stock) */}
      {isOutOfStock && data.alternatives && (
        <AlternativesList alternatives={data.alternatives} selectedSize={data.selectedSize} />
      )}

      {/* 6. Integrated Signals */}
      <div className="space-y-4 pt-1">
        <PriceBreakdown pricing={data.pricing} currency={currency} />
        <DeliveryConfidence delivery={data.delivery} />
        <SellerTrustBadge seller={data.product.brand} returnEligible={data.product.returnEligible} />
      </div>
    </div>
  );
}
