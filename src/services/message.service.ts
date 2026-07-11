const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

export interface AntylMessage {
  id: string;
  match_id: string;
  sender_id: string;
  sender_role: "recruiter" | "developer";
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ConversationOtherParty {
  id: string;
  name: string | null;
  trust_score: number | null;
}

export interface Conversation {
  match_id: string;
  job_id: string;
  job_title: string | null;
  pipeline_stage: string | null;
  other_party: ConversationOtherParty;
  last_message: AntylMessage | null;
  unread_count: number;
  can_send: boolean;
}

async function handle(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Something went wrong.");
  }
  return data;
}

export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/messages`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await handle(res);
  return data.conversations;
}

export async function getMessages(matchId: string): Promise<AntylMessage[]> {
  const res = await fetch(`${API_URL}/messages/${matchId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await handle(res);
  return data.messages;
}

export async function sendMessage(
  matchId: string,
  content: string
): Promise<AntylMessage> {
  const res = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ match_id: matchId, content }),
  });
  const data = await handle(res);
  return data.message;
}

// Preset questions shown as tappable chips above the recruiter's
// message input. Clicking one sends it immediately as a normal
// message - no separate "template" concept on the backend.
export const RECRUITER_QUICK_REPLIES: { label: string; text: string }[] = [
  { label: "Notice period", text: "What's your current notice period?" },
  {
    label: "Salary range",
    text: "What salary range are you looking for?",
  },
  {
    label: "Onsite / Remote",
    text: "Are you open to onsite work, or looking for remote only?",
  },
];