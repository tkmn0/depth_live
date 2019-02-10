import { WebRTCClientDelegate } from "./webrtc_client_delegate";
import { Channels } from "../models/channels";
import { checkServerIdentity } from "tls";
import { WebRTCSignalingDelegate } from "./webrtc_signaling_delegate";

export class WebRTCClient {

    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel;
    private channels: Channels

    delegate: WebRTCClientDelegate;
    signalingDelegate: WebRTCSignalingDelegate;

    constructor(channels: Channels) {
        this.channels = channels;
        this.peerConnection = this.prepareNewConnection();
    }

    private setupDataChannel = (peer: RTCPeerConnection): RTCDataChannel => {
        const ch = peer.createDataChannel('data');
        ch.binaryType = 'arraybuffer';
        ch.onclose = (event) => { this.dataChannel = null; };
        ch.onerror = (event) => { this.dataChannel = null; };
        ch.onmessage = (event) => {
            if (this.delegate && this.delegate.onMessageFrom) {
                this.delegate.onMessageFrom(ch, event);
            }
        };
        ch.onopen = (event) => {
            console.log('data channel on open');
        };
        return ch;
    };

    private prepareNewConnection = () => {
        const rtcConf: RTCConfiguration = {
            iceServers: [
                {
                    urls: "stun:stun.1.google.com:19302"
                }
            ]
        };

        const peer = new RTCPeerConnection(rtcConf);
        peer.onicecandidate = (event) => {
            if (this.signalingDelegate && this.signalingDelegate && event != null) {
                this.signalingDelegate.didGenerateCandidate(event.candidate);
            }
        };
        peer.oniceconnectionstatechange = (event) => { };
        peer.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            event.channel.onclose = (event) => { this.dataChannel = null; };
            event.channel.onopen = (event) => {
                console.log('data channel on open');
            };
            event.channel.onclose = (event) => { this.dataChannel = null; };
            event.channel.onmessage = (messageEvent) => {
                if (this.delegate && this.delegate.onMessageFrom) {
                    this.delegate.onMessageFrom(event.channel, messageEvent);
                }
            };
        };
        peer.onnegotiationneeded = () => { };
        peer.ontrack = (event) => { };

        return peer;
    }

    private makeOfferAsync = async (): Promise<RTCSessionDescription> => {
        return new Promise(async (resolve, reject) => {
            try {
                const offer = await this.peerConnection.createOffer();
                await this.peerConnection.setLocalDescription(offer);
                resolve(new RTCSessionDescription(offer));
            } catch (err) {
                reject(err);
            }
        });
    };

    private makeAnswerAsync = async (): Promise<RTCSessionDescriptionInit> => {
        return new Promise(async (resolve, reject) => {
            if (!this.peerConnection) {
                reject('no peer connection');
            } else {
                try {
                    const answer = await this.peerConnection.createAnswer();
                    await this.peerConnection.setLocalDescription(answer);
                    resolve(answer);
                } catch (err) {
                    reject(err);
                }
            }

        });
    };

    public connect = () => {
        if (!this.dataChannel && this.channels.data) {
            // set up data
            this.dataChannel = this.setupDataChannel(this.peerConnection);
        }

        return this.makeOfferAsync();
    }

    public setOfferAsync = async (sdp: RTCSessionDescription, callback: (answer: RTCSessionDescription) => void) => {
        try {
            if (this.peerConnection.signalingState == 'have-remote-offer') {
                console.log('peer connection is still in progress to set remote offer');
            }
            await this.peerConnection.setRemoteDescription(sdp);
            const answer = await this.makeAnswerAsync();
            callback(new RTCSessionDescription(answer));
        } catch (err) {
            console.log('error to set remote offer');
            console.log(err);
        }
    };

    public setAnswerAsync = async (sdp: RTCSessionDescription) => {
        if (!this.peerConnection) {
            console.error('peerConnection NOT exist!');
            return;
        }

        try {
            await this.peerConnection.setRemoteDescription(sdp);
            console.log('set answer async success...');
        } catch (err) {
            console.log(err);
        }
    };

    public addIceCandidate = (candidate: RTCIceCandidate) => {
        if (this.peerConnection && candidate) {
            this.peerConnection.addIceCandidate(candidate);
        }
    };

    public sendBuffer = (buffer: ArrayBuffer) => {
        if (this.dataChannel && this.dataChannel.readyState == 'open') {
            this.dataChannel.send(buffer);
        }
    };
}