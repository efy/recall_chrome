
var ui = {
  server_address: document.getElementById('server_address'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  status: document.getElementById('status'),
  save: document.getElementById('save'),
  server_test: document.getElementById('server_test'),
  server_message: document.getElementById('status'),
  auth_test: document.getElementById('auth_test')
}

document.addEventListener('DOMContentLoaded', restore_options)

ui.save.addEventListener('click', save_options)
ui.server_test.addEventListener('click', ping_server)
ui.auth_test.addEventListener('click', test_auth)

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

function test_auth(e) {
  var addr = ui.server_address.value
  var username = ui.username.value
  var password = ui.password.value
  var endpoint = "/api/auth"

  axios.post(addr + endpoint, {}, {
    headers: {
      'Username': username,
      'Password': password
    }
  })
  .then(function(response){
    var res = response.data
    ui.server_message.innerHTML = 'Auth: <span class="label label-success">Success</span>'
    ui.username.classList.remove('is-error')
    ui.password.classList.remove('is-error')
    ui.username.classList.add('is-success')
    ui.password.classList.add('is-success')
  })
  .catch(function(err){
    ui.server_message.innerHTML = 'Auth: <span class="label label-error">Failed</span>'
    ui.username.classList.remove('is-success')
    ui.password.classList.remove('is-success')
    ui.username.classList.add('is-error')
    ui.password.classList.add('is-error')
  })
}

function ping_server(e) {
  var addr = ui.server_address.value
  var endpoint = "/api/ping"

  axios.get(addr + endpoint)
    .then(function(response){
      var res = response.data
      ui.server_message.innerHTML = 'Ping: <span class="label label-success">' + res.status + '</span>'
      ui.server_address.classList.remove('is-error')
      ui.server_address.classList.add('is-success')
    })
    .catch(function(err){
      ui.server_message.innerHTML = 'Ping: <span class="label label-error">Fail</span> Cannot connect to server'
      ui.server_address.classList.remove('is-success')
      ui.server_address.classList.add('is-error')
    })
}
