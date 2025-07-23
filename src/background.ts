export {}
console.log("HELLO WORLD FROM BGSCRIPTS")

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "MATCH_COUNT") {
    chrome.action.setBadgeText({
      text: message.count > 0 ? String(message.count) : ""
    })

    chrome.action.setBadgeBackgroundColor({
      color: "pink"
    })
  }
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.sendMessage(tabId, { type: "GET_MATCH_COUNT" })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { type: "GET_MATCH_COUNT" })
  }
})

