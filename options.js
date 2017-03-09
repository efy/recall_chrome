
var ui = {
  server_address: document.getElementById('server_address'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  status: document.getElementById('status'),
  save: document.getElementById('save'),
  server_test: document.getElementById('server_test'),
  server_message: document.getElementById('server_message')
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
  var endpoint = "/api/v0/ping"

  get(addr + endpoint)
    .then(function(response){
      console.log(response)
      var res = JSON.parse(response)
      ui.server_message.textContent = 'status: ' + res.status + ', version: ' + res.version
    })
    .catch(function(err){
      ui.server_message.textContent = 'failed to connect to server'
    })
}

function get(url) {
  return new Promise(function(resolve, reject) {

    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)

    xhr.onload = function() {
      var self = this
      if(self.status >= 200 && self.status <= 300) {
        resolve(self.responseText)
      } else {
        reject({
          status: self.status,
          message: self.statusText
        })
      }
    }

    xhr.onerror = function() {
      var self = this
      reject({
        status: self.status,
        message: self.statusText
      })
    }

    xhr.send()
  })
}
