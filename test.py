
# test_validate.py

import requests

def test_key(key: str):
    url = f"http://localhost:4000/api/keys/validate?key={key}"
    print(f"\nRequesting key: {key!r}")
    
    try:
        resp = requests.get(url, timeout=5)
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return

    print(f"  HTTP {resp.status_code}")
    try:
        data = resp.json()
    except ValueError:
        print(f"Invalid JSON response:\n{resp.text}")
        return

    if resp.status_code == 200:
        print(f"valid={data.get('valid')}, roomId={data.get('roomId')}")
    elif resp.status_code == 404:
        print(f"valid={data.get('valid')}, error={data.get('error')}")
    else:
        print(f"Unexpected response: {data}")

if __name__ == "__main__":
    # Ensure you’ve inserted this test key into keys.db:
    # sqlite3 keys.db "INSERT OR IGNORE INTO key_mappings(key,room_id) VALUES('TEST-KEY-123', 99);"
    test_key("TEST-KEY-123")  # should return valid:true
    test_key("WRONGKEY")      # should return valid:false
