export PYTHONPATH=/home/david/coursepilot/backend:$PYTHONPATH
celery -A celery_app worker --loglevel=info
