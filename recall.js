function authenticate() {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get({
      server_address: 'http://localhost',
      username: '',
      password: ''
    }, function(items){
      var username = items.username
      var password = items.password
      var endpoint = items.server_address + '/api/auth'

      var auth_token = btoa(username + ":" + password)

      fetch(endpoint, {
        method: 'post',
        headers: new Headers({
          'Authorization': 'Basic ' + auth_token
        })
      }).then(function(response) {
        return response.text()
      }).then(function(token){
        resolve(token)
      }).catch(function(err) {
        console.log(error)
        reject(err)
      })
    })
  })
}

function search(query, auth_token) {
  return new Promise(function(resolve, reject) {
    var token = "Bearer " + auth_token
    chrome.storage.sync.get({
      server_address: 'http://localhost'
    }, function(options) {
      var endpoint = options.server_address + '/api/bookmarks/search?q=' + encodeURI(query)
      fetch(endpoint, {
        method: 'get',
        headers: new Headers({
          "Authorization": token
        })
      }).then(function(response) {
        return response.json()
      }).then(function(json){
        return resolve(json)
      }).catch(function(error) {
        return reject(error)
      })
    })
  })
}

function send_url(uri) {
  var bm = {
    url: uri
  }
  authenticate().then(function(token){
    create_bookmark(bm, token)
  })
}

function create_bookmark(bookmark, auth_token) {
  var token = "Bearer " + auth_token
  chrome.storage.sync.get({
    server_address: 'http://localhost',
    show_notifications: false
  }, function(items) {
    var endpoint = items.server_address + '/api/bookmarks'
    fetch(endpoint, {
      method: 'post',
      headers: new Headers({
        "Authorization": token
      }),
      body: JSON.stringify(bookmark)
    }).then(function(response) {
      return response.json()
    }).then(function(data){
      if(items.show_notifications) {
        success_notification(bookmark)
      }
    }).catch(function(err) {
      if(items.show_notifications) {
        failure_notification(bookmark)
      }
    })
  })
}

function success_notification(bookmark) {
  var opts = {
    type: "basic",
    title: "Added bookmark",
    message: bookmark.title,
    iconUrl: 'recall_icon.png'
  }

  // Can only send notifications in background script
  if(chrome && chrome.notifications) {
    chrome.notifications.create(opts)
  }
}

function failure_notification(bookmark) {
  var opts = {
    type: "basic",
    title: "Add bookmark failed",
    message: bookmark.title,
    iconUrl: 'recall_icon.png'
  }

  // Can only send notifications in background script
  if(chrome && chrome.notifications) {
    chrome.notifications.create(opts)
  }
}

function fetch_favicon(url) {
  return new Promise(function(resolve, reject) {
    var img = new Image()
    img.onload = function () {
        var canvas = document.createElement("canvas")
        canvas.width =this.width
        canvas.height =this.height

        var ctx = canvas.getContext("2d")
        ctx.drawImage(this, 0, 0)

        var dataURL = canvas.toDataURL("image/png")
        resolve(dataURL)
    }
    img.src = 'chrome://favicon/' + url
  })
}

