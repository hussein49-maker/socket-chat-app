let ws = null;
let username = "";
let currentSessionKey = "InitialDefaultKey1234567890ABCDEF";

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
        this.color = Math.random() > 0.3 ? '#ff5722' : '#ff9800';
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
    for (let i = 0; i < 15; i++) {
        particles.push(new EmberParticle(x, y, true));
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
    if (event) createParticleBurst(event.clientX, event.clientY);
    const elem = document.getElementById("anime-quote");
    if (char === 'rengoku') {
        if (elem) elem.textContent = "Flame Hashira: Kyojuro Rengoku!";
    } else if (char === 'tanjiro') {
        if (elem) elem.textContent = "Water Hashira: Tanjiro Kamado!";
    }
}

function toggleTheme() {
    playClickSound();
    const body = document.body;
    const btn = document.getElementById("theme-toggle-btn");
    if (body.classList.contains("dark-mode")) {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        btn.textContent = "🌙 Dark Mode";
    } else {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        btn.textContent = "☀️ Light Mode";
    }
}

async function handleConnectWithAnimation(event) {
    playClickSound();
    if (event) createParticleBurst(event.clientX, event.clientY);
    updateAnimeQuote();
    await processRoleSelection();
}

function sendMessageWithFX(event) {
    playClickSound();
    if (event) createParticleBurst(event.clientX, event.clientY);
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
        login.classList.add("animate__fadeOutUp");
        setTimeout(() => {
            login.classList.add("hidden");
            login.classList.remove("animate__fadeOutUp");
            chat.classList.remove("hidden");
            chat.classList.add("animate__backInDown");
        }, 400);
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
            currentSessionKey = data.key;
            return;
        }
        if (data.type === "HISTORY") {
            
            data.messages.forEach(msg => {
                const plainText = decryptText(msg.ciphertext, currentSessionKey);
                appendChatMessage(msg.sender, plainText);
            });
            return;
        }

        if (data.sender && data.ciphertext) {
            
            const plainText = decryptText(data.ciphertext, currentSessionKey);
            appendChatMessage(data.sender, plainText);
        }
    } catch (err) {}
}

function handleDisconnect() {
    playClickSound();
    const login = document.getElementById("login-screen");
    const chat = document.getElementById("chat-screen");

    if (login && chat) {
        chat.classList.add("hidden");
        login.classList.remove("hidden");
        login.classList.add("animate__zoomIn");
    }
    wipeChat();
}

function sendMessage() {
    const input = document.getElementById("message-input");
    if (!input) return;

    const text = input.value.trim();

    if (text && ws && ws.readyState === WebSocket.OPEN) {
        
        const ciphertext = encryptText(text, currentSessionKey);

        const payload = JSON.stringify({
            sender: username,
            ciphertext: ciphertext
        });

        ws.send(payload);

        
        appendChatMessage(username, text);
        input.value = "";
    }
}

function checkEnter(e) {
    if (e.key === "Enter") sendMessageWithFX(e);
}

function wipeChat() {
    const box = document.getElementById("chat-messages");
    if (box) box.innerHTML = "";
}

function appendChatMessage(sender, text) {
    const box = document.getElementById("chat-messages");
    if (!box) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = "msg animate__animated animate__fadeInUp animate__faster";
    
    const senderElem = document.createElement("strong");
    senderElem.style.color = "var(--accent-color)";
    senderElem.textContent = sender + ": ";

    const textElem = document.createElement("span");
    textElem.textContent = text;

    msgDiv.appendChild(senderElem);
    msgDiv.appendChild(textElem);
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
}

function appendSystemMessage(text) {
    const box = document.getElementById("chat-messages");
    if (!box) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = "sys-msg animate__animated animate__fadeIn";
    msgDiv.textContent = text;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
}

function showError(msg) {
    const errDiv = document.getElementById("error-message");
    if (!errDiv) return;

    if (msg) {
        errDiv.textContent = msg;
        errDiv.classList.remove("hidden");
        errDiv.className = "error-msg animate__animated animate__shakeX";
    } else {
        errDiv.textContent = "";
        errDiv.classList.add("hidden");
    }
}

function disconnect() {
    if (ws) ws.close();
}