import requests

BASE_URL = "http://localhost:8000"

login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "user@example.com", "password": "string"}
)
token = login_response.json()["access_token"]

response = requests.get(
    f"{BASE_URL}/my-readings",
    headers={"Authorization": f"Bearer {token}"}
)

print("Status:", response.status_code)
import json
print(json.dumps(response.json(), indent=2))