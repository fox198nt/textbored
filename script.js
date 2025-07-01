/* textbored beta 0.3 */
// variables
const connection = new WebSocket("wss://textbored-websocket.onrender.com");
//const connection = new WebSocket("ws://localhost:8080");
const chatElement = document.getElementById("chat");
const ci = document.querySelector("#userstgs");
const ts = new Date().toISOString()
let col = document.querySelector("#col").value;
let un = document.querySelector("#un").value;
let connectedUsersList;
let usToggle = false;
let ulToggle = false;

// json to html parser
function J2HParse(jsonString) {
  let pd;
  try {
    const trimmedJsonString = jsonString.trim();
    pd = JSON.parse(trimmedJsonString);
  } catch (e) {
    console.error("Error parsing JSON in J2HParse:", e, "Original string:", jsonString);
    return `<p style="color: red;">Error processing message</p>`;
  }
  // console.log(pd) // for debugging

  let resultHtml = '';
  let tsO = new Date(pd.timestamp)
  let timestamp;

  if (isNaN(tsO.getTime())) {
    if (pd.type == 'user_list') {
    } else {
      console.error("Received timestamp could not be parsed into a Date object:", pd.timestamp);
      returnHTML = `<p style="color: red;">Error: Invalid message timestamp</p>`;
    };
  };

  timestamp = tsO.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
  
  
  switch (pd.type) {
    case 'message':
      const messageText = pd.message || '';
      resultHtml = `<p class="msg"><strong class="unms" style="outline: 4px solid ${pd.color}">${pd.username}</strong> ${timestamp} <br><br> ${messageText}</p><br>`;
      break;
    case 'join':
      resultHtml = `<p><strong class="unms" style="outline: 4px solid ${pd.color}">${pd.username}</strong> has joined the chat. <small>${timestamp}</small></p><br>`;
      break;
    case 'leave':
      resultHtml = `<p><strong class="unms" style="outline: 4px solid ${pd.color}">${pd.username}</strong> has left the chat. <small>${timestamp}</small></p><br>`;
      break;
    case 'change':
      resultHtml = `<p><strong class="unms" style="outline: 4px solid ${pd.oldCol}">${pd.oldUn}</strong> is now <strong class="unms" style="outline: 4px solid ${pd.color}">${pd.username}</strong>. <small>${timestamp}</small></p><br>`;
      break;
    case 'error':
      resultHtml = `<p style="color: red;">Server Error: ${pd.message}</p><br>`;
      break;
    case 'user_list':
      connectedUsersList = pd;
      connectedUsersList = pd.users.map(user =>
        `<strong class='unms' style="outline: 4px solid ${user.color || '#000'}; margin: 7px;">${user.username}</strong>`
      ).join('');
      resultHtml = '';
      break;

    default:
      console.warn("J2HParse received unknown message type:", pd.type, pd);
      resultHtml = '';
      break;
  }
  return resultHtml;
}

/* generate time string (prsobably not gonna be used)
function timeString(t = false) {
  let d = new Date();

  if (t) {
    let formattedTime = d.toISOString();
    return formattedTime;
  } else {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let day = days[d.getDay()];
    let month = months[d.getMonth()];
    
    return `${day}, ${d.getDate()} ${month}`;
  }
} */

// set name and color of user
function setNaC() {
  let oldUserUn = un;
  let oldUserCol = col;

  if (document.querySelector("#un").value === "") {
    showModal("You can't have no username!", 'Please choose a username.');
    document.querySelector("#un").value = un;
  } else {
    col = document.querySelector("#col").value;
    un = document.querySelector("#un").value;
    Cookies.set('col', col);
    Cookies.set('un', un);
    let changeMsg = JSON.stringify({
    type: "change",
    client: "textbored",
    oldUn: oldUserUn,
    oldCol: oldUserCol,
    username: un,
    color: col,
    timestamp: timeString(true)
});
    connection.send(changeMsg);
  };
};

// modal stuff
function showModal(title, message) {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalMessage').innerHTML = message;
  document.getElementById('customModal').style.display = 'block';
};
function hideModal() {
  document.getElementById('customModal').style.display = 'none';
};

// on window load - set un and col to saved cookies
window.onload = function() {
  if (Cookies.get("un") && Cookies.get("col")) {
    un = Cookies.get("un");
    col = Cookies.get("col");
  } else {
    un = "user" + Math.floor(Math.random() * 9999);
    col = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
  }
  document.querySelector("#un").value = un;
  document.querySelector("#col").value = col;
};

// send connection message
connection.onopen = (event) => {
  if (!un || !col) {
    un = Cookies.get("un") || "user" + Math.floor(Math.random() * 999);
    col = Cookies.get("col") || `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    document.querySelector("#un").value = un;
    document.querySelector("#col").value = col;
  }

  connection.send(JSON.stringify({
    type: "join",
    client: "textbored",
    username: un,
    color: col,
    timestamp: ts
  }));
  console.log("Connection is open, sent join message.");
  chatElement.innerHTML += "<h3>Connection Esablished</h3>";
};

// messages handler
connection.onmessage = (event) => {
  // check if the user is currently scrolled to the bottom (or very near it)
  const isScrolledToBottom = chatElement.scrollHeight - chatElement.clientHeight <= chatElement.scrollTop + 1;

  if (event.data instanceof Blob) { // this was an issue, idk if it is anymore
    const reader = new FileReader();
    reader.onload = function() {
      let htmlContent = J2HParse(reader.result);
      if (htmlContent) {
        chatElement.innerHTML += htmlContent;
        if (isScrolledToBottom) {
          chatElement.scrollTop = chatElement.scrollHeight;
        };
      } else {
          console.warn("J2HParse returned an empty string from Blob data, nothing to append.");
      };
    };
    reader.readAsText(event.data);
  } else if (typeof event.data === 'string') {
    let htmlContent = J2HParse(event.data);

    if (htmlContent) {
      chatElement.innerHTML += htmlContent;
      if (isScrolledToBottom) {
        chatElement.scrollTop = chatElement.scrollHeight;
      };
    } else {
      console.warn("J2HParse returned an empty string, nothing to append.");
    };
  } else {
    console.warn("Received unexpected data type from WebSocket:", typeof event.data, event.data);
  };
};

// well, errors
connection.onerror = (event) => {
  console.error("WebSocket error:", event);
};

// connection close handler
connection.onclose = (event) => {
  console.error("Connection closed... code:", event.code, "reason:", event.reason);
  showModal("Connection closed...", ("Code: " + event.code + " | Reason: " + event.reason));
  chatElement.innerHTML += '<h3>Connection Closed</h3>';
};

// send message from input
function send() {
  if (connection.readyState === WebSocket.OPEN) {
    const message = document.getElementById("msg").value;
    const msgTemp = {
      type: "message",
      client: "textbored",
      username: un,
      color: col,
      message: message,
      timestamp: ts
    };
    if (message.trim() !== "") {
      connection.send(JSON.stringify(msgTemp));
      document.getElementById("msg").value = "";
    };
  } else {
    showModal("Connection Error", "Can't send message, connection is not open.");
  };
};

// user settings pop-up toggle
document.querySelector('#userstgs-btn').addEventListener('click', function() {
  if (usToggle== false) {
    ci.style.display = "flex";
    usToggle = true;
  } else {
    ci.style.display = "none";
    usToggle = false;
  };
});
// close menu on click out of the menu
document.addEventListener('click', function(event) {
  if (!ci.contains(event.target) && !document.querySelector('#userstgs-btn').contains(event.target) && usToggle) {
    ci.style.display = "none";
    usToggle = false;
  }
});

// user list modal toggle
document.querySelector('#usrlist-btn').addEventListener('click', function() {
  if (ulToggle== false) {
    showModal('Online Users List', connectedUsersList);
    usToggle = true;
  } else {
    hideModal()
    ulToggle = false;
  };
});

// send message on enter key press
document.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    send();
  }
});
