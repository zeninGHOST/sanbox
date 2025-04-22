# app.py

import os
import logging # Import logging
from logging.handlers import RotatingFileHandler # Import RotatingFileHandler
from flask import Flask, request, jsonify, abort, current_app # Import current_app
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields, ValidationError, validate

# --- Import error handling registration ---
from errors import register_error_handlers

# --- Configuration ---
basedir = os.path.abspath(os.path.dirname(__file__))
DB_URI = 'sqlite:///' + os.path.join(basedir, 'items.db')
LOG_FILE = os.path.join(basedir, 'app.log') # Define log file path

# --- App Initialization ---
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Logging Configuration Function ---
def configure_logging(app_instance):
    # Define log format
    log_formatter = logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    )
    log_level = logging.DEBUG if app_instance.debug else logging.INFO
    app_instance.logger.setLevel(log_level) # Set logger level

    # --- File Handler ---
    # Rotate logs: 1MB per file, keep last 5 files
    file_handler = RotatingFileHandler(
        LOG_FILE, maxBytes=1024 * 1024, backupCount=5
    )
    file_handler.setFormatter(log_formatter)
    file_handler.setLevel(log_level) # Set handler level

    # --- Console Handler ---
    # Use Flask's default handler in debug mode, otherwise add our own
    if not app_instance.debug:
        # Ensure we don't duplicate handlers if Flask adds one
        # Note: Depending on Flask version and setup, direct handler manipulation
        # might need careful testing. Relying on debug=True often suffices for console.
        # Or explicitly clear default handlers if managing manually:
        # del app_instance.logger.handlers[:]
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(log_formatter)
        console_handler.setLevel(log_level)
        app_instance.logger.addHandler(console_handler)
        app_instance.logger.info("Console logging enabled (non-debug mode).")
    else:
        # In debug mode, Flask usually adds a StreamHandler.
        # We still add our file handler.
         app_instance.logger.info("Flask's default console logging active (debug mode).")


    # Add file handler regardless of debug mode
    if file_handler not in app_instance.logger.handlers:
         app_instance.logger.addHandler(file_handler)

    app_instance.logger.info(f"Logging configured. Level: {logging.getLevelName(log_level)}. Log file: {LOG_FILE}")


# --- Configure Logging ---
# Call the configuration function *after* app initialization
configure_logging(app)


# --- Database Setup ---
db = SQLAlchemy(app)

# --- Database Model ---
# (Model definition remains the same)
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(120), nullable=True)

    def __repr__(self):
        return f'<Item {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

# --- Request Schemas (using Marshmallow) ---
# (Schemas remain the same)
class ItemCreateSchema(Schema):
    name = fields.Str(
        required=True,
        error_messages={
            "required": "The 'name' field is required.",
            "type": "Name must be a string."
        },
        validate=validate.Length(min=1, error="Name cannot be empty.")
    )
    description = fields.Str(
         error_messages={"type": "Description must be a string."},
         load_default=None
    )

class ItemUpdateSchema(Schema):
    name = fields.Str(
        validate=validate.Length(min=1, error="Name cannot be empty."),
         error_messages={"type": "Name must be a string."}
    )
    description = fields.Str(
        allow_none=True,
        error_messages={"type": "Description must be a string or null."}
    )

item_create_schema = ItemCreateSchema()
item_update_schema = ItemUpdateSchema()


# --- Register Error Handlers ---
register_error_handlers(app) # Function from errors.py

# --- Request/Response Logging Hooks ---

@app.before_request
def log_request_info():
    # Use current_app.logger which is correctly configured
    current_app.logger.info(
        f"Request: {request.method} {request.path} from {request.remote_addr}"
    )
    # Example: Log request body for debugging (be careful with sensitive data!)
    if request.is_json and current_app.debug:
         try:
            # Limit size to avoid logging huge bodies
            body_preview = str(request.get_json())[:200]
            current_app.logger.debug(f"Request JSON Body (Preview): {body_preview}")
         except Exception as e:
             current_app.logger.warning(f"Could not log request body: {e}")


@app.after_request
def log_response_info(response):
    # Runs after a request has been processed, before it's sent to the client
    current_app.logger.info(
        f"Response: {request.method} {request.path} - Status {response.status_code}"
    )
    return response # Must return the response object


# --- API Routes (CRUD) ---
# (Adding specific logging within routes)

@app.route('/items', methods=['POST'])
def create_item():
    app.logger.debug("Attempting to create a new item.")
    json_data = request.get_json()
    if not json_data:
        app.logger.warning("Create item failed: Request body was not JSON.")
        abort(400, description="Request body must be JSON.")

    try:
        validated_data = item_create_schema.load(json_data)
        app.logger.debug(f"Create item validation successful for name: {validated_data.get('name')}")
    except ValidationError as err:
        app.logger.warning(f"Create item validation failed: {err.messages}")
        abort(400, description=err.messages)

    name = validated_data['name']
    description = validated_data.get('description')

    if Item.query.filter_by(name=name).first():
         app.logger.warning(f"Create item failed: Item name '{name}' already exists.")
         abort(400, description=f"Item with name '{name}' already exists.")

    new_item = Item(name=name, description=description)
    try:
        db.session.add(new_item)
        db.session.commit()
        # Log success *after* commit, including the new ID
        app.logger.info(f"Item created successfully with ID: {new_item.id}, Name: {new_item.name}")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Database error on create: {e}", exc_info=True)
        abort(500, description="Database error occurred during item creation.")

    return jsonify(new_item.to_dict()), 201

@app.route('/items', methods=['GET'])
def get_items():
    app.logger.debug("Attempting to retrieve all items.")
    try:
        all_items = Item.query.all()
        app.logger.info(f"Retrieved {len(all_items)} items.")
        return jsonify([item.to_dict() for item in all_items]), 200
    except Exception as e:
         app.logger.error(f"Database error on get all: {e}", exc_info=True)
         abort(500, description="Database error occurred while fetching items.")

@app.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    app.logger.debug(f"Attempting to retrieve item with ID: {item_id}.")
    try:
        item = db.get_or_404(Item, item_id, description=f"Item with ID {item_id} not found.")
        app.logger.info(f"Retrieved item with ID: {item_id}.")
        return jsonify(item.to_dict()), 200
    except Exception as e:
         # Catch potential non-404 errors during lookup, although get_or_404 handles 404 itself
         app.logger.error(f"Error retrieving item {item_id}: {e}", exc_info=True)
         abort(500, description=f"Error retrieving item {item_id}.")

@app.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    app.logger.debug(f"Attempting to update item with ID: {item_id}.")
    item = db.get_or_404(Item, item_id, description=f"Item with ID {item_id} not found for update.")

    json_data = request.get_json()
    if not json_data:
        app.logger.warning(f"Update item {item_id} failed: Request body was not JSON.")
        abort(400, description="Request body must be JSON.")

    try:
        validated_data = item_update_schema.load(json_data, partial=True)
        app.logger.debug(f"Update item {item_id} validation successful. Data: {validated_data}")
    except ValidationError as err:
        app.logger.warning(f"Update item {item_id} validation failed: {err.messages}")
        abort(400, description=err.messages)

    if not validated_data:
         app.logger.warning(f"Update item {item_id} failed: No update data provided.")
         abort(400, description="No update data provided. Must provide 'name' or 'description'.")

    new_name = validated_data.get('name')
    if new_name is not None and new_name != item.name and Item.query.filter_by(name=new_name).first():
        app.logger.warning(f"Update item {item_id} failed: Name '{new_name}' already exists.")
        abort(400, description=f"Cannot update: another item with name '{new_name}' already exists.")

    # Track changes for logging
    updated_fields = []
    if 'name' in validated_data and item.name != validated_data['name']:
        item.name = validated_data['name']
        updated_fields.append('name')
    if 'description' in validated_data and item.description != validated_data['description']:
        item.description = validated_data['description']
        updated_fields.append('description')

    if not updated_fields:
        app.logger.info(f"Update item {item_id}: No actual changes detected in provided data.")
        return jsonify(item.to_dict()), 200 # Or maybe 304 Not Modified? 200 is simpler.

    try:
        db.session.commit()
        app.logger.info(f"Item {item_id} updated successfully. Changed fields: {', '.join(updated_fields)}.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Database error on update for item {item_id}: {e}", exc_info=True)
        abort(500, description="Database error occurred during update.")

    return jsonify(item.to_dict()), 200

@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    app.logger.debug(f"Attempting to delete item with ID: {item_id}.")
    item = db.get_or_404(Item, item_id, description=f"Item with ID {item_id} not found for deletion.")
    item_name_for_log = item.name # Get name before deleting for logging

    try:
        db.session.delete(item)
        db.session.commit()
        app.logger.info(f"Item {item_id} (Name: '{item_name_for_log}') deleted successfully.")
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Database error on delete for item {item_id}: {e}", exc_info=True)
        abort(500, description="Database error occurred during deletion.")

    return jsonify({"message": f"Item with ID {item_id} deleted successfully."}), 200


# --- Main Execution ---
if __name__ == '__main__':
    app.logger.info("Flask application starting...") # Log app start
    try:
        with app.app_context():
            db.create_all()
            app.logger.info(f"Database created/checked at: {DB_URI}")
    except Exception as db_e:
        app.logger.critical(f"FATAL: Failed to connect/create database: {db_e}", exc_info=True)
        # Optionally exit if DB is critical
        # import sys
        # sys.exit(1)

    # Get host/port from environment variables or defaults
    host = os.environ.get('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.environ.get('FLASK_RUN_PORT', 8080)) # Using 8080 as default now

    # Log the host/port being used
    app.logger.info(f"Running Flask app on {host}:{port} (Debug Mode: {app.debug})")
    app.run(host=host, port=port, debug=app.debug) # Use configured host/port
