
var ui = {
  server_address: document.getElementById('server_address'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  status: document.getElementById('status'),
  save: document.getElementById('save'),
  server_test: document.getElementById('server_test'),
  server_message: document.getElementById('status')
}

document.addEventListener('DOMContentLoaded', restore_options)
ui.save.addEventListener('click', save_options)
ui.server_test.addEventListener('click', test_server)

function save_options() {
  chrome.storage.sync.set({
    server_address: ui.server_address.value,
    username: ui.username.value,
    password: ui.password.value,
  }, function() {
    ui.status.textContent = 'Options updated'
  })
}

function restore_options() {
  chrome.storage.sync.get({
    server_address: 'http://localhost',
    username: '',
    password: ''
  }, function(items) {
    ui.server_address.value = items.server_address
    ui.username.value = items.username
    ui.password.value = items.password
  })
}

function test_server(e) {
  var addr = ui.server_address.value
  var username = ui.username.value
  var password = ui.password.value
  var endpoint = "/api/v0/ping"

  axios.get(addr + endpoint, {
    auth: {
      username: username,
      password: password
    }
  })
  .then(function(response){
    var res = response.data
    ui.server_message.textContent = 'status: ' + res.status + ', version: ' + res.version
  })
  .catch(function(err){
    ui.server_message.textContent = 'failed to connect to server'
  })
}
