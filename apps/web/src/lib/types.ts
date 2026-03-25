export interface UserProfile {
  user_id: string;
  selected_categories: string[];
  home_country: string | null;
  target_countries: string[];
  goals: string[];
  user_type: "personal" | "freelancer" | "business";
  spending_range: string | null;
  transfer_range: string | null;
  loan_range: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedOffer {
  id: string;
  user_id: string;
  offer_id: string;
  category: string;
  saved_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
