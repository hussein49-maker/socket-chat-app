import asyncio
import websockets
import json
import secrets
import string

CONNECTED_CLIENTS = set()

CHAT_HISTORY = []

# Key rotation interval (seconds). The key changes every 20 minutes.
KEY_ROTATION_INTERVAL = 20 * 60

def generate_complex_key(length=32):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

# List of session keys. The last one is the active key; older ones are kept
# so clients can still decrypt history encrypted under a previous key.
SESSION_KEYS = [generate_complex_key()]


async def broadcast(payload, exclude=None):
    removals = set()
    for client in CONNECTED_CLIENTS:
        if client is exclude:
            continue
        try:
            await client.send(payload)
        except websockets.exceptions.ConnectionClosed:
            removals.add(client)
    CONNECTED_CLIENTS.difference_update(removals)


async def rotate_key_periodically():
    while True:
        await asyncio.sleep(KEY_ROTATION_INTERVAL)
        SESSION_KEYS.append(generate_complex_key())
        rotation_payload = json.dumps({
            "type": "KEY_ROTATION",
            "key": SESSION_KEYS[-1],
            "kid": len(SESSION_KEYS) - 1
        })
        await broadcast(rotation_payload)
        print("[KEY ROTATED] New session key generated and pushed to "
              f"{len(CONNECTED_CLIENTS)} client(s).")


async def handler(websocket):
    CONNECTED_CLIENTS.add(websocket)
    print(f"[+] Client connected. Active clients: {len(CONNECTED_CLIENTS)}")

    # Send every session key so the client can decrypt history too.
    init_payload = json.dumps({
        "type": "INIT",
        "keys": SESSION_KEYS
    })
    await websocket.send(init_payload)

    if CHAT_HISTORY:
        history_payload = json.dumps({
            "type": "HISTORY",
            "messages": CHAT_HISTORY
        })
        await websocket.send(history_payload)

    try:
        async for message in websocket:
            try:
                data = json.loads(message)
            except json.JSONDecodeError:
                continue

            # Text messages carry "ciphertext"; voice notes carry "audio".
            # Both are encrypted client-side; the server only tags which
            # key generation ("kid") was active, stores and relays them.
            if "sender" in data and ("ciphertext" in data or "audio" in data):
                data["kid"] = len(SESSION_KEYS) - 1
                CHAT_HISTORY.append(data)
                await broadcast(json.dumps(data), exclude=websocket)

    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        CONNECTED_CLIENTS.discard(websocket)
        print(f"[-] Client disconnected. Active clients: {len(CONNECTED_CLIENTS)}")

        if len(CONNECTED_CLIENTS) == 0:
            CHAT_HISTORY.clear()
            SESSION_KEYS[:] = [generate_complex_key()]
            print("[SECURITY WIPE] All clients left. Chat history wiped and "
                  "session keys reset.")


async def main():
    PORT = 8765
    print(f"[SERVER STARTED] Secure relay running on port {PORT}...")
    print(f"[KEY POLICY] Session key rotates every {KEY_ROTATION_INTERVAL // 60} minutes.")
    async with websockets.serve(handler, "0.0.0.0", PORT):
        asyncio.create_task(rotate_key_periodically())
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
