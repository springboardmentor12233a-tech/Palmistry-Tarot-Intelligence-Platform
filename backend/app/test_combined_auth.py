import requests

BASE_URL = "http://localhost:8000"

# Step 1: log in and get a token
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "user@example.com", "password": "string"}
)
print("Login status:", login_response.status_code)
login_data = login_response.json()
print("Login response:", login_data)

token = login_data["access_token"]

# Step 2: call the protected /combined-reading endpoint
with open("test_input/test_hand.jpg", "rb") as f:
    files = {"file": ("test_hand.jpg", f, "image/jpeg")}
    headers = {"Authorization": f"Bearer {token}"}
    params = {"spread_type": "three_card"}

    response = requests.post(
        f"{BASE_URL}/combined-reading",
        headers=headers,
        params=params,
        files=files
    )

print("\nCombined-reading status:", response.status_code)
print("Response:", response.json())