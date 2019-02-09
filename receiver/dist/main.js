/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const WebRTC = __webpack_require__(/*! ./webrtc-client */ \"./src/webrtc-client.js\");\n\nlet ws, webrtc;\nlet localVideoElement;\nlet colorCanvas, webpCanvas;\nlet colorImage = new Image();\nlet isOpen = false;\nlet currentBlob;\nlet fileReader = new FileReader();\n\nfileReader.onload = () => {\n    var ary_u8 = new Uint8Array(fileReader.result);\n\n    // 出力テスト\n    console.log(ary_u8.length);\n};\n\nconst VieoSourceType = {\n    Camera: 'camera',\n    File: 'file',\n    SelectCamera: 'selectcamera'\n}\n\nwindow.onload = function () {\n    console.log('video source type:', window.videoSourceType);\n\n    main();\n    window.webrtc = webrtc;\n    window.connectAsync = connectAsync;\n    window.setupWS = setupWS;\n    window.websocket = ws;\n    window.disconnectWebRTC = DissConnect;\n    window.userID = -1;\n    window.setSelectedVideoToLocalStream = setSelectedVideoToLocalStream;\n    colorCanvas = document.getElementById('colorCanvas');\n    webpCanvas = document.getElementById('webpCanvas');\n    // setInterval(drawColorCanvas, 1000 / 30);s\n    // setInterval(drawImage, 1000 / 30);\n    webpCanvas.width = 480;\n    webpCanvas.height = 360;\n    // setInterval(readBlob, 1000 / 30);s\n}\n\nconst readBlob = () => {\n    if (currentBlob) {\n        if (fileReader.readyState != FileReader.LOADING) {\n            fileReader.readAsArrayBuffer(currentBlob);\n        }\n    }\n};\n\nasync function main() {\n    webrtc = new WebRTC();\n    webrtc.sendSDP = sendSDP;\n    webrtc.sendICECandidate = sendICECandidate;\n    webrtc.OnAddRemoteStreamCallback = OnAddRemoteStream;\n    webrtc.OnRemoveStreamCallback = OnRemoveStram;\n    webrtc.OnICEConnectionStateChanged = OnICEConnectionStateChanged;\n    webrtc.OnDataChannelOpen = dataChannelOnOpen;\n    webrtc.OnDataChannelMessage = onMessage;\n\n    switch (window.videoSourceType) {\n        case VieoSourceType.Camera:\n            SetVideoTag();\n            await webrtc.startVideo(localVideoElement);\n            break;\n        case VieoSourceType.File:\n            SetVideoTag();\n            await webrtc.startVideoCapture(localVideoElement, window.videoFilePath);\n            break;\n        case VieoSourceType.SelectCamera:\n            break;\n    }\n}\n\nconst dataChannelOnOpen = () => {\n    console.log(\"==== Data Channel On Open ==== \");\n    isOpen = true;\n};\n\nconst drawColorCanvas = () => {\n    colorCanvas.width = localVideoElement.videoWidth;\n    colorCanvas.height = localVideoElement.videoHeight;\n\n    colorCanvas.getContext(\"2d\").drawImage(localVideoElement, 0, 0, localVideoElement.videoWidth, localVideoElement.videoHeight);\n\n\n    colorCanvas.toBlob((blob) => {\n        if (blob) {\n            // let url = window.URL.createObjectURL(blob);\n            // colorImage.src = url;\n            // if (isOpen) {\n            //     webrtc.sendData(blob);\n            // }\n            currentBlob = blob\n        }\n    }, \"image/webp\", 1);\n\n\n};\n\nconst onMessage = (message) => {\n    // console.log(message);\n    console.log(\"msg\");\n};\n\n// const drawImage = () => {\n//     webpCanvas.getContext(\"2d\").drawImage(colorImage, 0, 0);\n// };\n\nconst sendSDP = function (sessionDescription) {\n    const message = JSON.stringify(sessionDescription);\n    ws.send(message);\n}\n\nconst sendICECandidate = function (candidate) {\n    const message = {\n        type: \"candidate\",\n        ice: candidate\n    }\n    ws.send(JSON.stringify(message));\n}\n\nconst OnAddRemoteStream = function (stream, id) {\n    console.log(\"stream: \", stream.id);\n\n    const video = document.createElement('video');\n    video.id = stream.id;\n    video.style.width = window.innerWidth * 0.6 + 'px';\n    video.loop = true;\n    video.autoplay = true;\n    video.srcObject = stream;\n    video.volume = 1;\n    video.play();\n    document.body.appendChild(video);\n}\n\nconst OnRemoveStram = function (stream) {\n    console.log(stream);\n    const videoEl = document.getElementById(stream.id);\n    document.body.removeChild(videoEl);\n};\n\nconst OnICEConnectionStateChanged = (state) => {\n    console.log('ice connection state: ', state);\n    switch (state) {\n        case 'completed':\n            break;\n        case 'closed':\n            for (let video of document.getElementsByTagName('video')) {\n                if (video.id != 'local') {\n                    video.remove();\n                }\n            }\n\n            break;\n    }\n};\n\nasync function connectAsync() {\n    await webrtc.makeOfferAsync();\n}\n\nfunction SetVideoTag() {\n    localVideoElement = document.createElement('video');\n    localVideoElement.id = 'local';\n    localVideoElement.style.width = window.innerWidth * 0.6 + 'px';\n    localVideoElement.loop = true;\n    localVideoElement.autoplay = true;\n    document.body.appendChild(localVideoElement);\n    localVideoElement.volume = 0;\n    localVideoElement.style.visibility = 'hidden';\n}\n\nfunction DissConnect() {\n    webrtc.hangUp();\n}\n\nfunction setupWS(url) {\n    console.log(url);\n    ws = new WebSocket(url);\n\n    ws.onopen = function () {\n        console.log('on open');\n    };\n\n    ws.onmessage = async function (evt) {\n        const message = JSON.parse(evt.data);\n        console.log('recieved message: ' + message.type);\n        switch (message.type) {\n            case 'offer': {\n                console.log('Received offer ...');\n                await webrtc.setOfferAsync(message);\n                break;\n            }\n            case 'answer': {\n                console.log('Received answer ...');\n                console.log(message);\n                await webrtc.setAnswerAsync(message);\n                break;\n            }\n            case 'update': {\n                message.type = 'answer';\n                await webrtc.setAnswerAsync(message);\n            }\n            case 'candidate': {\n                console.log('Received ICE candidate ...');\n                if (message.ice) {\n                    const candidate = new RTCIceCandidate(message.ice);\n                    webrtc.addIceCandidate(candidate);\n                }\n                break;\n            }\n            case 'close': {\n                console.log('peer is closed ...');\n                webrtc.hangUp();\n                break;\n            }\n            default: {\n                console.log(\"Invalid message\");\n                break;\n            }\n        }\n    }\n}\n\nfunction setSelectedVideoToLocalStream(stream) {\n    console.log(\"setSelectedVideoToLocalStream\");\n    webrtc.setSelectedVideoToLocalStream(stream);\n}\n\n\n//# sourceURL=webpack:///./src/index.js?");

/***/ }),

/***/ "./src/webrtc-client.js":
/*!******************************!*\
  !*** ./src/webrtc-client.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("class WebRTC {\r\n    constructor() {\r\n        console.log('webrtc init');\r\n\r\n        this._peerConnection = null;\r\n        this._dataChannel = null;\r\n        this._localStream = null;\r\n        this.sendSDP = null;\r\n        this.sendICECandidate = null;\r\n        this.OnAddRemoteStreamCallback = null;\r\n        this.OnRemoveStreamCallback = null;\r\n        this.OnDataChannelOpen = null;\r\n        this.OnDataChannelMessage = null;\r\n        this.OnICEConnectionStateChanged = null;\r\n        this._connectionCount = 0;\r\n\r\n        this._ID = null;\r\n    }\r\n\r\n    SetConnectionID(id) {\r\n        this._ID = id;\r\n    }\r\n\r\n    async makeOfferAsync() {\r\n        console.log('---- make offer async called ----');\r\n        this._peerConnection = this.prepareNewConnection(true);\r\n        this._dataChannel = this.setUpDataChannel(this._peerConnection);\r\n\r\n        window.datachannel = this._dataChannel;\r\n        const offerSDP = await this._peerConnection.createOffer();\r\n        console.log('--- makeofferAsync: success to create SDP');\r\n        await this._peerConnection.setLocalDescription(offerSDP);\r\n        console.log('--- makeOfferAsync: success to set SDP');\r\n\r\n        this.sendSDP(offerSDP);\r\n    }\r\n\r\n    makeOfferWith(stream) {\r\n        this.colorStream = stream;\r\n\r\n        this._peerConnection = this.prepareNewConnection(true);\r\n        this._dataChannel = this.setUpDataChannel(this._peerConnection);\r\n        console.log(this._peerConnection);\r\n    }\r\n\r\n    sendData(bytes) {\r\n        if (this._dataChannel != null) {\r\n            this._dataChannel.send(bytes);\r\n        }\r\n    }\r\n\r\n    // getUserMediaでカメラ、マイクにアクセス\r\n    async startVideo(element) {\r\n        const self = this;\r\n        try {\r\n            self._localStream = await navigator.mediaDevices.getUserMedia({ video: { width: 480 }, audio: true });\r\n            self._playVideo(element, self._localStream);\r\n        } catch (err) {\r\n            console.error('mediaDevice.getUserMedia() error:', err);\r\n        }\r\n    }\r\n\r\n    // file capture\r\n    async startVideoCapture(element, filePath) {\r\n        const self = this;\r\n        element.src = filePath;\r\n        element.load();\r\n        element.controls = true;\r\n        try {\r\n            self._localStream = element.captureStream();\r\n            element.autoPlay = true;\r\n            console.log('local stream from file set up ok');\r\n        } catch (err) {\r\n            console.error('mediaElement.captureStream() error:', err);\r\n        }\r\n    }\r\n\r\n    //選択したカメラ、マイクをローカルストリームに設定\r\n    setSelectedVideoToLocalStream(stream) {\r\n        const self = this;\r\n        try {\r\n            self._localStream = stream;\r\n        } catch (err) {\r\n            console.error('mediaDevice.getUserMedia() error:', err);\r\n        }\r\n    }\r\n\r\n    // Videoの再生を開始する\r\n    async _playVideo(element, stream) {\r\n        element.srcObject = stream;\r\n        await element.play();\r\n    }\r\n\r\n\r\n    //MARK: WebRTC\r\n    prepareNewConnection(isOffer) {\r\n        const self = this;\r\n\r\n        const servers = {\r\n            iceServers: [\r\n                { url: \"stun:stun.1.google.com:19302\" }\r\n            ]\r\n        };\r\n        const peer = new RTCPeerConnection(servers);\r\n\r\n        peer.onicecandidate = function (evt) {\r\n            if (evt.candidate) {\r\n                self.sendICECandidate(evt.candidate);\r\n            } else {\r\n                console.log('empty ice event');\r\n            }\r\n        };\r\n\r\n        // ICEのステータスが変更になったときの処理\r\n        peer.oniceconnectionstatechange = function () {\r\n            console.log('ICE connection Status has changed to ' + peer.iceConnectionState);\r\n            // cheking \r\n            // connected\r\n            // completed\r\n\r\n            switch (peer.iceConnectionState) {\r\n                case 'closed':\r\n                case 'connected':\r\n                    console.log('peerconnection connection established!!');\r\n                case 'failed':\r\n                    // ICEのステートが切断状態または異常状態になったら切断処理を実行する\r\n                    if (this._peerConnection) {\r\n                        this.hangUp();\r\n                    }\r\n                    break;\r\n                case 'dissconnected':\r\n                    break;\r\n            }\r\n\r\n            if (self.OnICEConnectionStateChanged != null) {\r\n                self.OnICEConnectionStateChanged(peer.iceConnectionState);\r\n            }\r\n        };\r\n\r\n        peer.ondatachannel = function (ev) {\r\n            console.log('Data channel is created!');\r\n            ev.channel.onopen = function () {\r\n                console.log('Data channel is open and ready to be used.');\r\n\r\n                if (self.OnDataChannelOpen != null) {\r\n                    self.OnDataChannelOpen();\r\n                }\r\n            };\r\n            ev.channel.onmessage = function (message) {\r\n                if (self.OnDataChannelMessage != null) {\r\n                    self.OnDataChannelMessage(message);\r\n                }\r\n            }\r\n            self._dataChannel = ev.channel;\r\n\r\n        };\r\n\r\n        peer.onnegotiationneeded = function () {\r\n            // add track したら呼ばれる\r\n            console.log('--- on negotiatioinneede ---');\r\n        }\r\n\r\n        peer.onsignalingstatechange = function (event) {\r\n            console.log('==== onsignailingstate change ====', peer.signalingState);\r\n        };\r\n\r\n        peer.onaddstream = function (event) {\r\n            console.log('got remote stream');\r\n\r\n            if (self.OnAddRemoteStreamCallback != null) {\r\n                self.OnAddRemoteStreamCallback(event.stream, self._connectionCount);\r\n            }\r\n            self._connectionCount++;\r\n        }\r\n\r\n        peer.onremovestream = function (event) {\r\n            console.log('stream removed: ', event.stream);\r\n            if (self.OnRemoveStreamCallback != null) {\r\n                self.OnRemoveStreamCallback(event.stream);\r\n            }\r\n        }\r\n\r\n        // ローカルのMediaStreamを利用できるようにする\r\n        if (self._localStream) {\r\n            console.log('Adding local stream...');\r\n            // peer.addStream(this._localStream);\r\n        } else {\r\n            // with data channnel\r\n            console.warn('no local stream, but continue.');\r\n        }\r\n\r\n        console.log(\"new peer connection created\");\r\n        return peer;\r\n    }\r\n\r\n    setUpDataChannel(peerConnection) {\r\n        const self = this;\r\n\r\n        const datachannel = peerConnection.createDataChannel('browser00', {\r\n            maxRetransmits: 0,\r\n            ordered: false,\r\n            reliable: false\r\n        });\r\n        datachannel.binaryType = \"arraybuffer\";\r\n\r\n        //MARK: datacahnnel callbacks\r\n        datachannel.onerror = function (error) {\r\n            console.log(\"Data Channel Error:\", error);\r\n        };\r\n\r\n        datachannel.onmessage = function (event) {\r\n            // console.log(\"Got Data Channel Message:\", event.data);\r\n            if (self.OnDataChannelMessage != null) {\r\n                self.OnDataChannelMessage(event);\r\n            }\r\n        };\r\n\r\n        datachannel.onopen = function () {\r\n            console.log('--- data channel on open ---');\r\n\r\n            if (self.OnDataChannelOpen != null) {\r\n                self.OnDataChannelOpen();\r\n            }\r\n        };\r\n\r\n        datachannel.onclose = function () {\r\n            console.log(\"The Data Channel is Closed\");\r\n        };\r\n\r\n        console.log('created data channel');\r\n        return datachannel;\r\n    }\r\n\r\n    async makeAnswerAsync() {\r\n        console.log('sending Answer. Creating remote session description...');\r\n\r\n        if (!this._peerConnection) {\r\n            console.error('peerConnection NOT exist!');\r\n            return;\r\n        }\r\n\r\n        try {\r\n            const answerSDP = await this._peerConnection.createAnswer();\r\n            await this._peerConnection.setLocalDescription(answerSDP);\r\n            this.sendSDP(answerSDP);\r\n        } catch (error) {\r\n            console.log('makeanswerasync errror');\r\n            console.log(error);\r\n        }\r\n\r\n    }\r\n\r\n    async setOfferAsync(sessionDescription) {\r\n        if (this._peerConnection) {\r\n            console.log('peerConnection already exist!');\r\n            console.log('continue...');\r\n        } else {\r\n            this._peerConnection = this.prepareNewConnection(false);\r\n        }\r\n\r\n        console.log('message from sfu');\r\n        try {\r\n\r\n            if (this._peerConnection.signalingState == 'have-remote-offer') {\r\n                console.log('peer connection in progress');\r\n                return;\r\n            }\r\n            await this._peerConnection.setRemoteDescription(sessionDescription);\r\n            console.log('set remote offer async success...');\r\n            await this.makeAnswerAsync();\r\n            console.log('make answerasync success...');\r\n\r\n        } catch (error) {\r\n            console.log('set offer async catch error');\r\n            console.log(error);\r\n        }\r\n    }\r\n\r\n    async setAnswerAsync(sessionDescription) {\r\n        if (!this._peerConnection) {\r\n            console.error('peerConnection NOT exist!');\r\n            return;\r\n        }\r\n\r\n        try {\r\n            await this._peerConnection.setRemoteDescription(sessionDescription);\r\n            console.log('set answer async success...');\r\n        } catch (error) {\r\n            console.log('error in set Answer Async');\r\n        }\r\n    }\r\n\r\n    addIceCandidate(candidate) {\r\n        if (this._peerConnection) {\r\n            this._peerConnection.addIceCandidate(candidate);\r\n        } else {\r\n            console.error('PeerConnection not exist!');\r\n            return;\r\n        }\r\n    }\r\n\r\n    hangUp() {\r\n        if (this._peerConnection) {\r\n            if (this._peerConnection.iceConnectionState !== 'closed') {\r\n                this._peerConnection.close();\r\n                this._peerConnection = null;\r\n                this._dataChannel = null;\r\n                return;\r\n            }\r\n        }\r\n        console.log('peerConnection is closed.');\r\n    }\r\n\r\n}\r\n\r\nmodule.exports = WebRTC;\n\n//# sourceURL=webpack:///./src/webrtc-client.js?");

/***/ })

/******/ });