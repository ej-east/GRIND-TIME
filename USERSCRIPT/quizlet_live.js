// ==UserScript==
// @name         Quizlet live
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Quizlet live cheat.
// @author       Hallway && .5 Elijah
// @match        https://quizlet.com/live/*
// @grant    GM_openInTab
// @grant    GM_setValue
// ==/UserScript==

var itemID = 0;
var hasCode = false;
var gameCode = ""
var openTab = false;
var autoAnswer = false;
var turboMode = false;
let answerMap = {}

function getQuizletCode(code) {
    fetch(
      `https://quizlet.com/webapi/3.8/multiplayer/game-instance?gameCode=` + code
    )
      .then((e) => e.text())
      .then((res) => {
        let stuff = JSON.parse(res);
        console.log(stuff);
        itemID = stuff.gameInstance.itemId;
        element = document.createElement("iframe");
        element.src = "https://quizlet.com/" + itemID;
        element.id = "quiz";
        element.style.display = "none";
        document.body.appendChild(element);
        document.getElementById("quiz").onload = function () {
            var spans = document.getElementById("quiz").contentDocument.querySelectorAll(".TermText");
            answerMap = {}; // Use an object instead of a Map
            Array.from(spans).forEach((cur, idx, arr) => {
                if (idx % 2 === 0) {
                    answerMap[cur.textContent] = arr[idx + 1].textContent;
                }
            });
            console.log(answerMap);
        };
    });
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

setInterval(() => {
    var gameCodeInputs = document.querySelectorAll('input[aria-label="Game code"]');

    // Initialize a variable to hold the full game code
    var fullGameCode = '';

    if (gameCodeInputs && (!this.gameCode || this.gameCode.length != 6)) {
        // Loop through each input element and concatenate its value
        gameCodeInputs.forEach(function(input) {
            fullGameCode += input.value;
        });

        this.gameCode = fullGameCode;
        if (this.gameCode.length == 6) {
          hasCode = true;
          getQuizletCode(this.gameCode);
        }
    }

    // Quizlet made our jobs easier and gave us the code instead!
    if (!this.gameCode) {
        const container = document.querySelector('.cgk9vo'); // Select the container with the given class

        if (!container) return;
        const inputElements = container.querySelectorAll('input'); // Select all input elements within that container

        let extractedText = '';
        inputElements.forEach(input => {
            extractedText += input.value; // Concatenate the value of each input to the string
        });

        this.gameCode = extractedText;
        getQuizletCode(this.gameCode);
    }


    if (answerMap.length != 0) {
        const promptElement = document.querySelector('.FormattedText');
        
        if (promptElement) {
            var answer = answerMap[promptElement.textContent];

            // This is indeed a very rare moment when the teacher decides to switch the terms around. We have to reverse the lookup. Performance go BRRRRRRRRRRR
            if (!answer) {
                answer = getKeyByValue(answerMap, promptElement.textContent);
            }

            if (answer) {
                const parentDiv = document.querySelector('.a97mxkn');

                const textElements = parentDiv.querySelectorAll('.ajx7e1m');
                // Loop through each element
                textElements.forEach(function(option) {
                    if (option.textContent == answer) {
                        option.style.color = "rgb(255, 146, 92)"
                        if (autoAnswer) {
                            option.click();
                        }
                    }
                });
            }
        }
    }
}, 50); // Run every 50 ms for slow computers.

document.addEventListener('keydown', (event) => {
    if (event.key === 'c') {
        autoAnswer = !autoAnswer;
    }
    if (event.key === "t") {
        // TODO: Add turbo mode?
        turboMode = !turboMode;
    }
  });