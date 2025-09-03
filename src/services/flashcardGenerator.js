// Enhanced Flashcard generation service with better AI processing
class FlashcardGenerator {
  constructor() {
    this.categories = {
      'Science': ['cell', 'atom', 'molecule', 'DNA', 'protein', 'enzyme', 'biology', 'chemistry', 'physics', 'theory', 'hypothesis', 'experiment'],
      'History': ['war', 'empire', 'revolution', 'century', 'ancient', 'medieval', 'modern', 'civilization', 'culture', 'society'],
      'Mathematics': ['equation', 'formula', 'theorem', 'proof', 'calculate', 'solve', 'function', 'derivative', 'integral', 'geometry'],
      'Literature': ['author', 'novel', 'poem', 'character', 'theme', 'metaphor', 'symbolism', 'narrative', 'plot', 'setting'],
      'Technology': ['computer', 'software', 'algorithm', 'database', 'network', 'programming', 'code', 'system', 'data'],
      'Business': ['market', 'strategy', 'management', 'finance', 'economics', 'profit', 'revenue', 'customer', 'brand'],
      'Psychology': ['behavior', 'cognitive', 'emotion', 'memory', 'learning', 'personality', 'social', 'mental', 'brain'],
      'Medicine': ['disease', 'treatment', 'diagnosis', 'symptom', 'therapy', 'patient', 'medical', 'health', 'clinical']
    };
  }

  async generateFlashcards(notes) {
    if (!notes || notes.trim().length < 20) {
      throw new Error('Please provide more detailed study notes (at least 20 characters)');
    }

    try {
      // Process notes with enhanced AI-like logic
      const flashcards = this.processNotesIntelligently(notes);
      
      if (flashcards.length === 0) {
        throw new Error('Could not generate flashcards from the provided content. Try adding more detailed information.');
      }
      
      return flashcards;
    } catch (error) {
      console.error('Flashcard generation error:', error);
      throw error;
    }
  }

  processNotesIntelligently(notes) {
    const flashcards = [];
    
    // Clean and prepare text
    const cleanText = notes.replace(/\s+/g, ' ').trim();
    const sentences = this.extractSentences(cleanText);
    const keyTerms = this.extractKeyTerms(cleanText);
    const definitions = this.extractDefinitions(cleanText);
    
    // Generate different types of flashcards
    flashcards.push(...this.createDefinitionCards(definitions));
    flashcards.push(...this.createConceptCards(keyTerms, sentences));
    flashcards.push(...this.createFillInBlankCards(sentences));
    flashcards.push(...this.createComprehensionCards(sentences));
    
    // Remove duplicates and limit results
    const uniqueFlashcards = this.removeDuplicates(flashcards);
    return uniqueFlashcards.slice(0, 12);
  }

  extractSentences(text) {
    return text.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.split(' ').length > 3);
  }

  extractKeyTerms(text) {
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
    
    const termFreq = {};
    words.forEach(word => {
      if (word.length > 4 && !stopWords.has(word)) {
        termFreq[word] = (termFreq[word] || 0) + 1;
      }
    });
    
    return Object.entries(termFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([term]) => term);
  }

  extractDefinitions(text) {
    const definitions = [];
    const definitionPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+refers to\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+means\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*:\s*([^.!?]+)/g
    ];
    
    definitionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        definitions.push({
          term: match[1].trim(),
          definition: match[2].trim()
        });
      }
    });
    
    return definitions;
  }

  createDefinitionCards(definitions) {
    return definitions.map((def, index) => ({
      id: `def-${Date.now()}-${index}`,
      question: `What is ${def.term}?`,
      answer: def.definition,
      category: this.determineCategory(def.definition),
      difficulty: this.calculateDifficulty(def.definition),
      type: 'definition'
    }));
  }

  createConceptCards(keyTerms, sentences) {
    const cards = [];
    
    keyTerms.forEach((term, index) => {
      const relevantSentence = sentences.find(s => 
        s.toLowerCase().includes(term.toLowerCase())
      );
      
      if (relevantSentence) {
        cards.push({
          id: `concept-${Date.now()}-${index}`,
          question: `Explain the concept of "${term}" in the context of your study material.`,
          answer: relevantSentence,
          category: this.determineCategory(relevantSentence),
          difficulty: this.calculateDifficulty(relevantSentence),
          type: 'concept'
        });
      }
    });
    
    return cards.slice(0, 4);
  }

  createFillInBlankCards(sentences) {
    const cards = [];
    
    sentences.slice(0, 3).forEach((sentence, index) => {
      const words = sentence.split(' ');
      if (words.length > 8) {
        // Find important words (longer than 4 characters, not common words)
        const importantWords = words.filter(word => 
          word.length > 4 && 
          !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'were', 'will', 'which', 'where', 'when'].includes(word.toLowerCase())
        );
        
        if (importantWords.length > 0) {
          const targetWord = importantWords[Math.floor(Math.random() * importantWords.length)];
          const blankSentence = sentence.replace(new RegExp(`\\b${targetWord}\\b`, 'gi'), '______');
          
          cards.push({
            id: `blank-${Date.now()}-${index}`,
            question: `Fill in the blank: ${blankSentence}`,
            answer: targetWord,
            category: this.determineCategory(sentence),
            difficulty: this.calculateDifficulty(sentence) + 1,
            type: 'fill-blank'
          });
        }
      }
    });
    
    return cards;
  }

  createComprehensionCards(sentences) {
    const cards = [];
    
    sentences.slice(0, 2).forEach((sentence, index) => {
      if (sentence.split(' ').length > 10) {
        const concepts = this.extractConceptsFromSentence(sentence);
        if (concepts.length > 0) {
          cards.push({
            id: `comp-${Date.now()}-${index}`,
            question: `What are the key points about ${concepts[0]}?`,
            answer: sentence,
            category: this.determineCategory(sentence),
            difficulty: this.calculateDifficulty(sentence),
            type: 'comprehension'
          });
        }
      }
    });
    
    return cards;
  }

  extractConceptsFromSentence(sentence) {
    const words = sentence.split(' ');
    return words.filter(word => 
      word.length > 5 && 
      /^[A-Z]/.test(word) && 
      !['The', 'This', 'That', 'These', 'Those', 'When', 'Where', 'Which'].includes(word)
    );
  }

  determineCategory(text) {
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.categories)) {
      const matchCount = keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      ).length;
      
      if (matchCount > 0) {
        return category;
      }
    }
    
    // Advanced category detection based on context
    if (/\b(study|learn|education|academic|school|university)\b/i.test(text)) {
      return 'Education';
    }
    
    return 'General Knowledge';
  }

  calculateDifficulty(text) {
    const words = text.split(' ');
    const complexWords = words.filter(word => word.length > 8).length;
    const sentenceLength = words.length;
    const technicalTerms = words.filter(word => 
      /^[A-Z]/.test(word) && word.length > 6
    ).length;
    
    let difficulty = 1;
    
    if (sentenceLength > 20) difficulty++;
    if (complexWords > 2) difficulty++;
    if (technicalTerms > 1) difficulty++;
    if (text.includes('however') || text.includes('therefore') || text.includes('consequently')) difficulty++;
    
    return Math.min(difficulty, 5);
  }

  removeDuplicates(flashcards) {
    const seen = new Set();
    return flashcards.filter(card => {
      const key = card.question.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

export default new FlashcardGenerator();