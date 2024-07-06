// ==UserScript==
// @name         Gimkit Cheat
// @namespace    http://tampermonkey.net/
// @version      2024-07-05
// @description  Cheat for gimkit games, resends packet of correct answer
// @author       EJ
// @match        https://www.gimkit.com/join*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gimkit.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let socket = null;
    let lastDataSent = null;
    let dataToSend = null;
    let autoSendInterval = null;
    let packetSpeed = 1000;

    function createUI() {
        const uiContainer = document.createElement('div');
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '10px';
        uiContainer.style.right = '10px';
        uiContainer.style.backgroundColor = 'white';
        uiContainer.style.padding = '10px';
        uiContainer.style.border = '1px solid black';
        uiContainer.style.zIndex = '9999';

        uiContainer.innerHTML = `
            <button id="savePacketButton">Save Last Packet</button>
            <button id="sendPacketButton">Send Saved Packet</button>
            <input type="range" id="packetSpeedSlider" min="100" max="2000" step="100" value="1000">
            <label for="packetSpeedSlider">Packet Speed (ms)</label>
            <span id="speedDisplay">Current Speed: 1000 ms</span>
            <button id="startStopAutoSendButton">Start Auto-Send</button>
        `;
        document.body.appendChild(uiContainer);
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
                console.log('Saved.');
            } else if (event.key === 'u') {
                if (dataToSend) {
                    console.log('Sending data...');
                    socket.send(dataToSend);
                }
            }
        };
    }

    function setupUIHandlers() {
        const savePacketButton = document.getElementById('savePacketButton');
        const sendPacketButton = document.getElementById('sendPacketButton');
        const packetSpeedSlider = document.getElementById('packetSpeedSlider');
        const speedDisplay = document.getElementById('speedDisplay');
        const startStopAutoSendButton = document.getElementById('startStopAutoSendButton');

        savePacketButton.addEventListener('click', () => {
            dataToSend = lastDataSent;
            console.log('Packet saved.');
        });

        sendPacketButton.addEventListener('click', () => {
            if (dataToSend) {
                console.log('Sending saved packet...');
                socket.send(dataToSend);
            }
        });

        packetSpeedSlider.addEventListener('input', (event) => {
            packetSpeed = event.target.value;
            speedDisplay.textContent = `Current Speed: ${packetSpeed} ms`;
            if (autoSendInterval) {
                clearInterval(autoSendInterval);
                autoSendInterval = setInterval(() => {
                    if (dataToSend) {
                        console.log('Automatically sending saved packet...');
                        socket.send(dataToSend);
                    }
                }, packetSpeed);
            }
            console.log(`Packet speed set to ${packetSpeed} ms`);
        });

        startStopAutoSendButton.addEventListener('click', () => {
            if (autoSendInterval) {
                clearInterval(autoSendInterval);
                autoSendInterval = null;
                startStopAutoSendButton.textContent = 'Start Auto-Send';
                console.log('Auto-send stopped.');
            } else {
                autoSendInterval = setInterval(() => {
                    if (dataToSend) {
                        console.log('Automatically sending saved packet...');
                        socket.send(dataToSend);
                    }
                }, packetSpeed);
                startStopAutoSendButton.textContent = 'Stop Auto-Send';
                console.log('Auto-send started.');
            }
        });
    }

    (function main() {
        createUI();
        overrideWebSocketSend();
        setupKeydownListener();
        setupUIHandlers();
    })();
})();