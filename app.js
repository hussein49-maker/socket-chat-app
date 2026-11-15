const SKIN_KEY = "flame-realm-skin";

const SKINS = {
    flame:     { name: "Flame Realm", room: "Flame Chamber", particles: ["#ff5722", "#ff9800"], placeholder: "Set your heart ablaze..." },
    messenger: { name: "Messenger",   room: "Messenger",     particles: ["#0a7cff", "#8b5cf6"], placeholder: "Type a message..." },
    whatsapp:  { name: "WhatsApp",    room: "WhatsApp",      particles: ["#25d366", "#1daa61"], placeholder: "Type a message..." },
    telegram:  { name: "Telegram",    room: "Telegram",      particles: ["#2aabee", "#54c3f1"], placeholder: "Write a message..." }
};
let currentSkin = "flame";

let ws = null;
let username = "";
let sessionKeys = ["InitialDefaultKey1234567890ABCDEF"];

function currentKey() {
    return sessionKeys[sessionKeys.length - 1];
}

function keyFor(kid) {
    if (typeof kid === "number" && sessionKeys[kid]) return sessionKeys[kid];
    return currentKey();
}

const canvas = document.getElementById('particles-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class EmberParticle {
    constructor(x, y, isBurst = false) {
        this.reset(x, y, isBurst);
    }
    reset(x, y, isBurst = false) {
        this.x = x !== undefined ? x : Math.random() * (canvas ? canvas.width : 800);
        this.y = y !== undefined ? y : (canvas ? canvas.height : 600) + Math.random() * 20;
        this.size = isBurst ? Math.random() * 2.8 + 1.2 : Math.random() * 1.8 + 0.6;
        this.speedY = isBurst ? (Math.random() - 0.5) * 3.5 : Math.random() * 1.2 + 0.5;
        this.speedX = isBurst ? (Math.random() - 0.5) * 3.5 : (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.8 + 0.2;
        const palette = skinParticleColors();
        this.color = palette[Math.random() > 0.3 ? 0 : 1];
        this.isBurst = isBurst;
    }
    update() {
        if (this.isBurst) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= 0.025;
        } else {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.opacity -= 0.002;
            if (this.y < 0 || this.opacity <= 0) {
                this.reset();
            }
        }
    }
    draw() {
        if (!ctx || this.opacity <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

for (let i = 0; i < 35; i++) {
    particles.push(new EmberParticle());
}

function createParticleBurst(x, y) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 15; i++) {
        particles.push(new EmberParticle(x, y, true));
    }
}

function burstFromEvent(event) {
    if (!event) return;
    if (event.clientX || event.clientY) {
        createParticleBurst(event.clientX, event.clientY);
        return;
    }
    const el = event.submitter || event.target;
    if (el && el.getBoundingClientRect) {
        const r = el.getBoundingClientRect();
        createParticleBurst(r.left + r.width / 2, r.top + r.height / 2);
    }
}

function animateParticles() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, index) => {
            p.update();
            p.draw();
            if (p.isBurst && p.opacity <= 0) {
                particles.splice(index, 1);
            }
        });
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playClickSound() {
    try {
        const c = getAudioContext();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, c.currentTime + 0.05);
        gain.gain.setValueAtTime(0.04, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.05);
    } catch (e) {}
}

function playSuccessSound() {
    try {
        const c = getAudioContext();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, c.currentTime);
        osc.frequency.setValueAtTime(554.37, c.currentTime + 0.07);
        gain.gain.setValueAtTime(0.05, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.2);
    } catch (e) {}
}

const animeQuotes = [
    "Set your heart ablaze!",
    "Total Concentration Breathing!",
    "Flame Breathing! First Form!",
    "Water Breathing! Constant Flux!",
    "Go beyond your limits!"
];

function updateAnimeQuote() {
    const q = animeQuotes[Math.floor(Math.random() * animeQuotes.length)];
    const elem = document.getElementById("anime-quote");
    if (elem) elem.textContent = q;
}

function triggerCharFX(event, char) {
    playClickSound();
    burstFromEvent(event);
    const elem = document.getElementById("anime-quote");
    if (char === 'rengoku') {
        if (elem) elem.textContent = "Flame Hashira: Kyojuro Rengoku!";
    } else if (char === 'tanjiro') {
        if (elem) elem.textContent = "Water Hashira: Tanjiro Kamado!";
    }
}

const THEME_KEY = "flame-realm-theme";

function applySkin(id) {
    if (!SKINS[id]) id = "flame";
    currentSkin = id;
    const skin = SKINS[id];
    document.body.dataset.skin = id;
    document.title = `${skin.name} - Secure E2EE Chat`;
    const brand = document.querySelector(".brand-title");
    if (brand) brand.textContent = skin.name;
    const room = document.getElementById("room-title");
    if (room) room.textContent = skin.room;
    document.querySelectorAll(".skin-chip").forEach(chip => {
        chip.setAttribute("aria-pressed", chip.dataset.skin === id ? "true" : "false");
    });
    const msgInput = document.getElementById("message-input");
    if (msgInput && !msgInput.disabled) msgInput.placeholder = skin.placeholder;
    // Re-tint the drifting embers right away
    particles.forEach(pt => { if (!pt.isBurst) pt.reset(); });
}

function selectSkin(id, event) {
    playClickSound();
    burstFromEvent(event);
    applySkin(id);
    try { localStorage.setItem(SKIN_KEY, id); } catch (e) {}
}

function skinParticleColors() {
    return (SKINS[currentSkin] || SKINS.flame).particles;
}


function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-mode", isLight);
    document.body.classList.toggle("dark-mode", !isLight);
    document.querySelectorAll(".theme-toggle").forEach(btn => {
        btn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isLight ? "#f8f1e9" : "#0c0907");
}

function toggleTheme() {
    playClickSound();
    const next = document.body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
}

(function initTheme() {
    let saved = null, skin = null;
    try {
        saved = localStorage.getItem(THEME_KEY);
        skin = localStorage.getItem(SKIN_KEY);
    } catch (e) {}
    applyTheme(saved === "light" ? "light" : "dark");
    applySkin(skin || "flame");
})();

async function handleConnectWithAnimation(event) {
    playClickSound();
    burstFromEvent(event);
    updateAnimeQuote();
    await processRoleSelection();
}

function sendMessageWithFX(event) {
    playClickSound();
    burstFromEvent(event);
    updateAnimeQuote();
    sendMessage();
}

function toggleRoleInputs() {
    playClickSound();
    showError("");
}

function validateInputs(ip, port, user) {
    if (!user) return "Username is required.";
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ip !== "localhost" && !ipPattern.test(ip)) {
        return "Invalid IP Address format.";
    }
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1024 || portNum > 65535) {
        return "Invalid Port! Must be between 1024 and 65535.";
    }
    return null;
}

async function processRoleSelection() {
    const userElem = document.getElementById("username-input");
    const ipElem = document.getElementById("ip-input");
    const portElem = document.getElementById("port-input");

    if (!userElem || !ipElem || !portElem) return;

    const user = userElem.value.trim();
    const ip = ipElem.value.trim();
    const port = portElem.value.trim();

    showError("");
    const validationError = validateInputs(ip, port, user);
    if (validationError) {
        showError(validationError);
        return;
    }

    username = user;
    const wsUrl = `ws://${ip}:${port}`;
    initConnection(wsUrl);
}

function initConnection(url) {
    try {
        ws = new WebSocket(url);
    } catch (e) {
        showError("Failed to initialize WebSocket instance.");
        return;
    }

    ws.onopen = () => {
        playSuccessStatus();
        transitionToChat();
        appendSystemMessage("Secure E2EE Channel Established.");
    };

    ws.onerror = () => {
        showError(`Error: Cannot connect to Server on [${url}].`);
    };

    ws.onmessage = handleIncomingMessage;
    ws.onclose = handleDisconnect;
}

function playSuccessStatus() {
    playSuccessSound();
}

function transitionToChat() {
    const login = document.getElementById("login-screen");
    const chat = document.getElementById("chat-screen");

    if (login && chat) {
        login.classList.remove("screen-enter");
        login.classList.add("screen-leave");
        setTimeout(() => {
            login.classList.add("hidden");
            login.classList.remove("screen-leave");
            chat.classList.remove("hidden", "screen-enter");
            void chat.offsetWidth;
            chat.classList.add("screen-enter");
            const subtitle = document.getElementById("room-subtitle");
            if (subtitle) subtitle.textContent = `Connected as ${username}`;
            const input = document.getElementById("message-input");
            if (input) input.focus();
        }, 180);
    }
}

// دالة تشفير النصوص باستخدام مفتاح الجلسة المتغير (Symmetric XOR + Base64)
function encryptText(text, key) {
    let encrypted = "";
    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i);
        let keyChar = key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode ^ keyChar);
    }
    return btoa(unescape(encodeURIComponent(encrypted)));
}

// دالة فك التشفير
function decryptText(ciphertext, key) {
    try {
        let decoded = decodeURIComponent(escape(atob(ciphertext)));
        let decrypted = "";
        for (let i = 0; i < decoded.length; i++) {
            let charCode = decoded.charCodeAt(i);
            let keyChar = key.charCodeAt(i % key.length);
            decrypted += String.fromCharCode(charCode ^ keyChar);
        }
        return decrypted;
    } catch (e) {
        return "[Decryption Error]";
    }
}

function handleIncomingMessage(event) {
    try {
        const data = JSON.parse(event.data);

        if (data.type === "INIT") {
            if (Array.isArray(data.keys)) sessionKeys = data.keys.slice();
            else if (data.key) sessionKeys = [data.key];
            return;
        }
        if (data.type === "KEY_ROTATION") {
            sessionKeys.push(data.key);
            appendSystemMessage("🔑 Session key rotated.");
            return;
        }
        if (data.type === "HISTORY") {
            data.messages.forEach(renderIncoming);
            return;
        }
        renderIncoming(data);
    } catch (err) {}
}

function renderIncoming(data) {
    if (!data || !data.sender) return;
    const key = keyFor(data.kid);

    if (data.ciphertext) {
        appendChatMessage(data.sender, decryptText(data.ciphertext, key));
        return;
    }
    if (data.audio) {
        const b64 = decryptText(data.audio, key);
        const url = base64ToBlobUrl(b64, data.mime || "audio/webm");
        if (url) appendAudioMessage(data.sender, url, data.dur || 0);
        else appendChatMessage(data.sender, "[Voice note could not be decrypted]");
    }
}

function base64ToBlobUrl(b64, mime) {
    try {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return URL.createObjectURL(new Blob([bytes], { type: mime }));
    } catch (e) {
        return null;
    }
}

function handleDisconnect() {
    playClickSound();
    const login = document.getElementById("login-screen");
    const chat = document.getElementById("chat-screen");

    if (login && chat) {
        chat.classList.add("hidden");
        login.classList.remove("hidden", "screen-enter");
        void login.offsetWidth;
        login.classList.add("screen-enter");
    }
    wipeChat();
}

function sendMessage() {
    const input = document.getElementById("message-input");
    if (!input) return;

    const text = input.value.trim();

    if (text && ws && ws.readyState === WebSocket.OPEN) {
        
        const ciphertext = encryptText(text, currentKey());

        const payload = JSON.stringify({
            sender: username,
            ciphertext: ciphertext
        });

        ws.send(payload);

        
        appendChatMessage(username, text);
        input.value = "";
    }
}

// ================= Voice notes (encrypted like text) =================
let mediaRecorder = null;
let recChunks = [];
let recStartTime = 0;
let recTimerInt = null;
const MAX_RECORD_SECONDS = 60;

function formatSeconds(total) {
    const m = Math.floor(total / 60);
    const sec = Math.floor(total % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
}

async function toggleRecording(event) {
    burstFromEvent(event);
    if (mediaRecorder && mediaRecorder.state === "recording") {
        stopRecording();
        return;
    }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
        appendSystemMessage("Voice notes are not supported in this browser.");
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => { if (e.data.size) recChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            stream.getTracks().forEach(t => t.stop());
            finishRecording();
        };
        mediaRecorder.start();
        recStartTime = Date.now();
        playClickSound();
        setRecordingUI(true);
        recTimerInt = setInterval(() => {
            const elapsed = (Date.now() - recStartTime) / 1000;
            updateRecordingTimer(elapsed);
            if (elapsed >= MAX_RECORD_SECONDS) stopRecording();
        }, 200);
    } catch (e) {
        appendSystemMessage("Microphone access was denied.");
    }
}

function stopRecording() {
    if (recTimerInt) { clearInterval(recTimerInt); recTimerInt = null; }
    if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop();
    setRecordingUI(false);
}

function setRecordingUI(active) {
    const mic = document.getElementById("mic-btn");
    const input = document.getElementById("message-input");
    if (mic) {
        mic.classList.toggle("recording", active);
        mic.setAttribute("aria-label", active ? "Stop and send voice note" : "Record voice note");
    }
    if (input) {
        input.disabled = active;
        input.placeholder = active ? "Recording… 0:00" : (SKINS[currentSkin] || SKINS.flame).placeholder;
        if (!active) input.focus();
    }
}

function updateRecordingTimer(elapsed) {
    const input = document.getElementById("message-input");
    if (input && input.disabled) {
        input.placeholder = `Recording… ${formatSeconds(elapsed)} 🔥`;
    }
}

function finishRecording() {
    const durationSec = Math.max(1, Math.round((Date.now() - recStartTime) / 1000));
    const blob = new Blob(recChunks, { type: mediaRecorder ? mediaRecorder.mimeType : "audio/webm" });
    recChunks = [];
    if (!blob.size || !ws || ws.readyState !== WebSocket.OPEN) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        const base64 = String(reader.result).split(",")[1];
        if (!base64) return;
        // The audio bytes are encrypted with the current session key,
        // exactly like text messages — the server only relays ciphertext.
        const encryptedAudio = encryptText(base64, currentKey());
        ws.send(JSON.stringify({
            sender: username,
            audio: encryptedAudio,
            mime: blob.type,
            dur: durationSec
        }));
        playSuccessSound();
        appendAudioMessage(username, URL.createObjectURL(blob), durationSec);
    };
    reader.readAsDataURL(blob);
}

let activeAudio = null;

function appendAudioMessage(sender, url, durationSec) {
    const box = document.getElementById("chat-messages");
    if (!box) return;

    sender = String(sender);
    const isOwn = sender === username;

    const row = document.createElement("div");
    row.className = "msg-row";
    row.classList.add(isOwn ? "own" : "other");
    if (sender === lastMessageSender) row.classList.add("grouped");

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = sender.trim().charAt(0) || "?";
    avatar.style.backgroundColor = avatarColor(sender);

    const body = document.createElement("div");
    body.className = "msg-body";

    const meta = document.createElement("div");
    meta.className = "msg-meta";
    const senderElem = document.createElement("span");
    senderElem.className = "msg-sender";
    senderElem.textContent = sender;
    meta.appendChild(senderElem);

    const bubble = document.createElement("div");
    bubble.className = "msg audio-msg";

    const audio = new Audio(url);

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "audio-play-btn";
    playBtn.setAttribute("aria-label", "Play voice note");
    playBtn.innerHTML = '<svg class="icon icon-play"><use href="#icon-play"/></svg>' +
                        '<svg class="icon icon-pause"><use href="#icon-pause"/></svg>';

    const wave = document.createElement("div");
    wave.className = "audio-wave";
    const bars = [];
    const seed = durationSec + sender.length * 3;
    for (let i = 0; i < 24; i++) {
        const bar = document.createElement("span");
        bar.style.height = (22 + Math.round(Math.abs(Math.sin((i + 1) * seed * 1.7) * Math.cos(i * 0.9)) * 74)) + "%";
        wave.appendChild(bar);
        bars.push(bar);
    }
    function paintProgress(ratio) {
        const upto = Math.floor(ratio * bars.length);
        bars.forEach((b, i) => b.classList.toggle("played", i < upto));
    }

    const durElem = document.createElement("span");
    durElem.className = "audio-dur";
    durElem.textContent = formatSeconds(durationSec);

    playBtn.onclick = () => {
        playClickSound();
        if (audio.paused) {
            if (activeAudio && activeAudio !== audio) activeAudio.pause();
            activeAudio = audio;
            audio.play();
        } else {
            audio.pause();
        }
    };
    audio.onplay = () => bubble.classList.add("playing");
    audio.onpause = () => bubble.classList.remove("playing");
    audio.onended = () => {
        bubble.classList.remove("playing");
        audio.currentTime = 0;
        durElem.textContent = formatSeconds(durationSec);
        paintProgress(0);
    };
    audio.ontimeupdate = () => {
        if (audio.paused) return;
        durElem.textContent = formatSeconds(audio.currentTime);
        const total = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : durationSec;
        paintProgress(Math.min(1, audio.currentTime / total));
    };

    bubble.appendChild(playBtn);
    bubble.appendChild(wave);
    bubble.appendChild(durElem);

    body.appendChild(meta);
    body.appendChild(bubble);
    row.appendChild(avatar);
    row.appendChild(body);
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
    lastMessageSender = sender;
}

function checkEnter(e) {
    if (e.key === "Enter") sendMessageWithFX(e);
}

function wipeChat() {
    const box = document.getElementById("chat-messages");
    if (box) box.innerHTML = "";
    lastMessageSender = null;
}

let lastMessageSender = null;

function avatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) % 360;
    }
    return `hsl(${hash}, 58%, 46%)`;
}

function appendChatMessage(sender, text) {
    const box = document.getElementById("chat-messages");
    if (!box) return;

    sender = String(sender);
    const isOwn = sender === username;

    const row = document.createElement("div");
    row.className = "msg-row";
    row.classList.add(isOwn ? "own" : "other");
    if (sender === lastMessageSender) row.classList.add("grouped");

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = sender.trim().charAt(0) || "?";
    avatar.style.backgroundColor = avatarColor(sender);

    const body = document.createElement("div");
    body.className = "msg-body";

    const meta = document.createElement("div");
    meta.className = "msg-meta";

    const senderElem = document.createElement("span");
    senderElem.className = "msg-sender";
    senderElem.textContent = sender;

    const textElem = document.createElement("div");
    textElem.className = "msg";
    const textSpan = document.createElement("span");
    textSpan.className = "msg-text";
    textSpan.textContent = text;
    const timeIn = document.createElement("span");
    timeIn.className = "msg-time-in";
    timeIn.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    textElem.appendChild(textSpan);
    textElem.appendChild(timeIn);

    meta.appendChild(senderElem);
    body.appendChild(meta);
    body.appendChild(textElem);
    row.appendChild(avatar);
    row.appendChild(body);
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
    lastMessageSender = sender;
}

function appendSystemMessage(text) {
    const box = document.getElementById("chat-messages");
    if (!box) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = "sys-msg";
    msgDiv.textContent = text;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
    lastMessageSender = null;
}

function showError(msg) {
    const errDiv = document.getElementById("error-message");
    if (!errDiv) return;

    if (msg) {
        errDiv.textContent = msg;
        errDiv.className = "error-msg";
        void errDiv.offsetWidth;
        errDiv.classList.add("shake");
    } else {
        errDiv.textContent = "";
        errDiv.classList.add("hidden");
    }
}

function disconnect() {
    stopRecording();
    if (ws) ws.close();
}