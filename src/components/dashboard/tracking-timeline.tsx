'use client';

import React from 'react';
import { CheckCircle2, Clock, Truck, Home, AlertCircle, MapPin } from 'lucide-react';
import { GlassCard } from '../ui/glass-card';

export type ShipmentStatus = 'pending' | 'accepted' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface TimelineEvent {
  title: string;
  description: string;
  time: string;
  completed: boolean;
}

interface TrackingTimelineProps {
  orderId: string;
  currentStatus: ShipmentStatus;
  origin: string;
  destination: string;
  driverName: string;
  vehiclePlate: string;
}

const statusMilestones: { status: ShipmentStatus; label: string; icon: any }[] = [
  { status: 'pending', label: 'Order Pending', icon: Clock },
  { status: 'accepted', label: 'Dispatched', icon: CheckCircle2 },
  { status: 'in_transit', label: 'In Transit', icon: Truck },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { status: 'delivered', label: 'Delivered', icon: Home }
];

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  orderId,
  currentStatus,
  origin,
  destination,
  driverName,
  vehiclePlate
}) => {
  const getStatusIndex = (status: ShipmentStatus) => {
    if (status === 'cancelled') return -1;
    return statusMilestones.findIndex(m => m.status === status);
  };

  const currentIndex = getStatusIndex(currentStatus);

  // High-fidelity telemetry logs for the demonstration
  const mockTelemetryLogs: Record<string, TimelineEvent[]> = {
    '#RTX-8801': [
      { title: 'Delivered Confirmation', description: 'Consignment handed over to Tata Steel security gate.', time: 'Today, 10:30 AM', completed: true },
      { title: 'Out For Delivery segment', description: 'Entering Pune Outer Ring Road segment.', time: 'Today, 09:12 AM', completed: true },
      { title: 'Fastag Toll Cleared', description: 'Toll plaza NH-48 paid: ₹240.', time: 'Yesterday, 11:22 PM', completed: true },
      { title: 'AI Rerouting Engaged', description: 'Rerouted via bypass to avoid waterlogging gridlock near Lonavala.', time: 'Yesterday, 08:45 PM', completed: true },
      { title: 'Dispatched from Hub', description: 'Consignment loaded on MH-12-Q-4029 at Jamshedpur works.', time: 'Yesterday, 08:00 AM', completed: true }
    ],
    '#RTX-8803': [
      { title: 'In Transit Telemetry', description: 'Active speed 75 km/h. Fuel telemetry normal.', time: 'Active Now', completed: true },
      { title: 'Fastag Toll Cleared', description: 'Toll plaza NH-4 paid: ₹180.', time: 'Today, 09:15 AM', completed: true },
      { title: 'Driver Safety Check', description: 'Passed safety index review: 85/100.', time: 'Today, 08:30 AM', completed: true },
      { title: 'Dispatched from Hub', description: 'Consignment loaded on KA-05-M-2210 Bangalore.', time: 'Today, 07:15 AM', completed: true }
    ]
  };

  const activeLogs = mockTelemetryLogs[orderId] || [
    { title: 'Tracking Active', description: `Shipment state is currently ${currentStatus.replace('_', ' ')}.`, time: 'Ongoing', completed: true },
    { title: 'Route Registered', description: `Sourcing route from ${origin} to ${destination}.`, time: 'Startup', completed: true }
  ];

  return (
    <GlassCard glowColor="blue" className="space-y-6">
      
      {/* Shipment Header Details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Shipment Timeline</span>
          <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
            <span className="text-blue-400">{orderId}</span>
            {currentStatus === 'cancelled' && (
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-900/30 text-[9px] font-bold">
                CANCELLED
              </span>
            )}
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400 sm:text-right">
          <p>Driver: <span className="text-slate-200">{driverName}</span></p>
          <p>Vehicle: <span className="text-slate-200">{vehiclePlate}</span></p>
        </div>
      </div>

      {/* Progress timeline indicators (Horizontal on wide, vertical on mobile) */}
      {currentStatus !== 'cancelled' ? (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative pt-2">
          {statusMilestones.map((milestone, idx) => {
            const Icon = milestone.icon;
            const isCompleted = idx <= currentIndex;
            const isActive = idx === currentIndex;
            
            return (
              <div 
                key={milestone.status} 
                className="flex md:flex-col items-center gap-3 md:gap-2 text-center flex-1 w-full relative group"
              >
                {/* Horizontal line divider on desktop */}
                {idx < statusMilestones.length - 1 && (
                  <div className={`hidden md:block absolute top-4 left-[60%] right-[-40%] h-0.5 z-0 transition-colors duration-500 ${
                    idx < currentIndex ? 'bg-blue-600' : 'bg-slate-800'
                  }`} />
                )}

                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 transition-all ${
                  isActive 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-110'
                    : isCompleted
                    ? 'bg-blue-950 border-blue-600 text-blue-400'
                    : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="text-left md:text-center">
                  <p className={`text-xs font-bold transition-colors ${
                    isActive ? 'text-blue-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {milestone.label}
                  </p>
                  <p className="text-[10px] text-slate-600 uppercase font-mono mt-0.5">
                    {isActive ? 'Active' : isCompleted ? 'Passed' : 'Pending'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong className="font-bold">Shipment Cancelled</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">This shipment dispatch has been cancelled and returned to route logs.</p>
          </div>
        </div>
      )}

      {/* Detailed telemetry log events list */}
      <div className="space-y-4 pt-4 border-t border-slate-850">
        <h4 className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Telemetry History Logs</h4>
        
        <div className="relative border-l border-slate-800 pl-4 ml-2.5 space-y-4">
          {activeLogs.map((log, index) => (
            <div key={index} className="relative group">
              {/* Dot indicator */}
              <div className="absolute -left-[22.5px] top-1.5 w-3.5 h-3.5 rounded-full border bg-slate-900 border-blue-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <strong className="font-bold text-slate-200">{log.title}</strong>
                  <span className="text-[10px] font-mono text-slate-600">{log.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{log.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </GlassCard>
  );
};
export default TrackingTimeline;
