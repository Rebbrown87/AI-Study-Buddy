import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error getting profile:', error);
    return null;
  }
  return data;
}

export async function getUserPreferences(userId) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error getting preferences:', error);
    return null;
  }
  return data;
}

export async function getPremiumSubscription(userId) {
  const { data, error } = await supabase
    .from('premium_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
  return data;
}

export async function logActivity(userId, activityType, activityData = {}) {
  const { error } = await supabase
    .from('user_activity_logs')
    .insert({
      user_id: userId,
      activity_type: activityType,
      activity_data: activityData
    });

  if (error) {
    console.error('Error logging activity:', error);
  }
}
