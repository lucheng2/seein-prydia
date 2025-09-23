export const resDataIsString = (resData: any): resData is string => {
    return typeof resData === 'string'
}

export const resDataIsArrayBuffer = (resData: any): resData is ArrayBuffer => {
    return resData instanceof ArrayBuffer
}

export const resDataIsObject = (resData: any): resData is object => {
    return typeof resData === 'object'
}
