// ==UserScript==
// @name         Spanish Dictionary
// @namespace    http://tampermonkey.net
// @version      0.1
// @description  Bruteforce spanish dictionary automatically :)
// @author       FB
// @match        https://www.spanishdict.com/assignments/*
// @grant        none
// ==/UserScript==

var answerMap = new Map();
var waitingClick = false;
    
setInterval(() => {
    var element = document.querySelector('.G3QVUDti span');
    if (element) {
        var text = element.textContent || element.innerText;
        
        if (answerMap.get(text)) {
            const buttons = document.querySelectorAll('.MkscmpaV .PcvQaUZi');
            const searchText = answerMap.get(text); 

            // Convert NodeList to an array and use the find method to locate the button
            const foundButton = Array.from(buttons).find(button => button.textContent.trim() === searchText);

            if (foundButton) {
                console.log('Button found:', foundButton);
                foundButton.click();
            } else {
                console.log('Button not found with text:', searchText);
            }
        }

        const buttons = document.querySelectorAll('.MkscmpaV .PcvQaUZi');
        let correctAnswerButton = null;
        
        for (const button of buttons) {
            if (!button.disabled) {
                correctAnswerButton = button;
                break;
            }
        }
        
        if (correctAnswerButton && waitingClick) {
            console.log('Correct answer:', correctAnswerButton.textContent);
            answerMap.set(text, correctAnswerButton.textContent);
            correctAnswerButton.click();
            waitingClick = false;
            return;
        } else {
            console.log('No enabled (correct) button found');
        }

        // Create an array to hold the text content of each button
        if (buttons) {
            waitingClick = true;
            console.log("Click!");
            buttons[0].click();
        }
    } else {
        const explanationTextElement = document.querySelector('.qn7DEQai');

        if (explanationTextElement) {
            const explanationText = explanationTextElement.textContent;
            console.log(explanationText);
        } else {
            console.log('Text element not found');
        }
        
        // Select the input element by its ID
        const inputElement = document.getElementById('open-input-response');

        // Button is defined when it shouldn't be? Wtf spanish dict
        const answer = document.querySelector('.CoZ1OFck.QYhTg4zZ');

        if (answer) {
            console.log("Answer: " + answer.textContent);
            // TODO: If you can figure out how to submit the damn answer, LMK!
        }
    }
}, 1000);