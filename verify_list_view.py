import os
import json
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Setup mock user and collection data in localStorage to bypass auth
    mock_user = {
        "id": "test_user_id",
        "username": "testuser",
        "subscription_tier": "PRO"
    }

    # Create a mock collection with some movies, including one with a review
    mock_collections = [
        {
            "id": "mock_collection_1",
            "name": "My Favorites",
            "movies": [
                {
                    "id": 123,
                    "title": "Inception",
                    "poster_path": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                    "vote_average": 8.8,
                    "release_date": "2010-07-15",
                    "runtime": 148,
                    "genres": [{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}],
                    "genre_ids": [28, 878],
                    "addedAt": "2024-01-01T12:00:00.000Z"
                },
                {
                    "id": 456,
                    "title": "Interstellar",
                    "poster_path": "/gEU2QniE6E77NI6lCU6MvrIdYcB.jpg",
                    "vote_average": 8.6,
                    "release_date": "2014-11-05",
                    "runtime": 169,
                    "genres": [{"id": 12, "name": "Adventure"}, {"id": 18, "name": "Drama"}],
                    "genre_ids": [12, 18],
                    "addedAt": "2024-01-02T12:00:00.000Z"
                }
            ],
            "topFavoriteMovies": [123, 456, None, None, None],
            "topFavoriteShows": [None, None, None, None, None],
            "owner": "test_user_id",
            "ownerId": "test_user_id"
        }
    ]

    mock_reviews = {
        "123": {
            "movieId": 123,
            "rating": 9,
            "comment": "This is an amazing movie with a mind-bending plot. The visual effects are stunning, and the soundtrack by Hans Zimmer is unforgettable. I highly recommend watching it multiple times to fully grasp the intricate layers of the story. A true masterpiece of modern cinema.",
            "createdAt": "2023-01-01T00:00:00.000Z",
            "user_id": "test_user_id"
        }
    }

    # Intercept everything to make it fast
    page.route("**/genre/movie/list*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({"genres": [{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}]})
    ))

    page.route("**/search/movie*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({"results": []})
    ))

    # We need a proper mock for the Supabase collections endpoint
    # to avoid the endless loading spinner
    page.route("**/rest/v1/collections?*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps(mock_collections)
    ))

    page.route("**/rest/v1/collection_items?*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([{"movie_data": mock_collections[0]["movies"][0]}, {"movie_data": mock_collections[0]["movies"][1]}])
    ))

    # Allow reviews
    page.route("**/rest/v1/reviews?*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps(list(mock_reviews.values()))
    ))

    # We need a profile mock too
    page.route("**/rest/v1/profiles?*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([{"id": "test_user_id", "username": "testuser", "subscription_tier": "PRO"}])
    ))

    # Catch any other supabase calls
    page.route("**/rest/v1/*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([])
    ))

    # Disable supabase auth token check network request
    page.route("**/auth/v1/user", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({"id": "test_user_id", "aud": "authenticated", "role": "authenticated", "email": "test@test.com", "user_metadata": {"username": "testuser"}})
    ))

    fake_session = {
        "currentSession": {
            "access_token": "fake_token",
            "refresh_token": "fake_refresh",
            "expires_at": 1999999999,
            "expires_in": 3600,
            "token_type": "bearer",
            "user": {
                "id": "test_user_id",
                "aud": "authenticated",
                "role": "authenticated",
                "email": "test@test.com",
                "user_metadata": {"username": "testuser"}
            }
        },
        "expiresAt": 1999999999
    }

    # Setup the state before navigation to properly skip landing pages and loading state
    # We must go to a simple empty page first to inject localStorage BEFORE the app boots
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    page.evaluate(f"window.localStorage.setItem('hasVisited', 'true')")
    page.evaluate(f"window.localStorage.setItem('tria_mock_user', '{json.dumps(mock_user)}')")
    page.evaluate(f"window.localStorage.setItem('tria_collections', '{json.dumps(mock_collections)}')")
    page.evaluate("window.localStorage.setItem('tria_active_collection', 'mock_collection_1')")
    page.evaluate(f"window.localStorage.setItem('tria_reviews', '{json.dumps(mock_reviews)}')")
    page.evaluate(f"window.localStorage.setItem('tria_is_syncing', 'false')")
    page.evaluate(f"window.localStorage.setItem('supabase.auth.token', '{json.dumps(fake_session)}')")
    page.evaluate(f"window.localStorage.setItem('sb-supabase-auth-token', '{json.dumps(fake_session)}')")

    # Now boot the app
    page.goto("http://localhost:3000")
    page.wait_for_timeout(3000)

    # Check if we landed on Welcome
    if page.get_by_text("Keşfetmeye Başla").is_visible():
        page.get_by_text("Keşfetmeye Başla").click()
        page.wait_for_timeout(2000)
    elif page.get_by_text("Uygulamaya Dön").is_visible():
         page.get_by_text("Uygulamaya Dön").click()
         page.wait_for_timeout(2000)

    # We are on the Explore page by default. Click on 'Koleksiyon' tab to go to the Dashboard view
    koleksiyon_btn = page.locator('button', has_text="Koleksiyon").first
    if koleksiyon_btn.is_visible():
        koleksiyon_btn.click()
        page.wait_for_timeout(2000)

    # Force React State to bypass spinner if it's stubbornly waiting for Supabase
    page.evaluate("""
        const state = JSON.parse(window.localStorage.getItem('tria_collections') || '[]');
        window.dispatchEvent(new Event('storage'));
    """)

    # Make sure we're seeing the dashboard content
    page.screenshot(path="/home/jules/verification/screenshots/dashboard_initial.png")

    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/dashboard_later.png")

    # The collection context might take a moment
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/dashboard_later2.png")

    # Let's try to find the list view button regardless
    list_view_button = page.locator('button[title="Liste Görünümü"]')
    if list_view_button.is_visible():
        list_view_button.click()
        page.wait_for_timeout(1000)

        page.screenshot(path="/home/jules/verification/screenshots/list_view.png")

        # Click "Devamını Oku" to expand review
        read_more_button = page.get_by_text("Devamını Oku")
        if read_more_button.is_visible():
            read_more_button.click()
            page.wait_for_timeout(1000)

            page.screenshot(path="/home/jules/verification/screenshots/review_expanded.png")

        # Switch back to Grid view
        grid_view_button = page.locator('button[title="Izgara Görünümü"]')
        if grid_view_button.is_visible():
            grid_view_button.click()
            page.wait_for_timeout(1000)

            page.screenshot(path="/home/jules/verification/screenshots/grid_view.png")
    else:
        print("Could not find list view button")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()

        # Log all console messages
        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()