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
