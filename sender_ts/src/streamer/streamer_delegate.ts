export interface StreamerDelegate {
    readStart(totalLength: number): void
    readDone(): void
    readBytes(chunk: ArrayBuffer): void
}