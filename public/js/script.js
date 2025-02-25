//  edit.ejs injects values dynamically, which may not be fully available when JavaScript executes.

document.addEventListener("DOMContentLoaded", function () {
  console.log("Validation script loaded!");
  document.getElementById("Form").addEventListener("submit", function (event) {
    let inputs = this.querySelectorAll("input[required], textarea[required]"); // Include textarea
    let isValid = true;

    inputs.forEach((input) => {
      let errorText = input.nextElementSibling;
      if (!input.value.trim()) {
        input.classList.add("border-red-500");
        errorText.classList.remove("hidden");
        isValid = false;
      } else {
        input.classList.remove("border-red-500");
        errorText.classList.add("hidden");
      }
    });

    if (!isValid) event.preventDefault(); // Prevent form submission only if invalid
  });
});
