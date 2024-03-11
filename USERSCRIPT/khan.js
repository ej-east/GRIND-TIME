// ==UserScript==
// @name         Khan My Way
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Customize Khan Academy for your needs
// @author       EJ
// @match        https://www.khanacademy.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=khanacademy.org
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    class Answer {
        constructor(answer, type) {
            this.body = answer;
            this.type = type;
        }

        get isMultiChoice() {
            return this.type === "multiple_choice";
        }

        get isFreeResponse() {
            return this.type === "free_response";
        }

        get isExpression() {
            return this.type === "expression";
        }

        get isDropdown() {
            return this.type === "dropdown";
        }

        log() {
            this.sanitizeAnswers();
            console.log("Answers:", this.body.join(", "));
        
            // Target style string
            const targetStyle = "padding-left: 12px; text-align: left; flex: 1 1 0%; padding-top: 4px;";
        
            // Find all span elements
            const spans = document.querySelectorAll('span');
        
            // Iterate over the spans
            spans.forEach(span => {
                // Check if the span has the target style
                if (span.style.cssText === targetStyle) {
                    // Check if the span contains the correct answer
                    this.body.forEach(answer => {
                        if (span.textContent.includes(answer)) {
                            // Highlight the span
                            span.style.backgroundColor = 'rgb(255, 146, 92)';
                        }
                    });
                }
            });
        }
        
        
        

        sanitizeAnswers() {
            this.body = this.body.map(ans => {
                if (typeof ans === "string") {
                    if (ans.includes("web+graphie")) {
                        this.printImage(ans);
                        return "";
                    } else {
                        return ans.replaceAll("$", "").replaceAll("`","");
                    }
                }
            }).filter(Boolean);
        }

        printImage(imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            
            // Display the image in a modal or a specific area on the page
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';

            modal.appendChild(img);
            document.body.appendChild(modal);

            // Close the modal when clicked outside the image
            modal.addEventListener('click', () => {
                modal.remove();
            });
        }
    }

    function extractAnswerFromWidget(widget, type) {
        if (widget.options && widget.options.answers) {
            return widget.options.answers
                .filter(answer => answer.status === "correct")
                .map(answer => answer.value);
        } else if (widget.options && widget.options.choices) {
            return widget.options.choices
                .filter(choice => choice.correct)
                .map(choice => choice.content);
        } else if (widget.options && widget.options.answerForms) {
            return widget.options.answerForms
                .filter(form => Object.values(form).includes("correct"))
                .map(form => form.value);
        }
        return [];
    }

    const widgetTypes = {
        "numeric-input": "free_response",
        "radio": "multiple_choice",
        "expression": "expression",
        "dropdown": "dropdown"
    };

    const originalFetch = window.fetch;
    window.fetch = function () {
        return originalFetch.apply(this, arguments).then(async (res) => {
            if (res.url.includes("/getAssessmentItem")) {
                const json = await res.clone().json();
                const question = JSON.parse(json.data.assessmentItem.item.itemData).question;

                Object.keys(question.widgets).forEach(widgetName => {
                    const type = widgetTypes[widgetName.split(" ")[0]];
                    const answer = extractAnswerFromWidget(question.widgets[widgetName], type);
                    if (answer.length > 0) {
                        new Answer(answer, type).log();
                    }
                });
            }

            if (!window.loaded) {
                console.clear();
                window.loaded = true;
            }

            return res;
        });
    };
})();
