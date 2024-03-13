// ==UserScript==
// @name         Quizlet live
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Quizlet live cheat.
// @author       Hallway
// @match        https://quizlet.com/*
// @grant    GM_openInTab
// ==/UserScript==

var itemID = 0;
var openTab = false;

function getQuizletCode(code) {
    fetch(
      `https://quizlet.com/webapi/3.8/multiplayer/game-instance?gameCode=` + code
    )
      .then((e) => e.text())
      .then((res) => {
        let stuff = JSON.parse(res);
        itemID = stuff.gameInstance.itemId;
        getAnswers(itemID);
      });
}

function getAnswers() {
        // Select all the terms
        const termElements = doc.querySelectorAll('.SetPageTerms-term');
        const termsArray = [];

        termElements.forEach(termElement => {
            // Extract the term/question
            let termText = termElement.querySelector('.TermText.notranslate.lang-en').innerText.trim();

            // Extract the examples or explanation, skipping the first since it's the term itself
            const explanations = [...termElement.querySelectorAll('.TermText.notranslate.lang-en')]
                .slice(1) // Skip the first element as it's the term/question itself
                .map(explanation => explanation.innerText.trim())
                .join('; ');

            // Create an object for the term and its explanations/examples
            const termObj = {
                term: termText,
                explanations: explanations
            };

            // Add the object to the terms array
            termsArray.push(termObj);
        });
        console.log(termsJSON);
}

if (!openTab) {
    getQuizletCode("MCZN3F")
    openTab = true;
}

setInterval(() => {
    console.log(document.URL)

    const promptElement = document.querySelector('.StudentPrompt-text');
    console.log(promptElement.textContent);
}, 1000);