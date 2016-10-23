chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  suggest([
    {content: "Hackernews", description: "<url>http://news.ycombinator.com</url> <dim>Hackernews</dim>"},
    {content: "Designernews", description: "<url>http://designernews.com</url> <dim>Designer News</dim>"},
    {content: "It's Nice That", description: "<url>http://itsnicethat.com</url> <dim>It's Nice That</dim>"}
  ])
})

chrome.omnibox.onInputEntered.addListener(function(text) {
  alert('You just typed "' + text + '"')
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

        console.log(bookmark);

        post_bookmark(bookmark)
      })
    })
  }
})

function post_bookmark(bookmark) {
  var data = new FormData()
  var xhr = new XMLHttpRequest()

  chrome.storage.sync.get({
    server_address: 'http://localhost'
  }, function(items) {
    var endpoint = items.server_address + '/api/v0/bookmarks'
    data.append('url', bookmark.url)
    data.append('title', bookmark.title)
    data.append('icon', bookmark.icon)

    xhr.open('POST', endpoint, true)
    xhr.onload = function() {
      if(xhr.readyState === 4 && xhr.status === 200) {
        post_success_notification(bookmark)
      }
    }

    xhr.onerror = function() {
      console.log(xhr)
    }

    xhr.send(data)
  })
}

function post_success_notification(bookmark) {
  var opts = {
    type: "basic",
    title: "Added bookmark",
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

