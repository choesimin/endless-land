// Shared API types used by both frontend and backend

// WebSocket message types
export interface WebSocketMessage {
  action: 'move' | 'getMap' | 'generateMap' | 'saveGameState' | 'joinGame';
  data: any;
  sessionId: string;
}

export interface WebSocketResponse {
  type: 'success' | 'error' | 'update';
  action: string;
  data?: any;
  error?: string;
}

// API request/response types
export interface GenerateMapRequest {
  theme?: string;
  description?: string;
  mapId?: string;
}

export interface GenerateMapResponse {
  mapId: string;
  mapData: any; // GeneratedMap from game.ts
  success: boolean;
  error?: string;
}

export interface SaveMapRequest {
  mapId: string;
  mapData: any; // GeneratedMap from game.ts
}

export interface GetMapResponse {
  mapData: any; // MapData from game.ts
  success: boolean;
  error?: string;
}

export interface UpdateSessionRequest {
  currentMap?: number;
  playerX?: number;
  playerY?: number;
  visitedAreas?: string[];
}