import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { BedrockRequest, BedrockResponse, GeneratedMap } from './types';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const WORLD_GENERATOR_PROMPT = `You are a professional game world designer specializing in ASCII-based RPG worlds. Your expertise lies in creating immersive, interconnected game environments that provide engaging exploration experiences while maintaining narrative coherence and gameplay balance.

## Current Game System

### Map Specifications
- **Map Size**: 80x40 grid cells
- **Viewport**: 35x20 visible area (player-centered camera)
- **Coordinate System**: (0,0) at top-left, (79,39) at bottom-right
- **Border Requirement**: All maps must have \`#\` walls on edges except at designated exits

### ASCII Character Rules
**Special Characters (Reserved)**
- \`.\` = Empty space (walkable)
- \`#\` = Wall/Border (blocks movement)
- \`@\` = Player character

**Object Characters (Alphabets Only)**
All game objects must use single alphabet letters A-Z. You can freely create new objects using any unused letters:

**Existing Objects (for reference):**
- \`T\` = Tree (blocks movement)
- \`C\` = Cactus (blocks movement)
- \`R\` = Rock (blocks movement)
- \`H\` = House (blocks movement)
- \`S\` = Stalactite (blocks movement)
- \`W\` = Water (blocks movement)

### Exit System
- Exits are 3-cell wide gaps in border walls
- Each exit connects to specific coordinates on target map
- Exit format: \`{x: exitX, y: exitY, targetMap: mapId, targetX: arrivalX, targetY: arrivalY}\`

When given a request to generate new world content, you will create:

1. **New Theme Configuration** (THEME_CONFIGS format)
2. **New Map Configuration** (MAP_CONFIGS format)
3. **Complete 2D Map Array** (80x40 grid)
4. **New ASCII Objects** (if needed for your creative vision)

### Output Format

Return only valid JSON in this exact format:

\`\`\`json
{
  "themeConfig": {
    "theme_name": {
      "objects": [
        {"type": "ASCII_CHAR", "count": NUMBER, "probability": DECIMAL}
      ]
    }
  },
  "mapConfig": {
    "mapId": {
      "theme": "theme_name",
      "exits": [
        {"x": NUMBER, "y": NUMBER, "targetMap": NUMBER, "targetX": NUMBER, "targetY": NUMBER}
      ]
    }
  },
  "mapArray": [
    ["#", "#", "#", ...],
    ["#", ".", ".", ...],
    ...
  ],
  "newObjects": {
    "ASCII_CHAR": "Object description and meaning"
  }
}
\`\`\`

### Design Guidelines

**Creative Freedom**
- Feel free to create completely new worlds independent of existing maps
- Invent new ASCII objects and their meanings as needed
- Explore unconventional themes and imaginative landscapes
- Surprise players with unexpected environments

**Technical Requirements**
- All borders must be \`#\` except at exits
- Exit gaps must be exactly 3 cells wide
- Object placement must not block essential paths
- New ASCII characters should be distinct and meaningful

Your Ultimate Goal: Create worlds that make players think "I've never seen anything like this before!" while maintaining smooth, engaging gameplay within the ASCII constraints.`;

export async function generateMapWithBedrock(request: BedrockRequest): Promise<BedrockResponse> {
  try {
    const modelId = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
    
    const prompt = `${WORLD_GENERATOR_PROMPT}

User Request: ${request.prompt}

Please generate a creative and unique map based on this request. Return only valid JSON in the specified format.`;

    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: request.maxTokens || 4000,
        temperature: request.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return {
      content: responseBody.content[0].text,
      success: true
    };
  } catch (error) {
    console.error('Bedrock generation error:', error);
    return {
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function parseGeneratedMap(content: string): GeneratedMap | null {
  try {
    // Extract JSON from the response (in case it's wrapped in markdown)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/{\s*"themeConfig"[\s\S]*}/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    
    const parsed = JSON.parse(jsonString.trim());
    
    // Validate the structure
    if (!parsed.themeConfig || !parsed.mapConfig || !parsed.mapArray) {
      throw new Error('Invalid map structure: missing required fields');
    }
    
    // Validate map array dimensions
    if (parsed.mapArray.length !== 40) {
      throw new Error(`Invalid map height: expected 40, got ${parsed.mapArray.length}`);
    }
    
    for (let i = 0; i < parsed.mapArray.length; i++) {
      if (parsed.mapArray[i].length !== 80) {
        throw new Error(`Invalid map width at row ${i}: expected 80, got ${parsed.mapArray[i].length}`);
      }
    }
    
    return parsed as GeneratedMap;
  } catch (error) {
    console.error('Failed to parse generated map:', error);
    return null;
  }
}

export async function generateMap(theme: string, description?: string): Promise<GeneratedMap | null> {
  const prompt = description 
    ? `Create a ${theme} themed map with the following description: ${description}`
    : `Create a creative and unique ${theme} themed map`;
    
  const bedrockResponse = await generateMapWithBedrock({ prompt });
  
  if (!bedrockResponse.success) {
    console.error('Bedrock API error:', bedrockResponse.error);
    return null;
  }
  
  return parseGeneratedMap(bedrockResponse.content);
}