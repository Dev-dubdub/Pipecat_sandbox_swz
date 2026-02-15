"""
Load secrets from AWS Secrets Manager when deployed.
Locally: use .env (this module will skip if AWS fetch fails).
"""

import json
import os

from loguru import logger

SECRET_NAME = "pipecat_sandbox_secrets"
REGION = "ap-south-1"


def load_secrets_from_aws() -> bool:
    """
    Fetch secrets from AWS Secrets Manager and merge into os.environ.
    Returns True if secrets were loaded, False otherwise.
    On failure (local dev, no AWS creds), silently skip - .env will be used.
    """
    try:
        import boto3
        from botocore.exceptions import ClientError
    except ImportError:
        logger.info("Secrets Manager: SKIPPED (boto3 not installed, using .env)")
        return False

    secret_name = SECRET_NAME
    region = REGION

    try:
        client = boto3.client("secretsmanager", region_name=region)
        response = client.get_secret_value(
            SecretId=secret_name,
            VersionStage="AWSCURRENT",
        )
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        logger.info(f"Secrets Manager: SKIPPED (AWS error: {code}, using .env)")
        return False
    except Exception as e:
        logger.info(f"Secrets Manager: SKIPPED ({type(e).__name__}: {e}, using .env)")
        return False

    raw = response.get("SecretString")
    if not raw:
        logger.info("Secrets Manager: SKIPPED (empty secret, using .env)")
        return False

    try:
        secrets = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.warning(f"Secrets Manager: SKIPPED (invalid JSON: {e}, using .env)")
        return False

    if not isinstance(secrets, dict):
        logger.warning("Secrets Manager: SKIPPED (secret not key-value, using .env)")
        return False

    count = 0
    for key, value in secrets.items():
        if value is not None and isinstance(value, (str, int, float, bool)):
            os.environ[key] = str(value)
            count += 1

    logger.info(f"Secrets Manager: OK - loaded {count} keys from {secret_name}")
    return True
