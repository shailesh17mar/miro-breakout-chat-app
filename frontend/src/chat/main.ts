import socketioControllerFactory from './controllers/socketIoController'
import Chat from './components/Chat/Chat.svelte'
import Error from './components/Error.svelte'
import type { User } from './interfaces/chat'

import {CLIENT_ID, CHAT_HOST} from '../config'

const initApp = (roomId: string, user: User,token: string, boardId: string) => {
	//get authorization
	const app = new Chat({
		target: document.body,
		props: {
			roomId,
			user,
			boardId,
			token,
			chatFactory: socketioControllerFactory,
		},
	})
}

const getCurrentUser = async () => {
	const id = await miro.currentUser.getId()
	// @ts-ignore
	const onlineUsers = await miro.board.getOnlineUsers()

	return onlineUsers.find((user) => user.id === id)
}

miro.onReady(async () => {
	const savedState = await miro.__getRuntimeState()
	const currentUser = await getCurrentUser()
	const token = await miro.getToken()
	// @ts-ignore
	const board = await miro.board.getInfo()
	const boardId = board.id

	if (savedState[CLIENT_ID]?.breakoutChatRoomId && currentUser.name) {
		initApp(savedState[CLIENT_ID]?.breakoutChatRoomId, currentUser, token, boardId)
	} else {
		const app = new Error({
			target: document.body,
		})
	}
})
