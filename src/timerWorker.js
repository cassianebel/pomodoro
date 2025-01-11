self.onmessage = function (e) {
  const { action, interval } = e.data;

  if (action === "start") {
    self.timerId = setInterval(() => {
      self.postMessage("tick");
    }, interval);
  } else if (action === "stop") {
    clearInterval(self.timerId);
  }
};
