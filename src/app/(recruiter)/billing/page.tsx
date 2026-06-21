"use client";

import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6">
      <div className="bg-white border border-gray-100 rounded-[32px] shadow-sm p-12 max-w-xl w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-[#F2754A] to-[#FFB347] flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Billing Coming Soon
        </h1>

        <p className="text-gray-500 mb-8">
          Subscription plans, invoices, recruiter credits and team billing
          are currently under development.
        </p>

        <div className="inline-flex px-4 py-2 rounded-full bg-orange-50 text-[#F2754A] font-semibold text-sm">
          🚀 Launching Soon
        </div>
      </div>
    </div>
  );
}