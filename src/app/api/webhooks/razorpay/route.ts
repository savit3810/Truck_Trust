import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/providers/payment";
import { connectToDatabase } from "@/lib/db/connection";
import { BookingModel } from "@/features/booking/models/booking.model";
import { recordAdvanceEscrowHold } from "@/features/ledger/ledger-engine";
import { AuditLogModel } from "@/features/audit/models/audit-log.model";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const rawBody = await req.text();
    const provider = getPaymentProvider();
    const isValid = await provider.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity;

    await connectToDatabase();

    // Log the incoming webhook in audit trail
    await AuditLogModel.create({
      actorRole: "system",
      action: "webhook_received",
      resourceType: "payment",
      resourceId: entity?.id,
      metadata: {
        event,
        amount: entity?.amount,
      },
    });

    if (event === "payment.captured" || event === "order.paid") {
      const notes = entity?.notes || {};
      const bookingId = notes.bookingId;

      if (bookingId) {
        const booking = await BookingModel.findById(bookingId);
        if (booking && !booking.payment?.advancePaid) {
          await recordAdvanceEscrowHold({
            bookingId: booking._id,
            entrepreneurId: booking.entrepreneurId,
            amountPaise: booking.fare.advance50Paise,
            paymentMethod: "razorpay",
            paymentReference: entity.id,
          });

          booking.payment = {
            advancePaid: true,
            advancePaymentId: entity.id,
            advancePaidAt: new Date(),
            deliveryPaid: false,
          };

          booking.timeline.push({
            status: booking.status,
            timestamp: new Date(),
            note: `Webhook verified advance payment (ID: ${entity.id})`,
          });

          await booking.save();
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error in /api/webhooks/razorpay:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Webhook handling failed" },
      { status: 500 }
    );
  }
}
