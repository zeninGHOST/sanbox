# auth.py
import functools
from flask import request, abort, current_app, g # g can store per-request data if needed

# Import config settings
from config import Config

def require_api_key(func):
    """Decorator to require a valid API key in the X-API-Key header."""
    @functools.wraps(func)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        expected_key = current_app.config.get('EXPECTED_API_KEY')

        if not expected_key:
             # Log a critical error if the expected key isn't configured
             current_app.logger.critical("API Key is not configured on the server!")
             abort(500, description="Server configuration error: API Key not set.") # Abort 500

        if not api_key:
            abort(401, description="API key is missing in X-API-Key header.")
        elif api_key != expected_key:
            abort(401, description="Invalid API key provided.")
        else:
            # Key is valid, proceed with the original function
            # Optional: Store validated user/key info in flask.g for the request duration
            # g.user = {'api_key': api_key}
            return func(*args, **kwargs)
    return decorated_function
