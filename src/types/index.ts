/**
 * Base TypeScript interfaces for LinguaPlay
 */

export interface Activity {
  id: string;
  type: 'choice' | 'order';
  instruction: string;
  content: any; // Will be typed more specifically later
}

export interface GameLevel {
  id: string;
  name: string;
  activities: Activity[];
}

export interface GameComponent {
  id: string;
  name: string;
  levels: GameLevel[];
}

export interface GameState {
  completedActivities: Record<string, boolean>;
  score: number;
  stars: number;
  streak: number;
}

export interface User {
  id: string;
  displayName: string;
}
