const users = new Map<string, { online: boolean }>()

export default defineWebSocketHandler({
  open(peer) {
    console.log(`[ws] open ${peer.context}`)
    // new WebSocket('ws://localhost:8080/seein/ws/chat')
    const userId = '0'
    users.set(userId, { online: true })

    const stats = ''
    peer.send({
      user: 'server',
      message: `Welcome to the server ${userId}! (Online users: ${stats.online}/${stats.total})`,
    })

    peer.subscribe('chat')
    peer.publish('chat', { user: 'server', message: `${peer} joined!` })
  },
  async message(peer, message) {
    console.log(`[ws] message ${peer} ${message.text()}`)

    if (message.text() === 'ping') {
      peer.send({ user: 'server', message: 'pong' })
      return
    }

    const _message = {
      user: 0,
      message: message.text(),
    }
    peer.send(_message) // echo back
    peer.publish('chat', _message)

    // Store message in database
    // await addMessage(userId, message.text());
  },

  close(peer, details) {
    console.log(`[ws] close ${peer}`)
  },

  error(peer, error) {
    console.log(`[ws] error ${peer}`, error)
  },

  upgrade(req) {
    return {
      headers: {
        'x-powered-by': 'cross-ws',
      },
    }
  },
})
