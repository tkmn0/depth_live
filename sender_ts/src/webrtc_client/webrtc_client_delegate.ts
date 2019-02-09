export interface WebRTCClientDelegate {
    onMessageFrom: (ch: RTCDataChannel, event: MessageEvent) => void
}