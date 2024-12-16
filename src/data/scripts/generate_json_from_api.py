import requests
import json

COMBINED_API_URL = "http://localhost:3000/api/combined"

# Fetch data from the /combined API
response = requests.get(COMBINED_API_URL)
data = response.json()["data"]

# Function to duplicate last 'history' item with a specific company and change its type to 'forecast'
def duplicate_last_history(data, company):
    last_history = None
    # Find the last element with "type" = 'history' and the specified "company"
    for item in reversed(data):
        if item.get("type") == "history" and item.get("company") == company:
            last_history = item
            break

    # If a 'history' element is found, duplicate it and change 'type' to 'forecast'
    if last_history:
        forecast_item = last_history.copy()  # Make a copy of the last 'history' element
        forecast_item["type"] = "forecast"   # Change the 'type' to 'forecast'
        data.append(forecast_item)           # Append the new item to the data

# Duplicate last 'history' element for "NIKE"
duplicate_last_history(data, "NIKE")

# Duplicate last 'history' element for "SKECHERS"
duplicate_last_history(data, "SKECHERS")

# Save updated data to a local file
with open("combined_data.json", "w") as file:
    json.dump(data, file)

print("Data saved to combined_data.json")
