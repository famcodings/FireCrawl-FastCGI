"""WebSocket bridge service for Redis pub/sub integration."""
import json
import asyncio
import redis.asyncio as redis
from typing import Dict
from fastapi import WebSocket
from services.websocket_service import websocket_service
from config import config


class WebSocketBridge:
    """Bridge service for connecting Celery tasks to WebSocket connections."""
    
    def __init__(self):
        self.redis_client: redis.Redis = None
        self.pubsub = None
        self._running = False
        self._task = None
    
    async def start_listening(self):
        """Start listening for Celery task updates via Redis pub/sub."""
        if self._running:
            return
        
        self._running = True
        self.redis_client = redis.from_url(config.REDIS_URL, decode_responses=True)
        self.pubsub = self.redis_client.pubsub()
        
        try:
            await self.pubsub.subscribe('websocket_notifications')
            print("WebSocket bridge started listening for notifications")
            
            async for message in self.pubsub.listen():
                if not self._running:
                    break
                    
                if message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        await self.handle_notification(data)
                    except json.JSONDecodeError as e:
                        print(f"Error parsing WebSocket notification: {e}")
                    except Exception as e:
                        print(f"Error handling WebSocket notification: {e}")
                        
        except Exception as e:
            print(f"Error in WebSocket bridge: {e}")
        finally:
            await self.stop_listening()
    
    async def stop_listening(self):
        """Stop listening for notifications."""
        self._running = False
        
        if self.pubsub:
            try:
                await self.pubsub.unsubscribe('websocket_notifications')
                await self.pubsub.close()
            except Exception as e:
                print(f"Error closing pubsub: {e}")
        
        if self.redis_client:
            try:
                await self.redis_client.close()
            except Exception as e:
                print(f"Error closing Redis client: {e}")
        
        print("WebSocket bridge stopped")
    
    async def handle_notification(self, data: Dict):
        """Handle WebSocket notification from Celery task."""
        try:
            request_id = data.get('request_id')
            message_type = data.get('type')
            payload = data.get('payload', {})
            
            if not request_id or not message_type:
                print(f"Invalid notification data: {data}")
                return
            
            print(f"Handling notification for {request_id}: {message_type}")
            
            if message_type == 'status':
                status = payload.get('status', 'processing')
                await websocket_service.send_status(request_id, status)
                
            elif message_type == 'result':
                await websocket_service.send_result(request_id, payload)
                
            elif message_type == 'error':
                error_msg = payload if isinstance(payload, str) else payload.get('error', 'Unknown error')
                await websocket_service.send_error(request_id, error_msg)
                
            else:
                print(f"Unknown message type: {message_type}")
                
        except Exception as e:
            print(f"Error handling notification: {e}")
    
    async def start_background_task(self):
        """Start the bridge as a background task."""
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self.start_listening())
        return self._task
    
    async def stop_background_task(self):
        """Stop the background task."""
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        await self.stop_listening()


# Global WebSocket bridge instance
websocket_bridge = WebSocketBridge()
