import requests
import json

COMBINED_API_URL = "http://localhost:3000/api/combined"

# Fetch data from the /combined API
response = requests.get(COMBINED_API_URL)
data = response.json()["data"]

# Save data to a local file
with open("combined_data.json", "w") as file:
    json.dump(data, file)

print("Data saved to combined_data.json")
