import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { generateMap } from './bedrock';
import { 
  GenerateMapRequest, 
  GenerateMapResponse, 
  SaveMapRequest, 
  GetMapResponse,
  UpdateSessionRequest,
  GameSession,
  MapData,
  DynamoMapItem,
  DynamoSessionItem,
  WebSocketEvent,
  WebSocketMessage,
  WebSocketResponse
} from './types';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const MAPS_TABLE = process.env.MAPS_TABLE!;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;

// Helper function to create API response
function createResponse(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

// Helper functions
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateMapId(): string {
  return `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// REST API Handler
export const restHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('REST API Event:', JSON.stringify(event, null, 2));

  try {
    const { httpMethod, path, pathParameters, body } = event;
    
    // Handle CORS preflight
    if (httpMethod === 'OPTIONS') {
      return createResponse(200, {});
    }

    // Route handling
    if (path === '/maps/generate' && httpMethod === 'POST') {
      return await handleGenerateMap(body);
    }
    
    if (path.startsWith('/maps/') && httpMethod === 'GET') {
      const mapId = pathParameters?.mapId;
      if (!mapId) {
        return createResponse(400, { error: 'Map ID is required' });
      }
      return await handleGetMap(mapId);
    }
    
    if (path.startsWith('/maps/') && httpMethod === 'POST') {
      const mapId = pathParameters?.mapId;
      if (!mapId) {
        return createResponse(400, { error: 'Map ID is required' });
      }
      return await handleSaveMap(mapId, body);
    }
    
    if (path.startsWith('/sessions/') && httpMethod === 'GET') {
      const sessionId = pathParameters?.sessionId;
      if (!sessionId) {
        return createResponse(400, { error: 'Session ID is required' });
      }
      return await handleGetSession(sessionId);
    }
    
    if (path.startsWith('/sessions/') && httpMethod === 'PUT') {
      const sessionId = pathParameters?.sessionId;
      if (!sessionId) {
        return createResponse(400, { error: 'Session ID is required' });
      }
      return await handleUpdateSession(sessionId, body);
    }

    return createResponse(404, { error: 'Not found' });
  } catch (error) {
    console.error('REST API Error:', error);
    return createResponse(500, { 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// WebSocket Handler
export const websocketHandler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket Event:', JSON.stringify(event, null, 2));

  const { requestContext } = event as any as WebSocketEvent;
  const { connectionId, routeKey } = requestContext;

  try {
    switch (routeKey) {
      case '$connect':
        return await handleWebSocketConnect(connectionId);
      
      case '$disconnect':
        return await handleWebSocketDisconnect(connectionId);
      
      case '$default':
        return await handleWebSocketMessage(connectionId, event.body);
      
      default:
        console.log('Unknown route:', routeKey);
        return { statusCode: 400, body: 'Unknown route' };
    }
  } catch (error) {
    console.error('WebSocket handler error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

// REST API Implementation Functions
async function handleGenerateMap(body: string | null): Promise<APIGatewayProxyResult> {
  if (!body) {
    return createResponse(400, { error: 'Request body is required' });
  }

  try {
    const request: GenerateMapRequest = JSON.parse(body);
    const { theme = 'fantasy', description, mapId } = request;

    console.log('Generating map with theme:', theme, 'description:', description);

    const generatedMap = await generateMap(theme, description);
    
    if (!generatedMap) {
      return createResponse(500, { 
        success: false,
        error: 'Failed to generate map with AI' 
      });
    }

    const finalMapId = mapId || generateMapId();

    const mapData: DynamoMapItem = {
      mapId: finalMapId,
      version: 'latest',
      themeConfig: generatedMap.themeConfig,
      mapConfig: generatedMap.mapConfig,
      mapArray: generatedMap.mapArray,
      createdAt: new Date().toISOString(),
      createdBy: 'AI',
      metadata: {
        theme,
        description,
        newObjects: generatedMap.newObjects
      }
    };

    await dynamoClient.send(new PutCommand({
      TableName: MAPS_TABLE,
      Item: mapData
    }));

    const response: GenerateMapResponse = {
      mapId: finalMapId,
      mapData: generatedMap,
      success: true
    };

    return createResponse(200, response);
  } catch (error) {
    console.error('Generate map error:', error);
    return createResponse(400, { 
      success: false,
      error: error instanceof Error ? error.message : 'Invalid request' 
    });
  }
}

async function handleGetMap(mapId: string): Promise<APIGatewayProxyResult> {
  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: MAPS_TABLE,
      Key: { mapId, version: 'latest' }
    }));

    if (!result.Item) {
      return createResponse(404, { 
        success: false,
        error: 'Map not found' 
      });
    }

    const mapData: MapData = result.Item as MapData;
    const response: GetMapResponse = {
      mapData,
      success: true
    };

    return createResponse(200, response);
  } catch (error) {
    console.error('Get map error:', error);
    return createResponse(500, { 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get map' 
    });
  }
}

async function handleSaveMap(mapId: string, body: string | null): Promise<APIGatewayProxyResult> {
  if (!body) {
    return createResponse(400, { error: 'Request body is required' });
  }

  try {
    const request: SaveMapRequest = JSON.parse(body);
    const { mapData } = request;

    const mapItem: DynamoMapItem = {
      mapId,
      version: 'latest',
      themeConfig: mapData.themeConfig,
      mapConfig: mapData.mapConfig,
      mapArray: mapData.mapArray,
      createdAt: new Date().toISOString(),
      createdBy: 'Human',
      metadata: {
        newObjects: mapData.newObjects
      }
    };

    await dynamoClient.send(new PutCommand({
      TableName: MAPS_TABLE,
      Item: mapItem
    }));

    return createResponse(200, { success: true, mapId });
  } catch (error) {
    console.error('Save map error:', error);
    return createResponse(400, { 
      success: false,
      error: error instanceof Error ? error.message : 'Invalid request' 
    });
  }
}

async function handleGetSession(sessionId: string): Promise<APIGatewayProxyResult> {
  try {
    const result = await dynamoClient.send(new GetCommand({
      TableName: SESSIONS_TABLE,
      Key: { sessionId }
    }));

    if (!result.Item) {
      const newSession: DynamoSessionItem = {
        sessionId,
        currentMap: 0,
        playerX: 10,
        playerY: 10,
        visitedAreas: [],
        lastActivity: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      };

      await dynamoClient.send(new PutCommand({
        TableName: SESSIONS_TABLE,
        Item: newSession
      }));

      const gameSession: GameSession = {
        ...newSession,
        visitedAreas: new Set(newSession.visitedAreas)
      };

      return createResponse(200, { session: gameSession, success: true });
    }

    const sessionItem = result.Item as DynamoSessionItem;
    const gameSession: GameSession = {
      ...sessionItem,
      visitedAreas: new Set(sessionItem.visitedAreas)
    };

    return createResponse(200, { session: gameSession, success: true });
  } catch (error) {
    console.error('Get session error:', error);
    return createResponse(500, { 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get session' 
    });
  }
}

async function handleUpdateSession(sessionId: string, body: string | null): Promise<APIGatewayProxyResult> {
  if (!body) {
    return createResponse(400, { error: 'Request body is required' });
  }

  try {
    const request: UpdateSessionRequest = JSON.parse(body);

    const existingResult = await dynamoClient.send(new GetCommand({
      TableName: SESSIONS_TABLE,
      Key: { sessionId }
    }));

    const existingSession = existingResult.Item as DynamoSessionItem || {
      sessionId,
      currentMap: 0,
      playerX: 10,
      playerY: 10,
      visitedAreas: [],
      lastActivity: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };

    const updatedSession: DynamoSessionItem = {
      ...existingSession,
      ...(request.currentMap !== undefined && { currentMap: request.currentMap }),
      ...(request.playerX !== undefined && { playerX: request.playerX }),
      ...(request.playerY !== undefined && { playerY: request.playerY }),
      ...(request.visitedAreas && { visitedAreas: request.visitedAreas }),
      lastActivity: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };

    await dynamoClient.send(new PutCommand({
      TableName: SESSIONS_TABLE,
      Item: updatedSession
    }));

    const gameSession: GameSession = {
      ...updatedSession,
      visitedAreas: new Set(updatedSession.visitedAreas)
    };

    return createResponse(200, { session: gameSession, success: true });
  } catch (error) {
    console.error('Update session error:', error);
    return createResponse(400, { 
      success: false,
      error: error instanceof Error ? error.message : 'Invalid request' 
    });
  }
}

// WebSocket Implementation Functions
async function handleWebSocketConnect(connectionId: string): Promise<APIGatewayProxyResult> {
  console.log('Client connected:', connectionId);
  return { statusCode: 200, body: 'Connected' };
}

async function handleWebSocketDisconnect(connectionId: string): Promise<APIGatewayProxyResult> {
  console.log('Client disconnected:', connectionId);
  return { statusCode: 200, body: 'Disconnected' };
}

async function handleWebSocketMessage(connectionId: string, body: string | null): Promise<APIGatewayProxyResult> {
  if (!body) {
    return { statusCode: 400, body: 'Message body required' };
  }

  try {
    const message: WebSocketMessage = JSON.parse(body);
    console.log('Received message:', message);

    // Handle different message types
    switch (message.action) {
      case 'joinGame':
      case 'move':
      case 'getMap':
      case 'generateMap':
      case 'saveGameState':
        // WebSocket message handling logic would go here
        break;
      
      default:
        console.log('Unknown action:', message.action);
    }

    return { statusCode: 200, body: 'Message processed' };
  } catch (error) {
    console.error('Message handling error:', error);
    return { statusCode: 500, body: 'Message handling failed' };
  }
}