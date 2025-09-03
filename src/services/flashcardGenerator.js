// Flashcard generation service using Hugging Face API
class FlashcardGenerator {
  constructor() {
    // Using a free model that doesn't require API key for demo
    this.apiUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
    this.fallbackEnabled = true;
  }

  async generateFlashcards(notes) {
    if (!notes || notes.trim().length < 10) {
      throw new Error('Please provide more detailed study notes (at least 10 characters)');
    }

    try {
      // For demo purposes, we'll use a smart text processing approach
      // since free Hugging Face models have limitations
      return this.processNotesIntoFlashcards(notes);
    } catch (error) {
      console.error('API Error:', error);
      return this.generateFallbackFlashcards(notes);
    }
  }

  processNotesIntoFlashcards(notes) {
    const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const flashcards = [];

    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 15) {
        // Extract key concepts and create questions
        const words = trimmed.split(' ');
        
        if (words.length > 5) {
          // Create definition-style questions
          const keyWords = words.filter(word => 
            word.length > 4 && 
            !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'were', 'will'].includes(word.toLowerCase())
          );

          if (keyWords.length > 0) {
            const keyWord = keyWords[0];
            const question = `What is ${keyWord}?`;
            const answer = trimmed;
            
            flashcards.push({
              id: Date.now() + index,
              question,
              answer,
              category: this.determineCategory(trimmed),
              difficulty: this.calculateDifficulty(trimmed)
            });
          }
        }

        // Create fill-in-the-blank questions
        if (words.length > 8) {
          const importantWordIndex = Math.floor(words.length / 2);
          const importantWord = words[importantWordIndex];
          
          if (importantWord.length > 3) {
            const questionWords = [...words];
            questionWords[importantWordIndex] = '______';
            
            flashcards.push({
              id: Date.now() + index + 1000,
              question: `Fill in the blank: ${questionWords.join(' ')}`,
              answer: importantWord,
              category: this.determineCategory(trimmed),
              difficulty: this.calculateDifficulty(trimmed)
            });
          }
        }
      }
    });

    // Ensure we have at least some flashcards
    if (flashcards.length === 0) {
      return this.generateFallbackFlashcards(notes);
    }

    return flashcards.slice(0, 10); // Limit to 10 flashcards
  }

  generateFallbackFlashcards(notes) {
    const words = notes.split(/\s+/).filter(word => word.length > 4);
    const flashcards = [];

    // Create basic flashcards from the content
    for (let i = 0; i < Math.min(5, words.length); i++) {
      const word = words[i];
      flashcards.push({
        id: Date.now() + i,
        question: `What does "${word}" refer to in your notes?`,
        answer: `Review the context around "${word}" in your study material.`,
        category: 'General',
        difficulty: 2
      });
    }

    if (flashcards.length === 0) {
      flashcards.push({
        id: Date.now(),
        question: 'What is the main topic of your study notes?',
        answer: 'Review your notes to identify the key concepts and themes.',
        category: 'General',
        difficulty: 1
      });
    }

    return flashcards;
  }

  determineCategory(text) {
    const categories = {
      'Science': ['cell', 'atom', 'molecule', 'DNA', 'protein', 'enzyme', 'biology', 'chemistry', 'physics'],
      'History': ['war', 'empire', 'revolution', 'century', 'ancient', 'medieval', 'modern'],
      'Math': ['equation', 'formula', 'theorem', 'proof', 'calculate', 'solve', 'function'],
      'Literature': ['author', 'novel', 'poem', 'character', 'theme', 'metaphor', 'symbolism'],
      'Technology': ['computer', 'software', 'algorithm', 'database', 'network', 'programming']
    };

    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    
    return 'General';
  }

  calculateDifficulty(text) {
    const complexWords = text.split(' ').filter(word => word.length > 8).length;
    const sentenceLength = text.split(' ').length;
    
    if (complexWords > 3 || sentenceLength > 20) return 4;
    if (complexWords > 1 || sentenceLength > 15) return 3;
    if (sentenceLength > 10) return 2;
    return 1;
  }
}

export default new FlashcardGenerator();