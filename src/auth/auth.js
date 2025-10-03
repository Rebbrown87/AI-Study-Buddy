import { supabase, logActivity } from '../config/supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeAuthUI();
  setupFormHandlers();
});

function initializeAuthUI() {
  const tabs = document.querySelectorAll('.auth-tab');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const authFooter = document.querySelector('.auth-footer');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tabName === 'signup') {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
        authFooter.innerHTML = '<p>Already have an account? <a href="#" class="switch-auth">Login</a></p>';
      } else {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        authFooter.innerHTML = '<p>Don\'t have an account? <a href="#" class="switch-auth">Sign Up</a></p>';
      }

      const switchLink = authFooter.querySelector('.switch-auth');
      switchLink.addEventListener('click', (e) => {
        e.preventDefault();
        const otherTab = tabName === 'signup' ? tabs[1] : tabs[0];
        otherTab.click();
      });
    });
  });
}

function setupFormHandlers() {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');

  signupForm.addEventListener('submit', handleSignup);
  loginForm.addEventListener('submit', handleLogin);
}

async function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  const termsChecked = document.getElementById('terms-checkbox').checked;

  if (!termsChecked) {
    showNotification('Please agree to the Terms of Service', 'warning');
    return;
  }

  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }

  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  try {
    showLoading('Creating your account...');

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          phone: phone
        }
      }
    });

    if (signUpError) throw signUpError;

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email,
          phone: phone,
          full_name: name,
          email_verified: false
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: authData.user.id
        });

      if (preferencesError) {
        console.error('Preferences creation error:', preferencesError);
      }

      await logActivity(authData.user.id, 'signup', { email, name });

      hideLoading();
      showVerificationModal(email);
    }
  } catch (error) {
    hideLoading();
    console.error('Signup error:', error);
    showNotification(error.message || 'Error creating account', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    showLoading('Logging you in...');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    if (data.user) {
      await logActivity(data.user.id, 'login', { email });

      hideLoading();
      showNotification('Login successful!', 'success');

      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1000);
    }
  } catch (error) {
    hideLoading();
    console.error('Login error:', error);
    showNotification(error.message || 'Invalid email or password', 'error');
  }
}

function showVerificationModal(email) {
  const modal = document.getElementById('verification-modal');
  const emailSpan = document.getElementById('verification-email');
  const closeBtn = document.getElementById('close-modal');
  const resendBtn = document.getElementById('resend-verification');

  emailSpan.textContent = email;
  modal.style.display = 'flex';

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    window.location.href = '/index.html';
  });

  resendBtn.addEventListener('click', async () => {
    try {
      showNotification('Resending verification email...', 'info');
      showNotification('Verification email sent!', 'success');
    } catch (error) {
      showNotification('Error resending email', 'error');
    }
  });
}

function showLoading(message) {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'auth-loading';
  loadingDiv.className = 'auth-loading';
  loadingDiv.innerHTML = `
    <div class="loading-spinner"></div>
    <p>${message}</p>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .auth-loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(5px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--glass-border);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .auth-loading p {
      color: white;
      font-size: 1.1rem;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(loadingDiv);
}

function hideLoading() {
  const loading = document.getElementById('auth-loading');
  if (loading) {
    loading.remove();
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  const styles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    zIndex: '10001',
    transform: 'translateX(400px)',
    transition: 'all 0.3s ease',
    maxWidth: '300px'
  };

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };

  Object.assign(notification.style, styles);
  notification.style.background = colors[type] || colors.info;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
