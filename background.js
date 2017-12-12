// Omnibox search
// executes a search query against the api and shows
// the list of results in the chrome address bar / dropdown
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

// Handle omnibox search result selection
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

// Recall specific hotkey / command
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

// Hook into chromes built in bookmark mechanism
// and send the recall server when bookmark is added
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

