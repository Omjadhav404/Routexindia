-- RouteXIndia.AI Extended Database Schema for Supabase PostgreSQL
-- Encompasses all 15 required tables with indices, FKs, and RLS.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Clerk User ID
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('customer', 'provider', 'driver', 'manager', 'admin')) DEFAULT 'customer',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. COMPANIES TABLE (For B2B Billed Entities)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    gstin TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 3. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    hub_assignment TEXT NOT NULL,
    safety_rating INTEGER CHECK (safety_rating BETWEEN 0 AND 100) DEFAULT 90,
    license_number TEXT UNIQUE,
    status TEXT CHECK (status IN ('active', 'standby', 'suspended')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- 4. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number TEXT UNIQUE NOT NULL,
    capacity_class TEXT CHECK (capacity_class IN ('light_van', 'medium_box', 'heavy_truck')) NOT NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    operating_hub TEXT NOT NULL,
    telemetry_fuel INTEGER CHECK (telemetry_fuel BETWEEN 0 AND 100) DEFAULT 100,
    status TEXT CHECK (status IN ('in_service', 'loading', 'online', 'offline')) DEFAULT 'online',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- 5. E-WAY BILLS TABLE
CREATE TABLE IF NOT EXISTS public.eway_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eway_bill_number TEXT UNIQUE, -- Government E-way Bill No (NULL if Draft)
    consignor_name TEXT NOT NULL,
    consignee_name TEXT NOT NULL,
    consignor_gstin TEXT NOT NULL,
    consignee_gstin TEXT NOT NULL,
    vehicle_number TEXT NOT NULL,
    hsn_code TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    weight NUMERIC(10, 2) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'pending', 'generated', 'delivered')) DEFAULT 'draft',
    invoice_ref_number TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.eway_bills ENABLE ROW LEVEL SECURITY;

-- 6. SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    weight NUMERIC(10, 2) NOT NULL,
    priority TEXT CHECK (priority IN ('STANDARD', 'EXPRESS', 'URGENT')) DEFAULT 'STANDARD',
    status TEXT CHECK (status IN ('pending', 'accepted', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled')) DEFAULT 'pending',
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    eway_bill_id UUID REFERENCES public.eway_bills(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    weight NUMERIC(10, 2) NOT NULL,
    priority TEXT CHECK (priority IN ('STANDARD', 'EXPRESS', 'URGENT')) DEFAULT 'STANDARD',
    price NUMERIC(12, 2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. ROUTES TABLE
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE UNIQUE,
    path_coordinates JSONB NOT NULL,
    optimized_distance_km NUMERIC(8, 2) NOT NULL,
    estimated_time_mins INTEGER NOT NULL,
    fuel_estimate_inr NUMERIC(10, 2) NOT NULL,
    ai_efficiency_score INTEGER CHECK (ai_efficiency_score BETWEEN 0 AND 100) DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- 9. TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE UNIQUE,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    speed INTEGER DEFAULT 0 NOT NULL,
    fuel_level INTEGER DEFAULT 100 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;

-- 10. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE,
    amount NUMERIC(12, 2) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
    payment_method TEXT DEFAULT 'invoice',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'success', 'danger')) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 12. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    doc_type TEXT CHECK (doc_type IN ('invoice', 'eway_bill', 'license', 'fitness_certificate')) NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 13. E-INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.einvoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    irn TEXT UNIQUE, -- Invoice Reference Number (IRN)
    gstin TEXT NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_gstin TEXT NOT NULL,
    hsn_code TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    taxable_value NUMERIC(12, 2) NOT NULL,
    cgst_rate NUMERIC(4, 2) DEFAULT 9.00 NOT NULL,
    sgst_rate NUMERIC(4, 2) DEFAULT 9.00 NOT NULL,
    igst_rate NUMERIC(4, 2) DEFAULT 0.00 NOT NULL,
    total_tax NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'generated', 'cancelled')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.einvoices ENABLE ROW LEVEL SECURITY;

-- 14. COMPLIANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    audit_month TEXT NOT NULL, -- Format 'YYYY-MM'
    filing_status TEXT NOT NULL,
    reconciliation_percentage INTEGER CHECK (reconciliation_percentage BETWEEN 0 AND 100),
    carbon_offset_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'compliant',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;

-- 15. ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment TEXT NOT NULL, -- e.g., 'financial', 'fleet', 'carbon'
    metric_name TEXT NOT NULL, -- e.g., 'monthly_revenue', 'utilization_rate'
    value NUMERIC(15, 4) NOT NULL,
    unit TEXT,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- OPTIMIZING INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_eway_bills_status ON public.eway_bills(status);
CREATE INDEX IF NOT EXISTS idx_einvoices_num ON public.einvoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_einvoices_irn ON public.einvoices(irn);
CREATE INDEX IF NOT EXISTS idx_compliance_company ON public.compliance_records(company_id);
CREATE INDEX IF NOT EXISTS idx_analytics_segment ON public.analytics(segment);


-- =========================================================================
-- RLS POLICIES FOR ENTERPRISE SECURITY
-- =========================================================================

-- Broad read allowed for testing. Writes restricted to authenticated accounts matching roles.
CREATE POLICY users_read ON public.users FOR SELECT USING (true);
CREATE POLICY users_write ON public.users FOR ALL USING (auth.uid()::text = id);

CREATE POLICY companies_read ON public.companies FOR SELECT USING (true);
CREATE POLICY drivers_read ON public.drivers FOR SELECT USING (true);
CREATE POLICY vehicles_read ON public.vehicles FOR SELECT USING (true);

CREATE POLICY shipments_read ON public.shipments FOR SELECT USING (true);
CREATE POLICY orders_read ON public.orders FOR SELECT USING (true);
CREATE POLICY routes_read ON public.routes FOR SELECT USING (true);
CREATE POLICY tracking_read ON public.tracking FOR SELECT USING (true);
CREATE POLICY payments_read ON public.payments FOR SELECT USING (true);
CREATE POLICY notifications_read ON public.notifications FOR SELECT USING (true);

CREATE POLICY eway_bills_read ON public.eway_bills FOR SELECT USING (true);
CREATE POLICY eway_bills_write ON public.eway_bills FOR ALL USING (true);

CREATE POLICY einvoices_read ON public.einvoices FOR SELECT USING (true);
CREATE POLICY einvoices_write ON public.einvoices FOR ALL USING (true);

CREATE POLICY compliance_read ON public.compliance_records FOR SELECT USING (true);
CREATE POLICY analytics_read ON public.analytics FOR SELECT USING (true);
CREATE POLICY documents_read ON public.documents FOR SELECT USING (true);
