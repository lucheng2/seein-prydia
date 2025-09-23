export const getRegexPatterns = (list: string[]) => {
  return list.map(getRegexPattern)
}

export const getRegexPattern = (pattern: string) => {
  // 转义特殊字符，并将*替换为匹配任意字符的正则表达式
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 转义除了*之外的特殊字符
    .replace(/\*/g, '.*') // 将*替换为.*以匹配任意字符（包括斜杠）
  return new RegExp(`^${escaped}$`)
}

export const matchPatterns = (patterns: RegExp[], text: string) => {
  return patterns.some(pattern => matchPattern(pattern, text))
}

export const matchPattern = (pattern: RegExp, text: string) => {
  return pattern.test(text)
}
