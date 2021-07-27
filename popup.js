// Initialize button with user's preferred color
let form_record = document.getElementById("frm1");
let form_title = document.getElementById("form_title");
let form_link = document.getElementById("form_link");
let form_tags = document.getElementById("form_tags");
let form_content = document.getElementById("form_content");
let btn_add = document.getElementById("btn_add");
let btn_reset = document.getElementById("btn_reset");
let btn_scrape = document.getElementById("btn_scrape");
let btn_logout = document.getElementById("btn_logout");
let btn_options = document.getElementById("go-to-options");

let form_prove = document.getElementById("form_prove");
let form_prove_user = document.getElementById("frm2");
let btn_prove = document.getElementById("btn_prove");
let confirm_span = document.getElementById("confirm");
let error_span = document.getElementById("error");
let error_auth_span = document.getElementById("error_auth");
let name_para = document.getElementById("name");

let password = "";




function scrape_current(tab_url) {
  if (window.localStorage.getItem("authenticated", "false") === "true") {
    chrome.storage.sync.get({
      host: 'http://localhost',
      port: 8993,
      username: "Damian"
    }, function (items) {
      fetch(items.host + ":" + items.port + "/scrape?q=" + tab_url, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
      }).then(response => {
        if (response.ok) {
          return response.json()
        } else {
          Promise.reject(response)
        }
      }).then(data => {
        form_content.value = data["content"];
        form_title.value = data["title"];
  
      }).catch(ex => {
        console.log("Exception trying to fetch the article: ", ex)
      });
    });
  }
}

window.onload = function () {
  var newheight = window.height * (3/10);
  var newwidth = window.width * (3 / 10);
  chrome.storage.sync.get({
    host: 'http://localhost',
    port: 8993,
    username: "Damian"
  }, function (items) {
    name_para.innerHTML = "Are you " + String(items.username) + "? Please prove yourself";
  });

  window.resizeTo(newheight, newwidth);
  if (window.localStorage.getItem("authenticated", "false") === "true") {
    form_prove_user.style.display = "none";
  }
  confirm_span.style.display = "none";
  error_span.style.display = "none";
  error_auth_span.style.display = "none";
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabs) {
    var tab = tabs[0];
    form_link.value = tab.url;
    form_title.value = tab.title;
    scrape_current(tab.url);
  });
}

function auth() {
  chrome.storage.sync.get({
    host: 'http://localhost',
    port: 8993,
    username: "Damian"
  }, function (items) {
    fetch(items.host + ":" + items.port + "/authenticate", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "password": form_prove.value
      })
    }).then(response => {
      console.log(response);
      if (response.ok) {
        window.localStorage.setItem("authenticated", "true");
        form_prove_user.style.display = "none";
      } else {
        window.localStorage.getItem("authenticated", "false");
        error_auth_span.style.display = "inline";
        return Promise.reject(response);
      }
    }).catch(e => {
      error_auth_span.style.display = "inline";
      console.log(e);
      return;
    });
  });
}

function getTagArrayFromString(tagString) {
  //remove whitespace
  tagString = tagString.replace(/\s/g, "");
  let tags = tagString.split('#');
  tags = tags.length > 1 ? tags.slice(1) : [];
  return tags;
}

btn_scrape.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  scrape_current(tab.url);
});

btn_prove.addEventListener("click", async () => {
  auth();
})

btn_reset.addEventListener("click", async () => {
  form_title.value = "";
  form_link.value = "";
  form_tags.value = "";
  form_content.value = "";
});

btn_logout.addEventListener("click", async () => {
  window.localStorage.setItem("authenticated", "false");
  form_prove_user.style.display = "block";
});


btn_add.addEventListener("click", async () => {
  if (window.localStorage.getItem("authenticated", "false") === "true") {
    let tags = getTagArrayFromString(form_tags.value);
    chrome.storage.sync.get({
      host: 'http://localhost',
      port: 8993,
      username: "Damian"
    }, function (items) {
      fetch(items.host + ":" + items.port + "/addData", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: form_title.value,
          link: form_link.value,
          content: form_content.value,
          tags: tags
        })
      }).then(response => {
        if (response.ok) {
          confirm_span.style.display = "inline";
        } else {
          error_span.style.display = "inline";
          Promise.reject(response)
        }
      }).catch(ex => {
        error_span.style.display = "inline";
        console.log("Error adding to the db: ", ex);
      });
    });
  }
});

btn_options.addEventListener("click", async () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});