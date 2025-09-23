/**
 * 客户端插件：预加载MP3编码库（@breezystack/lamejs）
 * 该插件确保lamejs库在应用启动时就被加载和初始化
 */
import { defineNuxtPlugin } from '#app'
import * as lamejs from '@breezystack/lamejs'

export default defineNuxtPlugin({
    name: 'lamejs-loader',
    enforce: 'pre', // 在其他插件之前运行，以确保尽早初始化
    async setup() {
        // 只在客户端加载
        if (process.client) {
            try {
                // 检查lamejs是否正确加载
                if (lamejs && typeof lamejs.Mp3Encoder === 'function') {
                    console.info('[@breezystack/lamejs] 加载成功 ✅')

                    // 将lamejs挂载到全局，以便在其他地方直接访问
                    if (typeof window !== 'undefined') {
                        // 将库对象挂载到全局
                        (window as any).lamejs = lamejs;
                        // 设置加载状态标志
                        (window as any).lamejsLoaded = true;
                    }

                    return {
                        provide: {
                            lamejsLoaded: true,
                            // 提供lamejs对象，以便在组件中通过注入使用
                            lamejs
                        }
                    }
                } else {
                    throw new Error('Mp3Encoder未定义')
                }
            } catch (error) {
                console.warn('[@breezystack/lamejs] 加载失败，MP3转换功能可能不可用 ⚠️', error)
                if (typeof window !== 'undefined') {
                    (window as any).lamejsLoaded = false;
                }
                return {
                    provide: {
                        lamejsLoaded: false,
                        lamejs: null
                    }
                }
            }
        }

        return {
            provide: {
                lamejsLoaded: false,
                lamejs: null
            }
        }
    }
})