// Global state
let currentFlashcards = [];
let currentTheme = 'dark';

// Global loading functions
function showLoadingSteps() {
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

function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initializing...');
  initializeTheme();
  initializeCounters();
  initializeFlashcardGenerator();
  initializeWordCounter();
  initializeScrollEffects();
  initializeTabNavigation();
  initializeNotesGenerator();
});

// Theme Management
function initializeTheme() {
  const themeDropdown = document.getElementById('themeDropdown');
  if (!themeDropdown) {
    console.error('Theme dropdown not found');
    return;
  }

  const savedTheme = localStorage.getItem('selectedTheme') || 'dark';
  
  currentTheme = savedTheme;
  document.body.setAttribute('data-theme', savedTheme);
  themeDropdown.value = savedTheme;

  themeDropdown.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    console.log('Theme changed to:', selectedTheme);
    
    currentTheme = selectedTheme;
    document.body.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('selectedTheme', selectedTheme);
    
    // Add smooth transition effect
    document.body.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 400);
    
    showNotification(`Theme changed to ${selectedTheme}`, 'success');
  });
}

// Tab Navigation
function initializeTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
      }
      
      showNotification(`Switched to ${targetTab === 'flashcards' ? 'Flashcard Generator' : 'AI Notes Generator'}`, 'info');
    });
  });
}

// Notes Generator
function initializeNotesGenerator() {
  const generateNotesBtn = document.getElementById('generate-notes-btn');
  const topicInput = document.getElementById('notes-topic');
  const levelSelect = document.getElementById('notes-level');
  const includeExamples = document.getElementById('include-examples');
  const includeDiagrams = document.getElementById('include-diagrams');
  const notesSection = document.getElementById('generated-notes-section');
  const notesContent = document.getElementById('notes-content');
  const savePdfBtn = document.getElementById('save-pdf-btn');
  const copyNotesBtn = document.getElementById('copy-notes-btn');
  const regenerateBtn = document.getElementById('regenerate-notes-btn');

  if (!generateNotesBtn || !topicInput) {
    console.error('Notes generator elements not found');
    return;
  }

  generateNotesBtn.addEventListener('click', async () => {
    const topic = topicInput.value.trim();
    const level = levelSelect.value;
    const withExamples = includeExamples.checked;
    const withDiagrams = includeDiagrams.checked;
    
    if (!topic) {
      showNotification('Please enter a topic to generate notes.', 'warning');
      return;
    }

    if (topic.length < 3) {
      showNotification('Please provide a more specific topic (at least 3 characters).', 'warning');
      return;
    }

    await generateNotes(topic, level, withExamples, withDiagrams);
  });

  savePdfBtn?.addEventListener('click', () => saveToPDF());
  copyNotesBtn?.addEventListener('click', () => copyNotesToClipboard());
  regenerateBtn?.addEventListener('click', () => {
    const topic = topicInput.value.trim();
    const level = levelSelect.value;
    const withExamples = includeExamples.checked;
    const withDiagrams = includeDiagrams.checked;
    if (topic) generateNotes(topic, level, withExamples, withDiagrams);
  });

  async function generateNotes(topic, level, withExamples, withDiagrams) {
    console.log('Generating notes for topic:', topic);
    
    showLoadingSteps();
    
    try {
      // Import and use the notes generator
      const { default: NotesGenerator } = await import('./src/services/notesGenerator.js');
      const notes = await NotesGenerator.generateNotes(topic, level, withExamples, withDiagrams);
      
      console.log('Generated notes:', notes);
      
      setTimeout(() => {
        hideLoadingOverlay();
        displayNotes(notes, topic);
        notesSection.style.display = 'block';
        
        // Smooth scroll to notes
        setTimeout(() => {
          notesSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 300);
      }, 2500);
      
    } catch (error) {
      console.error('Error generating notes:', error);
      hideLoadingOverlay();
      showNotification(`Error generating notes: ${error.message}`, 'error');
    }
  }

  function displayNotes(notes, topic) {
    if (!notesContent) return;
    
    if (!notes || notes.trim().length === 0) {
      notesContent.innerHTML = `
        <div class="no-notes">
          <h3>🤔 No notes generated</h3>
          <p>Try providing a more specific topic or check your internet connection.</p>
        </div>
      `;
      return;
    }

    notesContent.innerHTML = notes;
    showNotification(`Generated comprehensive notes on "${topic}"!`, 'success');
  }

  function saveToPDF() {
    if (!notesContent || !notesContent.textContent.trim()) {
      showNotification('No notes to save. Generate notes first.', 'warning');
      return;
    }

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Get the topic for the filename
      const topic = topicInput.value.trim() || 'Study Notes';
      
      // Add title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(`Study Notes: ${topic}`, 20, 30);
      
      // Add generated date
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Add content
      const content = notesContent.textContent;
      const lines = doc.splitTextToSize(content, 170);
      
      let yPosition = 60;
      const pageHeight = doc.internal.pageSize.height;
      
      lines.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });
      
      // Save the PDF
      doc.save(`${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.pdf`);
      showNotification('Notes saved as PDF successfully!', 'success');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      showNotification('Error saving PDF. Please try again.', 'error');
    }
  }

  function copyNotesToClipboard() {
    if (!notesContent || !notesContent.textContent.trim()) {
      showNotification('No notes to copy. Generate notes first.', 'warning');
      return;
    }

    navigator.clipboard.writeText(notesContent.textContent).then(() => {
      showNotification('Notes copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Copy failed:', err);
      showNotification('Failed to copy notes. Please try again.', 'error');
    });
  }
}

// Animated Counters
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
    
    if (target > 100) {
      element.textContent = Math.floor(current).toLocaleString();
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Word Counter
function initializeWordCounter() {
  const textarea = document.getElementById('study-notes');
  const wordCountElement = document.getElementById('word-count');

  if (!textarea || !wordCountElement) {
    console.error('Word counter elements not found');
    return;
  }

  textarea.addEventListener('input', () => {
    const text = textarea.value.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    wordCountElement.textContent = wordCount;
    
    // Add visual feedback based on word count
    if (wordCount > 50) {
      wordCountElement.style.color = 'var(--accent-primary)';
    } else if (wordCount > 20) {
      wordCountElement.style.color = 'var(--text-secondary)';
    } else {
      wordCountElement.style.color = 'var(--text-secondary)';
    }
  });
}

// Flashcard Generation
function initializeFlashcardGenerator() {
  const generateBtn = document.getElementById('generate-btn');
  const notesTextarea = document.getElementById('study-notes');
  const flashcardsContainer = document.getElementById('flashcards-container');
  const flashcardsSection = document.getElementById('flashcards-section');
  const loadingOverlay = document.getElementById('loading-overlay');

  if (!generateBtn || !notesTextarea) {
    console.error('Required elements not found');
    return;
  }

  generateBtn.addEventListener('click', async () => {
    const notes = notesTextarea.value.trim();
    
    if (!notes) {
      showNotification('Please paste some study notes first.', 'warning');
      return;
    }

    if (notes.length < 50) {
      showNotification('Please provide more detailed notes (at least 50 characters) for better flashcard generation.', 'warning');
      return;
    }

    await generateFlashcards(notes);
  });

  async function generateFlashcards(notes) {
    console.log('Generating flashcards for notes:', notes.substring(0, 100) + '...');
    
    // Show loading overlay with animation
    showLoadingSteps();
    
    try {
      // Import and use the flashcard generator
      const { default: FlashcardGenerator } = await import('./src/services/flashcardGenerator.js');
      const flashcards = await FlashcardGenerator.generateFlashcards(notes);
      currentFlashcards = flashcards;
      
      console.log('Generated flashcards:', flashcards);
      
      setTimeout(() => {
        hideLoadingOverlay();
        displayFlashcards(flashcards);
        flashcardsSection.style.display = 'block';
        
        // Smooth scroll to flashcards
        setTimeout(() => {
          flashcardsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 300);
      }, 3000); // Show loading animation for 3 seconds
      
    } catch (error) {
      console.error('Error generating flashcards:', error);
      hideLoadingOverlay();
      showNotification(`Error generating flashcards: ${error.message}`, 'error');
    }
  }

  function displayFlashcards(flashcards) {
    if (!flashcardsContainer) return;
    
    if (!flashcards || flashcards.length === 0) {
      flashcardsContainer.innerHTML = `
        <div class="no-cards glass-element">
          <h3>🤔 No flashcards generated</h3>
          <p>Try providing more detailed study notes with clear concepts and definitions.</p>
        </div>
      `;
      return;
    }

    // Update category filter
    updateCategoryFilter(flashcards);

    flashcardsContainer.innerHTML = '';
    
    flashcards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'flashcard glass-element';
      cardElement.setAttribute('data-category', card.category);
      cardElement.style.animationDelay = `${index * 0.1}s`;
      
      cardElement.innerHTML = `
        <div class="flashcard-header">
          <span class="tag">${card.category}</span>
          <span class="difficulty">
            ${'★'.repeat(card.difficulty)}${'☆'.repeat(5-card.difficulty)}
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
      
      flashcardsContainer.appendChild(cardElement);
    });

    // Initialize flashcard controls
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
}

// Flashcard Controls
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
  
  // Shuffle array
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  // Re-append in new order with animation
  container.innerHTML = '';
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    container.appendChild(card);
  });
  
  showNotification('Flashcards shuffled! 🔀', 'success');
}

function filterByCategory(e) {
  const selectedCategory = e.target.value;
  const cards = document.querySelectorAll('.flashcard');
  
  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    if (selectedCategory === 'all' || cardCategory === selectedCategory) {
      card.style.display = 'block';
      card.style.animation = 'slideInUp 0.3s ease-out';
    } else {
      card.style.display = 'none';
    }
  });
}

function exportToPDF() {
  showNotification('PDF export feature coming soon! 📄', 'info');
}

// Global toggle function for flashcard answers
window.toggleAnswer = function(button) {
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

// Scroll Effects
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

  // Observe elements for scroll animations
  document.querySelectorAll('.glass-element').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
  });
}

// Notification System
function showNotification(message, type = 'info') {
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
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Animate out and remove
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Enhanced interactions
document.addEventListener('mousemove', (e) => {
  let cursor = document.querySelector('.cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, var(--accent-primary), transparent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.3;
      transition: all 0.1s ease;
    `;
    document.body.appendChild(cursor);
  }
  
  cursor.style.left = e.clientX - 10 + 'px';
  cursor.style.top = e.clientY - 10 + 'px';
});

// Add particle effect on click
document.addEventListener('click', (e) => {
  createParticleEffect(e.clientX, e.clientY);
});

function createParticleEffect(x, y) {
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: var(--accent-primary);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      left: ${x}px;
      top: ${y}px;
    `;
    
    document.body.appendChild(particle);
    
    const angle = (i / 6) * Math.PI * 2;
    const velocity = 100;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    
    let opacity = 1;
    let currentX = x;
    let currentY = y;
    
    const animate = () => {
      currentX += vx * 0.02;
      currentY += vy * 0.02;
      opacity -= 0.02;
      
      particle.style.left = currentX + 'px';
      particle.style.top = currentY + 'px';
      particle.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };
    
    requestAnimationFrame(animate);
  }
}