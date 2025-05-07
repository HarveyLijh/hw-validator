// core/artifactGenerator.js
export function generateArtifactHTML({ file, title, bodyHtml }) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target.result;
        const submissionDate = new Date().toLocaleString();
        const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>${title} Artifact</title>
    <style>
      body { font-family: sans-serif; padding: 1rem; max-width: 800px; margin: auto; }
      h1 { color: #333; }
      pre { background: #f3f4f6; padding: 1rem; border-radius: 4px; overflow: auto; }
      .test-passed { background: #ecfdf5; border-left: 4px solid #10b981; padding: 1rem; margin-bottom: 1rem; }
      .test-failed { background: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; margin-bottom: 1rem; }
      .download-btn { display: inline-block; padding: 0.5rem 1rem; background: #4f46e5; color: #fff; border-radius: 4px; text-decoration: none; }
    </style>
  </head>
  <body>
    <h1>${title} Artifact</h1>
    <p><strong>Original File:</strong> ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)</p>
    <p><strong>Submission Date:</strong> ${submissionDate}</p>
    <div>
      ${bodyHtml}
    </div>
    <a class="download-btn" href="${dataUrl}" download="${file.name}">Download Original File</a>
  </body>
  </html>`;
        resolve(html);
      };
      reader.readAsDataURL(file);
    });
  }