// ==UserScript==
// @name         Juxtaposition Pretendo Enhancer
// @namespace    https://github.com/ItsFuntum/Juxtaposition-Enhancer
// @version      2025-11-12
// @description  Adds a text input popup in the Pretendo nav menu with Close and Send buttons
// @author       Funtum
// @match        https://juxt.pretendo.network/*
// @grant        none
// @updateURL    https://github.com/ItsFuntum/Juxtaposition-Enhancer/raw/refs/heads/main/Juxtaposition%20Pretendo%20Enhancer.user.js
// @downloadURL  https://github.com/ItsFuntum/Juxtaposition-Enhancer/raw/refs/heads/main/Juxtaposition%20Pretendo%20Enhancer.user.js
// ==/UserScript==

(function() {
    'use strict';

    // --- Wait until #nav-menu exists ---
    function waitForNavMenu(callback) {
        const nav = document.querySelector('#nav-menu');
        if (nav) return callback(nav);

        const observer = new MutationObserver(() => {
            const navMenu = document.querySelector('#nav-menu');
            if (navMenu) {
                observer.disconnect();
                callback(navMenu);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    waitForNavMenu((nav) => {
        const btn = document.createElement('button');
        btn.textContent = 'Post';

        // --- Create popup (hidden by default) ---
        const popup = document.createElement('div');
        Object.assign(popup.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#2a2f50',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            padding: '20px',
            zIndex: '10000',
            display: 'none',
            flexDirection: 'column',
            gap: '10px',
            width: '300px',
            fontFamily: 'sans-serif',
        });

        const textarea = document.createElement('textarea');
        Object.assign(textarea.style, {
            width: '100%',
            height: '100px',
            padding: '8px',
            resize: 'none',
            fontSize: '14px',
            background: '#1b1f3b',
            color: 'white',
        });

        // --- Buttons container (Close + Send) ---
        const buttonRow = document.createElement('div');
        Object.assign(buttonRow.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
        });

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        Object.assign(closeBtn.style, {
            background: 'black',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
        });

        const sendBtn = document.createElement('button');
        sendBtn.textContent = 'Send';
        Object.assign(sendBtn.style, {
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
        });
        sendBtn.addEventListener('mouseenter', () => sendBtn.style.background = '#45a049');
        sendBtn.addEventListener('mouseleave', () => sendBtn.style.background = '#4CAF50');

        // --- Button logic ---
        closeBtn.addEventListener('click', () => popup.style.display = 'none');
        sendBtn.addEventListener('click', async () => {
            const text = textarea.value.trim();
            if (!text) {
                alert('Please type something first.');
                return;
            }

            const match = window.location.pathname.match(/\/titles\/(\d+)/);
            const communityId = match ? match[1] : null;

            const formData = new FormData();
            formData.append("community_id", communityId);
            formData.append("body", text);
            formData.append("feeling_id", "0");
            formData.append("is_autopost", "0");
            formData.append("language_id", "1"); // English
            formData.append("is_spoiler", "0");
            formData.append("is_app_jumpable", "0");

            try {
                const response = await fetch("/posts/new", {
                    method: "POST",
                    body: formData,
                    credentials: "include"
                });

                const data = await response.text();
                console.log("Server response:", data);

                if (response.ok) {
                    alert("Post sent successfully!");
                    textarea.value = '';
                    popup.style.display = 'none';
                } else {
                    alert("Failed to post. Check console for details.");
                }
            } catch (err) {
                console.error("Error sending post:", err);
                alert("Error sending post.");
            }
        });

        // Add Close first, then Send
        buttonRow.appendChild(closeBtn);
        buttonRow.appendChild(sendBtn);

        popup.appendChild(textarea);
        popup.appendChild(buttonRow);
        document.body.appendChild(popup);

        // --- Toggle popup ---
        btn.addEventListener('click', () => {
            popup.style.display = popup.style.display === 'none' ? 'flex' : 'none';
        });

        // --- Add button to nav ---
        nav.appendChild(btn);
    });
})();
