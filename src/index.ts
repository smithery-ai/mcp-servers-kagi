#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";
import { KagiAPI } from "./api.js";
import { KagiError, SearchParams } from "./types.js";

dotenv.config();

class KagiServer {
  private server: Server;
  private kagiApi: KagiAPI;

  constructor() {
const kagiApiKey = process.env.KAGI_API_KEY;
if (!kagiApiKey) {
  throw new Error('KAGI_API_KEY environment variable is required');
}
    this.kagiApi = new KagiAPI({ apiKey: kagiApiKey });

    this.server = new Server(
  {
    name: "kagi-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
};

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
});
  }

  private setupHandlers(): void {
    this.setupToolHandlers();
    }

  private setupToolHandlers(): void {
    const searchTool = {
      name: "kagi_search",
      description: "Perform web search using Kagi",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { 
            type: "number",
            default: 10,
            minimum: 1,
            maximum: 100
    }
        },
        required: ["query"]
      }
    };

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [searchTool]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === "kagi_search") {
        if (!request.params.arguments || typeof request.params.arguments !== 'object') {
          throw new McpError(ErrorCode.InvalidParams, "Invalid arguments for kagi_search");
    }

        const { query, limit } = request.params.arguments as { query?: unknown; limit?: unknown };

        if (typeof query !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, "Query must be a string");
        }

        const searchParams: SearchParams = {
          q: query,
        };

        if (limit !== undefined) {
          if (typeof limit !== 'number' || limit < 1 || limit > 100) {
            throw new McpError(ErrorCode.InvalidParams, "Limit must be a number between 1 and 100");
          }
          searchParams.limit = limit;
        }

    try {
          const results = await this.kagiApi.search(searchParams);
      return { toolResult: results };
    } catch (error) {
      if (error instanceof KagiError) {
            return {
              content: [{ type: "text", text: `Kagi API error: ${error.message}` }],
              isError: true,
            };
      }
      throw error;
    }
  }
      throw new McpError(ErrorCode.MethodNotFound, "Unknown tool");
});
}

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Kagi MCP server running on stdio");
  }
}

const server = new KagiServer();
server.run().catch(console.error);
