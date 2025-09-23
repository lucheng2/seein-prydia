// 获取协议部分
export function getFromUrl(url: string = window.location.href) {
  const regexProtocol = /^(https?)/i
  const matchProtocol = url.match(regexProtocol)

  const regexDomain = /^https?:\/\/([^/]+)/i
  const matchDomain = url.match(regexDomain)
  return [matchProtocol?.[1], matchDomain?.[1]]
}
