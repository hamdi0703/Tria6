from playwright.sync_api import sync_playwright
import time
import json

def test_profile_html():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        def handle_supabase(route):
            url = route.request.url
            if "profiles" in url:
                body = [{
                    "id": "mock-user-id",
                    "username": "Guru",
                    "display_name": "Guru",
                    "avatar_url": None,
                    "bio": "Mock bio",
                    "tier": "Klasik",
                    "is_public": True,
                    "created_at": "2024-01-01T00:00:00Z"
                }]
                route.fulfill(status=200, content_type="application/json", body=json.dumps(body))
            elif "user_collections" in url:
                route.fulfill(status=200, content_type="application/json", body=json.dumps([{
                    "id": "mock-collection-1",
                    "user_id": "mock-user-id",
                    "name": "Koleksiyonum",
                    "description": "Mock list",
                    "is_public": True,
                    "created_at": "2024-01-01T00:00:00Z"
                }]))
            elif "collection_items" in url:
                route.fulfill(status=200, content_type="application/json", body=json.dumps([
                    {"id": "item1", "collection_id": "mock-collection-1", "movie_id": 27205, "media_type": "movie", "movie_data": {"id": 27205, "title": "Inception", "poster_path": "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"}},
                    {"id": "item2", "collection_id": "mock-collection-1", "movie_id": 155, "media_type": "movie", "movie_data": {"id": 155, "title": "The Dark Knight", "poster_path": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg"}},
                    {"id": "item3", "collection_id": "mock-collection-1", "movie_id": 157336, "media_type": "movie", "movie_data": {"id": 157336, "title": "Interstellar", "poster_path": "/gEU2QniE6E77NI6lCU6MvlId7St.jpg"}}
                ]))
            elif "reviews" in url:
                route.fulfill(status=200, content_type="application/json", body=json.dumps([]))
            else:
                route.continue_()

        def log_request(route):
            if "supabase.co/rest" in route.request.url:
                handle_supabase(route)
            elif "api.themoviedb.org" in route.request.url:
                 route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps({"genres": [{"id": 28, "name": "Action"}]})
                )
            else:
                route.continue_()

        page.route("**/*", log_request)

        # In hooks/useAuth.ts, it fetches user session from supabase.co/auth/v1/user
        page.route("**/auth/v1/user*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({
                "id": "mock-user-id",
                "app_metadata": {"provider": "email"},
                "user_metadata": {"username": "Guru"},
                "aud": "authenticated",
                "created_at": "2024-01-01T00:00:00Z"
            })
        ))

        print("Navigating to http://localhost:3000/?u=Guru")
        page.goto("http://localhost:3000/?u=Guru")

        # Wait for the "Koleksiyonum" text to appear
        try:
            page.wait_for_selector("text=Koleksiyonum", timeout=10000)
            print("Page loaded successfully.")
        except Exception as e:
            print("Timeout waiting for 'Koleksiyonum'.", e)

        page.screenshot(path="/home/jules/verification/screenshots/verification_width11.png")
        print("Screenshot saved to /home/jules/verification/screenshots/verification_width11.png")

        browser.close()

test_profile_html()
