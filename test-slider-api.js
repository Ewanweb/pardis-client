// Test script for Hero Slides API endpoints
// Run this in browser console to test API functionality

const API_BASE = "http://localhost:5000/api"; // Update with your API URL

async function testSliderAPI() {
  console.log("🧪 Testing Hero Slides API...");

  try {
    // 1. Test GET all slides
    console.log("📋 Testing GET /hero-slides...");
    const response = await fetch(
      `${API_BASE}/hero-slides?adminView=true&includeInactive=true`
    );
    const data = await response.json();
    console.log("✅ GET Response:", data);

    // 2. Test GET active slides
    console.log("📋 Testing GET /hero-slides/active...");
    const activeResponse = await fetch(`${API_BASE}/hero-slides/active`);
    const activeData = await activeResponse.json();
    console.log("✅ GET Active Response:", activeData);

    // 3. Test POST (create new slide)
    console.log("➕ Testing POST /hero-slides...");
    const createData = new FormData();
    createData.append("Title", "Test Slide");
    createData.append("Description", "This is a test slide");
    createData.append("ButtonText", "Learn More");
    createData.append("ButtonLink", "/courses");
    createData.append("Order", "1");
    createData.append("IsActive", "true");

    const createResponse = await fetch(`${API_BASE}/hero-slides`, {
      method: "POST",
      body: createData,
      headers: {
        Authorization: "Bearer YOUR_TOKEN_HERE", // Add your auth token
      },
    });

    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log("✅ POST Response:", createResult);

      // 4. Test PUT (update slide)
      if (createResult.data && createResult.data.id) {
        console.log("✏️ Testing PUT /hero-slides/{id}...");
        const updateData = new FormData();
        updateData.append("Title", "Updated Test Slide");
        updateData.append("Description", "This slide has been updated");
        updateData.append("ButtonText", "Updated Button");
        updateData.append("ButtonLink", "/updated");
        updateData.append("Order", "1");
        updateData.append("IsActive", "false");

        const updateResponse = await fetch(
          `${API_BASE}/hero-slides/${createResult.data.id}`,
          {
            method: "PUT",
            body: updateData,
            headers: {
              Authorization: "Bearer YOUR_TOKEN_HERE",
            },
          }
        );

        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log("✅ PUT Response:", updateResult);
        } else {
          console.error("❌ PUT Error:", await updateResponse.text());
        }

        // 5. Test DELETE
        console.log("🗑️ Testing DELETE /hero-slides/{id}...");
        const deleteResponse = await fetch(
          `${API_BASE}/hero-slides/${createResult.data.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: "Bearer YOUR_TOKEN_HERE",
            },
          }
        );

        if (deleteResponse.ok) {
          const deleteResult = await deleteResponse.json();
          console.log("✅ DELETE Response:", deleteResult);
        } else {
          console.error("❌ DELETE Error:", await deleteResponse.text());
        }
      }
    } else {
      console.error("❌ POST Error:", await createResponse.text());
    }
  } catch (error) {
    console.error("❌ API Test Error:", error);
  }

  console.log("🏁 API Test Complete!");
}

// Run the test
// testSliderAPI();

console.log("📝 Hero Slides API Test Script Loaded");
console.log("💡 To run tests, call: testSliderAPI()");
console.log("⚠️ Make sure to update API_BASE URL and add your auth token");
