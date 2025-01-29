const { PythonShell } = require("python-shell");
const path = require("path");
const SqlQuery = require("../models/sqlQuery");

const analyzeSqlContent = async (sqlContent) => {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.resolve(
      __dirname,
      "../../sql-description-generator/generate_descriptions.py"
    );

    const options = {
      mode: "json",
      pythonPath:
        "C:\\Users\\l\\OneDrive\\Desktop\\ZingleAITask\\sql-description-generator\\venv\\Scripts\\python.exe",
      pythonOptions: ["-u"], // unbuffered output
      args: [sqlContent],
    };

    console.log("Running Python script at:", pythonScriptPath);

    PythonShell.run(pythonScriptPath, options)
      .then((results) => {
        if (!results || results.length === 0) {
          return reject(new Error("No output received from Python script"));
        }

        try {
          const parsedResult = results[0];
          resolve(parsedResult);
        } catch (parseError) {
          reject(
            new Error("Error parsing Python script output: " + parseError)
          );
        }
      })
      .catch((err) => {
        console.error("Python script error:", err);
        reject(err);
      });
  });
};

exports.uploadSql = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const results = [];

    for (const file of req.files) {
      const sqlContent = file.buffer.toString();

      try {
        // Analyze SQL using Python script
        const analysisResult = await analyzeSqlContent(sqlContent);

        if (analysisResult.error) {
          results.push({
            fileName: file.originalname,
            error: analysisResult.error,
          });
          continue;
        }

        // Store in MongoDB
        const sqlQuery = new SqlQuery({
          fileName: file.originalname,
          sqlContent: sqlContent,
          analysisResults: analysisResult,
        });

        await sqlQuery.save();
        results.push({
          fileName: file.originalname,
          analysisResults: analysisResult,
        });
      } catch (err) {
        console.error("Error analyzing SQL:", err);
        results.push({
          fileName: file.originalname,
          error: err.message,
        });
      }
    }

    res.status(201).json({
      message: "SQL files processed successfully",
      results,
    });
  } catch (error) {
    console.error("Error processing SQL files:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.analyzeQueries = async (req, res) => {
  try {
    const queries = await SqlQuery.find().sort("-createdAt");
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
