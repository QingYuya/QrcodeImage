// background.js
console.log("background script loaded");
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "openLink",
        title: "打开链接",
        contexts: ["image"]
    });
    chrome.contextMenus.create({
        id: "copyLink",
        title: "复制链接",
        contexts: ["image"]
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "openLink") {
        chrome.tabs.sendMessage(tab.id, {action: "openLink", srcUrl: info.srcUrl});
    } else if (info.menuItemId === "copyLink") {
        chrome.tabs.sendMessage(tab.id, {action: "copyLink", srcUrl: info.srcUrl});
    }
});
