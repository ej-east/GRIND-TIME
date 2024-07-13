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
    const style = document.createElement('style');


    let qaPair =[];
    let is_pin = false;
    let user_input = null;
    let room_hash = null;
    let debounceTimeout = null;



    function create_UI(){
        uiContainer.style.position = 'fixed';
        uiContainer.style.top = '80px';
        uiContainer.style.right = '10px';
        uiContainer.style.backgroundColor = '#222'; 
        uiContainer.style.padding = '10px';
        uiContainer.style.border = '1px solid #444'; 
        uiContainer.style.zIndex = '9999';


        uiContainer.style.display = 'none';


        style.innerHTML = `
        .input-group {
            position: relative;
        }

        .input {
            border: solid 1.5px #9e9e9e;
            border-radius: 1rem;
            background: none;
            padding: 1rem;
            font-size: 1rem;
            color: #f5f5f5;
            transition: border 150ms cubic-bezier(0.4,0,0.2,1);
        }

        .user-label {
            position: absolute;
            left: 15px;
            color: #e8e8e8;
            pointer-events: none;
            transform: translateY(1rem);
            transition: 150ms cubic-bezier(0.4,0,0.2,1);
        }

        .input:focus, input:valid {
            outline: none;
            border: 1.5px solid #FF925C;
        }

        .input:focus ~ label, input:valid ~ label {
            transform: translateY(-50%) scale(0.8);
            background-color: #212121;
            padding: 0 .2em;
            color: #FFB567;
        }


        .switch {
            --secondary-container: #3a4b39;
            --primary: #84da89;
            font-size: 17px;
            position: relative;
            display: inline-block;
            width: 3.7em;
            height: 1.8em;
        }

        .switch input {
            display: none;
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #313033;
            transition: .2s;
            border-radius: 30px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 1.4em;
            width: 1.4em;
            border-radius: 20px;
            left: 0.2em;
            bottom: 0.2em;
            background-color: #aeaaae;
            transition: .4s;
        }

        input:checked + .slider::before {
            background-color: var(--primary);
        }

        input:checked + .slider {
            background-color: var(--secondary-container);
        }

        input:focus + .slider {
            box-shadow: 0 0 1px var(--secondary-container);
        }

        input:checked + .slider:before {
            transform: translateX(1.9em);
        }
        `


        uiContainer.innerHTML = `

        <form id="userForm"  autocomplete="off">
            <div class="input-group">
                <input required="" type="text" id="roomHash" name="text" autocomplete="off" class="input" >
                <label class="user-label" for="roomHash" id="hash-pin-label">Room Hash</label>
            </div>
        </form>


        <label class="switch">
            <input type="checkbox" id="toggleSwitch">
            <span class="slider"></span>
        </label>

        <span id="currentAnswers" style="color:#f5f5f5; white-space: normal">Correct answer: nil </span>
        <span id="warn" style="color: red;    font-weight: bold;"></span>
        `;


        document.head.appendChild(style);

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
            if (is_pin){document.getElementById("hash-pin-label").innerText = "Game Pin"}
            else{document.getElementById("hash-pin-label").innerText = "Room Hash"}

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

            // Clear Array 
            qaPair = []

            questions.forEach(question => {
                // Skip slides
                if (question.type === "SLIDEV2") {
                    return;
                }
            
                // Writing question
                else if (question.type === "BLANK") {
                    const options = question.structure.options;
                    let textOptions = [];
            
                    options.forEach(option => {
                        if (option.type === 'text') {
                            textOptions.push(option.text);
                        }
                    });
                    
                    qaPair.push({'question': question.structure.query.text, 'answer': textOptions, 'type':question.type})
                }
            
                // Multi Selection (MSQ) and Multiple-choice (MCQ)
                else if (question.type === "MSQ" || question.type === "MCQ") {
                    const answerIndex = question.structure.answer;
                    const options = question.structure.options;
                    let textAnswers = [];

                    if (Array.isArray(answerIndex)) {
                        answerIndex.forEach(index => {
                            const correctChoice = options[index];
                            if (correctChoice.type === 'text') {
                                textAnswers.push(correctChoice.text)
                            }
                            qaPair.push({'question': question.structure.query.text, 'answer':textAnswers, 'type':question.type})
                        });
            
                    } else if (typeof answerIndex === 'number') {
                        const correctChoice = options[answerIndex];
            
                        if (correctChoice.type === 'text') {
                            qaPair.push({'question': question.structure.query.text, 'answer': correctChoice.text, 'type':question.type})
                        }
                    }
                }

            }
        );


        console.log(qaPair)
        parse_html()




        } catch (error) {
            console.error('Error fetching room data:', error);
        }
    }

    function cleanText(input) {
        return input
            .replace(/&nbsp;/g, "")          // Remove all &nbsp; entities
            .replace(/<\/?[^>]+(>|$)/g, "")  // Remove all HTML tags
            .replace(/"/g, "")               // Remove all double quotes
            .replace("/=rac/g", "=\frac")
            .replace(/\s/g, "");
    }

    function parse_html() {
        let elements = document.querySelectorAll('.resizeable.gap-x-2');
    
        let founds_answer = [];
        let current_question = elements[0];
        let has_found = false;
        let is_warn = false;

        qaPair.forEach((pair) => {

            if (cleanText(pair.question) == cleanText(current_question.innerHTML)) {

                if(pair.type == "BLANK"){
                    founds_answer.push(pair.answer)
                }

                if(has_found) {is_warn = true}
                has_found = true;

                elements.forEach((option) => {
                    if (Array.isArray(pair.answer)) {
                        pair.answer.forEach((answer) => {
                            if (cleanText(option.innerHTML).trim() == cleanText(answer).trim()) {
                                founds_answer.push(answer.trim())
                                option.style.opacity = '0.5'; 
                            }
                        });
                    } 
                    else if (typeof pair.answer === 'string') {
                        if (cleanText(option.innerHTML).trim() == cleanText(pair.answer).trim()){
                            founds_answer.push(pair.answer.trim())
                            option.style.opacity = '0.5'; 
                        }
                    }
                });
            }
        });

        let answerString = founds_answer.join(', ')
        document.getElementById('currentAnswers').innerHTML = `Correct Answers: <br><span style="color:#FF925C">${answerString}</span>`

        if(is_warn){
            document.getElementById('warn').innerHTML = `<br>DUPE WARNING TRIGGERED`
        }else{document.getElementById('warn').innerHTML = ``}

    }
    
    function debounce(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(debounceTimeout);
                func(...args);
            };
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(later, wait);
        };
    }


    function setupKeydownListener() {
        document.onkeydown = event => {
            if (event.repeat) return;
            
            if (event.key === 'h'){
                if (uiContainer.style.display === 'none') {
                    uiContainer.style.display = 'block';
                } else {
                    uiContainer.style.display = 'none';
                }
            }
        }
    }

    async function main(){        
        if(!user_input){return}

        
        if (is_pin){
            room_hash = await fetch_Room_Data(user_input);
        }else{
            room_hash = user_input;
        }

        if(!room_hash){return}
        fetch_Room_Answers(room_hash)



        const observer = new MutationObserver(debounce(parse_html, 500));
        observer.observe(document.body, { childList: true, subtree: true });
    }
    create_UI()
    setupKeydownListener()


})();