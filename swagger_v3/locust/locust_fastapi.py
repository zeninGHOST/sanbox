from locust import HttpUser, task, between, events
import random
import uuid # For generating unique identifiers for item names
import os
import json

# --- Configuration ---
# The host for the FastAPI app.
# It's better to set this when running Locust, but a default can be here.
API_BASE_URL = os.getenv("LOCUST_TARGET_HOST", "http://127.0.0.1:8000")

class CrudUser(HttpUser):
    wait_time = between(0.5, 2.5) # Time a user waits between tasks (0.5 to 2.5 seconds)
    host = API_BASE_URL           # Set the host for all requests made by this user

    def on_start(self):
        """
        Called when a Locust user starts.
        Initialize a list to store IDs of items created by this user.
        """
        self.created_item_ids = []
        print(f"User started, targeting host: {self.host}")

    @task(3) # Create items more frequently
    def create_item(self):
        """Simulates a POST request to create a new item."""
        item_name = f"LocustItem-{uuid.uuid4().hex[:8]}"
        payload = {
            "name": item_name,
            "description": f"This is a test item created by Locust user {self.environment.runner.user_count if self.environment.runner else 'N/A'}.",
            "price": round(random.uniform(1.0, 1000.0), 2)
        }
        with self.client.post("/items/", json=payload, catch_response=True, name="/items/ [POST]") as response:
            if response.ok:
                try:
                    item_id = response.json().get("id")
                    if item_id:
                        self.created_item_ids.append(item_id)
                        response.success()
                        # print(f"User created item: {item_id}") # For debugging, can be noisy
                    else:
                        response.failure(f"POST successful but 'id' missing in response: {response.text[:100]}")
                except json.JSONDecodeError:
                    response.failure(f"POST successful but response not JSON: {response.text[:100]}")
            else:
                response.failure(f"POST failed with status {response.status_code}: {response.text[:100]}")

    @task(2)
    def get_all_items(self):
        """Simulates a GET request to fetch all items."""
        self.client.get("/items/", name="/items/ [GET All]")

    @task(2)
    def get_specific_item(self):
        """Simulates a GET request to fetch a specific item created by this user."""
        if not self.created_item_ids:
            # Fallback: if no items created by this user, try getting a known/default item
            # or simply skip. For this example, let's try a non-existent one to test 404s.
            # In a real test, you might have a set of pre-existing IDs.
            self.client.get(f"/items/non-existent-id-{uuid.uuid4().hex[:6]}", name="/items/{item_id} [GET Specific - Not Found Attempt]")
            return

        item_id_to_get = random.choice(self.created_item_ids)
        self.client.get(f"/items/{item_id_to_get}", name="/items/{item_id} [GET Specific]")

    @task(1)
    def update_item(self):
        """Simulates a PUT request to update an existing item created by this user."""
        if not self.created_item_ids:
            return # Can't update if no item was created by this user instance

        item_id_to_update = random.choice(self.created_item_ids)
        updated_name = f"UpdatedLocustItem-{uuid.uuid4().hex[:8]}"
        payload = {
            "name": updated_name,
            "description": "This item has been updated by a Locust script.",
            "price": round(random.uniform(5.0, 1500.0), 2)
        }
        self.client.put(f"/items/{item_id_to_update}", json=payload, name="/items/{item_id} [PUT]")

    @task(1)
    def delete_item(self):
        """Simulates a DELETE request to remove an item created by this user."""
        if not self.created_item_ids:
            return # Can't delete if no item was created

        # To avoid trying to delete the same item multiple times if tasks are picked rapidly,
        # we pop it from the list for this user session.
        # A more robust approach for long tests might involve re-fetching or other strategies.
        if self.created_item_ids:
            item_id_to_delete = self.created_item_ids.pop(random.randrange(len(self.created_item_ids)))
            self.client.delete(f"/items/{item_id_to_delete}", name="/items/{item_id} [DELETE]")

    # Optional: A simple task to hit the root.
    @task(1)
    def get_root(self):
        self.client.get("/", name="/ [GET Root]")

# Optional: Event hooks for logging or custom metrics (can be verbose)
# @events.request.add_listener
# def on_request(request_type, name, response_time, response_length, response, context, exception, start_time, url, **kwargs):
#     if exception:
#         print(f"FAIL: {request_type} {name} URL: {url} Error: {exception}")
#     else:
#         # print(f"SUCCESS: {request_type} {name} URL: {url} Time: {response_time}ms")
#         pass

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print(f"--- Locust test starting! Target host: {environment.host} ---")
    if environment.host == "http://127.0.0.1:8000" and API_BASE_URL != "http://127.0.0.1:8000":
        print(f"Warning: Locust target host is default ({environment.host}), but API_BASE_URL in script is {API_BASE_URL}. "
              f"Consider setting target host via --host CLI argument or LOCUST_TARGET_HOST env var.")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("--- Locust test stopping! ---")

# --- To run this Locust script (save as locust_test_fastapi.py or similar): ---
# 1. Make sure your FastAPI app (from the previous example) is running.
#    By default, it runs on http://127.0.0.1:8000
#
# 2. Install Locust:
#    pip install locust
#
# 3. Run Locust:
#    locust -f locust_test_fastapi.py
#
#    Or, if your FastAPI app is on a different host/port:
#    locust -f locust_test_fastapi.py --host=http://your-fastapi-host:port
#
# 4. Open your browser to http://localhost:8089 (or http://0.0.0.0:8089 if you used --web-host=0.0.0.0)
#    - Enter the number of users to simulate.
#    - Enter the spawn rate (users per second).
#    - The "Host" field should be pre-filled with http://127.0.0.1:8000 (or what you set via --host).
#    - Click "Start swarming".
