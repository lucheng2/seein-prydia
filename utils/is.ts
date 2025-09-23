export const isFunction = (val: any): val is Function => typeof val === 'function'

export const isObject = (val: any): val is Record<any, any> => val !== null && typeof val === 'object'

export const isString = (val: any): val is string => typeof val === 'string'

export const isSymbol = (val: any): val is symbol => typeof val === 'symbol'

export const isUndefined = (val: any): val is undefined => val === undefined

export const isNull = (val: any): val is null => val === null

export const isNumber = (val: any): val is number => typeof val === 'number'

export const isBoolean = (val: any): val is boolean => typeof val === 'boolean'

export const isPromise = (val: any): val is Promise<any> => isObject(val) && isFunction(val.then) && isFunction(val.catch)

export const isDate = (val: any): val is Date => isObject(val) && isFunction(val.getTime) && !isNaN(val.getTime())

export const isRegExp = (val: any): val is RegExp => isObject(val) && isFunction(val.test) && isFunction(val.exec) && isFunction(val.toString)

export const isSet = (val: any): val is Set<any> => isObject(val) && isFunction(val.add) && isFunction(val.delete) && isFunction(val.has)

export const isMap = (val: any): val is Map<any, any> => isObject(val) && isFunction(val.set) && isFunction(val.get) && isFunction(val.has)

export const isWeakSet = (val: any): val is WeakSet<any> => isObject(val) && isFunction(val.add) && isFunction(val.delete) && isFunction(val.has)

export const isWeakMap = (val: any): val is WeakMap<any, any> => isObject(val) && isFunction(val.set) && isFunction(val.get) && isFunction(val.has)

export const isIterator = (val: any): val is Iterator<any> => isObject(val) && isFunction(val.next) && isFunction(val.return) && isFunction(val.throw)

export const isGenerator = (val: any): val is Generator => isObject(val) && isFunction(val.next) && isFunction(val.return) && isFunction(val.throw)

export const isAsyncFunction = (val: any): val is AsyncFunction => isObject(val) && isFunction(val.then) && isFunction(val.catch) && isFunction(val[Symbol.asyncIterator])

export const isArray = (val: any): val is any[] => Array.isArray(val)
