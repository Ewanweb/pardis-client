// Complete Test script for Hero Slides and Success Stories API endpoints
// Run this in browser console to test API functionality

const API_BASE = "https://api.pardistous.ir/api"; // Production API URL

async function testCompleteSliderAPI() {
  console.log("🧪 Testing Hero Slides & Success Stories API...");

  try {
    // === HERO SLIDES TESTS ===
    console.log("📋 Testing GET /hero-slides...");
    const slidesResponse = await fetch(
      `${API_BASE}/hero-slides?adminView=true&includeInactive=true`
    );
    const slidesData = await slidesResponse.json();
    console.log("✅ GET Hero Slides Response:", slidesData);

    console.log("📋 Testing GET /hero-slides/active...");
    const activeSlidesResponse = await fetch(`${API_BASE}/hero-slides/active`);
    const activeSlidesData = await activeSlidesResponse.json();
    console.log("✅ GET Active Hero Slides Response:", activeSlidesData);

    // === SUCCESS STORIES TESTS ===
    console.log("📋 Testing GET /success-stories...");
    const storiesResponse = await fetch(
      `${API_BASE}/success-stories?adminView=true&includeInactive=true`
    );
    const storiesData = await storiesResponse.json();
    console.log("✅ GET Success Stories Response:", storiesData);

    console.log("📋 Testing GET /success-stories/active...");
    const activeStoriesResponse = await fetch(
      `${API_BASE}/success-stories/active`
    );
    const activeStoriesData = await activeStoriesResponse.json();
    console.log("✅ GET Active Success Stories Response:", activeStoriesData);

    // === CREATE TESTS (Requires Authentication) ===
    const token = localStorage.getItem("token");
    if (token) {
      console.log("🔐 Token found, testing CREATE operations...");

      // Test Hero Slide Creation
      console.log("➕ Testing POST /hero-slides...");
      const createSlideData = new FormData();
      createSlideData.append("Title", "Test Slide API");
      createSlideData.append(
        "Description",
        "This is a test slide from API test"
      );
      createSlideData.append("ButtonText", "Learn More");
      createSlideData.append("ButtonLink", "/courses");
      createSlideData.append("Order", "1");
      createSlideData.append("IsActive", "true");

      const createSlideResponse = await fetch(`${API_BASE}/hero-slides`, {
        method: "POST",
        body: createSlideData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (createSlideResponse.ok) {
        const createSlideResult = await createSlideResponse.json();
        console.log("✅ POST Hero Slide Response:", createSlideResult);

        // Clean up - delete the test slide
        if (createSlideResult.data && createSlideResult.data.id) {
          await fetch(`${API_BASE}/hero-slides/${createSlideResult.data.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("🗑️ Test slide cleaned up");
        }
      } else {
        console.error(
          "❌ POST Hero Slide Error:",
          await createSlideResponse.text()
        );
      }

      // Test Success Story Creation
      console.log("➕ Testing POST /success-stories...");
      const createStoryData = new FormData();
      createStoryData.append("Title", "Test Success Story");
      createStoryData.append("Subtitle", "API Test Story");
      createStoryData.append(
        "Description",
        "This is a test success story from API test"
      );
      createStoryData.append("Type", "success");
      createStoryData.append("Order", "1");
      createStoryData.append("IsActive", "true");

      const createStoryResponse = await fetch(`${API_BASE}/success-stories`, {
        method: "POST",
        body: createStoryData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (createStoryResponse.ok) {
        const createStoryResult = await createStoryResponse.json();
        console.log("✅ POST Success Story Response:", createStoryResult);

        // Clean up - delete the test story
        if (createStoryResult.data && createStoryResult.data.id) {
          await fetch(
            `${API_BASE}/success-stories/${createStoryResult.data.id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("🗑️ Test story cleaned up");
        }
      } else {
        console.error(
          "❌ POST Success Story Error:",
          await createStoryResponse.text()
        );
      }
    } else {
      console.warn(
        "⚠️ No authentication token found. Skipping CREATE/UPDATE/DELETE tests."
      );
      console.log(
        "💡 To test authenticated endpoints, login first and run the test again."
      );
    }
  } catch (error) {
    console.error("❌ API Test Error:", error);
  }

  console.log("🏁 API Test Complete!");
}

// Test connection to API
async function testConnection() {
  try {
    console.log("🔗 Testing API connection...");
    const response = await fetch(`${API_BASE}/health-check`);
    if (response.ok) {
      console.log("✅ API Connection: Success");
      return true;
    } else {
      console.error("❌ API Connection: Failed", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ API Connection: Network Error", error.message);
    return false;
  }
}

// Run the test
// testCompleteSliderAPI();

console.log("📝 Complete Hero Slides & Success Stories API Test Script Loaded");
console.log("💡 To run tests, call: testCompleteSliderAPI()");
console.log("🔗 To test connection, call: testConnection()");
console.log("🌐 API Base URL:", API_BASE);
