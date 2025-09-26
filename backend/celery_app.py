"""Celery application configuration."""
from celery import Celery
from config import config

# Create Celery instance
celery_app = Celery(
    "firecrawl_app",
    broker=config.REDIS_URL,
    backend=config.REDIS_URL,
    include=['tasks.crawl_tasks', 'tasks.resource_tasks']
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    result_accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_disable_rate_limits=True,
    result_expires=3600,  # 1 hour
    task_ignore_result=True,  # Don't store results to avoid serialization issues
    task_store_eager_result=False,
    task_routes={
        'tasks.crawl_tasks.crawl_website_task': {'queue': 'crawl'},
        'tasks.resource_tasks.process_url_resource_task': {'queue': 'resources'},
        'tasks.resource_tasks.process_document_resource_task': {'queue': 'resources'},
    },
    task_default_queue='default',
    task_queues={
        'default': {
            'exchange': 'default',
            'routing_key': 'default',
        },
        'crawl': {
            'exchange': 'crawl',
            'routing_key': 'crawl',
        },
        'resources': {
            'exchange': 'resources',
            'routing_key': 'resources',
        },
    },
)

# Optional: Configure periodic tasks
celery_app.conf.beat_schedule = {
    # Add any periodic tasks here if needed
}

if __name__ == '__main__':
    celery_app.start()
