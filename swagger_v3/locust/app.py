# pip install locust
# ADD TO ENV
# export API_AUTH_TOKEN="your_actual_api_token_value"
# export API_BASE_URL="https://your-api-url.com/api"


# locust -f api_load_test.py --headless -u 1000 -r 100 --run-time 10m

from locust import HttpUser, task, between, events
import os
import random
import json
import uuid # For generating unique identifiers

# --- Configuration ---
# For a real test, get the token securely, e.g., from an environment variable
# or by logging in within an on_start method.
AUTH_TOKEN = os.getenv("API_AUTH_TOKEN", "your_default_bearer_token_here")
BASE_API_URL = os.getenv("API_BASE_URL", "http://localhost:5000/api") # Your API's base URL

if not AUTH_TOKEN or AUTH_TOKEN == "your_default_bearer_token_here":
    print("Warning: API_AUTH_TOKEN is not set or using the default placeholder. "
          "Authenticated requests (POST/PUT/DELETE) will likely fail.")
    print("Please set the API_AUTH_TOKEN environment variable.")

class APIUser(HttpUser):
    wait_time = between(0.5, 2.5)  # Simulate user think time (0.5 to 2.5 seconds)
    host = BASE_API_URL          # Set the host for all requests made by this user

    def on_start(self):
        """
        Called when a Locust user starts.
        Good place for user-specific setup, like logging in to get a dynamic token.
        """
        self.auth_headers = {"Authorization": f"Bearer {AUTH_TOKEN}"}
        self.created_resource_ids = [] # Store IDs of resources created by this user

        # Example: If you needed to log in to get a token:
        # if not AUTH_TOKEN or AUTH_TOKEN == "your_default_bearer_token_here":
        #     try:
        #         login_payload = {"username": "testuser", "password": "password123"}
        #         response = self.client.post("/auth/login", json=login_payload)
        #         response.raise_for_status() # Raise an exception for HTTP errors
        #         token = response.json().get("access_token")
        #         if not token:
        #             print("Login successful but no access_token found in response.")
        #             self.environment.runner.quit() # Stop test if critical setup fails
        #         self.auth_headers = {"Authorization": f"Bearer {token}"}
        #         print("Login successful, token obtained.")
        #     except Exception as e:
        #         print(f"Login failed: {e}")
        #         self.environment.runner.quit() # Stop test if critical setup fails


    @task(2) # Higher weight means this task is chosen more often
    def get_items(self):
        """Simulates a GET request, possibly to a public or authenticated endpoint."""
        # Assuming this endpoint might or might not require auth,
        # for simplicity, we'll add it if available.
        headers = self.auth_headers if hasattr(self, 'auth_headers') else {}
        self.client.get("/items", headers=headers, name="/items [GET]")

    @task(3)
    def create_item(self):
        """Simulates a POST request to create a new item."""
        payload = {
            "name": f"New Item-{uuid.uuid4()}",
            "description": f"This is a test item created by Locust at {random.randint(1,1000)}.",
            "value": round(random.uniform(10.0, 500.0), 2),
            "tags": [f"tag{random.randint(1,3)}", "loadtest"]
        }
        with self.client.post("/items", json=payload, headers=self.auth_headers, catch_response=True, name="/items [POST]") as response:
            if response.ok:
                try:
                    # Assuming the API returns the created item with an 'id'
                    item_id = response.json().get("id")
                    if item_id:
                        self.created_resource_ids.append(str(item_id)) # Store for later use
                        response.success()
                    else:
                        response.failure(f"POST successful but 'id' missing in response: {response.text[:100]}")
                except json.JSONDecodeError:
                    response.failure(f"POST successful but response not JSON: {response.text[:100]}")
            else:
                response.failure(f"POST failed with status {response.status_code}: {response.text[:100]}")

    @task(1)
    def update_item(self):
        """Simulates a PUT request to update an existing item."""
        if not self.created_resource_ids:
            return # Can't update if no item was created by this user instance

        item_id_to_update = random.choice(self.created_resource_ids)
        payload = {
            "name": f"Updated Item Name - {uuid.uuid4()}",
            "description": "This item has been updated by the Locust script.",
            "value": round(random.uniform(50.0, 1000.0), 2),
            "is_active": random.choice([True, False])
        }
        self.client.put(f"/items/{item_id_to_update}", json=payload, headers=self.auth_headers, name="/items/{id} [PUT]")

    @task(1)
    def delete_item(self):
        """Simulates a DELETE request to remove an item."""
        if not self.created_resource_ids:
            return # Can't delete if no item was created

        # Pop a random ID to ensure we don't try to delete the same one multiple times by this user
        # if tasks are re-run quickly and list isn't refreshed
        if self.created_resource_ids:
            item_id_to_delete = self.created_resource_ids.pop(random.randrange(len(self.created_resource_ids)))
            self.client.delete(f"/items/{item_id_to_delete}", headers=self.auth_headers, name="/items/{id} [DELETE]")

    # Optional: If you have other GET endpoints or specific resource fetching
    @task(1)
    def get_specific_item(self):
        if not self.created_resource_ids:
            # Fallback: or try to get a known range of IDs if API supports it
            # For this example, we'll just hit a general endpoint or skip
            self.client.get("/items/1", headers=self.auth_headers, name="/items/{id} [GET Specific Fallback]")
            return

        item_id_to_get = random.choice(self.created_resource_ids)
        self.client.get(f"/items/{item_id_to_get}", headers=self.auth_headers, name="/items/{id} [GET Specific]")

    def on_stop(self):
        """
        Called when a Locust user stops.
        Optional: Could be used for cleanup, but often not necessary for pure load tests.
        Be cautious with cleanup logic in on_stop, as it might skew final test results
        if it generates significant load or errors.
        """
        # print(f"User stopping. Resources created by this user: {self.created_resource_ids}")
        pass

# To see some stats about requests and failures per URL in the console
# This is optional and can be verbose. Locust web UI is better for detailed stats.
# @events.request.add_listener
# def hook_request_success(request_type, name, response_time, response_length, **kwargs):
#     if kwargs.get("exception"):
#         print(f"FAIL: {request_type} {name} Response time: {response_time}ms Error: {kwargs['exception']}")
#     else:
#         print(f"SUCCESS: {request_type} {name} Response time: {response_time}ms")