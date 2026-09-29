// RouteXIndia.AI B2B Payment Service Abstraction Layer
// Configured to support modular integration with Razorpay Checkout & Webhooks.

export interface PaymentOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  status: 'created' | 'failed';
  isMock: boolean;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class PaymentService {
  private static hasRazorpayConfig(): boolean {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  /**
   * Creates payment order (Razorpay or Mock Sandbox)
   */
  public static async createPaymentOrder(amount: number, currency = 'INR'): Promise<PaymentOrderResponse> {
    if (this.hasRazorpayConfig()) {
      try {
        // Dynamic import of Razorpay to prevent compile-time crashes if not needed
        // @ts-ignore
        const Razorpay = (await import('razorpay')).default;
        const razorpayInstance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID!,
          key_secret: process.env.RAZORPAY_KEY_SECRET!
        });

        const order = await razorpayInstance.orders.create({
          amount: amount * 100, // Razorpay expects paisa
          currency,
          receipt: `rcpt_${Date.now()}`
        });

        return {
          order_id: order.id,
          amount: Number(order.amount) / 100,
          currency: order.currency,
          status: 'created',
          isMock: false
        };
      } catch (err) {
        console.error('Razorpay Order creation failed. Falling back to Sandbox Mode.', err);
      }
    }

    // Mock order response
    const mockOrderId = 'order_lhx_' + Math.floor(100000 + Math.random() * 900000).toString();
    return {
      order_id: mockOrderId,
      amount,
      currency,
      status: 'created',
      isMock: true
    };
  }

  /**
   * Verifies payment checkouts (Razorpay Signature or Mock Sandbox)
   */
  public static async verifyPayment(req: PaymentVerificationRequest): Promise<boolean> {
    if (this.hasRazorpayConfig()) {
      try {
        const crypto = await import('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
        hmac.update(req.razorpay_order_id + "|" + req.razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');
        
        return generatedSignature === req.razorpay_signature;
      } catch (err) {
        console.error('Razorpay signature verification encountered an error.', err);
        return false;
      }
    }

    // Sandbox verification always returns true
    return true;
  }
}
export default PaymentService;
