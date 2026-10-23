import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { trackingEmitter, TrackingLocationUpdate } from "@/lib/tracking/tracking-events";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;

  await connectToDatabase();
  const booking = await BookingModel.findById(bookingId).lean();

  if (!booking) {
    return new Response("Booking not found", { status: 404 });
  }

  const initialPayload = {
    type: "initial",
    bookingId,
    bookingNumber: booking.bookingNumber,
    status: booking.status,
    pickup: booking.pickup,
    drop: booking.drop,
    route: booking.route,
    tracking: booking.tracking || {
      currentLocation: {
        type: "Point",
        coordinates: booking.pickup.coordinates,
      },
      speedKmh: 0,
      etaMinutes: booking.route?.durationMinutes || 60,
    },
    timestamp: new Date().toISOString(),
  };

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send initial state immediately
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialPayload)}\n\n`)
      );

      // Listener for real-time driver GPS updates
      const onLocationUpdate = (update: TrackingLocationUpdate) => {
        try {
          const sseEvent = `event: location\ndata: ${JSON.stringify(update)}\n\n`;
          controller.enqueue(encoder.encode(sseEvent));
        } catch {
          // Controller might be closed
        }
      };

      const eventChannel = `track:${bookingId}`;
      trackingEmitter.on(eventChannel, onLocationUpdate);

      // Heartbeat ping every 15 seconds to keep mobile connections alive
      const intervalId = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(intervalId);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        trackingEmitter.off(eventChannel, onLocationUpdate);
        clearInterval(intervalId);
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
