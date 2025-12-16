const fs = require("fs");
const path = require("path");

// فایل‌هایی که باید تغییر کنند
const filesToUpdate = [
  "src/pages/Home.jsx",
  "src/pages/CourseDetail.jsx",
  "src/pages/CategoryPage.jsx",
  "src/App.jsx",
];

// تابع تغییر متن
function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // تغییر "آکادمی پردیس" به "آکادمی پردیس توس" (فقط اگر قبلاً "توس" نداشته باشد)
    content = content.replace(/آکادمی پردیس(?! توس)/g, "آکادمی پردیس توس");

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// اجرای تغییرات
console.log("🔄 Updating academy name in files...\n");

filesToUpdate.forEach((file) => {
  if (fs.existsSync(file)) {
    replaceInFile(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log("\n✅ All files updated successfully!");
