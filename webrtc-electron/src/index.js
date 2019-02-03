const WebRTC = require('./webrtc-client');

let ws, webrtc;
let localVideoElement;

const State = {
    None: 'none',
    WebSocketConnected: 'ws_connected',
    WebRTCConnected: 'webrtc_connected'
}

const VieoSourceType = {
    Camera: 'camera',
    File: 'file',
    SelectCamera: 'selectcamera'
}

window.onload = function () {
    console.log('video source type:', global.videoSourceType);

    main();
    global.webrtc = webrtc;
    global.connectAsync = connectAsync;
    global.setupWS = setupWS;
    global.websocket = ws;
    global.disconnectWebRTC = DissConnect;
    global.userID = -1;
    global.setSelectedVideoToLocalStream = setSelectedVideoToLocalStream;

    ChangeSateTo(State.None);
}

async function main() {
    webrtc = new WebRTC();
    webrtc.sendSDP = sendSDP;
    webrtc.sendICECandidate = sendICECandidate;
    webrtc.OnAddRemoteStreamCallback = OnAddRemoteStream;
    webrtc.OnRemoveStreamCallback = OnRemoveStram;
    webrtc.OnICEConnectionStateChanged = OnICEConnectionStateChanged;

    switch (global.videoSourceType) {
        case VieoSourceType.Camera:
            SetVideoTag();
            await webrtc.startVideo(localVideoElement);
            break;
        case VieoSourceType.File:
            SetVideoTag();
            await webrtc.startVideoCapture(localVideoElement, global.videoFilePath);
            break;
        case VieoSourceType.SelectCamera:
            break;
    }
}

const sendSDP = function (sessionDescription) {
    // const message = JSON.stringify(sessionDescription);
    const message = JSON.stringify({ type: sessionDescription.type, sdp: sessionDescription.sdp, roomID: global.roomID, userID: global.userID, userName: global.userName });
    ws.send(message);
}

const sendICECandidate = function (candidate) {
    console.log(candidate);
    console.log('will not use candidate');
}

const OnAddRemoteStream = function (stream, id) {
    console.log("stream: ", stream.id);

    const video = document.createElement('video');
    video.id = stream.id;
    video.style.width = window.innerWidth * 0.6 + 'px';
    video.loop = true;
    video.autoplay = true;
    video.srcObject = stream;
    video.volume = 1;
    video.play();
    document.body.appendChild(video);
}

const OnRemoveStram = function (stream) {
    console.log(stream);
    const videoEl = document.getElementById(stream.id);
    document.body.removeChild(videoEl);
};

const OnICEConnectionStateChanged = (state) => {
    console.log('ice connection state: ', state);
    switch (state) {
        case 'completed':
            ChangeSateTo(State.WebRTCConnected);
            break;
        case 'closed':
            if (ws.readyState == 1) {
                ChangeSateTo(State.WebSocketConnected);
            } else {
                ChangeSateTo(State.None);
            }
            for (let video of document.getElementsByTagName('video')) {
                if (video.id != 'local') {
                    video.remove();
                }
            }

            break;
    }
};

async function connectAsync() {
    await webrtc.makeOfferAsync();
}

function SetVideoTag() {
    localVideoElement = document.createElement('video');
    localVideoElement.id = 'local';
    localVideoElement.style.width = window.innerWidth * 0.6 + 'px';
    localVideoElement.loop = true;
    localVideoElement.autoplay = true;
    document.body.appendChild(localVideoElement);
    localVideoElement.volume = 0;
}

function DissConnect() {
    webrtc.hangUp();
}

function setupWS(url) {
    console.log(url);
    ws = new WebSocket(url);

    ws.onopen = function () {
        console.log('on open');
        ChangeSateTo(State.WebSocketConnected);
    };

    ws.onmessage = async function (evt) {
        console.log('ws onmessage() data:', evt.data);
        const message = JSON.parse(evt.data);
        // console.log('recieved message: ' + message.type);
        switch (message.type) {
            case 'offer': {
                console.log('Received offer ...');
                await webrtc.setOfferAsync(message);
                break;
            }
            case 'answer': {
                console.log('Received answer ...');
                console.log(message);
                await webrtc.setAnswerAsync(message);
                break;
            }
            case 'update': {
                message.type = 'answer';
                await webrtc.setAnswerAsync(message);
            }
            case 'candidate': {
                console.log('Received ICE candidate ...');
                if (message.ice) {
                    const candidate = new RTCIceCandidate(message.ice);
                    webrtc.addIceCandidate(candidate);
                }
                break;
            }
            case 'close': {
                console.log('peer is closed ...');
                webrtc.hangUp();
                break;
            }
            default: {
                console.log("Invalid message");
                break;
            }
        }
    }
}

function setSelectedVideoToLocalStream(stream) {
    console.log("setSelectedVideoToLocalStream");
    webrtc.setSelectedVideoToLocalStream(stream);
}

const ChangeSateTo = (state) => {
    const wsurl = document.getElementById('wsurl');
    const wsConnectButton = document.getElementById('wsConnectButton');
    const webRTCConnectButton = document.getElementById('webrtcConnectButton');
    const webRTCDisconnectButton = document.getElementById('webrtcDisconnectButton');

    if (state == State.None) {
        wsurl.style.display = 'block';
        wsConnectButton.style.display = 'block';
        webRTCConnectButton.style.display = 'none';
        webRTCDisconnectButton.style.display = 'none';
    } else if (state == State.WebSocketConnected) {
        wsurl.style.display = 'none';
        wsConnectButton.style.display = 'none';
        webRTCConnectButton.style.display = 'block';
        webRTCDisconnectButton.style.display = 'none';
    } else if (state == State.WebRTCConnected) {
        wsurl.style.display = 'none';
        wsConnectButton.style.display = 'none';
        webRTCConnectButton.style.display = 'none';
        webRTCDisconnectButton.style.display = 'block';
    }

}
