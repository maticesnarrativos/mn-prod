document.addEventListener("DOMContentLoaded", () => {
  const scriptTag = document.currentScript || document.querySelector('script[src*="faq.js"]');
  const questionsFile = scriptTag.getAttribute('data-questions') || 'assets/json/faq.json';

  fetch(questionsFile)
    .then(res => res.json())
    .then(questions => {
      const container = document.querySelector('.quesitions-container');
      if (!container) return;
      container.innerHTML = `
        <div class="faq-accordion">
          ${questions.map((q, i) => `
            <div class="faq-item">
              <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${i}">
                <span class="faq-arrow">&#9654;</span>
                ${q.question}
              </button>
              <div class="faq-answer" id="faq-answer-${i}" hidden>
                ${q.answer}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Add event listeners for accordion behavior
      container.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', function() {
          const answer = this.nextElementSibling;
          const expanded = this.getAttribute('aria-expanded') === 'true';
          // Toggle current
          this.setAttribute('aria-expanded', !expanded);
          answer.hidden = expanded;
          // Rotate arrow
          const arrow = this.querySelector('.faq-arrow');
          if (!expanded) {
            arrow.style.transform = "rotate(90deg)";
          } else {
            arrow.style.transform = "rotate(0deg)";
          }
        });
      });
    })
    .catch(err => {
      console.error("Error loading questions:", err);
    });
});