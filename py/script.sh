# Create: Missing 'name' (Error 400 with details)
curl -X POST -H "Content-Type: application/json" -d '{"description": "A test item"}' http://127.0.0.1:5000/items
# Expected Response:
# {
#   "error": "bad_request",
#   "message": "Input validation failed.",
#   "details": {
#     "name": [
#       "The 'name' field is required."
#     ]
#   }
# }

# Create: Empty 'name' (Error 400 with details)
curl -X POST -H "Content-Type: application/json" -d '{"name": ""}' http://127.0.0.1:5000/items
# Expected Response:
# {
#   "error": "bad_request",
#   "message": "Input validation failed.",
#   "details": {
#     "name": [
#       "Name cannot be empty."
#     ]
#   }
# }

# Update: Empty 'name' (Error 400 with details)
curl -X PUT -H "Content-Type: application/json" -d '{"name": ""}' http://127.0.0.1:5000/items/1 # Assuming item 1 exists
# Expected Response:
# {
#   "error": "bad_request",
#   "message": "Input validation failed.",
#   "details": {
#     "name": [
#       "Name cannot be empty."
#     ]
#   }
# }

# Update: No data provided (Error 400 with simple message)
curl -X PUT -H "Content-Type: application/json" -d '{}' http://127.0.0.1:5000/items/1 # Assuming item 1 exists
# Expected Response:
# {
#   "error": "bad_request",
#   "message": "No update data provided. Must provide 'name' or 'description'."
# }
