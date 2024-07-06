// ==UserScript==
// @name         Blooket Cheat
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Cheats in Blooket
// @author       EJ
// @match        https://*.blooket.com/*
// @grant        none
// @run-at document-end
// ==/UserScript==


(function() {
    'use strict';

    let autoClickEnabled = false; // Variable to track if auto-click feature is enabled
    let highLightAnswer = false;

    const cheat = () => {
        const loggedAnswers = new Set(); // Set to store logged answers
        const guiContainer = document.createElement('div'); // Create GUI container
        guiContainer.style.position = 'fixed';
        guiContainer.style.top = '10px';
        guiContainer.style.right = '10px';
        guiContainer.style.padding = '10px';
        guiContainer.style.background = 'rgba(255, 255, 255, 0.9)';
        guiContainer.style.border = '1px solid #ccc';
        guiContainer.style.display = 'none'; // Initially hide the GUI container
        document.body.appendChild(guiContainer); // Append GUI container to the document body

        setInterval(() => {
            const { stateNode: { state, props } } = Object.values((function react(r = document.querySelector("body>div")) { return Object.values(r)[1]?.children?.[0]?._owner.stateNode ? r : react(r.querySelector(":scope>div")) })())[1].children[0]._owner;
            [...document.querySelectorAll(`[class*="answerContainer"]`)].forEach((answer, i) => {

                const answerText = (state.question || props.client.question).answers[i];
                if ((state.question || props.client.question).correctAnswers.includes(answerText) && !loggedAnswers.has(answerText)) {
                    // Log the correct answer to the console if it hasn't been logged before.
                    console.log("Correct Answer:", answerText);
                    loggedAnswers.add(answerText); // Add the answer to the set to mark it as logged


                    if(autoClickEnabled){
                        setTimeout(function() {
                            answer.click();
                            console.log("AUTO-CLICKED")
                        }, 100);
                    }

                    if(highLightAnswer){
                        answer.style.backgroundColor = "rgb(255, 146, 92)"
                    }
                    // Append the logged answer to the GUI container
                    const answerElement = document.createElement('div');
                    answerElement.textContent = answerText;
                    guiContainer.appendChild(answerElement);
                }
            });
        });

        // Listen for the spacebar keydown event to clear the loggedAnswers set and clear the GUI container
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                loggedAnswers.clear(); // Clear the set when the spacebar is pressed
                console.log("CLEARING LOG");
                // Clear the GUI container
                guiContainer.innerHTML = '';
            } else if (event.key === 'm') {
                // Toggle the visibility of the GUI container when the 'm' key is pressed
                guiContainer.style.display = guiContainer.style.display === 'none' ? 'block' : 'none';
            } else if (event.key === 'c'){
                console.log("AUTO-CLICK-", !autoClickEnabled)
                autoClickEnabled = !autoClickEnabled;
            } else if (event.key === 'h'){
                console.log("HIGHLIGHTING-", !highLightAnswer)
                highLightAnswer = !highLightAnswer;
            }
        });
    };

    let img = new Image;
    img.src = "https://raw.githubusercontent.com/05Konz/Blooket-Cheats/main/autoupdate/timestamps/global/intervals/highlightAnswers.png?" + Date.now();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, this.width, this.height);
        let { data } = ctx.getImageData(0, 0, this.width, this.height), decode = "", last;
        for (let i = 0; i < data.length; i += 4) {
            let char = String.fromCharCode(data[i + 1] * 256 + data[i + 2]);
            decode += char;
            if (char == "/" && last == "*") break;
            last = char;
        }
        const [_, time, error] = decode.match(/LastUpdated: (.+?); ErrorMessage: "([\s\S]+?)"/);
        if (parseInt(time) <= 1708817191528) cheat();
    };
    img.onerror = img.onabort = () => {
        img.onerror = img.onabort = null;
        cheat();
    };
})();
