import type { PricingSummary } from '../../types/product.types';

interface PriceBreakdownProps {
  pricing: PricingSummary;
  currency?: 'USD' | 'PKR';
}

export function PriceBreakdown({ pricing, currency = 'USD' }: PriceBreakdownProps) {
  const formatPrice = (amountUsd: number) => {
    if (currency === 'PKR') {
      const pkrAmount = Math.round(amountUsd * 280);
      return `Rs. ${pkrAmount.toLocaleString('en-PK')}`;
    }
    return `$ ${amountUsd.toFixed(2)}`;
  };

  return (
    <div className="pt-3 border-t border-gray-100 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Transparent Price Calculation
        </span>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
          No Hidden Charges
        </span>
      </div>

      {pricing.discountExpired && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <strong>Discount Expired:</strong> Promotional price period ended. Standard pricing applies.
          </div>
        </div>
      )}

      <div className="space-y-1.5 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Base Item Price</span>
          <span className="font-mono text-gray-900">{formatPrice(pricing.basePrice)}</span>
        </div>

        {pricing.discountPercent > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>
              Discount ({pricing.discountPercent}%)
              {pricing.discountExpired && <span className="line-through text-gray-400 ml-1">(Expired)</span>}
            </span>
            <span className="font-mono font-medium">
              -{formatPrice(pricing.discountAmount)}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Shipping Fee</span>
          <span className="font-mono text-gray-900">
            {pricing.shippingCost === 0 ? (
              <span className="text-emerald-600 font-semibold uppercase">Free</span>
            ) : (
              formatPrice(pricing.shippingCost)
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Estimated Tax (GST 5%)</span>
          <span className="font-mono text-gray-900">{formatPrice(pricing.tax)}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Final Payable Total
        </span>
        <span className="font-mono font-bold text-base text-gray-900">
          {formatPrice(pricing.total)}
        </span>
      </div>
    </div>
  );
}
