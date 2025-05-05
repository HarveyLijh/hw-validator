class AssignmentBase {
    // ...

    async function loadAsyncZip(file) {
        // ...
    }
}

export class Assignment extends AssignmentBase {
    assignmentName() {
        return "Unity C# Project";
    }
    
    artifactFilename() {
        return "unity-csharp-submission-artifact.html";
    }
    
    submissionForm() {
        return `
        <h3>A zip of your Unity project</h3>
        <input type="file" id="zip-input" accept=".zip" />
        <h3>I completed this project with the following students (email addresses, one per line)</h3>
        <textarea name="collaborators" placeholder="example@ucsc.edu"></textarea>
        `;
    }
    
    async runTests(form, updateResult) {
        // Get the zip file
        const zipInput = form.querySelector("#zip-input");
        const zipFile = zipInput.files[0];
        
        // Check if a file was uploaded
        if (!zipFile) {
            updateResult("Error: No zip file uploaded.");
            return null;
        }
        
        // Check file size (limit to 50MB)
        const MAX_SIZE_MB = 50;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
        if (zipFile.size > MAX_SIZE_BYTES) {
            updateResult(`Error: Zip file is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
            return null;
        }
        
        // Check if it's a valid zip file
        if (zipFile.type !== "application/zip" && !zipFile.name.endsWith(".zip")) {
            updateResult("Error: Uploaded file is not a valid zip file.");
            return null;
        }
        
        try {
            // Load and validate the zip contents
            updateResult("Loading and validating zip file...");
            const zip = await this.loadAsyncZip(zipFile);
            
            // Check for at least two .cs files
            const csFiles = [];
            zip.forEach((relativePath, zipEntry) => {
                if (relativePath.endsWith(".cs") && !zipEntry.dir) {
                    csFiles.push(relativePath);
                }
            });
            
            if (csFiles.length < 2) {
                updateResult("Error: Zip file must contain at least two .cs files.");
                return null;
            }
            
            // Validate collaborator emails
            const collaboratorsText = form.querySelector("textarea[name='collaborators']").value;
            const collaborators = collaboratorsText.split("\n").filter(line => line.trim() !== "");
            
            const invalidEmails = [];
            collaborators.forEach(email => {
                // Basic email validation plus check for @ucsc.edu domain
                const emailRegex = /^[^\s@]+@ucsc\.edu$/i;
                if (!emailRegex.test(email.trim())) {
                    invalidEmails.push(email.trim());
                }
            });
            
            if (invalidEmails.length > 0) {
                updateResult(`Error: The following collaborator emails are invalid or don't use the @ucsc.edu domain: ${invalidEmails.join(", ")}`);
                return null;
            }
            
            // All validations passed
            updateResult(`Validation successful! Found ${csFiles.length} C# files and ${collaborators.length} valid collaborator emails.`);
            
            return {
                zipFile: zipFile,
                csFiles: csFiles,
                collaborators: collaborators
            };
        } catch (error) {
            updateResult(`Error processing zip file: ${error.message}`);
            return null;
        }
    }
    
    generateArtifactBody(form, testResults) {
        if (!testResults) {
            return `<h1>Submission Failed</h1>
                    <p>Your submission did not pass validation. Please check the errors and try again.</p>`;
        }
        
        const csFilesList = testResults.csFiles.map(file => `<li>${file}</li>`).join("");
        const collaboratorsList = testResults.collaborators.map(email => `<li>${email}</li>`).join("");
        
        return `
            <h1>Unity C# Project Submission</h1>
            <h2>Submission Details</h2>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>File Name:</strong> ${testResults.zipFile.name}</p>
            <p><strong>File Size:</strong> ${(testResults.zipFile.size / 1024 / 1024).toFixed(2)} MB</p>
            
            <h2>C# Files Found (${testResults.csFiles.length})</h2>
            <ul>${csFilesList}</ul>
            
            <h2>Collaborators (${testResults.collaborators.length})</h2>
            <ul>${collaboratorsList}</ul>
            
            <p>This submission has been validated and recorded.</p>
        `;
    }
}

