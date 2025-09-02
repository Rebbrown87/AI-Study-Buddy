// === Theme Logic ===
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('selectedTheme', theme);
}

function initThemeSwitcher(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const savedTheme = localStorage.getItem('selectedTheme') || 'light';
  applyTheme(savedTheme);
  dropdown.value = savedTheme;

  dropdown.addEventListener('change', () => {
    applyTheme(dropdown.value);
  });
}

// === API Logic ===
const API_URL = 'http://localhost:5000/generate'; // Update if deployed

async function fetchFlashcards(notes) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    });

    if (!response.ok) throw new Error('Failed to fetch flashcards');
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    return { error: error.message };
  }
}

// === Flashcard Rendering ===
function renderFlashcards(containerId, flashcards) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  flashcards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'flashcard';
    div.innerHTML = `
      <h3>${card.question}</h3>
      <p>${card.answer}</p>
      <span class="tag">${card.tag || 'General'}</span>
    `;
    container.appendChild(div);
  });
}

// === Utility Functions ===
function sanitizeInput(text) {
  return text.replace(/<[^>]*>?/gm, '').trim();
}

function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

// === App Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher('themeDropdown');

  const generateBtn = document.getElementById('generateBtn');
  const generateBtnActual = document.getElementById('generate-btn');
  const notesInput = document.getElementById('notesInput');
  const notesInputActual = document.getElementById('study-notes');

  const actualGenerateBtn = generateBtnActual || generateBtn;
  const actualNotesInput = notesInputActual || notesInput;

  if (actualGenerateBtn && actualNotesInput) {
    actualGenerateBtn.addEventListener('click', async () => {
      const notes = sanitizeInput(actualNotesInput.value);
      if (!notes) {
        alert('Please paste some study notes first.');
        return;
      }

      actualGenerateBtn.disabled = true;
      actualGenerateBtn.textContent = 'Generating...';

      // Simulate API call with sample flashcards
      setTimeout(() => {
        const sampleCards = [
          { question: 'What is machine learning?', answer: 'A subset of AI that enables computers to learn without explicit programming.', tag: 'AI' },
          { question: 'What is supervised learning?', answer: 'Learning with labeled training data to make predictions.', tag: 'ML' },
          { question: 'What is a neural network?', answer: 'A computing system inspired by biological neural networks.', tag: 'Deep Learning' }
        ];
        
        renderFlashcards('flashcards-container', sampleCards);
        actualGenerateBtn.disabled = false;
        actualGenerateBtn.textContent = 'Generate Flashcards';
      }, 1500);
    });
  }
});

// Remove the old theme switching code since we're using the new system
document.addEventListener('DOMContentLoaded', () => {
  // Remove old radio button theme switching
  const oldThemeInputs = document.querySelectorAll('input[name="theme"]');
  oldThemeInputs.forEach(input => {
    input.removeEventListener('change', () => {});
  });
});
    if (!notes) {
      alert('Please paste some study notes first.');
      return;
    }

    const result = await fetchFlashcards(notes);
    if (result.flashcards) {
      renderFlashcards('flashcardContainer', result.flashcards);
    } else {
      alert('No flashcards returned. Try again or check your backend.');
    }
  });
});

const supabase = createClient(
  'https://bxoftpbkzbfzhxkoqjll.supabase.co', // https://bxotpfxabfazhbxqajli.supabase.co
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b3RwZnhhYmZhemhieHFhamxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NDIxODcsImV4cCI6MjA3MjMxODE4N30.bEjZ5IOI5-5W4FVhQbqVnIvtedSVutnAWXu3wJgUq3Q' // your public API key
);
