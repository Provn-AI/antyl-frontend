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
  Check,
  Lock,
  Receipt,
  CalendarDays,
  AlertTriangle,
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

// Display-only helpers: per-credit price and the saving versus the first pack.
const basePerCredit = PACKS[0].price / PACKS[0].credits;
const perCredit = (p: { price: number; credits: number }) => p.price / p.credits;
const savingPct = (p: { price: number; credits: number }) =>
  Math.round((1 - perCredit(p) / basePerCredit) * 100);

const STATUS_MAP: Record<
  Transaction["status"],
  { label: string; color: string; bg: string; tile: string; Icon: React.ElementType }
> = {
  paid:    { label: "Paid",    color: "text-emerald-600", bg: "bg-emerald-50", tile: "bg-emerald-50 text-emerald-500", Icon: CheckCircle2 },
  created: { label: "Pending", color: "text-amber-600",   bg: "bg-amber-50",   tile: "bg-amber-50 text-amber-500",     Icon: Clock },
  failed:  { label: "Failed",  color: "text-[#D8452F]",   bg: "bg-[#E0533D]/10", tile: "bg-[#E0533D]/10 text-[#E0533D]", Icon: XCircle },
};

function StatusPill({ status }: { status: Transaction["status"] }) {
  const { label, color, bg, Icon } = STATUS_MAP[status] ?? STATUS_MAP.created;
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-white rounded-[28px] shadow-xl max-w-sm w-full p-8 text-center overflow-hidden"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-50 to-transparent"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </motion.div>

          <h3
            className="text-xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Payment successful
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            ₹{(data.amountPaise / 100).toLocaleString("en-IN")} paid
          </p>

          <div className="bg-[#FAF6F0] rounded-2xl px-5 py-4 mb-6">
            <p className="text-3xl font-black text-[#F2754A]">
              +{data.credits}{" "}
              <span className="text-base font-bold text-gray-400">credits added</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              New balance:{" "}
              <span className="font-bold text-gray-600">{data.newBalance} credits</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-full text-sm font-bold text-white bg-[#F2754A] hover:bg-[#e0623a] transition-colors shadow-md shadow-orange-100"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
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

      <AnimatePresence>
        {successModal && (
          <PaymentSuccessModal data={successModal} onClose={() => setSuccessModal(null)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen w-full bg-[#FAF6F0] px-4 py-8 sm:py-12">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Billing
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Buy credits to post jobs, and see every purchase in one place.
            </p>
          </div>

          {/* Balance hero */}
          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#F2754A] to-[#FFB347] text-white p-6 sm:p-8 mb-6 shadow-md shadow-orange-100">
            <div aria-hidden className="absolute -right-10 -top-12 w-52 h-52 rounded-full bg-white/10" />
            <div aria-hidden className="absolute right-28 -bottom-16 w-40 h-40 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-white/80">Available balance</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span
                    className="text-5xl sm:text-6xl font-black tabular-nums leading-none"
                    style={{ fontFamily: "var(--font-fraunces, serif)" }}
                  >
                    {loading ? "…" : balance}
                  </span>
                  <span className="text-base font-bold text-white/80">credits</span>
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="relative flex flex-wrap gap-2 mt-6">
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 rounded-full px-3 py-1.5">
                <Zap className="w-3.5 h-3.5" />
                1 credit = 1 active job posting for 30 days
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 rounded-full px-3 py-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                Credits are valid for 12 months
              </span>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 bg-[#E0533D]/10 border border-[#E0533D]/20 text-[#D8452F] text-sm font-semibold rounded-2xl px-5 py-3.5 mb-6"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="flex-1 min-w-0 break-words">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss"
                className="text-[#E0533D]/60 hover:text-[#D8452F] flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Credit packs */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Choose a credit pack</h3>
            <p className="text-xs text-gray-400 mt-0.5">The more you buy, the less each credit costs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {PACKS.map((pack) => {
              const isPurchasing = purchasingId === pack.id;
              const popular = Boolean(pack.badge);
              const saving = savingPct(pack);

              return (
                <div
                  key={pack.id}
                  className={`relative bg-white rounded-[24px] border-2 p-6 flex flex-col transition-shadow hover:shadow-md ${
                    popular
                      ? "border-[#F2754A] shadow-md shadow-orange-100 sm:-translate-y-1"
                      : "border-gray-100 shadow-sm"
                  }`}
                >
                  {pack.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full bg-[#F2754A] text-white shadow-md shadow-orange-100 whitespace-nowrap">
                      {pack.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-500">{pack.label}</p>
                    {saving > 0 && (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                        Save {saving}%
                      </span>
                    )}
                  </div>

                  <p className="text-4xl font-black text-gray-900 leading-none">
                    {pack.credits}{" "}
                    <span className="text-base font-bold text-gray-400">credits</span>
                  </p>
                  <p className="text-2xl font-bold text-[#F2754A] mt-3">
                    ₹{pack.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    About ₹{Math.round(perCredit(pack)).toLocaleString("en-IN")} per credit
                  </p>

                  <ul className="space-y-2 mt-5 mb-6 text-xs text-gray-500 font-medium">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {pack.credits} job postings
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      Each live for 30 days
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      Valid for 12 months
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleBuy(pack.id)}
                    disabled={isPurchasing || purchasingId !== null}
                    className={`mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      popular
                        ? "text-white bg-[#F2754A] hover:bg-[#e0623a] shadow-md shadow-orange-100"
                        : "text-[#F2754A] bg-orange-50 hover:bg-orange-100"
                    }`}
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

          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-10">
            <Lock className="w-3.5 h-3.5" />
            Secure payment powered by Razorpay
          </p>

          {/* Transaction history */}
          <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-4 h-4 text-[#F2754A]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Purchase history</h3>
                <p className="text-xs text-gray-400">Every credit purchase on your account</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl px-4 py-3.5 bg-gray-50/70">
                    <div className="w-10 h-10 rounded-xl bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-gray-100 rounded-full" />
                      <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
                    </div>
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-6 h-6 text-[#F2754A]" />
                </div>
                <p className="text-sm font-bold text-gray-700">No purchases yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your free 5 credits are ready to use.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => {
                  const { tile, Icon } = STATUS_MAP[tx.status] ?? STATUS_MAP.created;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 sm:gap-4 rounded-2xl px-3 sm:px-4 py-3.5 bg-gray-50/60 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tile}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{tx.credits} credits</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3">
                        <span className="text-sm font-bold text-gray-800 tabular-nums">
                          ₹{(tx.amount_paise / 100).toLocaleString("en-IN")}
                        </span>
                        <StatusPill status={tx.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}