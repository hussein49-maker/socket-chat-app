# 🔥 Flame Realm E2EE — Secure WebSocket Chat App

<div align="center">

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python&logoColor=white)
![WebSockets](https://img.shields.io/badge/Protocol-WebSockets-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Made with](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F%20%2B%20%F0%9F%94%A5-red)

**An advanced, real-time, end-to-end encrypted (E2EE) chat application** built with Python WebSockets and modern JavaScript — wrapped in an immersive, anime-inspired "flame realm" aesthetic.

</div>

---

## 📖 Overview

**Flame Realm E2EE** is a lightweight yet security-conscious chat platform designed to demonstrate how real-time messaging, client-side cryptography, and ephemeral data handling can coexist with a visually striking, animated interface. Every message that passes through the relay server is encrypted before it leaves the browser and only decrypted on the receiving client — the server itself never has access to plaintext content.

Beyond encryption, the project focuses on **data minimalism**: nothing is written to disk, no database is used, and the moment a chat room empties out, every trace of the conversation is wiped from server memory. This makes Flame Realm ideal as a learning reference for WebSocket architecture, applied cryptography concepts, and ephemeral-by-design systems.

---

## ✨ Key Features

### 🔐 Security & Privacy
| Feature | Description |
|---|---|
| **Silent E2EE** | Messages are encrypted/decrypted transparently in the background — no manual key exchange prompts or visible crypto clutter in the UI. |
| **Dynamic Key Rotation** | The backend cycles session keys on a timer (`rotate_key_periodically`) to strengthen forward secrecy. |
| **Zero-Persistence Design** | No database, no disk writes — all state lives in memory only, for the lifetime of the room. |
| **Automatic Memory Purging** | The instant the last participant disconnects (`len(CONNECTED_CLIENTS) == 0`), `CHAT_HISTORY.clear()` fires immediately, permanently erasing the room's history. |
| **In-Memory Session Isolation** | Each room's session key and history are isolated from other rooms running on the same server instance. |

### ⚡ Real-Time Communication
- Low-latency, bi-directional messaging powered by Python's `asyncio` + `websockets`.
- Event-driven relay architecture that broadcasts encrypted payloads to all connected peers without inspecting their contents.
- Structured frame types (`INIT`, `HISTORY`, encrypted message payloads) for clean client/server negotiation.

### 🎨 Immersive UI/UX
- **Flame Realm Aesthetics** — animated HTML5 Canvas ember/particle effects that drift across the background.
- Anime-inspired interaction bars, hover states, and message transitions powered by **Animate.css**.
- Procedurally synthesized sound effects via the **Web Audio API** — no external audio files required.
- **Dual Theme Support** — smooth Dark Mode ⇄ Light Mode toggle with persisted CSS variable theming.
- **Fully Responsive** layout, optimized for both desktop and mobile viewports.

---

## ⚙️ Architecture & How It Works

```
┌──────────────────────┐         WebSocket (ws://)        ┌──────────────────────┐
│   Client (Browser)   │ ◄──────────────────────────────► │   Server (Python)    │
│                       │                                   │                       │
│  app.js               │   INIT / HISTORY / ENC_PAYLOAD    │  server.py            │
│  ├─ Crypto Engine     │ ◄──────────────────────────────► │  ├─ asyncio event loop│
│  ├─ Canvas FX         │                                   │  ├─ CONNECTED_CLIENTS │
│  ├─ Web Audio API     │                                   │  ├─ CHAT_HISTORY      │
│  └─ Theme Engine      │                                   │  └─ Key Rotation Task │
└──────────────────────┘                                   └──────────────────────┘
```

### 1. Backend Relay & Security Engine (`server.py`)
- Built on Python's `asyncio` event loop and the `websockets` library for fully asynchronous, non-blocking connection handling.
- Acts purely as an **encrypted relay** — it forwards payloads between peers without ever decrypting or inspecting message content.
- **`rotate_key_periodically`**: a background coroutine that rotates the active session key at fixed intervals, limiting the exposure window of any single key.
- **`CHAT_HISTORY`**: an in-memory buffer that lets newly-joined participants catch up on recent room activity — never written to disk.
- **Security Trigger**: continuously monitors `CONNECTED_CLIENTS`. The moment the count reaches zero, it immediately clears `CHAT_HISTORY`, guaranteeing that an empty room starts completely fresh with no leftover data.

### 2. Frontend UI & Cryptographic Engine (`app.js`, `index.html`, `style.css`)
- **Networking Layer**: opens and maintains the WebSocket connection, silently handling the `INIT`, `HISTORY`, and encrypted payload frame types.
- **Symmetric Cryptography**: encrypts outgoing text and decrypts incoming payloads using the currently active session key, entirely client-side.
- **Visual FX Layer**: renders the animated ember/particle system on an HTML5 `<canvas>` element, layered beneath the chat UI.
- **Audio Layer**: generates short synthesized tones for events like message send/receive using the Web Audio API's oscillator nodes.
- **Theme Engine**: toggles a set of CSS custom properties to switch between Dark and Light modes without a page reload.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **UI & Styling** | Animate.css, Custom CSS Variables, HTML5 Canvas |
| **Audio** | Web Audio API (synthesized, no media assets) |
| **Network Protocol** | Native WebSockets (`ws://`) |
| **Backend Engine** | Python 3.8+, `asyncio`, `websockets`, `secrets` |

---

## 🚀 Installation & Setup

### 1. Prerequisites
Ensure you have **Python 3.8+** installed:
```bash
python --version
```

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/flame-realm-e2ee.git
cd flame-realm-e2ee
```

### 3. Install Dependencies
```bash
pip install websockets
```

### 4. Run the Server
```bash
python server.py
```
By default the relay server listens on `ws://localhost:8765` (adjust the host/port in `server.py` if needed).

### 5. Launch the Client
Open `index.html` in your browser, or serve it with a lightweight local server:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

---

## 📂 Suggested Project Structure

```
flame-realm-e2ee/
├── server.py          # Async WebSocket relay + key rotation + memory purge logic
├── index.html          # Main chat UI markup
├── app.js               # Client networking + crypto engine + FX + audio
├── style.css            # Flame Realm theme (dark/light variables, animations)
└── README.md            # Project documentation
```

---

## 🔒 Security Notes

- This project is intended as an **educational / demonstration** implementation of E2EE concepts over WebSockets — treat it as a learning reference rather than a production-hardened messaging system.
- Because the server never decrypts message content, it functions as a "blind" relay — but proper key exchange and rotation implementation on the client side is essential to the security guarantees actually holding.
- No message history is ever persisted to disk; everything lives in process memory and is wiped when a room empties.

---

## 🗺️ Roadmap Ideas

- [ ] Optional password-protected rooms
- [ ] File/image sharing with client-side encryption
- [ ] Typing indicators and read receipts
- [ ] Multi-room support with room codes
- [ ] Configurable key-rotation interval via environment variables

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to fork the repository and submit a pull request.

## 📜 License

This project is licensed under the **MIT License** — see the `LICENSE` file for details.

---

<div align="center">

Made with 🔥 by the Flame Realm team

</div>
