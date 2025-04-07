FROM python:3.12-slim
WORKDIR /app

# Install only required Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Set WebSocket host
ENV WEBSOCKET_HOST="0.0.0.0"
ENV WEBSOCKET_PORT=8765

# Copy the pre-built frontend and server
COPY web/dist ./web/dist
COPY server.py .

# Expose required ports
EXPOSE 8080 8765

# Run the server
CMD ["python", "server.py"]