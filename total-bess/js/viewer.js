// Simple viewer for Total 3D model

'use strict';

let uiText = {};

document.addEventListener('DOMContentLoaded', () => {
  fetch('main.json')
    .then((response) => response.json())
    .then((data) => {
      uiText = data;
      initUI();
      setupLoadListener();
    })
    .catch((err) => {
      console.error('Failed to load JSON:', err);
      initUI();
      setupLoadListener();
    });
});

function initUI() {
  const container = document.getElementById('full-page');
  if (!container) return;
  container.innerHTML = `
  <viewer-container>
    <model-viewer id="modelViewer"
      alt="${uiText.viewer_alt || 'Total BESS model'}"
      src="3Dmodel/V-TOTAL-011.glb"
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      environment-image="neutral"
      exposure="1"
      shadow-intensity="1"
      shadow-softness="1">
      <div id="zone1" class="zoneHotSpot" slot="hotspot-zone1" data-position="0 0 0.5" data-normal="0 0 1"></div>
      <div id="zone2" class="zoneHotSpot" slot="hotspot-zone2" data-position="0.5 0 0.5" data-normal="0 0 1"></div>
      <div id="zone3" class="zoneHotSpot" slot="hotspot-zone3" data-position="-0.5 0 0.5" data-normal="0 0 1"></div>
    </model-viewer>
  </viewer-container>`;

  if (uiText.page_title) document.title = uiText.page_title;

  const brandLogo = document.getElementById('brand-logo');
  if (brandLogo && uiText.brand_logo_alt) brandLogo.alt = uiText.brand_logo_alt;

  const tooltipExp = document.getElementById('tooltip-explications');
  if (tooltipExp && uiText.info_button_tooltip) tooltipExp.setAttribute('title', uiText.info_button_tooltip);

  const tooltipInfo = document.getElementById('tooltip-informations');
  if (tooltipInfo && uiText.info_tooltip) tooltipInfo.setAttribute('title', uiText.info_tooltip);

  const modalLabel = document.getElementById('infoModalLabel');
  if (modalLabel && uiText.modal_title) modalLabel.textContent = uiText.modal_title;

  const helpTitle = document.getElementById('modal-help-title');
  if (helpTitle && uiText.modal_help_title) helpTitle.textContent = uiText.modal_help_title;

  const helpText = document.getElementById('modal-help-text');
  if (helpText && uiText.modal_help_text) helpText.textContent = uiText.modal_help_text;

  const okBtn = document.getElementById('modal-ok-btn');
  if (okBtn && uiText.modal_ok) okBtn.textContent = uiText.modal_ok;

  const loader = document.getElementById('loader-text');
  if (loader && uiText.loader_text) loader.textContent = uiText.loader_text;

  const infoBtn = document.getElementById('info-btn');
  if (infoBtn) {
    infoBtn.addEventListener('click', () => {
      const infoModalEl = document.getElementById('infoModal');
      if (infoModalEl) {
        const modal = new bootstrap.Modal(infoModalEl);
        modal.show();
      }
    });
  }

  // Initialize all Bootstrap tooltips
  const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipEls.forEach((el) => new bootstrap.Tooltip(el));
}

function setupLoadListener() {
  const modelViewer = document.getElementById('modelViewer');
  if (!modelViewer) return;

  const hideOverlay = () => {
    $('#overlay').fadeOut('slow', () => {
      setupModals();
    });
  };

  modelViewer.addEventListener('model-visibility', hideOverlay, { once: true });
  modelViewer.addEventListener('load', hideOverlay, { once: true });
}

function setupModals() {
  const welcomeEl = document.getElementById('welcomeModal');
  const tutorialEl = document.getElementById('tutorialModal');

  const tutorialModal = tutorialEl ? new bootstrap.Modal(tutorialEl) : null;

  if (welcomeEl) {
    const welcomeModal = new bootstrap.Modal(welcomeEl);
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        startBtn.blur();
        welcomeModal.hide();
        if (tutorialModal) {
          welcomeEl.addEventListener(
            'hidden.bs.modal',
            () => tutorialModal.show(),
            { once: true }
          );
        }
      });
    }
    welcomeModal.show();
  }

  if (tutorialModal) {
    const closeBtn = document.getElementById('tutorial-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeBtn.blur();
        const tutInstance = bootstrap.Modal.getInstance(tutorialEl) || new bootstrap.Modal(tutorialEl);
        tutInstance.hide();
      });
    }
  }
}

async function separateView() {
  const modelViewer = document.querySelector('#modelViewer');
  if (!modelViewer) return;
  modelViewer.animationName = 'Explode';
  await modelViewer.updateComplete;
  modelViewer.timeScale = 1;
  await modelViewer.play({ repetitions: 1 });
  $('#anim-button').html(
    `<button type="button" class="btn btn-primary text-light fs-3" onclick="initialView()">
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="${uiText.initial_view_tooltip || 'initial-view'}"><i class="bi bi-box"></i></span>
    </button>`
  );
  document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el));
}

async function initialView() {
  const modelViewer = document.querySelector('#modelViewer');
  if (!modelViewer) return;
  modelViewer.animationName = 'Mount';
  await modelViewer.updateComplete;
  modelViewer.timeScale = 1;
  await modelViewer.play({ repetitions: 1 });
  $('#anim-button').html(
    `<button type="button" class="btn btn-primary text-light fs-3" onclick="separateView()">
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="${uiText.separate_view_tooltip || 'separate-view'}"><i class="bi bi-layers"></i></span>
    </button>`
  );
  document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el));
}
