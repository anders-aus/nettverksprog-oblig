const compileButton = document.getElementById("compile-button");
compileButton.addEventListener("click", function () {
// We get the elements from document
  const languageSelect = document.getElementById("language-select");
  const codeInput = document.getElementById("code-input");
  const outputArea = document.getElementById("output-textarea");

// Format user input into desired format as a sendable object
  const inputLanguage = languageSelect.value;
  const inputCode = codeInput.value;
  const sendableObject = {
    language: inputLanguage,
    code: inputCode,
  };

// POST request to code compilation endpoint, sending the sendable object and 
// setting output text area to display the response
  axios
    .post("/compile", sendableObject)
    .then(function (response) {
      outputArea.value = response.data;
    })
    .catch(function (error) {
      console.error(error);
    });
});
