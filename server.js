var path = require('path');
var Koa = require('koa');
var app = new Koa();
var koaStatic = require('koa-static');
var server = require('http').createServer(app.callback());
var io = require('socket.io')(server);
var userNum = 1
app.use(koaStatic(path.join(__dirname, '/src')));

io.on('connection', function (socket) {
	console.log('server connection...')
	
	function news (msg) {
		var data = {
			userName: socket.userName,
			msg: msg,
			flag: 'others',
		}
		socket.broadcast.emit('news', data)
	}

	function addUser (name) {
		var fakerName = name && name.slice(0, 15)
		++userNum
		socket.userName = fakerName
		socket.emit('login', fakerName)
		socket.broadcast.emit('userJoined', { fakerName: fakerName, userNum: userNum })
	}

	socket.on('message', function (msg) {
		news(msg)
	})

	socket.on('addUser', function (name) {
		if (name && name.length > 14) {
			return
		} else {
			addUser(name)
		}
	})

	/** 断开连接 */
	socket.on('disconnect', function () {
		userNum--
		socket.broadcast.emit('userLeave', socket.userName + '悄悄地离开了 ..., 现有：' + userNum + '人')
	 })

});
server.listen(3000);