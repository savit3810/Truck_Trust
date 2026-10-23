// Offline Draft Booking Storage and Network Synchronization Helper
export interface OfflineBookingDraft {
  id: string;
  savedAt: string;
  pickupAddress: string;
  pickupTaluka?: string;
  pickupDistrict: string;
  dropAddress: string;
  dropTaluka?: string;
  dropDistrict: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  goodsCategory: string;
  goodsDescription: string;
  weightKg: number;
  truckType: string;
  mode: string;
  notes?: string;
}

const STORAGE_KEY = "trucktrust_offline_draft_bookings";

export function getOfflineDrafts(): OfflineBookingDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveOfflineDraft(draft: Omit<OfflineBookingDraft, "id" | "savedAt">): OfflineBookingDraft {
  const drafts = getOfflineDrafts();
  const newDraft: OfflineBookingDraft = {
    ...draft,
    id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    savedAt: new Date().toISOString(),
  };

  const updated = [newDraft, ...drafts.slice(0, 9)]; // keep latest 10 drafts
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return newDraft;
}

export function removeOfflineDraft(draftId: string): void {
  const drafts = getOfflineDrafts();
  const updated = drafts.filter((d) => d.id !== draftId);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

export function clearAllOfflineDrafts(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
