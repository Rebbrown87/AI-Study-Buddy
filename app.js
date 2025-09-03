import FlashcardGenerator from './src/services/flashcardGenerator.js';

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const themeDropdown = document.getElementById('themeDropdown');
  const savedTheme = localStorage.getItem('selectedTheme') || 'light';
  
  // Apply saved theme
  document.body.setAttribute('data-theme', savedTheme);
  themeDropdown.value = savedTheme;

  // Theme change handler
  themeDropdown.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    document.body.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('selectedTheme', selectedTheme);
  });

  // Flashcard generation
  const generateBtn = document.getElementById('generate-btn');
  const notesTextarea = document.getElementById('study-notes');
  const flashcardsContainer = document.getElementById('flashcards-container');

  generateBtn.addEventListener('click', async () => {
    const notes = notesTextarea.value.trim();
    
    if (!notes) {
      alert('Please paste some study notes first.');
      return;
    }

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    flashcardsContainer.innerHTML = '<div class="loading">🧠 AI is creating your flashcards...</div>';

    try {
      const flashcards = await FlashcardGenerator.generateFlashcards(notes);
      displayFlashcards(flashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      flashcardsContainer.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate Flashcards';
    }
  });

  function displayFlashcards(flashcards) {
    if (!flashcards || flashcards.length === 0) {
      flashcardsContainer.innerHTML = '<div class="no-cards">No flashcards could be generated. Try providing more detailed notes.</div>';
      return;
    }

    flashcardsContainer.innerHTML = '';
    
    flashcards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.className = 'flashcard';
      cardElement.innerHTML = `
        <div class="flashcard-header">
          <span class="tag">${card.category}</span>
          <span class="difficulty">Difficulty: ${'★'.repeat(card.difficulty)}${'☆'.repeat(5-card.difficulty)}</span>
        </div>
        <div class="flashcard-content">
          <h3>Q: ${card.question}</h3>
          <div class="answer" style="display: none;">
            <p><strong>A:</strong> ${card.answer}</p>
          </div>
          <button class="reveal-btn" onclick="toggleAnswer(this)">Show Answer</button>
        </div>
      `;
      flashcardsContainer.appendChild(cardElement);
    });
  }

  // Make toggleAnswer globally available
  window.toggleAnswer = function(button) {
    const answer = button.parentElement.querySelector('.answer');
    const isVisible = answer.style.display !== 'none';
    
    if (isVisible) {
      answer.style.display = 'none';
      button.textContent = 'Show Answer';
      button.classList.remove('active');
    } else {
      answer.style.display = 'block';
      button.textContent = 'Hide Answer';
      button.classList.add('active');
    }
  };
});