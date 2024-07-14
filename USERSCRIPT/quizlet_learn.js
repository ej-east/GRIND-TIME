// ==UserScript==
// @name         Quizlet Learn
// @namespace    http://tampermonkey.net/
// @version      2024-07-14
// @description  try to take over the world!
// @author       EJ
// @match        https://quizlet.com/669190409/learn?funnelUUID=80d83436-cc1f-4dec-9108-1ecea3c7db6e
// @icon         https://www.google.com/s2/favicons?sz=64&domain=quizlet.com
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

    async function getAnswers() {
        const currentUrl = window.location.href;
        const urlParts = currentUrl.split('/');
        const itemID = urlParts[3];

        const iframe = document.createElement("iframe");
        iframe.src = `https://quizlet.com/${itemID}`;
        iframe.id = "quizIframe";
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        return new Promise((resolve) => {
            iframe.onload = function() {
                const spans = iframe.contentDocument.querySelectorAll(".TermText");
                const answerMap = Array.from(spans).reduce((acc, span, idx, arr) => {
                    if (idx % 2 === 0) {
                        acc.push({ question: arr[idx + 1].textContent, answer:  span.textContent});
                    }
                    return acc;
                }, []);
                resolve(answerMap);
            };
        });
    }

    function answerQuestion(data){
        const divs = document.querySelectorAll('div');

        const blockDivs = Array.from(divs).filter(div => div.style.display === 'block');
        const answerChoiceDiv = Array.from(divs).filter(div => div.className === 'c1sj1twu');
        

        const question = blockDivs[0].innerHTML;


        const answerObject = data.find(item => {
            console.log(`${item.question} != ${question}`)
            return item.question == question});
        
        if (!answerObject) {
            console.error('No matching question found in the answer map');
            return;

        }

        const correctAnswer = answerObject.answer;
        console.log(`Correct Answer: ${correctAnswer}`);

        const answerDiv = Array.from(answerChoiceDiv).find(div => div.childNodes[0].innerText === correctAnswer);
        if(answerDiv){
        answerDiv.style.opacity = '0.5'
        }

        const inputElement = document.querySelector('input.AssemblyInput-input[placeholder="Type the answer"]');
        if (inputElement) {
            inputElement.className = 'AssemblyInput-input';
            inputElement.parentElement.className = 'AssemblyInput AssemblyInput--filled AssemblyInput--inverted';
            inputElement.value = correctAnswer;
            console.log('Input element found, class changed, and value set to correct answer');

            const inputEvent = new Event('input', { bubbles: true });
            const changeEvent = new Event('change', { bubbles: true });
            inputElement.dispatchEvent(inputEvent);
            inputElement.dispatchEvent(changeEvent);


            console.log('Class changed and value set to correct answer:', inputElement.value);

        } else {
            console.error('Input element not found');
        }
    }

    async function main(){
        let answer_map = await getAnswers();
        answerQuestion(answer_map);

        const observer = new MutationObserver(async () => {
            await new Promise(r => setTimeout(r, 2000));
            answerQuestion(answer_map);
        });

        const config = { childList: true, subtree: true };
        observer.observe(document.body, config);

    }

    main();
})();
