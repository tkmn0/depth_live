export class StreamMessage {

    private _start: Uint8Array
    private _done: Uint8Array

    constructor() {
        this._start = new Uint8Array(1);
        this._start[0] = -1;
        this._done = new Uint8Array(1);
        this._done[0] = -2;
    }

    start = (): ArrayBuffer => {
        return this._start.buffer;
    };

    done = (): ArrayBuffer => {
        return this._done.buffer;
    };
}