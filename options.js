
function save_options() {
  var host = document.getElementById('form_host').value;
  var port = document.getElementById('form_port').value;
  var name = document.getElementById('form_name').value;
  chrome.storage.sync.set({
    host: host,
    port: port,
    username: name
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    host: 'http://localhost',
    port: 8993,
    username: "Damian"
  }, function(items) {
    document.getElementById('form_host').value = items.host;
    document.getElementById('form_port').value = items.port;
    document.getElementById('form_name').value = items.username;

  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);