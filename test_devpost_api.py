#!/usr/bin/env python3
"""
Test script for directly running the Devpost API bridge
"""

import sys
import os

# Add the current directory to the path so we can import modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, 'server/scripts'))

try:
    # Import the bridge script
    from devpost_api_bridge import output_json
    from devpost_scraper import get_hackathons
    
    # Get hackathons directly
    hackathons = get_hackathons(limit=10)
    
    # Output as JSON
    output_json({
        "success": True,
        "hackathons": hackathons,
        "count": len(hackathons)
    })
    
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)