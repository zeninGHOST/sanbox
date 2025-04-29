# logging_config.py
import logging
from logging.handlers import RotatingFileHandler
import os

def configure_logging(app):
    """Configures logging for the Flask application."""
    log_formatter = logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    )
    log_level_name = app.config.get('LOG_LEVEL', 'INFO')
    log_level = logging.getLevelName(log_level_name)
    log_file = app.config.get('LOG_FILE')

    app.logger.setLevel(log_level)

    # File Handler (only if LOG_FILE is set)
    if log_file:
        if not os.path.exists(os.path.dirname(log_file)):
            try:
                os.makedirs(os.path.dirname(log_file))
            except OSError as e:
                app.logger.error(f"Could not create log directory {os.path.dirname(log_file)}: {e}")
                log_file = None # Disable file logging if dir creation fails

        if log_file:
            file_handler = RotatingFileHandler(log_file, maxBytes=1024 * 1024, backupCount=5)
            file_handler.setFormatter(log_formatter)
            file_handler.setLevel(log_level)
            if file_handler not in app.logger.handlers:
                app.logger.addHandler(file_handler)
                app.logger.info(f"File logging enabled: {log_file}")

    # Console Handler (only if not in debug or if no file logging)
    # Flask's default logger is often sufficient in debug mode.
    has_console_handler = any(isinstance(h, logging.StreamHandler) for h in app.logger.handlers)
    if not app.debug and not has_console_handler:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(log_formatter)
        console_handler.setLevel(log_level)
        app.logger.addHandler(console_handler)
        app.logger.info("Console logging enabled.")
    elif app.debug:
         app.logger.info("Flask's default console logging active (debug mode).")

    app.logger.info(f"Logging configured. Level: {log_level_name}")
