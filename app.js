const BG_KEY = "flame-realm-bg";

const BACKGROUNDS = {
    embers: { label: "Embers", burst: ["#ff5722", "#ff9800"] },
    galaxy: { label: "Galaxy", burst: ["#a78bfa", "#f0abfc"] },
    ocean:  { label: "Ocean",  burst: ["#22d3ee", "#67e8f9"] },
    sakura: { label: "Sakura", burst: ["#f9a8d4", "#f472b6"] },
    matrix: { label: "Matrix", burst: ["#22c55e", "#86efac"] }
};
let bgMode = "embers";

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

/* ================= Animated interactive backgrounds ================= */
const canvas = document.getElementById('particles-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let bursts = [];
let shootingStars = [];
const mouse = { x: -9999, y: -9999 };
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

function rnd(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const MATRIX_CHARS = "アィウェオカキクケコサシスセソタチツテト0123456789";

function initBackground() {
    particles = [];
    shootingStars = [];
    if (!canvas) return;
    const w = canvas.width, h = canvas.height;
    if (bgMode === "embers") {
        for (let i = 0; i < 35; i++) particles.push({ x: rnd(0, w), y: rnd(0, h), size: rnd(0.6, 2.4), vy: rnd(0.5, 1.7), vx: rnd(-0.4, 0.4), o: rnd(0.2, 1), c: Math.random() > 0.3 ? "#ff5722" : "#ff9800" });
    } else if (bgMode === "galaxy") {
        for (let i = 0; i < 150; i++) particles.push({ x: rnd(0, w), y: rnd(0, h), z: rnd(0.15, 1), size: rnd(0.4, 1.9), ph: rnd(0, 6.28), sp: rnd(0.4, 1.8), c: pick(["#ffffff", "#c7d2fe", "#f0abfc"]) });
    } else if (bgMode === "ocean") {
        for (let i = 0; i < 42; i++) particles.push({ x: rnd(0, w), y: rnd(0, h), r: rnd(2, 9), vy: rnd(0.3, 1.1), ph: rnd(0, 6.28), o: rnd(0.15, 0.5) });
    } else if (bgMode === "sakura") {
        for (let i = 0; i < 32; i++) particles.push({ x: rnd(0, w), y: rnd(-h, h), s: rnd(4, 9), vy: rnd(0.5, 1.4), vx: rnd(-0.3, 0.3), rot: rnd(0, 6.28), vr: rnd(-0.03, 0.03), ph: rnd(0, 6.28), c: pick(["#f9a8d4", "#f472b6", "#fbcfe8"]) });
    } else if (bgMode === "matrix") {
        const cols = Math.ceil(w / 18);
        for (let i = 0; i < cols; i++) particles.push({ x: i * 18 + 4, y: rnd(-h, 0), sp: rnd(2.2, 6.5), len: Math.floor(rnd(6, 16)) });
    }
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBackground();
}
window.addEventListener('resize', resizeCanvas);

function createParticleBurst(x, y) {
    if (REDUCED_MOTION) return;
    const palette = (BACKGROUNDS[bgMode] || BACKGROUNDS.embers).burst;
    for (let i = 0; i < 14; i++) {
        bursts.push({ x, y, vx: rnd(-3.2, 3.2), vy: rnd(-3.2, 3.2), size: rnd(1.2, 3.8), o: 1, c: pick(palette) });
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
    requestAnimationFrame(animateParticles);
    if (!ctx || !canvas) return;
    const w = canvas.width, h = canvas.height;
    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, w, h);
    if (REDUCED_MOTION) return;

    if (bgMode === "embers") {
        for (const p of particles) {
            p.y -= p.vy; p.x += p.vx; p.o -= 0.002;
            const dx = p.x - mouse.x, dy = p.y - mouse.y;
            if (dx * dx + dy * dy < 12100) p.x += Math.sign(dx) * 0.6;
            if (p.y < -5 || p.o <= 0) { p.x = rnd(0, w); p.y = h + rnd(0, 20); p.o = rnd(0.2, 1); }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283);
            ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, p.o);
            ctx.shadowBlur = 6; ctx.shadowColor = p.c; ctx.fill();
        }
    } else if (bgMode === "galaxy") {
        const mx = mouse.x < 0 ? w / 2 : mouse.x, my = mouse.y < 0 ? h / 2 : mouse.y;
        for (const p of particles) {
            const px = p.x + (mx - w / 2) * -0.025 * p.z;
            const py = p.y + (my - h / 2) * -0.025 * p.z;
            ctx.beginPath(); ctx.arc(px, py, p.size, 0, 6.283);
            ctx.fillStyle = p.c;
            ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(t * p.sp + p.ph));
            ctx.shadowBlur = 4; ctx.shadowColor = p.c; ctx.fill();
        }
        if (Math.random() < 0.004) shootingStars.push({ x: rnd(w * 0.3, w), y: rnd(0, h * 0.35), vx: -9, vy: 3.5, life: 1 });
        for (const st of shootingStars) {
            st.x += st.vx; st.y += st.vy; st.life -= 0.025;
            if (st.life <= 0) continue;
            ctx.globalAlpha = st.life;
            ctx.strokeStyle = "#e0e7ff"; ctx.lineWidth = 1.6; ctx.shadowBlur = 8; ctx.shadowColor = "#c7d2fe";
            ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(st.x - st.vx * 5, st.y - st.vy * 5); ctx.stroke();
        }
        shootingStars = shootingStars.filter(st => st.life > 0);
    } else if (bgMode === "ocean") {
        for (const p of particles) {
            p.y -= p.vy;
            const px = p.x + Math.sin(t * 1.5 + p.ph) * 8;
            const dx = px - mouse.x, dy = p.y - mouse.y;
            if (dx * dx + dy * dy < 12100) { p.x += Math.sign(dx) * 1.2; p.y += Math.sign(dy) * 0.8; }
            if (p.y < -12) { p.y = h + rnd(5, 30); p.x = rnd(0, w); }
            ctx.globalAlpha = p.o;
            ctx.strokeStyle = "#67e8f9"; ctx.lineWidth = 1.2;
            ctx.shadowBlur = 5; ctx.shadowColor = "#22d3ee";
            ctx.beginPath(); ctx.arc(px, p.y, p.r, 0, 6.283); ctx.stroke();
            ctx.beginPath(); ctx.arc(px - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.22, 0, 6.283);
            ctx.fillStyle = "#cffafe"; ctx.fill();
        }
    } else if (bgMode === "sakura") {
        for (const p of particles) {
            p.y += p.vy; p.x += p.vx + Math.sin(t + p.ph) * 0.6; p.rot += p.vr;
            const dx = p.x - mouse.x, dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 16900 && d2 > 1) { const d = Math.sqrt(d2); p.x += (-dy / d) * 1.4; p.y += (dx / d) * 1.4; }
            if (p.y > h + 12) { p.y = rnd(-40, -10); p.x = rnd(0, w); }
            if (p.x > w + 15) p.x = -10; if (p.x < -15) p.x = w + 10;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.globalAlpha = 0.85; ctx.fillStyle = p.c;
            ctx.shadowBlur = 3; ctx.shadowColor = p.c;
            ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.58, 0, 0, 6.283); ctx.fill();
            ctx.restore();
        }
    } else if (bgMode === "matrix") {
        ctx.font = "15px monospace";
        for (const p of particles) {
            const boost = Math.abs(p.x - mouse.x) < 40 ? 1.8 : 1;
            p.y += p.sp * boost;
            for (let j = 0; j < p.len; j++) {
                const cy = p.y - j * 18;
                if (cy < -20 || cy > h + 20) continue;
                ctx.globalAlpha = j === 0 ? 0.95 : (1 - j / p.len) * 0.55;
                ctx.fillStyle = j === 0 ? "#d9ffe3" : "#22c55e";
                ctx.shadowBlur = j === 0 ? 8 : 0; ctx.shadowColor = "#22c55e";
                ctx.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)], p.x, cy);
            }
            if (p.y - p.len * 18 > h) { p.y = rnd(-400, 0); p.sp = rnd(2.2, 6.5); p.len = Math.floor(rnd(6, 16)); }
        }
    }

    for (const b of bursts) {
        b.x += b.vx; b.y += b.vy; b.o -= 0.028;
        if (b.o <= 0) continue;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size, 0, 6.283);
        ctx.fillStyle = b.c; ctx.globalAlpha = b.o;
        ctx.shadowBlur = 6; ctx.shadowColor = b.c; ctx.fill();
    }
    bursts = bursts.filter(b => b.o > 0);
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
}
resizeCanvas();
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

function applyBackground(id) {
    if (!BACKGROUNDS[id]) id = "embers";
    bgMode = id;
    document.body.dataset.bg = id;
    document.querySelectorAll(".bg-chip").forEach(chip => {
        chip.setAttribute("aria-pressed", chip.dataset.bg === id ? "true" : "false");
    });
    initBackground();
}

function selectBackground(id, event) {
    playClickSound();
    applyBackground(id);
    try { localStorage.setItem(BG_KEY, id); } catch (e) {}
    burstFromEvent(event);
    closeBgMenu();
}

function toggleBgMenu(event) {
    playClickSound();
    if (event) event.stopPropagation();
    const menu = document.getElementById("bg-menu");
    if (menu) menu.classList.toggle("open");
}

function closeBgMenu() {
    const menu = document.getElementById("bg-menu");
    if (menu) menu.classList.remove("open");
}

document.addEventListener("click", (e) => {
    const menu = document.getElementById("bg-menu");
    if (menu && menu.classList.contains("open") && !e.target.closest("#bg-menu") && !e.target.closest(".bg-btn")) {
        closeBgMenu();
    }
    if (!e.target.closest("button, input, label, a, .msg")) {
        createParticleBurst(e.clientX, e.clientY);
    }
});

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
    let saved = null, bg = null;
    try {
        saved = localStorage.getItem(THEME_KEY);
        bg = localStorage.getItem(BG_KEY);
    } catch (e) {}
    applyTheme(saved === "light" ? "light" : "dark");
    applyBackground(bg || "embers");
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
        input.placeholder = active ? "Recording… 0:00" : "Set your heart ablaze...";
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