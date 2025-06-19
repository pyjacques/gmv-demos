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
  </viewer-container>`;
});
