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
    let lastPacket = null;
    let packetsToSend  = new Set;
    let autoSendInterval = null;
    let packetSpeed = 15;
    let packet = null
    const uiContainer = document.createElement('div');


    class SetCycler {
        constructor(items) {
            if (!(items instanceof Set) || items.size === 0) {
                throw new Error('A non-empty set of items is required.');
            }
            this.items = Array.from(items);
            this.index = 0;
        }
    
        getNextItem() {
            const nextItem = this.items[this.index];
            this.index = (this.index + 1) % this.items.length;
            return nextItem;
        }
    }



    let cycler = null; 

    
    function createUI() {
        uiContainer.style.position = 'fixed';
        uiContainer.style.bottom = '10px';
        uiContainer.style.right = '10px';
        uiContainer.style.backgroundColor = '#222'; 
        uiContainer.style.padding = '10px';
        uiContainer.style.border = '1px solid #444'; 
        uiContainer.style.zIndex = '9999';


        uiContainer.style.display = 'none';

        uiContainer.innerHTML = `
            <button id="savePacketButton" style="background-color: #FF925C; color: #EEE; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer; transition: background-color 0.3s ease;">Save Last Packet</button>
            <button id="sendPacketButton" style="background-color: #FF925C; color: #EEE; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer; transition: background-color 0.3s ease;">Send Saved Packet</button>
            <button id="startStopAutoSendButton" style="background-color: #50C878; color: #EEE; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer; transition: background-color 0.3s ease;">Start Auto-Send</button>
            <br>
            <input type="range" id="packetSpeedSlider" min="1" max="30" step="1" value="15" style="width: 100%; background: linear-gradient(to right, #FF925C 0%, #FF925C 50%, #333 50%, #333 100%); height: 6px; border-radius: 5px; outline: none; transition: background 0.3s ease;">
            <br>
            <span id="speedDisplay" style="color: #EEE; font-size: 14px;">Packet send every 15 seconds.</span>
        `;

        const buttons = uiContainer.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseover', () => {
                if (button.id === 'startStopAutoSendButton') {
                    if (autoSendInterval) {
                        button.style.backgroundColor = '#A8323A'; 
                    } else {
                        button.style.backgroundColor = '#40A865'; 
                    }
                } else {
                    button.style.backgroundColor = '#FF7A42'; 
                }
            });
            button.addEventListener('mouseout', () => {
                if (button.id === 'startStopAutoSendButton') {
                    if (autoSendInterval) {
                        button.style.backgroundColor = '#C41E3A'; 
                    } else {
                        button.style.backgroundColor = '#50C878'; 
                    }
                } else {
                    button.style.backgroundColor = '#FF925C';
                }
            });
        });

        const slider = uiContainer.querySelector('#packetSpeedSlider');
        slider.style.webkitAppearance = 'none';
        slider.style.appearance = 'none';

        const style = document.createElement('style');
        style.innerHTML = `
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border: 2px solid #FF925C;
                border-radius: 50%;
                background: #222;
                cursor: pointer;
                transition: background 0.3s ease, border 0.3s ease;
            }

            input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border: 2px solid #FF925C;
                border-radius: 50%;
                background: #222;
                cursor: pointer;
                transition: background 0.3s ease, border 0.3s ease;
            }

            input[type="range"]::-ms-thumb {
                width: 20px;
                height: 20px;
                border: 2px solid #FF925C;
                border-radius: 50%;
                background: #222;
                cursor: pointer;
                transition: background 0.3s ease, border 0.3s ease;
            }

            input[type="range"]:hover::-webkit-slider-thumb {
                border-color: #FF7A42;
            }

            input[type="range"]:hover::-moz-range-thumb {
                border-color: #FF7A42;
            }

            input[type="range"]:hover::-ms-thumb {
                border-color: #FF7A42;
            }
        `;
        document.head.appendChild(style);

        slider.addEventListener('input', () => {
            const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            slider.style.background = `linear-gradient(to right, #FF925C 0%, #FF925C ${value}%, #333 ${value}%, #333 100%)`;
            document.getElementById('speedDisplay').innerText = `Packet send every ${slider.value} seconds.`;
        });

        document.body.appendChild(uiContainer);
    }

    function overrideWebSocketSend() {
        const originalSend = WebSocket.prototype.send;
        WebSocket.prototype.send = function(data) {
            originalSend.call(this, data);
            lastPacket = data;
            socket = this;
        };
    }

    function setupKeydownListener() {
        document.onkeydown = event => {
            if (event.repeat) return;
            if (event.key === ';') {
                packetsToSend.add(lastPacket);
                cycler = new SetCycler(packetsToSend);
            } else if (event.key === 'u' && packetsToSend.length != 0 ) {
                packet = cycler.getNextItem()
                socket.send(packet);
            } else if (event.key === 'h'){
                if (uiContainer.style.display === 'none') {
                    uiContainer.style.display = 'block';
                } else {
                    uiContainer.style.display = 'none';
                }
            }
        };
    }

    function logMoney() {
        const divElements = document.querySelectorAll('div');
        let matchedDivs = [];
        divElements.forEach(div => {
            const style = div.getAttribute('style');
            if (style && style.includes('display: block') && style.includes('white-space: nowrap')) {
                const innerText = div.textContent.trim();
                if (innerText && (innerText[0] === '+')) {
                    packetsToSend.add(lastPacket);
                    cycler = new SetCycler(packetsToSend);
                }
            }
        });
    }

    function setupUIHandlers() {
        document.getElementById('savePacketButton').addEventListener('click', () => {
            packetsToSend.add(lastPacket);
            cycler = new SetCycler(packetsToSend);
        });

        document.getElementById('sendPacketButton').addEventListener('click', () => {
            if (packetsToSend.length != 0 ) {
                packet = cycler.getNextItem()
                socket.send(packet);
            }
        });

        document.getElementById('packetSpeedSlider').addEventListener('input', event => {
            packetSpeed = event.target.value;
            document.getElementById('speedDisplay').textContent = `Packet send every ${packetSpeed} seconds.`;
            if (autoSendInterval) {
                clearInterval(autoSendInterval);
                autoSendInterval = setInterval(() => {
                    if (packetsToSend.length != 0) {
                        packet = cycler.getNextItem()
                        socket.send(packet);
                    }
                }, packetSpeed * 1000);
            }
        });

        document.getElementById('startStopAutoSendButton').addEventListener('click', () => {
            const button = document.getElementById('startStopAutoSendButton');
            if (autoSendInterval) {
                clearInterval(autoSendInterval);
                autoSendInterval = null;
                button.textContent = 'Start Auto-Send';
                button.style.backgroundColor = '#50C878'; 
            } else {
                autoSendInterval = setInterval(() => {
                    if (packetsToSend.length != 0) {
                        packet = cycler.getNextItem()
                        socket.send(packet);
                    }
                }, packetSpeed * 1000);
                button.textContent = 'Stop Auto-Send ';
                button.style.backgroundColor = '#C41E3A'; 
            }
        });
    }

    (function main() {
        createUI();
        overrideWebSocketSend();
        setupKeydownListener();
        setupUIHandlers();


        logMoney();

        const observer = new MutationObserver(logMoney);
        observer.observe(document.body, { childList: true, subtree: true });
    })();
})();
