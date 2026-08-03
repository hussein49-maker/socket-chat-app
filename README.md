# 🔥 Flame Realm P2P - Encrypted Socket Chat App

An interactive, lightweight, encrypted Peer-to-Peer (P2P) chat application featuring real-time WebSockets communication, dark/light theme options, dynamic ember canvas particles, and Animate.css / Lottie animations.

---

## ✨ Features

* **⚡ Real-Time P2P WebSockets:** Low-latency bi-directional messaging between Server and Client instances.
* **🎨 Flame Realm Aesthetics:** Dynamic HTML5 Canvas particles effect, Custom Anime Character interaction bars, and smooth sound effects (Web Audio API).
* **🎭 Animate.css & Lottie Integration:** Lightweight UI transitions and smooth JSON-based vector illustrations.
* **🌓 Dual Theme Support:** Seamless toggle between Dark Mode and Light Mode.
* **📱 Fully Responsive:** Compact & optimized layout fitting perfectly across Mobile and Desktop displays.

---

## ⚙️ How It Works (Architecture)

1. **Backend Relay / Listener (`server.py`):**
   * Built using Python's `asyncio` and `websockets` libraries.
   * Acts as an event-driven relay server listening on a specified host IP and Port (`127.0.0.1:8765` by default).
   * Manages incoming client connections, processes key exchange payloads, and routes encrypted JSON messages between connected peers.

2. **Frontend UI & Audio Engine (`app.js`, `index.html`, `style.css`):**
   * **Networking:** Establishes a native asynchronous `WebSocket` connection directly from the browser.
   * **Visual Effects:** Renders a real-time animated ember particle background via an HTML5 `<canvas>` loop.
   * **Audio FX:** Uses the Web Audio API to generate real-time synthesized sound cues for clicks and success states without external audio files.
   * **Animations:** Leverages `Animate.css` classes for micro-interactions and `@dotlottie/player-component` for ultra-lightweight JSON-based visual illustrations.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **UI & Animations:** Animate.css, dotLottie Player
* **Network Protocol:** Native WebSockets (`ws://`)
* **Backend Engine:** Python (`asyncio`, `websockets`)

---

## 🚀 Installation & Setup

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your operating system:
```bash
python --version