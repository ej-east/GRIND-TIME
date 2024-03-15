// ==UserScript==
// @name         Quizlet live
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Quizlet live cheat.
// @author       Hallway
// @match        https://quizlet.com/*
// @grant    GM_openInTab
// @grant    GM_setValue
// ==/UserScript==

var itemID = 0;
var hasCode = false;
var openTab = false;
var answerMap = []

function getQuizletCode(code) {
    fetch(
      `https://quizlet.com/webapi/3.8/multiplayer/game-instance?gameCode=` + code
    )
      .then((e) => e.text())
      .then((res) => {
        let stuff = JSON.parse(res);
        itemID = stuff.gameInstance.itemId;
        element = document.createElement("iframe");
        element.src = "https://quizlet.com/" + itemID;
        element.id = "quiz";
        element.style.display = "none";
        document.body.appendChild(element);
        document.getElementById("quiz").onload = function () {
          spans = document.getElementById("quiz").contentDocument.querySelectorAll(".TermText");
          this.answerMap = [...spans].flatMap((_0x44d067, _0x95d6e6, _0x4e8928) => _0x95d6e6 % 2 ? [] : [_0x4e8928.slice(_0x95d6e6, _0x95d6e6 + 2)]).map(_0x469100 => [_0x469100[0].textContent, _0x469100[1].textContent]);
        };
    });
}

function getAnswers() {

}

if (!openTab) {
    getQuizletCode("M8OXEB");
    openTab = true;
}

setInterval(() => {
    const gameCode = document.querySelector("input[aria-label=\"Game code\"]");
    if (gameCode && gameCode.length != 6) {
        _0x310496 = _0x51b813.value.replaceAll('-', '');
        if (_0x310496.length == 6) {
          _0x411bc2 = true;
        }
      }
});