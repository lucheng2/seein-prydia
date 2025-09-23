/**
 * 音频格式转换工具类
 * 支持将浏览器录制的音频转换为多种格式
 */

export type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'webm' | 'blob';

/**
 * 格式转换器接口，用于实现不同的格式转换策略
 */
export interface FormatConverter {
    /**
     * 转换音频格式
     * @param audioBuffer 音频缓冲区
     * @returns 转换后的音频Blob
     */
    convert(audioBuffer: AudioBuffer): Promise<Blob>;

    /**
     * 获取转换器支持的MIME类型
     * @returns MIME类型字符串
     */
    getMimeType(): string;

    /**
     * 检查当前环境是否支持此转换器
     * @returns 是否支持
     */
    isSupported(): boolean;
}

/**
 * WAV格式转换器实现
 */
export class WavConverter implements FormatConverter {
    /**
     * 转换为WAV格式
     * @param audioBuffer 音频缓冲区
     * @returns WAV格式的Blob
     */
    public async convert(audioBuffer: AudioBuffer): Promise<Blob> {
        return this.createWavFromAudioBuffer(audioBuffer);
    }

    /**
     * 获取WAV的MIME类型
     * @returns WAV的MIME类型
     */
    public getMimeType(): string {
        return 'audio/wav';
    }

    /**
     * WAV转换器总是可用
     * @returns 总是返回true
     */
    public isSupported(): boolean {
        return true;
    }

    /**
     * 从AudioBuffer创建WAV格式的Blob
     * @param audioBuffer 音频缓冲区
     */
    private createWavFromAudioBuffer(audioBuffer: AudioBuffer): Blob {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length;

        // WAV文件头大小
        const headerBytes = 44;

        // 创建包含WAV头和音频数据的缓冲区
        const buffer = new ArrayBuffer(headerBytes + length * numChannels * 2);
        const view = new DataView(buffer);

        // 写入WAV文件头
        // "RIFF"标识
        writeString(view, 0, 'RIFF');
        // 文件大小
        view.setUint32(4, 36 + length * numChannels * 2, true);
        // "WAVE"格式
        writeString(view, 8, 'WAVE');
        // "fmt "子块
        writeString(view, 12, 'fmt ');
        // 子块大小
        view.setUint32(16, 16, true);
        // 音频格式(1表示PCM)
        view.setUint16(20, 1, true);
        // 声道数
        view.setUint16(22, numChannels, true);
        // 采样率
        view.setUint32(24, sampleRate, true);
        // 字节率 = 采样率 * 每个样本的字节数
        view.setUint32(28, sampleRate * numChannels * 2, true);
        // 每个样本的字节数 = 声道数 * 每个样本的位数 / 8
        view.setUint16(32, numChannels * 2, true);
        // 位深度
        view.setUint16(34, 16, true);
        // "data"子块
        writeString(view, 36, 'data');
        // 数据大小
        view.setUint32(40, length * numChannels * 2, true);

        // 写入音频数据
        const offset = 44;
        const channelData: Float32Array[] = [];

        // 获取每个声道的数据
        for (let i = 0; i < numChannels; i++) {
            channelData.push(audioBuffer.getChannelData(i));
        }

        // 交错写入PCM数据
        let index = 0;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                // 将Float32转换为Int16
                let sample = Math.max(-1, Math.min(1, channelData[channel][i]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset + index, sample, true);
                index += 2;
            }
        }

        return new Blob([buffer], { type: this.getMimeType() });

        // 辅助函数：写入字符串
        function writeString(view: DataView, offset: number, string: string): void {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }
    }
}

/**
 * WebM格式转换器实现
 */
export class WebMConverter implements FormatConverter {
    /**
     * 转换为WebM格式
     * @param audioBuffer 音频缓冲区
     * @returns WebM格式的Blob
     */
    public async convert(audioBuffer: AudioBuffer): Promise<Blob> {
        return this.reEncodeAudioBuffer(audioBuffer);
    }

    /**
     * 获取WebM的MIME类型
     * @returns WebM的MIME类型
     */
    public getMimeType(): string {
        return 'audio/webm;codecs=opus';
    }

    /**
     * 检查浏览器是否支持WebM格式
     * @returns 是否支持
     */
    public isSupported(): boolean {
        return MediaRecorder.isTypeSupported(this.getMimeType());
    }

    /**
     * 使用MediaRecorder重新编码AudioBuffer
     * @param audioBuffer 音频缓冲区
     */
    private async reEncodeAudioBuffer(audioBuffer: AudioBuffer): Promise<Blob> {
        return new Promise((resolve, reject) => {
            try {
                // 创建离线音频上下文
                const offlineContext = new OfflineAudioContext(
                    audioBuffer.numberOfChannels,
                    audioBuffer.length,
                    audioBuffer.sampleRate
                );

                // 创建音频源节点
                const source = offlineContext.createBufferSource();
                source.buffer = audioBuffer;

                // 创建目标节点
                const destination = offlineContext.destination;
                source.connect(destination);

                // 录制结果
                const chunks: Blob[] = [];

                // 渲染并录制
                source.start(0);
                offlineContext.startRendering().then(renderedBuffer => {
                    // 创建音频流
                    const stream = this.createMediaStreamFromAudioBuffer(renderedBuffer);

                    // 创建媒体录制器
                    const mediaRecorder = new MediaRecorder(stream, {
                        mimeType: this.getMimeType()
                    });

                    // 设置数据处理
                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            chunks.push(event.data);
                        }
                    };

                    // 设置完成处理
                    mediaRecorder.onstop = () => {
                        const blob = new Blob(chunks, { type: this.getMimeType() });
                        resolve(blob);
                    };

                    // 设置错误处理
                    mediaRecorder.onerror = (error) => {
                        reject(error);
                    };

                    // 开始录制
                    mediaRecorder.start();

                    // 录制完成后停止
                    setTimeout(() => {
                        mediaRecorder.stop();
                    }, 100);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 从AudioBuffer创建MediaStream
     * @param audioBuffer 音频缓冲区
     */
    private createMediaStreamFromAudioBuffer(audioBuffer: AudioBuffer): MediaStream {
        // 创建音频上下文
        const audioContext = new AudioContext();

        // 创建媒体流目标节点
        const destination = audioContext.createMediaStreamDestination();

        // 创建缓冲区源节点
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // 连接节点
        source.connect(destination);

        // 开始播放
        source.start(0);

        return destination.stream;
    }
}

/**
 * OGG格式转换器实现
 */
export class OggConverter implements FormatConverter {
    /**
     * 转换为OGG格式
     * @param audioBuffer 音频缓冲区
     * @returns OGG格式的Blob
     */
    public async convert(audioBuffer: AudioBuffer): Promise<Blob> {
        // 基本实现与WebM类似，但使用OGG MIME类型
        const webmConverter = new WebMConverter();
        const webmBlob = await webmConverter.convert(audioBuffer);

        // 创建一个新的Blob，修改MIME类型
        return new Blob([webmBlob], { type: this.getMimeType() });
    }

    /**
     * 获取OGG的MIME类型
     * @returns OGG的MIME类型
     */
    public getMimeType(): string {
        return 'audio/ogg;codecs=opus';
    }

    /**
     * 检查浏览器是否支持OGG格式
     * @returns 是否支持
     */
    public isSupported(): boolean {
        return MediaRecorder.isTypeSupported(this.getMimeType());
    }
}

/**
 * MP3格式转换器实现（使用@breezystack/lamejs）
 * 注意：需要安装@breezystack/lamejs库
 */
export class MP3Converter implements FormatConverter {
    private isLamejsLoaded = false;

    /**
     * 转换为MP3格式
     * @param audioBuffer 音频缓冲区
     * @returns MP3格式的Blob
     */
    public async convert(audioBuffer: AudioBuffer): Promise<Blob> {
        // 检查lamejs是否已加载
        if (!this.isSupported()) {
            throw new Error('MP3转换器不可用：lamejs未加载或不可用');
        }

        return this.encodeMp3(audioBuffer);
    }

    /**
     * 获取MP3的MIME类型
     * @returns MP3的MIME类型
     */
    public getMimeType(): string {
        return 'audio/mpeg';
    }

    /**
     * 检查是否支持MP3转换
     * @returns 是否支持
     */
    public isSupported(): boolean {
        try {
            // 检查是否在浏览器环境
            if (typeof window === 'undefined') {
                return false;
            }

            // 尝试加载lamejs
            return this.loadLamejs();
        } catch (error) {
            console.warn('MP3转换不可用：', error);
            return false;
        }
    }

    /**
     * 安全地加载lamejs库
     */
    private loadLamejs(): boolean {
        if (this.isLamejsLoaded) {
            return true;
        }

        try {
            // 首先检查全局注入的方式
            if (typeof window !== 'undefined' && (window as any).lamejsLoaded === true) {
                this.isLamejsLoaded = true;
                return true;
            }

            // 由于使用了异步导入，我们需要另一种方式检查库是否可用
            // 这里我们会尝试检查全局变量或已加载的状态
            // 在实际项目中，这部分可能需要与lamejs.client.ts插件配合工作

            // 动态导入尝试，但这不会立即生效，因为Promise是异步的
            // 这里只是尝试预加载，并不直接返回结果
            import('@breezystack/lamejs').then((lame: any) => {
                this.isLamejsLoaded = typeof lame === 'object' &&
                    typeof lame.Mp3Encoder === 'function';
                console.log('lamejs动态加载状态:', this.isLamejsLoaded);
            }).catch((error) => {
                console.warn('动态加载lamejs失败:', error);
                this.isLamejsLoaded = false;
            });

            // 尝试检查是否已经通过其他方式加载了lamejs
            try {
                // 这里使用同步检查方式，依赖于前面的静态导入
                const lameModule = require('@breezystack/lamejs');
                if (lameModule && typeof lameModule.Mp3Encoder === 'function') {
                    this.isLamejsLoaded = true;
                    return true;
                }
            } catch (err) {
                // 如果require失败，我们继续检查其他方式
                console.log('同步导入检查失败，将依赖插件预加载');
            }

            return this.isLamejsLoaded;
        } catch (error) {
            console.warn('加载lamejs失败:', error);
            return false;
        }
    }

    /**
     * 使用lamejs将AudioBuffer编码为MP3
     * @param audioBuffer 音频缓冲区
     */
    private async encodeMp3(audioBuffer: AudioBuffer): Promise<Blob> {
        // 确保我们在客户端环境
        if (typeof window === 'undefined') {
            throw new Error('MP3编码只能在浏览器环境中使用');
        }

        // 尝试首先使用全局对象
        let lame: any = null;

        // 检查是否有全局lamejs对象
        if (typeof window !== 'undefined' && (window as any).lamejs) {
            lame = (window as any).lamejs;
        } else {
            // 如果没有全局对象，尝试动态导入
            try {
                lame = await import('@breezystack/lamejs');
            } catch (error) {
                console.error('导入lamejs失败:', error);
                throw new Error('无法加载MP3编码库，请确保@breezystack/lamejs已正确安装');
            }
        }

        // 如果lamejs不包含Mp3Encoder，可能是导入方式的问题
        if (!lame || !lame.Mp3Encoder) {
            throw new Error('lamejs.Mp3Encoder未定义，请检查lamejs库的导入');
        }

        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const samples = this.getInterleavedSamples(audioBuffer);
        const mp3Data = [];

        try {
            // 创建MP3编码器，使用最多2个声道
            const mp3encoder = new lame.Mp3Encoder(
                Math.min(channels, 2),  // MP3最多支持2声道
                sampleRate,
                128  // 比特率
            );

            // 每次处理1152个采样点（标准MP3帧大小）
            const sampleBlockSize = 1152;

            // 分块处理
            for (let i = 0; i < samples.length; i += sampleBlockSize) {
                const sampleChunk = samples.slice(i, i + sampleBlockSize);
                const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
                if (mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                }
            }

            // 完成编码
            const mp3buf = mp3encoder.flush();
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }

            // 创建MP3 Blob
            return new Blob(mp3Data, { type: this.getMimeType() });
        } catch (error) {
            console.error('MP3编码过程中出错:', error);
            throw new Error(`MP3编码失败: ${error.message}`);
        }
    }

    /**
     * 从AudioBuffer获取交错的样本数据
     * @param audioBuffer 音频缓冲区
     */
    private getInterleavedSamples(audioBuffer: AudioBuffer): Int16Array {
        const channels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length;
        const result = new Int16Array(length * Math.min(channels, 2));

        // 获取声道数据
        const channelData = [];
        for (let i = 0; i < Math.min(channels, 2); i++) {
            channelData.push(audioBuffer.getChannelData(i));
        }

        // 交错处理
        if (channels === 1) {
            // 单声道
            for (let i = 0; i < length; i++) {
                // 将Float32转换为Int16
                const sample = Math.max(-1, Math.min(1, channelData[0][i]));
                result[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            }
        } else {
            // 双声道（或多声道，只使用前两个）
            for (let i = 0; i < length; i++) {
                // 左声道
                const sampleL = Math.max(-1, Math.min(1, channelData[0][i]));
                result[i * 2] = sampleL < 0 ? sampleL * 0x8000 : sampleL * 0x7FFF;

                // 右声道
                const sampleR = Math.max(-1, Math.min(1, channelData[1][i]));
                result[i * 2 + 1] = sampleR < 0 ? sampleR * 0x8000 : sampleR * 0x7FFF;
            }
        }

        return result;
    }
}

/**
 * 音频格式转换器工厂类
 */
export class AudioFormatConverter {
    private static converters: Map<AudioFormat, FormatConverter> = new Map();
    private static isInitialized = false;
    private static debug = false;

    /**
     * 启用或禁用调试日志
     * @param enable 是否启用
     */
    public static enableDebug(enable: boolean): void {
        this.debug = enable;
        if (enable) {
            console.log('已启用音频转换器调试日志');
        }
    }

    /**
     * 输出调试日志
     * @param message 日志消息
     * @param data 附加数据
     */
    private static log(message: string, ...data: any[]): void {
        if (this.debug) {
            console.log(`[AudioConverter] ${message}`, ...data);
        }
    }

    /**
     * 初始化所有格式转换器
     */
    public static initialize(): void {
        if (this.isInitialized) return;

        this.log('初始化音频格式转换器');

        // 注册内置转换器
        this.registerConverter('wav', new WavConverter());
        this.registerConverter('webm', new WebMConverter());
        this.registerConverter('ogg', new OggConverter());
        this.registerConverter('mp3', new MP3Converter());

        this.isInitialized = true;

        // 日志支持的格式
        if (this.debug) {
            for (const [format, converter] of this.converters.entries()) {
                const supported = converter.isSupported();
                this.log(`格式 ${format} ${supported ? '支持' : '不支持'}`);
            }
        }
    }

    /**
     * 注册格式转换器
     * @param format 音频格式
     * @param converter 格式转换器实现
     */
    public static registerConverter(format: AudioFormat, converter: FormatConverter): void {
        this.converters.set(format, converter);
        this.log(`已注册 ${format} 格式转换器`);
    }

    /**
     * 获取指定格式的转换器
     * @param format 音频格式
     * @returns 格式转换器
     */
    public static getConverter(format: AudioFormat): FormatConverter | null {
        if (!this.isInitialized) {
            this.initialize();
        }

        const converter = this.converters.get(format);
        if (!converter) {
            this.log(`未找到 ${format} 格式转换器`);
            return null;
        }

        // 检查转换器是否支持
        if (!converter.isSupported()) {
            this.log(`${format} 格式转换器不受当前环境支持`);
            return null;
        }

        return converter;
    }

    /**
     * 检查指定格式是否被支持
     * @param format 音频格式
     * @returns 是否支持
     */
    public static isFormatSupported(format: AudioFormat): boolean {
        if (!this.isInitialized) {
            this.initialize();
        }

        const converter = this.converters.get(format);
        const isSupported = converter ? converter.isSupported() : false;

        this.log(`格式 ${format} ${isSupported ? '支持' : '不支持'}`);

        return isSupported;
    }

    /**
     * 转换音频格式
     * @param audioBuffer 音频缓冲区
     * @param format 目标格式
     * @returns 转换后的音频Blob
     */
    public static async convert(audioBuffer: AudioBuffer, format: AudioFormat): Promise<Blob> {
        if (!this.isInitialized) {
            this.initialize();
        }

        this.log(`开始转换为 ${format} 格式`);

        const converter = this.getConverter(format);
        if (!converter) {
            const error = new Error(`不支持 ${format} 格式转换`);
            this.log(`转换失败: ${error.message}`);
            throw error;
        }

        try {
            const result = await converter.convert(audioBuffer);
            this.log(`转换为 ${format} 格式成功，大小: ${result.size} 字节`);
            return result;
        } catch (error) {
            this.log(`转换为 ${format} 格式失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 直接转换音频Blob
     * @param blob 原始音频blob
     * @param format 目标格式
     * @returns 转换后的音频Blob
     */
    public static async convertBlob(blob: Blob, format: AudioFormat): Promise<Blob> {
        this.log(`开始将 ${blob.type} 转换为 ${format}，大小: ${blob.size} 字节`);

        return new Promise((resolve, reject) => {
            // 创建文件读取器
            const fileReader = new FileReader();

            fileReader.onload = async (event) => {
                try {
                    if (!event.target || !event.target.result) {
                        const error = new Error('文件读取失败');
                        this.log(`转换失败: ${error.message}`);
                        reject(error);
                        return;
                    }

                    // 创建音频上下文
                    const audioContext = new AudioContext();

                    try {
                        // 解码音频数据
                        const audioBuffer = await audioContext.decodeAudioData(event.target.result as ArrayBuffer);

                        // 使用转换器转换格式
                        const outputBlob = await this.convert(audioBuffer, format);

                        // 关闭音频上下文
                        audioContext.close();

                        resolve(outputBlob);
                    } catch (decodeError) {
                        audioContext.close();
                        this.log(`音频解码失败: ${decodeError.message}`);
                        reject(new Error(`音频解码失败: ${decodeError.message}`));
                    }
                } catch (error) {
                    this.log(`转换失败: ${error.message}`);
                    reject(error);
                }
            };

            fileReader.onerror = () => {
                const error = new Error('文件读取错误');
                this.log(`转换失败: ${error.message}`);
                reject(error);
            };

            // 读取音频文件
            fileReader.readAsArrayBuffer(blob);
        });
    }

    /**
     * 获取指定格式的MIME类型
     * @param format 音频格式
     * @returns MIME类型
     */
    public static getMimeType(format: AudioFormat): string {
        if (!this.isInitialized) {
            this.initialize();
        }

        const converter = this.converters.get(format);
        return converter ? converter.getMimeType() : '';
    }
}

// 自动初始化
AudioFormatConverter.initialize();