// ==UserScript==
// @name         EdPuzzle cheat
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Edpuzzle cheat.
// @author       EJ & Hallway 
// @match      https://edpuzzle.com/assignments/*
// @grant        none
// ==/UserScript==

var assignment = null;

function http_get(url, callback, headers=[], method="GET", content=null) {
  var request = new XMLHttpRequest();
  request.addEventListener("load", callback);
  request.open(method, url, true);

  if (window.__EDPUZZLE_DATA__ && window.__EDPUZZLE_DATA__.token) {
    headers.push(["authorization", window.__EDPUZZLE_DATA__.token]);
  }
  for (const header of headers) {
    request.setRequestHeader(header[0], header[1]);
  }
  
  request.send(content);
}

function getAssignment(csrf, assignment) {
  var assignment_id = window.location.href.split("/")[4];
  if (typeof assignment_id == "undefined") {
    alert("Error: Could not infer the assignment ID. Are you on the correct URL?");
    return;
  }
  var url1 = "https://edpuzzle.com/api/v3/assignments/"+assignment_id;

  http_get(url1, function(){
    var assignment = JSON.parse(this.responseText);
    if ((""+this.status)[0] == "2") {
      this.assignment = assignment;
      getMedia(csrf, assignment);
    }
    else {
      alert(`Error: Status code ${this.status} recieved when attempting to fetch the assignment data.`)
    }
  });
}

function httpGet(url, callback, headers=[], method="GET", content=null) {
  var request = new XMLHttpRequest();
  request.addEventListener("load", callback);
  request.open(method, url, true);
  if (window.__EDPUZZLE_DATA__ && window.__EDPUZZLE_DATA__.token) {
    headers.push(["authorization", window.__EDPUZZLE_DATA__.token]);
  }
  for (const header of headers) {
    request.setRequestHeader(header[0], header[1]);
  }
  request.send(content);
}

function init() {
  getCSRF();
}

function getCSRF() {
  var csrfURL = "https://edpuzzle.com/api/v3/csrf";
  httpGet(csrfURL, function(){
    var data = JSON.parse(this.responseText);
    var csrf = data.CSRFToken;
    getAssignment(csrf);
  });
}

function getAttempt(csrf, assignment, questions) {
  var id = assignment.teacherAssignments[0]._id;
  var attemptURL = "https://edpuzzle.com/api/v3/assignments/"+id+"/attempt";
  httpGet(attemptURL, function(){
    var data = JSON.parse(this.responseText);
    skipVideo(csrf, data, questions, assignment);
  });
}

function skipVideo(csrf, attempt, questions, assignment) {
  var id = attempt._id;
  var teacher_assignment_id = attempt.teacherAssignmentId;
  var referrer = "https://edpuzzle.com/assignments/"+teacher_assignment_id+"/watch";;
  var url2 = "https://edpuzzle.com/api/v4/media_attempts/"+id+"/watch";

  var content = {"timeIntervalNumber": 10};
  var headers = [
    ['accept', 'application/json, text/plain, */*'],
    ['accept_language', 'en-US,en;q=0.9'],
    ['content-type', 'application/json'],
    ['x-csrf-token', csrf],
    ['x-edpuzzle-referrer', referrer],
    ['x-edpuzzle-web-version', window.__EDPUZZLE_DATA__.version]
  ];
  
  httpGet(url2, function(){
    var attemptId = attempt._id;
    var filteredQuestions = [];
    
    for (let i=0; i<questions.length; i++) {
      let question = questions[i];
      if (question.type != "multiple-choice") {continue;}
      
      if (filteredQuestions.length == 0) {
        filteredQuestions.push([question]);
      }
      else if (filteredQuestions[filteredQuestions.length-1][0].time == question.time) {
        filteredQuestions[filteredQuestions.length-1].push(question);
      }
      else {
        filteredQuestions.push([question]);
      }
    }
    
    if (filteredQuestions.length > 0) {
      var total = filteredQuestions.length;
      postAnswers(csrf, assignment, filteredQuestions, attemptId, total);
    }
  }, headers, "POST", JSON.stringify(content));
}

function postAnswers(csrf, assignment, remainingQuestions, attemptId, total) {
  var id = assignment.teacherAssignments[0]._id;
  var referrer = "https://edpuzzle.com/assignments/"+id+"/watch";
  var answersURL = "https://edpuzzle.com/api/v3/attempts/"+attemptId+"/answers";

  var content = {answers: []};
  var now = new Date().toISOString();
  var questionsPart = remainingQuestions.shift();
  for (let i=0; i<questionsPart.length; i++) {
    let question = questionsPart[i];
    let correctChoices = [];
    for (let j=0; j<question.choices.length; j++) {
      let choice = question.choices[j];
      if (choice.isCorrect) {
        correctChoices.push(choice._id)
      }
    }
    content.answers.push({
      "questionId": question._id,
      "choices": correctChoices,
      "type": "multiple-choice",
    });
  }
  
  var headers = [
    ['accept', 'application/json, text/plain, */*'],
    ['accept_language', 'en-US,en;q=0.9'],
    ['content-type', 'application/json'],
    ['x-csrf-token', csrf],
    ['x-edpuzzle-referrer', referrer],
    ['x-edpuzzle-web-version', window.__EDPUZZLE_DATA__.version]
  ];
  httpGet(answersURL, function() {
    if (remainingQuestions.length == 0) {
      window.location.reload();
    }
    else {
      postAnswers(csrf, assignment, remainingQuestions, attemptId, total);
    }
  }, headers, "POST", JSON.stringify(content));
}

function parseQuestions(csrf, assignment, questions) {  
  console.log(questions)

  var question;
  var counter = 0;
  var counter2 = 0;
  for (let i=0; i<questions.length; i++) {
    for (let j=0; j<questions.length-i-1; j++) {
      if (questions[j].time > questions[j+1].time){
       let question_old = questions[j];
       questions[j] = questions[j + 1];
       questions[j+1] = question_old;
     }
    }
  }

  getAttempt(csrf, assignment, questions);
}

function getMedia(crsf, assignment) {
  var media_id = assignment.teacherAssignments[0].contentId;
  var url2 = `https://edpuzzle.com/api/v3/media/${media_id}`;

  fetch(url2, {credentials: "omit"})
    .then(response => {
       return response.json();
    })
    .then(media => {
      parseQuestions(crsf, assignment, media.questions);
    })
}
document.addEventListener('keydown', (event) => {
  if (event.key === 'c') {
    init();
  }
});