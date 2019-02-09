const WebRTC = require('./webrtc-client');

let ws, webrtc;
let localVideoElement;
let colorCanvas, webpCanvas;
let colorImage = new Image();
let isOpen = false;
let currentBlob;
/*
let fileReader = new FileReader();

const chunk = (array, num) => {
    const chunked = [];
    for (let elm of array) {
        let last = chunked[chunked.length - 1];
        if (!last || last.length === num) {
            chunked.push([elm]);
        } else {
            last.push(elm);
        }
    }
    return chunked;
};

fileReader.onload = () => {
    var ary_u8 = new Uint8Array(fileReader.result);
    let chunked = chunk(ary_u8, 1024 * 16);
    if (isOpen) {
        for (let chunk of chunked) {
            // console.log(chunk.length);
            let result = webrtc.sendData(chunk);
            if (!result) {
                console.log('failed to send');
            }
        }
    } else {
        console.log('data channel is closed');
    }
};
*/

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
    setInterval(drawColorCanvas, 1000 / 30);
    // setInterval(drawImage, 1000 / 30);
    webpCanvas.width = 480;
    webpCanvas.height = 360;
    setInterval(readBlob, 1000 / 10);
}

const readBlob = () => {
    if (currentBlob && isOpen) {
        let offset = 0;
        const chunkSize = 16384;
        const fileReader = new FileReader();
        fileReader.addEventListener('error', error => console.error('Error reading file:', error));
        fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
        fileReader.addEventListener('load', e => {
            let result = webrtc.sendData(e.target.result);
            if (!result) {
                console.log('failed to send');
            }
            offset += e.target.result.byteLength;
            if (offset < currentBlob.size) {
                readSlice(offset);
            }
        });
        const readSlice = o => {
            // console.log('readSlice ', o);
            const slice = currentBlob.slice(offset, o + chunkSize);
            fileReader.readAsArrayBuffer(slice);
        };
        readSlice(0);
        // if (fileReader.readyState != FileReader.LOADING) {
        //     fileReader.readAsArrayBuffer(currentBlob);
        // }
    }
};

async function main() {
    webrtc = new WebRTC();
    webrtc.sendSDP = sendSDP;
    webrtc.sendICECandidate = sendICECandidate;
    webrtc.OnAddRemoteStreamCallback = OnAddRemoteStream;
    webrtc.OnRemoveStreamCallback = OnRemoveStram;
    webrtc.OnICEConnectionStateChanged = OnICEConnectionStateChanged;
    webrtc.OnDataChannelOpen = dataChannelOnOpen;
    webrtc.OnDataChannelMessage = onMessage;

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

const dataChannelOnOpen = () => {
    isOpen = true;
};

const dataChannelOnClose = () => {
    isOpen = false;
}

const drawColorCanvas = () => {
    colorCanvas.width = localVideoElement.videoWidth;
    colorCanvas.height = localVideoElement.videoHeight;

    colorCanvas.getContext("2d").drawImage(localVideoElement, 0, 0, localVideoElement.videoWidth, localVideoElement.videoHeight);


    colorCanvas.toBlob((blob) => {
        if (blob) {
            currentBlob = blob
        }
    }, "image/webp", 1);


};

const onMessage = (message) => {
    console.log(message);
};

// const drawImage = () => {
//     webpCanvas.getContext("2d").drawImage(colorImage, 0, 0);
// };

const sendSDP = function (sessionDescription) {
    const message = JSON.stringify(sessionDescription);
    ws.send(message);
}

const sendICECandidate = function (candidate) {
    const message = {
        type: "candidate",
        ice: candidate
    }
    ws.send(JSON.stringify(message));
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
        const message = JSON.parse(evt.data);
        console.log('recieved message: ' + message.type);
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
