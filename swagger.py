# pip install flasgger

from flask import Flask, jsonify, request
from flasgger import Swagger # Import Swagger

app = Flask(__name__)
swagger = Swagger(app) # Initialize Flasgger with your app

# Your routes will go here
# ...

if __name__ == '__main__':
    app.run(debug=True)


################################################


## With flasgger, endpoints are typically included in the Swagger documentation if they have a specially formatted YAML docstring. 
##If an endpoint does not have this docstring, it usually won't appear in the Swagger UI by default. 
##This gives you the selective inclusion you want.

@app.route('/api/public_data', methods=['GET'])
def get_public_data():
    """
    This endpoint is visible in Swagger.
    It retrieves a list of public items.
    ---
    tags:
      - Public Data
    summary: Get a list of public items
    description: Returns a list of all available public items.
    responses:
      200:
        description: A list of items
        examples:
          application/json: [{"id": 1, "name": "Public Item 1"}, {"id": 2, "name": "Public Item 2"}]
    """
    data = [{"id": 1, "name": "Public Item 1"}, {"id": 2, "name": "Public Item 2"}]
    return jsonify(data)

@app.route('/api/items/<item_id>', methods=['GET'])
def get_specific_item(item_id):
    """
    Get a specific item by its ID.
    This endpoint will also be visible in Swagger.
    ---
    tags:
      - Items
    summary: Retrieve a specific item
    parameters:
      - name: item_id
        in: path
        type: integer
        required: true
        description: The ID of the item to retrieve.
    responses:
      200:
        description: The requested item.
        schema:
          type: object
          properties:
            id:
              type: integer
              example: 42
            name:
              type: string
              example: "Specific Item"
      404:
        description: Item not found.
    """
    # Your logic to find item by item_id
    if item_id == "42": # Example logic
        return jsonify({"id": int(item_id), "name": "Specific Item"})
    return jsonify({"error": "Item not found"}), 404

@app.route('/api/items', methods=['POST'])
def create_item():
    """
    Create a new item.
    This endpoint will also be visible in Swagger.
    ---
    tags:
      - Items
    summary: Create a new item
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          id: NewItem
          required:
            - name
          properties:
            name:
              type: string
              description: Name of the item.
              example: "My New Gadget"
            price:
              type: number
              format: float
              description: Price of the item.
              example: 19.99
    responses:
      201:
        description: Item created successfully.
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Item created"
            item_id:
              type: integer
              example: 101
    """
    new_item_data = request.json
    # Your logic to create the item
    item_id = 101 # Example ID
    return jsonify({"message": "Item created", "item_id": item_id, "data_received": new_item_data}), 201

# This endpoint will NOT appear in Swagger because it lacks the YAML docstring
@app.route('/api/internal_data', methods=['GET'])
def get_internal_data():
    return jsonify({"message": "This is internal data, not for Swagger."})

# Another endpoint NOT appearing in Swagger
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK"})







from flask import Flask, jsonify, request
from flasgger import Swagger

app = Flask(__name__)

# Basic Flasgger configuration
app.config['SWAGGER'] = {
    'title': 'My Cool Flask API',
    'uiversion': 3, # Use Swagger UI 3
    'version': '1.0.0',
    'description': 'This is the API documentation for my awesome Flask application.',
    'termsOfService': 'http://example.com/terms',
    'contact': {
        'name': 'API Support',
        'url': 'http://www.example.com/support',
        'email': 'support@example.com'
    },
    'license': {
        'name': 'Apache 2.0',
        'url': 'http://www.apache.org/licenses/LICENSE-2.0.html'
    },
    # You can also define global specs, security definitions, etc.
    # 'specs_route': '/api/docs/' # To change the Swagger UI endpoint
}

swagger = Swagger(app) # Initialize after setting app.config['SWAGGER']

# ... your routes ...




############################################################################################

# In your app.py

# ... (Flask app initialization and other SWAGGER config remains the same) ...

app.config['SWAGGER'] = {
    'title': 'My CRUD API (Flask 1.1.2 + Flasgger 0.9.7.1)',
    'version': '1.0.0',
    'uiversion': 3,
    'description': 'A simple CRUD API with header token authentication for certain endpoints.',
    # ... (termsOfService, contact, license, securityDefinitions as before) ...
    'securityDefinitions': {
        'ApiKeyAuth': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'x-auth-token'
        }
    },
    'definitions': {
        'Item': { # This definition is now used for items within the new payload too
            'type': 'object',
            'properties': {
                'id': {
                    'type': 'integer',
                    'description': 'The unique identifier of the item (client-provided in this context).',
                    'example': 1
                },
                'name': {
                    'type': 'string',
                    'description': 'The name of the item.',
                    'example': 'Item 1 from Batch'
                },
                'description': {
                    'type': 'string',
                    'description': 'A description of the item.',
                    'example': 'Short description for item 1.'
                }
            },
            'required': ['id', 'name'] # Assuming id and name are required for each item in the list
        },
        'CreateItemsPayload': { # <<< NEW DEFINITION for the complex request body
            'type': 'object',
            'properties': {
                'appid': {
                    'type': 'string',
                    'description': 'The application ID.',
                    'example': 'app123'
                },
                'appenv': {
                    'type': 'string',
                    'description': 'The application environment.',
                    'example': 'production'
                },
                'items': {
                    'type': 'array',
                    'description': 'A list of items to be created or processed.',
                    'items': {
                        '$ref': '#/definitions/Item' # Each item in the array uses the 'Item' schema
                    }
                }
            },
            'required': ['appid', 'appenv', 'items']
        },
        # 'NewItem' definition might be redundant now if not used by PUT, or PUT could also use 'Item'
        # For simplicity, if PUT updates name/description for an existing ID, it might not need 'Item' schema in request.
        # Let's assume PUT could still use a simpler schema or be adapted. The focus here is POST.
        'Error': {
            'type': 'object',
            'properties': {
                'message': {'type': 'string'}
            }
        }
    }
}
swagger = Swagger(app)

# ... (rest of your app.py: in-memory DB, token_required, other routes) ...