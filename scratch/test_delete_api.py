import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app import app, db, cursor

client = app.test_client()

def test_delete():
    try:
        # Check initial count
        res_before = client.get('/all_artists')
        count_before = len(res_before.json)
        print(f"Total artists before deletion: {count_before}")
        
        # We delete artist with ID 4 (a duplicate of ID 3)
        target_id = 4
        print(f"Deleting artist ID {target_id}...")
        res_delete = client.delete(f'/delete_artist/{target_id}')
        print(f"Delete Response Status: {res_delete.status_code}")
        print(f"Delete Response Body: {res_delete.json}")
        
        # Check count after
        res_after = client.get('/all_artists')
        artists_after = res_after.json
        count_after = len(artists_after)
        print(f"Total artists after deletion: {count_after}")
        
        # Verify it's gone
        found = any(a['id'] == target_id for a in artists_after)
        print(f"Is artist ID {target_id} still in the list? {found}")
        
        if count_after == count_before - 1 and not found:
            print("\nSUCCESS: Delete artist API working perfectly!")
        else:
            print("\nFAILURE: Delete operation verification failed.")
            
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_delete()
