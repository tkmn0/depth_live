import { SignalingMessage } from "./signaling_message"
import { WebSocketClientDelegate } from "./websocket_client_delegate";

export class WebSocketClient {
    private socket: WebSocket = null
    delegate: WebSocketClientDelegate

    constructor() {
        setInterval(this.tryToConnect, 1000);
    }

    private tryToConnect = () => {
        if (this.socket) { return; }
        console.log('try to connect websocket');
        this.socket = this.setupWebSocket('ws://localhost:8080');
    };

    private setupWebSocket = (url: string): WebSocket => {
        const socket = new WebSocket(url);
        socket.onopen = () => {
            console.log("websocket on open");
        };

        socket.onmessage = (event) => {
            const message: SignalingMessage = JSON.parse(event.data);
            if (this.delegate && this.delegate.onMessage) {
                this.delegate.onMessage(message);
            }
        };

        socket.onclose = () => {
            this.socket = null;
        };

        socket.onerror = () => {
            this.socket = null;
        };
        return socket;
    };

    public sendMessage = (message: string) => {
        if (this.socket) {
            this.socket.send(message);
        }
    };
}