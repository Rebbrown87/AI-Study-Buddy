import { supabase, getCurrentUser } from '../config/supabase.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await getCurrentUser();
  setupFormHandler();
  if (currentUser) {
    loadFeedbackHistory();
  }
});

function setupFormHandler() {
  const form = document.getElementById('feedback-form');
  form.addEventListener('submit', handleFeedbackSubmit);
}

async function handleFeedbackSubmit(e) {
  e.preventDefault();

  const feedbackType = document.getElementById('feedback-type').value;
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();
  const rating = document.querySelector('input[name="rating"]:checked')?.value;

  if (!feedbackType || !subject || !message) {
    showNotification('Please fill in all required fields', 'warning');
    return;
  }

  try {
    showLoading('Submitting your feedback...');

    const feedbackData = {
      feedback_type: feedbackType,
      subject: subject,
      message: message,
      rating: rating ? parseInt(rating) : null,
      user_id: currentUser ? currentUser.id : null
    };

    const { error } = await supabase
      .from('feedback')
      .insert(feedbackData);

    if (error) throw error;

    hideLoading();
    showNotification('Thank you for your feedback!', 'success');

    document.getElementById('feedback-form').reset();

    if (currentUser) {
      loadFeedbackHistory();
    }
  } catch (error) {
    hideLoading();
    console.error('Feedback submission error:', error);
    showNotification('Error submitting feedback. Please try again.', 'error');
  }
}

async function loadFeedbackHistory() {
  if (!currentUser) return;

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    displayFeedbackHistory(data || []);
  } catch (error) {
    console.error('Error loading feedback:', error);
  }
}

function displayFeedbackHistory(feedbackList) {
  const listContainer = document.getElementById('feedback-list');

  if (!feedbackList || feedbackList.length === 0) {
    listContainer.innerHTML = '<p class="no-feedback">No feedback submitted yet</p>';
    return;
  }

  listContainer.innerHTML = feedbackList.map(item => {
    const date = new Date(item.created_at).toLocaleDateString();
    const typeClass = item.feedback_type;

    return `
      <div class="feedback-item">
        <div class="feedback-item-header">
          <span class="feedback-type-badge ${typeClass}">${item.feedback_type}</span>
          <span class="feedback-date">${date}</span>
        </div>
        <div class="feedback-subject">${item.subject}</div>
        <div class="feedback-message">${item.message}</div>
        ${item.rating ? `<div class="feedback-rating">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>` : ''}
      </div>
    `;
  }).join('');
}

function showLoading(message) {
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'feedback-loading';
  loadingDiv.className = 'feedback-loading';
  loadingDiv.innerHTML = `
    <div class="loading-spinner"></div>
    <p>${message}</p>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .feedback-loading {
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
    .feedback-loading p {
      color: white;
      font-size: 1.1rem;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(loadingDiv);
}

function hideLoading() {
  const loading = document.getElementById('feedback-loading');
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
