"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitContactMessage } from "@/lib/api/contact";
import { useStoreSettings } from "@/providers/StoreSettingsProvider";
import { contactSchema, type ContactInput } from "@/schemas/contact.schema";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export default function ContactUsPage() {
  const submitMutation = useSubmitContactMessage();
  const { storeAddress, storePhone, storeEmail, whatsappNumber } =
    useStoreSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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
      toast.success("Message sent. We will contact you soon.");
      reset();
    } catch {
      toast.error("Could not send message. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p className="text-gray-600">
          Have a question about our products, an order, or a wholesale inquiry?
          We&apos;d love to hear from you.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
        <div className="w-full lg:w-1/3 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                Office Address
              </h3>
              <p className="text-gray-600">{storeAddress}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                Phone
              </h3>
              <p className="text-gray-600">{storePhone}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                Email
              </h3>
              <p className="text-gray-600">{storeEmail}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                WhatsApp
              </h3>
              <p className="text-gray-600">{whatsappNumber}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white border shadow-sm rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Send us a Message
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Your Name *
                </label>
                <Input placeholder="John Doe" {...register("name")} />
                {errors.name ? (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Phone</label>
              <Input placeholder="+8801XXXXXXXXX" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Subject *
              </label>
              <Input placeholder="How can we help?" {...register("subject")} />
              {errors.subject ? (
                <p className="text-xs text-red-600">{errors.subject.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Message *
              </label>
              <Textarea
                placeholder="Write your message here..."
                rows={6}
                {...register("message")}
              />
              {errors.message ? (
                <p className="text-xs text-red-600">{errors.message.message}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 h-12"
            >
              {submitMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
