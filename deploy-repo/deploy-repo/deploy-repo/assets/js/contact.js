document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector('.contact-form-section form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    const nameInput = form.elements['name'];
    const emailInput = form.elements['email'];
    const messageInput = form.elements['message'];

    // Sanitize
    nameInput.value = sanitizeInput(nameInput.value.trim());
    emailInput.value = sanitizeInput(emailInput.value.trim());
    messageInput.value = sanitizeInput(messageInput.value.trim());

    // Validate email
    if (!isValidEmail(emailInput.value)) {
      alert("Por favor ingresa un correo electrónico válido.");
      emailInput.focus();
      e.preventDefault();
      return false;
    }

    // Check required fields
    if (!nameInput.value || !messageInput.value) {
      alert("Por favor completa todos los campos.");
      e.preventDefault();
      return false;
    }
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function sanitizeInput(str) {
    return str.replace(/[<>"'`]/g, "");
  }
});