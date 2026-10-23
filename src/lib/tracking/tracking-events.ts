import { EventEmitter } from "events";

export interface TrackingLocationUpdate {
  bookingId: string;
  coordinates: [number, number]; // [lng, lat]
  heading?: number;
  speedKmh?: number;
  etaMinutes?: number;
  timestamp: string;
}

class TrackingEventEmitter extends EventEmitter {}

// Global singleton across server invocations
declare global {
  var __trackingEmitter: TrackingEventEmitter | undefined;
}

export const trackingEmitter: TrackingEventEmitter =
  globalThis.__trackingEmitter || new TrackingEventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalThis.__trackingEmitter = trackingEmitter;
}

export function broadcastLocationUpdate(update: TrackingLocationUpdate) {
  trackingEmitter.emit(`track:${update.bookingId}`, update);
}
