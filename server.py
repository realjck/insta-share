import asyncio
import json
import random
import string
from aiohttp import web, WSMsgType
import os
from io import BytesIO
import base64

# Storage
files = {}
connections = set()

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase, k=4))

# Configuration
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB

async def ws_handler(ws):
    connections.add(ws)
    code = None
    current_upload = None

    try:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                try:
                    data = json.loads(msg.data)
                    
                    if data.get("action") == "upload_chunk":
                        if current_upload is None:
                            code = generate_code()
                            current_upload = {
                                "name": data["name"],
                                "chunks": [None] * data["totalChunks"],
                                "total_chunks": data["totalChunks"]
                            }
                        
                        chunk_index = data["chunkIndex"]
                        current_upload["chunks"][chunk_index] = data["chunk"]
                        
                        if all(chunk is not None for chunk in current_upload["chunks"]):
                            try:
                                complete_data = b"".join([
                                    base64.b64decode(chunk + "=" * (-len(chunk) % 4))
                                    for chunk in current_upload["chunks"]
                                ])
                                
                                if len(complete_data) > MAX_FILE_SIZE:
                                    await ws.send_json({
                                        "type": "error",
                                        "message": "File too large"
                                    })
                                    current_upload = None
                                    continue

                                file_buffer = BytesIO(complete_data)
                                
                                files[code] = {
                                    "name": current_upload["name"],
                                    "data": file_buffer,
                                    "downloads": 0,
                                    "host_ws": ws
                                }
                                
                                await ws.send_json({
                                    "type": "link",
                                    "code": code
                                })
                                
                                current_upload = None
                                
                            except Exception as e:
                                print(f"Error processing complete file: {str(e)}")
                                await ws.send_json({
                                    "type": "error",
                                    "message": "Failed to process file"
                                })
                                current_upload = None

                    elif data.get("action") == "ping":
                        if code in files:
                            await ws.send_json({
                                "type": "stats",
                                "downloads": files[code]["downloads"]
                            })

                except Exception as e:
                    print(f"Error processing message: {str(e)}")
                    await ws.send_json({
                        "type": "error",
                        "message": f"Upload failed: {str(e)}"
                    })
            
            elif msg.type == WSMsgType.ERROR:
                print(f"WebSocket connection closed with exception {ws.exception()}")

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
    finally:
        connections.discard(ws)
        if code in files:
            files[code]["data"].close()
            del files[code]

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    await ws_handler(ws)
    return ws

async def http_handler(request):
    code = request.match_info.get("code")
    if code in files:
        files[code]["downloads"] += 1
        
        # Notify host about download
        for ws in connections:
            if ws == files[code]["host_ws"]:
                await ws.send_json({
                    "type": "stats",
                    "downloads": files[code]["downloads"]
                })
        
        file = files[code]
        file["data"].seek(0)  # Reset buffer position to start
        
        response = web.StreamResponse(
            headers={
                "Content-Disposition": f'attachment; filename="{file["name"]}"'
            }
        )
        await response.prepare(request)
        await response.write(file["data"].getvalue())
        return response
        
    return web.Response(text="File expired", status=410)

# Add static route handler
async def index_handler(request):
    return web.FileResponse('web/dist/index.html')

# Modify the app setup
app = web.Application()
app.add_routes([
    web.get("/{code:[A-Z]{4}}", http_handler),
    web.get("/", index_handler),
    web.get("/ws", websocket_handler),  # Nouveau endpoint WebSocket
    web.static('/', 'web/dist')
])

async def main():
    runner = web.AppRunner(app)
    await runner.setup()
    await web.TCPSite(runner, "0.0.0.0", 8080).start()
    print("Serveur prêt : http://localhost:8080/")
    await asyncio.Future()

asyncio.run(main())