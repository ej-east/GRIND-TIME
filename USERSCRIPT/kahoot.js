// ==UserScript==
// @name         Kahoot Cheat
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Kahoot Solver
// @author       EJ
// @match        https://kahoot.it/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kahoot.it
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const uiContainer = document.createElement('div');

    let answer_array = [];
    let quiz_id = null;
    let parsed = null;
    //let quiz_id = '1ebb37d9-c492-4df7-8213-92207bdf62b0';


    function createUI(){
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '10px';
        uiContainer.style.right = '10px';
        uiContainer.style.backgroundColor = '#222'; 
        uiContainer.style.padding = '10px';
        uiContainer.style.border = '1px solid #444'; 
        uiContainer.style.zIndex = '9999';


        //uiContainer.style.display = 'none';

        uiContainer.innerHTML = `
            <h1 style="color: #fff;">Quiz Helper</h1>
            <form id="quizForm">
                <label for="quizID" style="color: #fff;">Quiz ID:</label>
                <input type="text" id="quizID" name="quizID"><br><br>
                <button type="submit">Update Quiz ID</button>
            </form>
            <br>
            <label for="search" style="color: #fff;">Search Questions:</label>
            <input type="text" id="search" name="search">
            <div id="results" style="color: #fff;"></div>
        `;


        document.body.appendChild(uiContainer);


        document.getElementById('quizForm').addEventListener('submit', function(event){
            event.preventDefault();
            quiz_id = document.getElementById('quizID').value;

            if (quiz_id.trim() == ""){return;}
            main(quiz_id)
        });

        // Add event listener to the search input
        document.getElementById('search').addEventListener('input', function(event){
            const searchQuery = event.target.value.toLowerCase();
            if (!quiz_id){
                document.getElementById('results').innerHTML = `<span style="color: red;">First submit a QuizID!</span>`;
                return;
            }

            const filteredQuestions = parsed.filter(q => q.question.toLowerCase().includes(searchQuery));
            displayTopResult(filteredQuestions);

        });
    }

        // Function to display the search results
        function displayTopResult(questions) {
            const resultsContainer = document.getElementById('results');
            if (questions.length > 0) {
                const topQuestion = questions[0];
                resultsContainer.innerHTML = `
                    <div>
                        <p><span style="color: red;">Question:</span> ${topQuestion.question}</p>
                        <p><span style="color: red;">Answer:</span> ${topQuestion.answer}</p>
                        <button id="triggerButton">Reval on screen</button>
                    </div>
                `;
                document.getElementById('triggerButton').addEventListener('click', function() {
                    showOnButton(topQuestion.index);
                });
            } else {
                resultsContainer.innerHTML = `<p>No results found</p>`;
            }
        }

    async function fetchKahoot(quizID) {
        const response = await fetch(`https://kahoot.it/rest/kahoots/${quizID}`);
        const data = await response.json();
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
        const buttonsNodeList = document.querySelectorAll('button.ixIlpW');
        buttonsNodeList[index].style.opacity = '0.5'
    }

    async function main(quiz) {
        let data = await fetchKahoot(quiz);
        parsed = getCorrectAnswers(data);
        console.log(parsed);
    }

    createUI();
})();
