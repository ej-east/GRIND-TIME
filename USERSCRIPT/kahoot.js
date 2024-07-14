// ==UserScript==
// @name         Kahoot Cheat
// @namespace    http://tampermonkey.net/
// @version      1
// @description  try to take over the world!
// @author       EJ
// @match        https://kahoot.it/challenge/?quiz-id=158b2e35-ad9e-48c7-8088-ea2a290f859c&single-player=true
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kahoot.it
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let answer_array = [];
    const quiz = '50726fa5-9232-40ee-9598-ac096ff18018';


    async function fetchKahoot(quizID){
        const response = await fetch(`https://kahoot.it/rest/kahoots/${quizID}`);
        const data = await response.json();
        console.log('Fetched Kahoot Data:', data);
        return data;
    }


    function getCorrectAnswers(data){
        let questions = data.questions

        questions.array.forEach(question => {
            answer_array = []
            switch (question.type){
                case 'multiple_select_quiz':
                    let MSQ_array = [];
                    question.choices.forEach(option => {
                        if (option.correct){
                            MSQ_array.push(option.answer)
                        } 
                    answer_array.push({"question": question.question,  "answer": MSQ_array, "type": question.type})
                    })


                case 'quiz':
                    question.choices.forEach(option => {
                        if (option.correct){
                            answer_array.push({"question": question.question,  "answer": question.answer, "type": question.type})
                        } 
                    })

                case 'jumble':
                    let jumble_array = [];
                    question.choices.forEach(option => {jumble_array.push(option.answer)})


                    answer_array.push({"question":question.question, "answer": jumble_array, "type" : question.type})
                
                case 'content':
                    //Literally nothing but filler
                
                default:
                    console.log(`${question.type} not supported *yet*`)
            }
        });
    return answer_array
    }

    async function main(){
        let data = await fetchKahoot(quiz)
        let parsed = getCorrectAnswers(data)

        console.log(parsed)

    }


    main()
})();