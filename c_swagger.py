from flask import Flask, request, jsonify
from flasgger import Swagger, swag_from
from functools import wraps

app = Flask(__name__)

# Configure Swagger
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,  # all in
            "model_filter": lambda tag: True,  # all in
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/swagger/"
}

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Flask API with Swagger",
        "description": "A simple CRUD API with Swagger documentation",
        "version": "1.0"
    },
    "securityDefinitions": {
        "Authorization": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Authentication token"
        }
    }
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

# Sample data store
items_store = {
    "ap123": {
        "production": [
            {"id": 1, "name": "item 1", "description": "short description here"}
        ]
    }
}

# Authorization decorator
def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header is required"}), 401
        # In a real app, you would validate the token here
        return f(*args, **kwargs)
    return decorated

@app.route('/api/items', methods=['GET'])
@swag_from({
    'responses': {
        200: {
            'description': 'Returns all items',
            'schema': {
                'type': 'object',
                'properties': {
                    'appid': {'type': 'string'},
                    'appenv': {'type': 'string'},
                    'items': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'integer'},
                                'name': {'type': 'string'},
                                'description': {'type': 'string'}
                            }
                        }
                    }
                }
            }
        }
    },
    'parameters': [
        {
            'name': 'appid',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Application ID'
        },
        {
            'name': 'appenv',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Application Environment'
        }
    ]
})
def get_items():
    """
    Get all items
    This endpoint returns all items for a specific application ID and environment.
    No authorization required.
    """
    appid = request.args.get('appid')
    appenv = request.args.get('appenv')
    
    if not appid or not appenv:
        return jsonify({"error": "appid and appenv query parameters are required"}), 400
    
    if appid not in items_store or appenv not in items_store.get(appid, {}):
        return jsonify({"appid": appid, "appenv": appenv, "items": []}), 200
    
    return jsonify({
        "appid": appid,
        "appenv": appenv,
        "items": items_store[appid][appenv]
    }), 200

@app.route('/api/items', methods=['POST'])
@requires_auth
@swag_from({
    'responses': {
        201: {
            'description': 'Item created successfully',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'},
                    'appid': {'type': 'string'},
                    'appenv': {'type': 'string'}
                }
            }
        },
        400: {
            'description': 'Invalid input'
        }
    },
    'parameters': [
        {
            'name': 'Authorization',
            'in': 'header',
            'type': 'string',
            'required': True,
            'description': 'Authorization header'
        },
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'appid': {'type': 'string'},
                    'appenv': {'type': 'string'},
                    'items': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'id': {'type': 'integer'},
                                'name': {'type': 'string'},
                                'description': {'type': 'string'}
                            }
                        }
                    }
                },
                'required': ['appid', 'appenv', 'items']
            }
        }
    ],
    'security': [{'Authorization': []}]
})
def create_items():
    """
    Create new items
    This endpoint creates new items for a specific application ID and environment.
    Authorization required.
    """
    data = request.get_json()
    
    if not data or 'appid' not in data or 'appenv' not in data or 'items' not in data:
        return jsonify({"error": "Invalid request. Required fields: appid, appenv, items"}), 400
    
    appid = data['appid']
    appenv = data['appenv']
    items = data['items']
    
    if not items or not isinstance(items, list):
        return jsonify({"error": "Items must be a non-empty array"}), 400
    
    # Create the app and environment if they don't exist
    if appid not in items_store:
        items_store[appid] = {}
    
    if appenv not in items_store[appid]:
        items_store[appid][appenv] = []
    
    # Add the new items
    for item in items:
        if 'id' not in item or 'name' not in item:
            return jsonify({"error": "Each item must have an id and name"}), 400
        items_store[appid][appenv].append(item)
    
    return jsonify({
        "message": "Items created successfully",
        "appid": appid,
        "appenv": appenv
    }), 201

@app.route('/api/items/<int:item_id>', methods=['PUT'])
@requires_auth
@swag_from({
    'responses': {
        200: {
            'description': 'Item updated successfully'
        },
        404: {
            'description': 'Item not found'
        }
    },
    'parameters': [
        {
            'name': 'Authorization',
            'in': 'header',
            'type': 'string',
            'required': True,
            'description': 'Authorization header'
        },
        {
            'name': 'item_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'Item ID'
        },
        {
            'name': 'appid',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Application ID'
        },
        {
            'name': 'appenv',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Application Environment'
        },
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'name': {'type': 'string'},
                    'description': {'type': 'string'}
                }
            }
        }
    ],
    'security': [{'Authorization': []}]
})
def update_item(item_id):
    """
    Update an existing item
    This endpoint updates an existing item by ID for a specific application ID and environment.
    Authorization required.
    """
    appid = request.args.get('appid')
    appenv = request.args.get('appenv')
    data = request.get_json()
    
    if not appid or not appenv:
        return jsonify({"error": "appid and appenv query parameters are required"}), 400
    
    if appid not in items_store or appenv not in items_store.get(appid, {}):
        return jsonify({"error": "Application ID or environment not found"}), 404
    
    # Find the item
    item_index = None
    for i, item in enumerate(items_store[appid][appenv]):
        if item['id'] == item_id:
            item_index = i
            break
    
    if item_index is None:
        return jsonify({"error": "Item not found"}), 404
    
    # Update the item
    if 'name' in data:
        items_store[appid][appenv][item_index]['name'] = data['name']
    if 'description' in data:
        items_store[appid][appenv][item_index]['description'] = data['description']
    
    return jsonify({
        "message": "Item updated successfully",
        "item": items_store[appid][appenv][item_index]
    }), 200

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
@requires_auth
@swag_from({
    'responses': {
        200: {
            'description': 'Item deleted successfully'
        },
        404: {
            'description': 'Item not found'
        }
    },
    'parameters': [
        {
            'name': 'Authorization',
            'in': 'header',
            'type': 'string',
            'required': True,
            'description': 'Authorization header'
        },
        {
            'name': 'item_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'Item ID'
        },
        {
            'name': 'appid',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Application ID'
        },
        {
            'name': 'appenv',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Application Environment'
        }
    ],
    'security': [{'Authorization': []}]
})
def delete_item(item_id):
    """
    Delete an item
    This endpoint deletes an existing item by ID for a specific application ID and environment.
    Authorization required.
    """
    appid = request.args.get('appid')
    appenv = request.args.get('appenv')
    
    if not appid or not appenv:
        return jsonify({"error": "appid and appenv query parameters are required"}), 400
    
    if appid not in items_store or appenv not in items_store.get(appid, {}):
        return jsonify({"error": "Application ID or environment not found"}), 404
    
    # Find the item
    item_index = None
    for i, item in enumerate(items_store[appid][appenv]):
        if item['id'] == item_id:
            item_index = i
            break
    
    if item_index is None:
        return jsonify({"error": "Item not found"}), 404
    
    # Delete the item
    deleted_item = items_store[appid][appenv].pop(item_index)
    
    return jsonify({
        "message": "Item deleted successfully",
        "item": deleted_item
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
