"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import {
  getBalance,
  createOrder,
  verifyPayment,
  getTransactions,
  Transaction,
} from "@/services/billing.service";

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  theme: { color: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// Mirrors CREDIT_PACKS in billing_service.py. Pricing is enforced
// server-side — this is display-only, the backend never trusts amounts
// coming from the client.
const PACKS: {
  id: string;
  credits: number;
  price: number;
  label: string;
  badge?: string;
}[] = [
  { id: "pack_10", credits: 10, price: 999, label: "Starter" },
  { id: "pack_30", credits: 30, price: 2499, label: "Growth", badge: "Best value" },
  { id: "pack_75", credits: 75, price: 4999, label: "Scale" },
];

function StatusPill({ status }: { status: Transaction["status"] }) {
  const map: Record<Transaction["status"], { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    paid:    { label: "Paid",    color: "text-emerald-600", bg: "bg-emerald-50", Icon: CheckCircle2 },
    created: { label: "Pending", color: "text-amber-600",   bg: "bg-amber-50",   Icon: Clock },
    failed:  { label: "Failed",  color: "text-red-500",     bg: "bg-red-50",     Icon: XCircle },
  };
  const { label, color, bg, Icon } = map[status] ?? map.created;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${bg} ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

interface SuccessModalData {
  credits: number;
  amountPaise: number;
  newBalance: number;
}

function PaymentSuccessModal({
  data,
  onClose,
}: {
  data: SuccessModalData;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-white rounded-[24px] shadow-xl max-w-sm w-full p-8 text-center"
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </motion.div>

          <h3 className="text-xl font-black text-gray-900 mb-1">Payment successful</h3>
          <p className="text-sm text-gray-400 mb-6">
            ₹{(data.amountPaise / 100).toLocaleString("en-IN")} paid
          </p>

          <div className="bg-[#FAF6F0] rounded-2xl px-5 py-4 mb-6">
            <p className="text-3xl font-black text-[#F2754A]">
              +{data.credits} <span className="text-base font-bold text-gray-400">credits added</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              New balance: <span className="font-bold text-gray-600">{data.newBalance} credits</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
          >
            Done
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function BillingPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [successModal, setSuccessModal] = useState<SuccessModalData | null>(null);

  const refresh = async () => {
    const [bal, tx] = await Promise.all([getBalance(), getTransactions()]);
    setBalance(bal);
    setTransactions(tx);
    return bal;
  };

  useEffect(() => {
    async function load() {
      try {
        await refresh();
      } catch (err) {
        console.error(err);
        setError("Couldn't load your billing details. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleBuy = async (packId: string) => {
    if (!scriptReady) {
      setError("Payment is still loading — try again in a moment.");
      return;
    }
    setError("");
    setPurchasingId(packId);

    try {
      const order = await createOrder(packId);
      const pack = PACKS.find((p) => p.id === packId);

      const rzp = new window.Razorpay({
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpay_order_id,
        name: "Antyl",
        description: `${order.credits} job posting credits`,
        theme: { color: "#F2754A" },
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            await verifyPayment(response);
            const newBalance = await refresh();
            setSuccessModal({
              credits: order.credits ?? pack?.credits ?? 0,
              amountPaise: order.amount,
              newBalance: newBalance ?? 0,
            });
          } catch (err) {
            console.error(err);
            setError(
              `Payment went through but we couldn't confirm your credits automatically. ` +
              `Contact support with payment ID ${response.razorpay_payment_id} and we'll sort it out.`
            );
          } finally {
            setPurchasingId(null);
          }
        },
        modal: {
          ondismiss: () => setPurchasingId(null),
        },
      });

      rzp.on("payment.failed", () => {
        setError("Payment failed. No credits were deducted — you can try again.");
        setPurchasingId(null);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
      setPurchasingId(null);
    }
  };

  return (
    <>
      {/* Loaded lazily — checkout.js is only needed once the recruiter
          actually tries to buy, but loading it up front avoids a delay
          on the first click. */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      {successModal && (
        <PaymentSuccessModal
          data={successModal}
          onClose={() => setSuccessModal(null)}
        />
      )}

      <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">


          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Billing</h2>
              <p className="text-sm text-gray-400 mt-1">
                1 credit = 1 active job posting for 30 days. Credits are valid for 12 months.
              </p>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F2754A] to-[#FFB347] flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Balance</p>
                <p className="text-2xl font-black text-gray-900">
                  {loading ? "…" : balance} <span className="text-sm font-bold text-gray-400">credits</span>
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl px-5 py-3.5 mb-6">
              {error}
            </div>
          )}

          {/* Credit packs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {PACKS.map((pack) => {
              const isPurchasing = purchasingId === pack.id;
              return (
                <div
                  key={pack.id}
                  className={`relative bg-white rounded-[24px] border shadow-sm p-6 flex flex-col ${
                    pack.badge ? "border-[#F2754A]" : "border-gray-100"
                  }`}
                >
                  {pack.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full bg-[#F2754A] text-white shadow-md shadow-orange-100">
                      {pack.badge}
                    </span>
                  )}
                  <p className="text-sm font-bold text-gray-400 mb-1">{pack.label}</p>
                  <p className="text-3xl font-black text-gray-900 mb-1">{pack.credits} <span className="text-base font-bold text-gray-400">credits</span></p>
                  <p className="text-2xl font-bold text-[#F2754A] mb-6">₹{pack.price.toLocaleString("en-IN")}</p>

                  <button
                    type="button"
                    onClick={() => handleBuy(pack.id)}
                    disabled={isPurchasing || purchasingId !== null}
                    className="mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100 disabled:opacity-50"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Buy credits
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Transaction history */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="font-bold text-gray-900 text-lg mb-5">Purchase history</h3>

            {loading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-gray-400">No purchases yet - your free 5 credits are ready to use.</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">{tx.credits} credits</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">
                        ₹{(tx.amount_paise / 100).toLocaleString("en-IN")}
                      </span>
                      <StatusPill status={tx.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}