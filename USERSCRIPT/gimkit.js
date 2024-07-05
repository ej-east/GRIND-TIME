// ==UserScript==
// @name         Gimkit Cheat
// @namespace    http://tampermonkey.net/
// @version      2024-07-05
// @description  Cheat for gimkit games, resends packet of correct answer
// @author       EJ
// @match        https://www.gimkit.com/join?gc=825893
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gimkit.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let socket = null;
    let lastDataSent = null;
    let dataToSend = null;

    function createIframe() {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        return iframe;
    }

    function overrideWebSocketSend() {
        const originalSend = WebSocket.prototype.send;
        WebSocket.prototype.send = function(data) {
            originalSend.call(this, data);
            lastDataSent = data;
            socket = this;
        };
    }

    function setupKeydownListener() {
        document.onkeydown = event => {
            if (event.repeat) return;

            if (event.key === ';') {
                dataToSend = lastDataSent;
                alert('Saved.');
            } else if (event.key === 'u') {
                console.log('u pressed');
                if (dataToSend) {                    
                console.log('Sending data...');
                socket.send(dataToSend);}
            }
        };
    }


    (function main() {
            createIframe();
            overrideWebSocketSend();
            setupKeydownListener();
        })();
})();