import type { SizeAvailability, Size } from '../../types/product.types';

interface SizeSelectorProps {
  sizes: SizeAvailability[];
  selectedSize: Size | null;
  onSelectSize: (size: Size) => void;
}

export function SizeSelector({ sizes, selectedSize, onSelectSize }: SizeSelectorProps) {
  const currentSizeObj = sizes.find((s) => s.size === selectedSize);

  let stockSummary = null;
  if (currentSizeObj) {
    if (currentSizeObj.status === 'out_of_stock') {
      stockSummary = <span className="text-red-500 font-semibold text-xs">Out of Stock</span>;
    } else if (currentSizeObj.status === 'low_stock') {
      stockSummary = <span className="text-amber-700 font-semibold text-xs">Only {currentSizeObj.stock} left in stock</span>;
    } else {
      stockSummary = <span className="text-emerald-700 font-semibold text-xs">In Stock & Ready to Ship</span>;
    }
  }

  return (
    <div className="space-y-3">
      {/* Header: Label + Selected Size & Live Stock Status */}
      <div className="flex justify-between items-baseline text-xs">
        <label className="font-bold uppercase tracking-widest text-gray-500 text-[10px]">
          Select Size
        </label>
        {selectedSize && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-gray-600">
              Selected: <strong className="text-gray-900 font-bold uppercase">{selectedSize}</strong>
            </span>
            <span>&bull;</span>
            {stockSummary}
          </div>
        )}
      </div>

      {/* Minimalist Aesthetic Size Pills Grid */}
      <div className="grid grid-cols-5 gap-2.5">
        {sizes.map((s) => {
          const isSelected = selectedSize === s.size;
          const isOutOfStock = s.status === 'out_of_stock';

          return (
            <button
              key={s.size}
              onClick={() => onSelectSize(s.size)}
              disabled={isOutOfStock}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center relative ${
                isSelected
                  ? 'bg-black text-white border-2 border-black shadow-md scale-[1.02]'
                  : isOutOfStock
                  ? 'bg-gray-100/70 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50 line-through'
                  : 'bg-white border border-[#E2DDD3] text-gray-900 hover:border-black hover:bg-gray-50 shadow-2xs'
              }`}
            >
              <span>{s.size}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
