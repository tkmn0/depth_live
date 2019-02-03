class WebRTC {
    constructor() {
        console.log('webrtc init');

        this._peerConnection = null;
        this._dataChannel = null;
        this._localStream = null;
        this.sendSDP = null;
        this.sendICECandidate = null;
        this.OnAddRemoteStreamCallback = null;
        this.OnRemoveStreamCallback = null;
        this.OnDataChannelOpen = null;
        this.OnDataChannelMessage = null;
        this.OnICEConnectionStateChanged = null;
        this._connectionCount = 0;

        this._ID = null;
    }

    SetConnectionID(id) {
        this._ID = id;
    }

    async makeOfferAsync() {
        console.log('---- make offer async called ----');
        this._peerConnection = this.prepareNewConnection(true);
        //this._dataChannel = this.setUpDataChannel(this._peerConnection);

        const offerSDP = await this._peerConnection.createOffer();
        console.log('--- makeofferAsync: success to create SDP');
        await this._peerConnection.setLocalDescription(offerSDP);
        console.log('--- makeOfferAsync: success to set SDP');

        this.sendSDP(offerSDP);
    }

    makeOfferWith(stream) {
        this.colorStream = stream;

        this._peerConnection = this.prepareNewConnection(true);
        this._dataChannel = this.setUpDataChannel(this._peerConnection);
        console.log(this._peerConnection);
    }

    sendData(bytes) {
        if (this._dataChannel != null) {
            this._dataChannel.send(bytes);
        }
    }

    // getUserMediaでカメラ、マイクにアクセス
    async startVideo(element) {
        const self = this;
        try {
            self._localStream = await navigator.mediaDevices.getUserMedia({ video: { width: 480 }, audio: true });
            self._playVideo(element, self._localStream);
        } catch (err) {
            console.error('mediaDevice.getUserMedia() error:', err);
        }
    }

    // file capture
    async startVideoCapture(element, filePath) {
        const self = this;
        element.src = filePath;
        element.load();
        element.controls = true;
        try {
            self._localStream = element.captureStream();
            element.autoPlay = true;
            console.log('local stream from file set up ok');
        } catch (err) {
            console.error('mediaElement.captureStream() error:', err);
        }
    }

    //選択したカメラ、マイクをローカルストリームに設定
    setSelectedVideoToLocalStream(stream) {
        const self = this;
        try {
            self._localStream = stream;
        } catch (err) {
            console.error('mediaDevice.getUserMedia() error:', err);
        }
    }

    // Videoの再生を開始する
    async _playVideo(element, stream) {
        element.srcObject = stream;
        await element.play();
    }


    //MARK: WebRTC
    prepareNewConnection(isOffer) {
        const self = this;

        const servers = {
            iceServers: [
                { url: "stun:stun.1.google.com:19302" }
            ]
        };
        const peer = new RTCPeerConnection(servers);

        peer.onicecandidate = function (evt) {
            console.log('==== On ICECandidate ====');
            if (evt.candidate) {
                self.sendICECandidate(evt.candidate);
            } else {
                console.log('empty ice event');
            }
        };

        // ICEのステータスが変更になったときの処理
        peer.oniceconnectionstatechange = function () {
            console.log('ICE connection Status has changed to ' + peer.iceConnectionState);
            // cheking 
            // connected
            // completed

            switch (peer.iceConnectionState) {
                case 'closed':
                case 'connected':
                    console.log('peerconnection connection established!!');
                case 'failed':
                    // ICEのステートが切断状態または異常状態になったら切断処理を実行する
                    if (this._peerConnection) {
                        this.hangUp();
                    }
                    break;
                case 'dissconnected':
                    break;
            }

            if (self.OnICEConnectionStateChanged != null) {
                self.OnICEConnectionStateChanged(peer.iceConnectionState);
            }
        };

        peer.ondatachannel = function (ev) {
            console.log('Data channel is created!');
            ev.channel.onopen = function () {
                console.log('Data channel is open and ready to be used.');
                self._dataChannel.send('hey');
                if (self.OnDataChannelOpen != null) {
                    self.OnDataChannelOpen();
                }
            };
            ev.channel.onmessage = function (message) {
                if (self.OnDataChannelMessage != null) {
                    self.OnDataChannelMessage(message);
                }
            }
            self._dataChannel = ev.channel;

        };

        peer.onnegotiationneeded = function () {
            // add track したら呼ばれる
            console.log('--- on negotiatioinneede ---');
        }

        peer.onsignalingstatechange = function (event) {
            console.log('==== onsignailingstate change ====', peer.signalingState);
        };

        peer.onaddstream = function (event) {
            console.log('got remote stream');

            if (self.OnAddRemoteStreamCallback != null) {
                self.OnAddRemoteStreamCallback(event.stream, self._connectionCount);
            }
            self._connectionCount++;
        }

        peer.onremovestream = function (event) {
            console.log('stream removed: ', event.stream);
            if (self.OnRemoveStreamCallback != null) {
                self.OnRemoveStreamCallback(event.stream);
            }
        }

        // ローカルのMediaStreamを利用できるようにする
        if (self._localStream) {
            console.log('Adding local stream...');
            peer.addStream(this._localStream);
        } else {
            // with data channnel
            console.warn('no local stream, but continue.');
        }

        console.log("new peer connection created");
        return peer;
    }

    setUpDataChannel(peerConnection) {
        const self = this;

        const datachannel = peerConnection.createDataChannel('browser00', {
            maxRetransmits: 0,
            ordered: false,
            reliable: false
        });
        datachannel.binaryType = "arraybuffer";

        //MARK: datacahnnel callbacks
        datachannel.onerror = function (error) {
            console.log("Data Channel Error:", error);
        };

        datachannel.onmessage = function (event) {
            console.log("Got Data Channel Message:", event.data);
        };

        datachannel.onopen = function () {
            console.log('--- data channel on open ---');
            // datachannel.send('data channel on open');
            if (self.OnDataChannelOpen != null) {
                self.OnDataChannelOpen();
            }
        };

        datachannel.onclose = function () {
            console.log("The Data Channel is Closed");
        };

        console.log('created data channel');
        return datachannel;
    }

    async makeAnswerAsync() {
        console.log('sending Answer. Creating remote session description...');

        if (!this._peerConnection) {
            console.error('peerConnection NOT exist!');
            return;
        }

        try {
            const answerSDP = await this._peerConnection.createAnswer();
            await this._peerConnection.setLocalDescription(answerSDP);
            this.sendSDP(answerSDP);
        } catch (error) {
            console.log('makeanswerasync errror');
            console.log(error);
        }

    }

    async setOfferAsync(sessionDescription) {
        if (this._peerConnection) {
            console.log('peerConnection already exist!');
            console.log('continue...');
        } else {
            this._peerConnection = this.prepareNewConnection(false);
        }

        console.log('message from sfu');
        try {

            if (this._peerConnection.signalingState == 'have-remote-offer') {
                console.log('peer connection in progress');
                return;
            }
            await this._peerConnection.setRemoteDescription(sessionDescription);
            console.log('set remote offer async success...');
            await this.makeAnswerAsync();
            console.log('make answerasync success...');

        } catch (error) {
            console.log('set offer async catch error');
            console.log(error);
        }
    }

    async setAnswerAsync(sessionDescription) {
        if (!this._peerConnection) {
            console.error('peerConnection NOT exist!');
            return;
        }

        try {
            await this._peerConnection.setRemoteDescription(sessionDescription);
            console.log('set answer async success...');
        } catch (error) {
            console.log('error in set Answer Async');
        }
    }

    addIceCandidate(candidate) {
        console.log('==== recieve ICE Candidate ====');
        if (this._peerConnection) {
            this._peerConnection.addIceCandidate(candidate);
        } else {
            console.error('PeerConnection not exist!');
            return;
        }
    }

    hangUp() {
        if (this._peerConnection) {
            if (this._peerConnection.iceConnectionState !== 'closed') {
                this._peerConnection.close();
                this._peerConnection = null;
                this._dataChannel = null;
                return;
            }
        }
        console.log('peerConnection is closed.');
    }

}

module.exports = WebRTC;