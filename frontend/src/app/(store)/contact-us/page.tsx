"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitContactMessage } from "@/lib/api/contact";
import { useStoreSettings } from "@/providers/StoreSettingsProvider";
import { contactSchema, type ContactInput } from "@/schemas/contact.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ContactUsPage() {
  const submitMutation = useSubmitContactMessage();
  const { storeAddress, storePhone, storeEmail } = useStoreSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactInput) => {
    try {
      await submitMutation.mutateAsync(values);
      toast.success("Message sent! Our support team will get back to you shortly.");
      reset();
    } catch {
      toast.error("Could not send message. Please try again.");
    }
  };

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00a3ff]">
            Support & Global Inquiries
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 mt-2 font-mono">
            Get in Touch
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Have questions regarding gym equipment, commercial gym fitouts, or your order? We’re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#060b13] text-white p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider font-mono text-white">
                Contact Information
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-[#00a3ff]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Headquarters</h4>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{storeAddress || "Amsterdam / London / Global Hubs"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-[#00a3ff]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Phone Support</h4>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{storePhone || "+1 (800) 555-0199"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-[#00a3ff]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Email Inquiries</h4>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{storeEmail || "support@pgxfitness.com"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-[#00a3ff]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Global Deliveries</h4>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">Express shipping to over 50 countries</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-[#f8fafc] border border-slate-200 p-8 rounded-2xl shadow-sm">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 font-mono mb-6">
              Send a Message
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name *</label>
                  <Input
                    placeholder="John Doe"
                    {...register("name")}
                    className="h-11 rounded-lg bg-white border-slate-300 focus:border-[#00a3ff]"
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="athlete@domain.com"
                    {...register("email")}
                    className="h-11 rounded-lg bg-white border-slate-300 focus:border-[#00a3ff]"
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Phone</label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    {...register("phone")}
                    className="h-11 rounded-lg bg-white border-slate-300 focus:border-[#00a3ff]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Subject</label>
                  <Input
                    placeholder="Order Inquiry / Wholesale"
                    {...register("subject")}
                    className="h-11 rounded-lg bg-white border-slate-300 focus:border-[#00a3ff]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Message *</label>
                <Textarea
                  rows={5}
                  placeholder="How can our fitness gear specialists assist you?"
                  {...register("message")}
                  className="rounded-lg bg-white border-slate-300 focus:border-[#00a3ff]"
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#060b13] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
