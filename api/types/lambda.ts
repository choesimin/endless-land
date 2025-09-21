// Lambda and backend-specific types for Endless Land API

import type { GeneratedMap, MapData, GameSession } from './game';

// Lambda event types
export interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: string;
  headers: Record<string, string>;
}

export interface WebSocketEvent {
  requestContext: {
    connectionId: string;
    routeKey: string;
    eventType: string;
  };
  body?: string;
}

// DynamoDB item types
export interface DynamoMapItem {
  mapId: string;
  version: string;
  themeConfig: Record<string, any>;
  mapConfig: Record<string, any>;
  mapArray: string[][];
  createdAt: string;
  createdBy: string;
  metadata?: Record<string, any>;
}

export interface DynamoSessionItem {
  sessionId: string;
  playerId?: string;
  currentMap: number;
  playerX: number;
  playerY: number;
  visitedAreas: string[];
  lastActivity: string;
  ttl: number;
}

// Bedrock types
export interface BedrockRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface BedrockResponse {
  content: string;
  success: boolean;
  error?: string;
}