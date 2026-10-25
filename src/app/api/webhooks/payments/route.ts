import { NextRequest, NextResponse } from 'next/server';
import { paymentGateway, WebhookPayload } from '@/lib/billing/payment-gateway';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let payload: WebhookPayload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Payload bukan JSON yang valid' }, { status: 400 });
    }

    const orderId = payload.order_id || payload.external_id;
    if (!orderId) {
      return NextResponse.json({ error: 'order_id atau external_id tidak ditemukan' }, { status: 400 });
    }

    // 1. Signature Verification
    if (payload.signature_key && payload.status_code && payload.gross_amount) {
      // Midtrans signature format
      const isValid = paymentGateway.verifyMidtransSignature(
        payload.order_id,
        payload.status_code,
        payload.gross_amount,
        payload.signature_key
      );

      if (!isValid) {
        return NextResponse.json({ error: 'Signature webhook tidak valid' }, { status: 401 });
      }
    } else if (payload.callback_token) {
      // Xendit callback token
      const isValid = paymentGateway.verifyXenditToken(payload.callback_token);
      if (!isValid) {
        return NextResponse.json({ error: 'Callback token Xendit tidak valid' }, { status: 401 });
      }
    }

    // 2. Process Notification Idempotently
    const result = await paymentGateway.processPaymentNotification(payload);

    return NextResponse.json({
      status: 'success',
      orderId: result.orderId,
      paymentStatus: result.status,
      message: result.message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
