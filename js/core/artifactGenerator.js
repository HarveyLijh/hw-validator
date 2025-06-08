// core/artifactGenerator.js

/**
 * Generates data URLs for multiple files
 * @param {Array<File>} files - Array of files to generate data URLs for
 * @returns {Promise<Array<Object>>} - Promise resolving to array of {file, dataUrl} objects
 */
function generateFileDataUrls(files) {
  return Promise.all(files.map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve({ file, dataUrl: e.target.result });
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  }));
}

/**
 * Generates artifact HTML with support for multiple file downloads
 * 
 * This function automatically creates download buttons for each file uploaded
 * through createFileUploader components. Each file will have its own download
 * button in the final artifact, allowing users to download the original files.
 * 
 * @param {Object} params - Parameters object
 * @param {Array<File>|File} params.files - Array of files or single file to include
 * @param {string} params.title - Title for the artifact
 * @param {string} params.bodyHtml - HTML content for the artifact body
 * @returns {Promise<string>} - Promise resolving to complete HTML string
 */
export function generateArtifactHTML({ files, title, bodyHtml }) {
  // Ensure files is always an array for backwards compatibility
  const fileArray = Array.isArray(files) ? files : (files ? [files] : []);
  
  return new Promise(async (resolve, reject) => {
    try {
      const submissionDate = new Date().toLocaleString();
      let fileDataUrls = [];
      
      if (fileArray.length > 0) {
        fileDataUrls = await generateFileDataUrls(fileArray);
      }
      
      // Generate download buttons for each file
      const downloadButtonsHtml = fileDataUrls.map(({ file, dataUrl }) => `
        <a class="download-btn" href="${dataUrl}" download="${file.name}">
          <i class="fas fa-download mr-1"></i>Download ${file.name}
        </a>
      `).join(' ');
      
      // Generate file summary
      const filesSummaryHtml = fileDataUrls.length > 0 ? `
        <div class="files-summary mb-4">
          <h3>Submitted Files:</h3>
          <ul class="file-list">
            ${fileDataUrls.map(({ file }) => `
              <li><strong>${file.name}</strong> (${(file.size/1024/1024).toFixed(2)} MB)</li>
            `).join('')}
          </ul>
        </div>
      ` : '';

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
      .download-btn { 
        display: inline-block; 
        padding: 0.5rem 1rem; 
        background: #4f46e5; 
        color: #fff; 
        border-radius: 4px; 
        text-decoration: none; 
        margin: 0.25rem;
        transition: background-color 0.2s;
      }
      .download-btn:hover { background: #3f37c9; }
      .files-summary { background: #f9fafb; padding: 1rem; border-radius: 4px; border: 1px solid #e5e7eb; }
      .file-list { margin: 0.5rem 0; padding-left: 1.5rem; }
      .file-list li { margin: 0.25rem 0; }
      .downloads-section { margin-top: 2rem; padding-top: 1rem; border-top: 2px solid #e5e7eb; }
    </style>
  </head>
  <body>
    <h1>${title} Artifact</h1>
    <p><strong>Submission Date:</strong> ${submissionDate}</p>
    ${filesSummaryHtml}
    <div>
      ${bodyHtml}
    </div>
    ${downloadButtonsHtml ? `
      <div class="downloads-section">
        <h3>Download Original Files:</h3>
        ${downloadButtonsHtml}
      </div>
    ` : ''}
  </body>
  </html>`;
      resolve(html);
    } catch (error) {
      reject(error);
    }
  });
}