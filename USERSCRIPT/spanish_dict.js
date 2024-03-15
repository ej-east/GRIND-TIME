// ==UserScript==
// @name         Spanish Dictionary
// @namespace    http://tampermonkey.net
// @version      0.1
// @description  Bruteforce spanish dictionary automatically :)
// @author       Hallway
// @match        https://www.spanishdict.com/assignments/*
// @grant        none
// ==/UserScript==

var answerMap = new Map();
var waitingClick = false;

function getQuestionForGrammar() {
    // Select the unique <div> using the data-cy attribute
    var captionWrapper = document.querySelector('div[data-cy="caption-wrapper"]');

    if (!captionWrapper) {
        return 0;
    }

    // Select all <span> elements within this <div>
    var spans = captionWrapper.querySelectorAll('span');

    // Initialize an empty string to hold the combined text
    var combinedText = '';

    // Loop through each <span> to concatenate their text content
    spans.forEach(function(span) {
        combinedText += span.textContent; // Using textContent to include all text
    });


    return combinedText;
}
    
setInterval(() => {
    var element = document.querySelector('.G3QVUDti span');
    if (element) { // Multiple choice.
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
    } else if (document.querySelector(".qn7DEQai")) {  // Fill in the blank   
        // Select the input element by its ID
        const inputElement = document.getElementById('open-input-response');

        // Button is defined when it shouldn't be? Wtf spanish dict
        const answer = document.querySelector('.CoZ1OFck.QYhTg4zZ');

        if (answer) {
            console.log("Answer: " + answer.textContent);
            // TODO: If you can figure out how to submit the damn answer, LMK!
            inputElement.value = answer.textContent;
            console.log(inputElement)
        }
    } else {
        let text = getQuestionForGrammar();
        if (text == 0) return;

        // Select all buttons within this parent <div>
        // PcvQaUZi q0TlJLeN mf5fxPQ_
        var buttons = document.querySelectorAll('.PcvQaUZi.q0TlJLeN.mf5fxPQ_');
        if (!buttons) {
            // For some reason there's two different types of buttons?
            buttons = document.querySelectorAll(".PcvQaUZi.q0TlJLeN.mf5fxPQ_.w87bfdwW");
        }
        
        if (answerMap.get(text)) {
            const searchText = answerMap.get(text); 

            // Convert NodeList to an array and use the find method to locate the button
            const foundButton = Array.from(buttons).find(button => button.textContent === searchText);

            if (foundButton) {
                console.log('Button found:', foundButton);
                foundButton.click();
            } else {
                console.log('Button not found with text:', searchText);
            }
        }

        const correctAnswerText = document.querySelector(".K2qsuP8h.mlHmtCYR");

        if (correctAnswerText && waitingClick) {
            console.log('Correct answer:', correctAnswerText.textContent);
            answerMap.set(text, correctAnswerText.textContent);
            document.querySelector(".mf5fxPQ_.Qqw5ILQp").click();
            waitingClick = false;
            return;
        } else {
            console.log(waitingClick);
            console.log('No enabled (correct) button found');
        }

        // Create an array to hold the text content of each button
        if (buttons) {
            waitingClick = true;
            console.log("Click!");
            buttons[0].click();
        }
    }
}, 50);