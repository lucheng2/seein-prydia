import { server } from '@/apis/utils/http'

export const getTestServer = (params?: any) => {
  return server.post('/api/user/counselorsAdmin/findCounselor', params)
}
