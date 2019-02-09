export interface WebRTCClientDelegate {
    didGenerateCandidte: (candidate: RTCIceCandidate) => void
    onMessageFrom: (ch: RTCDataChannel, event: MessageEvent) => void
}