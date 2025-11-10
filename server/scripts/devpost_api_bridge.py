#!/usr/bin/env python3
"""
Devpost API Bridge

This script serves as a bridge between the Node.js server and the Python scraper.
It can be called by Node.js using child_process.spawn.
"""

import sys
import json
import os
import importlib.util

def output_json(data):
    """Output data as JSON to stdout"""
    print(json.dumps(data))
    sys.stdout.flush()

def test_installation():
    """Test the installation and dependencies"""
    print("\nTesting Devpost scraper installation...")
    
    # Test Python version
    python_version = sys.version.split()[0]
    print(f"Python version: {python_version}")
    
    # Test for required modules
    required_modules = ['requests', 'bs4']
    missing_modules = []
    
    for module in required_modules:
        try:
            importlib.import_module(module)
            print(f"✓ {module} is installed")
        except ImportError:
            missing_modules.append(module)
            print(f"✗ {module} is missing")
    
    # Test for the scraper module
    script_dir = os.path.dirname(os.path.abspath(__file__))
    scraper_path = os.path.join(script_dir, 'devpost_scraper.py')
    
    if os.path.exists(scraper_path):
        print(f"✓ devpost_scraper.py found at {scraper_path}")
    else:
        print(f"✗ devpost_scraper.py not found at {scraper_path}")
        missing_modules.append('devpost_scraper')
    
    # Summary
    if missing_modules:
        print("\nInstallation issues found:")
        if 'requests' in missing_modules or 'bs4' in missing_modules:
            print("- Missing Python modules. Run: pip install requests beautifulsoup4")
        if 'devpost_scraper' in missing_modules:
            print("- Missing devpost_scraper.py script")
        print("\nSetup is incomplete. Please fix the issues above.")
        return False
    else:
        print("\nAll dependencies are correctly installed!")
        return True

if __name__ == "__main__":
    try:
        # Add the current directory to the path so we can import the scraper module
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        # Check if in test mode
        if len(sys.argv) > 1 and sys.argv[1] == 'test':
            test_installation()
            sys.exit(0)
            
        # Regular execution mode
        print("Starting Devpost API bridge script", file=sys.stderr)
        print(f"Current directory: {os.getcwd()}", file=sys.stderr)
        print(f"Script path: {os.path.dirname(os.path.abspath(__file__))}", file=sys.stderr)
        
        # Import scraper after path is set up
        from devpost_scraper import get_hackathons
        
        # Get arguments
        limit = 20
        active_only = False
        upcoming_only = False
        
        # Process arguments from Node.js if provided
        if len(sys.argv) > 1:
            print(f"Arguments received: {sys.argv[1:]}", file=sys.stderr)
            for i, arg in enumerate(sys.argv):
                if arg == '--limit' and i + 1 < len(sys.argv):
                    limit = int(sys.argv[i + 1])
                elif arg == '--active':
                    active_only = True
                elif arg == '--upcoming':
                    upcoming_only = True
        
        # Get hackathons
        hackathons = get_hackathons(limit=limit, active_only=active_only, upcoming_only=upcoming_only)
        
        # Output as JSON
        output_json({
            "success": True,
            "hackathons": hackathons,
            "count": len(hackathons)
        })
    
    except Exception as e:
        # Handle errors and output error JSON
        output_json({
            "success": False,
            "error": str(e)
        })
        sys.exit(1)