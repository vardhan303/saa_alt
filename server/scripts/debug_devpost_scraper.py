#!/usr/bin/env python3
"""
Debug script for Devpost API

This script helps identify why the Devpost API integration isn't returning any hackathons.
"""

import requests
import sys
import json

def debug_devpost_api():
    print("====== Devpost API Debug ======")
    
    base_url = "https://devpost.com/api/hackathons"
    params = {
        'page': 1,
        'per_page': 5  # Just request a few to keep it manageable
    }
    
    print(f"Fetching URL: {base_url}")
    print(f"Parameters: {params}")
    
    # Step 1: Try basic request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(base_url, params=params, headers=headers)
        print(f"HTTP Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"ERROR: Failed to get a successful response from Devpost API: {response.text}")
            sys.exit(1)
            
        print(f"Response Length: {len(response.text)} characters")
        
        # Try to parse as JSON to validate format
        try:
            data = response.json()
            print("\nAPI response structure:")
            print(f"Root keys: {list(data.keys())}")
            
            if 'hackathons' in data:
                hackathon_count = len(data['hackathons'])
                print(f"Found {hackathon_count} hackathons in API response")
                
                if hackathon_count > 0:
                    first_hackathon = data['hackathons'][0]
                    print("\nExample hackathon data:")
                    print(f"Title: {first_hackathon.get('title')}")
                    print(f"URL: {first_hackathon.get('url')}")
                    print(f"Status: {first_hackathon.get('open_state')}")
                    print(f"Available fields: {list(first_hackathon.keys())}")
                else:
                    print("\nNo hackathons found in API response.")
            else:
                print("\nERROR: No 'hackathons' key found in API response.")
                print(f"Available keys: {list(data.keys())}")
            
            # Save JSON for inspection
            with open("devpost_api_debug.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            print("\nSaved API response to devpost_api_debug.json for inspection")
            
        except ValueError as e:
            print(f"\nERROR: Failed to parse JSON response: {e}")
            print("\nResponse preview:")
            print(response.text[:1000] + "..." if len(response.text) > 1000 else response.text)
            
    except Exception as e:
        print(f"ERROR: Request failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    debug_devpost_api()