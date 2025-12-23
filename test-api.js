// Test script for API debugging
// Copy this to browser console and run it

// First, get the attendance ID from the current state
console.log("Current attendances:", window.attendances || "Not available");

// Test the API endpoint directly
async function testPutAPI() {
  try {
    // Replace with actual attendance ID from console logs
    const attendanceId = "YOUR_ATTENDANCE_ID_HERE";

    // Get the API base URL
    const apiBaseUrl =
      localStorage.getItem("apiBaseUrl") || "https://localhost:44367";

    // Get auth token
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    console.log("API Base URL:", apiBaseUrl);
    console.log("Token exists:", !!token);
    console.log("Attendance ID:", attendanceId);

    // Test 1: Try with request wrapper
    const response1 = await fetch(
      `${apiBaseUrl}/api/admin/Attendance/${attendanceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          request: {
            status: 1,
          },
        }),
      }
    );

    console.log("Test 1 Response Status:", response1.status);
    const result1 = await response1.text();
    console.log("Test 1 Response:", result1);
  } catch (error) {
    console.error("Test 1 Error:", error);
  }

  try {
    // Test 2: Try without request wrapper
    const response2 = await fetch(
      `${apiBaseUrl}/api/admin/Attendance/${attendanceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 1,
          checkInTime: new Date().toISOString(),
          note: "",
        }),
      }
    );

    console.log("Test 2 Response Status:", response2.status);
    const result2 = await response2.text();
    console.log("Test 2 Response:", result2);
  } catch (error) {
    console.error("Test 2 Error:", error);
  }
}

// Run the test
testPutAPI();
