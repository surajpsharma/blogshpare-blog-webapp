/**
 * This script helps identify and update API endpoints in the frontend code
 * to use the centralized config.js file.
 *
 * Usage:
 * 1. Run this script with Node.js
 * 2. It will scan all JavaScript files in the frontend/src directory
 * 3. It will identify files using process.env.REACT_APP_BACKEND_URL
 * 4. You can then manually update those files to use config.apiUrl
 */

const fs = require("fs");
const path = require("path");

// Directory to scan
const directoryPath = path.join(__dirname, "frontend", "src");

// Pattern to search for
const pattern = /process\.env\.REACT_APP_BACKEND_URL/g;

// Function to scan files recursively
function scanDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively scan subdirectories
      scanDirectory(filePath);
    } else if (
      stats.isFile() &&
      (file.endsWith(".js") || file.endsWith(".jsx"))
    ) {
      // Read JavaScript files
      const content = fs.readFileSync(filePath, "utf8");

      // Check if the file contains the pattern
      if (pattern.test(content)) {
        console.log(`Found API endpoint in: ${filePath}`);

        // Reset the regex lastIndex
        pattern.lastIndex = 0;

        // Count occurrences
        let match;
        let count = 0;
        while ((match = pattern.exec(content)) !== null) {
          count++;
        }

        console.log(`  - Contains ${count} occurrences`);
        console.log(
          '  - Update to use: import config from "../config"; and ${config.apiUrl}'
        );
        console.log("");
      }
    }
  });
}

console.log("Scanning frontend files for API endpoints...");
console.log("===========================================");
scanDirectory(directoryPath);
console.log("===========================================");
console.log("Scan complete. Update the identified files to use config.apiUrl");
console.log("Example change:");
console.log(
  "  FROM: fetch(`${process.env.REACT_APP_BACKEND_URL}/api/endpoint`)"
);
console.log("  TO:   fetch(`${config.apiUrl}/endpoint`)");
