
(function() {
  // Show unobtrusive ui when dragging an item on
  // the current page
  document.body.addEventListener('dragstart', function(e) {
    console.log("drag start")
  })

  console.log("hello from injected script")
})();
