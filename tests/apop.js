/*

	Node.js POP3 client demo in retrieving all POP3 messages into mbox file

	Copyright (C) 2011 by Ditesh Shashikant Gathani <ditesh@gathani.org>

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

*/

var POP3Client = require("../main.js");
var     argv = require('optimist')
                .usage("Usage: $0 --host [host] --port [port] --username [username] --password [password] --debug [on/off] --networkdebug [on/off]")
                .demand(['username', 'password'])
                .argv;

var host = argv.host || "localhost";
var port = argv.port || 995;
var debug = argv.debug === "on" ? true : false;
var networkdebug = argv.networkdebug || false;
var filename = argv.filename;
var username = argv.username;
var password = argv.password;
var totalmsgcount = 0;
var currentmsg = 0;

var client = new POP3Client(port, host, true, networkdebug);

client.on("error", function(err) {

	if (err.errno === 111) console.log("Unable to connect to server");
	else console.log("Server error occurred");

	console.log(err);

});

client.on("connect", function() {

	console.log("CONNECT success");
	client.apop(username, password);

});

client.on("invalid-state", function(cmd) {
	console.log("Invalid state. You tried calling " + cmd);
});

client.on("locked", function(cmd) {
	console.log("Current command has not finished yet. You tried calling " + cmd);
});

client.on("apop", function(status, data) {

	if (status) {

		console.log("APOP success");
		client.list();

	} else {

		console.log("APOP failed");
		client.quit();

	}

});

client.on("list", function(status, msgcount, msgnumber, data, rawdata) {

	if (status === false) {

		console.log("LIST failed");
		client.quit();

	} else if (msgcount > 0) {

		totalmsgcount = msgcount;
		currentmsg = 1;
		console.log("LIST success with " + msgcount + " message(s)");
		client.retr(1);

	} else {

		console.log("LIST success with 0 message(s)");
		client.quit();

	}
});

client.on("retr", function(status, msgnumber, data, rawdata) {

	if (status === true) {

		console.log("RETR success " + msgnumber);
		currentmsg += 1;

		fs.write(fd, new Buffer(data + "\r\n\r\n"), 0, data.length+4, null, function(err, written, buffer) {
			client.quit();
		});

	} else {

		console.log("RETR failed for msgnumber " + msgnumber);
		client.quit();

	}
});

client.on("quit", function(status, rawdata) {

	if (status === true) console.log("QUIT success");
	else console.log("QUIT failed");

});