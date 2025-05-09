import { authService } from '@/services/authService';

class WebSocketService {
    private static instance: WebSocketService;
    private socket: WebSocket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectTimeout: number = 3000;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private isConnecting: boolean = false;
    private currentRooms: Set<string> = new Set();

    /**
     * Get the singleton instance of WebSocketService
     */
    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    /**
     * Connect to the WebSocket server
     */
    public connect(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                resolve(true);
                return;
            }

            if (this.isConnecting) {
                resolve(false);
                return;
            }

            this.isConnecting = true;
            console.log('Attempting to connect to WebSocket server...');

            try {
                // we get valid token for authentication
                const token = await authService.ensureValidToken();
                if (!token) {
                    throw new Error('Cannot connect: No valid authentication token');
                }

                const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsHost = import.meta.env.VITE_API_URL || 'localhost:8080';
                const wsUrl = `${wsProtocol}//${wsHost.replace(/^https?:\/\//, '')}`;

                this.socket = new WebSocket(wsUrl);

                // handle connection open
                this.socket.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;

                    this.send({
                        type: 'AUTH',
                        token,
                    });

                    this.notifyListeners('CONNECTION_SUCCESS', { connected: true });
                    resolve(true);
                };

                this.socket.onclose = (event) => {
                    this.isConnecting = false;
                    console.log('WebSocket disconnected:', event.code, event.reason);

                    this.notifyListeners('CONNECTION_CLOSED', {
                        code: event.code,
                        reason: event.reason,
                        wasClean: event.wasClean,
                    });

                    if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.scheduleReconnect();
                    }

                    if (this.reconnectAttempts === 0) {
                        reject(new Error('WebSocket connection closed'));
                    }
                };

                this.socket.onerror = (error) => {
                    this.isConnecting = false;
                    console.error('WebSocket error:', error);

                    this.notifyListeners('ERROR', { error });

                    if (this.reconnectAttempts === 0) {
                        reject(error);
                    }
                };

                // handling the incoming messages
                this.socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received WebSocket message:', data.type);

                        this.notifyListeners(data.type, data);

                        this.notifyListeners('MESSAGE', data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };
            } catch (error) {
                this.isConnecting = false;
                console.error('WebSocket connection error:', error);
                reject(error);
            }
        });
    }

    /**
     * Schedule a reconnection attempt
     */
    private scheduleReconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        // increment attempt counter and calculate delay
        this.reconnectAttempts++;
        const delay = this.reconnectTimeout * this.reconnectAttempts;

        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

        // notify listeners about reconnection attempt
        this.notifyListeners('RECONNECTING', {
            attempt: this.reconnectAttempts,
            maxAttempts: this.maxReconnectAttempts,
            delay,
        });

        this.reconnectTimer = setTimeout(() => {
            this.connect().catch(() => {
                // If max attempts reached, notify listeners of failure
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    this.notifyListeners('RECONNECT_FAILED', {
                        attempts: this.reconnectAttempts,
                    });
                }
            });
        }, delay);
    }

    /**
     * Send data through the WebSocket
     */
    public send(data: any): boolean {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('Cannot send message: WebSocket is not connected');
            return false;
        }

        try {
            if (typeof data === 'object') {
                this.socket.send(JSON.stringify(data));
            } else {
                this.socket.send(data);
            }
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            return false;
        }
    }

    /**
     * Join a chat room
     */
    public joinRoom(roomId: string): boolean {
        if (!this.isConnected()) {
            console.error('Cannot join room: WebSocket is not connected');
            return false;
        }

        const username = authService.getUsername() || 'anonymous';

        const result = this.send({
            type: 'JOIN_ROOM',
            roomId,
            username,
        });

        if (result) {
            this.currentRooms.add(roomId);
            console.log(`Sent JOIN_ROOM message for room: ${roomId}`);

            const roomJoinedHandler = (data: any) => {
                if (data.roomId === roomId) {
                    console.log(`Successfully joined room: ${data.roomName || roomId}`);
                }
            };

            // clean up old listener
            this.removeListener('ROOM_JOINED', roomJoinedHandler);

            // adding the new listener
            this.addListener('ROOM_JOINED', roomJoinedHandler);
        }

        return result;
    }

    public listenToRoom(roomId: string, callback: Function): () => void {
        const messageHandler = (data: any) => {
            if (data.type === 'CHAT' && data.roomId === roomId) {
                callback(data);
            }
        };

        this.addListener('MESSAGE', messageHandler);

        // return function to remove the listener
        return () => {
            this.removeListener('MESSAGE', messageHandler);
        };
    }

    /**
     * Leave a chat room
     */
    public leaveRoom(roomId: string): boolean {
        if (!this.isConnected()) {
            console.error('Cannot leave room: WebSocket is not connected');
            return false;
        }

        const result = this.send({
            type: 'LEAVE_ROOM',
            roomId,
        });

        if (result) {
            this.currentRooms.delete(roomId);
        }

        return result;
    }

    /**
     * Send a chat message to a room
     */
    public sendMessage(roomId: string, message: string, isEncrypted: boolean = false): boolean {
        if (!this.isConnected()) {
            console.error('Cannot send message: WebSocket is not connected');
            return false;
        }

        return this.send({
            type: 'CHAT',
            roomId,
            message,
            isEncrypted,
        });
    }

    /**
     * Send a file transfer notification
     */
    public sendFileNotification(roomId: string, fileInfo: any): boolean {
        if (!this.isConnected()) {
            console.error('Cannot send file notification: WebSocket is not connected');
            return false;
        }

        return this.send({
            type: 'FILE_TRANSFER',
            roomId,
            fileInfo,
        });
    }

    /**
     * Add a listener for WebSocket events
     */
    public addListener(type: string, callback: Function): void {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }

        this.listeners.get(type)?.add(callback);
    }

    /**
     * Remove a listener for WebSocket events
     */
    public removeListener(type: string, callback: Function): void {
        if (this.listeners.has(type)) {
            this.listeners.get(type)?.delete(callback);
        }
    }

    /**
     * Notify all listeners of a specific event type
     */
    private notifyListeners(type: string, data: any): void {
        if (this.listeners.has(type)) {
            this.listeners.get(type)?.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in WebSocket listener for type ${type}:`, error);
                }
            });
        }
    }

    /**
     * Disconnect from the WebSocket server
     */
    public disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.socket) {
            this.socket.close(1000, 'Client disconnected');
            this.socket = null;
        }

        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.currentRooms.clear();
    }

    /**
     * Check if WebSocket is connected
     */
    public isConnected(): boolean {
        return !!this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    /**
     * Get the current WebSocket connection state
     */
    public getState(): number | null {
        return this.socket ? this.socket.readyState : null;
    }

    /**
     * Get the current rooms the user has joined
     */
    public getCurrentRooms(): string[] {
        return Array.from(this.currentRooms);
    }

    /**
     * Request online users list from server
     */
    public requestOnlineUsers(): boolean {
        if (!this.isConnected()) {
            console.error('Cannot request online users: WebSocket is not connected');
            return false;
        }

        console.log('Requesting online users from WebSocket server');
        return this.send({
            type: 'GET_ONLINE_USERS',
        });
    }
}

export default WebSocketService;
