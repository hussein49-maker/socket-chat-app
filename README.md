# 🔐 Encrypted Chat — Version 1.5

<div align="center">

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?logo=python&logoColor=white)
![WebSockets](https://img.shields.io/badge/Protocol-WebSockets-orange)
![Version](https://img.shields.io/badge/Version-1.5-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

**Encrypted Chat v1.5** (codename **Flame Realm**) — a real-time, encrypted chat application
built with Python WebSockets and modern vanilla JavaScript: text + voice messages,
rotating session keys, five animated interactive backgrounds, and a polished
messenger-grade UI in dark and light modes.

</div>

---

## 📖 Overview

Encrypted Chat is a lightweight, security-conscious chat platform. Messages and voice
notes are encrypted in the browser before they are sent; the Python relay server only
stores and forwards ciphertext. Nothing is written to disk — when the last participant
leaves, the entire room history and all session keys are wiped from memory.

> ⚠️ **Educational project.** The cipher is a symmetric XOR with a server-distributed
> rotating key — great for learning WebSocket architecture and crypto concepts, but not
> production-grade end-to-end encryption (the server knows the key). See
> [Security Notes](#-security-notes).

---

## 🆕 What's New in Version 1.5

### v1.5 — Background gallery & single identity
- 🎨 **Change Background option in the top bar** (login + chat header): a palette menu
  with five animated, mouse-interactive canvas scenes, each with its own accent palette:
  | Background | Scene | Interaction |
  |---|---|---|
  | **Embers** 🔥 | rising sparks (default) | sparks drift away from the cursor |
  | **Galaxy** ✨ | twinkling stars + shooting stars | parallax follows the mouse |
  | **Ocean** 🌊 | glowing bubbles rising | bubbles are pushed by the cursor |
  | **Sakura** 🌸 | falling rotating petals | petals swirl around the cursor |
  | **Matrix** 🟢 | katakana digital rain | columns near the cursor fall faster |
- Clicking empty space sparks a particle burst in the scene's colors; the choice is
  saved in `localStorage`.
- The earlier brand-name skins (Messenger / WhatsApp / Telegram) were removed — the app
  shows a single identity everywhere.

### v1.4 — Visual polish pass
- Deeper near-black surfaces, 20px message bubbles with chat "tails", soft shadows.
- Timestamps moved **inside** the bubbles (bottom-right, subtle).
- Voice notes render a real **24-bar waveform** that fills with the accent color as
  playback progresses and gently pulses while playing.
- Floating pill composer, ringed avatar logo in the header, roomier message rhythm.

### v1.3 — Motion system
- Removed the Animate.css dependency; replaced with a small custom motion system:
  spring-eased entrances (~300 ms), faster exits (~180 ms), crossfading screens,
  soft message slide-ins, a gentle error shake, press-scale feedback on buttons.
- All animations use transform/opacity only and respect `prefers-reduced-motion`.

### v1.2 — Encrypted voice notes 🎙️
- Record audio in the browser (MediaRecorder), encrypt the bytes with the active
  session key exactly like text, and play back in an in-chat player. The server only
  ever relays audio ciphertext. Auto-stop at 60 seconds.

### v1.1 — Key rotation that actually works 🔑
- The server generates a fresh session key **every 20 minutes** and pushes it to all
  connected clients (`KEY_ROTATION` frame).
- Every message is tagged with the key generation (`kid`) it was encrypted under, and
  `INIT` delivers the full key list — so late joiners can decrypt history from before
  a rotation. Keys reset when the room empties.

### v1.0 — Full UI redesign
- Messenger-style layout: own messages right in gradient bubbles, others left with
  colored initial avatars, names, and message grouping.
- Login screen with role selection, labelled fields and validation.
- Dark/Light theme toggle, persisted across visits.
- Procedural sound effects (Web Audio API), ember particle canvas, E2EE badge.

---

## ⚙️ Architecture

```
┌───────────────────────┐      WebSocket (ws://)       ┌───────────────────────┐
│   Client (Browser)    │ ◄──────────────────────────► │   Server (Python)     │
│  app.js               │  INIT / HISTORY /            │  server.py            │
│  ├─ Crypto (XOR+kid)  │  KEY_ROTATION /              │  ├─ asyncio relay     │
│  ├─ Voice recorder    │  encrypted text & audio      │  ├─ SESSION_KEYS[]    │
│  ├─ Background engine │                              │  ├─ CHAT_HISTORY[]    │
│  ├─ Motion system     │                              │  └─ 20-min rotation   │
│  └─ Theme engine      │                              │      + memory wipe    │
└───────────────────────┘                              └───────────────────────┘
```

- **`server.py`** — async relay built on `asyncio` + `websockets`. Never decrypts
  content; tags each message with the active key generation, broadcasts rotations,
  wipes history and keys when the room empties.
- **`app.js`** — networking, crypto, voice recording/playback, the five-scene canvas
  background engine, motion system, theme + background persistence.
- **`index.html` / `style.css`** — semantic markup, inline SVG icon sprites, CSS
  custom-property theming (dark/light × five accent palettes).

---

## 🚀 How to Run

### 1. Requirements
- **Python 3.8+** — check with `python --version` (on Windows try `py --version`)
- **Git** (to clone)
- A modern browser (Chrome, Edge, Firefox)

### 2. Get the code
```bash
git clone https://github.com/hussein49-maker/socket-chat-app.git
cd socket-chat-app
```

### 3. Install the one dependency
```bash
pip install websockets
```

### 4. Start the chat server *(terminal 1 — keep it open)*
```bash
python server.py
```
You should see:
```
[SERVER STARTED] Secure relay running on port 8765...
[KEY POLICY] Session key rotates every 20 minutes.
```

### 5. Serve the web client *(terminal 2 — keep it open)*
```bash
python -m http.server 8000
```

### 6. Open the app
Go to **http://localhost:8000** in your browser.
Open it in **two tabs** (different username in each) to chat with yourself.

- **Port field** in the login form = `8765` (the chat server) — *not* 8000.
- 🎙️ Click the mic button and allow microphone access to send a voice note.
- 🎨 Click the palette button (top bar) to change the background.
- 🌙 The sun/moon button toggles dark/light mode.

### Chat from another device (same Wi-Fi)
1. Find your computer's local IP (e.g. `192.168.1.5`) — `ipconfig` on Windows.
2. On the phone open `http://192.168.1.5:8000` and type that same IP in the login form.
3. Note: browsers block the microphone on non-HTTPS addresses, so voice notes work
   only on `localhost` — text chat works everywhere.

### Troubleshooting
| Problem | Fix |
|---|---|
| `python` not recognized (Windows) | use `py` instead, or reinstall Python with "Add to PATH" checked |
| "Cannot connect to Server" | make sure terminal 1 shows `[SERVER STARTED]`, and the Port field is `8765` |
| Mic button says access denied | allow the microphone permission, and use `http://localhost:8000` |
| Port already in use | close the old terminal windows, or change the port in `server.py` |

---

## 📂 Project Structure

```
socket-chat-app/
├── server.py        # Async WebSocket relay + key rotation + memory wipe
├── index.html       # Markup: login, chat, icon sprites, background menu
├── app.js           # Networking, crypto, voice notes, backgrounds, motion
├── style.css        # Theming (dark/light × 5 palettes), motion tokens
└── README.md        # This file
```

---

## 🔒 Security Notes

- Messages and voice notes are encrypted client-side and the server relays only
  ciphertext; history lives in memory and is destroyed when the room empties.
- **However**: the session key is generated by the server and delivered to clients over
  the socket, and the cipher is a repeating-key XOR. The server (or anyone reading the
  `ws://` traffic) can decrypt everything. Treat this as a learning reference, not a
  secure messenger.
- Planned upgrade: browser-side key agreement (Web Crypto, AES-GCM) so the server never
  sees key material.

---

## 🗺️ Roadmap

- [ ] Real E2EE: Web Crypto key exchange + AES-GCM, server never holds keys
- [ ] Emoji reactions on messages
- [x] Encrypted voice notes
- [x] Animated interactive backgrounds
- [ ] File/image sharing with client-side encryption
- [ ] Typing indicators and read receipts
- [ ] Multi-room support with room codes

---

## 📜 License

MIT — free to use, learn from, and build upon.

<div align="center">

Made with ❤️ + 🔥

</div>
