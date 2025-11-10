#!/usr/bin/env python3
"""
Devpost Hackathon Scraper

This script fetches hackathon data from Devpost's API and outputs it in JSON format.
For educational purposes only.
"""

import requests
import json
from datetime import datetime
import sys
import argparse

def parse_arguments():
    parser = argparse.ArgumentParser(description='Scrape hackathon data from Devpost')
    parser.add_argument('--limit', type=int, default=20, 
                      help='Maximum number of hackathons to fetch (default: 20)')
    parser.add_argument('--output', type=str, default='hackathons.json',
                      help='Output file path (default: hackathons.json)')
    parser.add_argument('--active', action='store_true',
                      help='Get only active hackathons')
    parser.add_argument('--upcoming', action='store_true',
                      help='Get only upcoming hackathons')
    return parser.parse_args()

def get_hackathons(limit=20, active_only=False, upcoming_only=False):
    """
    Fetch hackathon data from Devpost API
    
    Args:
        limit (int): Maximum number of hackathons to fetch
        active_only (bool): If True, only get active hackathons
        upcoming_only (bool): If True, only get upcoming hackathons
    
    Returns:
        list: List of hackathon dictionaries
    """
    base_url = "https://devpost.com/api/hackathons"
    
    # Define filter parameters
    params = {
        'page': 1,
        'per_page': limit
    }
    
    if active_only:
        params['open_state[]'] = 'open'
    elif upcoming_only:
        params['open_state[]'] = 'upcoming'
    
    print(f"Fetching hackathons from {base_url} with params: {params}", file=sys.stderr)
    
    # Request to get the JSON data directly
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(base_url, params=params, headers=headers)
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        
        print(f"Response status code: {response.status_code}", file=sys.stderr)
        
        if response.status_code != 200:
            print(f"Error: Failed to fetch data, status code: {response.status_code}", file=sys.stderr)
            return []
        
        data = response.json()
        
        if 'hackathons' not in data:
            print(f"Error: Unexpected response format: {data.keys()}", file=sys.stderr)
            return []
        
        hackathons = []
        
        for item in data['hackathons']:
            try:
                hackathon = {
                    "title": item.get('title', 'Unknown Hackathon'),
                    "url": item.get('url'),
                    "submission_period": f"{item.get('submission_period_dates', 'Unknown dates')}",
                    "status": item.get('open_state', 'Unknown'),
                    "time_left": item.get('time_left_to_submission', ''),
                    "prizes": item.get('prize_amount', 'No prize information'),
                    "participants": f"{item.get('registrations_count', 0)} participants",
                    "description": item.get('description', ''),
                    "organizer": item.get('organization_name', ''),
                    "theme": item.get('themes', []),
                    "location": item.get('displayed_location', {}).get('location', 'Online'),
                    "featured": item.get('featured', False),
                    "scraped_at": datetime.now().isoformat()
                }
                
                hackathons.append(hackathon)
            except Exception as e:
                print(f"Error processing hackathon data: {e}", file=sys.stderr)
        
        print(f"Successfully fetched {len(hackathons)} hackathons", file=sys.stderr)
        return hackathons
        
    except requests.exceptions.RequestException as e:
        print(f"Error making request to Devpost API: {e}", file=sys.stderr)
        return []
    except ValueError as e:
        print(f"Error parsing JSON response: {e}", file=sys.stderr)
        return []

def main():
    args = parse_arguments()
    
    print(f"Fetching up to {args.limit} hackathons from Devpost...")
    hackathons = get_hackathons(
        limit=args.limit, 
        active_only=args.active, 
        upcoming_only=args.upcoming
    )
    
    if not hackathons:
        print("No hackathons found.")
        return
    
    print(f"Found {len(hackathons)} hackathons.")
    
    # Save to file
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump({"hackathons": hackathons}, f, indent=2, ensure_ascii=False)
    
    print(f"Data saved to {args.output}")
    
    # Print to stdout if being piped
    if not sys.stdout.isatty():
        print(json.dumps({"hackathons": hackathons}, indent=2))

if __name__ == "__main__":
    main()