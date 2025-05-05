// Build a standalone HTML artfact, embedding the ZIP in Base64
export function generateArtifact({
  file,
  entries,
  content,
  passed,
  testResults,
}) {
  // Create a promise to handle the asynchronous FileReader
  return new Promise((resolve) => {
    const reader = new FileReader();

    // Set up the onload handler to complete the HTML artfiact generation
    reader.onload = function (event) {
      // This is the base64 data URL of the file
      const base64Data = event.target.result;

      // Format submission data
      const submissionDate = new Date().toLocaleString();
      const fileSize = (file.size / 1024 / 1024).toFixed(2);

      // Format test results
      const testResultsHtml = testResults
        .map(
          (test) => `
        <div class="test-result ${test.passed ? "test-passed" : "test-failed"}">
          <h3>${test.name}</h3>
          <p>${test.message}</p>
        </div>
      `
        )
        .join("");

      const html = `
      <!DOCTYPE html>
      <html lang="en"><head><meta charset="UTF-8">
      <title>Unity Submission Artifact</title>
      <style>
        body {
          font-family: sans-serif;
          padding: 1rem;
          max-width: 900px;
          margin: 0 auto;
          line-height: 1.6;
        }
        h1 {
          color: #4f46e5;
          margin-bottom: 0.5rem;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          margin-left: 10px;
        }
        .passed {
          background-color: #10b981;
        }
        .failed {
          background-color: #ef4444;
        }
        .test-result {
          margin-bottom: 1rem;
          padding: 15px;
          border-radius: 6px;
        }
        .test-passed {
          background-color: #ecfdf5;
          border-left: 4px solid #10b981;
        }
        .test-failed {
          background-color: #fef2f2;
          border-left: 4px solid #ef4444;
        }
        .test-result h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        .test-result p {
          margin: 0;
        }
        pre {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 6px;
          overflow: auto;
          font-size: 14px;
        }
        ul {
          list-style: none;
          padding-left: 0;
        }
        li {
          margin-bottom: .5rem;
          padding: 5px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .download-section {
          margin: 20px 0;
          padding: 15px;
          background-color: #f3f4f6;
          border-radius: 6px;
        }
        .download-btn {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
        }
        .download-btn:hover {
          background-color: #6366f1;
        }
        .file-info {
          margin-top: 10px;
          font-size: 0.9rem;
          color: #6b7280;
        }
        .submission-info {
          margin: 20px 0;
          padding: 15px;
          background-color: #e0f2fe;
          border-radius: 6px;
        }
        .submission-info p {
          margin: 5px 0;
        }
        .section {
          margin-top: 30px;
          margin-bottom: 30px;
        }
        .summary-info {
          font-size: 1.1rem;
          margin-top: 0;
          margin-bottom: 20px;
        }
      </style>
      </head><body>
        <h1>Unity Submission Artifact <span class="status-badge ${
          passed ? "passed" : "failed"
        }">${passed ? "PASSED" : "FAILED"}</span></h1>
        
        <p class="summary-info">
          ${
            passed
              ? "All validation tests have passed successfully."
              : "Some validation tests have failed. Please review the results below."
          }
        </p>
        
        <div class="section submission-info">
          <h2>Submission Details</h2>
          <p><strong>Filename:</strong> ${file.name}</p>
          <p><strong>File Size:</strong> ${fileSize} MB</p>
          <p><strong>Submission Date:</strong> ${submissionDate}</p>
        </div>
        
        <div class="section download-section">
          <h2>Original ZIP File</h2>
          <a id="download-zip" class="download-btn" href="${base64Data}" download="${
        file.name
      }">Download ZIP</a>
          <div class="file-info">File name: ${file.name} (${fileSize} MB)</div>
        </div>
        
        <div class="section">
          <h2>Test Results</h2>
          ${testResultsHtml}
        </div>
        
        <div class="section">
          <h2>PathFinder.cs Content</h2>
          <pre>${escapeHtml(content)}</pre>
        </div>
      </body></html>
      `;

      resolve(html);
    };

    // Read the file as Data URL (this will be a base64 representation)
    reader.readAsDataURL(file);
  });
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
