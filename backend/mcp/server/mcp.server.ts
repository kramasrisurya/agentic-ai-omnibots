/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MCPTransport, JSONRPCRequest, JSONRPCResponse } from "../transport/transport";
import { MCP_RESOURCE_REGISTRY } from "../resources/resources";
import { AIService } from "../services/ai.service";

export class MCPServer {
  private transport?: MCPTransport;
  private aiService: AIService;

  constructor(aiService?: AIService) {
    this.aiService = aiService || new AIService();
  }

  /**
   * Bind the MCP server to a secure transport layer
   */
  public bind(transport: MCPTransport) {
    this.transport = transport;
    this.transport.onMessage((msg) => this.handleMessage(msg));
  }

  /**
   * Main JSON-RPC packet handler
   */
  private async handleMessage(message: JSONRPCRequest | JSONRPCResponse) {
    // If it's a response packet, skip processing (this is a server-received packet)
    if ("result" in message || "error" in message) return;

    const request = message as JSONRPCRequest;
    let response: JSONRPCResponse;

    try {
      let result: any;
      switch (request.method) {
        case "mcp/listTools":
          result = this.listTools();
          break;
        case "mcp/callTool":
          result = await this.callTool(request.params?.name, request.params?.arguments);
          break;
        case "mcp/listResources":
          result = this.listResources();
          break;
        case "mcp/readResource":
          result = this.readResource(request.params?.uri);
          break;
        default:
          throw new Error(`METHOD_NOT_FOUND: Method ${request.method} is not supported by this server.`);
      }
      
      response = {
        jsonrpc: "2.0",
        id: request.id,
        result,
      };
    } catch (err: any) {
      response = {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32603,
          message: err.message || "Internal server error during MCP processing.",
        },
      };
    }

    if (this.transport) {
      this.transport.send(response);
    }
  }

  /**
   * List of registered tools available to NitroStack
   */
  private listTools() {
    return [
      {
        name: "scan_parts",
        description: "Evaluates standard and critical part instances on conveyor belt for defects.",
        inputSchema: {
          type: "object",
          properties: {
            partId: { type: "string" },
            partName: { type: "string" },
            grade: { type: "string", enum: ["good", "average", "poor"] },
          },
          required: ["partId", "grade"],
        },
      },
      {
        name: "analyze_damage",
        description: "Assesses specific structural failures or deep surface scratches on assemblies.",
        inputSchema: {
          type: "object",
          properties: {
            partInstanceId: { type: "string" },
            defectSignature: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          },
          required: ["partInstanceId", "defectSignature", "severity"],
        },
      },
      {
        name: "review_reasoning",
        description: "Determines the optimal vendor reorder speed and tradeoffs dynamically based on failures.",
        inputSchema: {
          type: "object",
          properties: {
            partInstanceId: { type: "string" },
            ruleSet: { type: "string" },
            historicRejectionRate: { type: "number" },
          },
          required: ["partInstanceId", "historicRejectionRate"],
        },
      },
    ];
  }

  /**
   * Dynamic tool dispatcher
   */
  private async callTool(name: string, args: any) {
    console.log(`[MCP-SERVER] Executing Tool call: ${name}`, args);

    switch (name) {
      case "scan_parts":
        const scanRes = await this.aiService.scanPart({
          partId: args.partId,
          partName: args.partName || "Unknown Component",
          grade: args.grade,
        });
        return { content: [{ type: "text", text: JSON.stringify(scanRes) }] };

      case "analyze_damage":
        const explanation = await this.aiService.getOperatorRecommendation(
          args.partInstanceId,
          args.defectSignature,
          0.12 // standard simulated deviation
        );
        return { content: [{ type: "text", text: JSON.stringify(explanation) }] };

      case "review_reasoning":
        const reasoningRes = await this.aiService.resolveProcurementReasoning(
          {
            partInstanceId: args.partInstanceId,
            ruleSet: args.ruleSet || "default_v1",
            systemContext: {
              lineStatus: "operational",
              historicRejectionRate: args.historicRejectionRate || 0,
              currentBufferStock: 15,
            },
          },
          { part_id: "SNS-07", criticality: "critical" } // mock reference details
        );
        return { content: [{ type: "text", text: JSON.stringify(reasoningRes) }] };

      default:
        throw new Error(`TOOL_NOT_FOUND: Tool with name '${name}' was not found on this MCP server.`);
    }
  }

  /**
   * List of registered resources
   */
  private listResources() {
    return Object.values(MCP_RESOURCE_REGISTRY).map((r) => ({
      uri: r.uri,
      name: r.name,
      mimeType: r.mimeType,
      description: r.description,
    }));
  }

  /**
   * Read contents of a resource URI
   */
  private readResource(uri: string) {
    const resource = Object.values(MCP_RESOURCE_REGISTRY).find((r) => r.uri === uri);
    if (!resource) {
      throw new Error(`RESOURCE_NOT_FOUND: Resource with URI '${uri}' does not exist.`);
    }
    return {
      contents: [
        {
          uri: resource.uri,
          mimeType: resource.mimeType,
          text: resource.content,
        },
      ],
    };
  }
}
