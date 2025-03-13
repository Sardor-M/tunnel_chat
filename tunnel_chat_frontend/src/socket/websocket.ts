class WebSocketService {
    private static instance: WebSocketService;
    private socket: WebSocket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectTimeout: number = 3000; 
    private reconnectTimer: NodeJS.Timeout | null = null;
    private isConnecting: boolean = false;
    
    // we first get the singleton instance
    public static getInstance(): WebSocketService {
      if (!WebSocketService.instance) {
        WebSocketService.instance = new WebSocketService();
      }
      return WebSocketService.instance;
    }
    
    // connect to the ws server
    public connect(username: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          resolve(true);
          return;
        }
        
        if (this.isConnecting) {
          resolve(false);
          return;
        }
        
        this.isConnecting = true;
        
        this.socket = new WebSocket("ws://localhost:8080");
        
        this.socket.onopen = () => {
          console.log("WebSocket connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          this.send({
            type: "SET_USERNAME",
            username
          });
          
          this.notifyListeners("CONNECTION_SUCCESS", { connected: true });
          
          resolve(true);
        };
        
        this.socket.onclose = (event) => {
          this.isConnecting = false;
          console.log("WebSocket disconnected:", event.code, event.reason);
          
          this.notifyListeners("CONNECTION_CLOSED", { 
            code: event.code, 
            reason: event.reason,
            wasClean: event.wasClean
          });
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect(username);
          }
          
          if (this.reconnectAttempts === 0) {
            reject(new Error("Failed to connect to WebSocket server"));
          }
        };
        
        this.socket.onerror = (error) => {
          this.isConnecting = false;
          console.error("WebSocket error:", error);
          
          this.notifyListeners("ERROR", { error });
          
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            this.notifyListeners(data.type, data);
            
            this.notifyListeners("MESSAGE", data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };
      });
    }
    
    // we schedule the reconnection attempt
    private scheduleReconnect(username: string): void {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      this.reconnectAttempts++;
      const delay = this.reconnectTimeout * this.reconnectAttempts;
      
      console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
      
      this.notifyListeners("RECONNECTING", { 
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        delay
      });
      
      this.reconnectTimer = setTimeout(() => {
        this.connect(username).catch(() => {
          // if conn dfails as we reach  the max attempts we notify listeners
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.notifyListeners("RECONNECT_FAILED", {
              attempts: this.reconnectAttempts
            });
          }
        });
      }, delay);
    }
    
    // send data through the WS
    public send(data: any): boolean {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        console.error("Cannot send message: WebSocket is not connected");
        return false;
      }
      
      try {
        this.socket.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error("Error sending WebSocket message:", error);
        return false;
      }
    }
    
    public addListener(type: string, callback: Function): void {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set());
      }
      
      this.listeners.get(type)?.add(callback);
    }
    
    public removeListener(type: string, callback: Function): void {
      if (this.listeners.has(type)) {
        this.listeners.get(type)?.delete(callback);
      }
    }
    
    private notifyListeners(type: string, data: any): void {
      if (this.listeners.has(type)) {
        this.listeners.get(type)?.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in WebSocket listener for type ${type}:`, error);
          }
        });
      }
    }
    
    public disconnect(): void {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      if (this.socket) {
        this.socket.close(1000, "Client disconnected");
        this.socket = null;
      }
      
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    }
    
    // we check if the ws is connected
    public isConnected(): boolean {
      return !!this.socket && this.socket.readyState === WebSocket.OPEN;
    }
    
    // we get the curr connection state
    public getState(): number | null {
      return this.socket ? this.socket.readyState : null;
    }
  }
  
  export default WebSocketService;