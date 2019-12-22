/**
 * Shell Server
 *
 * Execute shell command and streams the console output to WeBuilder
 * through asynchronous Websocket connection.
 *
 * @category  WeBuilder Plugin
 * @package   Gulp Taskrunner
 * @author    Peter Klein <pmk@io.dk>
 * @copyright 2018
 * @license   http://www.freebsd.org/copyright/license.html  BSD License
 * @version   1.0
 */

/**
 * [CLASS/FUNCTION INDEX of SCRIPT]
 *
 *     55   function sendMsg(msg)
 *
 * TOTAL FUNCTIONS: 1
 * (This index is automatically created/updated by the WeBuilder plugin "DocBlock Comments")
 *
 */

/* jshint esversion: 6 */
/* jshint node: true */
(function() {

    "use strict";

    const debugMode = false;
    const logOutput = false;
    const WebSocket = require('ws');
    const {spawn} = require('child_process');
    const wss = new WebSocket.Server({ port: 8080 });

    console.log('\x1b[32mShell Server Started ...\x1b[0m\n');

    // Extends the "console.log" function with external logging
    if (logOutput) {
        const fs = require('fs');
        const orgConsole = console.log;
        console.log = function(msg) {
            fs.appendFile("\\logs\\log.txt", msg, function(err) {
                if(err) {
                    return orgConsole(err);
                }
            });
            orgConsole(msg);
        };
    }

    wss.on('connection', function connection(ws) {

        var sendMsg = function(msg) {
            msg = JSON.stringify(msg);
            ws.send(msg, function ack(error) {
                if (error !== undefined) {
                    console.log("Error sending:", error);
                }
            });
        };

        // Websocket Open
        ws.on('open', function open() {
            if (debugMode) console.log('Server connected');
        });

        // Websocket Close
        ws.on('close', function close() {
            if (debugMode) console.log('Server disconnected');
        });

        // Websocket Message
        ws.on('message', function incoming(message) {
               try {
                JSON.parse(message);
            } catch (e) {
                console.log("Error: message not JSON");
                return;
            }

            // message format: {cmd:'command',msg:'message', path:'path'}
            var data = JSON.parse(message);

            if (data.cmd == 'shutdown') {
                // Shutdown nodejs server, closing the shell
                spawn("taskkill", ["/pid", process.ppid, '/f', '/t']); // Hack. Kill parent task

            }
            else if (data.cmd == 'killtask') {
                var pid = data.msg;
                if (pid != null && process.kill(pid, 0)) {
                    sendMsg({
                        cmd : 'taskkilled',
                        msg   : '',
                        params : '',
                        pid : pid  // Used for killing running process
                    });
                    spawn("taskkill", ["/pid", pid, '/f', '/t']);
                }
            }
            else if (data.cmd == 'starttask') {
                var tmp = data.msg.split(' ');
                var task = tmp.shift();
                var params = tmp.join(' ');

                // Execute commandline command
                var exec = spawn(
                    task,
                    [params],
                    {
                        shell: true,
                        detached: false,
                        cwd: data.path
                    }
                );

                // Return task start message
                sendMsg({
                    cmd    : 'taskstart',
                    msg   : task,
                    params : params,
                    pid    : exec.pid  // Used for killing running process
                });

                // Return stdout stream
                exec.stdout.on('data', data => {
                    sendMsg({
                        cmd: 'stdout',
                        msg: data.toString()
                    });
                });

                // Return stderr stream
                exec.stderr.on( 'data', data => {
                    sendMsg({
                        cmd: 'stderr',
                        msg: data.toString()
                    });
                });

                exec.on( 'close', code => {
                    sendMsg({
                        cmd : 'taskend',
                        msg   : task,
                        params : params,
                        pid : exec.pid  // Used for killing running process
                    });

                });
            }
        });
    });

    wss.on('error', function connection(err) {
        console.log("Errorcode: ", err.code);
        console.log("Error message:", err.message);
    });

})();