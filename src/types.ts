export type ArcanaType = 'Major' | 'Minor';
export type SuitType = 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
export type CardOrientation = 'Upright' | 'Reversed';

export interface TarotCard {
  id: string;
  name: string;
  number: number;
  arcana: ArcanaType;
  suit?: SuitType;
  keywords: string[];
  meanings: {
    light: string[];
    shadow: string[];
  };
  fortuneTelling: string[];
  archetype?: string;
  elemental?: string;
  astrology?: string;
  numerology?: string;
  affirmation?: string;
  svgSymbol: string;
  colorTone: string;
}

export type SpreadType = 
  | 'single_card' 
  | 'three_card' 
  | 'relationship' 
  | 'career' 
  | 'celtic_cross' 
  | 'life_path';

export interface SpreadPosition {
  id: number;
  name: string;
  description: string;
  coordinates: { x: number; y: number };
}

export interface SpreadDefinition {
  id: SpreadType;
  name: string;
  tagline: string;
  cardCount: number;
  category: 'Daily' | 'Core' | 'Love' | 'Vocation' | 'Master' | 'Spiritual';
  description: string;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  card: TarotCard;
  orientation: CardOrientation;
  positionIndex: number;
  positionName: string;
  positionDescription: string;
  drawnAt: string;
}

export type PalmShape = 'Earth' | 'Air' | 'Fire' | 'Water';

export interface PalmPoint {
  x: number;
  y: number;
}

export interface PalmLineMetrics {
  id: string;
  name: string;
  displayName: string;
  lengthRatio: number; // e.g. 0.74 (relative to palm bounds)
  curvatureIndex: number; // e.g. 1.24 (arc length / Euclidean distance)
  prominenceScore: number; // e.g. 0.42 (depth & pixel density)
  status: 'Detected' | 'Faint' | 'Prominent' | 'Fragmented';
  significance: string;
  coordinates: PalmPoint[];
  color: string;
}

export interface PalmMountMetrics {
  name: string;
  deity: string;
  elevation: 'Elevated' | 'Balanced' | 'Flat';
  energy: string;
  score: number;
}

export interface PalmAnalysisResult {
  id: string;
  timestamp: string;
  rawImageUrl: string;
  annotatedImageUrl?: string;
  skeletonImageUrl?: string;
  claheImageUrl?: string;
  palmShape: PalmShape;
  palmShapeDescription: string;
  fingerRatio: number;
  lines: PalmLineMetrics[];
  mounts: PalmMountMetrics[];
  overallBiometricConfidence: number; // 0-100
  handType: 'Right Hand' | 'Left Hand';
}

export interface InsightScoreBreakdown {
  s_palm: number;     // 30% Palm Confidence
  s_tarot: number;    // 25% Tarot Relevance
  s_pers: number;     // 20% Personality Alignment
  s_ctx: number;      // 15% User Context Relevance
  s_cons: number;     // 10% Reading Consistency
  final_score: number; // 0 - 100
  ratingBand: 'Novice Seeker' | 'Awakened Conduit' | 'Cosmic Resonance' | 'Master Adept';
}

export interface ChakraState {
  chakra: string;
  status: string;
  intensity: number;
  recommendation: string;
}

export interface SynthesisReadingReport {
  id: string;
  createdAt: any; // timestamp or string
  seekerName: string;
  executiveSummary: string;
  palmBiometricInsights: {
    elementalArchetype: string;
    heartLineAnalysis: string;
    headLineAnalysis: string;
    lifeLineAnalysis: string;
    fateLineAnalysis: string;
    mountsAnalysis?: string;
  };
  tarotCosmicInsights: {
    overallTheme: string;
    cardInterpretations: {
      cardName: string;
      position: string;
      orientation: string;
      synthesis: string;
    }[];
    elementalDominance: string;
  };
  personalityProfile: {
    coreArchetype: string;
    temperament: string;
    intuitiveCapacity: string;
    decisionMakingStyle: string;
  };
  lifeTrendTimeline: {
    immediateHorizon: string;
    emergingCycle: string;
    longTermDestiny: string;
    pivotalChallenge: string;
    catalystOpportunity: string;
  };
  relationshipsGuidance: {
    emotionalDisposition: string;
    connectionDynamics: string;
    guidanceForHarmonizing: string;
  };
  careerFinancialTrajectory: {
    vocationAlignment: string;
    wealthAttunement: string;
    strategicMove: string;
  };
  strengthsAndWeaknesses: {
    strengths: string[];
    growthAreas: string[];
    blindspots: string[];
  };
  spiritualRecommendations: {
    category: string;
    action: string;
    affirmation: string;
  }[];
  chakraEnergyBalance: ChakraState[];
  scoreData: InsightScoreBreakdown;
  drawnCards: DrawnCard[];
  palmData: PalmAnalysisResult;
  readingContext?: string;
  spreadType: SpreadType;
}

export type UserRole = 'user' | 'tarot_reader' | 'spiritual_consultant' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  zodiacSign: string;
  
  spiritualGoals: string[];
  
  role: UserRole;
  avatarUrl?: string;
  
  createdAt?: any;
  updatedAt?: any;
}

export interface PlatformAnalytics {
  totalReadingsRun: number;
  totalPalmScans: number;
  totalTarotDraws: number;
  averageInsightScore: number;
  modelLatencyMs: number;
  userSatisfactionRate: number;
  datasetStats: {
    palmImagesScanned: number;
    tarotCardsIndexed: number;
    corruptedFilesCount: number;
    resolutionStandard: string;
  };
  dailyTrend: { day: string; readings: number; avgScore: number }[];
  spreadUsageDistribution: { spread: string; count: number; percentage: number }[];
  lineProminenceAverages: { line: string; score: number }[];
}
