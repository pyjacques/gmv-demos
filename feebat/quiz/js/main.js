//// Custom 3D viewer for VERY-UP/FEE-BAT by Pierre-Yves JACQUES (https://pierreyves.fr)
'use strict'

console.log('*** VERY-UP/FEE-BAT: QUIZ INDEX')


//// document is ready, starting !
$(document).ready(function () {
  //// get json data
  let jsonData
  let httpRequest = new XMLHttpRequest()
  httpRequest.open('GET', 'main.json', true)
  httpRequest.send()
  httpRequest.addEventListener('readystatechange', function () {
    if (this.readyState === this.DONE) {
      jsonData = JSON.parse(this.response)
      processJsonData()
      console.log(jsonData)
    }
  })

  //// process json data
  function processJsonData() {

    //// update title
    $('#title').html(`${jsonData.main_ui.experience_title}`)
    $('#description').html(`${jsonData.main_ui.experience_description}`)

    //// generate products
    for (let i = 0; i < jsonData.products.length; i++) {
      $('#products').append(
        `<div class="col">
            <div class="card shadow-sm mb-4">
                <!-- 
                <img src="${jsonData.products[i].slug}/${jsonData.products[i].slug}.jpg" class="figure-img img-fluid rounded" alt="${jsonData.products[i].name}" />
                -->
                <div class="card-body">
                    <h2 class="card-title">${jsonData.products[i].name}</h2>
                    <a id="product-${i}" href="-/${jsonData.products[i].slug}/" class="stretched-link"></a>
                </div>
            </div>
        </div>`
      )
    }
  }
})
