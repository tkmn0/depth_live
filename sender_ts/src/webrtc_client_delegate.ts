export interface WebRTCClientDelegate {
    didGenerateCandidte: (candidate: RTCIceCandidate) => void
}