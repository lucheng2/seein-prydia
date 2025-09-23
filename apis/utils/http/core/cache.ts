import type { RequestConfig } from '../types'

interface CacheItem<T> {
    data: T;
    expires: number;
}

export class CacheManager {
    private storage: Map<string, CacheItem<any>>
    private prefix: string

    constructor(prefix: string = 'axios_cache_') {
        this.storage = new Map()
        this.prefix = prefix
    }

    private generateKey(config: RequestConfig): string {
        const { url, method, params, data } = config
        const key = [url, method, JSON.stringify(params), JSON.stringify(data)].join('&')
        return this.prefix + key
    }

    set<T>(config: RequestConfig, data: T, ttl: number): void {
        const key = this.generateKey(config)
        const expires = Date.now() + ttl
        this.storage.set(key, { data, expires })
    }

    get<T>(config: RequestConfig): T | null {
        const key = this.generateKey(config)
        const item = this.storage.get(key)

        if (!item) return null

        if (Date.now() > item.expires) {
            this.storage.delete(key)
            return null
        }

        return item.data
    }

    delete(config: RequestConfig): void {
        const key = this.generateKey(config)
        this.storage.delete(key)
    }

    clear(): void {
        this.storage.clear()
    }
}

export const cacheManager = new CacheManager()