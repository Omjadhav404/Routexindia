'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  MapPin, 
  Shield, 
  User, 
  Truck, 
  Package, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  TrendingUp,
  HelpCircle,
  Mail,
  Zap,
  Check,
  Fuel,
  Compass,
  AlertTriangle,
  Sparkles,
  Tag,
  ArrowUp,
  Settings
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { GlowCard } from '@/components/ui/glow-card';
import RealismButton from '@/components/ui/realism-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';
import { TextRotate } from '@/components/ui/text-rotate';
import { ShaderAnimation } from '@/components/shader-animation';
import { SparklesText } from '@/components/ui/sparkles-text';
import { NavBar } from '@/components/ui/navbar';
import { FloatingPaths } from '@/components/ui/background-paths';
import { PricingCard, ShaderCanvas } from '@/components/ui/modern-pricing';
import { MenuContainer, MenuItem } from '@/components/ui/expanding-menu';
import { Sparkles as ParticlesSparkles } from '@/components/ui/sparkles';
import { Contact2 } from '@/components/ui/contact2';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const navItems = [
    { name: 'Features', url: '#features', icon: Zap },
    { name: 'AI Engine', url: '#ai-capabilities', icon: Bot },
    { name: 'Live Demo', url: '#demo', icon: Compass },
    { name: 'Pricing', url: '#pricing', icon: Tag },
    { name: 'FAQ', url: '#faq', icon: HelpCircle },
  ];

  const plans = [
    {
      planName: "Basic Dispatch",
      description: "Ideal for small regional carriers with up to 10 vehicles.",
      price: "9,999",
      features: [
        "Standard Route Planning",
        "GPS Live Telemetry",
        "Up to 10 Active Vehicles",
        "AI Route Optimization (Llama)",
      ],
      buttonText: "Get Started",
      isPopular: false,
      buttonVariant: "secondary" as const,
    },
    {
      planName: "Enterprise AI",
      description: "Perfect for growing B2B shipping hubs and multi-city fleets.",
      price: "29,999",
      features: [
        "Dynamic AI Route Planning",
        "Google Maps Telemetry Interface",
        "Up to 100 Active Vehicles",
        "AI Command Center Copilot",
        "Safety & Weather risk monitoring",
      ],
      buttonText: "Subscribe Now",
      isPopular: true,
      buttonVariant: "primary" as const,
    },
    {
      planName: "Industrial Cargo",
      description: "Tailored solutions for major B2B manufacturing concerns.",
      price: "Custom",
      features: [
        "Dedicated Groq AI Models",
        "Custom Supabase Realtime Channels",
        "Unlimited Registered Vehicles",
        "Dedicated Fleet Compliance Manager",
        "Custom Database and Invoicing integration",
      ],
      buttonText: "Contact Sales",
      isPopular: false,
      buttonVariant: "secondary" as const,
    },
  ];

  const faqItems = [
    { q: 'How does RouteXIndia.AI optimize transit routes?', a: 'Our proprietary AI routing engine processes live highway gridlock telemetry, Fastag checkpoint delays, current monsoon/weather severity alerts, and vehicle cargo weights to select the lowest-cost, safest path across India\'s national highway network.' },
    { q: 'What is the "At-Risk" Driver Watchdog?', a: 'It is a safety index system that monitors driving durations and telemetry events like harsh braking or overspeeding. If a driver exceeds safety thresholds or runs shifts longer than 8 hours, it alerts the control room to schedule stopovers.' },
    { q: 'Can we use our own fleet vehicles?', a: 'Yes. RouteXIndia.AI allows transport providers to register custom vehicle fleets, configure capacity parameters, and automatically assign dispatches to certified drivers.' },
    { q: 'Is there a real-time notifications engine?', a: 'Yes. Powered by Supabase Realtime, the platform instantly broadcasts dispatch updates, rerouting alerts, and safety triggers to both clients and operational staff.' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-blue-600/30 relative overflow-hidden">
      
      {/* Background Paths */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 w-full bg-background/80 backdrop-blur-md z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
              RouteXIndia.AI
            </span>
            <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-widest mt-0.5">
              AI-Powered Logistics Intelligence
            </span>
          </div>

          <NavBar items={navItems} />

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-[0_4px_20px_rgba(37,99,235,0.25)] flex items-center gap-1.5"
            >
              Access Platform <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Shader Background */}
      <div className="relative overflow-hidden w-full">
        {/* Shader Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <ShaderAnimation />
        </div>

        {/* Hero Content */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 pt-20 pb-24 md:pt-32 md:pb-36 max-w-4xl mx-auto px-6 text-center space-y-8 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-900/40 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Next-Generation Logistics v5.0
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Logistics.<br />
            <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent inline-flex min-h-[1.2em]">
              <TextRotate
                texts={["AI-Optimized.", "Real-time.", "Carbon-smart.", "Weather-aware.", "Predictive."]}
                rotationInterval={2500}
                staggerDuration={0.025}
                mainClassName="bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent inline-flex"
                splitLevelClassName="overflow-hidden"
                elementLevelClassName="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500"
              />
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            AI-Powered Logistics Intelligence for India. Accelerate routing speeds, cut fuel emissions, track shipments in real-time, and manage fleets with active driver safety audits.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4 items-center">
            <Link href="/dashboard">
              <RealismButton text="Start as Customer" />
            </Link>
            <Link href="/dashboard">
              <RealismButton text="Join as Carrier" />
            </Link>
          </div>
        </motion.section>
      </div>

      {/* Network Stats Ticker with Sparkles Background */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-y border-border py-5"
      >
        {/* Sparkles background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-50">
          <ParticlesSparkles
            density={70}
            speed={0.6}
            size={1.5}
            color="#2563eb"
            className="w-full h-full"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-6 text-center text-sm font-mono tracking-widest text-slate-500">
          <div className="flex-1 min-w-[150px]">50,000+ DELIVERIES</div>
          <div className="flex-1 min-w-[150px]">2,000+ VEHICLES</div>
          <div className="flex-1 min-w-[150px]">99.4% ON-TIME</div>
          <div className="flex-1 min-w-[150px]">120+ CITIES ACCESSED</div>
          <div className="flex-1 min-w-[150px]">100% SMART DISPATCH</div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        id="features" 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 max-w-7xl mx-auto px-6"
      >
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <SparklesText
            text="Core Platform Infrastructure"
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            as="h2"
          />
          <p className="text-slate-400">
            A premium full-stack suite of enterprise-grade features designed to eliminate routing delays and operating overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <GlowCard customSize={true} glowColor="blue" className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-blue-600/10 text-blue-400">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">AI Command Center</h3>
            <p className="text-sm text-slate-400">
              Real-time dispatching and smart route pathing algorithms to maximize transport speeds and minimize empty runs.
            </p>
          </GlowCard>

          <GlowCard customSize={true} glowColor="green" className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-green-600/10 text-green-400">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Live GPS Tracking</h3>
            <p className="text-sm text-slate-400">
              Map integration showcasing operational vehicle telemetry, location coordinates, speeds, and fuel levels.
            </p>
          </GlowCard>

          <GlowCard customSize={true} glowColor="purple" className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-purple-600/10 text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Watchdog Protection</h3>
            <p className="text-sm text-slate-400">
              Active security monitoring of driver fatigue, speed limits, and extreme weather risks along major highways.
            </p>
          </GlowCard>

          <GlowCard customSize={true} glowColor="blue" className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-blue-600/10 text-blue-400">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">B2B Customer Portal</h3>
            <p className="text-sm text-slate-400">
              Seamless booking panels, instant waybill checkouts, automated invoices, and full customer shipping history.
            </p>
          </GlowCard>

          <GlowCard customSize={true} glowColor="orange" className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-orange-600/10 text-orange-400">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Fleet Operations</h3>
            <p className="text-sm text-slate-400">
              Carrier tools to manage vehicle lists, fuel capacities, operator safety ratings, and route assignments.
            </p>
          </GlowCard>

          <GlowCard customSize={true} glowColor="green" className="space-y-3">
            <div className="p-3 w-fit rounded-lg bg-green-600/10 text-green-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Emissions Audit</h3>
            <p className="text-sm text-slate-400">
              Granular analytics tracking logistics carbon footprint margins, fuel reductions, and compliance goals.
            </p>
          </GlowCard>

        </div>
      </motion.section>

      {/* AI capabilities section */}
      <motion.section 
        id="ai-capabilities" 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-20 bg-slate-950/40 border-y border-slate-800/50"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-2xl" />
            <GlassCard glowColor="purple" className="relative p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Bot className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-slate-100">Logistics Copilot</h3>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-zinc-100/60 dark:bg-zinc-900/60 border border-border">
                  <span className="text-blue-500 dark:text-blue-400 font-bold">&gt; Optimize Bangalore to Pune route</span>
                  <p className="text-zinc-650 dark:text-slate-400 mt-1">Calculated via NH-48. Distance: **840 km**. Saved **45 mins** by avoiding bypass road construction.</p>
                </div>
                <div className="p-2.5 rounded bg-zinc-100/60 dark:bg-zinc-900/60 border border-border">
                  <span className="text-blue-500 dark:text-blue-400 font-bold">&gt; Analyze monsoon risks West Sector</span>
                  <p className="text-zinc-650 dark:text-slate-400 mt-1">Alert: **Heavy rain** on Mumbai Expressway corridor. Advised 75% load throttle for vehicle safety.</p>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-purple-950 text-purple-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" /> GROQ COGNITIVE SPEED
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">AI Route & Fuel Optimization</h2>
            <p className="text-slate-400">
              Deploying Llama-3 neural models to dynamically run ETA predictions and risk profiles for drivers. RouteXIndia.AI integrates real-time weather alerts and toll pricing arrays.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-blue-500" /> Dynamic ETA forecasts accounting for toll gridlocks.</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-blue-500" /> Fuel efficiency stop location planner.</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4.5 h-4.5 text-blue-500" /> Climate risk throttling thresholds.</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* How it Works Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-24 max-w-7xl mx-auto px-6"
      >
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
          <p className="text-slate-400">Our dispatch algorithms automate dispatching control from invoice order booking to delivery points.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-border -z-10" />
          
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg mx-auto shadow-md">
              01
            </div>
            <h3 className="font-bold text-slate-200">Book Shipment</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Customers submit dispatches including cargo volume, dimensions, and locations via the B2B portal.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg mx-auto shadow-md">
              02
            </div>
            <h3 className="font-bold text-slate-200">AI Path Optimization</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              The AI dispatch scans for nearby available drivers and configures the most fuel-efficient route layout.
            </p>
          </div>

          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-lg mx-auto shadow-md">
              03
            </div>
            <h3 className="font-bold text-slate-200">Track & Complete</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Telemetry broadcasts location coordinates, speeds, and notifications live to all operators until delivery completion.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Route Optimization Demo */}
      <motion.section 
        id="demo" 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-20 bg-zinc-50/40 dark:bg-zinc-950/40 border-y border-border"
      >
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Interactive Route Planner Demo</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience our dynamic routing optimizer. Simulate distance and fuel values for major shipping sectors inside India.
          </p>
          <div className="max-w-xl mx-auto">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg transition-all"
            >
              Launch Live Interactive Map <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing" 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative py-24 w-full overflow-hidden border-t border-border bg-slate-950/40"
      >
        <ShaderCanvas />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Flexible Logistics Plans</h2>
            <p className="text-slate-400">Choose a scale optimized for your B2B supply chain or fleet operations.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-6 justify-center items-stretch w-full max-w-5xl mx-auto">
            {plans.map((plan) => (
              <PricingCard 
                key={plan.planName} 
                {...plan} 
                onButtonClick={() => {
                  if (plan.planName === "Industrial Cargo") {
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = "/dashboard";
                  }
                }}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq" 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-20 bg-zinc-50/40 dark:bg-zinc-950/40 border-t border-border"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-400">Answers to common queries regarding RouteXIndia.AI functionality.</p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <GlassCard 
                key={idx} 
                className="p-4 border-border cursor-pointer select-none transition-all"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {item.q}
                  </h4>
                  <span className="text-slate-500 text-xs font-bold font-mono">
                    {activeFaq === idx ? '−' : '+'}
                  </span>
                </div>
                {activeFaq === idx && (
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed animate-fade-in pl-6 border-l border-blue-500/20">
                    {item.a}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Contact2 
          title="Ready to optimize your Indian supply chain?"
          description="Connect with our system integration engineers to deploy RouteXIndia.AI across your logistics network. We are available for questions, feedback, or custom integrations."
          phone="+91 9322468515 , +91 7821900798"
          email="routexindia.ai@gmail.com"
        />
      </motion.div>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white px-6 py-14 border-t border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto">
          {/* Top Section: Logo and Description */}
          <div className="mb-12">
            <div className="mb-6 flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
                RouteXIndia.AI
              </span>
              <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-widest mt-0.5">
                AI-Powered Logistics Intelligence
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl font-sans">
              RouteXIndia.AI empowers shippers, carriers, and enterprise logistics networks with real-time routing intelligence, GPS vehicle telemetry, active driver safety watchdog protection, and automated dispatches.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-10">
            {/* Left Side: Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
              <div>
                <h3 className="text-sm font-medium mb-3 text-slate-900 dark:text-slate-100 font-sans">Product</h3>
                <ul className="space-y-2 font-sans">
                  <li><Link href="#features" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Features</Link></li>
                  <li><Link href="#ai-capabilities" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">AI Route Engine</Link></li>
                  <li><Link href="#demo" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Live Demo</Link></li>
                  <li><Link href="#pricing" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Pricing Plans</Link></li>
                  <li><Link href="#faq" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">FAQ Help</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3 text-slate-900 dark:text-slate-100 font-sans">Portals</h3>
                <ul className="space-y-2 font-sans">
                  <li><Link href="/dashboard" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Customer Console</Link></li>
                  <li><Link href="/dashboard" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Carrier Hub</Link></li>
                  <li><Link href="/dashboard" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">System Admin Control</Link></li>
                  <li><Link href="/dashboard" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Driver Companion</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3 text-slate-900 dark:text-slate-100 font-sans">Resources</h3>
                <ul className="space-y-2 font-sans">
                  <li><Link href="#" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Documentation</Link></li>
                  <li><Link href="#" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Logistics Guides</Link></li>
                  <li><Link href="#" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Case Studies</Link></li>
                  <li><Link href="#" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">System Status</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3 text-slate-900 dark:text-slate-100 font-sans">Legal</h3>
                <ul className="space-y-2 font-sans">
                  <li><Link href="#" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Privacy Policy</Link></li>
                  <li><Link href="#" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Terms of Service</Link></li>
                  <li><Link href="#" className="text-[0.85rem] text-gray-600 dark:text-gray-350 hover:text-blue-500 transition">Security Audits</Link></li>
                </ul>
              </div>
            </div>

            {/* Right Side: Newsletter and Contact */}
            <div className="lg:w-1/4 space-y-4">
              <div className="bg-zinc-100 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
                <p className="text-sm font-medium mb-3 text-slate-900 dark:text-slate-100 font-sans">For Corporates & Shippers</p>
                <Link href="#contact" className="block text-center w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(37,99,235,0.2)] font-sans">
                  Get In Touch
                </Link>
              </div>

              <div className="bg-zinc-100 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-xl p-5">
                <p className="text-xs font-mono uppercase font-bold text-zinc-500 mb-2">Follow Us</p>
                <div className="flex gap-4 text-slate-500 dark:text-slate-400">
                  <Link href="#" className="hover:text-blue-500 transition"><GithubIcon className="w-5 h-5" /></Link>
                  <Link href="#" className="hover:text-blue-500 transition"><TwitterIcon className="w-5 h-5" /></Link>
                  <Link href="#" className="hover:text-blue-500 transition"><LinkedinIcon className="w-5 h-5" /></Link>
                  <Link href="mailto:ops@routexindia.ai" className="hover:text-blue-500 transition"><Mail className="w-5 h-5" /></Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 dark:text-gray-400 gap-4 font-mono">
            <p>© 2026 ROUTEXINDIA.AI LOGISTICS PRIVATE LIMITED. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 font-sans">
              <Link href="#" className="hover:text-blue-500 transition">Privacy</Link>
              <Link href="#" className="hover:text-blue-500 transition">Terms</Link>
              <Link href="#" className="hover:text-blue-500 transition">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Menu for Quick Shortcuts */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:block">
        <MenuContainer>
          {/* First item - Trigger icon */}
          <div className="w-full h-full flex items-center justify-center text-blue-500 hover:text-blue-400">
            <Sparkles className="w-6 h-6 animate-pulse-slow" />
          </div>
          {/* Scroll to Top */}
          <MenuItem 
            icon={<ArrowUp className="w-5 h-5 text-emerald-500" />} 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          {/* Contact Section Support */}
          <MenuItem 
            icon={<Mail className="w-5 h-5 text-purple-500" />} 
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          />
          {/* FAQ section */}
          <MenuItem 
            icon={<HelpCircle className="w-5 h-5 text-cyan-500" />} 
            onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
          />
        </MenuContainer>
      </div>

    </div>
  );
}
