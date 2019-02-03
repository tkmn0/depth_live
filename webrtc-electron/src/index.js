const WebRTC = require('./webrtc-client');

let ws, webrtc;
let localVideoElement;
let colorCanvas, webpCanvas;
let colorImage = new Image();

const VieoSourceType = {
    Camera: 'camera',
    File: 'file',
    SelectCamera: 'selectcamera'
}

window.onload = function () {
    console.log('video source type:', window.videoSourceType);

    main();
    window.webrtc = webrtc;
    window.connectAsync = connectAsync;
    window.setupWS = setupWS;
    window.websocket = ws;
    window.disconnectWebRTC = DissConnect;
    window.userID = -1;
    window.setSelectedVideoToLocalStream = setSelectedVideoToLocalStream;
    colorCanvas = document.getElementById('colorCanvas');
    webpCanvas = document.getElementById('webpCanvas');
    setInterval(drawColorCanvas, 1000/30);
    // document.body.appendChild(colorImage);
    // colorImage.style.visibility = 'hidden';
    setInterval(drawImage, 1000/30);
    webpCanvas.width = 480;
    webpCanvas.height = 360;
}

async function main() {
    webrtc = new WebRTC();
    webrtc.sendSDP = sendSDP;
    webrtc.sendICECandidate = sendICECandidate;
    webrtc.OnAddRemoteStreamCallback = OnAddRemoteStream;
    webrtc.OnRemoveStreamCallback = OnRemoveStram;
    webrtc.OnICEConnectionStateChanged = OnICEConnectionStateChanged;

    switch (window.videoSourceType) {
        case VieoSourceType.Camera:
            SetVideoTag();
            await webrtc.startVideo(localVideoElement);
            break;
        case VieoSourceType.File:
            SetVideoTag();
            await webrtc.startVideoCapture(localVideoElement, window.videoFilePath);
            break;
        case VieoSourceType.SelectCamera:
            break;
    }
}

const drawColorCanvas = () => {
    colorCanvas.width = localVideoElement.videoWidth;
    colorCanvas.height = localVideoElement.videoHeight;

    colorCanvas.getContext("2d").drawImage(localVideoElement,0 ,0, localVideoElement.videoWidth, localVideoElement.videoHeight);

    colorCanvas.toBlob((blob) => {
        let url = window.URL.createObjectURL(blob);
        colorImage.src = url;
    }, "image/webp", 1)
};

const drawImage = () => {
    webpCanvas.getContext("2d").drawImage(colorImage, 0, 0);
};

const sendSDP = function (sessionDescription) {
    const message = JSON.stringify(sessionDescription);
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
            break;
        case 'closed':
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
    localVideoElement.style.visibility = 'hidden';
}

function DissConnect() {
    webrtc.hangUp();
}

function setupWS(url) {
    console.log(url);
    ws = new WebSocket(url);

    ws.onopen = function () {
        console.log('on open');
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
