"use strict";

// Setup drag and drop labels for POI hotspots

function registerDraggableLabel(label) {
  if (!label) return;
  label.addEventListener('dragstart', (ev) => {
    ev.dataTransfer.setData('text/plain', ev.target.id);
    label.classList.add('dragging');
  });
  label.addEventListener('dragend', () => {
    label.classList.remove('dragging');
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const labels = document.querySelectorAll('.draggable-label');
  labels.forEach(registerDraggableLabel);

  const zones = document.querySelectorAll('.zoneHotSpot');
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
          zone.appendChild(label);
          zone.classList.remove('drop-target');
          zone.classList.add('visited');
          label.setAttribute('draggable', 'false');
          if (typeof checkCompletion === 'function') {
            checkCompletion();
          }
        }
    });
  });
});

// expose helper for dynamically created labels
window.registerDraggableLabel = registerDraggableLabel;

