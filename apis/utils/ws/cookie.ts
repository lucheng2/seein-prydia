export class CookieManager {
  defaultDomain: string
  defaultPath: string
  constructor(domain = '', path = '/') {
    this.defaultDomain = domain
    this.defaultPath = path
  }

  // 设置单个 Cookie
  setCookie(name, value, options: any = {}) {
    let cookieString = `${name}=${encodeURIComponent(value)}`

    cookieString += `; path=${options.path || this.defaultPath}`
    if (options.domain || this.defaultDomain) {
      cookieString += `; domain=${options.domain || this.defaultDomain}`
    }
    if (options.maxAge) cookieString += `; max-age=${options.maxAge}`
    if (options.expires) cookieString += `; expires=${options.expires.toUTCString()}`
    if (options.secure) cookieString += '; Secure'
    if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`

    document.cookie = cookieString
  }

  // 批量设置多个 Cookie
  setMultipleCookies(cookieArray) {
    cookieArray.forEach((cookie) => {
      this.setCookie(cookie.name, cookie.value, cookie.options || {})
    })
  }

  // 获取所有 Cookie
  getAllCookies() {
    const cookies = {}
    document.cookie.split(';').forEach((cookie) => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        cookies[name] = decodeURIComponent(value)
      }
    })
    return cookies
  }

  // 删除 Cookie
  deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}
