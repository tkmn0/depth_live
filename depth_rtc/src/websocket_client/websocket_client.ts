import { SignalingMessage } from "../models/json/signaling_message"
import { ISignalingGateway } from "../signaling/signaling_gateway";

export class WebSocketClient implements ISignalingGateway {
    private socket: WebSocket = null
    onSignalingMessage: (messsage: SignalingMessage) => void

    constructor() {
        setInterval(this.tryToConnect, 1000);
    }

    private tryToConnect = () => {
        if (this.socket) { return; }
        console.log('try to connect websocket');
        this.socket = this.setupWebSocket('ws://192.168.1.22:8080');
    };

    private setupWebSocket = (url: string): WebSocket => {
        const socket = new WebSocket(url);
        socket.onopen = () => {
            console.log("websocket on open");
        };

        socket.onmessage = (event) => {
            const message: SignalingMessage = JSON.parse(event.data);
            if (this.onSignalingMessage) {
                this.onSignalingMessage(message);
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

    sendMessage = (message: SignalingMessage) => {
        if (this.socket) {
            this.socket.send(JSON.stringify(message));
        }
    };
}