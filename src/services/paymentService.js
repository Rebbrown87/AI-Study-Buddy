import { intaSendConfig, paymentPlans } from '../config/intasend.js';

class PaymentService {
  constructor() {
    this.publishableKey = intaSendConfig.publishableKey;
    this.baseUrl = intaSendConfig.baseUrl;
  }

  async initiatePayment(plan, userEmail, phoneNumber) {
    try {
      const paymentData = {
        public_key: this.publishableKey,
        amount: paymentPlans[plan].amount,
        currency: paymentPlans[plan].currency,
        email: userEmail,
        phone_number: phoneNumber,
        api_ref: `study-buddy-${plan}-${Date.now()}`,
        method: 'M-PESA', // Can be M-PESA, CARD, or BANK
        redirect_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancelled`
      };

      const response = await fetch(`${this.baseUrl}/api/v1/payment/collection/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-IntaSend-Public-Key': this.publishableKey
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`Payment initiation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }

  async verifyPayment(invoiceId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payment/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-IntaSend-Public-Key': this.publishableKey
        },
        body: JSON.stringify({
          invoice_id: invoiceId
        })
      });

      if (!response.ok) {
        throw new Error(`Payment verification failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  redirectToPayment(checkoutUrl) {
    window.location.href = checkoutUrl;
  }
}

export default new PaymentService();