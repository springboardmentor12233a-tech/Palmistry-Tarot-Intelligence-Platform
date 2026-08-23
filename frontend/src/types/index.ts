export type UserRole = 'user' | 'tarot_reader' | 'spiritual_consultant' | 'administrator';

export type AgeGroup = '18-24' | '25-34' | '35-44' | '45-54' | '55+';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  age_group?: AgeGroup;
  interests?: string[];
  spiritual_goals?: string[];
  created_at?: string;
  reading_preferences?: {
    primary_focus?: string;
    include_reversed_cards?: boolean;
    notification_frequency?: 'daily' | 'weekly' | 'major_transits' | 'never';
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Palmistry Types
export interface PalmLineDetail {
  name: string;
  length: 'short' | 'medium' | 'long' | 'extended';
  depth: 'faint' | 'moderate' | 'deep' | 'prominent';
  curvature: 'straight' | 'gentle' | 'curved' | 'forked' | 'chained';
  confidence: number; // 0 to 100
  summary: string;
  biometric_indicators: string[];
}

export interface PalmLines {
  heart_line: PalmLineDetail;
  head_line: PalmLineDetail;
  life_line: PalmLineDetail;
  fate_line: PalmLineDetail;
  sun_line?: PalmLineDetail;
}

export interface PalmAnalysisResult {
  id: string;
  image_url?: string;
  hand_type: 'Fire Hand' | 'Earth Hand' | 'Air Hand' | 'Water Hand';
  primary_element: 'Fire' | 'Earth' | 'Air' | 'Water';
  mount_prominence: {
    venus: number;
    jupiter: number;
    saturn: number;
    apollo: number;
    mercury: number;
    mars: number;
    luna: number;
  };
  lines: PalmLines;
  contents: string[];
  confidence_score: number;
  analyzed_at: string;
}

// Tarot Types
export type SpreadType =
  | 'single_card'
  | 'three_card'
  | 'relationship'
  | 'career'
  | 'celtic_cross'
  | 'life_path';

export interface SpreadConfig {
  id: SpreadType;
  title: string;
  subtitle: string;
  description: string;
  card_count: number;
  icon_name: string;
  positions: {
    index: number;
    label: string;
    meaning: string;
  }[];
  suitability: string[];
}

export interface TarotCardData {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number;
  element: 'Fire' | 'Water' | 'Air' | 'Earth';
  keywords: string[];
  upright_meaning: string;
  reversed_meaning: string;
  symbolism: string;
  astrological_association: string;
  image_path?: string;
}

export interface DrawnCard {
  card: TarotCardData;
  position_index: number;
  position_label: string;
  position_meaning: string;
  is_reversed: boolean;
}

export interface TarotDrawResult {
  spread_type: SpreadType;
  spread_title: string;
  cards: DrawnCard[];
  drawn_at: string;
}

// Synthesis & Reading Results
export interface InsightScore {
  palm_confidence: number;       // Weight: 30%
  tarot_relevance: number;       // Weight: 25%
  personality_alignment: number; // Weight: 20%
  context_relevance: number;     // Weight: 15%
  consistency: number;           // Weight: 10%
  overall: number;               // 0 - 100
  tier: 'Celestial Alignment' | 'Harmonic Resonance' | 'Promising Insight' | 'Emerging Synthesis';
}

export interface CategoryInsight {
  title: string;
  key: 'personality' | 'relationships' | 'career' | 'finance' | 'health_wellness' | 'personal_growth' | 'life_opportunities';
  score: number; // 0-100
  summary: string;
  detailed_narrative: string;
  key_takeaways: string[];
  astrological_influence?: string;
  palm_correlation?: string;
  tarot_correlation?: string;
}

export interface PersonalityIntelligence {
  primary_archetype: string;
  secondary_archetype: string;
  core_strengths: string[];
  growth_edges: string[];
  behavioral_insights: string[];
  development_recommendations: string[];
  temperament_balance: {
    intuition: number;
    logic: number;
    emotion: number;
    action: number;
  };
}

export interface LifeTrendAnalysis {
  life_path_summary: string;
  current_cycle: string;
  upcoming_opportunities: string[];
  potential_challenges: string[];
  growth_potential_rating: number; // 0-100
  horizon_forecast: {
    near_term: string; // 1-3 months
    mid_term: string;  // 3-12 months
    long_term: string; // 1-3 years
  };
}

export interface Recommendations {
  growth: string[];
  relationships: string[];
  career: string[];
  goal_alignment: string[];
  spiritual_development: string[];
  daily_mantra: string;
  recommended_crystals_or_symbols: string[];
}

export interface FullReading {
  id: string;
  user_id?: string;
  date: string;
  spread_type: SpreadType;
  spread_title: string;
  palm_result: PalmAnalysisResult;
  tarot_result: TarotDrawResult;
  user_context?: {
    focus_topic?: string;
    specific_question?: string;
  };
  interpretation: {
    overview_summary: string;
    categories: CategoryInsight[];
  };
  personality: PersonalityIntelligence;
  life_trend: LifeTrendAnalysis;
  insight_score: InsightScore;
  recommendations: Recommendations;
  created_at: string;
}

export interface ReadingHistoryItem {
  id: string;
  date: string;
  spread_type: SpreadType;
  spread_title: string;
  overall_score: number;
  primary_archetype: string;
  thumbnail_url?: string;
  key_theme: string;
}

export interface NotificationItem {
  id: string;
  type: 'insight_update' | 'reading_reminder' | 'celestial_transit' | 'system';
  title: string;
  message: string;
  date: string;
  read?: boolean;
  link?: string;
}
