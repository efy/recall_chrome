
var ui = {
  server_address: document.getElementById('server_address'),
  status: document.getElementById('status'),
  save: document.getElementById('save')
}

function save_options() {
  chrome.storage.sync.set({
    server_address: ui.server_address.value
  }, function(){
    ui.status.textContent = 'Options updated'
  })
}

function restore_options() {
  chrome.storage.sync.get({
    server_address: 'http://localhost'
  }, function(items) {
    ui.server_address.value = items.server_address
  })
}

document.addEventListener('DOMContentLoaded', restore_options)
ui.save.addEventListener('click', save_options)
