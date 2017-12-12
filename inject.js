
(function() {
  // Shows unobtrusive ui when dragging an item on
  // the current page
  var b = document.body
  var dropzone = dropzone_tmpl()

  document.body.addEventListener('dragstart', function(e) {
    b.appendChild(dropzone)
  })

  document.body.addEventListener('dragend', function(e) {
    b.removeChild(dropzone)
  })

  function dropzone_tmpl() {
    var el = document.createElement('div')
    el.id = "rc-dropzone"
    el.classList.add('rc-dropzone')
    el.innerHTML = '<div class="rc-plusicon">+</div>'

    el.addEventListener('drop', function(e){
      e.preventDefault()

      var items = Array.from(e.dataTransfer.items)

      var uri = items.find(function(item) {
        return item.type.match("^text/uri-list")
      })

      if(uri) {
        uri.getAsString(function(s) {
          send_url(s)
        })

        return
      }
    })

    el.addEventListener('dragover', function(e){
      e.preventDefault()
      el.classList.add("rc-dropzone__active")
    })

    el.addEventListener('dragleave', function(e){
      el.classList.remove("rc-dropzone__active")
    })

    return el
  }
})();
