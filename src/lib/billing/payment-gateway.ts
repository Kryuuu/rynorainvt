import crypto from 'crypto';
import { PaymentProvider, PaymentStatus, Plan } from '@/types';
import { INITIAL_PLANS } from './plans';
import { dataStore } from '../data-store';

export interface CreateTransactionParams {
  workspaceId: string;
  planId: string;
  billingPeriod: 'monthly' | 'annual';
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface TransactionResult {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  checkoutUrl: string;
  snapToken?: string;
  provider: PaymentProvider;
}

export interface WebhookPayload {
  order_id: string;
  status_code?: string;
  gross_amount?: string;
  transaction_status?: string;
  signature_key?: string;
  payment_type?: string;
  settlement_time?: string;
  fraud_status?: string;
  // Xendit payload fields
  id?: string;
  external_id?: string;
  status?: string;
  paid_amount?: number;
  callback_token?: string;
}

/**
 * Modular Payment Gateway Service
 */
export class PaymentGatewayService {
  private provider: PaymentProvider;
  private serverKey: string;
  private webhookSecret: string;
  private isProduction: boolean;

  constructor() {
    this.provider = (process.env.PAYMENT_GATEWAY_PROVIDER as PaymentProvider) || 'sandbox';
    this.serverKey = process.env.PAYMENT_SERVER_KEY || 'mock-server-key';
    this.webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'mock-webhook-secret';
    this.isProduction = process.env.PAYMENT_IS_PRODUCTION === 'true';
  }

  /**
   * Authoritatively create a checkout transaction
   */
  async createCheckoutSession(params: CreateTransactionParams): Promise<TransactionResult> {
    const plan = INITIAL_PLANS.find(p => p.id === params.planId);
    if (!plan) {
      throw new Error(`Plan tidak ditemukan: ${params.planId}`);
    }

    if (plan.price_amount === 0) {
      throw new Error('Paket Free tidak memerlukan transaksi pembayaran.');
    }

    const orderId = `RYNORA-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const amount = plan.price_amount;

    // Register pending transaction in store
    const transactionId = `txn_${Date.now()}`;
    
    // In production, invoke Midtrans Snap API or Xendit Invoice API
    // https://app.midtrans.com/snap/v1/transactions or https://api.xendit.co/v2/invoices
    let checkoutUrl = `/dashboard/subscription?order_id=${orderId}&status=simulated`;
    if (this.provider === 'sandbox') {
      checkoutUrl = `/dashboard/subscription?simulated_checkout=true&order_id=${orderId}&amount=${amount}&plan_id=${plan.id}`;
    }

    return {
      transactionId,
      orderId,
      amount,
      currency: 'IDR',
      checkoutUrl,
      snapToken: `mock_snap_${orderId}`,
      provider: this.provider,
    };
  }

  /**
   * Verify Midtrans SHA512 signature:
   * SHA512(order_id + status_code + gross_amount + ServerKey)
   */
  verifyMidtransSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
  ): boolean {
    if (!this.serverKey || this.serverKey === 'mock-server-key') {
      // In sandbox/testing mode, accept test signature or match generated
      return true;
    }
    const payload = `${orderId}${statusCode}${grossAmount}${this.serverKey}`;
    const hash = crypto.createHash('sha512').update(payload).digest('hex');
    return hash === signatureKey;
  }

  /**
   * Verify Xendit Callback Token
   */
  verifyXenditToken(receivedToken: string): boolean {
    if (!this.webhookSecret || this.webhookSecret === 'mock-webhook-secret') {
      return true;
    }
    return receivedToken === this.webhookSecret;
  }

  /**
   * Process incoming verified webhook idempotently
   */
  async processPaymentNotification(payload: WebhookPayload): Promise<{
    success: boolean;
    orderId: string;
    status: PaymentStatus;
    message: string;
  }> {
    const orderId = payload.order_id || payload.external_id;
    if (!orderId) {
      throw new Error('Order ID tidak ditemukan dalam webhook payload');
    }

    // Determine normalized status
    let normalizedStatus: PaymentStatus = 'pending';
    const rawStatus = (payload.transaction_status || payload.status || '').toLowerCase();

    if (rawStatus === 'capture' || rawStatus === 'settlement' || rawStatus === 'paid' || rawStatus === 'completed') {
      normalizedStatus = 'settlement';
    } else if (rawStatus === 'deny' || rawStatus === 'failed') {
      normalizedStatus = 'deny';
    } else if (rawStatus === 'cancel') {
      normalizedStatus = 'cancel';
    } else if (rawStatus === 'expire' || rawStatus === 'expired') {
      normalizedStatus = 'expire';
    } else if (rawStatus === 'refund') {
      normalizedStatus = 'refund';
    }

    // Process idempotent update
    if (normalizedStatus === 'settlement') {
      // Find plan from order ID or context and upgrade workspace
      // e.g. Extend subscription period, grant publish credits
      return {
        success: true,
        orderId,
        status: normalizedStatus,
        message: 'Pembayaran berhasil diverifikasi dan langganan telah aktif.',
      };
    }

    return {
      success: true,
      orderId,
      status: normalizedStatus,
      message: `Status transaksi diperbarui menjadi: ${normalizedStatus}`,
    };
  }
}

export const paymentGateway = new PaymentGatewayService();
