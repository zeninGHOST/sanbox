# routes.py
from flask import Blueprint, request, jsonify, abort, current_app
from marshmallow import ValidationError

# Import application components
from models import db, Item
from schemas import item_create_schema, item_update_schema
from auth import require_api_key

# Create a Blueprint instance
# The first argument 'items' is the blueprint's name used for Flask internals (like url_for).
# The second argument __name__ helps Flask locate resources like templates/static files.
# url_prefix makes all routes in this blueprint start with /items
items_bp = Blueprint('items', __name__, url_prefix='/items')


# --- Request/Response Logging Hooks (Blueprint Specific) ---
# These run only for requests handled by this blueprint
@items_bp.before_request
def log_bp_request_info():
    # You can add blueprint-specific logging here if needed
    # General request logging is handled by the app-level hooks
    pass

@items_bp.after_request
def log_bp_response_info(response):
    # Blueprint-specific response logging if needed
    return response


# --- API Routes (CRUD) ---
# Note: Paths are now relative to the blueprint's url_prefix ('/items')

@items_bp.route('/', methods=['POST']) # Corresponds to POST /items
@require_api_key
def create_item():
    # Use current_app.logger for logging within blueprint routes
    current_app.logger.debug("Attempting to create a new item (authorized).")
    json_data = request.get_json()
    if not json_data:
        current_app.logger.warning("Create item failed: Request body was not JSON.")
        abort(400, description="Request body must be JSON.")

    try:
        validated_data = item_create_schema.load(json_data)
        current_app.logger.debug(f"Create item validation successful for name: {validated_data.get('name')}")
    except ValidationError as err:
        current_app.logger.warning(f"Create item validation failed: {err.messages}")
        abort(400, description=err.messages)

    name = validated_data['name']
    description = validated_data.get('description')

    if Item.query.filter_by(name=name).first():
         current_app.logger.warning(f"Create item failed: Item name '{name}' already exists.")
         abort(400, description=f"Item with name '{name}' already exists.")

    new_item = Item(name=name, description=description)
    try:
        db.session.add(new_item)
        db.session.commit()
        current_app.logger.info(f"Item created successfully with ID: {new_item.id}, Name: {new_item.name}")
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Database error on create: {e}", exc_info=True)
        abort(500, description="Database error occurred during item creation.")

    return jsonify(new_item.to_dict()), 201


@items_bp.route('/', methods=['GET']) # Corresponds to GET /items
def get_items():
    current_app.logger.debug("Attempting to retrieve all items.")
    try:
        all_items = Item.query.all()
        current_app.logger.info(f"Retrieved {len(all_items)} items.")
        return jsonify([item.to_dict() for item in all_items]), 200
    except Exception as e:
         current_app.logger.error(f"Database error on get all: {e}", exc_info=True)
         abort(500, description="Database error occurred while fetching items.")


@items_bp.route('/<int:item_id>', methods=['GET']) # Corresponds to GET /items/<id>
def get_item(item_id):
    current_app.logger.debug(f"Attempting to retrieve item with ID: {item_id}.")
    try:
        # Use db.get_or_404 from the imported db instance
        item = db.get_or_404(Item, item_id, description=f"Item with ID {item_id} not found.")
        current_app.logger.info(f"Retrieved item with ID: {item_id}.")
        return jsonify(item.to_dict()), 200
    except Exception as e:
         current_app.logger.error(f"Error retrieving item {item_id}: {e}", exc_info=True)
         abort(500, description=f"Error retrieving item {item_id}.")


@items_bp.route('/<int:item_id>', methods=['PUT']) # Corresponds to PUT /items/<id>
@require_api_key
def update_item(item_id):
    current_app.logger.debug(f"Attempting to update item with ID: {item_id} (authorized).")
    item = db.get_or_404(Item, item_id, description=f"Item with ID {item_id} not found for update.")
    json_data = request.get_json()
    if not json_data:
        current_app.logger.warning(f"Update item {item_id} failed: Request body was not JSON.")
        abort(400, description="Request body must be JSON.")

    try:
        validated_data = item_update_schema.load(json_data, partial=True)
        current_app.logger.debug(f"Update item {item_id} validation successful. Data: {validated_data}")
    except ValidationError as err:
        current_app.logger.warning(f"Update item {item_id} validation failed: {err.messages}")
        abort(400, description=err.messages)

    if not validated_data:
         current_app.logger.warning(f"Update item {item_id} failed: No update data provided.")
         abort(400, description="No update data provided. Must provide 'name' or 'description'.")

    new_name = validated_data.get('name')
    if new_name is not None and new_name != item.name and Item.query.filter_by(name=new_name).first():
        current_app.logger.warning(f"Update item {item_id} failed: Name '{new_name}' already exists.")
        abort(400, description=f"Cannot update: another item with name '{new_name}' already exists.")

    updated_fields = []
    if 'name' in validated_data and item.name != validated_data['name']: item.name = validated_data['name']; updated_fields.append('name')
    if 'description' in validated_data and item.description != validated_data['description']: item.description = validated_data['description']; updated_fields.append('description')

    if not updated_fields:
        current_app.logger.info(f"Update item {item_id}: No actual changes detected in provided data.")
        return jsonify(item.to_dict()), 200

    try:
        db.session.commit()
        current_app.logger.info(f"Item {item_id} updated successfully. Changed fields: {', '.join(updated_fields)}.")
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Database error on update for item {item_id}: {e}", exc_info=True)
        abort(500, description="Database error occurred during update.")

    return jsonify(item.to_dict()), 200


@items_bp.route('/<int:item_id>', methods=['DELETE']) # Corresponds to DELETE /items/<id>
def delete_item(item_id):
     # Note: We did not apply @require_api_key to DELETE in this example
     current_app.logger.debug(f"Attempting to delete item with ID: {item_id}.")
     item = db.get_or_404(Item, item_id, description=f"Item with ID {item_id} not found for deletion.")
     item_name_for_log = item.name
     try:
         db.session.delete(item)
         db.session.commit()
         current_app.logger.info(f"Item {item_id} (Name: '{item_name_for_log}') deleted successfully.")
     except Exception as e:
         db.session.rollback()
         current_app.logger.error(f"Database error on delete for item {item_id}: {e}", exc_info=True)
         abort(500, description="Database error occurred during deletion.")

     return jsonify({"message": f"Item with ID {item_id} deleted successfully."}), 200
