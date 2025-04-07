import asyncio
import websockets
import json
import random
import string
from aiohttp import web
import os

# Stockage : { "CODE": { "name": str, "data": str, "downloads": int, "host_ws": WebSocket } }
files = {}
connections = set()  # Toutes les connexions WebSocket

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase, k=4))

async def ws_handler(websocket, path):
    connections.add(websocket)
    code = None

    try:
        async for message in websocket:
            data = json.loads(message)
            
            # Hôte upload un fichier
            if data.get("action") == "upload":
                code = generate_code()
                files[code] = {
                    "name": data["name"],
                    "data": data["data"],
                    "downloads": 0,
                    "host_ws": websocket
                }
                await websocket.send(json.dumps({
                    "type": "link",
                    "code": code
                }))

            # Actualisation de l'UI
            elif data.get("action") == "ping":
                if code in files:
                    await websocket.send(json.dumps({
                        "type": "stats",
                        "downloads": files[code]["downloads"]
                    }))

    finally:
        connections.discard(websocket)
        if code in files:
            del files[code]  # Nettoyage

async def http_handler(request):
    code = request.match_info.get("code")
    if code in files:
        files[code]["downloads"] += 1
        
        # Notifie TOUS les hôtes (pour multi-onglets)
        for ws in connections:
            if ws == files[code]["host_ws"]:
                await ws.send(json.dumps({
                    "type": "stats",
                    "downloads": files[code]["downloads"]
                }))
        
        file = files[code]
        return web.Response(
            body=file["data"].encode(),
            headers={
                "Content-Type": "application/octet-stream",
                "Content-Disposition": f'attachment; filename="{file["name"]}"'
            }
        )
    return web.Response(text="Fichier expiré", status=410)

# Add static route handler
async def index_handler(request):
    return web.FileResponse('web/dist/index.html')

# Modify the app setup
app = web.Application()
app.add_routes([
    web.get("/{code}", http_handler),
    web.get("/", index_handler),
    web.static('/', 'web/dist')
])

async def main():
    runner = web.AppRunner(app)
    await runner.setup()
    await web.TCPSite(runner, "0.0.0.0", 8080).start()
    async with websockets.serve(ws_handler, "0.0.0.0", 8765):
        print("Serveur prêt : http://localhost:8080/")
        await asyncio.Future()

asyncio.run(main())