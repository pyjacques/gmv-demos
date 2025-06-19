// Simple viewer for Total 3D model

'use strict';

let uiText = {};

document.addEventListener('DOMContentLoaded', () => {
  fetch('main.json')
    .then((response) => response.json())
    .then((data) => {
      uiText = data;
      initUI();
      setupModals();
    })
    .catch((err) => {
      console.error('Failed to load JSON:', err);
      initUI();
      setupModals();
    });
});

function initUI() {
  const container = document.getElementById('full-page');
  if (!container) return;
  container.innerHTML = `
  <viewer-container>
    <model-viewer id="modelViewer"
      alt="${uiText.viewer_alt || 'Total BESS model'}"
      src="../3Dmodel/V-TOTAL-011.glb"
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      environment-image="neutral"
      exposure="1"
      shadow-intensity="1"
      shadow-softness="1">
    </model-viewer>
    <anim-button id="anim-button">
      <button type="button" class="btn btn-primary text-light fs-3" onclick="separateView()">
        <span id="anim-button-tooltip" data-bs-toggle="tooltip" data-bs-placement="right" title="${uiText.separate_view_tooltip || 'separate-view'}"><i class="bi bi-layers-half"></i></span>
      </button>
    </anim-button>
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
}

function setupModals() {
  const welcomeEl = document.getElementById('welcomeModal');
  const tutorialEl = document.getElementById('tutorialModal');

  if (welcomeEl) {
    const welcomeModal = new bootstrap.Modal(welcomeEl);
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        welcomeModal.hide();
        if (tutorialEl) {
          const tutorialModal = new bootstrap.Modal(tutorialEl);
          tutorialModal.show();
        }
      });
    }
    setTimeout(() => {
      welcomeModal.show();
      $('#overlay').fadeOut('slow');
    }, 1000);
  }

  if (tutorialEl) {
    const closeBtn = document.getElementById('tutorial-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
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
}
