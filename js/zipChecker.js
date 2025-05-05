// Encapsulate all ZIP-based tests
export async function runZipTests(file, updateResult) {
  // File validation is now handled in the UI layer, so we can skip the size check here
  
  // Initialize test results array to track individual test outcomes
  const testResults = [];
  
  try {
    const zip = await JSZip.loadAsync(file);

    // Test 1: no __MACOSX
    const files = Object.keys(zip.files);
    const test1Passed = !files.some((p) => p.startsWith("__MACOSX/"));
    testResults.push({
      name: "No __MACOSX folder",
      passed: test1Passed,
      message: test1Passed ? '✅ No "__MACOSX" folder.' : '❌ FAIL: "__MACOSX" folder present.'
    });
    updateResult(testResults[0].message);
    
    if (!test1Passed) {
      return { 
        passed: false, 
        zip,
        file,
        testResults
      };
    }

    // Strip root folder
    const base = file.name.replace(/\.zip$/i, "");
    const prefix = base + "/";
    const entries = [];
    zip.forEach((path, entry) => {
      const stripped = path.startsWith(prefix) ? path.slice(prefix.length) : path;
      entries.push({ entry, path: stripped });
    });

    // Test 2: PathFinder.cs exists
    const target = "Assets/Scripts/assignment2/PathFinder.cs";
    const found = entries.find((e) => e.path === target);
    const test2Passed = !!found;
    testResults.push({
      name: "PathFinder.cs file check",
      passed: test2Passed,
      message: test2Passed ? `✅ Found "${target}".` : `❌ "${target}" not found.`
    });
    updateResult(testResults[1].message);
    
    if (!test2Passed) {
      return { 
        passed: false, 
        zip,
        file,
        testResults,
        entries
      };
    }

    const content = await zip.file(found.entry.name).async("text");
    
    // Test 3: AStar signature
    const aStarRe = /public\s+static\s*\(List<Vector3>,\s*int\)\s*AStar\s*\(/;
    const test3Passed = aStarRe.test(content);
    testResults.push({
      name: "AStar method signature",
      passed: test3Passed,
      message: test3Passed ? "✅ AStar signature found." : "❌ AStar signature missing."
    });
    updateResult(testResults[2].message);

    // Test 4: REMOVE THIS COMMENT
    const commentRe = /\/\/\s*REMOVE THIS COMMENT/;
    const test4Passed = !commentRe.test(content);
    testResults.push({
      name: "Remove comment check",
      passed: test4Passed,
      message: test4Passed ? '✅ No "// REMOVE THIS COMMENT".' : '❌ "// REMOVE THIS COMMENT" present.'
    });
    updateResult(testResults[3].message);

    // Overall pass requires that all tests pass
    const allPassed = testResults.every(test => test.passed);

    return { 
      passed: allPassed, 
      zip, 
      entries, 
      content, 
      file,
      testResults 
    };
  } catch (error) {
    const errorMsg = `❌ Error processing ZIP: ${error.message}`;
    testResults.push({
      name: "ZIP Processing",
      passed: false,
      message: errorMsg
    });
    updateResult(errorMsg);
    throw error;
  }
}
