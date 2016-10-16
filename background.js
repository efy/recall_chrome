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
      var bookmark = {
        url: tab.url,
        title: tab.title
      }

      post_bookmark(bookmark)
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

    xhr.open('POST', endpoint, true)
    xhr.load = function() {
      if(xhr.readyState === 4 && http.status === 200) {
        console.log(xhr.responseText)
      }
    }

    xhr.onerror = function() {
      console.log(xhr)
    }

    xhr.send(data)
  })
}
