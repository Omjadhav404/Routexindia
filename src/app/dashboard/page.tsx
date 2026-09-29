'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  Bell, 
  Menu, 
  Plus, 
  Users, 
  TrendingUp, 
  Bot, 
  Map, 
  Sliders, 
  Truck, 
  UserCheck, 
  Package, 
  FileText, 
  DollarSign, 
  Activity, 
  ChevronDown, 
  Loader2,
  CloudSunRain,
  Flame,
  FileSpreadsheet,
  CheckSquare,
  Receipt,
  ClipboardCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { Sidebar } from '@/components/layout/sidebar';
import { GlassCard } from '@/components/ui/glass-card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AIChatbot } from '@/components/dashboard/ai-chatbot';
import { TrackingMap } from '@/components/dashboard/tracking-map';
import { TrackingTimeline, ShipmentStatus } from '@/components/dashboard/tracking-timeline';
import { mockDb } from '@/lib/supabase';
import { GSTService, CompanyGSTProfile } from '@/lib/services/gst';
import { PaymentService } from '@/lib/services/payments';

// Financial Chart mock data
const chartData = [
  { name: 'Jan', Revenue: 34, Profit: 12 },
  { name: 'Feb', Revenue: 38, Profit: 14 },
  { name: 'Mar', Revenue: 42, Profit: 16 },
  { name: 'Apr', Revenue: 40, Profit: 15 },
  { name: 'May', Revenue: 45, Profit: 18 },
  { name: 'Jun', Revenue: 48, Profit: 21 },
];

interface DashboardContentProps {
  userRole: string;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

// -------------------------------------------------------------------------
// Master Layout and Tab Content
// -------------------------------------------------------------------------
const DashboardContent: React.FC<DashboardContentProps> = ({
  userRole,
  userName,
  userEmail,
  onLogout
}) => {
  // Navigation states
  const [activeTab, setActiveTab] = useState('ai');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Application database states (interactive models)
  const [dispatches, setDispatches] = useState(mockDb.shipments);
  const [vehicles, setVehicles] = useState(mockDb.vehicles);
  const [drivers, setDrivers] = useState(mockDb.drivers);
  const [waybills, setWaybills] = useState([
    { id: '#RTX-PKG-209', client: 'Tata Steel Ltd', route: 'Mumbai → Pune', weight: '1450 KG', priority: 'URGENT', status: 'in_transit' as ShipmentStatus },
    { id: '#RTX-PKG-104', client: 'Reliance Ind', route: 'Jamnagar → Local', weight: '500 KG', priority: 'STANDARD', status: 'delivered' as ShipmentStatus },
    { id: '#RTX-PKG-881', client: 'Flipkart Hub', route: 'Bangalore → Chennai', weight: '240 KG', priority: 'EXPRESS', status: 'in_transit' as ShipmentStatus }
  ]);
  const [notifications, setNotifications] = useState(mockDb.notifications);
  const [activeRadarVehicle, setActiveRadarVehicle] = useState('MH-12-Q-4029');

  // New Compliance States (GST, E-Invoice, E-Way Bill)
  const [gstinLookup, setGstinLookup] = useState('27TATASTEEL123');
  const [gstProfile, setGstProfile] = useState<CompanyGSTProfile | null>(null);
  const [gstLookupLoading, setGstLookupLoading] = useState(false);

  // E-Invoices Ledger
  const [einvoices, setEinvoices] = useState<any[]>([
    { id: 'ein-1', irn: '72B40AC4928156C028F9E138A752...A1Z5', invoice_number: 'INV-2026-001', invoice_date: '2026-06-01', customer_name: 'TATA STEEL LIMITED', customer_gstin: '27TATASTEEL123', hsn_code: '7208', quantity: 120, taxable_value: 450000, total_tax: 81000, total_amount: 531000, status: 'generated' },
    { id: 'ein-2', irn: '98D10AB202930219D9480C28A850...F3A2', invoice_number: 'INV-2026-002', invoice_date: '2026-06-03', customer_name: 'RELIANCE INDUSTRIES LTD', customer_gstin: '27RELIANCE456', hsn_code: '8708', quantity: 80, taxable_value: 320000, total_tax: 57600, total_amount: 377600, status: 'generated' }
  ]);
  const [eInvoiceSearch, setEInvoiceSearch] = useState('');
  const [eInvoiceFilterHsn, setEInvoiceFilterHsn] = useState('all');

  // E-Invoice Form
  const [fEinClient, setFEinClient] = useState('Tata Steel Ltd');
  const [fEinInvoiceNo, setFEinInvoiceNo] = useState('INV-2026-092');
  const [fEinDate, setFEinDate] = useState('2026-06-07');
  const [fEinClientGstin, setFEinClientGstin] = useState('27TATASTEEL123');
  const [fEinHsn, setFEinHsn] = useState('7208');
  const [fEinQty, setFEinQty] = useState('100');
  const [fEinValue, setFEinValue] = useState('350000');
  const [fEinTaxRate, setFEinTaxRate] = useState('18');

  // E-Way Bills Ledger
  const [ewaybills, setEwaybills] = useState<any[]>([
    { id: 'ewb-1', eway_bill_number: '881940284719', consignor_name: 'ROUTEXINDIA LOGISTICS', consignee_name: 'TATA STEEL LIMITED', consignor_gstin: '27ROUTEXIND999', consignee_gstin: '27TATASTEEL123', vehicle_number: 'MH-12-Q-4029', hsn_code: '7208', quantity: 120, weight: 1.45, status: 'generated', invoice_ref_number: 'INV-2026-001' },
    { id: 'ewb-2', eway_bill_number: '882094829103', consignor_name: 'ROUTEXINDIA LOGISTICS', consignee_name: 'RELIANCE INDUSTRIES LTD', consignor_gstin: '27ROUTEXIND999', consignee_gstin: '27RELIANCE456', vehicle_number: 'DL-03-A-9901', hsn_code: '8708', quantity: 80, weight: 0.50, status: 'draft', invoice_ref_number: 'INV-2026-002' }
  ]);
  const [ewbSearch, setEwbSearch] = useState('');
  const [ewbFilterStatus, setEwbFilterStatus] = useState('all');

  // E-Way Bill Form
  const [fEwbConsignee, setFEwbConsignee] = useState('Tata Steel Ltd');
  const [fEwbConsigneeGstin, setFEwbConsigneeGstin] = useState('27TATASTEEL123');
  const [fEwbVehicle, setFEwbVehicle] = useState('MH-12-Q-4029');
  const [fEwbHsn, setFEwbHsn] = useState('7208');
  const [fEwbQty, setFEwbQty] = useState('100');
  const [fEwbWeight, setFEwbWeight] = useState('1.2');
  const [fEwbInvoiceRef, setFEwbInvoiceRef] = useState('INV-2026-092');

  // Admin settings states
  const [aiRoutingEngine, setAiRoutingEngine] = useState(true);
  const [dynamicPricing, setDynamicPricing] = useState(true);
  const [smsDispatch, setSmsDispatch] = useState(false);
  const [fatigueWatchdog, setFatigueWatchdog] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Modals state
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);

  // Vehicle form fields
  const [vPlate, setVPlate] = useState('');
  const [vClass, setVClass] = useState('heavy_truck');
  const [vDriver, setVDriver] = useState('');
  const [vHub, setVHub] = useState('');
  const [vTelemetry, setVTelemetry] = useState(85);

  // Driver form fields
  const [dName, setDName] = useState('');
  const [dHub, setDHub] = useState('');
  const [dSafety, setDSafety] = useState(95);

  // Booking form fields
  const [bookClient, setBookClient] = useState('Tata Steel Ltd');
  const [bookRoute, setBookRoute] = useState('Mumbai → Pune');
  const [bookWeight, setBookWeight] = useState('750');
  const [bookPriority, setBookPriority] = useState('STANDARD');

  // PDF report compiling state
  const [pdfProgress, setPdfProgress] = useState(-1);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // System clock state
  const [systemTime, setSystemTime] = useState('');

  // Pre-trip checklist for driver portal
  const [checklist, setChecklist] = useState({
    inspection: true,
    documents: true,
    cargo: false,
    fastag: false
  });

  // Handle default active tab based on role on mount
  useEffect(() => {
    const role = userRole.toLowerCase();
    if (role === 'driver') {
      setActiveTab('tracking');
    } else {
      setActiveTab('ai');
    }
  }, [userRole]);

  // Client-side PDF Exporter for E-Invoices
  const handleExportInvoicePDF = (ein: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to view printable PDF invoice.');
      return;
    }
    const html = `
      <html>
        <head>
          <title>RouteXIndia.AI - E-Invoice - ${ein.invoice_number}</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #1e293b; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 12px; color: #64748b; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; font-size: 14px; }
            .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background-color: #f1f5f9; }
            .totals { margin-top: 30px; text-align: right; font-size: 14px; }
            .irn { font-size: 11px; word-break: break-all; margin-top: 40px; background: #f8fafc; padding: 10px; border: 1px dashed #cbd5e1; }
            .btn-print { margin: 20px auto; display: block; padding: 10px 20px; font-weight: bold; cursor: pointer; }
            @media print { .btn-print { display: none; } }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">PRINT E-INVOICE PDF</button>
          <div class="header">
            <div class="title">ROUTEXINDIA.AI E-INVOICE PORTAL</div>
            <div class="subtitle">Government of India GST Portal Integration Mock Verification</div>
          </div>
          <div class="grid">
            <div>
              <div class="section-title">CONSIGNOR / SUPPLIER</div>
              <strong>ROUTEXINDIA LOGISTICS PVT LTD</strong><br>
              GSTIN: 27ROUTEXIND999<br>
              Industrial Area, Sector 5, Mumbai, MH
            </div>
            <div>
              <div class="section-title">CONSIGNEE / BUYER</div>
              <strong>${ein.customer_name}</strong><br>
              GSTIN: ${ein.customer_gstin}<br>
              Registered Corporate Destination Address
            </div>
          </div>
          <div class="grid" style="margin-top: 0;">
            <div>
              <strong>Invoice Number:</strong> ${ein.invoice_number}<br>
              <strong>Invoice Date:</strong> ${ein.invoice_date}
            </div>
            <div>
              <strong>HSN Code:</strong> ${ein.hsn_code}<br>
              <strong>Place of Supply:</strong> State code ${ein.customer_gstin.substring(0, 2)}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>HSN</th>
                <th>Quantity</th>
                <th>Taxable Value</th>
                <th>Tax Breakdown</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>B2B Freight Logistics & Transport Services</td>
                <td>${ein.hsn_code}</td>
                <td>${ein.quantity} Units</td>
                <td>₹${ein.taxable_value.toLocaleString()}</td>
                <td>
                  CGST (9%): ₹${(ein.cgst_rate > 0 ? (ein.taxable_value * 0.09) : 0).toLocaleString()}<br>
                  SGST (9%): ₹${(ein.sgst_rate > 0 ? (ein.taxable_value * 0.09) : 0).toLocaleString()}<br>
                  IGST (18%): ₹${(ein.igst_rate > 0 ? (ein.taxable_value * 0.18) : 0).toLocaleString()}
                </td>
                <td>₹${ein.total_amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals">
            <strong>Subtotal Taxable:</strong> ₹${ein.taxable_value.toLocaleString()}<br>
            <strong>Total GST Tax:</strong> ₹${ein.total_tax.toLocaleString()}<br>
            <strong style="font-size: 16px;">Grand Total (with GST): ₹${ein.total_amount.toLocaleString()}</strong>
          </div>
          <div class="irn">
            <strong>GOVERNMENT INTEGRATION METADATA (IRN & SIGNATURE)</strong><br>
            <strong>Invoice Reference Number (IRN):</strong> ${ein.irn}<br>
            <strong>Filing status:</strong> SIGNED_BY_GSTN | QR_CODE_GENERATED
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Client-side PDF Exporter for E-Way Bills
  const handleExportEWayBillPDF = (ewb: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to view printable PDF e-way bill.');
      return;
    }
    const html = `
      <html>
        <head>
          <title>RouteXIndia.AI - E-Way Bill - ${ewb.eway_bill_number || 'DRAFT'}</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #1e293b; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { font-size: 12px; color: #64748b; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; font-size: 14px; }
            .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background-color: #f1f5f9; }
            .totals { margin-top: 30px; text-align: right; font-size: 14px; }
            .metadata { font-size: 11px; word-break: break-all; margin-top: 40px; background: #f8fafc; padding: 10px; border: 1px dashed #cbd5e1; }
            .btn-print { margin: 20px auto; display: block; padding: 10px 20px; font-weight: bold; cursor: pointer; }
            @media print { .btn-print { display: none; } }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">PRINT E-WAY BILL PDF</button>
          <div class="header">
            <div class="title">ROUTEXINDIA.AI E-WAY BILL PORTAL</div>
            <div class="subtitle">National E-Way Bill System - Ministry of Finance, Govt of India</div>
          </div>
          <div class="grid">
            <div>
              <div class="section-title">PART A: SENDER & RECEIVER DETAILS</div>
              <strong>Consignor (GSTIN):</strong> ${ewb.consignor_name} (${ewb.consignor_gstin})<br>
              <strong>Consignee (GSTIN):</strong> ${ewb.consignee_name} (${ewb.consignee_gstin})<br>
              <strong>Place of Delivery:</strong> Destination Hub Address<br>
              <strong>Invoice Ref Number:</strong> ${ewb.invoice_ref_number}
            </div>
            <div>
              <div class="section-title">PART B: VEHICLE & TRANSPORTER DETAILS</div>
              <strong>Vehicle Plate Number:</strong> ${ewb.vehicle_number}<br>
              <strong>Transporter ID:</strong> 27ROUTEXIND999 (RouteXIndia)<br>
              <strong>HSN Code:</strong> ${ewb.hsn_code}<br>
              <strong>Total Weight:</strong> ${ewb.weight} Tons
            </div>
          </div>
          <div class="metadata">
            <strong>E-WAY BILL BILLING DETAILS</strong><br>
            <strong>E-Way Bill Number:</strong> ${ewb.eway_bill_number || 'PENDING GENERATION (DRAFT)'}<br>
            <strong>E-Way Bill Date:</strong> ${ewb.created_at}<br>
            <strong>Status:</strong> ${ewb.status.toUpperCase()} | ROAD_TRANSIT_PERMITTED
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Client-side CSV Exporter
  const handleExportCSV = (type: 'invoices' | 'waybills') => {
    let headers = '';
    let rows = [];
    if (type === 'invoices') {
      headers = 'Invoice Number,Customer Name,Customer GSTIN,HSN Code,Quantity,Taxable Value,Total Tax,Total Amount,Status,Date\n';
      rows = einvoices.map(ein => 
        `"${ein.invoice_number}","${ein.customer_name}","${ein.customer_gstin}","${ein.hsn_code}",${ein.quantity},${ein.taxable_value},${ein.total_tax},${ein.total_amount},"${ein.status}","${ein.invoice_date}"`
      );
    } else {
      headers = 'E-Way Bill Number,Consignee Name,Consignee GSTIN,Vehicle Number,HSN Code,Quantity,Weight (Tons),Ref Invoice,Status,Date\n';
      rows = ewaybills.map(ewb => 
        `"${ewb.eway_bill_number || 'DRAFT'}","${ewb.consignee_name}","${ewb.consignee_gstin}","${ewb.vehicle_number}","${ewb.hsn_code}",${ewb.quantity},${ewb.weight},"${ewb.invoice_ref_number}","${ewb.status}","${ewb.created_at}"`
      );
    }
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `routexindia_${type}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Driver Realtime status updater
  const handleDriverStatusUpdate = (status: ShipmentStatus) => {
    setDispatches((prev) =>
      prev.map((disp) => {
        if (disp.order_id === '#RTX-8801') {
          return { ...disp, status };
        }
        return disp;
      })
    );

    setVehicles((prev) =>
      prev.map((veh) => {
        if (veh.plate_number === 'MH-12-Q-4029') {
          const vehicleStatus = status === 'delivered' ? 'online' : 'in_service';
          return { ...veh, status: vehicleStatus };
        }
        return veh;
      })
    );

    const statusLabels: Record<string, string> = {
      in_transit: '🚚 SHIPMENT IN TRANSIT',
      out_for_delivery: '📍 OUT FOR LAST MILE DELIVERY',
      delivered: '✅ HANDOVER COMPLETED SUCCESSFULLY'
    };

    const newNotification = {
      id: `n-${Date.now()}`,
      title: statusLabels[status] || '📦 STATUS UPDATED',
      message: `Driver Rajesh Kumar updated Waybill #RTX-8801 status to ${status.replace('_', ' ').toUpperCase()} for Tata Steel Ltd.`,
      type: status === 'delivered' ? 'success' as any : 'info' as any,
      time: 'Just now',
      is_read: false
    };
    setNotifications((prev) => [newNotification, ...prev]);
    alert(`[RouteXIndia.AI Driver Portal]\n\nShipment #RTX-8801 status updated to: ${status.toUpperCase()}`);
  };

  const renderKpiCards = () => {
    const role = userRole.toLowerCase();
    if (role === 'driver') {
      return (
        <>
          <GlassCard glowColor="blue" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>YOUR SAFETY RATING</span>
              <UserCheck className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-100">98/100</p>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">EXCELLENT PROFILE STATE</span>
          </GlassCard>
          <GlassCard glowColor="cyan" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>ACTIVE SHIFT TIME</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">4.5 Hrs</p>
            <span className="text-[10px] font-mono text-slate-400 font-bold">8.0 HRS MAXIMUM LIMIT</span>
          </GlassCard>
          <GlassCard className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>ASSIGNED VEHICLE</span>
              <Truck className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">MH-12-Q-4029</p>
            <span className="text-[10px] font-mono text-slate-400 font-bold">HEAVY HAULAGE CLASS</span>
          </GlassCard>
          <GlassCard glowColor="purple" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>ASSIGNED CORRIDOR</span>
              <Map className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xl font-bold text-slate-100 truncate">Pune → Mumbai</p>
            <span className="text-[10px] font-mono text-blue-400 font-bold">WAYBILL #RTX-8801 ACTIVE</span>
          </GlassCard>
        </>
      );
    }
    if (role === 'manager') {
      return (
        <>
          <GlassCard glowColor="blue" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>ACTIVE VEHICLES</span>
              <Truck className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-100">42 Trucks</p>
            <span className="text-[10px] font-bold text-emerald-400">88% HUB CAPACITY ACTIVE</span>
          </GlassCard>
          <GlassCard glowColor="cyan" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>ON-DUTY DRIVERS</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">18 Operators</p>
            <span className="text-[10px] font-bold text-emerald-400">4 ON STANDBY REGISTRY</span>
          </GlassCard>
          <GlassCard className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>HUB UTILIZATION</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">84.2%</p>
            <span className="text-[10px] font-bold text-emerald-400">OPTIMAL YIELD INDEX</span>
          </GlassCard>
          <GlassCard glowColor="purple" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>AVG SAFETY INDEX</span>
              <UserCheck className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-slate-100">92/100</p>
            <span className="text-[10px] font-mono text-purple-400 font-bold">COMPLIANCE AUDIT PASSED</span>
          </GlassCard>
        </>
      );
    }
    if (role === 'provider') {
      return (
        <>
          <GlassCard glowColor="blue" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>ACTIVE FREIGHT VALUE</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-100">₹28.5 Lakhs</p>
            <span className="text-[10px] font-bold text-emerald-400">↑ 14.8% THIS MONTH</span>
          </GlassCard>
          <GlassCard glowColor="cyan" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>FLEET IN TRANSIT</span>
              <Truck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">8 Vehicles</p>
            <span className="text-[10px] font-bold text-emerald-400">ALL RADARS REPORTING LIVE</span>
          </GlassCard>
          <GlassCard className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>ACTIVE DRIVERS</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">14 Operators</p>
            <span className="text-[10px] font-bold text-emerald-400">0 FLAGS AT BORDER POSTS</span>
          </GlassCard>
          <GlassCard glowColor="purple" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>E-WAY BILLS ISSUED</span>
              <ClipboardCheck className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-slate-100">24 Bills</p>
            <span className="text-[10px] font-mono text-purple-400 font-bold">100% REGISTRY COMPLIANT</span>
          </GlassCard>
        </>
      );
    }
    if (role === 'customer') {
      return (
        <>
          <GlassCard glowColor="blue" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>ACTIVE BOOKINGS</span>
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-slate-100">5 Consignments</p>
            <span className="text-[10px] font-bold text-emerald-400">2 IN TRANSIT • 1 DELIVERED TODAY</span>
          </GlassCard>
          <GlassCard glowColor="cyan" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>TOTAL INVOICED</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">₹9.08 Lakhs</p>
            <span className="text-[10px] font-bold text-emerald-400">3 ACTIVE INVOICE SHEETS</span>
          </GlassCard>
          <GlassCard className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>COMPLETED SHIPMENTS</span>
              <CheckSquare className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">124 Deliveries</p>
            <span className="text-[10px] font-bold text-emerald-400">99.2% ON-TIME ETA RATE</span>
          </GlassCard>
          <GlassCard glowColor="purple" className="space-y-2">
            <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
              <span>CARBON OFFSET SAVED</span>
              <Bot className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-slate-100">420 kg CO2</p>
            <span className="text-[10px] font-mono text-purple-400 font-bold">1.4X GREEN REDUCTIONS</span>
          </GlassCard>
        </>
      );
    }
    return (
      <>
        <GlassCard glowColor="blue" className="space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>TOTAL DELIVERIES</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-100">12,480</p>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            ↑ 8.4% THIS MONTH
          </span>
        </GlassCard>
        <GlassCard glowColor="cyan" className="space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>GROSS REVENUE</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-slate-100">₹48.2 Lakhs</p>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            ↑ 12.1% THIS MONTH
          </span>
        </GlassCard>
        <GlassCard className="space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>NET FUEL COSTS</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-slate-100">₹6.84 Lakhs</p>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            ↓ 3.2% SAVINGS
          </span>
        </GlassCard>
        <GlassCard glowColor="purple" className="space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>AI EFFICIENCY SCORE</span>
            <Bot className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-100">96.4%</p>
          <span className="text-[10px] font-mono text-purple-400 font-bold">
            AI-OPTIMIZED PATHING
          </span>
        </GlassCard>
      </>
    );
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setSystemTime(`${day} ${month} ${year} | ${hours}:${minutes}:${seconds} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pre-load default GST profile
  useEffect(() => {
    handleVerifyGstin();
  }, []);

  const handleVerifyGstin = async () => {
    setGstLookupLoading(true);
    try {
      const profile = await GSTService.verifyGSTIN(gstinLookup);
      setGstProfile(profile);
    } catch (err: any) {
      alert(err.message || 'GSTIN verification failed.');
    } finally {
      setGstLookupLoading(false);
    }
  };

  // Create E-Invoice Draft
  const handleCreateEInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const draft = await GSTService.generateEInvoiceDraft({
        gstin: '27ROUTEXIND999',
        invoice_number: fEinInvoiceNo,
        invoice_date: fEinDate,
        customer_name: fEinClient.toUpperCase(),
        customer_gstin: fEinClientGstin,
        hsn_code: fEinHsn,
        quantity: Number(fEinQty),
        taxable_value: Number(fEinValue),
        tax_rate: Number(fEinTaxRate)
      });

      setEinvoices((prev) => [draft, ...prev]);
      alert(`[RouteXIndia.AI E-Invoice Portal]\n\nE-Invoice Draft Generated. IRN Code: ${draft.irn.substring(0, 16)}...`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create E-Way Bill Draft
  const handleCreateEWayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const draft = await GSTService.generateEWayBillDraft({
        consignor_name: 'ROUTEXINDIA LOGISTICS',
        consignee_name: fEwbConsignee.toUpperCase(),
        consignor_gstin: '27ROUTEXIND999',
        consignee_gstin: fEwbConsigneeGstin,
        vehicle_number: fEwbVehicle,
        hsn_code: fEwbHsn,
        quantity: Number(fEwbQty),
        weight: Number(fEwbWeight),
        invoice_ref_number: fEwbInvoiceRef
      });

      setEwaybills((prev) => [draft, ...prev]);
      alert(`[RouteXIndia.AI E-Way Bill Portal]\n\nE-Way Bill Generated. EWB Number: ${draft.eway_bill_number}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Quick dispatch triggers
  const handleQuickNewDelivery = () => {
    const newId = `#RTX-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomCustomers = ["Adani Port", "Reliance Retail", "Wipro Sys", "ITC Limited"];
    const randomRoutes = [
      { origin: 'Delhi Hub', dest: 'Noida Hub' },
      { origin: 'Kolkata Hub', dest: 'Patna Hub' },
      { origin: 'Mumbai Hub', dest: 'Goa Hub' },
      { origin: 'Bangalore Hub', dest: 'Salem Segment' }
    ];
    
    const customer = randomCustomers[Math.floor(Math.random() * randomCustomers.length)];
    const route = randomRoutes[Math.floor(Math.random() * randomRoutes.length)];
    
    const newShipment = {
      id: `s-${Date.now()}`,
      order_id: newId,
      client_name: customer,
      origin: route.origin,
      destination: route.dest,
      weight: 1250,
      priority: 'EXPRESS',
      status: 'in_transit' as ShipmentStatus,
      driver_name: 'AI Auto-Driver'
    };

    setDispatches((prev) => [newShipment, ...prev]);

    // Send notification
    const newNotification = {
      id: `n-${Date.now()}`,
      title: '📦 NEW BOOKING CLEARED',
      message: `AI Auto-dispatch allocated Waybill ${newId} for ${customer} (${route.origin} → ${route.dest}).`,
      type: 'info' as any,
      time: 'Just now',
      is_read: false
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleAssignDriver = () => {
    alert('[RouteXIndia.AI Dispatch Engine]\n\nAI assignment algorithm has scanned the carrier registries and balanced vehicle capacity nodes successfully.');
  };

  // Add Fleet Vehicle
  const handleRegisterVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vPlate || !vDriver || !vHub) return;

    const newVehicle = {
      id: `v-${Date.now()}`,
      plate_number: vPlate.toUpperCase(),
      capacity_class: vClass,
      operating_hub: vHub,
      telemetry_fuel: Number(vTelemetry),
      status: 'online',
      driver_name: vDriver
    };

    setVehicles((prev) => [newVehicle, ...prev]);
    setVehicleModalOpen(false);
    setVPlate('');
    setVDriver('');
    setVHub('');
    
    alert(`[RouteXIndia.AI Operations]\n\nVehicle ${newVehicle.plate_number} has been registered and dispatched.`);
  };

  // Add Active Service Driver
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName || !dHub) return;

    const newDriver = {
      id: `d-${Date.now()}`,
      full_name: dName,
      hub_assignment: dHub,
      safety_rating: Number(dSafety),
      status: 'active'
    };

    setDrivers((prev) => [newDriver, ...prev]);
    setDriverModalOpen(false);
    setDName('');
    setDHub('');
    
    alert(`[RouteXIndia.AI Operations]\n\nDriver ${newDriver.full_name} has been certified and recorded in the service ledger.`);
  };

  const toggleDriverStatus = (id: string) => {
    setDrivers((prev) => 
      prev.map((drv) => {
        if (drv.id === id) {
          const newStatus = drv.status === 'active' ? 'suspended' : 'active';
          return { ...drv, status: newStatus };
        }
        return drv;
      })
    );
  };

  // Book Priority Waybill Form
  const handleBookWaybill = (e: React.FormEvent) => {
    e.preventDefault();
    
    const waybillId = `#RTX-PKG-${Math.floor(100 + Math.random() * 900)}`;
    const newWaybill = {
      id: waybillId,
      client: bookClient,
      route: bookRoute,
      weight: `${bookWeight} KG`,
      priority: bookPriority,
      status: 'in_transit' as ShipmentStatus
    };

    setWaybills((prev) => [newWaybill, ...prev]);
    alert(`[RouteXIndia.AI Dispatch Matrix]\n\nConsignment ${waybillId} registered. AI optimized pathing activated.`);
  };

  // Compile PDF Ledger
  const handleExportPDF = () => {
    setPdfSuccess(false);
    setPdfProgress(0);
    
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setPdfProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setPdfSuccess(true);
        
        // Trigger a CSV download of the compliance report
        const headers = 'Hub Region,Cost (INR),AI Optimized Pathing,Filing Status\n';
        const rows = [
          '"West Hub (Pune)",184000,"14,200 km","COMPLIANT"',
          '"North Hub (Delhi)",210000,"16,500 km","COMPLIANT"',
          '"South Hub (Bangalore)",160000,"12,900 km","COMPLIANT"',
          '"East Hub (Kolkata)",130000,"9,800 km","PENDING"'
        ];
        const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `routexindia_compliance_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          setPdfProgress(-1);
        }, 1500);
      }
    }, 300);
  };

  // Save Settings Parameters
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('Saving configurations...');
    setTimeout(() => {
      setSaveStatus('Parameters successfully compiled to engine registry.');
      setTimeout(() => setSaveStatus(''), 2500);
    }, 1000);
  };

  const handleResetMetrics = () => {
    setDispatches(mockDb.shipments);
    setVehicles(mockDb.vehicles);
    setDrivers(mockDb.drivers);
    alert('Platform operational states reset successfully.');
  };

  // Filter lists
  const filteredInvoices = einvoices.filter(ein => {
    const matchesSearch = ein.invoice_number.toLowerCase().includes(eInvoiceSearch.toLowerCase()) || 
                          ein.customer_name.toLowerCase().includes(eInvoiceSearch.toLowerCase());
    const matchesHsn = eInvoiceFilterHsn === 'all' || ein.hsn_code === eInvoiceFilterHsn;
    return matchesSearch && matchesHsn;
  });

  const filteredEwb = ewaybills.filter(ewb => {
    const matchesSearch = ewb.eway_bill_number.toLowerCase().includes(ewbSearch.toLowerCase()) ||
                          ewb.vehicle_number.toLowerCase().includes(ewbSearch.toLowerCase()) ||
                          ewb.consignee_name.toLowerCase().includes(ewbSearch.toLowerCase());
    const matchesStatus = ewbFilterStatus === 'all' || ewb.status === ewbFilterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-blue-600/30 w-full">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col lg:pl-72 min-h-screen max-w-full overflow-x-hidden">
        <header className="h-16 border-b border-border bg-background/60 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-1.5 rounded-lg border border-border text-zinc-500 dark:text-slate-400 hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-blue-950 text-blue-400 border border-blue-900/40 uppercase tracking-wider">
              {activeTab === 'ai' ? 'AI COMMAND CENTER' : activeTab.replace('-', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden xl:block text-xs font-mono text-zinc-500 dark:text-slate-400 select-none">
              {systemTime}
            </div>

            <ThemeToggle />

            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileDropdown(false);
                }}
                className="p-2 rounded-lg border border-border hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-slate-400 hover:text-foreground transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">RECENT TELEMETRY ALERTS</span>
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-900/30 text-[9px] font-bold">
                      {notifications.length} ALERT
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-900/80">
                    {notifications.map((n: any) => (
                      <div key={n.id} className="p-3.5 space-y-1 hover:bg-slate-900/30 transition-colors">
                        <strong className={`text-[10px] font-bold block ${
                          n.type === 'danger' ? 'text-red-400' : n.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                        }`}>{n.title}</strong>
                        <p className="text-[11px] text-slate-400 leading-normal">{n.message}</p>
                        <span className="block text-[9px] text-slate-500 font-mono mt-1">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-850 hover:bg-slate-900 text-slate-300 transition-all select-none cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium hidden sm:block">{userName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-slate-900">
                  <div className="px-4 py-2.5 bg-slate-900/30">
                    <p className="text-xs text-slate-400 font-medium truncate">{userEmail}</p>
                  </div>
                  <div className="p-1">
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 transition-all"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6 flex-1 space-y-6 overflow-y-auto">
          
          {/* ========================================================================= */}
          {/* TAB 1: AI Command Center (Default View) */}
          {/* ========================================================================= */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-slide-up">
              <GlassCard className="p-4 bg-slate-950/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-400" />
                    <span className="font-mono text-xs font-bold text-slate-300 tracking-wider">
                      QUICK SYSTEM OPERATIONS:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button onClick={handleQuickNewDelivery} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> NEW DELIVERY
                    </button>
                    <button onClick={handleAssignDriver} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                      <UserCheck className="w-3.5 h-3.5" /> ASSIGN DRIVER
                    </button>
                    <button onClick={() => setActiveTab('tracking')} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                      <Map className="w-3.5 h-3.5" /> VIEW ALL ROUTES
                    </button>
                    <button onClick={() => setActiveTab('reports')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                      <FileText className="w-3.5 h-3.5" /> COMPILE REPORT
                    </button>
                  </div>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderKpiCards()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="lg:col-span-2 p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" /> FINANCIAL TRENDS (LAST 6 MONTHS)
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/40 font-mono">
                      ₹ IN LAKHS
                    </span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                        <Area type="monotone" dataKey="Revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Profit" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard className="p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-500" /> SAFETY LEDGER
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 font-mono">
                        ACTIVE AUDIT
                      </span>
                    </div>
                    <div className="space-y-3.5">
                      {drivers.map((drv) => (
                        <div key={drv.id} className="space-y-1 text-xs">
                          <div className="flex justify-between font-medium">
                            <span className="text-slate-300">{drv.full_name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              drv.safety_rating >= 90 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' 
                                : 'bg-amber-950 text-amber-400 border border-amber-900/30'
                            }`}>
                              {drv.safety_rating}/100 {drv.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                drv.safety_rating >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${drv.safety_rating}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-850 flex gap-2 text-[10px] text-slate-500 font-mono">
                    <span>Harsh Braking: 14</span>
                    <span>•</span>
                    <span>Overspeeding: 3</span>
                  </div>
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <GlassCard className="p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                        <CloudSunRain className="w-4 h-4 text-amber-500" /> WEATHER OPERATIONS
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                        MET REGISTRY
                      </span>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex gap-3 border-b border-slate-900 pb-3">
                        <div className="w-8 h-8 rounded bg-red-950/60 border border-red-900/30 flex items-center justify-center flex-shrink-0 text-red-400">☔</div>
                        <div className="space-y-1">
                          <strong className="text-slate-300 font-bold block">WESTERN GHATS CORRIDOR</strong>
                          <p className="text-[11px] text-slate-500 leading-normal">Torrential monsoon reported. Throttling loads to 75% capacity limit.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded bg-amber-950/60 border border-amber-900/30 flex items-center justify-center flex-shrink-0 text-amber-400">💨</div>
                        <div className="space-y-1">
                          <strong className="text-slate-300 font-bold block">DELHI NCR / HARYANA</strong>
                          <p className="text-[11px] text-slate-500 leading-normal">Severe dust storms reported near border checkpoints.</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                  <GlassCard className="p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-500" /> GRIDLOCK INTEL
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-mono">
                        NH-DELAY
                      </span>
                    </div>
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <div>
                          <strong className="text-slate-300 font-bold block">NH-48 (Delhi-Mumbai)</strong>
                          <p className="text-[10px] text-slate-500">Congestion near Jaipur bypass.</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-900/30 text-[10px] font-bold">
                          +45 MINS
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <strong className="text-slate-300 font-bold block">NH-4 (Bangalore-Pune)</strong>
                          <p className="text-[10px] text-slate-500">Checkpoints backup cleared.</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold">
                          FASTAG OK
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                <div className="lg:col-span-2">
                  <AIChatbot />
                </div>
              </div>

              <GlassCard className="p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-500" /> RECENT OPERATIONS DISPATCHES
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/40 font-mono">
                    LIVE DISPATCH QUEUE
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500">
                        <th className="py-2.5 font-bold">ORDER ID</th>
                        <th className="py-2.5 font-bold">CUSTOMER</th>
                        <th className="py-2.5 font-bold">ROUTE</th>
                        <th className="py-2.5 font-bold">STATUS</th>
                        <th className="py-2.5 font-bold">DRIVER ASSIGNED</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {dispatches.map((disp) => (
                        <tr key={disp.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 font-mono font-bold text-blue-400">{disp.order_id}</td>
                          <td className="py-3 font-semibold">{disp.client_name}</td>
                          <td className="py-3">{disp.origin} → {disp.destination}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              disp.status === 'delivered' 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' 
                                : disp.status === 'pending' 
                                ? 'bg-slate-900 text-slate-400 border border-slate-800' 
                                : 'bg-amber-950 text-amber-400 border border-amber-900/30'
                            }`}>
                              {disp.status.toUpperCase().replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 font-mono">{disp.driver_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: Live GPS Telemetry map & Tracking Timeline */}
          {/* ========================================================================= */}
          {activeTab === 'tracking' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-slide-up">
              
              {/* Radar scanner */}
              <div className="lg:col-span-4 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col h-[650px] overflow-hidden">
                <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">VEHICLE RADAR SCANNER</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/30 text-[9px] font-mono">
                    {vehicles.length} TELEMETRIES
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-900 no-scrollbar">
                  {vehicles.map((v) => {
                    const isActive = activeRadarVehicle === v.plate_number;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setActiveRadarVehicle(v.plate_number)}
                        className={`w-full text-left p-4 space-y-1.5 transition-all cursor-pointer ${
                          isActive ? 'bg-blue-600/10 border-l-4 border-blue-500' : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-mono font-bold">
                          <span className={isActive ? 'text-blue-400' : 'text-slate-200'}>{v.plate_number}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                            v.status === 'in_service' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                          }`}>
                            {v.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Driver: {v.driver_name} | Hub: {v.operating_hub}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Map & Telematics detail panel */}
              <div className="lg:col-span-8 space-y-6">
                <div className="h-[420px]">
                  <TrackingMap selectedVehicle={activeRadarVehicle} vehicles={vehicles} />
                </div>

                {(() => {
                  const activeV = vehicles.find((v) => v.plate_number === activeRadarVehicle);
                  const matchingWaybill = waybills.find(w => w.id === '#RTX-8801') || waybills[0];
                  
                  return activeV ? (
                    <div className="space-y-4">
                      {/* Telemetry card */}
                      <GlassCard glowColor="cyan" className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold block">SELECTED TELEMETRY</span>
                            <strong className="text-sm text-cyan-400 block font-bold">{activeV.plate_number}</strong>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 block">DRIVER</span>
                            <strong className="text-slate-200 block font-bold">{activeV.driver_name}</strong>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 block">TELEMETRIC FUEL</span>
                            <strong className="text-slate-200 block font-bold">{activeV.telemetry_fuel}% CAPACITY</strong>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 block">ASSIGNED HUB</span>
                            <strong className="text-slate-200 block font-bold">{activeV.operating_hub}</strong>
                          </div>
                        </div>
                      </GlassCard>

                      {/* Visual Stepper Timeline */}
                      <TrackingTimeline 
                        orderId={activeRadarVehicle === 'MH-12-Q-4029' ? '#RTX-8801' : '#RTX-8803'}
                        currentStatus={activeRadarVehicle === 'MH-04-E-5520' ? 'pending' : activeRadarVehicle === 'WB-02-Y-7731' ? 'delivered' : 'in_transit'}
                        origin={activeV.operating_hub}
                        destination="Client Terminal Segment"
                        driverName={activeV.driver_name}
                        vehiclePlate={activeV.plate_number}
                      />
                    </div>
                  ) : null;
                })()}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: GST Compliance Hub */}
          {/* ========================================================================= */}
          {activeTab === 'gst' && (
            <div className="space-y-6 animate-slide-up">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-500" /> B2B GST Compliance Hub
                </h2>
                <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-900/40 text-xs font-mono rounded">
                  GST Audit System
                </span>
              </div>

              {/* GSTIN Verification input & result */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                <div className="lg:col-span-5">
                  <GlassCard glowColor="blue" className="p-5 space-y-4">
                    <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">Verify Corporate GSTIN</h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={gstinLookup}
                        onChange={(e) => setGstinLookup(e.target.value)}
                        placeholder="Enter 15-digit GSTIN" 
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                      <button 
                        onClick={handleVerifyGstin}
                        disabled={gstLookupLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {gstLookupLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Verify
                      </button>
                    </div>

                    {gstProfile && (
                      <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-3 animate-fade-in text-xs">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <strong className="text-blue-400 font-bold font-mono">{gstProfile.gstin}</strong>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            gstProfile.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-red-950 text-red-400 border border-red-900/30'
                          }`}>
                            {gstProfile.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p><span className="text-slate-500">Legal Name:</span> <strong className="text-slate-200">{gstProfile.legal_name}</strong></p>
                          <p><span className="text-slate-500">Trade Name:</span> <span className="text-slate-300">{gstProfile.trade_name}</span></p>
                          <p><span className="text-slate-500">Filing Cycle:</span> <span className="text-slate-300 font-mono">{gstProfile.filing_frequency.toUpperCase()}</span></p>
                          <p><span className="text-slate-500">Registered Address:</span> <span className="text-slate-400 text-[11px] block mt-1 leading-relaxed">{gstProfile.address}</span></p>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                </div>

                <div className="lg:col-span-7 space-y-6">
                  {/* Tax analytics breakdown */}
                  <GlassCard className="p-5">
                    <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-4">SGST / CGST Tax Analytics</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">TOTAL TAX DECLARED</span>
                        <strong className="text-base font-black text-slate-200">₹1,38,600</strong>
                      </div>
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">CGST SPLIT (9%)</span>
                        <strong className="text-base font-black text-blue-405">₹69,300</strong>
                      </div>
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">SGST SPLIT (9%)</span>
                        <strong className="text-base font-black text-cyan-405">₹69,300</strong>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Past Filing records */}
                  <GlassCard className="p-5">
                    <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-3">GST Filing Compliance logs</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="py-2.5 font-bold">FILING MONTH</th>
                            <th className="py-2.5 font-bold">GSTR-1</th>
                            <th className="py-2.5 font-bold">GSTR-3B</th>
                            <th className="py-2.5 font-bold">RECONCILIATION</th>
                            <th className="py-2.5 font-bold">COMPLIANCE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300">
                          {[
                            { month: 'May 2026', r1: 'FILED', r3b: 'FILED', recon: '99.8%', status: 'compliant' },
                            { month: 'Apr 2026', r1: 'FILED', r3b: 'FILED', recon: '100%', status: 'compliant' },
                            { month: 'Mar 2026', r1: 'FILED', r3b: 'FILED', recon: '99.4%', status: 'compliant' },
                          ].map((log, idx) => (
                            <tr key={idx}>
                              <td className="py-3 font-semibold">{log.month}</td>
                              <td className="py-3 text-emerald-400 font-bold">✓ {log.r1}</td>
                              <td className="py-3 text-emerald-400 font-bold">✓ {log.r3b}</td>
                              <td className="py-3 font-mono">{log.recon}</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/30">
                                  {log.status.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: E-Invoice Hub */}
          {/* ========================================================================= */}
          {activeTab === 'e-invoices' && (
            <div className="space-y-6 animate-slide-up">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-500" /> Government E-Invoice System
                </h2>
                <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-900/40 text-xs font-mono rounded">
                  IRN Registry
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Form column */}
                <div className="xl:col-span-4">
                  <GlassCard className="p-5 space-y-4">
                    <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">Create E-Invoice Draft</h3>
                    <form onSubmit={handleCreateEInvoice} className="space-y-3.5 text-xs">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Client Account</label>
                        <select 
                          value={fEinClient} 
                          onChange={(e) => {
                            setFEinClient(e.target.value);
                            const gstMap: Record<string, string> = {
                              'Tata Steel Ltd': '27TATASTEEL123',
                              'Reliance Ind': '27RELIANCE456',
                              'Flipkart Hub': '27FLIPKART789'
                            };
                            setFEinClientGstin(gstMap[e.target.value] || '27TATASTEEL123');
                          }} 
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Tata Steel Ltd">Tata Steel Ltd</option>
                          <option value="Reliance Ind">Reliance Ind</option>
                          <option value="Flipkart Hub">Flipkart Hub</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Invoice Number</label>
                          <input required type="text" value={fEinInvoiceNo} onChange={(e) => setFEinInvoiceNo(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Invoice Date</label>
                          <input required type="date" value={fEinDate} onChange={(e) => setFEinDate(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Recipient GSTIN</label>
                        <input required type="text" value={fEinClientGstin} onChange={(e) => setFEinClientGstin(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">HSN Code</label>
                          <select value={fEinHsn} onChange={(e) => setFEinHsn(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer">
                            <option value="7208">7208 (Steel)</option>
                            <option value="8708">8708 (Auto Parts)</option>
                            <option value="8471">8471 (Computers)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Quantity</label>
                          <input required type="number" value={fEinQty} onChange={(e) => setFEinQty(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Taxable Value (INR)</label>
                          <input required type="number" value={fEinValue} onChange={(e) => setFEinValue(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">GST Rate (%)</label>
                          <select value={fEinTaxRate} onChange={(e) => setFEinTaxRate(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer">
                            <option value="18">18% Standard</option>
                            <option value="12">12% Reduced</option>
                            <option value="28">28% Luxury</option>
                            <option value="5">5% Lower</option>
                          </select>
                        </div>
                      </div>

                      <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs transition-all cursor-pointer">
                        GENERATE E-INVOICE DRAFT
                      </button>
                    </form>
                  </GlassCard>
                </div>

                {/* Table column */}
                <div className="xl:col-span-8 space-y-4">
                  
                  {/* Search and filter controls */}
                  <GlassCard className="p-4 bg-slate-950/40">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Search E-Invoice by number or customer..." 
                          value={eInvoiceSearch}
                          onChange={(e) => setEInvoiceSearch(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <select 
                          value={eInvoiceFilterHsn} 
                          onChange={(e) => setEInvoiceFilterHsn(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none cursor-pointer"
                        >
                          <option value="all">All HSN Codes</option>
                          <option value="7208">HSN 7208 (Steel)</option>
                          <option value="8708">HSN 8708 (Parts)</option>
                        </select>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Table */}
                  <GlassCard className="p-5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="py-2.5 font-bold">INVOICE NO</th>
                            <th className="py-2.5 font-bold">RECIPIENT CLIENT</th>
                            <th className="py-2.5 font-bold">IRN REFERENCE</th>
                            <th className="py-2.5 font-bold">VALUE</th>
                            <th className="py-2.5 font-bold">GST TAX</th>
                            <th className="py-2.5 font-bold">TOTAL</th>
                            <th className="py-2.5 font-bold text-right">EXPORTS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300">
                          {filteredInvoices.map((ein) => (
                            <tr key={ein.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="py-4 font-mono font-bold text-slate-200">{ein.invoice_number}</td>
                              <td className="py-4 font-semibold text-blue-400">{ein.customer_name}</td>
                              <td className="py-4 font-mono text-slate-500 text-[10px] truncate max-w-[120px]">{ein.irn}</td>
                              <td className="py-4 font-mono">₹{ein.taxable_value.toLocaleString()}</td>
                              <td className="py-4 font-mono text-slate-400">₹{ein.total_tax.toLocaleString()}</td>
                              <td className="py-4 font-mono font-bold text-slate-100">₹{ein.total_amount.toLocaleString()}</td>
                              <td className="py-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button onClick={() => handleExportInvoicePDF(ein)} className="px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold rounded hover:text-white transition-all cursor-pointer">
                                    PDF
                                  </button>
                                  <button onClick={() => handleExportCSV('invoices')} className="px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold rounded hover:text-white transition-all cursor-pointer">
                                    CSV
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: E-Way Bill System */}
          {/* ========================================================================= */}
          {activeTab === 'e-way-bills' && (
            <div className="space-y-6 animate-slide-up">
              
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-500" /> Government E-Way Bill Issuer
                </h2>
                <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-900/40 text-xs font-mono rounded">
                  Transporter Registry
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Form column */}
                <div className="xl:col-span-4">
                  <GlassCard className="p-5 space-y-4">
                    <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">Issue E-Way Bill Draft</h3>
                    <form onSubmit={handleCreateEWayBill} className="space-y-3.5 text-xs">
                      
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Recipient Consignee</label>
                        <select 
                          value={fEwbConsignee} 
                          onChange={(e) => {
                            setFEwbConsignee(e.target.value);
                            const gstMap: Record<string, string> = {
                              'Tata Steel Ltd': '27TATASTEEL123',
                              'Reliance Ind': '27RELIANCE456',
                              'Flipkart Hub': '27FLIPKART789'
                            };
                            setFEwbConsigneeGstin(gstMap[e.target.value] || '27TATASTEEL123');
                          }} 
                          className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Tata Steel Ltd">Tata Steel Ltd</option>
                          <option value="Reliance Ind">Reliance Ind</option>
                          <option value="Flipkart Hub">Flipkart Hub</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Consignee GSTIN</label>
                        <input required type="text" value={fEwbConsigneeGstin} onChange={(e) => setFEwbConsigneeGstin(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Vehicle Number</label>
                          <select value={fEwbVehicle} onChange={(e) => setFEwbVehicle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer">
                            {vehicles.map(v => (
                              <option key={v.id} value={v.plate_number}>{v.plate_number}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">HSN Code</label>
                          <input required type="text" value={fEwbHsn} onChange={(e) => setFEwbHsn(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Quantity</label>
                          <input required type="number" value={fEwbQty} onChange={(e) => setFEwbQty(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Weight (Tons)</label>
                          <input required type="text" value={fEwbWeight} onChange={(e) => setFEwbWeight(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Ref Invoice Number</label>
                        <input required type="text" value={fEwbInvoiceRef} onChange={(e) => setFEwbInvoiceRef(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                      </div>

                      <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs transition-all cursor-pointer">
                        GENERATE E-WAY BILL DRAFT
                      </button>
                    </form>
                  </GlassCard>
                </div>

                {/* Table column */}
                <div className="xl:col-span-8 space-y-4">
                  
                  {/* Search and filters */}
                  <GlassCard className="p-4 bg-slate-950/40">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Search E-Way Bill by number, vehicle, or client..." 
                          value={ewbSearch}
                          onChange={(e) => setEwbSearch(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <select 
                          value={ewbFilterStatus} 
                          onChange={(e) => setEwbFilterStatus(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Statuses</option>
                          <option value="generated">Generated</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Table */}
                  <GlassCard className="p-5">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="py-2.5 font-bold">E-WAY BILL NO</th>
                            <th className="py-2.5 font-bold">CONSIGNEE RECIPIENT</th>
                            <th className="py-2.5 font-bold">VEHICLE</th>
                            <th className="py-2.5 font-bold">HSN CODE</th>
                            <th className="py-2.5 font-bold">WEIGHT</th>
                            <th className="py-2.5 font-bold">STATUS</th>
                            <th className="py-2.5 font-bold text-right">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300">
                          {filteredEwb.map((ewb) => (
                            <tr key={ewb.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="py-4 font-mono font-bold text-slate-100">{ewb.eway_bill_number || 'DRAFT (No Number)'}</td>
                              <td className="py-4 font-semibold text-blue-405">{ewb.consignee_name}</td>
                              <td className="py-4 font-mono text-slate-300">{ewb.vehicle_number}</td>
                              <td className="py-4 font-mono">{ewb.hsn_code}</td>
                              <td className="py-4">{ewb.weight} Tons</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ewb.status === 'generated' 
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' 
                                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                                }`}>
                                  {ewb.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button onClick={() => handleExportEWayBillPDF(ewb)} className="px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold rounded hover:text-white transition-all cursor-pointer">
                                    PDF
                                  </button>
                                  <button onClick={() => handleExportCSV('waybills')} className="px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold rounded hover:text-white transition-all cursor-pointer">
                                    CSV
                                  </button>
                               </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: Platform Settings Control Panel */}
          {/* ========================================================================= */}
          {activeTab === 'admin' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-500" /> Platform Control Config
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/40 text-xs font-mono uppercase">
                  System Settings
                </span>
              </div>

              <GlassCard className="p-6 space-y-6">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase font-mono font-bold text-zinc-500 dark:text-slate-400 tracking-wider">Appearance</h3>
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-100/60 dark:bg-slate-950/60 border border-border hover:bg-zinc-200/50 dark:hover:bg-slate-950 transition-colors">
                      <div className="space-y-1 pr-4">
                        <strong className="text-sm text-foreground font-bold block">Interface Theme Mode</strong>
                        <p className="text-xs text-zinc-500 dark:text-slate-500 leading-normal">Choose between Light, Dark, or System synchronization.</p>
                      </div>
                      <ThemeToggle />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-border">
                    <h3 className="text-xs uppercase font-mono font-bold text-zinc-500 dark:text-slate-400 tracking-wider">Operational Engines</h3>
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 hover:bg-slate-950 transition-colors">
                      <div className="space-y-1 pr-4">
                        <strong className="text-sm text-slate-200 font-bold block">AI Routing Dispatch Engine</strong>
                        <p className="text-xs text-slate-500 leading-normal">Scans nearby transport providers to auto-assign shipments to low-cost routes.</p>
                      </div>
                      <input type="checkbox" checked={aiRoutingEngine} onChange={() => setAiRoutingEngine(!aiRoutingEngine)} className="w-4 h-4 rounded border-slate-800 text-blue-600 bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 hover:bg-slate-950 transition-colors">
                      <div className="space-y-1 pr-4">
                        <strong className="text-sm text-slate-200 font-bold block">Dynamic Toll & Surge pricing</strong>
                        <p className="text-xs text-slate-500 leading-normal">Adds surge charges to contracts during gridlocks or severe rain alerts.</p>
                      </div>
                      <input type="checkbox" checked={dynamicPricing} onChange={() => setDynamicPricing(!dynamicPricing)} className="w-4 h-4 rounded border-slate-800 text-blue-600 bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 hover:bg-slate-950 transition-colors">
                      <div className="space-y-1 pr-4">
                        <strong className="text-sm text-slate-200 font-bold block">Auto-SMS Client notifications</strong>
                        <p className="text-xs text-slate-500 leading-normal">Broadcasts automated SMS updates to client phones.</p>
                      </div>
                      <input type="checkbox" checked={smsDispatch} onChange={() => setSmsDispatch(!smsDispatch)} className="w-4 h-4 rounded border-slate-800 text-blue-600 bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 hover:bg-slate-950 transition-colors">
                      <div className="space-y-1 pr-4">
                        <strong className="text-sm text-slate-200 font-bold block">Driver Fatigue Watchdog</strong>
                        <p className="text-xs text-slate-500 leading-normal">Flags drivers whose active schedules breach the 8-hour shift limits.</p>
                      </div>
                      <input type="checkbox" checked={fatigueWatchdog} onChange={() => setFatigueWatchdog(!fatigueWatchdog)} className="w-4 h-4 rounded border-slate-800 text-blue-600 bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-slate-850">
                    <h3 className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">Audit Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-slate-500 uppercase font-mono font-bold">Route Audit Frequency (sec)</label>
                        <input type="number" defaultValue="30" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] text-slate-500 uppercase font-mono font-bold">Max Range Allocation (km)</label>
                        <input type="number" defaultValue="250" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>

                  {saveStatus && <p className="text-xs font-mono text-emerald-400 text-center">{saveStatus}</p>}

                  <div className="flex gap-3 pt-2 border-t border-slate-850">
                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all cursor-pointer">SAVE CONFIGURATION</button>
                    <button type="button" onClick={handleResetMetrics} className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded text-xs font-bold transition-all cursor-pointer">RESET SYSTEM METRICS</button>
                  </div>
                </form>
              </GlassCard>
            </div>
          )}

          {/* Fleet view */}
          {activeTab === 'fleet' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-500" /> registered carrier vehicles
                </h2>
                <button onClick={() => setVehicleModalOpen(true)} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                  <Plus className="w-4 h-4" /> REGISTER VEHICLE
                </button>
              </div>

              {vehicleModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <GlassCard glowColor="blue" className="w-full max-w-md p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                      <h3 className="font-bold text-slate-100 text-sm">Register Fleet Vehicle</h3>
                      <button onClick={() => setVehicleModalOpen(false)} className="text-slate-500 hover:text-white text-lg font-bold">×</button>
                    </div>
                    <form onSubmit={handleRegisterVehicle} className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">License Plate Number</label>
                        <input required type="text" value={vPlate} onChange={(e) => setVPlate(e.target.value)} placeholder="e.g. MH-12-AB-1234" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-505">Capacity Class</label>
                        <select value={vClass} onChange={(e) => setVClass(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
                          <option value="light_van">Light Delivery Van (3.5 Tons)</option>
                          <option value="medium_box">Medium Cargo Box (8 Tons)</option>
                          <option value="heavy_truck">Heavy Haulage Truck (16 Tons)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Assigned Operator Name</label>
                        <input required type="text" value={vDriver} onChange={(e) => setVDriver(e.target.value)} placeholder="e.g. Ram Prasad" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-505">Hub operating Zone</label>
                        <input required type="text" value={vHub} onChange={(e) => setVHub(e.target.value)} placeholder="e.g. West Hub (Pune)" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Initial Fuel Telemetry (%)</label>
                        <input required type="number" min="0" max="100" value={vTelemetry} onChange={(e) => setVTelemetry(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                      </div>
                      <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs transition-all cursor-pointer">ADD VEHICLE TO FLEET</button>
                    </form>
                  </GlassCard>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((v) => (
                  <GlassCard key={v.id} glowColor={v.telemetry_fuel < 40 ? 'purple' : 'none'} className="p-5 flex flex-col justify-between h-48">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono font-bold text-blue-400 text-xs">{v.plate_number}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          v.status === 'in_service' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                        }`}>
                          {v.status.toUpperCase()}
                        </span>
                      </div>
                      <strong className="text-sm text-slate-200 font-bold block mb-1">{v.capacity_class.toUpperCase().replace('_', ' ')}</strong>
                      <p className="text-xs text-slate-500">Driver: {v.driver_name}</p>
                      <p className="text-xs text-slate-500">Assigned Zone: {v.operating_hub}</p>
                    </div>
                    <div className="space-y-1 text-xs pt-3 border-t border-slate-850">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                        <span>FUEL telemetry</span>
                        <span className={v.telemetry_fuel < 40 ? 'text-red-400' : 'text-slate-400'}>{v.telemetry_fuel}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${v.telemetry_fuel < 40 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${v.telemetry_fuel}%` }} />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Drivers view */}
          {activeTab === 'drivers' && (
            userRole.toLowerCase() === 'driver' ? (
              // Driver Personal Portal
              <div className="space-y-6 animate-slide-up">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                  <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-500" /> Driver Operational Portal
                  </h2>
                  <span className="px-2.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/40 text-xs font-mono uppercase">
                    My Terminal
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Safety & Vehicle Profile */}
                  <div className="lg:col-span-4 space-y-6">
                    <GlassCard glowColor="blue" className="p-5 space-y-4">
                      <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">Driver Profile</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-md">
                          R
                        </div>
                        <div>
                          <strong className="text-sm text-slate-200 font-bold block">Rajesh Kumar</strong>
                          <span className="text-[10px] text-slate-500 font-mono">ID: RTX-DRV-802 | CLASS A CDL</span>
                        </div>
                      </div>
                      <div className="space-y-2 pt-3 border-t border-slate-850 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Safety Index:</span>
                          <span className="text-emerald-400 font-bold">98/100 (Top 5%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Assigned Truck:</span>
                          <span className="text-slate-300 font-mono font-bold">MH-12-Q-4029</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Fastag Balance:</span>
                          <span className="text-slate-300 font-bold">₹4,250 (Active)</span>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard glowColor="purple" className="p-5 space-y-4">
                      <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">Pre-Trip Safety Checklist</h3>
                      <div className="space-y-3 text-xs">
                        <label className="flex items-center gap-2.5 p-2 rounded bg-slate-950/40 border border-slate-850 hover:bg-slate-950 transition-colors cursor-pointer select-none">
                          <input type="checkbox" checked={checklist.inspection} onChange={() => setChecklist(prev => ({ ...prev, inspection: !prev.inspection }))} className="w-4 h-4 rounded border-slate-800 text-blue-600 bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                          <span className={checklist.inspection ? 'text-slate-400 line-through' : 'text-slate-200'}>Pre-trip vehicle mechanical audit</span>
                        </label>
                        <label className="flex items-center gap-2.5 p-2 rounded bg-slate-950/40 border border-slate-850 hover:bg-slate-950 transition-colors cursor-pointer select-none">
                          <input type="checkbox" checked={checklist.documents} onChange={() => setChecklist(prev => ({ ...prev, documents: !prev.documents }))} className="w-4 h-4 rounded border-slate-800 text-blue-600 bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                          <span className={checklist.documents ? 'text-slate-400 line-through' : 'text-slate-200'}>E-Way Bill & Invoice document verification</span>
                        </label>
                        <label className="flex items-center gap-2.5 p-2 rounded bg-slate-950/40 border border-slate-850 hover:bg-slate-950 transition-colors cursor-pointer select-none">
                          <input type="checkbox" checked={checklist.cargo} onChange={() => setChecklist(prev => ({ ...prev, cargo: !prev.cargo }))} className="w-4 h-4 rounded border-slate-800 text-blue-600 bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                          <span className={checklist.cargo ? 'text-slate-400 line-through font-bold text-emerald-400' : 'text-slate-200'}>Cargo security & loading bounds checked</span>
                        </label>
                        <label className="flex items-center gap-2.5 p-2 rounded bg-slate-950/40 border border-slate-850 hover:bg-slate-950 transition-colors cursor-pointer select-none">
                          <input type="checkbox" checked={checklist.fastag} onChange={() => setChecklist(prev => ({ ...prev, fastag: !prev.fastag }))} className="w-4 h-4 rounded border-slate-800 text-blue-600 bg-slate-900 focus:ring-blue-500 cursor-pointer" />
                          <span className={checklist.fastag ? 'text-slate-400 line-through font-bold text-emerald-400' : 'text-slate-200'}>Fastag balance and route toll cleared</span>
                        </label>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Shipment Status Simulator */}
                  <div className="lg:col-span-8">
                    <GlassCard className="p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800/60 pb-2 mb-2">
                        <h3 className="text-xs uppercase font-mono font-bold text-slate-400">My Active Shipment Dispatch</h3>
                        {(() => {
                          const activeShipment = dispatches.find(d => d.order_id === '#RTX-8801');
                          return activeShipment ? (
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/30 text-[10px] font-bold">
                              STATUS: {activeShipment.status.toUpperCase()}
                            </span>
                          ) : null;
                        })()}
                      </div>

                      {(() => {
                        const activeShipment = dispatches.find(d => d.order_id === '#RTX-8801');
                        if (!activeShipment) return <p className="text-xs text-slate-500">No active shipment dispatches assigned.</p>;

                        return (
                          <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-950 border border-slate-850 font-mono">
                              <div>
                                <span className="text-[10px] text-slate-500 block">WAYBILL</span>
                                <strong className="text-blue-400 font-bold text-sm">{activeShipment.order_id}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">CLIENT</span>
                                <strong className="text-slate-200 font-bold">{activeShipment.client_name}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">ROUTE CORRIDOR</span>
                                <strong className="text-slate-200">{activeShipment.origin} → {activeShipment.destination}</strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">CARGO WEIGHT</span>
                                <strong className="text-slate-200">{activeShipment.weight} KG</strong>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-[10px] uppercase font-mono font-bold text-slate-500">Simulate Real-time Transit Telemetry</h4>
                              <p className="text-slate-400 leading-relaxed text-[11px]">
                                Click these buttons to trigger real-time updates as you drive. This updates the vertical tracking stepper and map indicators for managers and clients.
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleDriverStatusUpdate('in_transit')}
                                  disabled={activeShipment.status === 'in_transit'}
                                  className="py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded-lg font-bold text-xs transition-all cursor-pointer disabled:opacity-40"
                                >
                                  🚚 MARK IN TRANSIT
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDriverStatusUpdate('out_for_delivery')}
                                  disabled={activeShipment.status === 'out_for_delivery'}
                                  className="py-3 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-400 rounded-lg font-bold text-xs transition-all cursor-pointer disabled:opacity-40"
                                >
                                  📍 MARK OUT FOR DELIVERY
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDriverStatusUpdate('delivered')}
                                  disabled={activeShipment.status === 'delivered'}
                                  className="py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 rounded-lg font-bold text-xs transition-all cursor-pointer disabled:opacity-40"
                                >
                                  ✅ CONFIRM DELIVERED
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </GlassCard>
                  </div>

                </div>
              </div>
            ) : (
              // Original Carrier Driver registries view
              <div className="space-y-6 animate-slide-up">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-500" /> Carrier Driver registries
                  </h2>
                  <button onClick={() => setDriverModalOpen(true)} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
                    <Plus className="w-4 h-4" /> ADD SERVICE DRIVER
                  </button>
                </div>

                {driverModalOpen && (
                  <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <GlassCard glowColor="purple" className="w-full max-w-md p-6 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                        <h3 className="font-bold text-slate-100 text-sm">Add Driver to Service</h3>
                        <button onClick={() => setDriverModalOpen(false)} className="text-slate-500 hover:text-white text-lg font-bold">×</button>
                      </div>
                      <form onSubmit={handleAddDriver} className="space-y-3.5 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Driver Full Name</label>
                          <input required type="text" value={dName} onChange={(e) => setDName(e.target.value)} placeholder="e.g. Ram Prasad" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-505">Hub Zone Assignment</label>
                          <input required type="text" value={dHub} onChange={(e) => setDHub(e.target.value)} placeholder="e.g. South Hub (Bangalore)" className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Safety Index Rating (0-100)</label>
                          <input required type="number" min="0" max="100" value={dSafety} onChange={(e) => setDSafety(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                        </div>
                        <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs transition-all cursor-pointer">REGISTER ACTIVE DRIVER</button>
                      </form>
                    </GlassCard>
                  </div>
                )}

                <GlassCard className="p-5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                          <th className="py-2.5 font-bold">DRV ID</th>
                          <th className="py-2.5 font-bold">NAME</th>
                          <th className="py-2.5 font-bold">HUB ZONE</th>
                          <th className="py-2.5 font-bold">SAFETY PROFILE</th>
                          <th className="py-2.5 font-bold">STATUS</th>
                          <th className="py-2.5 font-bold">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300">
                        {drivers.map((drv, idx) => (
                          <tr key={drv.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-3.5 font-mono font-bold text-blue-400">#DRV-{idx + 104}</td>
                            <td className="py-3.5 font-semibold text-slate-200">{drv.full_name}</td>
                            <td className="py-3.5">{drv.hub_assignment}</td>
                            <td className="py-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/30">
                                {drv.safety_rating}/100 Rating
                              </span>
                            </td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                drv.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' : 'bg-red-950 text-red-400 border border-red-900/30'
                              }`}>
                                {drv.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <button onClick={() => toggleDriverStatus(drv.id)} className="px-2 py-1 rounded font-bold text-[10px] bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer">
                                {drv.status === 'active' ? 'SUSPEND' : 'ACTIVATE'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            )
          )}

          {/* Book Shipments view */}
          {activeTab === 'packages' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" /> Book priority dispatches
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/40 text-xs font-mono uppercase">
                  Parcel Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4">
                  <GlassCard className="p-5 space-y-4">
                    <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">Book priority Waybill</h3>
                    <form onSubmit={handleBookWaybill} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Client Name</label>
                        <select value={bookClient} onChange={(e) => setBookClient(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer">
                          <option value="Tata Steel Ltd">Tata Steel Ltd</option>
                          <option value="Reliance Ind">Reliance Ind</option>
                          <option value="Flipkart Hub">Flipkart Hub</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Destination Corridor</label>
                        <select value={bookRoute} onChange={(e) => setBookRoute(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer">
                          <option value="Mumbai → Pune">Mumbai → Pune</option>
                          <option value="Kolkata → Patna">Kolkata → Patna</option>
                          <option value="Bangalore → Chennai">Bangalore → Chennai</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Package Weight (KG)</label>
                        <input required type="number" value={bookWeight} onChange={(e) => setBookWeight(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Delivery Priority</label>
                        <select value={bookPriority} onChange={(e) => setBookPriority(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer">
                          <option value="STANDARD">STANDARD</option>
                          <option value="EXPRESS">EXPRESS</option>
                          <option value="URGENT">URGENT</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs transition-all cursor-pointer">DISPATCH TO LINE</button>
                    </form>
                  </GlassCard>
                </div>

                <div className="lg:col-span-8">
                  <GlassCard className="p-5 space-y-4">
                    <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">Live dispatch matrix</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="py-2.5 font-bold">WAYBILL</th>
                            <th className="py-2.5 font-bold">SENDER CLIENT</th>
                            <th className="py-2.5 font-bold">ROUTE</th>
                            <th className="py-2.5 font-bold">WEIGHT</th>
                            <th className="py-2.5 font-bold">PRIORITY</th>
                            <th className="py-2.5 font-bold">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-slate-300">
                          {waybills.map((w) => (
                            <tr key={w.id} className="hover:bg-slate-900/30 transition-colors">
                              <td className="py-3.5 font-mono font-bold text-blue-400">{w.id}</td>
                              <td className="py-3.5 font-semibold text-slate-200">{w.client}</td>
                              <td className="py-3.5">{w.route}</td>
                              <td className="py-3.5">{w.weight}</td>
                              <td className="py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  w.priority === 'URGENT' ? 'bg-red-950 text-red-400 border border-red-900/30' : 'bg-slate-905 text-slate-405'
                                }`}>
                                  {w.priority}
                                </span>
                              </td>
                              <td className="py-3.5">
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold">{w.status.toUpperCase()}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>
          )}

          {/* CRM database view */}
          {activeTab === 'database' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" /> B2B Client management (CRM)
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/40 text-xs font-mono uppercase">
                  Active Accounts
                </span>
              </div>

              <GlassCard className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500">
                        <th className="py-2.5 font-bold">CLIENT CODE</th>
                        <th className="py-2.5 font-bold">COMPANY NAME</th>
                        <th className="py-2.5 font-bold">ACCOUNT CATEGORY</th>
                        <th className="py-2.5 font-bold">SHIPMENTS/MO</th>
                        <th className="py-2.5 font-bold">CONTRACT STATUS</th>
                        <th className="py-2.5 font-bold">TIER STATE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {mockDb.clients.map((c) => (
                        <tr key={c.client_code} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 font-mono font-bold text-blue-400">{c.client_code}</td>
                          <td className="py-4 font-semibold text-slate-200">{c.company_name}</td>
                          <td className="py-4 text-slate-400">{c.category}</td>
                          <td className="py-4">{c.shipments_mo}</td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold">Active</span>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/30 text-[10px] font-bold font-mono">{c.tier}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Compliance Audits view */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" /> compliance audits & fuel summary
                </h2>
                <button onClick={handleExportPDF} disabled={pdfProgress !== -1} className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  <FileText className="w-4 h-4 text-slate-400" /> EXPORT FISCAL REPORT
                </button>
              </div>

              {pdfProgress !== -1 && (
                <GlassCard className="border-cyan-900/40 p-5 space-y-2">
                  <strong className="text-xs font-mono font-bold text-slate-300 block">
                    {pdfSuccess ? '✅ LEDGER REPORT DOWNLOADED' : '⚙️ GENERATING COMPLIANCE SCHEDULING LEDGER...'}
                  </strong>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full transition-all duration-300" style={{ width: `${pdfProgress}%` }} />
                  </div>
                </GlassCard>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-5 space-y-4">
                  <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">Fuel usage Reconciliation</h3>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500">
                        <th className="py-2.5 font-bold">HUB REGION</th>
                        <th className="py-2.5 font-bold">COST (INR)</th>
                        <th className="py-2.5 font-bold">AI OPT. PATHING</th>
                        <th className="py-2.5 font-bold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {[
                        { hub: 'West Hub (Pune)', cost: '₹1,84,000', km: '14,200 km', status: 'compliant' },
                        { hub: 'North Hub (Delhi)', cost: '₹2,10,000', km: '16,500 km', status: 'compliant' },
                        { hub: 'South Hub (Bangalore)', cost: '₹1,60,000', km: '12,900 km', status: 'compliant' },
                        { hub: 'East Hub (Kolkata)', cost: '₹1,30,000', km: '9,800 km', status: 'pending' },
                      ].map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-3 font-semibold text-slate-200">{item.hub}</td>
                          <td className="py-3 font-mono">{item.cost}</td>
                          <td className="py-3">{item.km}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/30 text-[10px] font-bold">{item.status.toUpperCase()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </GlassCard>

                <GlassCard className="p-5 space-y-4">
                  <h3 className="text-xs uppercase font-mono font-bold text-slate-400 border-b border-slate-850 pb-2 mb-2">Emission Audit margins</h3>
                  <div className="space-y-4 text-xs font-mono text-slate-300">
                    <div className="grid grid-cols-2 gap-y-2">
                      <div className="text-slate-500">Fleet Average Rating:</div>
                      <div className="text-slate-200 text-right font-bold">Tier 4 EPA Compliant</div>
                      <div className="text-slate-500">Carbon Saving Multiplier:</div>
                      <div className="text-slate-200 text-right font-bold">1.4x against standard baseline</div>
                      <div className="text-slate-500">Electric Vehicle Ratio:</div>
                      <div className="text-slate-200 text-right font-bold">12% Electric Vans</div>
                    </div>
                    <div className="space-y-2 pt-3 border-t border-slate-850">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>FLEET CO2 REDUCTION TARGET</span>
                        <span className="text-emerald-400">88% TARGET REACHED</span>
                      </div>
                      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: '88%' }} />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------------
// Clerk Wrapper Dashboard
// -------------------------------------------------------------------------
const ClerkDashboard: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const userName = user?.fullName || 'Clerk User';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'user@clerk.com';
  const userRole = (user?.publicMetadata?.role as string) || 'admin';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <DashboardContent
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
      onLogout={handleSignOut}
    />
  );
};

// -------------------------------------------------------------------------
// Mock Wrapper Dashboard
// -------------------------------------------------------------------------
const MockDashboard: React.FC = () => {
  const router = useRouter();
  
  const [userName, setUserName] = useState('Admin User');
  const [userEmail, setUserEmail] = useState('admin@routexindia.ai');
  const [userRole, setUserRole] = useState('admin');

  useEffect(() => {
    setUserName(localStorage.getItem('routex_demo_name') || 'Admin User');
    setUserEmail(localStorage.getItem('routex_demo_email') || 'admin@routexindia.ai');
    setUserRole(localStorage.getItem('routex_demo_role') || 'admin');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('routex_authenticated');
    localStorage.removeItem('routex_demo_role');
    localStorage.removeItem('routex_demo_name');
    localStorage.removeItem('routex_demo_email');
    router.push('/');
  };

  return (
    <DashboardContent
      userName={userName}
      userEmail={userEmail}
      userRole={userRole}
      onLogout={handleLogout}
    />
  );
};

// -------------------------------------------------------------------------
// Master Page Entrypoint
// -------------------------------------------------------------------------
export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Choose dashboard wrapper based on Clerk key availability
  if (hasClerkKey) {
    return <ClerkDashboard />;
  }

  return <MockDashboard />;
}
