export class MediaMTXWebRTCPublisher {
  private conf: any
  private state = 'initializing'
  private restartTimeout: number | null = null
  private pc: RTCPeerConnection | null = null
  private offerData: any = null
  private sessionUrl: string | null = null
  private queuedCandidates: RTCIceCandidate[] = []

  constructor(conf: any) {
    this.conf = conf
    this.start()
  }

  private unquoteCredential = (v: string) => JSON.parse(`"${v}"`)

  private linkToIceServers = (links: string | null) => {
    if (!links) return []

    return links.split(', ').map((link) => {
      const m = link.match(/^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i)
      if (!m) return { urls: [] }

      const ret: RTCIceServer = {
        urls: [m[1]],
      }

      if (m[3] !== undefined) {
        ret.username = this.unquoteCredential(m[3])
        ret.credential = this.unquoteCredential(m[4])
        ret.credentialType = 'password'
      }

      return ret
    })
  }

  private parseOffer = (offer: string) => {
    const ret = {
      iceUfrag: '',
      icePwd: '',
      medias: [] as string[],
    }

    for (const line of offer.split('\r\n')) {
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

  private generateSdpFragment = (od: any, candidates: RTCIceCandidate[]) => {
    const candidatesByMedia: Record<number, RTCIceCandidate[]> = {}
    for (const candidate of candidates) {
      const mid = candidate.sdpMLineIndex
      if (candidatesByMedia[mid] === undefined) {
        candidatesByMedia[mid] = []
      }
      candidatesByMedia[mid].push(candidate)
    }

    let frag = `a=ice-ufrag:${od.iceUfrag}\r\na=ice-pwd:${od.icePwd}\r\n`

    let mid = 0
    for (const media of od.medias) {
      if (candidatesByMedia[mid]) {
        frag += `m=${media}\r\na=mid:${mid}\r\n`
        for (const candidate of candidatesByMedia[mid]) {
          frag += `a=${candidate.candidate}\r\n`
        }
      }
      mid++
    }

    return frag
  }

  private setCodec = (section: string, codec: string) => {
    const lines = section.split('\r\n')
    const lines2: string[] = []
    const payloadFormats: string[] = []

    for (const line of lines) {
      if (!line.startsWith('a=rtpmap:')) {
        lines2.push(line)
      }
      else {
        if (line.toLowerCase().includes(codec.toLowerCase())) {
          payloadFormats.push(line.slice('a=rtpmap:'.length).split(' ')[0])
          lines2.push(line)
        }
      }
    }

    const lines3: string[] = []
    let firstLine = true

    for (const line of lines2) {
      if (firstLine) {
        firstLine = false
        const parts = line.split(' ').slice(0, 3)
        lines3.push([...parts, ...payloadFormats].join(' '))
      }
      else if (line.startsWith('a=fmtp:')) {
        const fmtpPayload = line.slice('a=fmtp:'.length).split(' ')[0]
        if (payloadFormats.includes(fmtpPayload)) {
          lines3.push(line)
        }
      }
      else if (line.startsWith('a=rtcp-fb:')) {
        const rtcpPayload = line.slice('a=rtcp-fb:'.length).split(' ')[0]
        if (payloadFormats.includes(rtcpPayload)) {
          lines3.push(line)
        }
      }
      else {
        lines3.push(line)
      }
    }

    return lines3.join('\r\n')
  }

  private setVideoBitrate = (section: string, bitrate: number) => {
    const lines = section.split('\r\n')
    const newLines = [...lines]

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('c=')) {
        newLines.splice(i + 1, 0, `b=TIAS:${bitrate * 1024}`)
        break
      }
    }

    return newLines.join('\r\n')
  }

  private setAudioBitrate = (section: string, bitrate: number, voice: boolean) => {
    let opusPayloadFormat = ''
    const lines = section.split('\r\n')

    for (const line of lines) {
      if (line.startsWith('a=rtpmap:') && line.toLowerCase().includes('opus/')) {
        opusPayloadFormat = line.slice('a=rtpmap:'.length).split(' ')[0]
        break
      }
    }

    if (!opusPayloadFormat) return section

    return lines.map((line) => {
      if (line.startsWith(`a=fmtp:${opusPayloadFormat} `)) {
        if (voice) {
          return `a=fmtp:${opusPayloadFormat} minptime=10;useinbandfec=1;maxaveragebitrate=${bitrate * 1024}`
        }
        else {
          return `a=fmtp:${opusPayloadFormat} maxplaybackrate=48000;stereo=1;sprop-stereo=1;maxaveragebitrate=${bitrate * 1024}`
        }
      }
      return line
    }).join('\r\n')
  }

  private editOffer = (sdp: string, videoCodec: string, audioCodec: string, audioBitrate: number, audioVoice: boolean) => {
    const sections = sdp.split('m=')

    return sections.map((section, i) => {
      if (i === 0) return section // Skip first empty section

      if (section.startsWith('video')) {
        return this.setCodec(section, videoCodec)
      }
      else if (section.startsWith('audio')) {
        const withCodec = this.setCodec(section, audioCodec)
        return this.setAudioBitrate(withCodec, audioBitrate, audioVoice)
      }
      return section
    }).join('m=')
  }

  private editAnswer = (sdp: string, videoBitrate: number) => {
    const sections = sdp.split('m=')

    return sections.map((section, i) => {
      if (i === 0) return section
      return section.startsWith('video') ? this.setVideoBitrate(section, videoBitrate) : section
    }).join('m=')
  }

  private start = () => {
    this.state = 'running'
    this.requestICEServers()
      .then(iceServers => this.setupPeerConnection(iceServers))
      .then(offer => this.sendOffer(offer))
      .then(answer => this.setAnswer(answer))
      .catch(err => this.handleError(err.toString()))
  }

  private handleError = (err: string) => {
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
      }, 2000)

      this.conf.onError?.(`${err}, retrying in 2 seconds`)
    }
    else {
      this.state = 'error'
      this.conf.onError?.(err)
    }
  }

  private requestICEServers = (): Promise<RTCIceServer[]> => {
    return fetch(this.conf.url, { method: 'OPTIONS' })
      .then(res => this.linkToIceServers(res.headers.get('Link')))
  }

  private setupPeerConnection = (iceServers: RTCIceServer[]): Promise<string> => {
    this.pc = new RTCPeerConnection({
      iceServers,
      sdpSemantics: 'unified-plan' as RTCSdpSemantics,
    })

    this.pc.onicecandidate = this.onLocalCandidate
    this.pc.onconnectionstatechange = this.onConnectionState

    this.conf.stream.getTracks().forEach((track) => {
      this.pc!.addTrack(track, this.conf.stream)
    })

    return this.pc.createOffer()
      .then((offer) => {
        return this.pc!.setLocalDescription(offer).then(() => {
          this.offerData = this.parseOffer(offer.sdp!)
          return offer.sdp!
        })
      })
  }

  private sendOffer = (offer: string): Promise<string> => {
    const editedOffer = this.editOffer(
      offer,
      this.conf.videoCodec,
      this.conf.audioCodec,
      Number.parseInt(this.conf.audioBitrate),
      this.conf.audioVoice,
    )

    return fetch(this.conf.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/sdp' },
      body: editedOffer,
    })
      .then((res) => {
        if (res.status === 201) {
          this.sessionUrl = new URL(res.headers.get('location')!, this.conf.url).toString()
          return res.text()
        }
        else if (res.status === 400) {
          return res.json().then((e) => {
            throw new Error(e.error)
          })
        }
        else {
          throw new Error(`Bad status code ${res.status}`)
        }
      })
  }

  private setAnswer = (answer: string) => {
    if (this.state !== 'running') return Promise.resolve()

    const editedAnswer = this.editAnswer(answer, Number.parseInt(this.conf.videoBitrate))

    return this.pc!.setRemoteDescription({
      type: 'answer',
      sdp: editedAnswer,
    }).then(() => {
      if (this.queuedCandidates.length > 0) {
        this.sendLocalCandidates(this.queuedCandidates)
        this.queuedCandidates = []
      }
    })
  }

  private onLocalCandidate = (evt: RTCPeerConnectionIceEvent) => {
    if (this.state !== 'running' || !evt.candidate) return

    if (this.sessionUrl) {
      this.sendLocalCandidates([evt.candidate])
    }
    else {
      this.queuedCandidates.push(evt.candidate)
    }
  }

  private sendLocalCandidates = (candidates: RTCIceCandidate[]) => {
    if (!this.sessionUrl) return

    const body = this.generateSdpFragment(this.offerData, candidates)

    fetch(this.sessionUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/trickle-ice-sdpfrag',
        'If-Match': '*',
      },
      body,
    })
      .then((res) => {
        if (res.status !== 204) {
          throw new Error(`Bad status code ${res.status}`)
        }
      })
      .catch(err => this.handleError(err.toString()))
  }

  private onConnectionState = () => {
    if (this.state !== 'running' || !this.pc) return

    if (['failed', 'closed'].includes(this.pc.connectionState)) {
      this.handleError('Peer connection closed')
    }
    else if (this.pc.connectionState === 'connected') {
      this.conf.onConnected?.()
    }
  }

  // 销毁关闭
  public destroy = () => {
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
