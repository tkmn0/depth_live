export interface StreamerDelegate {
    readStart(totalLength: number): void
    readBytes(chunk: ArrayBuffer): void
}