async function loadFlashcards() {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*');

  if (error) {
    console.error('Error fetching flashcards:', error);
  } else {
    console.log('Flashcards:', data);
    // Render them to the DOM here
  }
}
