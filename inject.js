
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
    el.textContent = "Add to recall"

    el.addEventListener('drop', function(e){
      e.preventDefault()

      if (e.dataTransfer.types != null) {
        var types = Array.from(e.dataTransfer.types)
        types.forEach(function(t){
          console.log(t)
        })
      }

      if (e.dataTransfer.items != null) {
        var items = Array.from(e.dataTransfer.items)
        items.forEach(function(item){
          console.log(item.kind, item.type)
        })
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
