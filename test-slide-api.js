// تست ساده برای API اسلایدها
const testSlideAPI = () => {
  const formData = new FormData();

  // اضافه کردن فیلدهای مطابق API documentation
  formData.append("Title", "تست اسلاید");
  formData.append("Description", "این یک تست است");
  formData.append("ActionLabel", "کلیک کنید");
  formData.append("ActionLink", "/test");
  formData.append("Order", 1);

  // نمایش محتویات FormData
  console.log("=== Test FormData Contents ===");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  console.log("=== End Test FormData ===");

  // تست با fetch
  fetch("/api/HeroSlides", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

// اجرای تست
testSlideAPI();
