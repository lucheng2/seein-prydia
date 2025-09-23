declare module '@breezystack/lamejs' {
    /**
     * MP3编码器
     */
    export class Mp3Encoder {
        /**
         * 创建MP3编码器
         * @param channels 声道数 (1=单声道, 2=立体声)
         * @param sampleRate 采样率 (例如44100)
         * @param kbps 比特率 (例如128)
         */
        constructor(channels: number, sampleRate: number, kbps: number);

        /**
         * 编码音频数据块
         * @param buffer 包含PCM音频数据的Int16Array
         * @returns Uint8Array 包含编码的MP3数据
         */
        encodeBuffer(buffer: Int16Array): Uint8Array;

        /**
         * 完成编码并返回剩余数据
         * @returns Uint8Array 包含剩余的MP3数据
         */
        flush(): Uint8Array;
    }
}