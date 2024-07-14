// ==UserScript==
// @name         Kahoot Cheat
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Kahoot Solver
// @author       EJ
// @match        https://kahoot.it/challenge/?quiz-id=158b2e35-ad9e-48c7-8088-ea2a290f859c&single-player=true
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kahoot.it
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let answer_array = [];
    const quiz = '1ebb37d9-c492-4df7-8213-92207bdf62b0';

    async function fetchKahoot(quizID) {
        const response = await fetch(`https://kahoot.it/rest/kahoots/${quizID}`);
        const data = await response.json();
        console.log('Fetched Kahoot Data:', data);
        return data;
    }

    function getCorrectAnswers(data) {
        let questions = data.questions;

        questions.forEach(question => {
            switch (question.type) {
                case 'multiple_select_quiz':
                    let MSQ_array = [];
                    let MSQ_index_array = [];
                    question.choices.forEach((option, index) => {
                        if (option.correct) {
                            MSQ_array.push(option.answer);
                            MSQ_index_array.push(index);
                        }
                    });
                    answer_array.push({
                        "question": question.question,
                        "answer": MSQ_array,
                        "index": MSQ_index_array,
                        "type": question.type
                    });
                    break;

                case 'quiz':
                    question.choices.forEach((option, index) => {
                        if (option.correct) {
                            answer_array.push({
                                "question": question.question,
                                "answer": option.answer,
                                "index": index,
                                "type": question.type
                            });
                        }
                    });
                    break;

                case 'jumble':
                    let jumble_array = [];
                    question.choices.forEach(option => {
                        jumble_array.push(option.answer);
                    });
                    answer_array.push({
                        "question": question.question,
                        "answer": jumble_array,
                        "type": question.type
                    });
                    break;

                case 'content':
                    // Literally nothing but filler
                    break;

                default:
                    console.log(`${question.type} not supported *yet*`);
            }
        });
        return answer_array;
    }

    function showOnButton(index){
        const buttonsNodeList = document.querySelectorAll('button');
        buttonsNodeList[index].style.opacity = '0.5'
    }

    async function main() {
        let data = await fetchKahoot(quiz);
        let parsed = getCorrectAnswers(data);
        console.log(parsed);



    }

    main();
})();
