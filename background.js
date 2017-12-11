chrome.omnibox.onInputChanged.addListener(debounce(function(text, suggest) {
  authenticate().then(function(token) {
    search(text, token).then(function(results) {
      if(!results) {
        return
      }

      suggestions = results.map(function(res){
        var parser = document.createElement('a')
        parser.href = res.url
        var domain = parser.hostname
        return {
          content: res.url,
          description: "<url>" + domain + "</url> <dim>" + res.title + "</dim>"
        }
      })

      var len = suggestions.length >= 4 ? 4 : suggestions.length
      suggestions = suggestions.slice(0, len)

      chrome.storage.sync.get({
          server_address: 'http://localhost'
      }, function(options) {
        suggestions.push({
          content: options.server_address,
          description: "<url>" + options.server_address + "</url> <dim>Go to app</dim>"
        })

        suggest(suggestions)
      })
    })
  })
}, 300))

chrome.omnibox.onInputEntered.addListener(function(url) {
  // New or same window should be an option
  chrome.storage.sync.get({
    link_target: false
  }, function(options){
    if(options.link_target) {
      window.open(url)
      return
    }
    window.location = url
  })
})

chrome.commands.onCommand.addListener(function(command) {
  if(command === "bookmark_current_page") {
    chrome.tabs.query({active: true}, function(tabs) {
      var tab = tabs[0]
      fetch_favicon(tab.url).then(function(favicon){
        var bookmark = {
          url: tab.url,
          title: tab.title,
          icon: favicon
        }

        post_bookmark(bookmark)
      })
    })
  }
})

chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
  authenticate().then(function(token){
    fetch_favicon(bookmark.url).then(function(base64){
      var bm = {
        title: bookmark.title,
        url: bookmark.url,
        icon: base64
      }
      create_bookmark(bm, token)
    })
  }).catch(function(err) {
    console.log("authentication failed")
  })
})

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
  chrome.notifications.create(opts)
}

function failure_notification(bookmark) {
  var opts = {
    type: "basic",
    title: "Add bookmark failed",
    message: bookmark.title,
    iconUrl: 'recall_icon.png'
  }
  chrome.notifications.create(opts)
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

function debounce(fn, w) {
  var timeout

  return function() {
    var args = arguments
    var ctx = this

    var later = function () {
      timeout = null
      fn.apply(ctx, args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, w)
  }
}

