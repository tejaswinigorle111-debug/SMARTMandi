import React from 'react';
import { CheckCircle2, Clock, Truck, CreditCard, Box, MapPin } from 'lucide-react';

interface TrackingTimelineProps {
  order?: { id: number; status: string; created_at: string; payment_status?: string; shipment_status?: string };
  payment?: { amount: number; status: string; created_at: string };
  logistic?: { status: string; scheduled_pickup_at?: string | null; last_location_at?: string | null };
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ order, payment, logistic }) => {
  if (!order) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
        <p className="text-sm font-bold text-stone-500">No active order or transaction data available yet.</p>
      </div>
    );
  }

  // Determine active steps based on order and logistic status
  const steps = [
    { id: 'created', label: 'Order Confirmed', description: `Order #${order.id} placed`, icon: Box, active: true, completed: true },
    { id: 'pickup', label: 'Scheduled Pickup', description: logistic?.scheduled_pickup_at ? new Date(logistic.scheduled_pickup_at).toLocaleString() : 'Pending schedule', icon: MapPin, active: !!logistic, completed: logistic?.status === 'IN_TRANSIT' || logistic?.status === 'DELIVERED' },
    { id: 'transit', label: 'In Transit', description: logistic?.last_location_at ? `Last update: ${new Date(logistic.last_location_at).toLocaleTimeString()}` : 'Awaiting dispatch', icon: Truck, active: logistic?.status === 'IN_TRANSIT' || logistic?.status === 'DELIVERED', completed: logistic?.status === 'DELIVERED' },
    { id: 'delivered', label: 'Delivered', description: 'Goods received by buyer', icon: CheckCircle2, active: logistic?.status === 'DELIVERED' || order.status === 'DELIVERED', completed: logistic?.status === 'DELIVERED' || order.status === 'DELIVERED' },
    { id: 'payment', label: 'Payment Status', description: payment ? `${payment.status} - ₹${payment.amount}` : order.payment_status || 'Pending', icon: CreditCard, active: !!payment || order.payment_status === 'COMPLETED', completed: payment?.status === 'COMPLETED' || order.payment_status === 'COMPLETED' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 relative overflow-hidden">
      <h3 className="text-xl font-black text-stone-900 mb-6">Transaction & Logistics Tracking</h3>
      
      <div className="relative border-l-2 border-stone-200 ml-4 space-y-8 pb-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="relative pl-6">
              <span className={`absolute -left-[17px] flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-sm ${step.completed ? 'bg-[#165B33] text-white' : step.active ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-500'}`}>
                {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </span>
              <div>
                <h4 className={`text-base font-black ${step.active || step.completed ? 'text-stone-900' : 'text-stone-400'}`}>
                  {step.label}
                </h4>
                <p className={`text-sm font-bold mt-0.5 ${step.active || step.completed ? 'text-stone-600' : 'text-stone-400'}`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Grievance Action */}
      {(order.status === 'DELIVERED' || payment?.status === 'COMPLETED') && (
        <div className="mt-6 pt-5 border-t border-stone-200 flex justify-between items-center bg-stone-50 p-4 rounded-xl">
          <div>
            <span className="block text-sm font-black text-stone-800">Need help with this transaction?</span>
            <span className="text-xs font-bold text-stone-500">You can raise a grievance within 7 days of delivery.</span>
          </div>
          <button type="button" className="text-sm font-black text-rose-700 bg-rose-50 border border-rose-200 px-4 py-2 rounded-lg hover:bg-rose-100 transition-colors">
            Raise Grievance
          </button>
        </div>
      )}
    </div>
  );
};
