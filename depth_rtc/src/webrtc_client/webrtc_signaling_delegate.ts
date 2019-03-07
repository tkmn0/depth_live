export interface WebRTCSignalingDelegate {
    didGenerateCandidate: (candidate: RTCIceCandidate) => void
}