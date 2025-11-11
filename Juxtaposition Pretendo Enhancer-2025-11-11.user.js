// ==UserScript==
// @name         Juxtaposition Pretendo Enhancer
// @namespace    https://funtum.dev/juxtaposition
// @version      2025-11-11
// @description  Adds a text input popup in the Pretendo nav menu with Close and Send buttons
// @author       Funtum
// @match        https://juxt.pretendo.network/*
// @grant        none
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
        sendBtn.addEventListener('click', () => {
            const text = textarea.value.trim();
            if (text) {
                alert(`You entered:\n\n${text}`);
                textarea.value = '';
                popup.style.display = 'none';
            } else {
                alert('Please type something first.');
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