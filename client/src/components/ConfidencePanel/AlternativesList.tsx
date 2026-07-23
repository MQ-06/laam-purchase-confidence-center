import { Link } from 'react-router-dom';
import type { AlternativeProduct } from '../../types/product.types';

interface AlternativesListProps {
  alternatives: AlternativeProduct[];
  selectedSize?: string | null;
}

export function AlternativesList({ alternatives, selectedSize }: AlternativesListProps) {
  if (!alternatives || alternatives.length === 0) {
    return (
      <div className="bg-surface-card rounded-xl p-5 border border-border-light shadow-card text-center text-xs text-text-muted">
        No direct alternatives found for this specific size right now.
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `Rs. ${Math.round(amount).toLocaleString('en-PK')}`;
  };

  return (
    <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/70 shadow-card space-y-3 animate-fade-in">
      <div className="flex items-center gap-2 pb-2 border-b border-amber-200/50">
        <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Recommended In-Stock Alternatives
          </h4>
          <p className="text-[11px] text-amber-800">
            Size {selectedSize || ''} is sold out on this design. Check these comparable options:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {alternatives.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className="group bg-surface-card rounded-lg p-2.5 border border-border-light hover:border-primary hover:shadow-md transition-all no-underline text-inherit flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[4/3] w-full bg-gray-100 rounded-md overflow-hidden mb-2 relative">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/1.webp';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-[10px] text-text-muted">
                    No Image
                  </div>
                )}
                {item.inStock && (
                  <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow">
                    In Stock
                  </span>
                )}
              </div>

              <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider block">
                {item.brandName}
              </span>
              <h5 className="font-display font-medium text-xs text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                {item.title}
              </h5>
            </div>

            <div className="mt-2 pt-2 border-t border-border-light flex justify-between items-center text-xs">
              <span className="font-bold font-mono text-primary">
                {formatCurrency(item.price)}
              </span>
              <span className="text-[10px] font-medium text-primary hover:underline">
                View &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
