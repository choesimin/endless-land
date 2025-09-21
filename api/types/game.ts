// Shared game types used by both frontend and backend

export interface MapConfig {
  theme: string;
  exits: MapExit[];
}

export interface MapExit {
  x: number;
  y: number;
  targetMap: number;
  targetX: number;
  targetY: number;
}

export interface ThemeConfig {
  objects: ThemeObject[];
}

export interface ThemeObject {
  type: string;
  count: number;
  probability: number;
}

export interface GeneratedMap {
  themeConfig: Record<string, ThemeConfig>;
  mapConfig: Record<string, MapConfig>;
  mapArray: string[][];
  newObjects?: Record<string, string>;
}

export interface GameSession {
  sessionId: string;
  playerId?: string;
  currentMap: number;
  playerX: number;
  playerY: number;
  visitedAreas: Set<string> | string[];
  lastActivity: string;
  ttl?: number; // TTL for DynamoDB
}

export interface MapData {
  mapId: string;
  version: string;
  themeConfig: Record<string, ThemeConfig>;
  mapConfig: Record<string, MapConfig>;
  mapArray: string[][];
  createdAt: string;
  createdBy: 'AI' | 'Human';
  metadata?: Record<string, any>;
}