//// Custom 3D viewer for VERY-UP/FEE-BAT by Pierre-Yves JACQUES (https://pierreyves.fr)
'use strict'

var loc = window.location.pathname;
var list = loc.split("/");
var product = list[list.length - 2]

console.log('*** VERY-UP/FEE-BAT: '+product)

//// document is ready, starting !
$(document).ready(function () {
  //// get json data
  let jsonData
  let httpRequest = new XMLHttpRequest()
  httpRequest.open('GET', product+'.json', true)
  httpRequest.send()
  httpRequest.addEventListener('readystatechange', function () {
    if (this.readyState === this.DONE) {
      jsonData = JSON.parse(this.response)
      processJsonData()
    }
  })

  //// process json data
  function processJsonData() {

    //// get params and check if completed
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    var xp1 = urlParams.get('xp1')
    var xp2 = urlParams.get('xp2')
    const badges = []
    if (xp1 == 'done') {
      badges[0] = `<i class="bi bi-bookmark-check-fill text-primary"></i>`
      // jsonData.products[0].exp_url = '#'
    } else {
      badges[0] = `<i class="bi bi-bookmark-fill text-warning"></i>`
    }
    if (xp2 == 'done') {
      badges[1] = `<i class="bi bi-bookmark-check-fill text-primary"></i>`
      // jsonData.products[1].exp_url = '#'
    } else {
      badges[1] = `<i class="bi bi-bookmark-fill text-warning"></i>`
    }
    var main_page_step = ''
    if (xp1 == 'done' && xp2 == 'done') {
      main_page_step = jsonData.main_ui.main_page_step_3
      $('#step').removeClass('alert-warning')
      $('#step').addClass('alert-success')
    } else if (xp1 == 'done' || xp2 == 'done') {
      main_page_step = jsonData.main_ui.main_page_step_2
    } else {
      main_page_step = jsonData.main_ui.main_page_step_1
    }
    //// hide param in url
    window.history.replaceState(null, null, window.location.pathname)

    //// update title
    $('#title').html(`${jsonData.main_ui.experience_title}`)
    $('#description').html(`${jsonData.main_ui.experience_description}`)
    $('#step').html(`${main_page_step}`)

    //// generate products
    for (let i = 0; i < jsonData.products.length; i++) {
      $('#products').append(
        `<div class="col">
            <div class="card shadow-sm mb-4">
                <img src="${jsonData.products[i].slug}/${jsonData.products[i].slug}.jpg" class="figure-img img-fluid rounded" alt="${jsonData.products[i].name}" />
                <div class="card-img-overlay p-0">
                    <div class="container p-0">
                        <div class="row">
                            <div class="col-12 text-end">
                            <span id="check-icon" class="align-text-bottom p-0 badge bg-white text-white" style="font-size: 3rem;position: absolute;top: 0px;right: 15px;">--</span>
                            <span id="check-icon" class="align-text-bottom p-0" style="font-size: 5rem;position: absolute;top: -30px;right: 0px;">${badges[i]}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                <h2 class="card-title">${jsonData.products[i].name}</h2>
                    <a id="product-${i}" href="${jsonData.products[i].slug}/${queryString}" class="stretched-link"></a>
                </div>
            
            </div>
        </div>`
      )
    }
  }
})
