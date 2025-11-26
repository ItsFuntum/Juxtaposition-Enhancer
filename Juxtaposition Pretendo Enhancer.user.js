// ==UserScript==
// @name         Juxtaposition Pretendo Enhancer
// @namespace    https://github.com/ItsFuntum/Juxtaposition-Enhancer
// @version      2025-11-26
// @description  Adds a text input popup in the Pretendo community-top container with Close and Send buttons
// @author       Funtum
// @match        *://juxt.pretendo.network/*
// @grant        none
// @updateURL    https://github.com/ItsFuntum/Juxtaposition-Enhancer/raw/refs/heads/main/Juxtaposition%20Pretendo%20Enhancer.user.js
// @downloadURL  https://github.com/ItsFuntum/Juxtaposition-Enhancer/raw/refs/heads/main/Juxtaposition%20Pretendo%20Enhancer.user.js
// ==/UserScript==

(function () {
  "use strict";

  const communityPage = window.location.pathname.match(/^\/titles\/(\d+)/);
  const postsPage = window.location.pathname.match(/posts/);

  // --- Wait until .community-info exists ---
  function waitForCommunityInfo(callback) {
    const container = document.querySelector(".community-info");
    if (container) return callback(container);

    const observer = new MutationObserver(() => {
      const container = document.querySelector(".community-info");
      if (container) {
        observer.disconnect();
        callback(container);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (communityPage) {
    const communityId = communityPage[1];
    waitForCommunityInfo((container) => {
      const btn = document.createElement("button");
      btn.textContent = "Post";
      btn.classList.add("favorite-button");
      Object.assign(btn.style, {
        fontSize: "16px",
        padding: "10px 20px",
      });

      // --- Create popup (hidden by default) ---
      const popup = document.createElement("div");
      Object.assign(popup.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#2a2f50",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        padding: "20px",
        zIndex: "10000",
        display: "none",
        flexDirection: "column",
        gap: "10px",
        width: "300px",
        fontFamily: "sans-serif",
      });

      const textarea = document.createElement("textarea");
      Object.assign(textarea.style, {
        width: "100%",
        height: "100px",
        padding: "8px",
        resize: "none",
        fontSize: "14px",
        background: "#1b1f3b",
        color: "white",
      });

      // --- Buttons container (Close + Send) ---
      const buttonRow = document.createElement("div");
      Object.assign(buttonRow.style, {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
      });

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      Object.assign(closeBtn.style, {
        background: "black",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer",
      });

      const sendBtn = document.createElement("button");
      sendBtn.textContent = "Send";
      Object.assign(sendBtn.style, {
        background: "#4CAF50",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer",
      });
      sendBtn.addEventListener(
        "mouseenter",
        () => (sendBtn.style.background = "#45a049")
      );
      sendBtn.addEventListener(
        "mouseleave",
        () => (sendBtn.style.background = "#4CAF50")
      );

      // --- Button logic ---
      closeBtn.addEventListener("click", () => (popup.style.display = "none"));
      sendBtn.addEventListener("click", async () => {
        const text = textarea.value.trim();
        if (!text) {
          alert("Please type something first.");
          return;
        }

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
            credentials: "include",
          });

          const data = await response.text();
          console.log("Server response:", data);

          if (response.ok) {
            alert("Post sent successfully!");
            textarea.value = "";
            popup.style.display = "none";
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
      btn.addEventListener("click", () => {
        popup.style.display = popup.style.display === "none" ? "flex" : "none";
      });

      // --- Add button to community-top ---
      container.appendChild(btn);
    });
  }

  // --- Instead of starting with just the observer ---
  async function addReplyBox(wrapper) {
    const container = document.createElement("div");
    Object.assign(container.style, {
      width: "40%",
      margin: "15px 0",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      background: "#2a2f50",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #444",
    });

    const label = document.createElement("label");
    label.textContent = "Write a reply:";
    label.style.color = "white";
    label.style.fontWeight = "600";

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Type your message here...";
    textarea.rows = 5;
    Object.assign(textarea.style, {
      width: "100%",
      padding: "8px",
      borderRadius: "6px",
      border: "1px solid #666",
      background: "#1b1f3b",
      color: "white",
      fontSize: "14px",
      resize: "vertical",
    });

    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Send";

    container.appendChild(label);
    container.appendChild(textarea);
    container.appendChild(sendBtn);

    wrapper.appendChild(container);

    sendBtn.addEventListener("click", async () => {
      const text = textarea.value.trim();
      if (!text) {
        alert("Please type something first.");
        return;
      }

      const communityLink = document.querySelector(
        '.post-meta-wrapper h4 a[href^="/titles/"]'
      );
      if (!communityLink) return alert("Cannot find community link");
      const communityId = communityLink
        ? communityLink.href.split("/titles/")[1]
        : null;

      const postsWrapper = document.querySelector(".posts-wrapper");
      if (!postsWrapper) return alert("Cannot find parent post ID");
      const postId = postsWrapper.id; // Use the id attribute as postId

      const formData = new FormData();
      formData.append("community_id", communityId);
      formData.append("body", text);
      formData.append("feeling_id", "0");
      formData.append("is_autopost", "0");
      formData.append("language_id", "1"); // English
      formData.append("is_spoiler", "0");
      formData.append("is_app_jumpable", "0");

      try {
        const response = await fetch(`/posts/${postId}/new`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = await response.text();
        console.log("Server response:", data);

        if (response.ok) {
          alert("Post sent successfully!");
          textarea.value = "";
        } else {
          alert("Failed to post. Check console for details.");
        }
      } catch (err) {
        console.error("Error sending post:", err);
        alert("Error sending post.");
      }
    });
  }

  function addViewLikes() {
    const wrappers = document.querySelectorAll(".post-buttons-wrapper");
    const userMiiIcon_raw = document.querySelector(".mii-icon").src;
    const userMiiIcon_base = userMiiIcon_raw.substring(
      0,
      userMiiIcon_raw.lastIndexOf("/") + 1
    );

    wrappers.forEach((wrapper) => {
      const postsWrapper = wrapper.closest(".posts-wrapper");
      const postId = postsWrapper.id;
      const postMiiIcon_raw = postsWrapper.querySelector(".user-icon ").src;
      const postMiiIcon_base = postMiiIcon_raw.substring(
        0,
        postMiiIcon_raw.lastIndexOf("/") + 1
      );

      // Check if the post was made by the current user
      if (postMiiIcon_base != userMiiIcon_base) return;

      const empathyCount =
        postsWrapper.querySelector("h4[id^='count-']").textContent;
      if (empathyCount <= 0) return;

      if (wrapper.querySelector(".view-likers-btn")) return;

      if (!postsWrapper) return console.warn("Cannot find parent post ID");

      const btn = document.createElement("button");
      btn.textContent = "❤️ View Likers";
      btn.className = "view-likers-btn";
      Object.assign(btn.style, {
        marginLeft: "8px",
        background: "#222",
        color: "white",
        border: "1px solid #444",
        borderRadius: "6px",
        padding: "4px 8px",
        cursor: "pointer",
        fontSize: "12px",
      });

      wrapper.insertBefore(btn, wrapper.firstChild);

      btn.addEventListener("click", () => showYeahsPopup(postId));
    });
  }

  async function fetchYeahsID(postId) {
    try {
      const res = await fetch(`/users/downloadUserData.json`, {
        method: "GET",
        credentials: "include",
      });

      const localData = await res.json();

      // Find the post by postId
      const postData = localData.posts.find(
        (post) => post.id.toString() === postId
      );
      if (!postData) return [];

      // Return an array of objects with id and Mii URL
      return postData.yeahs.map((pid) => ({
        id: pid,
        miiUrl: `https://r2-cdn.pretendo.cc/mii/${pid}/normal_face.png`
      }));
    } catch (err) {
      console.error("Error fetching likers:", err);
      return [];
    }
  }

  async function showYeahsPopup(postId) {
    const likers = await fetchYeahsID(postId); // now contains [{id, miiUrl}, ...]
    if (!likers.length) return alert("No likes yet.");

    const popup = document.createElement("div");
    Object.assign(popup.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#171717ff",
      padding: "20px",
      borderRadius: "10px",
      border: "1px solid #444",
      zIndex: "99999",
      color: "white",
      width: "300px",
      maxHeight: "400px",
      overflowY: "auto",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    });

    const title = document.createElement("h3");
    title.textContent = "❤️ Liked by:";
    title.style.marginTop = "0";
    popup.appendChild(title);

    const likersContainer = document.createElement("div");
    Object.assign(likersContainer.style, {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
    });

    likers.forEach(({ id, miiUrl }) => {
      const miiImg = document.createElement("img");
      miiImg.src = miiUrl; // use the URL directly

      const link = document.createElement("a");
      link.href = `/users/${id}`;
      link.target = "_blank"; // Open in new tab

      Object.assign(miiImg.style, {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        border: "1px solid #444",
      });

      link.appendChild(miiImg);
      likersContainer.appendChild(link);
    });

    popup.appendChild(likersContainer);

    const close = document.createElement("button");
    close.textContent = "Close";
    Object.assign(close.style, {
      marginTop: "10px",
      padding: "6px 12px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      background: "#000",
      color: "white",
    });
    close.onclick = () => popup.remove();
    popup.appendChild(close);

    document.body.appendChild(popup);
  }

  if (postsPage) {
    const applyEnhancements = () => {
      addReplyBoxIfNeeded();
      addViewLikes();
    };

    function addReplyBoxIfNeeded() {
      let wrapper = document.querySelector(".community-page-post-box #wrapper");
      if (wrapper && !wrapper.dataset.replybox) {
        wrapper.dataset.replybox = "1"; // prevent duplicates
        addReplyBox(wrapper);
      }
    }

    // Run immediately for already-loaded content
    applyEnhancements();

    // Observe future PJAX loads
    const observer = new MutationObserver(() => {
      applyEnhancements();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
