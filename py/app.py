# app.py

import os
from flask import Flask, request, jsonify, abort # Keep abort
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields, ValidationError, validate

# --- Import error handling registration ---
from errors import register_error_handlers

# --- Configuration ---
basedir = os.path.abspath(os.path.dirname(__file__))
DB_URI = 'sqlite:///' + os.path.join(basedir, 'items.db')

# --- App Initialization ---
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Database Setup ---
db = SQLAlchemy(app)

# --- Database Model ---
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
# Call the function from errors.py to register handlers for the app
register_error_handlers(app)


# --- API Routes (CRUD) ---
# Routes remain the same as before, using abort() which will now
# trigger the handlers registered from errors.py

# Create a new item
@app.route('/items', methods=['POST'])
def create_item():
    json_data = request.get_json()
    if not json_data:
        abort(400, description="Request body must be JSON.") # Will trigger handle_bad_request

    try:
        validated_data = item_create_schema.load(json_data)
    except ValidationError as err:
        # Pass Marshmallow errors dict to the handler
        abort(400, description=err.messages) # Will trigger handle_bad_request

    name = validated_data['name']
    description = validated_data.get('description')

    if Item.query.filter_by(name=name).first():
         abort(400, description=f"Item with name '{name}' already exists.") # Will trigger handle_bad_request

    new_item = Item(name=name, description=description)
    try:
        db.session.add(new_item)
        db.session.commit()
    except Exception as e:
        # Rollback here before aborting is a good practice for DB errors
        db.session.rollback()
        # Log the original exception before aborting
        app.logger.error(f"Database error on create: {e}", exc_info=True)
        # Abort triggers the handle_internal_server_error
        abort(500, description="Database error occurred during item creation.")

    return jsonify(new_item.to_dict()), 201

# Get all items
@app.route('/items', methods=['GET'])
def get_items():
    try:
        all_items = Item.query.all()
        return jsonify([item.to_dict() for item in all_items]), 200
    except Exception as e:
         app.logger.error(f"Database error on get all: {e}", exc_info=True)
         # Abort triggers the handle_internal_server_error
         abort(500, description="Database error occurred while fetching items.")


# Get a specific item by ID
@app.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    try:
        # get_or_404 internally calls abort(404) if not found
        item = db.get_or_404(Item, item_id, description=f"Item with ID {item_id} not found.")
        return jsonify(item.to_dict()), 200
    except Exception as e:
         # Catch potential non-404 errors during lookup
         app.logger.error(f"Error retrieving item {item_id}: {e}", exc_info=True)
         abort(500, description=f"Error retrieving item {item_id}.")


# Update an existing item
@app.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    # get_or_404 calls abort(404) if not found
    item = db.get_or_404(Item, item_id, description=f"Item with ID {item_id} not found for update.")

    json_data = request.get_json()
    if not json_data:
        abort(400, description="Request body must be JSON.") # Triggers handle_bad_request

    try:
        validated_data = item_update_schema.load(json_data, partial=True)
    except ValidationError as err:
        abort(400, description=err.messages) # Triggers handle_bad_request

    if not validated_data:
         abort(400, description="No update data provided. Must provide 'name' or 'description'.") # Triggers handle_bad_request

    new_name = validated_data.get('name')
    if new_name is not None and new_name != item.name and Item.query.filter_by(name=new_name).first():
        abort(400, description=f"Cannot update: another item with name '{new_name}' already exists.") # Triggers handle_bad_request

    # Update fields present in the validated data
    if 'name' in validated_data:
        item.name = validated_data['name']
    if 'description' in validated_data:
        item.description = validated_data['description']

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback() # Rollback here
        app.logger.error(f"Database error on update: {e}", exc_info=True)
        abort(500, description="Database error occurred during update.") # Triggers handle_internal_server_error

    return jsonify(item.to_dict()), 200

# Delete an item
@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    # get_or_404 calls abort(404) if not found
    item = db.get_or_404(Item, item_id, description=f"Item with ID {item_id} not found for deletion.")

    try:
        db.session.delete(item)
        db.session.commit()
    except Exception as e:
        db.session.rollback() # Rollback here
        app.logger.error(f"Database error on delete: {e}", exc_info=True)
        abort(500, description="Database error occurred during deletion.") # Triggers handle_internal_server_error

    return jsonify({"message": f"Item with ID {item_id} deleted successfully."}), 200


# --- Main Execution ---
if __name__ == '__main__':
    # Ensure the app context is available for operations like db.create_all()
    with app.app_context():
        db.create_all()
        print(f"Database created/checked at: {DB_URI}")
    app.run(debug=True) # Set debug=False for production
