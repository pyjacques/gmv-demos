//// Custom 3D viewer for VERY-UP/FEE-BAT by Pierre-Yves JACQUES (https://pierreyves.fr)
'use strict'

var loc = window.location.pathname;
var list = loc.split("/");
var product = list[list.length - 3]
var model = list[list.length - 2]

console.log('*** VERY-UP/FEE-BAT: '+product+'-'+model)

//// get params and check if completed
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
var xp1 = urlParams.get('xp1')
var xp2 = urlParams.get('xp2')
//// hide param in url
window.history.replaceState(null, null, window.location.pathname)

//// change AR position for specific product/model 
if(product == 'chaudieres' && model == 'a-condensation') {
  var ar_floor_or_wall = 'wall'
  console.log('Placement AR sur Mur (et non Sol)')
} else {
  var ar_floor_or_wall = 'floor'
}

//// check for simple or double question type 
if(product == 'climatiseurs' && model == 'split') {
  var questionType = 'cascade'
  console.log('Activation des questions en cascade')
} else {
  var questionType = 'simple'
}

//// variables
let jsonData
var totalHotSpot = 0
var viewedHotSpot = 0
var currentOpenedHotSpot = null
var currentHighlightedZone = null
var felicitationModalDisplayed = false
var separatedView = false
var shuffledInteractive_hot_spots = []

//// generate viewer container
$('#full-page').append(
  `<viewer-container>
  <model-viewer id="modelViewer" alt="3D" 
  ar
  ar-placement="${ar_floor_or_wall}"
  ar-scale="fixed" 
  ar-modes="scene-viewer webxr quick-look"
  interpolation-decay="100" 
  camera-controls 
  touch-action
  interaction-prompt="when-focused" 
  interaction-prompt-threshold="10000" 
  environment-image="neutral"
  src="${model}.glb" 
  ios-src="${model}.usdz" 
  min-camera-orbit='auto 30deg 50%' 
  max-camera-orbit='auto 105deg 150%' 
  shadow-intensity="1"  
  shadow-softness="1" 
  exposure="1">
  </model-viewer>
  <div id="error" class="hide">L'option de réalité augmenté n'est pas supporté sur cet appareil.</div>
</viewer-container>`
)

const modelViewer = document.querySelector('#modelViewer')
modelViewer.pause()

//// check AR compatibility
modelViewer.addEventListener('ar-status', (event) => {
  if (event.detail.status === 'failed') {
    console.log('!!! AR unsupported:' + event.detail.status)
    const error = document.querySelector('#error')
    error.classList.remove('hide')
    error.addEventListener('transitionend', (event) => {
      error.classList.add('hide')
    })
  } else {
    console.log('AR supported:' + event.detail.status)
  }
})

//// dev: get material list
modelViewer.addEventListener("load", (ev) => {
    // console.log("*** Scene Materials: ***");
    // console.log(modelViewer.model.materials);
})

//// In/Out animations
async function separateView() {
  separatedView = true
  await updateHotspotPosition(2)
  modelViewer.animationName = 'Explode'
  await modelViewer.updateComplete
  modelViewer.timeScale = 1
  await modelViewer.play({ repetitions: 1 })
  $('#anim-button').html(
    `<button type="button" class="btn btn-primary text-light fs-3" onclick="initialView()"> 
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="initial-view"><i class="bi bi-box"></i></span>
    </button>`
  )
}
async function initialView() {
  separatedView = false
  await updateHotspotPosition(1)
  modelViewer.animationName = 'Mount'
  await modelViewer.updateComplete
  modelViewer.timeScale = 1 //OR -1  for reverse
  await modelViewer.play({ repetitions: 1 })
  $('#anim-button').html(
    `<button type="button" class="btn btn-primary text-light fs-3" onclick="separateView()"> 
        <span data-bs-toggle="tooltip" data-bs-placement="right" title="separate-view"><i class="bi bi-layers"></i></span>
    </button>`
  )
}

function updateHotspotPosition(posNum) {
  for (let i = 0; i < jsonData.interactive_hot_spots.length; i++) {
    if (posNum == 1) {
      var newPosition = `${jsonData.interactive_hot_spots[i].viewer_3d_data_position1}`
    } else {
      var newPosition = `${jsonData.interactive_hot_spots[i].viewer_3d_data_position2}`
    }
    modelViewer.updateHotspot({
      name: `hotspot-hs-${i}`,
      position: newPosition
    });
  }
}

//// document is ready, starting !
$(document).ready(function () {

  //// get json data
  
  let httpRequest = new XMLHttpRequest()
  httpRequest.open('GET', model+'.json', true)
  httpRequest.send()
  httpRequest.addEventListener('readystatechange', function () {
    if (this.readyState === this.DONE) {
      jsonData = JSON.parse(this.response)
      processJsonData()
    }
  })

  //// process json data
  function processJsonData() {

    //// default cams
    modelViewer.cameraOrbit = jsonData.settings.default_viewer_3d_cam_position;
    modelViewer.cameraTarget = jsonData.settings.default_viewer_3d_cam_target;

    //// Create an Suffle Array of 'interactive_hot_spots' if cascade question type enabled
    if (questionType == 'cascade') {
      shuffledInteractive_hot_spots = jsonData.interactive_hot_spots
          .map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value)
      // console.log(shuffledInteractive_hot_spots)
    }
    
    //// generate informative help modal [?]
    $('#modals').append(
      `<div class="modal fade" id="infoModal" tabindex="-1" aria-labelledby="infoModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="infoModalLabel">${jsonData.main_ui.experience_title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-md-12 my-2">
                              <p class="text-primary fs-5">${jsonData.main_ui.help_modal_title}<p>
                              <p>${jsonData.main_ui.help_modal_text}<p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer p-1">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${jsonData.main_ui.ok}</button>
                </div>
            </div>
        </div>`
    )
    //// generate initial guidance modals
    $('#modals').append(
      `<div class="modal fade" id="initialModal1" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="initialModal1Label" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title" id="initialModal1Label">${jsonData.main_ui.experience_title}</h5>
              </div>
              <div class="modal-body">
                  <div class="container-fluid">
                      <div class="row align-items-center">
                        <div class="col-md-4 text-center">
                          <i class="bi bi-badge-3d xxlIcon"></i>
                          <svg version="1.1" id="view_x5F_in_x5F_AR_x5F_icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
                          <rect id="Bounding_Box" x="0" y="0" fill="none" width="24" height="24"></rect>
                          <g id="Art_layer">
                            <path d="M3,4c0-0.55,0.45-1,1-1h2V1H4C2.35,1,1,2.35,1,4v2h2V4z"></path>
                            <path d="M20,3c0.55,0,1,0.45,1,1v2h2V4c0-1.65-1.35-3-3-3h-2v2H20z"></path>
                            <path d="M4,21c-0.55,0-1-0.45-1-1v-2H1v2c0,1.65,1.35,3,3,3h2v-2H4z"></path>
                            <path d="M20,21c0.55,0,1-0.45,1-1v-2h2v2c0,1.65-1.35,3-3,3h-2v-2H20z"></path>
                            <g>
                              <path d="M18.25,7.6l-5.5-3.18c-0.46-0.27-1.04-0.27-1.5,0L5.75,7.6C5.29,7.87,5,8.36,5,8.9v6.35c0,0.54,0.29,1.03,0.75,1.3
                                l5.5,3.18c0.46,0.27,1.04,0.27,1.5,0l5.5-3.18c0.46-0.27,0.75-0.76,0.75-1.3V8.9C19,8.36,18.71,7.87,18.25,7.6z M7,14.96v-4.62
                                l4,2.32v4.61L7,14.96z M12,10.93L8,8.61l4-2.31l4,2.31L12,10.93z M13,17.27v-4.61l4-2.32v4.62L13,17.27z"></path>
                            </g>
                          </g>
                          </svg>
                        </div>
                        <div class="col-md-8 text-center">
                          <p class="m-0">${jsonData.main_ui.initial_1_modal_text}<p>
                        </div>
                      </div>
                  </div>
              </div>
              <div class="modal-footer p-1">
                  <button type="button" class="btn btn-outline-secondary" onclick="$('#initialModal1').modal('hide');$('#initialModal2').modal('show');">${jsonData.main_ui.understood}</button>
              </div>
          </div>
      </div>`
    )
    $('#modals').append(
      `<div class="modal fade" id="initialModal2" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="initialModal2Label" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title" id="initialModal2Label">${jsonData.main_ui.experience_title}</h5>
              </div>
              <div class="modal-body">
                  <div class="container-fluid">
                      <div class="row">
                        <div class="col-md-4 text-center">
                          <i class="bi bi-layers-half xxlIcon"></i>
                        </div>
                        <div class="col-md-8 text-center">
                          <p class="m-0">${jsonData.main_ui.initial_2_modal_text}<p>
                        </div>
                      </div>
                  </div>
              </div>
              <div class="modal-footer p-1">
                  <button type="button" class="btn btn-outline-secondary" onclick="$('#initialModal2').modal('hide');$('#initialModal3').modal('show');">${jsonData.main_ui.understood}</button>
              </div>
          </div>
      </div>`
    )
    $('#modals').append(
      `<div class="modal fade" id="initialModal3" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="initialModal3Label" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title" id="initialModal3Label">${jsonData.main_ui.experience_title}</h5>
              </div>
              <div class="modal-body">
                  <div class="container-fluid">
                      <div class="row">
                        <div class="col-md-4 text-center">
                          <i class="bi bi-heart-half xxlIcon"></i>
                        </div>
                        <div class="col-md-8 text-center">
                          <p class="m-0">${jsonData.main_ui.initial_3_modal_text}<p>
                        </div>
                      </div>
                  </div>
              </div>
              <div class="modal-footer p-1">
                  <button type="button" class="btn btn-outline-secondary" onclick="$('#initialModal3').modal('hide');$('#initialModal4').modal('show');">${jsonData.main_ui.understood}</button>
              </div>
          </div>
      </div>`
    )
    $('#modals').append(
      `<div class="modal fade" id="initialModal4" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="initialModal4Label" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title" id="initialModal4Label">${jsonData.main_ui.experience_title}</h5>
              </div>
              <div class="modal-body">
                  <div class="container-fluid">
                      <div class="row">
                        <div class="col-md-4 text-center">
                          <i class="bi bi-bookmark-star xxlIcon"></i>
                        </div>
                        <div class="col-md-8 text-center">
                          <p class="m-0">${jsonData.main_ui.initial_4_modal_text}<p>
                        </div>
                      </div>
                  </div>
              </div>
              <div class="modal-footer p-1">
                  <button type="button" class="btn btn-secondary" onclick="$('#initialModal4').modal('hide');">${jsonData.main_ui.letsbegin}</button>
              </div>
          </div>
      </div>`
    )

    $('#modals').append(
      `<div class="modal fade" id="felicitationToast" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="felicitationToastLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="felicitationToastLabel">${jsonData.main_ui.felicitation_modal_title}</h5>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-md-12 my-2">
                              <p>${jsonData.main_ui.felicitation_modal_text}<p>
                              <figure class="figure">
                               <img src="../../../img/confetti.gif" class="figure-img img-fluid rounded" alt="...">
                              </figure>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer p-1">
                    <button type="button" class="btn btn-secondary" id="backToProductSelection">${jsonData.main_ui.felicitation_modal_leave_btn}</button>
                </div>
            </div>
            </div>
        </div>`
    )

    //// generate HotSpots
    for (let i = 0; i < jsonData.interactive_hot_spots.length; i++) {
      totalHotSpot = totalHotSpot + 1

      //// generate progress bar steps
      $('#stepper-wrapper').append(
        `<div id="stepper-item-${i}" class="stepper-item">
            <div class="step-counter"><i id="stepper-icon-${i}" class="bi bi-heart"></i></div>
          </div>`
      )  

      //// generate HotSpots 3D btns
      $('#modelViewer').append(
        `<div class="hotspot MainHotSpot" slot="hotspot-hs-${i}" data-index="${i}" data-position="${jsonData.interactive_hot_spots[i].viewer_3d_data_position1}" data-normal="${jsonData.interactive_hot_spots[i].viewer_3d_data_normal}"  data-visibility-attribute="visible">
            <i id="hotspot-hs-icon-${i}" class="hotspot-icon bi text-warning bi-plus-circle-fill fs-4"></i>
          </div>`
      )

      //// generate HotSpots 3D questions toasts
      $('#modals').append(
        `<div class="hotSpotContainer position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div id="hotspot-hs-${i}" data-index="${i}" class="toast hide toast-bottom-full-width" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
              <div class="toast-header">
                  <strong class="me-auto fs-5">
                      ${jsonData.main_ui.element_question}
                  </strong>
              </div>
              <div class="toast-body">
                <div class="card">
                  <div class="card-body" id="hotspot-hs-body-${i}"> 
                  </div>
                </div>
              </div>
            </div>
          </div>`
      )

      //// generate HotSpots 3D good answer + questions toasts 'cascade' 
      if (questionType == 'cascade') {
        $('#modals').append(
          `<div class="hotSpotContainer position-fixed bottom-0 end-0 p-3" style="z-index: 11">
              <div id="hotspot-hs-${i}-cas" data-index="${i}" class="toast hide toast-bottom-full-width" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
                <div class="toast-header">
                  <strong class="me-auto fs-5">
                    ${jsonData.main_ui.good_answer}</br>${jsonData.main_ui.element_question_cascade}
                  </strong>
                </div>
                <div class="toast-body">
                  <div class="card">
                    <div class="card-body" id="hotspot-hs-body-${i}-cas">
                  </div>
                </div>
              </div>
            </div>`
        )
      } 
      //// generate HotSpots 3D good answer toasts
      if (questionType == 'simple') {
        $('#modals').append(
          `<div class="hotSpotContainer position-fixed bottom-0 end-0 p-3" style="z-index: 11">
              <div id="hotspot-hs-good-${i}" data-index="${i}" class="toast hide toast-bottom-full-width" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
                <div class="toast-header">
                  <strong class="me-auto fs-5">
                    ${jsonData.main_ui.good_answer}
                  </strong>
                </div>
                <div class="toast-body">
                  <div class="card">
                    <div class="card-body"> 
                      <h6>${jsonData.interactive_hot_spots[i].success_title}</h6></strong>
                      ${jsonData.interactive_hot_spots[i].success_description}
                    </div>
                  </div>
                </div>
                <div class="modal-footer p-1">
                  <button type="button" class="btn btn-secondary hotspot-hs-close-btns" data-index="${i}">${jsonData.main_ui.close}</button> 
                </div>
              </div>
            </div>`
        )
      }
      //// generate HotSpots 3D good answer toasts 'cascade'
      if (questionType == 'cascade') {
        $('#modals').append(
          `<div class="hotSpotContainer position-fixed bottom-0 end-0 p-3" style="z-index: 11">
              <div id="hotspot-hs-good-${i}-cas" data-index="${i}" class="toast hide toast-bottom-full-width" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
                <div class="toast-header">
                  <strong class="me-auto fs-5">
                    ${jsonData.main_ui.good_answer}
                  </strong>
                </div>
                <div class="toast-body">
                  <div class="card">
                    <div class="card-body"> 
                      ${jsonData.interactive_hot_spots[i].failed_description}    
                    </div>
                  </div>
                </div>
                <div class="modal-footer p-1">
                  <button type="button" class="btn btn-secondary hotspot-hs-close-btns" data-index="${i}">${jsonData.main_ui.close}</button> 
                </div>
              </div>
            </div>`
        )
      }

      //// generate HotSpots 3D bad answer toasts
      $('#modals').append(
        `<div class="hotSpotContainer position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div id="hotspot-hs-bad-${i}" data-index="${i}" class="toast hide toast-bottom-full-width" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
              <div class="toast-header">
                <strong class="me-auto fs-5">
                  ${jsonData.main_ui.bad_answer}
                </strong>
              </div>
              <div class="toast-body">
                <div class="card">
                  <div class="card-body"> 
                    <h6>${jsonData.interactive_hot_spots[i].failed_title}</h6></strong>
                    ${jsonData.interactive_hot_spots[i].failed_description}
                  </div>
                </div>
              </div>
              <div class="modal-footer p-1">
                <button type="button" class="btn btn-secondary hotspot-hs-retry-btns" data-index="${i}">${jsonData.main_ui.retry}</button> 
              </div>
            </div>
          </div>`
      )

      //// generate HotSpots 3D bad answer toasts 'cascade'
      if (questionType == 'cascade') {
        $('#modals').append(
          `<div class="hotSpotContainer position-fixed bottom-0 end-0 p-3" style="z-index: 11">
              <div id="hotspot-hs-bad-${i}-cas" data-index="${i}" class="toast hide toast-bottom-full-width" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
                <div class="toast-header">
                  <strong class="me-auto fs-5">
                    ${jsonData.main_ui.bad_answer_cascade}
                  </strong>
                </div>
                <div class="toast-body">
                  <div class="card">
                    <div class="card-body"> 
                      ${jsonData.interactive_hot_spots[i].wrong_function}
                    </div>
                  </div>
                </div>
                <div class="modal-footer p-1">
                  <button type="button" class="btn btn-secondary hotspot-hs-retry-btns-cas" data-index="${i}">${jsonData.main_ui.retry}</button> 
                </div>
              </div>
            </div>`
        )
      }

      //// Add questions into hotspot modals
      for (let j = 0; j < jsonData.interactive_hot_spots.length; j++) {
        $(`#hotspot-hs-body-${i}`).append(
          `<div class="form-check">
            <input class="form-check-input" type="radio" name="hotspot-hs-${i}-radios" id="hotspot-hs-${i}-radio-${j}" value="${j}">
            <label class="form-check-label" for="hotspot-hs-${i}-radio-${j}">${jsonData.interactive_hot_spots[j].hidden_name}</label>
          </div>`
          )
      }
      $(`#hotspot-hs-body-${i}`).append(
        `<button class="btn btn-secondary text-light float-end hotspot-hs-btns" data-index="${i}" id="hotspot-hs-btn-${i}">${jsonData.main_ui.validate}</button>
        <div class="invalid-feedback" id="hotspot-hs-feedback-${i}">${jsonData.main_ui.choose_answer}</div>`
      )
      //// Add questions into hotspot modals 'cascade' // Randomized when 'cascade', with jsonData.interactive_hot_spots[j].index pre-stored values (0,1,2...)
      if (questionType == 'cascade') {
        for (let j = 0; j < shuffledInteractive_hot_spots.length; j++) {
          $(`#hotspot-hs-body-${i}-cas`).append(
            `<div class="form-check">
              <input class="form-check-input" type="radio" name="hotspot-hs-${i}-radios-cas" id="hotspot-hs-${i}-radio-${shuffledInteractive_hot_spots[j].index}-cas" value="${shuffledInteractive_hot_spots[j].index}">
              <label class="form-check-label" for="hotspot-hs-${i}-radio-${shuffledInteractive_hot_spots[j].index}-cas">${shuffledInteractive_hot_spots[j].success_description}</label>
            </div>`
            )
        }
        $(`#hotspot-hs-body-${i}-cas`).append(
          `<button class="btn btn-secondary text-light float-end hotspot-hs-btns-cas" data-index="${i}" id="hotspot-hs-btn-${i}-cas">${jsonData.main_ui.validate}</button>
          <div class="invalid-feedback" id="hotspot-hs-feedback-${i}-cas">${jsonData.main_ui.choose_answer}</div>`
        )
      }

      //// generate HotSpot 3D toast actions
      var toastHotSpotQuestion = document.getElementById('hotspot-hs-' + i)
      toastHotSpotQuestion.addEventListener('shown.bs.toast', function () {
        resizeHotSpotToast(i)
        
      })
      if (questionType == 'simple') {
        var toastHotSpotGoodAnswer = document.getElementById('hotspot-hs-good-' + i + '')
        toastHotSpotGoodAnswer.addEventListener('hide.bs.toast', function () {
          goToHomeScreen(i)
        })
      } else if (questionType == 'cascade') {
        var toastHotSpotGoodAnswerCas = document.getElementById('hotspot-hs-good-' + i + '-cas')
        toastHotSpotGoodAnswerCas.addEventListener('hide.bs.toast', function () {
          goToHomeScreen(i)
        })
      }
    }
    // END LOOP
  }
  
  ////// global functions

  //// Back to default view
  function goToHomeScreen(fromToastIndex) {
    //// Go fullscreen
    $('#full-page').animate({ height: '100%' })
    $('#brand-logo').fadeIn()
    $('.MainHotSpot').removeClass('displaynone')
    modelViewer.cameraOrbit = jsonData.settings.default_viewer_3d_cam_position;
    modelViewer.cameraTarget = jsonData.settings.default_viewer_3d_cam_target;
    //// UnHighLight zone
    if (currentHighlightedZone != undefined) {
      for (let m = 0; m < modelViewer.model.materials.length; m++) {
        if (modelViewer.model.materials[m].name == currentHighlightedZone) {
          //console.log("un-highlighting: "+modelViewer.model.materials[m].name);
          currentHighlightedZone = modelViewer.model.materials[m].name
          modelViewer.model.materials[m].pbrMetallicRoughness.setBaseColorFactor([1.00, 0.60, 0.00, 0])
        }
      }
    }

    //// Update progress bar
    var poucentProgress = (viewedHotSpot / totalHotSpot) * 100
    scrollProgressBar(poucentProgress)

    //// Check if completed
    console.log('viewedHotSpot: '+viewedHotSpot+'/'+totalHotSpot+'('+poucentProgress+'%)');
    if (felicitationModalDisplayed == false && totalHotSpot != 0 && viewedHotSpot == totalHotSpot) {
      felicitationModalDisplayed = true
      $('#felicitationToast').modal('show')
      console.log('CONGRATS')
    } 
  }

  function resizeHotSpotToast(currentIndex) {
    //// resize if mobile
    if (window.matchMedia('(max-width: 767px)').matches) {
      var hsHeight = $('#hotspot-hs-' + currentIndex).outerHeight()
      var pgHeight = $(window).height()
      var newHeight = pgHeight - hsHeight
      $('#full-page').animate({ height: newHeight })
    }
  }

  function scrollProgressBar(pourcent) {
    var progressBar = $('.progress-bar')
    var poucentString = pourcent + '%'
    progressBar.css({ width: poucentString })
  }

  //// questions validation
  function validateChoice(current,selected,casOne) {
    if (selected == null) {
      // alert('Choisissez une réponse')
      if (casOne == false) {
        $(`#hotspot-hs-feedback-${current}`).addClass('displayBlock')
      } else if(casOne == true) {
        $(`#hotspot-hs-feedback-${current}-cas`).addClass('displayBlock')
      }
    } else if (current == selected) {
      // alert('Bonne réponse')
      if (questionType == 'simple') {
        $(`#hotspot-hs-feedback-${current}`).removeClass('displayBlock')
        $(`#hotspot-hs-${current}`).toast('hide')
        $(`#hotspot-hs-good-${current}`).toast('show')
      } else if (casOne == false && questionType == 'cascade') {
        $(`#hotspot-hs-feedback-${current}`).removeClass('displayBlock')
        $(`#hotspot-hs-${current}`).toast('hide')
        $(`#hotspot-hs-${current}-cas`).toast('show')
      } else if (casOne == true && questionType == 'cascade') {
        $(`#hotspot-hs-feedback-${current}-cas`).removeClass('displayBlock')
        $(`#hotspot-hs-${current}-cas`).toast('hide')
        $(`#hotspot-hs-good-${current}-cas`).toast('show')      
      }      
    } else {
      // alert('Mauvaise réponse, rééssayez')
      if (casOne == false){
        $(`#hotspot-hs-feedback-${current}`).removeClass('displayBlock')
        $(`#hotspot-hs-${current}`).toast('hide')
        $(`#hotspot-hs-bad-${selected}`).toast('show')
      } else if (casOne == true){
        $(`#hotspot-hs-feedback-${current}-cas`).removeClass('displayBlock')
        $(`#hotspot-hs-${current}-cas`).toast('hide')
        $(`#hotspot-hs-bad-${selected}-cas`).toast('show')  
      }
    }
  }

  //// HotSpots Btn on click actions
  $('body').on('click', '.hotspot', function () {
    if(separatedView == false){separateView()}
    var currentIndex = $(this).attr('data-index')
    for (let j = 0; j < modelViewer.model.materials.length; j++) {
      if(modelViewer.model.materials[j].name == currentHighlightedZone){
        //// UnHighLight zone
          console.log("un-highlighting: "+modelViewer.model.materials[j].name);
          modelViewer.model.materials[j].pbrMetallicRoughness.setBaseColorFactor([1.00, 0.60, 0.00, 0]);
      } else if(modelViewer.model.materials[j].name == jsonData.interactive_hot_spots[currentIndex].mesh_3d_to_highlight){
        //// HighLight zone
          console.log("highlighting: "+modelViewer.model.materials[j].name);
          modelViewer.model.materials[j].pbrMetallicRoughness.setBaseColorFactor([1.00, 0.60, 0.00, 0.5]);
      }
    }
    currentHighlightedZone = jsonData.interactive_hot_spots[currentIndex].mesh_3d_to_highlight;
    console.log("currentHighlightedZone: "+currentHighlightedZone);

    if ($('div[slot=hotspot-hs-' + currentIndex + ']').hasClass('visited') != true) {
      $('#brand-logo').fadeOut()
      $('.toast-popup').toast('hide')
      var currentIndex = $(this).attr('data-index')
      currentOpenedHotSpot = currentIndex
      modelViewer.cameraOrbit = jsonData.interactive_hot_spots[currentIndex].viewer_3d_cam_position
      modelViewer.cameraTarget = jsonData.interactive_hot_spots[currentIndex].viewer_3d_cam_target
      $('#hotspot-hs-' + currentIndex).toast('show')
      $('.MainHotSpot').addClass('displaynone')
    }
  })

  $('body').on('click', '.hotspot-hs-btns', function () {
    var current = $(this).attr('data-index')
    var selected = $(`input[name=hotspot-hs-${current}-radios]:checked`, `#hotspot-hs-body-${current}`).val()
    validateChoice(current,selected,false)
  })

  $('body').on('click', '.hotspot-hs-btns-cas', function () {
    var current = $(this).attr('data-index')
    var selected = $(`input[name=hotspot-hs-${current}-radios-cas]:checked`, `#hotspot-hs-body-${current}-cas`).val()
    validateChoice(current,selected,true)
  })

  $('body').on('click', '.hotspot-hs-retry-btns', function () {
    var current = $(this).attr('data-index')
    $(`#hotspot-hs-bad-${current}`).toast('hide')
    $(`#hotspot-hs-${currentOpenedHotSpot}`).toast('show')
  })

  $('body').on('click', '.hotspot-hs-retry-btns-cas', function () {
    var current = $(this).attr('data-index')
    $(`#hotspot-hs-bad-${current}-cas`).toast('hide')
    $(`#hotspot-hs-${currentOpenedHotSpot}-cas`).toast('show')
  })

  $('body').on('click', '.hotspot-hs-close-btns', function () {
    var current = $(this).attr('data-index')
    //// hide success modal
    if (questionType == 'simple') {
      $(`#hotspot-hs-good-${current}`).toast('hide')
    } else if (questionType == 'cascade') {
      $(`#hotspot-hs-good-${current}-cas`).toast('hide')
    }
    //// add visited class if simple question
    if ($('div[slot=hotspot-hs-' + current + ']').hasClass('visited') != true) {
      $(`#stepper-item-${viewedHotSpot}`).addClass('completed')
      $(`#stepper-icon-${viewedHotSpot}`).removeClass('bi-heart')
      $(`#stepper-icon-${viewedHotSpot}`).addClass('bi-heart-fill')
      viewedHotSpot = viewedHotSpot + 1
      $('div[slot=hotspot-hs-' + current + ']').addClass('visited')
      $('div[slot=hotspot-hs-' + current + ']').css('pointer-events','none');
      $('div[slot=hotspot-hs-' + current + ']')
        .find('i')
        .removeClass('bi-plus-circle-fill')
        .removeClass('text-warning')
      $('div[slot=hotspot-hs-' + current + ']')
        .find('i')
        .addClass('bi-check-circle-fill')
        .addClass('text-primary')
    }
    goToHomeScreen()
  })

  $('body').on('click', '#backToProductSelection', function () {
    console.log('backToProductSelection')
    if (product == 'chaudieres' && model == 'a-condensation') {
      xp1 = 'done'
    } else if (product == 'chaudieres' && model == 'a-granules') {
      xp2 = 'done'
    } else if (product == 'poeles' && model == 'a-buches') {
      xp1 = 'done'
    } else if (product == 'poeles' && model == 'a-granules') {
      xp2 = 'done'
    } 
    window.location.href = '../?xp1='+xp1+'&xp2='+xp2
  })

  //// DEV: Get Current Cam
  // $('.progress-container').append(`<button type="button" class="btn btn-warning text-light fs-3" id="getcam-btn" style="margin-left: 150px!important;"> <span data-bs-toggle="tooltip" data-bs-placement="right" title="Camera"><i class="bi bi-camera-video-fill"></i></span></button>`) //DEV OFF

  $('#getcam-btn').click(function () {
    const cameraOrbit = modelViewer.getCameraOrbit()
    const cameraTarget = modelViewer.getCameraTarget()
    var theta = Math.round((cameraOrbit.theta * 180) / Math.PI)
    var phi = Math.round((cameraOrbit.phi * 180) / Math.PI)
    var radius = cameraOrbit.radius.toFixed(1)
    console.log('cameraOrbit: ' + theta + ' ' + phi + ' ' + radius)
    var x = cameraTarget.x.toFixed(2)
    var y = cameraTarget.y.toFixed(2)
    var z = cameraTarget.z.toFixed(2)
    console.log('cameraTarget: ' + x + ' ' + y + ' ' + z)
  })

  //// display explainations at start
  setTimeout(function () {
    $('#initialModal1').modal('show') //DEV ON
    $('#overlay').fadeOut('slow')
  }, 1000)
})