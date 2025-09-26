"""WebSocket service for real-time communication."""
import json
from typing import Dict
from fastapi import WebSocket
from models import WebSocketMessage
from services.redis_service import redis_service

class WebSocketService:
    """Service for WebSocket operations."""
    
    def __init__(self):
        self.connections: Dict[str, WebSocket] = {}
    
    async def connect(self, request_id: str, websocket: WebSocket) -> None:
        """Accept WebSocket connection and store it."""
        await websocket.accept()
        self.connections[request_id] = websocket
        
        # Send initial status if request exists
        await self._send_initial_status(request_id, websocket)
    
    async def disconnect(self, request_id: str) -> None:
        """Remove WebSocket connection."""
        if request_id in self.connections:
            del self.connections[request_id]
    
    async def send_status(self, request_id: str, status: str) -> None:
        """Send status update via WebSocket."""
        if request_id in self.connections:
            message = WebSocketMessage(type="status", data={"status": status})
            await self.connections[request_id].send_text(message.json())
    
    async def send_result(self, request_id: str, result: Dict) -> None:
        """Send analysis result via WebSocket."""
        if request_id in self.connections:
            message = WebSocketMessage(type="result", data=result)
            await self.connections[request_id].send_text(message.json())
        
        # Also update Redis
        await redis_service.store_result(request_id, result)
    
    async def send_error(self, request_id: str, error: str) -> None:
        """Send error message via WebSocket."""
        if request_id in self.connections:
            message = WebSocketMessage(type="error", message=error)
            await self.connections[request_id].send_text(message.json())
        
        # Also update Redis
        await redis_service.store_error(request_id, error)
    
    async def _send_initial_status(self, request_id: str, websocket: WebSocket) -> None:
        """Send initial status when WebSocket connects."""
        request_data = await redis_service.get_request_data(request_id)
        if request_data:
            # Map legacy "error" status to "failed"
            status = request_data["status"]
            if status == "error":
                status = "failed"
            
            await websocket.send_text(json.dumps({
                "type": "status",
                "data": {"status": status}
            }))
            
            # If request is already completed, send the result
            if request_data["status"] == "completed" and "result" in request_data:
                result_data = json.loads(request_data["result"])
                await websocket.send_text(json.dumps({
                    "type": "result",
                    "data": result_data
                }))
    
    async def keep_alive(self, request_id: str) -> None:
        """Keep WebSocket connection alive."""
        websocket = self.connections.get(request_id)
        if websocket:
            try:
                while True:
                    await websocket.receive_text()
            except Exception:
                await self.disconnect(request_id)

# Global WebSocket service instance
websocket_service = WebSocketService()
