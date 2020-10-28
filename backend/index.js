var express = require('express')
var app = express()
var cors = require('cors')
var http = require('http').Server(app)
var socketConfig = require('./config')
var io = require('socket.io')(http, socketConfig)
const rp = require('request-promise')
var port = process.env.PORT || 8081
const API_BASE = process.env.API_BASE || 'https://api.miro.com/v1'
// require('./src/config/db');

var rooms = {}
var roomsCreatedAt = new WeakMap()
var names = new WeakMap()
var roomId
var name

app.use(cors())

/*
 * Get Board id & token from UI
 * List all team members with access to board
 * Get team user connection
 * Get current user boards
 *
 */

const oauth = {
	checkToken(token) {
		const uri = `${API_BASE}/oauth-token`
		const options = addAuth(token, {method: 'GET', uri})
		return rp(options)
			.then((response) => {
				response = JSON.parse(response)
				if (response.scopes) {
					if (
						response.scopes.indexOf('boards:read') >= 0 &&
						response.scopes.indexOf('boards:write') >= 0 &&
						response.scopes.indexOf('identity:read') >= 0
					) {
						return true
					}
				}
				return false
			})
			.catch((error) => {
				console.log(error)
				return false
			})
	},

  checkIfUserIsAuthorizedOnBoard(boardId, token){
		const uri = `${API_BASE}/boards/${boardId}`
		const options = addAuth(token, {method: 'GET', uri})
		return rp(options)
			.then((res) => {
        return true
			})
			.catch((error) => {
				return false
			})
  }
}

function addAuth(token, options) {
	options.headers = {
		Authorization: `Bearer ${token}`,
	}
	return options
}

app.use(async (req, res, next) => {
	try {
		const token = req.query
		const isAuthorized = await oauth.checkToken(token)
		if (isAuthorized) return next()
		else return next(new Error('Authorization error'))
	} catch (err) {
		return next(new Error('Authentication error'))
	}
})

app.get('/rooms/:roomId', (req, res) => {
	const {roomId} = req.params
	const room = rooms[roomId]

	if (room) {
		res.json({
			createdAt: roomsCreatedAt.get(room),
			users: Object.values(room).map((socket) => names.get(socket)),
		})
	} else {
		res.status(500).end()
	}
})

app.get('/rooms', (req, res) => {
	res.json(Object.keys(rooms))
})

io.use(async (socket, next) => {
	try {
		const token = socket.handshake.query.token
		const isAuthorized = await oauth.checkToken(token)
		if (isAuthorized) return next()
		else return next(new Error('Authorization error'))
	} catch (err) {
		return next(new Error('Authentication error'))
	}
})

io.use(async (socket, next) => {
	try {
		const {token, boardId} = socket.handshake.query
		const isAuthorized = await oauth.checkIfUserIsAuthorizedOnBoard(boardId, token)
		if (isAuthorized) return next()
		else return next(new Error('Authorization error'))
	} catch (err) {
		return next(new Error('Authentication error'))
	}
})


io.on('connection', (socket) => {
	socket.on('join', (_roomId, _id, _name, callback) => {
		if (!_roomId || !_name) {
			if (callback) {
				callback('roomId and name params required')
			}
			console.warn(`${socket.id} attempting to connect without roomId or name`, {roomId, name})
			return
		}

		roomId = _roomId
		id = _id
		name = _name

		if (rooms[roomId]) {
			rooms[roomId][socket.id] = socket
		} else {
			rooms[roomId] = {[socket.id]: socket}
			roomsCreatedAt.set(rooms[roomId], new Date())
		}
		socket.join(roomId)

		names.set(socket, name)

		io.to(roomId).emit('system message', `${name} joined ${roomId}`)

		if (callback) {
			callback(null, {success: true})
		}
	})

	socket.on('chat message', (msg, id, name) => {
		io.to(roomId).emit('chat message', msg, id, name)
	})

	socket.on('disconnect', () => {
		io.to(roomId).emit('system message', `${name} left ${roomId}`)

		delete rooms[roomId][socket.id]

		const room = rooms[roomId]
		if (!Object.keys(room).length) {
			delete rooms[roomId]
		}
	})
})

http.listen(port, '0.0.0.0', () => {
	console.log('listening on *:' + port)
})
