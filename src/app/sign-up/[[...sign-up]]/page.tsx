'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

export default function SignUpPage() {
  const router = useRouter();
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (hasClerkKey) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <SignUp signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
      </div>
    );
  }

  // Demo fallback
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 relative font-sans">
      <div className="absolute top-0 left-1/3 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 text-center relative z-10">
        <GlassCard glowColor="purple" className="p-8 space-y-4">
          <div className="p-3 w-fit rounded-full bg-purple-600/15 text-purple-400 mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Sign Up Portal</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            In demonstration mode, you can sign in directly using the Operational Login Portal. No registration required.
          </p>
          <button
            onClick={() => router.push('/sign-in')}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Go to Login Portal
          </button>
          
          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-900/40 text-[10px] text-purple-400 leading-normal flex gap-2 text-left">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Note:</strong> Standard Clerk SignUp will compile here automatically once environment variables are added.
            </span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
