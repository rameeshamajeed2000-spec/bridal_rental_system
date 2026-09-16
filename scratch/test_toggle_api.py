import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app import app, db, cursor

# Set up test client
client = app.test_client()

def test_workflow():
    try:
        print("--- Testing /all_artists endpoint ---")
        res = client.get('/all_artists')
        print(f"Status: {res.status_code}")
        artists = res.json
        print(f"Total artists fetched: {len(artists)}")
        if len(artists) > 0:
            artist_id = artists[0]['id']
            orig_status = artists[0]['status']
            category = artists[0]['category']
            print(f"Selected Artist ID {artist_id} ('{artists[0]['name']}'), Category: '{category}', Original Status: '{orig_status}'")
            
            # Verify they show up in public endpoint
            res_pub = client.get(f'/artists/{category}')
            pub_artists = res_pub.json
            found_orig = any(a['id'] == artist_id for a in pub_artists)
            print(f"Artist in public list initially? {found_orig}")
            
            # Toggle Status to Deactivated
            print(f"\nToggling status for artist {artist_id}...")
            res_toggle = client.post(f'/toggle_artist_status/{artist_id}')
            print(f"Toggle Response Status: {res_toggle.status_code}")
            print(f"Toggle Response Body: {res_toggle.json}")
            
            # Check all_artists again
            res_all_2 = client.get('/all_artists')
            artists_2 = res_all_2.json
            new_status = next(a['status'] for a in artists_2 if a['id'] == artist_id)
            print(f"New Status in all_artists: '{new_status}'")
            
            # Verify they DO NOT show up in public endpoint
            res_pub_2 = client.get(f'/artists/{category}')
            pub_artists_2 = res_pub_2.json
            found_after = any(a['id'] == artist_id for a in pub_artists_2)
            print(f"Artist in public list after deactivation? {found_after}")
            
            # Toggle back to active
            print(f"\nToggling status back to Active...")
            res_toggle_back = client.post(f'/toggle_artist_status/{artist_id}')
            print(f"Toggle back response: {res_toggle_back.json}")
            
            # Check public endpoint again
            res_pub_3 = client.get(f'/artists/{category}')
            pub_artists_3 = res_pub_3.json
            found_back = any(a['id'] == artist_id for a in pub_artists_3)
            print(f"Artist in public list after reactivation? {found_back}")
            
            # Final assertion/check
            if orig_status == 'Active' and found_orig and not found_after and found_back:
                print("\nSUCCESS: All status toggling logic and public filters working perfectly!")
            else:
                print("\nFAILURE: Behavior did not match expectations.")
        else:
            print("No artists found to test.")
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_workflow()
