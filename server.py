import asyncio
import websockets
import json
import secrets
import string

CONNECTED_CLIENTS = set()

CHAT_HISTORY = []

def generate_complex_key(length=32):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

CURRENT_SECRET_KEY = generate_complex_key()

async def rotate_key_periodically():
    global CURRENT_SECRET_KEY
    while True:
        await asyncio.sleep(3600)  
        CURRENT_SECRET_KEY = generate_complex_key()
        print(f"[KEY ROTATED] New Background Session Key Generated.")

async def handler(websocket):
    global CONNECTED_CLIENTS, CHAT_HISTORY
    CONNECTED_CLIENTS.add(websocket)
    print(f"[+] Client connected. Active clients: {len(CONNECTED_CLIENTS)}")
    
    
    init_payload = json.dumps({
        "type": "INIT",
        "key": CURRENT_SECRET_KEY
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
            data = json.loads(message)
            
            
            if "sender" in data and "ciphertext" in data:
                CHAT_HISTORY.append(data)

            
            removals = set()
            for client in CONNECTED_CLIENTS:
                if client != websocket:
                    try:
                        await client.send(message)
                    except websockets.exceptions.ConnectionClosed:
                        removals.add(client)
            CONNECTED_CLIENTS.difference_update(removals)
            
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        CONNECTED_CLIENTS.remove(websocket)
        print(f"[-] Client disconnected. Active clients: {len(CONNECTED_CLIENTS)}")
        
        
        if len(CONNECTED_CLIENTS) == 0:
            CHAT_HISTORY.clear()
            print("[SECURITY WIPE] All clients left. Chat history completely wiped from server memory.")

async def main():
    PORT = 8765
    print(f"[SERVER STARTED] Secure relay running on port {PORT}...")
    async with websockets.serve(handler, "0.0.0.0", PORT):
        asyncio.create_task(rotate_key_periodically())
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[SERVER STOPPED] Server shut down and all history wiped.")