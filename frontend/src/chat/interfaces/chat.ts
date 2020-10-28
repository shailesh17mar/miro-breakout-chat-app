export interface Message {
	message: Array<string>
	author: string
	authorId: string
	timestamp: Date
}

export interface User {
	name: string
	id: string
}

export type MessageHandler = (msg: string, id: string, name: string) => void

export type EmitHandler = (error: any, response: any) => void

export interface ChatSettings {
	roomId: string
	user: User
	boardId: string
	token: string
	messageHandler: MessageHandler
}

export interface ChatController {
	sendMessage: (msg: string, user: User) => void
}
