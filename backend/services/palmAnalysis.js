const { execFile } = require("child_process");
const path = require("path");

/**
 * Executes the Python MediaPipe landmark detection script on the specified image file.
 * @param {string} imagePath - Absolute path to the uploaded image.
 * @returns {Promise<Object>} - Promise resolving to the landmarks result object.
 */
const runMediaPipeDetection = (imagePath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "palmAnalysis.py");

    // Execute Python script
    execFile("python", [scriptPath, imagePath], (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Python execution error: ${error.message}`));
      }

      if (stderr) {
        console.warn(`Python stderr: ${stderr}`);
      }

      try {
        const result = JSON.parse(stdout.trim());
        if (!result.success) {
          return reject(new Error(result.error || "Landmark detection failed."));
        }
        resolve(result);
      } catch (err) {
        reject(
          new Error(
            `Failed to parse Python script output: ${stdout}. Parser error: ${err.message}`
          )
        );
      }
    });
  });
};

module.exports = {
  runMediaPipeDetection,
};
