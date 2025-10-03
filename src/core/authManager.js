import { supabase } from '../config/supabase.js';
import { showNotification } from './main.js';

export function initializeAuth(currentUser, userProfile) {
  const authBtn = document.getElementById('auth-btn');
  const userMenu = document.getElementById('user-menu');
  const userNameSpan = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-btn');

  if (!authBtn || !userMenu) return;

  if (currentUser && userProfile) {
    authBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    userNameSpan.textContent = userProfile.full_name || userProfile.email;

    logoutBtn.addEventListener('click', handleLogout);
  } else {
    authBtn.style.display = 'block';
    userMenu.style.display = 'none';

    authBtn.addEventListener('click', () => {
      window.location.href = '/src/pages/auth.html';
    });
  }

  setupAuthStateListener();
}

function setupAuthStateListener() {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      console.log('User signed in');
      window.location.reload();
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      window.location.href = '/index.html';
    }
  });
}

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Error logging out', 'error');
  }
}
