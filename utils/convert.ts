// 数组去重（适用于基本类型）
export const unique = <T extends string | number | boolean>(arr: T[]): T[] => {
  return Array.from(new Set(arr))
}

// 获取对象数组指定属性的值列表（自动去重）
export const getListKeys = <T extends Record<string, unknown>, K extends keyof T>(
  arr: T[],
  key: K,
): T[K][] => {
  const keys = arr.map(item => item[key])
  return unique(keys as (string | number | boolean)[]) as T[K][]
}

// 在对象数组中查找指定属性匹配的对象
export const getObject = <T extends Record<string, unknown>, K extends keyof T>(
  arr: T[],
  key: K,
  val: T[K],
): T | undefined => {
  return arr.find(item => item[key] === val)
}
