import { server } from '@/apis/utils/http'

/** 获取算法备案用户协议 */
export const getAlgorithmAgreement = (params: any) => {
  return server.get('/api/user/common/getAlgorithmAgreement', params)
}

/** 获取算法备案隐私政策 */
export const getAlgorithmPrivacy = (params: any) => {
  return server.get('/api/user/common/getAlgorithmPrivacy', params)
}
