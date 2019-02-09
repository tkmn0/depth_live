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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _websocket_client_websocket_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./websocket_client/websocket_client */ \"./src/websocket_client/websocket_client.ts\");\n/* harmony import */ var _webrtc_client_webrtc_client__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./webrtc_client/webrtc_client */ \"./src/webrtc_client/webrtc_client.ts\");\n/* harmony import */ var _util_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/util */ \"./src/util/util.ts\");\n/* harmony import */ var _signaling_signaling__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./signaling/signaling */ \"./src/signaling/signaling.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (undefined && undefined.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\n\n\n\n\nvar Main = /** @class */ (function () {\n    function Main() {\n        var _this = this;\n        this.setupEvents = function () {\n            document.getElementById('webrtcConnectButton').onclick = _this.connect;\n            document.getElementById('webrtcDisconnectButton').onclick = _this.disconnect;\n        };\n        this.connect = function () { return __awaiter(_this, void 0, void 0, function () {\n            var offer, message;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0: return [4 /*yield*/, this.webRTCClient.connect()];\n                    case 1:\n                        offer = _a.sent();\n                        message = _util_util__WEBPACK_IMPORTED_MODULE_2__[\"WebRTCUtil\"].ConvertSdpToMessage(offer);\n                        this.webSocketClient.sendMessage(message);\n                        return [2 /*return*/];\n                }\n            });\n        }); };\n        this.disconnect = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {\n            return [2 /*return*/];\n        }); }); };\n        this.setupEvents();\n        this.webSocketClient = new _websocket_client_websocket_client__WEBPACK_IMPORTED_MODULE_0__[\"WebSocketClient\"]();\n        this.webRTCClient = new _webrtc_client_webrtc_client__WEBPACK_IMPORTED_MODULE_1__[\"WebRTCClient\"]({\n            video: false,\n            audio: false,\n            data: true\n        });\n        this.signling = new _signaling_signaling__WEBPACK_IMPORTED_MODULE_3__[\"Signling\"](this.webSocketClient, this.webRTCClient);\n        this.webRTCClient.signalingDelegate = this.signling;\n        this.webSocketClient.onSignalingMessage = this.signling.onSignalingMessage;\n    }\n    return Main;\n}());\nvar main;\nwindow.onload = function () {\n    main = new Main();\n};\n\n\n//# sourceURL=webpack:///./src/main.ts?");

/***/ }),

/***/ "./src/signaling/signaling.ts":
/*!************************************!*\
  !*** ./src/signaling/signaling.ts ***!
  \************************************/
/*! exports provided: Signling */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Signling\", function() { return Signling; });\n/* harmony import */ var _util_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/util */ \"./src/util/util.ts\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (undefined && undefined.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\n\nvar Signling = /** @class */ (function () {\n    function Signling(gateway, rtc) {\n        var _this = this;\n        this.onSignalingMessage = function (message) { return __awaiter(_this, void 0, void 0, function () {\n            var _a, offerSdp, answerSdp;\n            var _this = this;\n            return __generator(this, function (_b) {\n                switch (_b.label) {\n                    case 0:\n                        _a = message.type;\n                        switch (_a) {\n                            case 'offer': return [3 /*break*/, 1];\n                            case 'answer': return [3 /*break*/, 3];\n                            case 'candidate': return [3 /*break*/, 5];\n                        }\n                        return [3 /*break*/, 7];\n                    case 1:\n                        offerSdp = _util_util__WEBPACK_IMPORTED_MODULE_0__[\"WebRTCUtil\"].ConvertMessageToSdp(message);\n                        return [4 /*yield*/, this.target.setOfferAsync(offerSdp, function (answer) {\n                                var message = _util_util__WEBPACK_IMPORTED_MODULE_0__[\"WebRTCUtil\"].ConvertSdpToMessage(answer);\n                                _this.gateway.sendMessage(message);\n                            })];\n                    case 2:\n                        _b.sent();\n                        return [3 /*break*/, 8];\n                    case 3:\n                        answerSdp = _util_util__WEBPACK_IMPORTED_MODULE_0__[\"WebRTCUtil\"].ConvertMessageToSdp(message);\n                        return [4 /*yield*/, this.target.setAnswerAsync(answerSdp)];\n                    case 4:\n                        _b.sent();\n                        return [3 /*break*/, 8];\n                    case 5: return [4 /*yield*/, this.target.addIceCandidate(message.ice)];\n                    case 6:\n                        _b.sent();\n                        return [3 /*break*/, 8];\n                    case 7:\n                        {\n                            return [3 /*break*/, 8];\n                        }\n                        _b.label = 8;\n                    case 8: return [2 /*return*/];\n                }\n            });\n        }); };\n        // WebRTCClientDelegate\n        this.didGenerateCandidate = function (candidate) {\n            var message = _util_util__WEBPACK_IMPORTED_MODULE_0__[\"WebRTCUtil\"].ConvertCandidateToMessage(candidate);\n            _this.gateway.sendMessage(message);\n        };\n        this.gateway = gateway;\n        this.target = rtc;\n    }\n    return Signling;\n}());\n\n\n\n//# sourceURL=webpack:///./src/signaling/signaling.ts?");

/***/ }),

/***/ "./src/util/util.ts":
/*!**************************!*\
  !*** ./src/util/util.ts ***!
  \**************************/
/*! exports provided: WebRTCUtil */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"WebRTCUtil\", function() { return WebRTCUtil; });\nvar WebRTCUtil = /** @class */ (function () {\n    function WebRTCUtil() {\n    }\n    WebRTCUtil.ConvertSdpToMessage = function (from) {\n        var message = {\n            type: from.type,\n            sdp: from.sdp,\n            ice: null\n        };\n        return message;\n    };\n    WebRTCUtil.ConvertMessageToSdp = function (message) {\n        var type;\n        type = message.type;\n        var sdpInit = {\n            sdp: message.sdp,\n            type: type\n        };\n        return new RTCSessionDescription(sdpInit);\n    };\n    WebRTCUtil.ConvertCandidateToMessage = function (candidate) {\n        var message = {\n            type: 'candidate',\n            ice: candidate,\n            sdp: null\n        };\n        return message;\n    };\n    return WebRTCUtil;\n}());\n\n\n\n//# sourceURL=webpack:///./src/util/util.ts?");

/***/ }),

/***/ "./src/webrtc_client/webrtc_client.ts":
/*!********************************************!*\
  !*** ./src/webrtc_client/webrtc_client.ts ***!
  \********************************************/
/*! exports provided: WebRTCClient */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"WebRTCClient\", function() { return WebRTCClient; });\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nvar __generator = (undefined && undefined.__generator) || function (thisArg, body) {\n    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;\n    return g = { next: verb(0), \"throw\": verb(1), \"return\": verb(2) }, typeof Symbol === \"function\" && (g[Symbol.iterator] = function() { return this; }), g;\n    function verb(n) { return function (v) { return step([n, v]); }; }\n    function step(op) {\n        if (f) throw new TypeError(\"Generator is already executing.\");\n        while (_) try {\n            if (f = 1, y && (t = op[0] & 2 ? y[\"return\"] : op[0] ? y[\"throw\"] || ((t = y[\"return\"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;\n            if (y = 0, t) op = [op[0] & 2, t.value];\n            switch (op[0]) {\n                case 0: case 1: t = op; break;\n                case 4: _.label++; return { value: op[1], done: false };\n                case 5: _.label++; y = op[1]; op = [0]; continue;\n                case 7: op = _.ops.pop(); _.trys.pop(); continue;\n                default:\n                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }\n                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }\n                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }\n                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }\n                    if (t[2]) _.ops.pop();\n                    _.trys.pop(); continue;\n            }\n            op = body.call(thisArg, _);\n        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }\n        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };\n    }\n};\nvar WebRTCClient = /** @class */ (function () {\n    function WebRTCClient(channels) {\n        var _this = this;\n        this.setupDataChannel = function (peer) {\n            var ch = peer.createDataChannel('data');\n            ch.binaryType = 'arraybuffer';\n            ch.onclose = function (event) { };\n            ch.onerror = function (event) { };\n            ch.onmessage = function (event) {\n                if (_this.delegate && _this.delegate.onMessageFrom) {\n                    _this.delegate.onMessageFrom(ch, event);\n                }\n            };\n            ch.onopen = function (event) {\n                console.log('data channel on open');\n            };\n            return ch;\n        };\n        this.prepareNewConnection = function () {\n            var rtcConf = {\n                iceServers: [\n                    {\n                        urls: \"stun:stun.1.google.com:19302\"\n                    }\n                ]\n            };\n            var peer = new RTCPeerConnection(rtcConf);\n            peer.onicecandidate = function (event) {\n                if (_this.signalingDelegate && _this.signalingDelegate) {\n                    _this.signalingDelegate.didGenerateCandidate(event.candidate);\n                }\n            };\n            peer.oniceconnectionstatechange = function (event) { };\n            peer.ondatachannel = function (event) {\n                _this.dataChannel = event.channel;\n                event.channel.onclose = function (event) { };\n                event.channel.onopen = function (event) {\n                    console.log('data channel on open');\n                };\n                event.channel.onclose = function (event) { };\n                event.channel.onmessage = function (messageEvent) {\n                    if (_this.delegate && _this.delegate.onMessageFrom) {\n                        _this.delegate.onMessageFrom(event.channel, messageEvent);\n                    }\n                };\n            };\n            peer.onnegotiationneeded = function () { };\n            peer.ontrack = function (event) { };\n            return peer;\n        };\n        this.makeOfferAsync = function () { return __awaiter(_this, void 0, void 0, function () {\n            var _this = this;\n            return __generator(this, function (_a) {\n                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {\n                        var offer, err_1;\n                        return __generator(this, function (_a) {\n                            switch (_a.label) {\n                                case 0:\n                                    _a.trys.push([0, 3, , 4]);\n                                    return [4 /*yield*/, this.peerConnection.createOffer()];\n                                case 1:\n                                    offer = _a.sent();\n                                    return [4 /*yield*/, this.peerConnection.setLocalDescription(offer)];\n                                case 2:\n                                    _a.sent();\n                                    resolve(new RTCSessionDescription(offer));\n                                    return [3 /*break*/, 4];\n                                case 3:\n                                    err_1 = _a.sent();\n                                    reject(err_1);\n                                    return [3 /*break*/, 4];\n                                case 4: return [2 /*return*/];\n                            }\n                        });\n                    }); })];\n            });\n        }); };\n        this.makeAnswerAsync = function () { return __awaiter(_this, void 0, void 0, function () {\n            var _this = this;\n            return __generator(this, function (_a) {\n                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {\n                        var answer, err_2;\n                        return __generator(this, function (_a) {\n                            switch (_a.label) {\n                                case 0:\n                                    if (!!this.peerConnection) return [3 /*break*/, 1];\n                                    reject('no peer connection');\n                                    return [3 /*break*/, 5];\n                                case 1:\n                                    _a.trys.push([1, 4, , 5]);\n                                    return [4 /*yield*/, this.peerConnection.createAnswer()];\n                                case 2:\n                                    answer = _a.sent();\n                                    return [4 /*yield*/, this.peerConnection.setLocalDescription(answer)];\n                                case 3:\n                                    _a.sent();\n                                    resolve(answer);\n                                    return [3 /*break*/, 5];\n                                case 4:\n                                    err_2 = _a.sent();\n                                    reject(err_2);\n                                    return [3 /*break*/, 5];\n                                case 5: return [2 /*return*/];\n                            }\n                        });\n                    }); })];\n            });\n        }); };\n        this.connect = function () {\n            if (!_this.dataChannel && _this.channels.data) {\n                // set up data\n                _this.dataChannel = _this.setupDataChannel(_this.peerConnection);\n            }\n            return _this.makeOfferAsync();\n        };\n        this.setOfferAsync = function (sdp, callback) { return __awaiter(_this, void 0, void 0, function () {\n            var answer, err_3;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        _a.trys.push([0, 3, , 4]);\n                        if (this.peerConnection.signalingState == 'have-remote-offer') {\n                            console.log('peer connection is still in progress to set remote offer');\n                        }\n                        return [4 /*yield*/, this.peerConnection.setRemoteDescription(sdp)];\n                    case 1:\n                        _a.sent();\n                        return [4 /*yield*/, this.makeAnswerAsync()];\n                    case 2:\n                        answer = _a.sent();\n                        callback(new RTCSessionDescription(answer));\n                        return [3 /*break*/, 4];\n                    case 3:\n                        err_3 = _a.sent();\n                        console.log('error to set remote offer');\n                        console.log(err_3);\n                        return [3 /*break*/, 4];\n                    case 4: return [2 /*return*/];\n                }\n            });\n        }); };\n        this.setAnswerAsync = function (sdp) { return __awaiter(_this, void 0, void 0, function () {\n            var err_4;\n            return __generator(this, function (_a) {\n                switch (_a.label) {\n                    case 0:\n                        if (!this.peerConnection) {\n                            console.error('peerConnection NOT exist!');\n                            return [2 /*return*/];\n                        }\n                        _a.label = 1;\n                    case 1:\n                        _a.trys.push([1, 3, , 4]);\n                        return [4 /*yield*/, this.peerConnection.setRemoteDescription(sdp)];\n                    case 2:\n                        _a.sent();\n                        console.log('set answer async success...');\n                        return [3 /*break*/, 4];\n                    case 3:\n                        err_4 = _a.sent();\n                        console.log(err_4);\n                        return [3 /*break*/, 4];\n                    case 4: return [2 /*return*/];\n                }\n            });\n        }); };\n        this.addIceCandidate = function (candidate) {\n            if (_this.peerConnection) {\n                _this.peerConnection.addIceCandidate(candidate);\n            }\n        };\n        this.channels = channels;\n        this.peerConnection = this.prepareNewConnection();\n    }\n    return WebRTCClient;\n}());\n\n\n\n//# sourceURL=webpack:///./src/webrtc_client/webrtc_client.ts?");

/***/ }),

/***/ "./src/websocket_client/websocket_client.ts":
/*!**************************************************!*\
  !*** ./src/websocket_client/websocket_client.ts ***!
  \**************************************************/
/*! exports provided: WebSocketClient */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"WebSocketClient\", function() { return WebSocketClient; });\nvar WebSocketClient = /** @class */ (function () {\n    function WebSocketClient() {\n        var _this = this;\n        this.socket = null;\n        this.tryToConnect = function () {\n            if (_this.socket) {\n                return;\n            }\n            console.log('try to connect websocket');\n            _this.socket = _this.setupWebSocket('ws://localhost:8080');\n        };\n        this.setupWebSocket = function (url) {\n            var socket = new WebSocket(url);\n            socket.onopen = function () {\n                console.log(\"websocket on open\");\n            };\n            socket.onmessage = function (event) {\n                var message = JSON.parse(event.data);\n                if (_this.onSignalingMessage) {\n                    _this.onSignalingMessage(message);\n                }\n            };\n            socket.onclose = function () {\n                _this.socket = null;\n            };\n            socket.onerror = function () {\n                _this.socket = null;\n            };\n            return socket;\n        };\n        this.sendMessage = function (message) {\n            if (_this.socket) {\n                _this.socket.send(JSON.stringify(message));\n            }\n        };\n        setInterval(this.tryToConnect, 1000);\n    }\n    return WebSocketClient;\n}());\n\n\n\n//# sourceURL=webpack:///./src/websocket_client/websocket_client.ts?");

/***/ })

/******/ });