function success() {
  return { result: "success" };
}

function failure(message) {
  return { result: "failure", error: message };
}

module.exports = {
  success: success,
  failure: failure
};
