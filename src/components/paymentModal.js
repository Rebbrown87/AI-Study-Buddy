export function createPaymentModal() {
  const modal = document.createElement('div');
  modal.className = 'payment-modal';
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>🚀 Upgrade to Premium</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="plan-selection">
            <div class="plan-card" data-plan="basic">
              <h3>Basic Plan</h3>
              <div class="price">$5.00</div>
              <p>50 flashcards per month</p>
              <ul>
                <li>✓ AI-generated flashcards</li>
                <li>✓ Basic themes</li>
                <li>✓ Export to PDF</li>
              </ul>
            </div>
            <div class="plan-card featured" data-plan="premium">
              <div class="popular-badge">Most Popular</div>
              <h3>Premium Plan</h3>
              <div class="price">$15.00</div>
              <p>Unlimited flashcards</p>
              <ul>
                <li>✓ Unlimited AI flashcards</li>
                <li>✓ All themes</li>
                <li>✓ Advanced export options</li>
                <li>✓ Priority support</li>
                <li>✓ Custom categories</li>
              </ul>
            </div>
          </div>
          <div class="payment-form" style="display: none;">
            <h3>Payment Details</h3>
            <form id="payment-form">
              <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" required>
              </div>
              <div class="form-group">
                <label for="phone">Phone Number (M-PESA)</label>
                <input type="tel" id="phone" placeholder="+254700000000" required>
              </div>
              <div class="payment-methods">
                <label class="payment-method">
                  <input type="radio" name="method" value="M-PESA" checked>
                  <span>💳 PayPal</span>
                </label>
                <label class="payment-method">
                  <input type="radio" name="method" value="CARD">
                  <span>💳 Stripe</span>
                </label>
              </div>
              <button type="submit" class="pay-btn">
                Pay Now - <span id="selected-amount">$15.00</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return modal;
}

export function initPaymentModal() {
  let selectedPlan = 'premium';
  let modal = null;

  // Add upgrade button to main interface
  const upgradeBtn = document.createElement('button');
  upgradeBtn.className = 'upgrade-btn';
  upgradeBtn.innerHTML = '⭐ Upgrade to Premium';
  upgradeBtn.addEventListener('click', showPaymentModal);
  
  const nav = document.querySelector('nav');
  nav.appendChild(upgradeBtn);

  function showPaymentModal() {
    if (modal) modal.remove();
    modal = createPaymentModal();
    document.body.appendChild(modal);
    
    // Plan selection handlers
    const planCards = modal.querySelectorAll('.plan-card');
    const paymentForm = modal.querySelector('.payment-form');
    const selectedAmount = modal.querySelector('#selected-amount');
    
    planCards.forEach(card => {
      card.addEventListener('click', () => {
        planCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedPlan = card.dataset.plan;
        
        const amount = selectedPlan === 'basic' ? 'KES 5.00' : 'KES 15.00';
        const amount = selectedPlan === 'basic' ? '$5.00' : '$15.00';
        selectedAmount.textContent = amount;
        
        paymentForm.style.display = 'block';
        paymentForm.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Close modal handlers
    modal.querySelector('.close-btn').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Payment form handler
    modal.querySelector('#payment-form').addEventListener('submit', handlePayment);
  }

  function closeModal() {
    if (modal) {
      modal.remove();
      modal = null;
    }
  }

  async function handlePayment(e) {
    e.preventDefault();
    
    const email = modal.querySelector('#email').value;
    const phone = modal.querySelector('#phone').value;
    const payBtn = modal.querySelector('.pay-btn');
    
    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';
    
    try {
      // Import payment service dynamically
      const { default: paymentService } = await import('../services/paymentService.js');
      
      const result = await paymentService.initiatePayment(selectedPlan, email, phone);
      
      if (result.checkout_url) {
        // Redirect to IntaSend checkout
        paymentService.redirectToPayment(result.checkout_url);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      alert(`Payment failed: ${error.message}`);
      payBtn.disabled = false;
      payBtn.innerHTML = `Pay Now - <span id="selected-amount">${selectedPlan === 'basic' ? 'KES 5.00' : 'KES 15.00'}</span>`;
    }
  }

  return { showPaymentModal, closeModal };
}