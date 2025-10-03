import { supabase, logActivity } from '../config/supabase.js';

let currentUserId = null;
let currentPreferences = null;

export function initializePreferences(user, preferences) {
  currentUserId = user?.id;
  currentPreferences = preferences;
}

export async function saveUserPreference(key, value) {
  if (!currentUserId || !currentPreferences) return;

  try {
    const updates = {
      [key]: value,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', currentUserId);

    if (error) throw error;

    currentPreferences[key] = value;

    await logActivity(currentUserId, 'settings_updated', { key, value });

    return true;
  } catch (error) {
    console.error('Error saving preference:', error);
    return false;
  }
}

export async function autoLearnPreferences(context, data) {
  if (!currentUserId || !currentPreferences) return;

  try {
    const updates = {};

    if (context === 'flashcard') {
      if (data.difficulty) {
        updates.flashcard_difficulty = data.difficulty;
      }
    } else if (context === 'notes') {
      if (data.level) {
        updates.default_notes_level = data.level;
      }
      if (data.includeExamples !== undefined) {
        updates.include_examples = data.includeExamples;
      }
      if (data.includeDiagrams !== undefined) {
        updates.include_diagrams = data.includeDiagrams;
      }
    }

    if (Object.keys(updates).length === 0) return;

    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', currentUserId);

    if (error) throw error;

    Object.assign(currentPreferences, updates);

    console.log('Auto-learned preferences:', updates);

    return true;
  } catch (error) {
    console.error('Error auto-learning preferences:', error);
    return false;
  }
}

export function getUserPreference(key) {
  return currentPreferences?.[key];
}

export function getAllPreferences() {
  return currentPreferences;
}
