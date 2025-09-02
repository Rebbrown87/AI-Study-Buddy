// IntaSend configuration
export const intaSendConfig = {
  publishableKey: process.env.INTASEND_PUBLISHABLE_KEY || 'ISPubKey_test_your_key_here',
  secretKey: process.env.INTASEND_SECRET_KEY || 'ISSecretKey_test_your_key_here',
  testMode: true, // Set to false for production
  baseUrl: 'https://sandbox.intasend.com' // Use https://payment.intasend.com for production
};

// Payment plans for premium features
export const paymentPlans = {
  basic: {
    amount: 500, // KES 5.00
    currency: 'KES',
    description: 'Basic Plan - 50 flashcards per month'
  },
  premium: {
    amount: 1500, // KES 15.00
    currency: 'KES', 
    description: 'Premium Plan - Unlimited flashcards'
  }
};