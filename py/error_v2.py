# errors.py

from flask import jsonify, current_app # Import current_app

def handle_bad_request(error):
    """Handles 400 Bad Request errors, logs, and returns JSON response."""
    messages = getattr(error, 'description', "Invalid request.")
    error_payload = { "error": "bad_request" }

    log_message = f"Bad Request (400): {request.method} {request.path}" # Add request context to log
    if isinstance(messages, dict):
        error_payload["message"] = "Input validation failed."
        error_payload["details"] = messages
        log_message += f" - Validation Errors: {messages}"
    elif isinstance(messages, str):
        error_payload["message"] = messages
        log_message += f" - Message: {messages}"
    else:
        error_payload["message"] = "Invalid request."
        log_message += " - No specific description provided."

    # Log as WARNING or INFO depending on severity preference for bad requests
    current_app.logger.warning(log_message)

    response = jsonify(error_payload)
    response.status_code = 400
    return response

def handle_not_found(error):
    """Handles 404 Not Found errors, logs, and returns JSON response."""
    message = error.description if hasattr(error, 'description') else "Resource not found."
    response = jsonify({
        "error": "not_found",
        "message": message
    })
    response.status_code = 404
    # Log as WARNING as it often indicates a client error or broken link
    current_app.logger.warning(f"Not Found (404): {request.method} {request.path} - {message}")
    return response

def handle_internal_server_error(error):
    """Handles 500 Internal Server Error, logsdetails, and returns JSON response."""
    # The actual exception might be passed as 'error' or available via sys.exc_info()
    # The description might be the one passed to abort(500, description=...)
    description = getattr(error, 'description', "An unexpected error occurred.")

    # Log the error with exception info for debugging traceback
    current_app.logger.error(
        f"Internal Server Error (500): {request.method} {request.path} - Desc: {description}",
        exc_info=error # Pass the original error for traceback logging
    )

    response = jsonify({
        "error": "internal_server_error",
        "message": "An unexpected error occurred on the server." # Generic message to client
    })
    response.status_code = 500
    return response

def register_error_handlers(app):
    """Registers the error handler functions with the Flask app."""
    # Import request here, only needed for logging context in handlers
    # Alternatively, access request via current_app if preferred/safer
    global request
    from flask import request

    app.register_error_handler(400, handle_bad_request)
    app.register_error_handler(404, handle_not_found)
    app.register_error_handler(500, handle_internal_server_error)
