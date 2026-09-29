"use client";

import React, { useState } from "react";
import { CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

interface ContactSectionProps {
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export const ContactSection = ({
  title = "Ready to optimize your Indian supply chain?",
  description = "Connect with our system integration engineers to deploy RouteXIndia.AI across your logistics network. We are available for questions, feedback, or custom integrations.",
  phone = "+91 22 4901 0290",
  email = "ops@routexindia.ai",
  address = "Lower Parel, Mumbai, MH, 400013",
}: ContactSectionProps) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 max-w-7xl mx-auto px-6 z-10 relative">
      <GlassCard glowColor="purple" className="p-8 md:p-12 border-border/60">
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-20">
          
          {/* Left Details Panel */}
          <div className="flex flex-col justify-between gap-10 max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-400">
                <Mail className="w-5 h-5" />
                <span className="font-mono text-xs uppercase font-bold tracking-wider">Contact Ops Center</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {title}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2">
                Contact Details
              </h3>
              <ul className="space-y-3.5 text-xs text-slate-350 font-mono">
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>📍 HQ: {address}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>📞 Phone: {phone}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>✉️ Email: <a href={`mailto:${email}`} className="underline hover:text-purple-300">{email}</a></span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="flex-1 max-w-2xl w-full">
            {contactSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center p-8 rounded-xl bg-emerald-950/40 border border-emerald-900/40 text-center space-y-4 py-16 animate-fade-in">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
                <h3 className="text-xl font-bold text-slate-250">Query Logged Successfully</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Our Indian logistics analysts and system integration engineers will contact your team within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full space-y-1.5">
                    <label htmlFor="firstname" className="block text-[10px] uppercase font-bold font-mono text-zinc-500">First Name</label>
                    <input 
                      type="text" 
                      id="firstname"
                      required 
                      className="w-full bg-zinc-100 dark:bg-zinc-905 border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500" 
                      placeholder="First Name"
                    />
                  </div>
                  <div className="w-full space-y-1.5">
                    <label htmlFor="lastname" className="block text-[10px] uppercase font-bold font-mono text-zinc-500">Last Name</label>
                    <input 
                      type="text" 
                      id="lastname"
                      required 
                      className="w-full bg-zinc-100 dark:bg-zinc-905 border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500" 
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-[10px] uppercase font-bold font-mono text-zinc-500">Work Email</label>
                  <input 
                    type="email" 
                    id="email"
                    required 
                    className="w-full bg-zinc-100 dark:bg-zinc-905 border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500" 
                    placeholder="name@company.com"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="block text-[10px] uppercase font-bold font-mono text-zinc-500">Subject</label>
                  <input 
                    type="text" 
                    id="subject"
                    required 
                    className="w-full bg-zinc-100 dark:bg-zinc-905 border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500" 
                    placeholder="e.g. Route Integration / API Setup"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="block text-[10px] uppercase font-bold font-mono text-zinc-500">Message</label>
                  <textarea 
                    id="message"
                    rows={4} 
                    required 
                    className="w-full bg-zinc-100 dark:bg-zinc-905 border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-purple-500 resize-none" 
                    placeholder="Type your message here..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(37,99,235,0.2)]"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
          
        </div>
      </GlassCard>
    </section>
  );
};
