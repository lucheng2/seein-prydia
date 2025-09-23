export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const logResponse = (url: string, opts: any, data: any) => {
  if (['dev', 'localhost'].includes(import.meta.env.VITE_NODE_ENV) || import.meta.server) {
    console.table({
      url,
      method: opts.method,
      statusCode: data.code,
      msg: data.message || data.msg,
    })
  }
}
