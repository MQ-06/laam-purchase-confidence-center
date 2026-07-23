interface SellerTrustBadgeProps {
  seller: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
  };
  returnEligible: boolean;
}

export function SellerTrustBadge({ seller, returnEligible }: SellerTrustBadgeProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    return (
      <div className="flex items-center text-amber-400">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${
              i < fullStars
                ? 'fill-amber-400'
                : i === fullStars && hasHalf
                ? 'fill-amber-300'
                : 'fill-gray-200'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="pt-3 border-t border-gray-100 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Seller & Guarantee
        </span>
        {seller.verified ? (
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1">
            <svg className="w-3 h-3 text-blue-600 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified Partner
          </span>
        ) : (
          <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">
            Emerging Partner
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-xs">
        <div>
          <span className="font-semibold text-gray-900 text-xs block">
            {seller.name}
          </span>
          {seller.reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              {renderStars(seller.rating)}
              <span className="font-mono font-bold text-gray-900 text-[11px]">{seller.rating}</span>
              <span className="text-gray-400 text-[11px]">({seller.reviewCount} reviews)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-0.5 text-gray-400 text-[11px]">
              <span>New Seller • No reviews yet</span>
            </div>
          )}
        </div>

        <div>
          {returnEligible ? (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200 inline-block">
              ✓ 7-Day Easy Returns
            </span>
          ) : (
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200 inline-block">
              ⚠ Final Sale (No Returns)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
