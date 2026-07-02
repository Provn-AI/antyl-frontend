const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

export interface CreditPack {
  credits: number;
  amount_paise: number;
  label: string;
}

export async function getPacks(): Promise<Record<string, CreditPack>> {
  const res = await fetch(`${API_URL}/billing/packs`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to load packs");
  return data.packs;
}

export async function getBalance(): Promise<number> {
  const res = await fetch(`${API_URL}/billing/balance`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to load balance");
  return data.balance;
}

export interface OrderResponse {
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount: number;
  currency: string;
  credits: number;
  order_row_id: string;
}

export async function createOrder(packId: string): Promise<OrderResponse> {
  const res = await fetch(`${API_URL}/billing/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ pack_id: packId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to create order");
  return data;
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const res = await fetch(`${API_URL}/billing/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Payment verification failed");
  return data;
}

export interface Transaction {
  id: string;
  pack_id: string;
  credits: number;
  amount_paise: number;
  status: "created" | "paid" | "failed";
  created_at: string;
  paid_at?: string;
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_URL}/billing/transactions`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to load transactions");
  return data.transactions;
}