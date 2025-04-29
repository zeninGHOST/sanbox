# app.py
import os
from flask import Flask, request, current_app # request/current_app needed for global hooks

# Import necessary parts from our modules
from config import Config
from extensions import db
from errors import register_error_handlers
from logging_config import configure_logging
from routes import items_bp # Import the blueprint

def create_app(config_class=Config):
    """Application Factory Function"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Flask extensions
    db.init_app(app)

    # Configure logging
    configure_logging(app)

    # Register error handlers
    register_error_handlers(app)

    # Register blueprints
    app.register_blueprint(items_bp) # All routes defined in items_bp are now active

    # --- Optional: Add App-Level Request/Response Logging Hooks ---
    # These run for ALL requests, including those not handled by a blueprint (like a root 404)
    @app.before_request
    def app_log_request_info():
        # Use current_app.logger which is configured
        # Avoid logging static file requests if desired
        if request.endpoint and 'static' not in request.endpoint:
             current_app.logger.info(
                f"App Request: {request.method} {request.path} from {request.remote_addr}"
             )

    @app.after_request
    def app_log_response_info(response):
        if request.endpoint and 'static' not in request.endpoint:
            current_app.logger.info(
                f"App Response: {request.method} {request.path} - Status {response.status_code}"
            )
        return response # Must return the response object

    app.logger.info("Application factory finished configuration.")
    return app

# --- Main Execution ---
if __name__ == '__main__':
    app = create_app()
    app.logger.info("Flask application starting via __main__...")
    try:
        # Create database tables if they don't exist, within app context
        with app.app_context():
            db.create_all()
            app.logger.info(f"Database created/checked at: {app.config['SQLALCHEMY_DATABASE_URI']}")
    except Exception as db_e:
        app.logger.critical(f"FATAL: Failed to connect/create database: {db_e}", exc_info=True)
        import sys
        sys.exit(1)

    # Get host/port from app config (which loaded from Config class/env vars)
    host = os.environ.get('FLASK_RUN_HOST', '127.0.0.1') # Still allow override if needed
    port = int(os.environ.get('FLASK_RUN_PORT', 8080))

    app.logger.info(f"Running Flask app on {host}:{port} (Debug Mode: {app.debug})")
    # Use app.run() only for development. For production, use a WSGI server like Gunicorn.
    # Pass debug=app.debug to respect the config setting.
    app.run(host=host, port=port, debug=app.debug)
