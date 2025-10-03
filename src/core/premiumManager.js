import { supabase, logActivity } from '../config/supabase.js';
import { showNotification } from './main.js';

let userPremiumSubscription = null;
let currentUserId = null;

export function initializePremiumSystem(user, subscription) {
  currentUserId = user?.id;
  userPremiumSubscription = subscription;

  if (subscription && isSubscriptionActive(subscription)) {
    updatePremiumUI(true, subscription.plan_type);
  } else {
    updatePremiumUI(false);
  }
}

function isSubscriptionActive(subscription) {
  if (!subscription) return false;
  const now = new Date();
  const expiry = new Date(subscription.expiry_date);
  return subscription.status === 'active' && now < expiry;
}

export async function checkPremiumAccess(featureName) {
  if (userPremiumSubscription && isSubscriptionActive(userPremiumSubscription)) {
    return true;
  }

  showPremiumUpgradeModal(featureName);
  return false;
}

function showPremiumUpgradeModal(featureName) {
  const existingModal = document.querySelector('.premium-upgrade-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'premium-upgrade-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content glass-element">
      <button class="close-btn">&times;</button>
      <div class="modal-header">
        <h2>Upgrade to Premium</h2>
        <p>Unlock ${featureName} and more premium features</p>
      </div>
      <div class="premium-plans">
        <div class="plan-card" data-plan="basic">
          <h3>Basic Plan</h3>
          <div class="price">$5<span>/month</span></div>
          <ul class="features">
            <li>✓ 50 flashcards/month</li>
            <li>✓ PDF export</li>
            <li>✓ Basic features</li>
          </ul>
          <button class="select-plan-btn" data-plan="basic" data-price="5">
            Select Basic
          </button>
        </div>
        <div class="plan-card featured" data-plan="premium">
          <div class="badge">Most Popular</div>
          <h3>Premium Plan</h3>
          <div class="price">$15<span>/month</span></div>
          <ul class="features">
            <li>✓ Unlimited flashcards</li>
            <li>✓ PDF export</li>
            <li>✓ Picture questions</li>
            <li>✓ Priority support</li>
          </ul>
          <button class="select-plan-btn" data-plan="premium" data-price="15">
            Select Premium
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const styles = document.createElement('style');
  styles.textContent = `
    .premium-upgrade-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    }
    .premium-upgrade-modal .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
    }
    .premium-upgrade-modal .modal-content {
      position: relative;
      max-width: 900px;
      width: 90%;
      padding: 3rem;
      border-radius: 20px;
      animation: slideInUp 0.4s ease;
    }
    .premium-upgrade-modal .close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 2rem;
      color: var(--text-primary);
      cursor: pointer;
    }
    .premium-upgrade-modal .modal-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .premium-upgrade-modal .modal-header h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .premium-upgrade-modal .premium-plans {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }
    .premium-upgrade-modal .plan-card {
      padding: 2rem;
      background: var(--card-bg);
      border: 2px solid var(--glass-border);
      border-radius: 16px;
      text-align: center;
      transition: all 0.3s ease;
    }
    .premium-upgrade-modal .plan-card:hover {
      transform: translateY(-5px);
      border-color: var(--accent-primary);
    }
    .premium-upgrade-modal .plan-card.featured {
      border-color: var(--accent-primary);
      position: relative;
    }
    .premium-upgrade-modal .badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white;
      padding: 0.25rem 1rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .premium-upgrade-modal .price {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--accent-primary);
      margin: 1rem 0;
    }
    .premium-upgrade-modal .price span {
      font-size: 1rem;
      color: var(--text-secondary);
    }
    .premium-upgrade-modal .features {
      list-style: none;
      padding: 0;
      margin: 1.5rem 0;
      text-align: left;
    }
    .premium-upgrade-modal .features li {
      padding: 0.5rem 0;
      color: var(--text-primary);
    }
    .premium-upgrade-modal .select-plan-btn {
      width: 100%;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .premium-upgrade-modal .select-plan-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 20px rgba(0, 212, 255, 0.4);
    }
  `;
  document.head.appendChild(styles);

  const closeBtn = modal.querySelector('.close-btn');
  const overlay = modal.querySelector('.modal-overlay');
  const planButtons = modal.querySelectorAll('.select-plan-btn');

  closeBtn.addEventListener('click', () => modal.remove());
  overlay.addEventListener('click', () => modal.remove());

  planButtons.forEach(button => {
    button.addEventListener('click', () => {
      const plan = button.dataset.plan;
      const price = button.dataset.price;
      showPaymentForm(plan, price);
      modal.remove();
    });
  });
}

function showPaymentForm(plan, price) {
  const modal = document.createElement('div');
  modal.className = 'payment-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content glass-element">
      <button class="close-btn">&times;</button>
      <div class="modal-header">
        <h2>Complete Your Purchase</h2>
        <p>Subscribe to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - $${price}/month</p>
      </div>
      <form id="payment-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="payment-email" required placeholder="your.email@example.com">
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" id="payment-phone" required placeholder="+1234567890">
        </div>
        <div class="form-group">
          <label>Card Number</label>
          <input type="text" id="card-number" required placeholder="1234 5678 9012 3456" maxlength="19">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Expiry Date</label>
            <input type="text" id="card-expiry" required placeholder="MM/YY" maxlength="5">
          </div>
          <div class="form-group">
            <label>CVV</label>
            <input type="text" id="card-cvv" required placeholder="123" maxlength="3">
          </div>
        </div>
        <button type="submit" class="submit-payment-btn">
          Complete Purchase - $${price}
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const styles = document.createElement('style');
  styles.textContent = `
    .payment-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .payment-modal .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
    }
    .payment-modal .modal-content {
      position: relative;
      max-width: 500px;
      width: 90%;
      padding: 2rem;
      border-radius: 16px;
    }
    .payment-modal .form-group {
      margin-bottom: 1.5rem;
    }
    .payment-modal .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .payment-modal .form-group input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: var(--card-bg);
      border: 2px solid var(--glass-border);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 1rem;
    }
    .payment-modal .form-group input:focus {
      outline: none;
      border-color: var(--accent-primary);
    }
    .payment-modal .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .payment-modal .submit-payment-btn {
      width: 100%;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .payment-modal .submit-payment-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 212, 255, 0.4);
    }
  `;
  document.head.appendChild(styles);

  const closeBtn = modal.querySelector('.close-btn');
  const overlay = modal.querySelector('.modal-overlay');
  const form = document.getElementById('payment-form');

  closeBtn.addEventListener('click', () => modal.remove());
  overlay.addEventListener('click', () => modal.remove());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handlePaymentSubmit(plan, price, modal);
  });
}

async function handlePaymentSubmit(plan, price, modal) {
  const email = document.getElementById('payment-email').value;
  const phone = document.getElementById('payment-phone').value;
  const cardNumber = document.getElementById('card-number').value;
  const lastFour = cardNumber.slice(-4);

  if (!currentUserId) {
    showNotification('Please login to subscribe', 'warning');
    modal.remove();
    return;
  }

  try {
    showNotification('Processing payment...', 'info');

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const { data, error } = await supabase
      .from('premium_subscriptions')
      .insert({
        user_id: currentUserId,
        plan_type: plan,
        status: 'active',
        payment_email: email,
        payment_phone: phone,
        card_last_four: lastFour,
        expiry_date: expiryDate.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    userPremiumSubscription = data;
    updatePremiumUI(true, plan);

    await logActivity(currentUserId, 'premium_upgrade', { plan, price });

    modal.remove();
    showNotification(`Welcome to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan!`, 'success');

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error('Payment error:', error);
    showNotification('Error processing payment. Please try again.', 'error');
  }
}

function updatePremiumUI(isPremium, planType = 'premium') {
  let premiumBadge = document.querySelector('.premium-status-badge');

  if (isPremium) {
    if (!premiumBadge) {
      premiumBadge = document.createElement('span');
      premiumBadge.className = 'premium-status-badge';
      premiumBadge.textContent = `⭐ ${planType.charAt(0).toUpperCase() + planType.slice(1)}`;

      const styles = `
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #1a202c;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-left: 1rem;
        animation: glow 2s ease-in-out infinite alternate;
      `;
      premiumBadge.style.cssText = styles;

      const navControls = document.querySelector('.nav-controls');
      if (navControls) {
        navControls.appendChild(premiumBadge);
      }
    }
  } else {
    if (premiumBadge) {
      premiumBadge.remove();
    }
  }
}
