document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);

    fetch("/register", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          // Optionally reset the form after successful submission
          document.getElementById("registrationForm").reset();
        } else {
          alert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during registration.");
      });
  });

document
  .getElementById("language-select")
  .addEventListener("change", function () {
    const selectedLanguage = this.value;
    translatePage(selectedLanguage);
  });

function translatePage(language) {
  const translations = {
    en: {
      title: "Registration Form",
      description: "Enter your details below to complete your registration.",
      name: "Name",
      surname: "Surname",
      degree: "Highest Degree",
      diploma: "Diploma File",
      transcript: "Transcript",
      inscription: "Inscription Demand",
      submit: "Register",
    },
    fr: {
      title: "Formulaire d'inscription",
      description:
        "Entrez vos coordonnées ci-dessous pour compléter votre inscription.",
      name: "Nom",
      surname: "Prénom",
      degree: "Niveau d'études",
      diploma: "Diplôme",
      transcript: "Relevé de notes",
      inscription: "Demande d'inscription",
      submit: "S'inscrire",
    },
  };

  document.querySelector(".form-headers h2").textContent =
    translations[language].title;
  document.querySelector(".form-headers p").textContent =
    translations[language].description;
  document.querySelector('label[for="name"]').textContent =
    translations[language].name;
  document.querySelector('label[for="sname"]').textContent =
    translations[language].surname;
  document.querySelector('label[for="degree"]').textContent =
    translations[language].degree;
  document.querySelector('label[for="diploma"]').textContent =
    translations[language].diploma;
  document.querySelector('label[for="transcript"]').textContent =
    translations[language].transcript;
  document.querySelector('label[for="inscription"]').textContent =
    translations[language].inscription;
  document.querySelector('.btn input[type="submit"]').value =
    translations[language].submit;
}
