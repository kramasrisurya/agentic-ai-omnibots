/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JSONRPCRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

export interface JSONRPCResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPTransport {
  send(message: JSONRPCRequest | JSONRPCResponse): void;
  onMessage(callback: (message: JSONRPCRequest | JSONRPCResponse) => void): void;
  close(): void;
}

/**
 * InMemoryTransport can be used to run full-spectrum MCP server actions 
 * entirely within standard Node/Browser sandboxes without full network stack overhead.
 */
export class InMemoryTransport implements MCPTransport {
  private peer?: InMemoryTransport;
  private messageCallback?: (message: any) => void;

  public connect(peer: InMemoryTransport) {
    this.peer = peer;
    peer.peer = this;
  }

  public send(message: JSONRPCRequest | JSONRPCResponse): void {
    if (this.peer && this.peer.messageCallback) {
      // Simulate asynchronous queue scheduling
      setTimeout(() => {
        if (this.peer?.messageCallback) {
          this.peer.messageCallback(message);
        }
      }, 0);
    }
  }

  public onMessage(callback: (message: JSONRPCRequest | JSONRPCResponse) => void): void {
    this.messageCallback = callback;
  }

  public close(): void {
    this.peer = undefined;
    this.messageCallback = undefined;
  }
}
