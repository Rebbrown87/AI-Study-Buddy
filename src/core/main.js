import { supabase, getCurrentUser, getProfile, getUserPreferences, getPremiumSubscription, logActivity } from '../config/supabase.js';
import { initializeAuth } from './authManager.js';
import { initializePremiumSystem, checkPremiumAccess } from './premiumManager.js';
import { initializePreferences, saveUserPreference, autoLearnPreferences } from './preferencesManager.js';

export let currentUser = null;
export let userProfile = null;
export let userPreferences = null;
export let premiumSubscription = null;
export let currentFlashcards = [];
export let currentTheme = 'dark';

export async function initializeApp() {
  console.log('LikaAI initializing...');

  currentUser = await getCurrentUser();

  if (currentUser) {
    userProfile = await getProfile(currentUser.id);
    userPreferences = await getUserPreferences(currentUser.id);
    premiumSubscription = await getPremiumSubscription(currentUser.id);

    if (userPreferences) {
      currentTheme = userPreferences.theme || 'dark';
    }

    await logActivity(currentUser.id, 'login', { timestamp: new Date().toISOString() });
  }

  initializeAuth(currentUser, userProfile);
  initializeTheme();
  initializeCounters();
  initializeWordCounter();
  initializeScrollEffects();
  initializeTabNavigation();
  initializeFlashcardGenerator();
  initializeNotesGenerator();
  initializePremiumSystem(currentUser, premiumSubscription);
  initializePreferences(currentUser, userPreferences);
  initializeSettings();
  initializeFeedbackLink();
}

function initializeTheme() {
  const themeDropdown = document.getElementById('themeDropdown');
  if (!themeDropdown) return;

  document.body.setAttribute('data-theme', currentTheme);
  themeDropdown.value = currentTheme;

  themeDropdown.addEventListener('change', async (e) => {
    currentTheme = e.target.value;
    document.body.setAttribute('data-theme', currentTheme);

    if (currentUser && userPreferences) {
      await saveUserPreference('theme', currentTheme);
    } else {
      localStorage.setItem('selectedTheme', currentTheme);
    }

    showNotification(`Theme changed to ${currentTheme}`, 'success');
  });
}

function initializeTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });

      button.classList.add('active');
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
      }
    });
  });
}

function initializeCounters() {
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.stat-number').forEach(counter => {
    observer.observe(counter);
  });
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    element.textContent = target > 100 ? Math.floor(current).toLocaleString() : Math.floor(current);
  }, 16);
}

function initializeWordCounter() {
  const textarea = document.getElementById('study-notes');
  const wordCountElement = document.getElementById('word-count');

  if (!textarea || !wordCountElement) return;

  textarea.addEventListener('input', () => {
    const text = textarea.value.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    wordCountElement.textContent = wordCount;

    if (wordCount > 50) {
      wordCountElement.style.color = 'var(--accent-primary)';
    } else {
      wordCountElement.style.color = 'var(--text-secondary)';
    }
  });
}

function initializeScrollEffects() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.glass-element').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
  });
}

function initializeSettings() {
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'settings-btn glass-element';
  settingsBtn.innerHTML = '⚙️';
  settingsBtn.title = 'Settings';
  settingsBtn.addEventListener('click', () => {
    window.location.href = '/src/pages/settings.html';
  });

  const navControls = document.querySelector('.nav-controls');
  if (navControls) {
    navControls.insertBefore(settingsBtn, navControls.firstChild);
  }
}

function initializeFeedbackLink() {
  const feedbackBtn = document.createElement('button');
  feedbackBtn.className = 'feedback-btn glass-element';
  feedbackBtn.innerHTML = '💬';
  feedbackBtn.title = 'Feedback';
  feedbackBtn.addEventListener('click', () => {
    window.location.href = '/src/pages/feedback.html';
  });

  const navControls = document.querySelector('.nav-controls');
  if (navControls) {
    navControls.insertBefore(feedbackBtn, navControls.firstChild);
  }
}

function initializeFlashcardGenerator() {
  const generateBtn = document.getElementById('generate-btn');
  const notesTextarea = document.getElementById('study-notes');

  if (!generateBtn || !notesTextarea) return;

  generateBtn.addEventListener('click', async () => {
    const notes = notesTextarea.value.trim();

    if (!notes) {
      showNotification('Please paste some study notes first.', 'warning');
      return;
    }

    if (notes.length < 50) {
      showNotification('Please provide more detailed notes (at least 50 characters).', 'warning');
      return;
    }

    await generateFlashcards(notes);
  });
}

async function generateFlashcards(notes) {
  showLoadingSteps();

  try {
    const flashcards = await generateFlashcardsContent(notes);
    currentFlashcards = flashcards;

    if (currentUser) {
      await logActivity(currentUser.id, 'flashcard_generated', {
        count: flashcards.length,
        notes_length: notes.length
      });

      await autoLearnPreferences('flashcard', {
        difficulty: flashcards[0]?.difficulty || 3
      });
    }

    setTimeout(() => {
      hideLoadingOverlay();
      displayFlashcards(flashcards);
      document.getElementById('flashcards-section').style.display = 'block';

      setTimeout(() => {
        document.getElementById('flashcards-section').scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }, 3000);
  } catch (error) {
    hideLoadingOverlay();
    showNotification(`Error generating flashcards: ${error.message}`, 'error');
  }
}

async function generateFlashcardsContent(notes) {
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (!notes || notes.trim().length < 20) {
    throw new Error('Please provide more detailed study notes');
  }

  const flashcards = [];
  const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 15);
  const words = notes.toLowerCase().split(/\W+/);

  const keyTerms = words.filter(word =>
    word.length > 5 &&
    !['the', 'and', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'were'].includes(word)
  ).slice(0, 8);

  const definitionPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is\s+([^.!?]+)/g;
  let match;
  let cardIndex = 0;

  while ((match = definitionPattern.exec(notes)) !== null && cardIndex < 4) {
    flashcards.push({
      id: `def-${Date.now()}-${cardIndex}`,
      question: `What is ${match[1].trim()}?`,
      answer: match[2].trim(),
      category: 'Definition',
      difficulty: 2,
      type: 'definition'
    });
    cardIndex++;
  }

  keyTerms.slice(0, 4).forEach((term, index) => {
    const relevantSentence = sentences.find(s =>
      s.toLowerCase().includes(term.toLowerCase())
    );

    if (relevantSentence) {
      flashcards.push({
        id: `concept-${Date.now()}-${index}`,
        question: `Explain the concept of "${term}".`,
        answer: relevantSentence.trim(),
        category: 'Concept',
        difficulty: 3,
        type: 'concept'
      });
    }
  });

  sentences.slice(0, 3).forEach((sentence, index) => {
    const words = sentence.trim().split(' ');
    if (words.length > 8) {
      const importantWords = words.filter(word =>
        word.length > 4 &&
        /^[A-Za-z]+$/.test(word) &&
        !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'were', 'will', 'which'].includes(word.toLowerCase())
      );

      if (importantWords.length > 0) {
        const targetWord = importantWords[0];
        const blankSentence = sentence.replace(new RegExp(`\\b${targetWord}\\b`, 'gi'), '______');

        flashcards.push({
          id: `blank-${Date.now()}-${index}`,
          question: `Fill in the blank: ${blankSentence}`,
          answer: targetWord,
          category: 'Fill-in-Blank',
          difficulty: 4,
          type: 'fill-blank'
        });
      }
    }
  });

  return flashcards.slice(0, 10);
}

function displayFlashcards(flashcards) {
  const container = document.getElementById('flashcards-container');
  if (!container) return;

  if (!flashcards || flashcards.length === 0) {
    container.innerHTML = `
      <div class="no-cards glass-element">
        <h3>🤔 No flashcards generated</h3>
        <p>Try providing more detailed study notes with clear concepts and definitions.</p>
      </div>
    `;
    return;
  }

  updateCategoryFilter(flashcards);
  container.innerHTML = '';

  flashcards.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'flashcard glass-element';
    cardElement.setAttribute('data-category', card.category);
    cardElement.style.animationDelay = `${index * 0.1}s`;

    cardElement.innerHTML = `
      <div class="flashcard-header">
        <span class="tag">${card.category}</span>
        <span class="difficulty">
          ${'★'.repeat(card.difficulty)}${'☆'.repeat(5 - card.difficulty)}
        </span>
      </div>
      <div class="flashcard-content">
        <div class="flashcard-question">${card.question}</div>
        <div class="flashcard-answer">
          <strong>Answer:</strong> ${card.answer}
        </div>
        <button class="reveal-btn" onclick="toggleAnswer(this)">
          <span>Show Answer</span>
        </button>
      </div>
    `;

    container.appendChild(cardElement);
  });

  initializeFlashcardControls();
  showNotification(`Generated ${flashcards.length} flashcards successfully!`, 'success');
}

function updateCategoryFilter(flashcards) {
  const categoryFilter = document.getElementById('category-filter');
  if (!categoryFilter) return;

  const categories = [...new Set(flashcards.map(card => card.category))];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function initializeFlashcardControls() {
  const shuffleBtn = document.getElementById('shuffle-btn');
  const exportBtn = document.getElementById('export-btn');
  const categoryFilter = document.getElementById('category-filter');

  if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleFlashcards);
  if (exportBtn) exportBtn.addEventListener('click', exportToPDF);
  if (categoryFilter) categoryFilter.addEventListener('change', filterByCategory);
}

function shuffleFlashcards() {
  const container = document.getElementById('flashcards-container');
  if (!container) return;

  const cards = Array.from(container.children);

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  container.innerHTML = '';
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    container.appendChild(card);
  });

  showNotification('Flashcards shuffled!', 'success');
}

function filterByCategory(e) {
  const selectedCategory = e.target.value;
  const cards = document.querySelectorAll('.flashcard');

  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    if (selectedCategory === 'all' || cardCategory === selectedCategory) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

async function exportToPDF() {
  const hasPremium = await checkPremiumAccess('pdf-export');
  if (!hasPremium) return;

  if (!currentFlashcards || currentFlashcards.length === 0) {
    showNotification('No flashcards to export.', 'warning');
    return;
  }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('LikaAI - Flashcards', 20, 30);

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

    let yPosition = 60;
    const pageHeight = doc.internal.pageSize.height;

    currentFlashcards.forEach((card, index) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Card ${index + 1} - ${card.category}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Q: ', 20, yPosition);
      doc.setFont(undefined, 'normal');
      const questionLines = doc.splitTextToSize(card.question, 150);
      doc.text(questionLines, 30, yPosition);
      yPosition += questionLines.length * 7 + 5;

      doc.setFont(undefined, 'bold');
      doc.text('A: ', 20, yPosition);
      doc.setFont(undefined, 'normal');
      const answerLines = doc.splitTextToSize(card.answer, 150);
      doc.text(answerLines, 30, yPosition);
      yPosition += answerLines.length * 7 + 15;
    });

    doc.save('likaai_flashcards.pdf');
    showNotification('Flashcards exported to PDF successfully!', 'success');

    if (currentUser) {
      await logActivity(currentUser.id, 'pdf_exported', { type: 'flashcards', count: currentFlashcards.length });
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    showNotification('Error exporting PDF. Please try again.', 'error');
  }
}

window.toggleAnswer = function (button) {
  const answer = button.parentElement.querySelector('.flashcard-answer');
  const isVisible = answer.classList.contains('visible');

  if (isVisible) {
    answer.classList.remove('visible');
    button.innerHTML = '<span>Show Answer</span>';
    button.classList.remove('active');
  } else {
    answer.classList.add('visible');
    button.innerHTML = '<span>Hide Answer</span>';
    button.classList.add('active');
  }
};

function initializeNotesGenerator() {
  const generateNotesBtn = document.getElementById('generate-notes-btn');
  if (generateNotesBtn) {
    generateNotesBtn.addEventListener('click', async () => {
      const topic = document.getElementById('notes-topic').value.trim();
      if (!topic) {
        showNotification('Please enter a topic.', 'warning');
        return;
      }
      showNotification('Notes generator is a premium feature in development.', 'info');
    });
  }
}

export function showLoadingSteps() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (!loadingOverlay) return;

  loadingOverlay.style.display = 'flex';
  const steps = loadingOverlay.querySelectorAll('.step');

  steps.forEach((step, index) => {
    setTimeout(() => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    }, index * 750);
  });
}

export function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  const styles = {
    position: 'fixed',
    top: '100px',
    right: '20px',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '600',
    zIndex: '1001',
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

document.addEventListener('DOMContentLoaded', initializeApp);
