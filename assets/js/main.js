document.addEventListener("DOMContentLoaded", () => {
  fetch('assets/config/contact.json')
    .then(res => res.json())
    .then(data => {
      const contact = document.getElementById("contact-email");
      if (contact && data.email) {
        contact.innerHTML = `<strong><a href="mailto:${data.email}">${data.email}</a></strong>`;
      }
    });

  fetch('assets/config/entities/ramallah.json')
    .then(res => res.json())
    .then(data => {
      const entityInfo = document.getElementById("entity-info");
      if (entityInfo && data.entity && data.symbolic_label) {
        entityInfo.textContent = `${data.entity} – ${data.symbolic_label}`;
        entityInfo.style.color = "#888";
      }
    });

  fetch('assets/config/moves/symbolic_moves.json')
    .then(res => res.json())
    .then(data => {
      const moveLabel = document.getElementById("symbolic-move");
      if (moveLabel && data.current_move) {
        moveLabel.textContent = `النقلة الرمزية الحالية: ${data.current_move}`;
      }
    });

  fetch('assets/config/moves/seasonal.json')
    .then(res => res.json())
    .then(data => {
      if (data.snow_mode === true) {
        document.body.classList.add("snow-theme");
      }

      const seasonInfo = document.getElementById("season-info");
      if (seasonInfo && data.season_label && data.season_note) {
        seasonInfo.textContent = `${data.season_label} – ${data.season_note}`;
      }

      const recommendation = document.getElementById("recommendation-mode");
      if (recommendation && data.recommendation_mode) {
        recommendation.textContent = `نمط التوصية: ${data.recommendation_mode}`;
      }

      const alert = document.getElementById("alert-level");
      if (alert && data.alert_level) {
        alert.textContent = `مستوى التنبيه: ${data.alert_level}`;
      }
    });

  function updateRecommendationDisplay(mode) {
    const recommendation = document.getElementById("recommendation-mode");
    if (recommendation) {
      recommendation.textContent = `نمط التوصية: ${mode}`;
    }
  }

  function updateAlertDisplay(level) {
    const alert = document.getElementById("alert-level");
    if (alert) {
      alert.textContent = `مستوى التنبيه: ${level}`;
    }
  }

  const recommendationSelect = document.getElementById("recommendation-select");
  if (recommendationSelect) {
    recommendationSelect.addEventListener("change", (e) => {
      const mode = e.target.value;
      localStorage.setItem("recommendation_mode", mode);
      updateRecommendationDisplay(mode);
    });
  }

