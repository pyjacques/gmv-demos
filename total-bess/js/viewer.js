// Simple viewer for Total 3D model


'use strict';

let uiData = {};
let uiText = {};
let currentLang = 'en';
let isExploded = false;
let modelViewer;
let jsonData = { interactive_hot_spots: [] };

console.log('*** VERY-UP/TOTAL BESS CONTAINER ***')

function detectLang() {
  const navLang = navigator.language || navigator.userLanguage || 'en';
  return navLang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

function applyLanguage(lang) {
  const langData = uiData[lang] || {};
  uiText = langData.main_ui || {};
  jsonData = langData;
  currentLang = lang;
  updateUIText();
  updateLangButton();
  // reposition hotspots when language changes
  updateHotspotPosition(isExploded ? 2 : 1);
}

function setupLangToggle() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    applyLanguage(newLang);
  });
  updateLangButton();
}

function updateLangButton() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;
  const enClass = currentLang === 'en' ? 'active' : 'inactive';
  const frClass = currentLang === 'fr' ? 'active' : 'inactive';
  btn.innerHTML = `<span class="${enClass}">EN</span>-<span class="${frClass}">FR</span>`;
}

function updateUIText() {
  if (!uiText) return;

  document.title = uiText.page_title || document.title;

  const attrs = [
    ['brand-logo', 'alt', uiText.brand_logo_alt],
    ['tooltip-explications', 'title', uiText.info_button_tooltip],
    ['tooltip-separate-view', 'title', uiText.separate_view_tooltip],
  ];

  attrs.forEach(([id, attr, value]) => {
    const el = document.getElementById(id);
    if (el && value) {
      el.setAttribute(attr, value);
    }
  });

  const texts = {
    infoModalLabel: uiText.modal_title,
    'modal-help-title': uiText.modal_help_title,
    'modal-help-text': uiText.modal_help_text,
    'modal-ok-btn': uiText.modal_ok,
    'loader-text': uiText.loader_text,
    welcomeModalLabel: uiText.welcome_title,
    'welcome-bullet-1': uiText.welcome_bullet_1,
    'welcome-bullet-2': uiText.welcome_bullet_2,
    'welcome-tagline': uiText.welcome_tagline,
    'start-btn': uiText.start_button,
    tutorialModalLabel: uiText.tutorial_title,
    'tutorial-text': uiText.tutorial_text,
    'tutorial-close-btn': uiText.tutorial_button,
  };

  Object.entries(texts).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el && value) {
      el.textContent = value;
    }
  });

  const animSpan = document.querySelector('#anim-button span[title]');
  if (animSpan) {
    const title = isExploded ? uiText.initial_view_tooltip : uiText.separate_view_tooltip;
    if (title) animSpan.setAttribute('title', title);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('main.json')
    .then((response) => response.json())
    .then((data) => {
      uiData = data;
      currentLang = detectLang();
      applyLanguage(currentLang);
      initUI();
      setupLoadListener();
      setupLangToggle();
    })
    .catch((err) => {
      console.error('Failed to load JSON:', err);
      currentLang = detectLang();
      applyLanguage(currentLang);
      initUI();
      setupLoadListener();
      setupLangToggle();
    });

  // Ensure body cleanup when multiple modals are used
  $('body').on('hidden.bs.modal', '.modal', function () {
    if ($('.modal.show').length === 0) {
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
    }
  });
});

function initUI() {
  const container = document.getElementById('full-page');
  if (!container) return;
  const spots = uiData[currentLang].interactive_hot_spots || [];
  const hotspotsMarkup = spots
    .map(
      (s, i) =>
        `<div id="zone${i + 1}" class="zoneHotSpot" slot="hotspot-zone${i + 1}" data-position="${s.viewer_3d_data_position1}" data-normal="${s.viewer_3d_data_normal || '0 0 1'}"></div>`
    )
    .join('\n');

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
      ${hotspotsMarkup}
    </model-viewer>
  </viewer-container>`;
  modelViewer = document.getElementById('modelViewer');
  updateUIText();

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

  const okBtn = document.getElementById('modal-ok-btn');
  if (okBtn) {
    okBtn.addEventListener('click', () => {
      okBtn.blur();
      const infoModalEl = document.getElementById('infoModal');
      if (infoModalEl) {
        const infoInstance =
          bootstrap.Modal.getInstance(infoModalEl) ||
          new bootstrap.Modal(infoModalEl);
        infoInstance.hide();
      }
    });
  }
}

function setupLoadListener() {
  if (!modelViewer) {
    modelViewer = document.getElementById('modelViewer');
  }
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

//// In/Out animations
async function separateView() {
  isExploded = true
  await updateHotspotPosition(2)
  modelViewer.animationName = 'Explode'
  await modelViewer.updateComplete
  modelViewer.timeScale = 1
  await modelViewer.play({ repetitions: 1 })
  $('#anim-button').html(
    `<button type="button" class="btn btn-primary text-light fs-3" onclick="initialView()">
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="${uiText.initial_view_tooltip}"><i class="bi bi-box"></i></span>
    </button>`
  )
}
async function initialView() {
  isExploded = false
  await updateHotspotPosition(1)
  modelViewer.animationName = 'Mount'
  await modelViewer.updateComplete
  modelViewer.timeScale = 1 //OR -1  for reverse
  await modelViewer.play({ repetitions: 1 })
  $('#anim-button').html(
    `<button type="button" class="btn btn-primary text-light fs-3" onclick="separateView()">
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="${uiText.separate_view_tooltip}"><i class="bi bi-layers"></i></span>
    </button>`
  )
}

function updateHotspotPosition(posNum) {
  if (!modelViewer) return;
  const spots = uiData[currentLang].interactive_hot_spots || [];
  spots.forEach((spot, i) => {
    const pos = posNum === 1 ? spot.viewer_3d_data_position1
                             : spot.viewer_3d_data_position2;
    modelViewer.updateHotspot({
      name: `hotspot-hs-${i}`,
      position: pos,
    });
  });
}
