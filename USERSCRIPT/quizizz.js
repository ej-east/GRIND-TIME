// ==UserScript==
// @name         Ixl Solver
// @namespace    http://tampermonkey.net
// @version      0.1
// @description  Tries to solve quizizz problems for yourself.
// @author       Hallway and EJ
// @match        https://quizizz.com/join/*
// @grant        none
// ==/UserScript==

// Backup the original 'open' and 'send' methods of XMLHttpRequest
XMLHttpRequest.prototype.realOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;

// Custom 'open' method to capture and log request details
var myOpen = function(method, url, async, user, password) {
    this.requestDetails = {method, url, async, user, password, headers: {}, body: null}; // Prepare to capture request details
    this.realOpen(method, url, async, user, password);
};

// Custom 'send' method to capture and log request body
var mySend = function(body) {
    if (this.requestDetails && !this.requestDetails.url.includes("socket")) {
        this.requestDetails.body = body;
        console.log("Preparing to send request to:", this.requestDetails.url);
        console.log("Request Headers:", this.requestDetails.headers);
        console.log("Request Body:", body);

        // Attach a listener to log the response when it's available
        this.onreadystatechange = () => {
            if (this.readyState === 4 && this.status === 200) {
                // The request is complete, log the response
                console.log("Response for:", this.requestDetails.url, "Status:", this.status);
                try {
                    var response = JSON.parse(this.responseText);
                    console.log("Response Data:", response);
                } catch (e) {
                    console.log("Failed to parse response as JSON:", e);
                }
            }
        };
    }
    this.realSend(body);
};

XMLHttpRequest.prototype.open = myOpen;
XMLHttpRequest.prototype.send = mySend;
