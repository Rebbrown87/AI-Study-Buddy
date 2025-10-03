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
  initializePremiumSystem();
  initializeSettings();
  initializeAboutModal();
});

// Premium System
function initializePremiumSystem() {
  // Check if user has premium status
  const premiumStatus = localStorage.getItem('premiumStatus');
  const premiumExpiry = localStorage.getItem('premiumExpiry');
  
  if (premiumStatus && premiumExpiry) {
    const expiryDate = new Date(premiumExpiry);
    const now = new Date();
    
    if (now < expiryDate) {
      // User has active premium
      updatePremiumUI(true);
    } else {
      // Premium expired
      localStorage.removeItem('premiumStatus');
      localStorage.removeItem('premiumExpiry');
      updatePremiumUI(false);
    }
  } else {
    updatePremiumUI(false);
  }
}

function checkPremiumFeature(featureName) {
  const premiumStatus = localStorage.getItem('premiumStatus');
  const premiumExpiry = localStorage.getItem('premiumExpiry');
  
  if (premiumStatus && premiumExpiry) {
    const expiryDate = new Date(premiumExpiry);
    const now = new Date();
    
    if (now < expiryDate) {
      return true; // User has active premium
    }
  }
  
  // Show premium upgrade modal
  showPremiumModal();
  return false;
}

// Show Premium Modal Function
function showPremiumModal() {
  // Remove existing modal if present
  const existingModal = document.querySelector('.premium-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'premium-modal';
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content glass-element">
        <div class="modal-header">
          <h2>🚀 Upgrade to Premium</h2>
          <button class="close-btn">&times;</button>
        </div>
        <p class="modal-subtitle">Unlock PDF export and premium features</p>
        <div class="premium-plans">
          <div class="plan" data-plan="basic">
            <h3>Basic Plan</h3>
            <div class="price">$5<span>/month</span></div>
            <p>Perfect for casual learners</p>
            <ul class="features">
              <li>✓ 50 flashcards per month</li>
              <li>✓ PDF export</li>
              <li>✓ Basic themes</li>
              <li>✓ Notes generator</li>
            </ul>
            <button class="select-plan-btn" data-plan="basic" data-price="5">
              Choose Basic - $5
            </button>
          </div>
          <div class="plan featured" data-plan="premium">
            <div class="popular-badge">Most Popular</div>
            <h3>Premium Plan</h3>
            <div class="price">$15<span>/month</span></div>
            <p>For serious students</p>
            <ul class="features">
              <li>✓ Unlimited flashcards</li>
              <li>✓ PDF export</li>
              <li>✓ All themes</li>
              <li>✓ Advanced export options</li>
              <li>✓ Priority support</li>
              <li>✓ Custom categories</li>
            </ul>
            <button class="select-plan-btn" data-plan="premium" data-price="15">
              Choose Premium - $15
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  const closeBtn = modal.querySelector('.close-btn');
  const overlay = modal.querySelector('.modal-overlay');
  const planButtons = modal.querySelectorAll('.select-plan-btn');

  closeBtn.addEventListener('click', () => modal.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) modal.remove();
  });

  planButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const plan = e.target.getAttribute('data-plan');
      const price = e.target.getAttribute('data-price');
      handlePremiumUpgrade(plan, price);
      modal.remove();
    });
  });
}

// Handle Premium Upgrade
function handlePremiumUpgrade(plan, price) {
  // Simulate payment process
  showNotification('Processing payment...', 'info');
  
  setTimeout(() => {
    // Set premium status
    localStorage.setItem('premiumStatus', plan);
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month from now
    localStorage.setItem('premiumExpiry', expiryDate.toISOString());
    
    // Update UI
    updatePremiumUI(true);
    
    showNotification(`🎉 Welcome to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan! PDF export is now available.`, 'success');
  }, 2000);
}
function updatePremiumUI(isPremium) {
  // Add premium badge to navigation if premium
  let premiumBadge = document.querySelector('.premium-badge');
  
  if (isPremium && !premiumBadge) {
    premiumBadge = document.createElement('span');
    premiumBadge.className = 'premium-badge';
    premiumBadge.textContent = '⭐ Premium';
    premiumBadge.style.cssText = `
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #1a202c;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-left: 1rem;
      animation: glow 2s ease-in-out infinite alternate;
    `;
    document.querySelector('.nav-controls').appendChild(premiumBadge);
  } else if (!isPremium && premiumBadge) {
    premiumBadge.remove();
  }
}

// Settings System
function initializeSettings() {
  // Add settings button to navigation
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'settings-btn glass-element';
  settingsBtn.innerHTML = '⚙️ Settings';
  settingsBtn.addEventListener('click', showSettingsModal);
  
  const navControls = document.querySelector('.nav-controls');
  navControls.insertBefore(settingsBtn, navControls.firstChild);
}

function showSettingsModal() {
  // Remove existing modal if present
  const existingModal = document.querySelector('.settings-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'settings-modal';
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content glass-element">
        <div class="modal-header">
          <h2>⚙️ Settings</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="settings-content">
          <div class="setting-group">
            <h3>📝 Notes Management</h3>
            <button class="setting-btn reset-notes-btn">🗑️ Reset All Notes</button>
            <p class="setting-description">Clear all generated notes and start fresh</p>
          </div>
          
          <div class="setting-group">
            <h3>🎴 Flashcards Management</h3>
            <button class="setting-btn reset-flashcards-btn">🗑️ Reset All Flashcards</button>
            <p class="setting-description">Clear all generated flashcards</p>
          </div>
          
          <div class="setting-group">
            <h3>⭐ Premium Status</h3>
            <div class="premium-status">
              <span id="premium-status-text">Checking...</span>
              <button class="setting-btn reset-premium-btn">🔄 Reset Premium Status</button>
            </div>
            <p class="setting-description">Manage your premium subscription</p>
          </div>
          
          <div class="setting-group">
            <h3>🎨 Theme Settings</h3>
            <select id="settings-theme" class="theme-select">
              <option value="dark">🌙 Dark Mode</option>
              <option value="light">🌞 Light Mode</option>
              <option value="solarized">🌅 Solarized</option>
            </select>
            <p class="setting-description">Choose your preferred theme</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // Update premium status display
  updatePremiumStatusDisplay();
  
  // Set current theme
  const themeSelect = modal.querySelector('#settings-theme');
  themeSelect.value = currentTheme;

  // Add event listeners
  const closeBtn = modal.querySelector('.close-btn');
  const overlay = modal.querySelector('.modal-overlay');
  
  closeBtn.addEventListener('click', () => modal.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) modal.remove();
  });
  
  // Settings actions
  modal.querySelector('.reset-notes-btn').addEventListener('click', resetNotes);
  modal.querySelector('.reset-flashcards-btn').addEventListener('click', resetFlashcards);
  modal.querySelector('.reset-premium-btn').addEventListener('click', resetPremiumStatus);
  
  themeSelect.addEventListener('change', (e) => {
    const selectedTheme = e.target.value;
    currentTheme = selectedTheme;
    document.body.setAttribute('data-theme', selectedTheme);
    localStorage.setItem('selectedTheme', selectedTheme);
    
    // Update main theme dropdown
    const mainThemeDropdown = document.getElementById('themeDropdown');
    if (mainThemeDropdown) {
      mainThemeDropdown.value = selectedTheme;
    }
    
    showNotification(`Theme changed to ${selectedTheme}`, 'success');
  });
}

function updatePremiumStatusDisplay() {
  const statusText = document.getElementById('premium-status-text');
  if (!statusText) return;
  
  const premiumStatus = localStorage.getItem('premiumStatus');
  const premiumExpiry = localStorage.getItem('premiumExpiry');
  
  if (premiumStatus && premiumExpiry) {
    const expiryDate = new Date(premiumExpiry);
    const now = new Date();
    
    if (now < expiryDate) {
      statusText.innerHTML = `✅ ${premiumStatus.charAt(0).toUpperCase() + premiumStatus.slice(1)} Plan Active<br><small>Expires: ${expiryDate.toLocaleDateString()}</small>`;
      statusText.style.color = 'var(--accent-primary)';
    } else {
      statusText.innerHTML = '❌ Premium Expired';
      statusText.style.color = 'var(--text-secondary)';
    }
  } else {
    statusText.innerHTML = '❌ No Premium Subscription';
    statusText.style.color = 'var(--text-secondary)';
  }
}

function resetNotes() {
  const notesSection = document.getElementById('generated-notes-section');
  const notesContent = document.getElementById('notes-content');
  const topicInput = document.getElementById('notes-topic');
  
  if (notesSection) notesSection.style.display = 'none';
  if (notesContent) notesContent.innerHTML = '';
  if (topicInput) topicInput.value = '';
  
  showNotification('All notes have been reset!', 'success');
}

function resetFlashcards() {
  const flashcardsSection = document.getElementById('flashcards-section');
  const flashcardsContainer = document.getElementById('flashcards-container');
  const studyNotes = document.getElementById('study-notes');
  
  if (flashcardsSection) flashcardsSection.style.display = 'none';
  if (flashcardsContainer) flashcardsContainer.innerHTML = '';
  if (studyNotes) studyNotes.value = '';
  
  currentFlashcards = [];
  
  showNotification('All flashcards have been reset!', 'success');
}

function resetPremiumStatus() {
  localStorage.removeItem('premiumStatus');
  localStorage.removeItem('premiumExpiry');
  updatePremiumUI(false);
  updatePremiumStatusDisplay();
  
  showNotification('Premium status has been reset!', 'info');
}

// About Modal System
function initializeAboutModal() {
  // Add about button to navigation
  const aboutBtn = document.createElement('button');
  aboutBtn.className = 'about-btn glass-element';
  aboutBtn.innerHTML = 'ℹ️ About';
  aboutBtn.addEventListener('click', showAboutModal);
  
  const navControls = document.querySelector('.nav-controls');
  navControls.appendChild(aboutBtn);
}

function showAboutModal() {
  // Remove existing modal if present
  const existingModal = document.querySelector('.about-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'about-modal';
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content glass-element">
        <div class="modal-header">
          <h2>ℹ️ About AI Study Buddy</h2>
          <button class="close-btn">&times;</button>
        </div>
        <div class="about-content">
          <div class="about-section">
            <h3>🤖 What is AI Study Buddy?</h3>
            <p>AI Study Buddy is an intelligent learning companion that transforms your study notes into interactive flashcards and generates comprehensive study materials using advanced AI technology.</p>
          </div>
          
          <div class="about-section">
            <h3>✨ Features</h3>
            <ul>
              <li>🧠 AI-powered flashcard generation</li>
              <li>📝 Intelligent notes generator</li>
              <li>📄 PDF export capabilities</li>
              <li>🎨 Multiple themes and customization</li>
              <li>⭐ Premium features for enhanced learning</li>
            </ul>
          </div>
          
          <div class="about-section">
            <h3>👨‍💻 Developer</h3>
            <div class="developer-info">
              <p><strong>Email:</strong> <a href="mailto:your.email@example.com">your.email@example.com</a></p>
              <p>Passionate about creating innovative educational technology solutions.</p>
            </div>
          </div>
          
          <div class="about-section">
            <h3>🚀 Version</h3>
            <p>Version 2.0.0 - Enhanced with premium features and improved AI capabilities</p>
          </div>
          
          <div class="about-section">
            <h3>📞 Support</h3>
            <p>Need help? Contact us at <a href="mailto:support@aistudybuddy.com">support@aistudybuddy.com</a></p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add event listeners
  const closeBtn = modal.querySelector('.close-btn');
  const overlay = modal.querySelector('.modal-overlay');
  
  closeBtn.addEventListener('click', () => modal.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) modal.remove();
  });
}

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
      // Generate notes directly without import
      const notes = await generateNotesContent(topic, level, withExamples, withDiagrams);
      
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

  // Direct notes generation function
  async function generateNotesContent(topic, level, withExamples, withDiagrams) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!topic || topic.trim().length < 3) {
      throw new Error('Please provide a more specific topic');
    }
    
    const topicCapitalized = topic.charAt(0).toUpperCase() + topic.slice(1);
    const complexity = level === 'basic' ? 'fundamental' : level === 'advanced' ? 'comprehensive' : 'detailed';
    
    let notes = `<h1>${topicCapitalized}</h1>\n\n`;
    
    // Introduction
    notes += `<h2>Introduction</h2>\n`;
    notes += `<p>${topicCapitalized} is an important concept that requires ${complexity} understanding. This comprehensive study guide provides essential information, key insights, and practical knowledge about ${topic} to enhance your learning experience.</p>\n\n`;
    
    // Core Concepts
    notes += `<h2>Core Concepts</h2>\n`;
    notes += `<h3>Definition</h3>\n`;
    notes += `<p>${topicCapitalized} encompasses key principles and methodologies that form the foundation of understanding in this subject area. It involves systematic approaches and evidence-based practices.</p>\n\n`;
    
    notes += `<h3>Key Principles</h3>\n`;
    notes += `<ul>\n`;
    notes += `<li><strong>Fundamental Properties:</strong> Core characteristics that define ${topic}</li>\n`;
    notes += `<li><strong>Mechanisms:</strong> Underlying processes and how they function</li>\n`;
    notes += `<li><strong>Relationships:</strong> Connections with related concepts and systems</li>\n`;
    notes += `<li><strong>Applications:</strong> Real-world uses and practical significance</li>\n`;
    notes += `<li><strong>Impact:</strong> Effects and implications in various contexts</li>\n`;
    notes += `</ul>\n\n`;
    
    // Key Terms
    notes += `<h2>Key Terminology</h2>\n`;
    notes += `<div class="terminology-box">\n`;
    notes += `<ul>\n`;
    notes += `<li><strong>${topicCapitalized}:</strong> The primary subject of study with distinct characteristics</li>\n`;
    notes += `<li><strong>Methodology:</strong> Systematic approaches used in this field</li>\n`;
    notes += `<li><strong>Framework:</strong> Structural foundation for understanding concepts</li>\n`;
    notes += `<li><strong>Implementation:</strong> Practical application of theoretical knowledge</li>\n`;
    notes += `<li><strong>Analysis:</strong> Critical examination and evaluation methods</li>\n`;
    notes += `</ul>\n`;
    notes += `</div>\n\n`;
    
    // Examples if requested
    if (withExamples) {
      notes += `<h2>Examples</h2>\n`;
      notes += `<div class="example-box">\n`;
      notes += `<h3>📋 Example 1: Practical Application</h3>\n`;
      notes += `<p>In real-world scenarios, ${topic} demonstrates its relevance through practical applications. For instance, professionals in this field utilize these principles to solve complex problems and achieve measurable outcomes.</p>\n`;
      notes += `</div>\n\n`;
      
      notes += `<div class="example-box">\n`;
      notes += `<h3>🔍 Example 2: Case Study Analysis</h3>\n`;
      notes += `<p>Research studies have shown that ${topic} plays a crucial role in various contexts. Case studies demonstrate successful implementation strategies and highlight best practices for optimal results.</p>\n`;
      notes += `</div>\n\n`;
      
      notes += `<div class="example-box">\n`;
      notes += `<h3>💡 Example 3: Innovation & Development</h3>\n`;
      notes += `<p>Recent developments in ${topic} have led to innovative approaches and breakthrough solutions. These advancements showcase the evolving nature and future potential of this field.</p>\n`;
      notes += `</div>\n\n`;
    }
    
    // Diagram descriptions if requested
    if (withDiagrams) {
      notes += `<h2>📊 Visual Learning Aids</h2>\n`;
      notes += `<div class="diagram-description">\n`;
      notes += `<h3>🧠 Conceptual Framework</h3>\n`;
      notes += `<p>A comprehensive visual map illustrating the interconnected relationships between core components of ${topic}. This framework helps visualize how different elements work together to create a unified understanding.</p>\n`;
      notes += `</div>\n\n`;
      
      notes += `<div class="diagram-description">\n`;
      notes += `<h3>⚡ Process Workflow</h3>\n`;
      notes += `<p>A detailed flowchart demonstrating the step-by-step processes involved in ${topic}. This visual guide shows logical sequences, decision points, and optimal pathways for implementation.</p>\n`;
      notes += `</div>\n\n`;
      
      notes += `<div class="diagram-description">\n`;
      notes += `<h3>📈 Impact Analysis</h3>\n`;
      notes += `<p>Visual representation of the effects and outcomes related to ${topic}. This analysis chart helps understand cause-and-effect relationships and measure success indicators.</p>\n`;
      notes += `</div>\n\n`;
    }
    
    // Study Tips
    notes += `<h2>📚 Study Tips & Strategies</h2>\n`;
    notes += `<div class="study-tips">\n`;
    notes += `<ul>\n`;
    notes += `<li><strong>Active Learning:</strong> Engage with the material through practice and application</li>\n`;
    notes += `<li><strong>Spaced Repetition:</strong> Review concepts at increasing intervals for better retention</li>\n`;
    notes += `<li><strong>Connection Making:</strong> Link new information to existing knowledge</li>\n`;
    notes += `<li><strong>Practice Testing:</strong> Use flashcards and quizzes to reinforce learning</li>\n`;
    notes += `<li><strong>Real-world Application:</strong> Find practical examples in daily life</li>\n`;
    notes += `</ul>\n`;
    notes += `</div>\n\n`;
    
    // Summary
    notes += `<h2>🎯 Key Takeaways</h2>\n`;
    notes += `<p>Understanding ${topic} requires a comprehensive approach that combines theoretical knowledge with practical application. This study guide has covered essential aspects to build a solid foundation:</p>\n`;
    notes += `<ul>\n`;
    notes += `<li>✅ <strong>Conceptual Mastery:</strong> Grasp fundamental definitions and core principles</li>\n`;
    notes += `<li>✅ <strong>Practical Application:</strong> Understand real-world implementations and uses</li>\n`;
    notes += `<li>✅ <strong>Critical Analysis:</strong> Develop skills to evaluate and assess information</li>\n`;
    notes += `<li>✅ <strong>Problem Solving:</strong> Apply knowledge to address challenges and scenarios</li>\n`;
    notes += `<li>✅ <strong>Continuous Learning:</strong> Build foundation for advanced study and research</li>\n`;
    notes += `</ul>\n\n`;
    
    notes += `<div class="footer-note">\n`;
    notes += `<p><em>📖 Generated by AI Study Buddy - Your intelligent learning companion</em></p>\n`;
    notes += `<p><em>💡 Remember: Effective learning combines understanding, practice, and application!</em></p>\n`;
    notes += `</div>`;
    
    return notes;
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
    // Check for premium access
    if (!checkPremiumFeature('pdf-export')) {
      return;
    }
    
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
      // Generate flashcards directly
      const flashcards = await generateFlashcardsContent(notes);
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

  // Direct flashcard generation function
  async function generateFlashcardsContent(notes) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!notes || notes.trim().length < 20) {
      throw new Error('Please provide more detailed study notes');
    }
    
    const flashcards = [];
    const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const words = notes.toLowerCase().split(/\W+/);
    
    // Extract key terms
    const keyTerms = words.filter(word => 
      word.length > 5 && 
      !['the', 'and', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'were'].includes(word)
    ).slice(0, 8);
    
    // Generate definition cards
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
    
    // Generate concept cards from key terms
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
    
    // Generate fill-in-the-blank cards
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
    
    // Generate comprehension cards
    sentences.slice(0, 2).forEach((sentence, index) => {
      if (sentence.split(' ').length > 10) {
        flashcards.push({
          id: `comp-${Date.now()}-${index}`,
          question: `What are the key points in this statement?`,
          answer: sentence.trim(),
          category: 'Comprehension',
          difficulty: 3,
          type: 'comprehension'
        });
      }
    });
    
    return flashcards.slice(0, 10);
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
  // Check for premium access
  if (!checkPremiumFeature('pdf-export')) {
    return;
  }
  
  if (!currentFlashcards || currentFlashcards.length === 0) {
    showNotification('No flashcards to export. Generate flashcards first.', 'warning');
    return;
  }
  
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('AI Study Buddy - Flashcards', 20, 30);
    
    // Add generated date
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
      
      // Card number
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Card ${index + 1} - ${card.category}`, 20, yPosition);
      yPosition += 10;
      
      // Question
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Q: ', 20, yPosition);
      doc.setFont(undefined, 'normal');
      const questionLines = doc.splitTextToSize(card.question, 150);
      doc.text(questionLines, 30, yPosition);
      yPosition += questionLines.length * 7 + 5;
      
      // Answer
      doc.setFont(undefined, 'bold');
      doc.text('A: ', 20, yPosition);
      doc.setFont(undefined, 'normal');
      const answerLines = doc.splitTextToSize(card.answer, 150);
      doc.text(answerLines, 30, yPosition);
      yPosition += answerLines.length * 7 + 15;
    });
    
    // Save the PDF
    doc.save('ai_study_buddy_flashcards.pdf');
    showNotification('Flashcards exported to PDF successfully!', 'success');
    
  } catch (error) {
    console.error('PDF generation error:', error);
    showNotification('Error exporting PDF. Please try again.', 'error');
  }
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