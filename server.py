import asyncio
import websockets
import json
import random
import string
from aiohttp import web
import os
from io import BytesIO
import base64

# Stockage : { "CODE": { "name": str, "data": BytesIO, "downloads": int, "host_ws": WebSocket } }
files = {}
connections = set()

def generate_code():
    return ''.join(random.choices(string.ascii_uppercase, k=4))

# Configuration
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB
UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def ws_handler(websocket, path):
    connections.add(websocket)
    code = None
    current_upload = None

    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                
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
                                await websocket.send(json.dumps({
                                    "type": "error",
                                    "message": "File too large"
                                }))
                                current_upload = None
                                continue

                            # Store in RAM instead of disk
                            file_buffer = BytesIO(complete_data)
                            
                            files[code] = {
                                "name": current_upload["name"],
                                "data": file_buffer,
                                "downloads": 0,
                                "host_ws": websocket
                            }
                            
                            await websocket.send(json.dumps({
                                "type": "link",
                                "code": code
                            }))
                            
                            current_upload = None
                            
                        except Exception as e:
                            print(f"Error processing complete file: {str(e)}")
                            await websocket.send(json.dumps({
                                "type": "error",
                                "message": "Failed to process file"
                            }))
                            current_upload = None

            # Actualisation de l'UI
                elif data.get("action") == "ping":
                    if code in files:
                        await websocket.send(json.dumps({
                        "type": "stats",
                        "downloads": files[code]["downloads"]
                    }))

            except Exception as e:
                print(f"Error processing message: {str(e)}")
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": f"Upload failed: {str(e)}"
                }))

    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Connection closed: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
    finally:
        connections.discard(websocket)
        if code in files:
            files[code]["data"].close()  # Clean up BytesIO
            del files[code]

async def http_handler(request):
    code = request.match_info.get("code")
    if code in files:
        files[code]["downloads"] += 1
        
        # Notify host about download
        for ws in connections:
            if ws == files[code]["host_ws"]:
                await ws.send(json.dumps({
                    "type": "stats",
                    "downloads": files[code]["downloads"]
                }))
        
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