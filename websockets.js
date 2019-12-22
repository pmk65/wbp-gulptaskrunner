/**
 * WebSocket bridge.
 *
 * Handles communication between WeBuilder and WebSocket.
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
 *     61   function WeBuilder_OnData(param_channel, param_message)
 *
 * TOTAL FUNCTIONS: 1
 * (This index is automatically created/updated by the WeBuilder plugin "DocBlock Comments")
 *
 */

var channel;

// Create a new WebSocket object.
var ws = new WebSocket("ws://localhost:8080");

// Events
ws.onopen = function(e) {
    var params = {
        cmd : 'open',
        msg : 'Socket connection opened\n'
    };
    WeBuilderData.SendNative(channel, JSON.stringify(params), '');
};

ws.onclose = function(e) {
    var params = {
        cmd : 'close',
        msg : 'Socket connection closed\n'
    };
    WeBuilderData.SendNative(channel, JSON.stringify(params), '');
};

ws.onmessage = function(e) {
    var data = JSON.parse(e.data);
    WeBuilderData.SendNative(channel, JSON.stringify(data), '');
};

ws.onerror = function(e) {
    // Not sure what might get returned here
    var data = JSON.parse(e.data);
    WeBuilderData.SendNative(channel, JSON.stringify(data), '');
};

window.onbeforeunload = function(e) {
    ws.close();
};

WeBuilder_OnData = function(param_channel, param_message) {
    channel = param_channel;
    if (param_message !== "") {
        ws.send(param_message); //send method
    }
};
