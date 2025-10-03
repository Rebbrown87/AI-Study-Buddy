import { supabase, getCurrentUser, getProfile, getUserPreferences, getPremiumSubscription } from '../config/supabase.js';

let currentUser = null;
let userProfile = null;
let userPreferences = null;
let premiumSubscription = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadUserData();
  setupPreferenceHandlers();
  setupDangerZoneHandlers();
});

async function loadUserData() {
  currentUser = await getCurrentUser();

  if (!currentUser) {
    showNotification('Please login to access settings', 'warning');
    setTimeout(() => {
      window.location.href = '/src/pages/auth.html';
    }, 2000);
    return;
  }

  userProfile = await getProfile(currentUser.id);
  userPreferences = await getUserPreferences(currentUser.id);
  premiumSubscription = await getPremiumSubscription(currentUser.id);

  displayAccountInfo();
  displaySubscriptionInfo();
  displayPreferences();
  await loadActivityLogs();
}

function displayAccountInfo() {
  if (!userProfile) return;

  document.getElementById('user-name').textContent = userProfile.full_name || 'N/A';
  document.getElementById('user-email').textContent = userProfile.email;
  document.getElementById('user-phone').textContent = userProfile.phone || 'N/A';
  document.getElementById('email-verified').textContent = userProfile.email_verified ? 'Yes' : 'No';
}

function displaySubscriptionInfo() {
  const statusElement = document.getElementById('subscription-status');

  if (premiumSubscription && premiumSubscription.status === 'active') {
    const expiryDate = new Date(premiumSubscription.expiry_date);
    statusElement.innerHTML = `
      <strong>Status:</strong> ${premiumSubscription.plan_type.toUpperCase()}<br>
      <strong>Expires:</strong> ${expiryDate.toLocaleDateString()}
    `;
    statusElement.style.color = 'var(--accent-primary)';
  } else {
    statusElement.textContent = 'No active subscription';
    statusElement.style.color = 'var(--text-secondary)';
  }
}

function displayPreferences() {
  if (!userPreferences) return;

  const themeSelect = document.getElementById('theme-select');
  const notesLevelSelect = document.getElementById('notes-level-select');
  const examplesCheck = document.getElementById('include-examples-check');
  const diagramsCheck = document.getElementById('include-diagrams-check');
  const difficultySlider = document.getElementById('flashcard-difficulty');
  const difficultyValue = document.getElementById('difficulty-value');

  themeSelect.value = userPreferences.theme || 'dark';
  notesLevelSelect.value = userPreferences.default_notes_level || 'intermediate';
  examplesCheck.checked = userPreferences.include_examples !== false;
  diagramsCheck.checked = userPreferences.include_diagrams !== false;
  difficultySlider.value = userPreferences.flashcard_difficulty || 3;
  difficultyValue.textContent = difficultySlider.value;

  document.body.setAttribute('data-theme', userPreferences.theme || 'dark');
}

function setupPreferenceHandlers() {
  const themeSelect = document.getElementById('theme-select');
  const notesLevelSelect = document.getElementById('notes-level-select');
  const examplesCheck = document.getElementById('include-examples-check');
  const diagramsCheck = document.getElementById('include-diagrams-check');
  const difficultySlider = document.getElementById('flashcard-difficulty');
  const difficultyValue = document.getElementById('difficulty-value');

  themeSelect.addEventListener('change', async (e) => {
    const theme = e.target.value;
    document.body.setAttribute('data-theme', theme);
    await savePreference('theme', theme);
  });

  notesLevelSelect.addEventListener('change', async (e) => {
    await savePreference('default_notes_level', e.target.value);
  });

  examplesCheck.addEventListener('change', async (e) => {
    await savePreference('include_examples', e.target.checked);
  });

  diagramsCheck.addEventListener('change', async (e) => {
    await savePreference('include_diagrams', e.target.checked);
  });

  difficultySlider.addEventListener('input', (e) => {
    difficultyValue.textContent = e.target.value;
  });

  difficultySlider.addEventListener('change', async (e) => {
    await savePreference('flashcard_difficulty', parseInt(e.target.value));
  });
}

async function savePreference(key, value) {
  if (!currentUser) return;

  try {
    const { error } = await supabase
      .from('user_preferences')
      .update({ [key]: value, updated_at: new Date().toISOString() })
      .eq('user_id', currentUser.id);

    if (error) throw error;

    showNotification('Preference saved successfully', 'success');
  } catch (error) {
    console.error('Error saving preference:', error);
    showNotification('Error saving preference', 'error');
  }
}

async function loadActivityLogs() {
  if (!currentUser) return;

  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    displayActivityLogs(data || []);
  } catch (error) {
    console.error('Error loading activity logs:', error);
    document.getElementById('activity-logs').innerHTML = '<p>Error loading activity history</p>';
  }
}

function displayActivityLogs(logs) {
  const container = document.getElementById('activity-logs');

  if (!logs || logs.length === 0) {
    container.innerHTML = '<p>No activity history yet</p>';
    return;
  }

  container.innerHTML = logs.map(log => {
    const date = new Date(log.created_at).toLocaleString();
    const activityLabel = formatActivityType(log.activity_type);

    return `
      <div class="activity-item">
        <div class="activity-type">${activityLabel}</div>
        <div class="activity-date">${date}</div>
      </div>
    `;
  }).join('');
}

function formatActivityType(type) {
  const labels = {
    'flashcard_generated': 'Generated Flashcards',
    'notes_generated': 'Generated Notes',
    'pdf_exported': 'Exported PDF',
    'login': 'Logged In',
    'signup': 'Signed Up',
    'premium_upgrade': 'Upgraded to Premium',
    'settings_updated': 'Updated Settings'
  };
  return labels[type] || type;
}

function setupDangerZoneHandlers() {
  const clearDataBtn = document.getElementById('clear-data-btn');
  const deleteAccountBtn = document.getElementById('delete-account-btn');

  clearDataBtn.addEventListener('click', handleClearData);
  deleteAccountBtn.addEventListener('click', handleDeleteAccount);
}

async function handleClearData() {
  const confirmed = confirm('Are you sure you want to clear all your data? This action cannot be undone.');

  if (!confirmed) return;

  try {
    showNotification('Clearing data...', 'info');

    await supabase.from('user_activity_logs').delete().eq('user_id', currentUser.id);

    showNotification('Data cleared successfully', 'success');

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error('Error clearing data:', error);
    showNotification('Error clearing data', 'error');
  }
}

async function handleDeleteAccount() {
  const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.');

  if (!confirmed) return;

  const doubleConfirm = confirm('This is your last chance. Are you absolutely sure you want to delete your account?');

  if (!doubleConfirm) return;

  try {
    showNotification('Deleting account...', 'info');

    const { error } = await supabase.rpc('delete_user_account', { user_id: currentUser.id });

    if (error) throw error;

    await supabase.auth.signOut();

    showNotification('Account deleted successfully', 'success');

    setTimeout(() => {
      window.location.href = '/index.html';
    }, 2000);
  } catch (error) {
    console.error('Error deleting account:', error);
    showNotification('Error deleting account. Please contact support.', 'error');
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
