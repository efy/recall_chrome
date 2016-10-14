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
    })
  }
})
