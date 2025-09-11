"""Redis service for data persistence."""
import json
from typing import Dict, Optional
import redis.asyncio as redis
from config import config

class RedisService:
    """Service for Redis operations."""
    
    def __init__(self):
        self._client: Optional[redis.Redis] = None
    
    async def get_client(self) -> redis.Redis:
        """Get Redis client instance."""
        if self._client is None:
            self._client = redis.from_url(config.REDIS_URL, decode_responses=True)
        return self._client
    
    async def store_request_data(self, request_id: str, data: Dict) -> None:
        """Store request data in Redis."""
        client = await self.get_client()
        await client.hset(f"request:{request_id}", mapping=data)
        await client.expire(f"request:{request_id}", config.REQUEST_EXPIRATION)
    
    async def get_request_data(self, request_id: str) -> Optional[Dict]:
        """Get request data from Redis."""
        client = await self.get_client()
        data = await client.hgetall(f"request:{request_id}")
        return data if data else None
    
    async def update_request_status(self, request_id: str, status: str, **kwargs) -> None:
        """Update request status and additional data in Redis."""
        client = await self.get_client()
        await client.hset(f"request:{request_id}", "status", status)
        if kwargs:
            await client.hset(f"request:{request_id}", mapping=kwargs)
    
    async def store_result(self, request_id: str, result: Dict) -> None:
        """Store analysis result in Redis."""
        await self.update_request_status(
            request_id, 
            "completed", 
            result=json.dumps(result)
        )
    
    async def store_error(self, request_id: str, error: str) -> None:
        """Store error information in Redis."""
        await self.update_request_status(request_id, "error", error=error)
    
    async def close(self) -> None:
        """Close Redis connection."""
        if self._client:
            await self._client.close()

# Global Redis service instance
redis_service = RedisService()
