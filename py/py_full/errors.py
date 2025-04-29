# errors.py

from flask import jsonify, current_app, request

# --- Error Handlers ---
# (Handlers remain the same as before)
def handle_bad_request(error):
    messages = getattr(error, 'description', "Invalid request.")
    error_payload = { "error": "bad_request" }
    log_message = f"Bad Request (400): {request.method} {request.path}" # Use request proxy
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
    current_app.logger.warning(log_message) # Use current_app logger
    response = jsonify(error_payload)
    response.status_code = 400
    return response

def handle_unauthorized(error):
    message = getattr(error, 'description', "Authentication credentials were not provided or are invalid.")
    error_payload = {"error": "unauthorized", "message": message}
    current_app.logger.warning(f"Unauthorized (401): {request.method} {request.path} - {message}")
    response = jsonify(error_payload)
    response.status_code = 401
    response.headers['WWW-Authenticate'] = 'API-Key realm="Items API"'
    return response

def handle_not_found(error):
    message = error.description if hasattr(error, 'description') else "Resource not found."
    response = jsonify({"error": "not_found", "message": message})
    response.status_code = 404
    current_app.logger.warning(f"Not Found (404): {request.method} {request.path} - {message}")
    return response

def handle_internal_server_error(error):
    description = getattr(error, 'description', "An unexpected error occurred.")
    # Use current_app logger, pass error for traceback
    current_app.logger.error(
        f"Internal Server Error (500): {request.method} {request.path} - Desc: {description}",
        exc_info=error
    )
    response = jsonify({"error": "internal_server_error", "message": "An unexpected error occurred on the server."})
    response.status_code = 500
    return response

# --- Registration Function ---
def register_error_handlers(app):
    """Registers the error handler functions with the Flask app."""
    app.register_error_handler(400, handle_bad_request)
    app.register_error_handler(401, handle_unauthorized)
    app.register_error_handler(404, handle_not_found)
    app.register_error_handler(500, handle_internal_server_error)
