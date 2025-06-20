"use strict";

// Setup drag and drop labels for POI hotspots

document.addEventListener("DOMContentLoaded", () => {
  const labels = document.querySelectorAll('.draggable-label');
  const zones = document.querySelectorAll('.zoneHotSpot');
  const placements = {};
  const labelLoc = {};
  let mistakes = 0;
  const validateBtn = document.getElementById('validate-btn');

  function checkCompletion() {
    const solution = window.dragDropSolution || {};
    if (validateBtn) {
      if (Object.keys(placements).length === Object.keys(solution).length) {
        validateBtn.style.display = 'block';
        validateBtn.disabled = false;
      } else {
        validateBtn.style.display = 'none';
      }
    }
  }

  labels.forEach((label) => {
    label.addEventListener('dragstart', (ev) => {
      ev.dataTransfer.setData('text/plain', ev.target.id);
      label.classList.add('dragging');
    });
    label.addEventListener('dragend', () => {
      label.classList.remove('dragging');
    });
  });

  zones.forEach((zone) => {
    zone.addEventListener('dragover', (ev) => {
      ev.preventDefault();
      zone.classList.add('drop-target');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drop-target');
    });
    zone.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const id = ev.dataTransfer.getData('text/plain');
      const label = document.getElementById(id);
      if (label) {
        const prevZone = labelLoc[id];
        if (prevZone && placements[prevZone]) {
          delete placements[prevZone];
          const prevEl = document.getElementById(prevZone);
          if (prevEl) prevEl.classList.remove('visited');
        }
        zone.appendChild(label);
        zone.classList.remove('drop-target');
        zone.classList.add('visited');
        placements[zone.id] = id;
        labelLoc[id] = zone.id;
        checkCompletion();
      }
    });
  });

  if (validateBtn) {
    validateBtn.addEventListener('click', () => {
      const solution = window.dragDropSolution || {};
      const correct = Object.keys(solution).every(
        (zoneId) => placements[zoneId] === solution[zoneId]
      );
      if (correct) {
        labels.forEach((l) => l.setAttribute('draggable', 'false'));
        validateBtn.disabled = true;
        if (typeof window.onValidationSuccess === 'function') {
          window.onValidationSuccess();
        }
      } else {
        mistakes += 1;
        const answerContainer = document.getElementById('answer-container');
        if (answerContainer) {
          if (mistakes >= 2) {
            const answerText = Object.keys(solution)
              .map((z) => {
                const labelId = solution[z];
                const txt = document.getElementById(labelId)?.textContent || labelId;
                return `${z.toUpperCase()}: ${txt}`;
              })
              .join('\n');
            document.getElementById('answer-text').textContent = answerText;
            answerContainer.style.display = 'block';
          } else {
            answerContainer.style.display = 'none';
          }
        }
        const modalEl = document.getElementById('correctionModal');
        if (modalEl) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      }
    });
  }
});
