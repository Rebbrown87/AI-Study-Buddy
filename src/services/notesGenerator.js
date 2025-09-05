// AI Notes Generator Service
class NotesGenerator {
  constructor() {
    this.knowledgeBase = {
      science: {
        biology: ['cell', 'DNA', 'protein', 'enzyme', 'photosynthesis', 'respiration', 'evolution', 'genetics', 'ecosystem', 'organism'],
        chemistry: ['atom', 'molecule', 'reaction', 'bond', 'element', 'compound', 'acid', 'base', 'catalyst', 'oxidation'],
        physics: ['force', 'energy', 'motion', 'wave', 'particle', 'gravity', 'electricity', 'magnetism', 'quantum', 'relativity']
      },
      history: {
        ancient: ['civilization', 'empire', 'culture', 'religion', 'trade', 'warfare', 'government', 'society'],
        modern: ['revolution', 'industrial', 'democracy', 'nationalism', 'colonialism', 'world war', 'cold war']
      },
      mathematics: {
        algebra: ['equation', 'variable', 'function', 'polynomial', 'linear', 'quadratic', 'exponential'],
        calculus: ['derivative', 'integral', 'limit', 'continuity', 'optimization', 'rate of change'],
        geometry: ['angle', 'triangle', 'circle', 'polygon', 'area', 'volume', 'theorem', 'proof']
      },
      technology: {
        computer: ['algorithm', 'data structure', 'programming', 'software', 'hardware', 'network', 'database'],
        ai: ['machine learning', 'neural network', 'deep learning', 'artificial intelligence', 'automation']
      }
    };
  }

  async generateNotes(topic, level = 'intermediate', includeExamples = true, includeDiagrams = true) {
    if (!topic || topic.trim().length < 3) {
      throw new Error('Please provide a valid topic (at least 3 characters)');
    }

    try {
      console.log(`Generating ${level} level notes for: ${topic}`);
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const notes = this.createComprehensiveNotes(topic, level, includeExamples, includeDiagrams);
      
      if (!notes || notes.trim().length === 0) {
        throw new Error('Could not generate notes for the provided topic. Try a more specific or common topic.');
      }
      
      return notes;
    } catch (error) {
      console.error('Notes generation error:', error);
      throw error;
    }
  }

  createComprehensiveNotes(topic, level, includeExamples, includeDiagrams) {
    const topicLower = topic.toLowerCase();
    const category = this.determineCategory(topicLower);
    const complexity = this.getLevelComplexity(level);
    
    let notes = `<h1>${this.capitalizeWords(topic)}</h1>\n\n`;
    
    // Introduction
    notes += this.generateIntroduction(topic, category, complexity);
    
    // Main content sections
    notes += this.generateMainContent(topic, category, complexity);
    
    // Key concepts
    notes += this.generateKeyConcepts(topic, category, complexity);
    
    // Examples if requested
    if (includeExamples) {
      notes += this.generateExamples(topic, category);
    }
    
    // Diagram descriptions if requested
    if (includeDiagrams) {
      notes += this.generateDiagramDescriptions(topic, category);
    }
    
    // Summary and conclusion
    notes += this.generateSummary(topic, category);
    
    return notes;
  }

  determineCategory(topic) {
    const categories = {
      science: ['biology', 'chemistry', 'physics', 'photosynthesis', 'cell', 'atom', 'molecule', 'DNA', 'protein', 'energy', 'force', 'gravity', 'evolution', 'ecosystem', 'reaction', 'element', 'compound'],
      history: ['war', 'empire', 'revolution', 'ancient', 'medieval', 'renaissance', 'industrial', 'civilization', 'culture', 'democracy', 'colonialism', 'napoleon', 'hitler', 'rome', 'egypt'],
      mathematics: ['algebra', 'calculus', 'geometry', 'trigonometry', 'statistics', 'probability', 'equation', 'function', 'derivative', 'integral', 'theorem', 'proof', 'polynomial'],
      technology: ['computer', 'programming', 'software', 'algorithm', 'artificial intelligence', 'machine learning', 'database', 'network', 'internet', 'coding', 'javascript', 'python'],
      literature: ['shakespeare', 'poetry', 'novel', 'drama', 'fiction', 'author', 'character', 'plot', 'theme', 'symbolism', 'metaphor'],
      business: ['marketing', 'management', 'finance', 'economics', 'strategy', 'leadership', 'entrepreneurship', 'accounting', 'investment'],
      psychology: ['behavior', 'cognitive', 'emotion', 'memory', 'learning', 'personality', 'social', 'mental health', 'therapy', 'brain'],
      medicine: ['anatomy', 'physiology', 'disease', 'treatment', 'diagnosis', 'surgery', 'medicine', 'health', 'medical', 'hospital']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => topic.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  getLevelComplexity(level) {
    const complexities = {
      basic: { depth: 2, vocabulary: 'simple', examples: 2 },
      intermediate: { depth: 3, vocabulary: 'moderate', examples: 3 },
      advanced: { depth: 4, vocabulary: 'complex', examples: 4 }
    };
    return complexities[level] || complexities.intermediate;
  }

  generateIntroduction(topic, category, complexity) {
    const intros = {
      science: `<h2>Introduction</h2>\n<p>${this.capitalizeWords(topic)} is a fundamental concept in science that plays a crucial role in understanding the natural world. This comprehensive study guide will explore the key principles, mechanisms, and applications of ${topic}.</p>\n\n`,
      history: `<h2>Historical Overview</h2>\n<p>${this.capitalizeWords(topic)} represents a significant period/event in human history that shaped the course of civilization. Understanding ${topic} provides valuable insights into the social, political, and cultural developments of the time.</p>\n\n`,
      mathematics: `<h2>Mathematical Foundation</h2>\n<p>${this.capitalizeWords(topic)} is an important mathematical concept that forms the basis for many advanced mathematical theories and practical applications. This guide will break down the fundamental principles and problem-solving techniques.</p>\n\n`,
      technology: `<h2>Technical Overview</h2>\n<p>${this.capitalizeWords(topic)} is a key technology concept that has revolutionized the way we interact with digital systems. This comprehensive guide covers the principles, applications, and future implications of ${topic}.</p>\n\n`,
      general: `<h2>Overview</h2>\n<p>${this.capitalizeWords(topic)} is an important subject that requires thorough understanding. This study guide provides comprehensive coverage of the key concepts, principles, and applications related to ${topic}.</p>\n\n`
    };
    
    return intros[category] || intros.general;
  }

  generateMainContent(topic, category, complexity) {
    let content = `<h2>Core Concepts</h2>\n`;
    
    const contentTemplates = {
      science: [
        `<h3>Definition and Basic Principles</h3>\n<p>${this.capitalizeWords(topic)} can be defined as a process/concept that involves specific mechanisms and follows established scientific principles. The fundamental aspects include:</p>\n<ul>\n<li>Primary characteristics and properties</li>\n<li>Underlying mechanisms and processes</li>\n<li>Environmental factors and conditions</li>\n<li>Measurable outcomes and effects</li>\n</ul>\n\n`,
        `<h3>Scientific Mechanisms</h3>\n<p>The process of ${topic} involves several interconnected steps and mechanisms that work together to produce the observed results. Understanding these mechanisms is crucial for grasping the complete picture.</p>\n\n`,
        `<h3>Applications and Significance</h3>\n<p>${this.capitalizeWords(topic)} has significant applications in various fields and plays an important role in both theoretical understanding and practical applications.</p>\n\n`
      ],
      history: [
        `<h3>Historical Context</h3>\n<p>${this.capitalizeWords(topic)} occurred during a specific historical period characterized by unique social, political, and economic conditions. Understanding this context is essential for comprehending the significance of these events.</p>\n\n`,
        `<h3>Key Events and Timeline</h3>\n<p>The development of ${topic} can be traced through a series of important events and milestones that shaped its course and ultimate outcome.</p>\n\n`,
        `<h3>Impact and Consequences</h3>\n<p>The effects of ${topic} extended far beyond its immediate time period, influencing subsequent historical developments and shaping modern society.</p>\n\n`
      ],
      mathematics: [
        `<h3>Mathematical Definition</h3>\n<p>${this.capitalizeWords(topic)} is mathematically defined through specific formulas, equations, and theoretical frameworks that provide the foundation for problem-solving and analysis.</p>\n\n`,
        `<h3>Properties and Theorems</h3>\n<p>Several important properties and theorems are associated with ${topic}, each providing unique insights and problem-solving capabilities.</p>\n\n`,
        `<h3>Problem-Solving Techniques</h3>\n<p>Mastering ${topic} requires understanding various problem-solving approaches and techniques that can be applied to different types of mathematical challenges.</p>\n\n`
      ],
      general: [
        `<h3>Fundamental Concepts</h3>\n<p>${this.capitalizeWords(topic)} encompasses several fundamental concepts that form the foundation of understanding in this area.</p>\n\n`,
        `<h3>Key Principles</h3>\n<p>The study of ${topic} is guided by important principles that help explain how and why certain phenomena occur.</p>\n\n`,
        `<h3>Practical Applications</h3>\n<p>Understanding ${topic} has practical implications and applications in various real-world scenarios.</p>\n\n`
      ]
    };
    
    const templates = contentTemplates[category] || contentTemplates.general;
    templates.forEach(template => {
      content += template;
    });
    
    return content;
  }

  generateKeyConcepts(topic, category, complexity) {
    let concepts = `<h2>Key Terms and Concepts</h2>\n<ul>\n`;
    
    const keyTerms = this.generateKeyTerms(topic, category, complexity.depth);
    keyTerms.forEach(term => {
      concepts += `<li><strong>${term.term}:</strong> ${term.definition}</li>\n`;
    });
    
    concepts += `</ul>\n\n`;
    return concepts;
  }

  generateKeyTerms(topic, category, depth) {
    const terms = [];
    const topicWords = topic.toLowerCase().split(' ');
    
    // Generate terms based on category and topic
    if (category === 'science') {
      terms.push(
        { term: this.capitalizeWords(topic), definition: `The primary scientific concept being studied, involving specific processes and mechanisms.` },
        { term: 'Process', definition: `The series of steps or mechanisms involved in ${topic}.` },
        { term: 'Mechanism', definition: `The underlying biological, chemical, or physical processes that drive ${topic}.` },
        { term: 'Application', definition: `Practical uses and implementations of ${topic} in real-world scenarios.` }
      );
    } else if (category === 'history') {
      terms.push(
        { term: this.capitalizeWords(topic), definition: `A significant historical event, period, or concept that shaped human civilization.` },
        { term: 'Context', definition: `The historical circumstances and conditions surrounding ${topic}.` },
        { term: 'Impact', definition: `The long-term effects and consequences of ${topic} on society and culture.` },
        { term: 'Legacy', definition: `The lasting influence of ${topic} on subsequent historical developments.` }
      );
    } else if (category === 'mathematics') {
      terms.push(
        { term: this.capitalizeWords(topic), definition: `A mathematical concept with specific properties and applications.` },
        { term: 'Formula', definition: `Mathematical expressions used to calculate or represent ${topic}.` },
        { term: 'Theorem', definition: `Proven mathematical statements related to ${topic}.` },
        { term: 'Application', definition: `Practical uses of ${topic} in solving mathematical problems.` }
      );
    } else {
      terms.push(
        { term: this.capitalizeWords(topic), definition: `The main subject of study with specific characteristics and applications.` },
        { term: 'Principle', definition: `Fundamental rules or concepts that govern ${topic}.` },
        { term: 'Method', definition: `Approaches and techniques used in studying or applying ${topic}.` },
        { term: 'Significance', definition: `The importance and relevance of ${topic} in its field of study.` }
      );
    }
    
    return terms.slice(0, depth + 2);
  }

  generateExamples(topic, category) {
    let examples = `<h2>Examples and Case Studies</h2>\n`;
    
    const exampleTemplates = {
      science: `<div class="example-box">\n<h3>Example 1: Real-World Application</h3>\n<p>Consider how ${topic} manifests in everyday life. For instance, this concept can be observed in natural phenomena and has practical applications in technology and medicine.</p>\n</div>\n\n<div class="example-box">\n<h3>Example 2: Laboratory Demonstration</h3>\n<p>In controlled laboratory conditions, ${topic} can be demonstrated through specific experiments that highlight the key principles and mechanisms involved.</p>\n</div>\n\n`,
      history: `<div class="example-box">\n<h3>Historical Example</h3>\n<p>A notable example of ${topic} can be seen in specific historical events that demonstrate the key characteristics and impact of this concept on society.</p>\n</div>\n\n<div class="example-box">\n<h3>Comparative Analysis</h3>\n<p>Comparing ${topic} with similar historical phenomena helps illustrate its unique features and significance in the broader context of human history.</p>\n</div>\n\n`,
      mathematics: `<div class="example-box">\n<h3>Problem Example 1</h3>\n<p>Consider a typical problem involving ${topic}. The solution process demonstrates the key principles and problem-solving techniques associated with this concept.</p>\n</div>\n\n<div class="example-box">\n<h3>Problem Example 2</h3>\n<p>A more complex application of ${topic} shows how this concept can be used in advanced mathematical analysis and real-world problem solving.</p>\n</div>\n\n`,
      general: `<div class="example-box">\n<h3>Practical Example</h3>\n<p>A real-world example of ${topic} demonstrates how this concept applies in practical situations and everyday contexts.</p>\n</div>\n\n<div class="example-box">\n<h3>Case Study</h3>\n<p>Detailed analysis of a specific case involving ${topic} provides insights into the practical applications and implications of this concept.</p>\n</div>\n\n`
    };
    
    examples += exampleTemplates[category] || exampleTemplates.general;
    return examples;
  }

  generateDiagramDescriptions(topic, category) {
    let diagrams = `<h2>Visual Representations</h2>\n`;
    
    const diagramTemplates = {
      science: `<div class="diagram-description">\n<h3>Process Diagram</h3>\n<p>📊 A flowchart showing the step-by-step process of ${topic}, including inputs, mechanisms, and outputs. This visual representation helps understand the sequential nature of the process.</p>\n</div>\n\n<div class="diagram-description">\n<h3>Structural Diagram</h3>\n<p>🔬 A detailed illustration of the components and structures involved in ${topic}, showing how different parts interact and contribute to the overall process.</p>\n</div>\n\n`,
      history: `<div class="diagram-description">\n<h3>Timeline Diagram</h3>\n<p>📅 A chronological representation of key events related to ${topic}, showing the sequence and relationship between different historical developments.</p>\n</div>\n\n<div class="diagram-description">\n<h3>Map Visualization</h3>\n<p>🗺️ A geographical representation showing the locations and spread of ${topic}, illustrating its spatial and regional characteristics.</p>\n</div>\n\n`,
      mathematics: `<div class="diagram-description">\n<h3>Graph Representation</h3>\n<p>📈 A mathematical graph showing the behavior and properties of ${topic}, including key points, trends, and relationships.</p>\n</div>\n\n<div class="diagram-description">\n<h3>Geometric Illustration</h3>\n<p>📐 A geometric diagram demonstrating the spatial or structural aspects of ${topic}, helping visualize abstract mathematical concepts.</p>\n</div>\n\n`,
      general: `<div class="diagram-description">\n<h3>Conceptual Map</h3>\n<p>🧠 A mind map or concept diagram showing the relationships between different aspects of ${topic} and how they connect to form a comprehensive understanding.</p>\n</div>\n\n<div class="diagram-description">\n<h3>Process Flow</h3>\n<p>⚡ A flowchart illustrating the processes, steps, or procedures involved in ${topic}, showing the logical flow and decision points.</p>\n</div>\n\n`
    };
    
    diagrams += diagramTemplates[category] || diagramTemplates.general;
    return diagrams;
  }

  generateSummary(topic, category) {
    return `<h2>Summary and Key Takeaways</h2>\n<p>In conclusion, ${topic} is a significant concept that requires thorough understanding of its fundamental principles, applications, and implications. The key points to remember include:</p>\n<ul>\n<li>Understanding the basic definition and core principles</li>\n<li>Recognizing the practical applications and real-world relevance</li>\n<li>Appreciating the broader context and significance</li>\n<li>Applying the knowledge to solve problems and analyze situations</li>\n</ul>\n\n<p>Mastery of ${topic} provides a solid foundation for further study and practical application in related fields. Continue to explore and practice these concepts to deepen your understanding and expertise.</p>\n\n<p><em>Generated by AI Study Buddy - Your intelligent learning companion</em></p>`;
  }

  capitalizeWords(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }
}

export default new NotesGenerator();