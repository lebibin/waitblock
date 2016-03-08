function block() {
  // Stop the original page from loading.
  window.stop();

  // Synchronously replace document content with blocking template.
  var request = new XMLHttpRequest();
  request.open("GET", chrome.extension.getURL("index.html"), false);
  request.send();

  if (request.status === 200) {
    var message = { subject: "randomImageId" };
    chrome.runtime.sendMessage(message, function(imageId) {
      var html = request.responseText.replace(/{{imageId}}/g, imageId);
      document.all[0].innerHTML = html;

      // Start the countdown
      chrome.storage.sync.get(defaultOptions, function(items) {
        var waitTime = items.waitTime;
        document.getElementById('timer').innerHTML = waitTime;

        var timer = setInterval(function() {
          if (waitTime <= 0) {
            clearInterval(timer);
            unblock();
          } else {
            document.getElementById('timer').innerHTML = waitTime;
            waitTime -= 1;
          }
        }, 1000);
      });
    });
  }
}

function unblock() {
  chrome.runtime.sendMessage({
    subject: "unblock",
    hostname: window.location.hostname
  });

  window.location.reload();
}


var message = {
  subject: "blocked",
  hostname: window.location.hostname
};

chrome.runtime.sendMessage(message, function(response) {
  if (response === true)
    block();
});