import type { DeliveryEstimate } from '../../types/product.types';

interface DeliveryConfidenceProps {
  delivery: DeliveryEstimate;
}

export function DeliveryConfidence({ delivery }: DeliveryConfidenceProps) {
  const [minDays, maxDays] = delivery.estimatedDays;

  return (
    <div className="pt-3 border-t border-gray-100 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Delivery Promise
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
          {delivery.method} Delivery
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-[10px] text-gray-400 font-semibold uppercase block">Estimated Arrival</span>
          <span className="font-bold text-xs text-gray-900">
            {minDays} - {maxDays} Business Days
          </span>
        </div>

        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-[10px] text-gray-400 font-semibold uppercase block">Dispatch SLA</span>
          <span className="font-bold text-xs text-gray-900">
            Ships within {delivery.dispatchWithinHours} hrs
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className="text-gray-600 flex items-center gap-1.5 text-[11px]">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Carrier SLA Reliability
        </span>
        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200 font-mono">
          {delivery.reliabilityPercent}% On-Time
        </span>
      </div>
    </div>
  );
}
