document.querySelectorAll('input[name="theme"]').forEach((input) => {
  input.addEventListener('change', (e) => {
    document.body.setAttribute('data-theme', e.target.value);
  });
});

document.getElementById('generate-btn').addEventListener('click', () => {
  const notes = document.getElementById('study-notes').value;
  const container = document.getElementById('flashcards-container');
  container.innerHTML = '';

  if (!notes.trim()) {
    alert('Please paste some study notes first.');
    return;
  }

  // Simulated flashcard generation (replace with Hugging Face API later)
  const sampleCards = [
    { question: 'What is Flask?', answer: 'A Python web framework.' },
    { question: 'What is Supabase?', answer: 'An open-source Firebase alternative.' }
  ];

  sampleCards.forEach(card => {
    const div = document.createElement('div');
    div.className = 'flashcard';
    div.innerHTML = `<strong>Q:</strong> ${card.question}<br><strong>A:</strong> ${card.answer}`;
    container.appendChild(div);
  });
});
