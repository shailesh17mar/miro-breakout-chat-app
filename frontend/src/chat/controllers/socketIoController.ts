import io from 'socket.io-client'

import {CHAT_HOST, CHAT_OPTIONS} from '../../config'

import type {ChatSettings, ChatController, User} from '../interfaces/chat'

const initChat = ({roomId, user, messageHandler, token, boardId}: ChatSettings) => {

  const socket = io(CHAT_HOST, {...CHAT_OPTIONS, query:{token, boardId}});
  socket.emit('join', roomId, user.id, user.name, () => {})

  if(!socket.connected){
    socket.on('connect', () => {
      socket.emit('join', roomId, user.id, user.name, () => {})
    });
  }

    socket.on('chat message', messageHandler)
		return {
      sendMessage: (msg: string, user: User) => {
        socket.emit('chat message', msg, user.id, user.name, () => {})
      },
	} as ChatController
}

export default initChat
