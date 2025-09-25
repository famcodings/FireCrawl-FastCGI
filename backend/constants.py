"""
Application constants and enums
"""
from enum import Enum


class ResourceStatus(str, Enum):
    """
    Status enum for URL and Document resources
    
    Inherits from str to make it JSON serializable and work with SQLAlchemy
    """
    PENDING = "pending"      # Waiting to be processed
    PROCESSING = "processing"  # Currently being analyzed
    READY = "ready"         # Analysis completed successfully
    FAILED = "failed"       # Analysis failed


# For backward compatibility and easy access
STATUS_PENDING = ResourceStatus.PENDING
STATUS_PROCESSING = ResourceStatus.PROCESSING
STATUS_READY = ResourceStatus.READY
STATUS_FAILED = ResourceStatus.FAILED

# List of all valid statuses for validation
VALID_STATUSES = [status.value for status in ResourceStatus]


def is_valid_status(status: str) -> bool:
    """Check if a status string is valid"""
    return status in VALID_STATUSES


def get_default_status() -> str:
    """Get the default status for new resources"""
    return ResourceStatus.PENDING.value
