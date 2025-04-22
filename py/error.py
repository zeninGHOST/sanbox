# errors.py

from flask import jsonify, current_app # Import current_app for logging
# Note: We avoid importing 'db' here to keep this module decoupled from database specifics.
# Rollback logic might need to be handled via application context teardown if needed globally,
# or kept within specific route exception handling before aborting with 500.

def handle_bad_request(error):
    """Handles 400 Bad Request errors, including Marshmallow validation errors."""
    messages = getattr(error, 'description', None)
    error_payload = {
        "error": "bad_request"
    }
    if isinstance(messages, dict):
        # Marshmallow validation errors
        error_payload["message"] = "Input validation failed."
        error_payload["details"] = messages
    elif isinstance(messages, str):
        # Custom string message from abort(400, description="...")
        error_payload["message"] = messages
    else:
        # Generic fallback
        error_payload["message"] = "Invalid request."

    response = jsonify(error_payload)
    response.status_code = 400
    return response

def handle_not_found(error):
    """Handles 404 Not Found errors."""
    message = error.description if hasattr(error, 'description') else "Resource not found."
    response = jsonify({
        "error": "not_found",
        "message": message
    })
    response.status_code = 404
    return response

def handle_internal_server_error(error):
    """Handles 500 Internal Server Error."""
    # Log the error using the application logger
    # Ensure this runs within an app context for current_app to work reliably.
    # Flask usually ensures this for error handlers.
    try:
        current_app.logger.error(f"Internal Server Error: {error}", exc_info=True)
    except Exception as log_error:
         # Fallback logging if logger fails
         print(f"ERROR logging Internal Server Error: {log_error}")
         print(f"Original Internal Server Error: {error}")


    # IMPORTANT: db.session.rollback() is removed from here to decouple errors.py
    # Consider using @app.teardown_request or specific try/except blocks in routes
    # if automatic rollback on all 500s is desired.

    response = jsonify({
        "error": "internal_server_error",
        "message": "An unexpected error occurred on the server."
    })
    response.status_code = 500
    return response

def register_error_handlers(app):
    """Registers the error handler functions with the Flask app."""
    app.register_error_handler(400, handle_bad_request)
    app.register_error_handler(404, handle_not_found)
    app.register_error_handler(500, handle_internal_server_error)

    # You could also register handlers for specific exceptions here:
    # from werkzeug.exceptions import HTTPException
    # app.register_error_handler(HTTPException, handle_http_exception) # Example
    # app.register_error_handler(YourCustomException, handle_custom_exception) # Example
