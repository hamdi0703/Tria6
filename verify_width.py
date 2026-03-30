from playwright.sync_api import sync_playwright
import time
import json

def test_profile_width():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 720})

        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
        page.on("requestfailed", lambda req: print(f"Request failed: {req.url} {req.failure}"))

        # Inject mock data into localStorage before navigating
        # We also need to mock supabase responses if there's any network call

        # Mock TMDB genre
        page.route("**/genre/movie/list*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"genres": [{"id": 28, "name": "Action"}]})
        ))

        page.route("**/genre/tv/list*", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"genres": [{"id": 10759, "name": "Action & Adventure"}]})
        ))

        # We can use route with a custom handler to mock Supabase calls
        def handle_supabase(route):
            url = route.request.url
            print(f"Intercepted: {url}")
            if "profiles" in url:
                if "application/vnd.pgrst.object+json" in route.request.headers.get("accept", ""):
                    body = {
                        "id": "mock-user-id",
                        "username": "Guru",
                        "display_name": "Guru",
                        "avatar_url": None,
                        "bio": "Mock bio",
                        "tier": "Klasik",
                        "is_public": True,
                        "created_at": "2024-01-01T00:00:00Z"
                    }
                else:
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

        page.route("**/rest/v1/*", handle_supabase)

        # Inject auth so it thinks we are logged in
        page.add_init_script("""
            window.localStorage.setItem('sb-local-auth-token', JSON.stringify({
                access_token: 'mock-token',
                user: { id: 'mock-user-id', user_metadata: { username: 'Guru' } }
            }));
        """)

        print("Navigating to http://localhost:3000/?u=Guru")
        page.goto("http://localhost:3000/?u=Guru")

        # Wait for data to load
        time.sleep(5)

        # Take a screenshot
        page.screenshot(path="/home/jules/verification/screenshots/verification_width4.png")
        print("Screenshot saved to /home/jules/verification/screenshots/verification_width4.png")

        browser.close()

test_profile_width()
