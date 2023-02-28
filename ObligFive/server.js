const express = require("express");
const path = require("path");
const Docker = require("dockerode");
const concat = require("concat-stream");

const app = express();
var docker = new Docker();

// Set the public folder as the static assets directory
app.use(express.static(path.join(__dirname, "public")));

// Load json parser middleware
app.use(express.json());

// Serve the index.html file as the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Set up POST endpoint where compilation and execution of code is handled
app.post("/compile", async function (req, res) {
  // We get our variables from the request body
  const language = req.body.language;
  const code = req.body.code;

  // Runs a Docker container through dockerode. Wrapper for docker.run() that sets up
  // an output stream that captures code execution output, and handles asynchronous data
  async function runDocker(image, cmd) {
    var output;
    try {
      var outStream = concat(function (data) {
        output = data.toString();
        console.log(output);
      });
      var dockerData = await docker.run(image, cmd, outStream);
      // Extract the Docker container created by docker.run(), lets us discard it after use
      var container = dockerData[1];
      await container.remove();
      console.log("Container removed");
    } catch (err) {
      console.error(err);
    }
    return output;
  }

  // TODO: Add support for more languages
  // Execute Python script
  var executionOutput = await runDocker("python-script-runner", [
    "python",
    "-c",
    code,
  ]);

  // We send code execution output as response
  console.log("Output: " + executionOutput);
  res.send(executionOutput);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
