import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Fallback Mock database storage for demonstration
export const mockDb = {
  vehicles: [
    { id: 'v1', plate_number: 'MH-12-Q-4029', capacity_class: 'heavy_truck', operating_hub: 'West Hub (Pune)', telemetry_fuel: 82, status: 'in_service', driver_name: 'Rajesh Kumar' },
    { id: 'v2', plate_number: 'DL-03-A-9901', capacity_class: 'light_van', operating_hub: 'North Hub (Delhi)', telemetry_fuel: 54, status: 'in_service', driver_name: 'Amit Sharma' },
    { id: 'v3', plate_number: 'KA-05-M-2210', capacity_class: 'medium_box', operating_hub: 'South Hub (Bangalore)', telemetry_fuel: 90, status: 'in_service', driver_name: 'Vikram Singh' },
    { id: 'v4', plate_number: 'MH-04-E-5520', capacity_class: 'light_van', operating_hub: 'West Hub (Mumbai)', telemetry_fuel: 38, status: 'loading', driver_name: 'Suresh Patil' },
    { id: 'v5', plate_number: 'WB-02-Y-7731', capacity_class: 'light_van', operating_hub: 'East Hub (Kolkata)', telemetry_fuel: 95, status: 'online', driver_name: 'Karan Johar' }
  ],
  drivers: [
    { id: 'd1', full_name: 'Rajesh Kumar', hub_assignment: 'West Hub (Pune)', safety_rating: 98, status: 'active' },
    { id: 'd2', full_name: 'Amit Sharma', hub_assignment: 'North Hub (Delhi)', safety_rating: 94, status: 'active' },
    { id: 'd3', full_name: 'Vikram Singh', hub_assignment: 'South Hub (Bangalore)', safety_rating: 85, status: 'active' },
    { id: 'd4', full_name: 'Suresh Patil', hub_assignment: 'West Hub (Mumbai)', safety_rating: 81, status: 'active' },
    { id: 'd5', full_name: 'Karan Johar', hub_assignment: 'East Hub (Kolkata)', safety_rating: 58, status: 'standby' }
  ],
  shipments: [
    { id: 's1', order_id: '#RTX-8801', client_name: 'Tata Steel Ltd', origin: 'Jamshedpur', destination: 'Pune', weight: 14500, priority: 'URGENT', status: 'in_transit', driver_name: 'Rajesh Kumar' },
    { id: 's2', order_id: '#RTX-8802', client_name: 'Reliance Ind', origin: 'Jamnagar', destination: 'Mumbai', weight: 8000, priority: 'STANDARD', status: 'delivered', driver_name: 'Amit Sharma' },
    { id: 's3', order_id: '#RTX-8803', client_name: 'Flipkart Hub', origin: 'Bangalore', destination: 'Chennai', weight: 240, priority: 'EXPRESS', status: 'in_transit', driver_name: 'Vikram Singh' },
    { id: 's4', order_id: '#RTX-8804', client_name: 'Maruti Suzuki', origin: 'Gurugram', destination: 'Delhi', weight: 1200, priority: 'STANDARD', status: 'pending', driver_name: 'Suresh Patil' },
    { id: 's5', order_id: '#RTX-8805', client_name: 'Zomato Store', origin: 'Mumbai Hub', destination: 'Local', weight: 15, priority: 'STANDARD', status: 'delivered', driver_name: 'Karan Johar' }
  ],
  clients: [
    { client_code: '#CLI-TATA', company_name: 'Tata Steel Ltd (Jamshedpur)', category: 'Manufacturing / Heavy Industrial Logistics', shipments_mo: '350 Shipments', contract: 'active', tier: 'PLATINUM' },
    { client_code: '#CLI-RELI', company_name: 'Reliance Industries (Jamnagar)', category: 'Chemicals & Refineries Supply Chain', shipments_mo: '580 Shipments', contract: 'active', tier: 'PLATINUM' },
    { client_code: '#CLI-FLIP', company_name: 'Flipkart Logistics Hub (Bangalore)', category: 'B2C Ecommerce Distribution', shipments_mo: '1200 Shipments', contract: 'active', tier: 'PLATINUM' },
    { client_code: '#CLI-MARU', company_name: 'Maruti Suzuki Pvt Ltd (Gurugram)', category: 'Automotive Part Dispatches', shipments_mo: '180 Shipments', contract: 'active', tier: 'GOLD TIER' },
    { client_code: '#CLI-ZOMA', company_name: 'Zomato Store Delivery Hub (Mumbai)', category: 'Local Last-Mile Cloud Sourcing', shipments_mo: '4500 Shipments', contract: 'active', tier: 'PLATINUM' }
  ],
  notifications: [
    { id: 'n1', title: '🚨 AI DISPATCH EXCEPTION', message: 'Truck MH-12-Q-4029 delayed on Route Bangalore → Mumbai due to rain congestion. Rerouted via NH-48 (+22 mins).', type: 'danger', time: '4 mins ago', is_read: false },
    { id: 'n2', title: '📈 SAVINGS REACHED TARGET', message: 'Weekly fuel reduction hit 14.2% in Pune logistics hub. AI pathing optimized successfully.', type: 'success', time: '1 hr ago', is_read: false },
    { id: 'n3', title: '👷 HIGH DANGER SCORE WARNING', message: 'Driver Ramesh Kumar (ID: DRV-802) flagged for 3 harsh braking events on expressway segment.', type: 'warning', time: '3 hrs ago', is_read: false }
  ]
};

// Initialize Supabase Client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to handle real-time subscriptions gracefully
export const subscribeToTracking = (vehicleId: string, onUpdate: (data: any) => void) => {
  if (isSupabaseConfigured && supabase) {
    return supabase
      .channel(`tracking:${vehicleId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', filter: `vehicle_id=eq.${vehicleId}`, schema: 'public', table: 'tracking' },
        (payload) => onUpdate(payload.new)
      )
      .subscribe();
  } else {
    // Return a mock intervals generator to simulate real-time updates during mock mode
    const interval = setInterval(() => {
      const vehicle = mockDb.vehicles.find(v => v.plate_number === vehicleId);
      if (vehicle) {
        // Slightly jitter the fuel levels and telemetry
        const jitter = Math.floor(Math.random() * 3) - 1;
        const newFuel = Math.max(5, Math.min(100, vehicle.telemetry_fuel + jitter));
        onUpdate({
          vehicle_id: vehicleId,
          fuel_level: newFuel,
          speed: vehicle.status === 'in_service' ? Math.floor(40 + Math.random() * 40) : 0,
          updated_at: new Date().toISOString()
        });
      }
    }, 4000);

    return {
      unsubscribe: () => clearInterval(interval)
    };
  }
};
