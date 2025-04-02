# insta-share

Share files effortlessly with a simple drag-and-drop, and track downloads in real-time.

## Instant File Share

### How it works

Host uploads a file → gets a link like yoursite.com/ABCD

Anyone visits the link → downloads file instantly

Auto-deletes when host closes the page

Run it

```bash
Copy
pip install websockets aiohttp
python server.py  # Starts at http://localhost:8080
```

Open `index.html` to share files.

### Key Features

- ⚡ WebSocket real-time (No storage, RAM only)
- 🔢 4-letter links
- 📊 Live download counter

(Single-file server under 100 lines)