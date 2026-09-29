"use client";

import React, { useState } from "react";
import { CheckCircle, Mail, Phone } from "lucide-react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";

interface Contact2Props {
  title?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  web?: { label: string; url: string };
}

export const Contact2 = ({
  title = "Contact Us",
  description = "We are available for questions, feedback, or collaboration opportunities. Let us know how we can help!",
  phone = "+91 9322468515 , +91 7821900798",
  email = "routexindia.ai@gmail.com",
}: Contact2Props) => {
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
    
    // Clear validation error when user types
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formValues.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formValues.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    if (!formValues.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formValues.message.trim()) {
      newErrors.message = "Message is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitError(null);

    // EmailJS credentials mapping
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

    try {
      await emailjs.sendForm(
        serviceId,
        templateId,
        e.currentTarget,
        publicKey
      );

      console.log("Email sent successfully!");
      
      // Clear inputs and set success state
      setFormValues({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Failed to send email:", error);
      setSubmitError(
        error?.text || "Failed to send message. Please check your credentials or try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 max-w-7xl mx-auto px-6 z-10 relative">
      <GlassCard glowColor="purple" className="p-8 md:p-12 border-border/60 relative overflow-hidden">
        <BorderBeam className="-inset-8 md:-inset-12 rounded-xl" duration={8} lightColor="#a855f7" />
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
          <div className="flex-1 max-w-2xl w-full space-y-4">
            {submitError && (
              <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-mono">
                ❌ {submitError}
              </div>
            )}

            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center p-8 rounded-xl bg-blue-950/20 border border-blue-900/30 text-center space-y-4 py-16 animate-fade-in">
                <CheckCircle className="w-12 h-12 text-blue-500 animate-pulse" />
                <h3 className="text-xl font-bold text-slate-100">Message Sent Successfully!</h3>
                <p className="text-sm text-slate-300 max-w-sm leading-relaxed font-sans">
                  Thank you! Your message has been sent successfully.
                </p>
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs text-slate-200 px-6 py-2 rounded-lg font-bold tracking-wider uppercase transition-all"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full space-y-1.5">
                    <Label htmlFor="firstName" className="text-[10px] uppercase font-bold font-mono text-zinc-500 tracking-wider">First Name</Label>
                    <Input 
                      type="text" 
                      id="firstName"
                      name="firstName"
                      value={formValues.firstName}
                      onChange={handleChange}
                      className={cn(
                        "bg-zinc-950/45 border border-zinc-800/80 text-xs px-3.5 py-2 h-10 transition-all text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:ring-offset-0",
                        errors.firstName && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                      )}
                      placeholder="First Name"
                    />
                    {errors.firstName && (
                      <p className="text-[10px] text-red-500 font-mono leading-none mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="w-full space-y-1.5">
                    <Label htmlFor="lastName" className="text-[10px] uppercase font-bold font-mono text-zinc-500 tracking-wider">Last Name</Label>
                    <Input 
                      type="text" 
                      id="lastName"
                      name="lastName"
                      value={formValues.lastName}
                      onChange={handleChange}
                      className={cn(
                        "bg-zinc-950/45 border border-zinc-800/80 text-xs px-3.5 py-2 h-10 transition-all text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:ring-offset-0",
                        errors.lastName && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                      )}
                      placeholder="Last Name"
                    />
                    {errors.lastName && (
                      <p className="text-[10px] text-red-500 font-mono leading-none mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] uppercase font-bold font-mono text-zinc-500 tracking-wider">Work Email</Label>
                  <Input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    className={cn(
                      "bg-zinc-950/45 border border-zinc-800/80 text-xs px-3.5 py-2 h-10 transition-all text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:ring-offset-0",
                      errors.email && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                    )}
                    placeholder="name@company.com"
                  />
                  {errors.email && (
                    <p className="text-[10px] text-red-500 font-mono leading-none mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-[10px] uppercase font-bold font-mono text-zinc-500 tracking-wider">Subject</Label>
                  <Input 
                    type="text" 
                    id="subject"
                    name="subject"
                    value={formValues.subject}
                    onChange={handleChange}
                    className={cn(
                      "bg-zinc-950/45 border border-zinc-800/80 text-xs px-3.5 py-2 h-10 transition-all text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:ring-offset-0",
                      errors.subject && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                    )}
                    placeholder="e.g. Route Integration / API Setup"
                  />
                  {errors.subject && (
                    <p className="text-[10px] text-red-500 font-mono leading-none mt-1">{errors.subject}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-[10px] uppercase font-bold font-mono text-zinc-500 tracking-wider">Message</Label>
                  <Textarea 
                    id="message"
                    name="message"
                    value={formValues.message}
                    onChange={handleChange}
                    className={cn(
                      "bg-zinc-950/45 border border-zinc-800/80 text-xs px-3.5 py-2 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 focus-visible:ring-offset-0 min-h-[120px] resize-none transition-all text-white placeholder:text-zinc-600",
                      errors.message && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                    )}
                    placeholder="Type your message here..."
                  />
                  {errors.message && (
                    <p className="text-[10px] text-red-500 font-mono leading-none mt-1">{errors.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_16px_rgba(37,99,235,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
          
        </div>
      </GlassCard>
    </section>
  );
};
