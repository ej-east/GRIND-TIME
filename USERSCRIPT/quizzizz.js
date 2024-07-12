// ==UserScript==
// @name         Quizziz Cheat
// @namespace    http://tampermonkey.net/
// @version      1
// @description  
// @author       EJ
// @match        https://quizizz.com/join*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=quizizz.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    const uiContainer = document.createElement('div');
    let is_pin = false;
    let user_input = null;
    let room_hash = null;


    function create_UI(){
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '80px';
        uiContainer.style.right = '10px';
        uiContainer.style.backgroundColor = '#222'; 
        uiContainer.style.padding = '10px';
        uiContainer.style.border = '1px solid #444'; 
        uiContainer.style.zIndex = '9999';

        uiContainer.innerHTML = `
        <form id="userForm">
            <label for="roomHash">Input</label>
            <input type="text" id="roomHash" name="roomHash">
            <br>
            <button type="submit">Submit</button>
        </form>

        <label class="switch">
            <input type="checkbox" id="toggleSwitch">
            <span class="slider"></span>
        </label>


        <span id="currentAnswers">Current answer choice: nil </span>
        `;


        const form = uiContainer.querySelector('#userForm');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            user_input = document.querySelector('#roomHash').value;

            main()
        });


        const toggleSwitch = uiContainer.querySelector('#toggleSwitch');
        toggleSwitch.addEventListener('change', () => {
            is_pin = toggleSwitch.checked;
            console.log('Toggle state:', is_pin);
        });

        document.body.appendChild(uiContainer);
    }



    async function fetch_Room_Data(pin) {
        const init = {
            headers: {
              'content-type': 'application/json',
            },
            body: `{"roomCode": "${pin}"}`,
            method: 'POST',
          };
        const url = `https://game.quizizz.com/play-api/v5/checkRoom`;
        try {
            const response = await fetch(url,init);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const hash = data?.room?.hash;
            console.log('Room hash:', hash);

            return hash;

        } catch (error) {
            console.error('Error fetching room data:', error);
            return null;
        }
    }



    async function fetch_Room_Answers(room_hash){
        const url = `https://quizizz.com/_api/main/game/${room_hash}`

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const document_details = await response.json();

            const questions = document_details.data.questions;

            questions.forEach(question => {

                console.log(question.structure.query.text)

                // Skip slides
                if (question.type === "SLIDEV2") {
                    return;
                }
            
                // Writing question
                else if (question.type === "BLANK") {
                    const options = question.structure.options;
            
                    options.forEach(option => {
                        if (option.type === 'text') {
                            console.log(option.text);
                        }
                    });
            
                    console.log('='.repeat(25));
                }
            
                // Multi Selection (MSQ) and Multiple-choice (MCQ)
                else if (question.type === "MSQ" || question.type === "MCQ") {
                    const answerIndex = question.structure.answer;
                    const options = question.structure.options;
            
                    console.log(answerIndex, typeof answerIndex);
            
                    if (Array.isArray(answerIndex)) {
                        answerIndex.forEach(index => {
                            const correctChoice = options[index];
                            if (correctChoice.type === 'text') {
                                console.log(index);
                                console.log(correctChoice.text);
                            }
                        });
            
                        console.log('='.repeat(25));
                    } else if (typeof answerIndex === 'number') {
                        const correctChoice = options[answerIndex];
            
                        if (correctChoice.type === 'text') {
                            console.log(answerIndex);
                            console.log(correctChoice.text);
                            console.log('='.repeat(25));
                        }
                    }
                }
            });





        } catch (error) {
            console.error('Error fetching room data:', error);
        }
    }



    async function main(){        
        if(!user_input){return}

        
        if (is_pin){
            room_hash =  await fetch_Room_Data(user_input);
        }else{
            room_hash = user_input;
        }

        if(!room_hash){return}
        fetch_Room_Answers(room_hash)

    }

    create_UI()
})();