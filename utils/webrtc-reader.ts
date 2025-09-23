'use strict'

interface IceServer {
  urls: string | string[]
  username?: string
  credential?: string
  credentialType?: 'password'
}

interface OfferData {
  iceUfrag: string
  icePwd: string
  medias: string[]
}

interface MediaMTXWebRTCReaderConfig {
  url: string
  onError?: (error: string) => void
  onTrack?: (evt: RTCTrackEvent) => void
}

const supportsNonAdvertisedCodec = (codec: string, fmtp?: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const payloadType = 118
    const pc = new RTCPeerConnection({ iceServers: [] })
    const mediaType = 'audio'
    pc.addTransceiver(mediaType, { direction: 'recvonly' })
    pc.createOffer()
      .then((offer) => {
        if (offer.sdp.includes(` ${codec}`)) {
          throw new Error('already present')
        }
        const sections = offer.sdp.split(`m=${mediaType}`)
        const lines = sections[1].split('\r\n')
        lines[0] += ` ${payloadType}`
        lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} ${codec}`)
        if (fmtp !== undefined) {
          lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} ${fmtp}`)
        }
        sections[1] = lines.join('\r\n')
        offer.sdp = sections.join(`m=${mediaType}`)
        return pc.setLocalDescription(offer)
      })
      .then(() => {
        return pc.setRemoteDescription(new RTCSessionDescription({
          type: 'answer',
          sdp: `v=0\r\n`
            + `o=- 6539324223450680508 0 IN IP4 0.0.0.0\r\n`
            + `s=-\r\n`
            + `t=0 0\r\n`
            + `a=fingerprint:sha-256 0D:9F:78:15:42:B5:4B:E6:E2:94:3E:5B:37:78:E1:4B:54:59:A3:36:3A:E5:05:EB:27:EE:8F:D2:2D:41:29:25\r\n`
            + `m=${mediaType} 9 UDP/TLS/RTP/SAVPF ${payloadType}\r\n`
            + `c=IN IP4 0.0.0.0\r\n`
            + `a=ice-pwd:7c3bf4770007e7432ee4ea4d697db675\r\n`
            + `a=ice-ufrag:29e036dc\r\n`
            + `a=sendonly\r\n`
            + `a=rtcp-mux\r\n`
            + `a=rtpmap:${payloadType} ${codec}\r\n${
              fmtp !== undefined ? `a=fmtp:${payloadType} ${fmtp}\r\n` : ''}`,
        }))
      })
      .then(() => resolve(true))
      .catch(() => resolve(false))
      .finally(() => pc.close())
  })
}

const unquoteCredential = (v: string): string => {
  return JSON.parse(`"${v}"`)
}

const linkToIceServers = (links: string | null): IceServer[] => {
  return links
    ? links.split(', ').map((link) => {
        const m = link.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i)
        const ret: IceServer = {
          urls: [m![1]],
        }

        if (m![3]) {
          ret.username = unquoteCredential(m![3])
          ret.credential = unquoteCredential(m![4])
          ret.credentialType = 'password'
        }

        return ret
      })
    : []
}

const parseOffer = (sdp: string): OfferData => {
  const ret: OfferData = {
    iceUfrag: '',
    icePwd: '',
    medias: [],
  }

  for (const line of sdp.split('\r\n')) {
    if (line.startsWith('m=')) {
      ret.medias.push(line.slice('m='.length))
    }
    else if (ret.iceUfrag === '' && line.startsWith('a=ice-ufrag:')) {
      ret.iceUfrag = line.slice('a=ice-ufrag:'.length)
    }
    else if (ret.icePwd === '' && line.startsWith('a=ice-pwd:')) {
      ret.icePwd = line.slice('a=ice-pwd:'.length)
    }
  }

  return ret
}

const reservePayloadType = (payloadTypes: string[]): string => {
  for (let i = 30; i <= 127; i++) {
    if ((i <= 63 || i >= 96) && !payloadTypes.includes(i.toString())) {
      const pl = i.toString()
      payloadTypes.push(pl)
      return pl
    }
  }
  throw new Error('unable to find a free payload type')
}

const enableStereoPcmau = (payloadTypes: string[], section: string): string => {
  const lines = section.split('\r\n')

  let payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} PCMU/8000/2`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} PCMA/8000/2`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  return lines.join('\r\n')
}

const enableMultichannelOpus = (payloadTypes: string[], section: string): string => {
  const lines = section.split('\r\n')

  let payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/3`)
  lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,2,1;num_streams=2;coupled_streams=1`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/4`)
  lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,1,2,3;num_streams=2;coupled_streams=2`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/5`)
  lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,4,1,2,3;num_streams=3;coupled_streams=2`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/6`)
  lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,4,1,2,3,5;num_streams=4;coupled_streams=2`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/7`)
  lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,4,1,2,3,5,6;num_streams=4;coupled_streams=4`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} multiopus/48000/8`)
  lines.splice(lines.length - 1, 0, `a=fmtp:${payloadType} channel_mapping=0,6,1,4,5,2,3,7;num_streams=5;coupled_streams=4`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  return lines.join('\r\n')
}

const enableL16 = (payloadTypes: string[], section: string): string => {
  const lines = section.split('\r\n')

  let payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} L16/8000/2`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} L16/16000/2`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  payloadType = reservePayloadType(payloadTypes)
  lines[0] += ` ${payloadType}`
  lines.splice(lines.length - 1, 0, `a=rtpmap:${payloadType} L16/48000/2`)
  lines.splice(lines.length - 1, 0, `a=rtcp-fb:${payloadType} transport-cc`)

  return lines.join('\r\n')
}

const enableStereoOpus = (section: string): string => {
  let opusPayloadFormat = ''
  const lines = section.split('\r\n')

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('a=rtpmap:') && lines[i].toLowerCase().includes('opus/')) {
      opusPayloadFormat = lines[i].slice('a=rtpmap:'.length).split(' ')[0]
      break
    }
  }

  if (opusPayloadFormat === '') return section

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`a=fmtp:${opusPayloadFormat} `)) {
      if (!lines[i].includes('stereo')) lines[i] += ';stereo=1'
      if (!lines[i].includes('sprop-stereo')) lines[i] += ';sprop-stereo=1'
    }
  }

  return lines.join('\r\n')
}

const editOffer = (sdp: string, nonAdvertisedCodecs: string[]): string => {
  const sections = sdp.split('m=')
  const payloadTypes = sections.slice(1)
    .map(s => s.split('\r\n')[0].split(' ').slice(3))
    .reduce((prev, cur) => [...prev, ...cur], [])

  for (let i = 1; i < sections.length; i++) {
    if (sections[i].startsWith('audio')) {
      sections[i] = enableStereoOpus(sections[i])

      if (nonAdvertisedCodecs.includes('pcma/8000/2')) {
        sections[i] = enableStereoPcmau(payloadTypes, sections[i])
      }
      if (nonAdvertisedCodecs.includes('multiopus/48000/6')) {
        sections[i] = enableMultichannelOpus(payloadTypes, sections[i])
      }
      if (nonAdvertisedCodecs.includes('L16/48000/2')) {
        sections[i] = enableL16(payloadTypes, sections[i])
      }
      break
    }
  }

  return sections.join('m=')
}

const generateSdpFragment = (od: OfferData, candidates: RTCIceCandidate[]): string => {
  const candidatesByMedia: { [key: number]: RTCIceCandidate[] } = {}
  for (const candidate of candidates) {
    const mid = candidate.sdpMLineIndex ?? 0
    if (!candidatesByMedia[mid]) candidatesByMedia[mid] = []
    candidatesByMedia[mid].push(candidate)
  }

  let frag = `a=ice-ufrag:${od.iceUfrag}\r\n`
    + `a=ice-pwd:${od.icePwd}\r\n`

  let mid = 0
  for (const media of od.medias) {
    if (candidatesByMedia[mid]) {
      frag += `m=${media}\r\n`
        + `a=mid:${mid}\r\n`

      for (const candidate of candidatesByMedia[mid]) {
        frag += `a=${candidate.candidate}\r\n`
      }
    }
    mid++
  }

  return frag
}

const retryPause = 2000

export class MediaMTXWebRTCReader {
  private conf: MediaMTXWebRTCReaderConfig
  private state: 'initializing' | 'running' | 'restarting' | 'error'
  private restartTimeout: number | null
  private pc: RTCPeerConnection | null
  private offerData: OfferData | null
  private sessionUrl: string | null
  private queuedCandidates: RTCIceCandidate[]
  private nonAdvertisedCodecs: string[]

  constructor(conf: MediaMTXWebRTCReaderConfig) {
    this.conf = conf
    this.state = 'initializing'
    this.restartTimeout = null
    this.pc = null
    this.offerData = null
    this.sessionUrl = null
    this.queuedCandidates = []
    this.nonAdvertisedCodecs = []

    this.getNonAdvertisedCodecs()
      .then(() => this.start())
      .catch(err => this.handleError(err))
  }

  private handleError = (err: Error): void => {
    if (['restarting', 'error'].includes(this.state)) return

    if (this.pc) {
      this.pc.close()
      this.pc = null
    }

    this.offerData = null

    if (this.sessionUrl) {
      fetch(this.sessionUrl, { method: 'DELETE' })
      this.sessionUrl = null
    }

    this.queuedCandidates = []

    if (this.state === 'running') {
      this.state = 'restarting'
      this.restartTimeout = window.setTimeout(() => {
        this.restartTimeout = null
        this.start()
      }, retryPause)

      this.conf.onError?.(`${err.message}, retrying in some seconds`)
    }
    else {
      this.state = 'error'
      this.conf.onError?.(err.message)
    }
  }

  private getNonAdvertisedCodecs = async (): Promise<void> => {
    const codecs = await Promise.all([
      ['pcma/8000/2'],
      ['multiopus/48000/6', 'channel_mapping=0,4,1,2,3,5;num_streams=4;coupled_streams=2'],
      ['L16/48000/2'],
    ].map(([codec, fmtp]) =>
      supportsNonAdvertisedCodec(codec, fmtp).then(r => r ? codec : ''),
    ))
    this.nonAdvertisedCodecs = codecs.filter(c => c !== '')
  }

  private start = async (): Promise<void> => {
    this.state = 'running'
    try {
      const iceServers = await this.requestICEServers()
      const offer = await this.setupPeerConnection(iceServers)
      const answer = await this.sendOffer(offer)
      await this.setAnswer(answer)
    }
    catch (err) {
      this.handleError(err instanceof Error ? err : new Error(String(err)))
    }
  }

  private requestICEServers = async (): Promise<IceServer[]> => {
    const res = await fetch(this.conf.url, { method: 'OPTIONS' })
    return linkToIceServers(res.headers.get('Link'))
  }

  private setupPeerConnection = async (iceServers: IceServer[]): Promise<string> => {
    this.pc = new RTCPeerConnection({
      iceServers,
      sdpSemantics: 'unified-plan',
    } as RTCConfiguration)

    this.pc.addTransceiver('video', { direction: 'recvonly' })
    this.pc.addTransceiver('audio', { direction: 'recvonly' })

    this.pc.onicecandidate = evt => this.onLocalCandidate(evt)
    this.pc.onconnectionstatechange = () => this.onConnectionState()
    this.pc.ontrack = evt => this.conf.onTrack?.(evt)

    const offer = await this.pc.createOffer()
    offer.sdp = editOffer(offer.sdp, this.nonAdvertisedCodecs)
    this.offerData = parseOffer(offer.sdp)
    await this.pc.setLocalDescription(offer)
    return offer.sdp
  }

  private sendOffer = async (offer: string): Promise<string> => {
    const res = await fetch(this.conf.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/sdp' },
      body: offer,
    })

    if (res.status !== 201) {
      if (res.status === 400) {
        const error = await res.json()
        throw new Error(error.error)
      }
      throw new Error(`HTTP ${res.status}`)
    }

    this.sessionUrl = new URL(res.headers.get('location')!, this.conf.url).toString()
    return res.text()
  }

  private setAnswer = async (answer: string): Promise<void> => {
    if (this.state !== 'running' || !this.pc) return
    await this.pc.setRemoteDescription({ type: 'answer', sdp: answer })

    if (this.queuedCandidates.length > 0) {
      this.sendLocalCandidates(this.queuedCandidates)
      this.queuedCandidates = []
    }
  }

  private onLocalCandidate = (evt: RTCPeerConnectionIceEvent): void => {
    if (this.state !== 'running' || !evt.candidate) return

    if (this.sessionUrl) {
      this.sendLocalCandidates([evt.candidate])
    }
    else {
      this.queuedCandidates.push(evt.candidate)
    }
  }

  private sendLocalCandidates = (candidates: RTCIceCandidate[]): void => {
    if (!this.sessionUrl || !this.offerData) return

    fetch(this.sessionUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/trickle-ice-sdpfrag',
        'If-Match': '*',
      },
      body: generateSdpFragment(this.offerData, candidates),
    }).catch(err => this.handleError(err))
  }

  private onConnectionState = (): void => {
    if (this.state !== 'running' || !this.pc) return

    if (['failed', 'closed'].includes(this.pc.connectionState)) {
      this.handleError(new Error('peer connection closed'))
    }
  }

  public close = (): void => {
    if (this.restartTimeout) {
      window.clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }
    if (this.pc) {
      this.pc.close()
      this.pc = null
    }
  }
}
