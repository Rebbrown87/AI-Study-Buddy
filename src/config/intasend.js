// IntaSend configuration
export const intaSendConfig = {
  publishableKey: process.env.INTASEND_PUBLISHABLE_KEY || 'ISPubKey_test_your_key_here',
  secretKey: process.env.INTASEND_SECRET_KEY || 'ISPubKey_live_6abe2d92-03a4-48cb-a2e0-1883962cdc9b',
  testMode: false, // Set to false for production
  baseUrl: 'https://sandbox.intasend.com' // Use https://payment.intasend.com for production
};

// Payment plans for premium features
export const paymentPlans = {
  basic: {
    amount: 5.00, // USD 5.00
    currency: 'USD',
    description: 'Basic Plan - 50 flashcards per month'
  },
  premium: {
    amount: 15.00, // USD 15.00
    currency: 'USD', 
    description: 'Premium Plan - Unlimited flashcards'
  }
};