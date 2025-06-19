// Simple viewer for Total 3D model
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('full-page');
  if (!container) return;
  container.innerHTML = `
  <viewer-container>
    <model-viewer id="modelViewer"
      alt="Total BESS model"
      src="../total/3Dmodel/V-TOTAL-011.glb"
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
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="separate-view"><i class="bi bi-layers-half"></i></span>
      </button>
    </anim-button>
  </viewer-container>`;
});

async function separateView() {
  const modelViewer = document.querySelector('#modelViewer');
  if (!modelViewer) return;
  modelViewer.animationName = 'Explode';
  await modelViewer.updateComplete;
  modelViewer.timeScale = 1;
  await modelViewer.play({ repetitions: 1 });
  $('#anim-button').html(
    `<button type="button" class="btn btn-primary text-light fs-3" onclick="initialView()">
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="initial-view"><i class="bi bi-box"></i></span>
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
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="separate-view"><i class="bi bi-layers"></i></span>
    </button>`
  );
}
