// ==UserScript==
// @name         Quizlet Match
// @namespace    http://tampermonkey.net/
// @version      2024-03-15
// @description  Quizlet Match Solver
// @author       EJ
// @match        https://quizlet.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=quizlet.com
// @grant        none
// ==/UserScript==

var answerMap = [];
var itemID;
var element;

(function() {
    'use strict';

    var currentUrl = window.location.href;
    var urlParts = currentUrl.split('/');
    itemID = urlParts[3];

    element = document.createElement("iframe");
    element.src = "https://quizlet.com/" + itemID;
    element.id = "quiz";
    element.style.display = "none";
    document.body.appendChild(element);
    document.getElementById("quiz").onload = function () {
        var spans = document.getElementById("quiz").contentDocument.querySelectorAll(".TermText");
        answerMap = Array.from(spans).reduce((acc, cur, idx, arr) => {
            if (idx % 2 === 0) {
                acc.push([cur.textContent, arr[idx + 1].textContent]);
            }
            return acc;
        }, []);
        console.log(answerMap);
    };
})();
