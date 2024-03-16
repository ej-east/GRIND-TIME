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

var colors = ["#FF0000", "#FF6600", "#FFFF00", "#00FF00", "#00FFFF", "#0033FF", "#CC00FF", "#6E0DD0", "#C0C0C0", "#FFFFFF", "#A52A2A", "#F6CFFF", "#CFD9FF", "#FBFFA3", "#FFD1A3", "#710000", "#FF1493", "#8A2BE2", "#7FFF00", "#FF4500", "#191970"];

var answerMap = [];
var itemID;
var element;
var usedColors = [];

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
        answerMap.forEach(element => {
            findTextInHTML(element[0], element[1]);
        });
    };

    function findTextInHTML(one, two) {
        var elements = document.querySelectorAll('div.tqy0hun .FormattedText'); // Select elements with class "FormattedText" inside divs with class "tqy0hun"
        var colorIndex = -1; // Initialize color index
        for (var i = 0; i < colors.length; i++) {
            if (!usedColors.includes(i)) {
                colorIndex = i;
                usedColors.push(i); // Mark color as used
                break;
            }
        }
        if (colorIndex !== -1) {
            elements.forEach(function(element) {
                var text = element.textContent.trim();

                if (one.length > 100) {
                    one = one.slice(0, 100);
                } 
                if (two.length > 100) {
                    two = two.slice(0, 100);
                }
                
                // Check the sliced text content of the element against 'one' and 'two'
                if (text.includes(one) || text.includes(two)) {
                    element.style.backgroundColor = colors[colorIndex];
                }
            });
        }
    }
    


})();
