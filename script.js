/* textbored beta 0.2 */
// variables
// const connection = new WebSocket(`ws://${prompt('Enter the URL of the websocket')}`); // if other ws is required
const connection = new WebSocket(`wss://textbored-websocket.onrender.com`); // render websocket
const ci = document.querySelector("#userstgs");
let col = document.querySelector("#col").value;
let un = document.querySelector("#un").value;
let usToggle = false;

// json to html parser
function J2HParse(jsonString) {
  let pd;
  try {
    const trimmedJsonString = jsonString.trim();
    pd = JSON.parse(trimmedJsonString);
  } catch (e) {
    console.error("Error parsing JSON in J2HParse:", e);
    return `<p style="color: red;">Error processing message</p>`;
  }

  if (pd.type == 'message') {
    const messageText = pd.message || ''; // Use empty string if pd.message is missing
    return `<p class="msg"><strong class="unms" style="outline: 4px solid ${pd.color}">${pd.username}</strong> ${pd.timestamp} <br><br> ${messageText}</p><br>`;
  } else if (pd.type == 'join') {
    return `<p><strong class="unms" style="outline: 4px solid ${pd.color}">${pd.username}</strong> has joined the chat.</p><br>`;
  }
  // Return an empty string if type is not recognized
  console.warn("J2HParse received unknown message type:", pd.type, pd);
  return ''; // Default return to prevent undefined
}

// generate time string
function timeString(t = false) {
  let d = new Date();
  if (t) {
    let formattedTime = d.toLocaleTimeString("en-IN", {hour: '2-digit', minute: '2-digit', hour12: true });
    return formattedTime;
  } else {
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let day = days[d.getDay()];
    let month = months[d.getMonth()];
    return `${day}, ${d.getDate()} ${month}`;
  }
}

// set name and color of user
function setNaC() {
  let oldUser = `<strong class="unms" style="outline: 4px solid ${col}">${un}</strong>`;
  if (document.querySelector("#un").value === "") {
    alert("You can't have no username!");
    return;
  } else {
    col = document.querySelector("#col").value;
    un = document.querySelector("#un").value;
    Cookies.set('col', col);
    Cookies.set('un', un);
    let changeMsg = `<p>${oldUser} is now <strong class="unms" style="outline: 4px solid ${col}">${un}</strong>.</p><br>`
    connection.send(changeMsg);
  };
};

// on window load - set un and col to saved cookies
window.onload = function() {
  if (Cookies.get("un") && Cookies.get("col")) {
    un = Cookies.get("un");
    col = Cookies.get("col");
  } else {
    un = "user" + Math.floor(Math.random() * 999);
    const p1 = Math.floor(Math.random() * 255).toString();
    const p2 = Math.floor(Math.random() * 255).toString();
    const p3 = Math.floor(Math.random() * 255).toString();
    col = `rgb(${p1}, ${p2}, ${p3})`;
  }
  document.querySelector("#un").value = un;
  document.querySelector("#col").value = col;
};

// send connection message
connection.onopen = (event) => {
  connection.send(`{
    "type": "join",
    "client": "textbored",
    "username": "${un}",
    "color": "${col}",
    "timestamp": "${timeString(true)}"
}`);
  console.log("Connection is open");
};

// messages handler
connection.onmessage = (event) => {
    if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function() {
            document.getElementById("chat").innerHTML += reader.result;
        };
        reader.readAsText(event.data);
    } else if (typeof event.data === 'string') {
        let htmlContent = J2HParse(event.data); // J2HParse returns the HTML string directly

        // If J2HParse successfully generated HTML, append it
        if (htmlContent) { // This checks if the string is not empty or null/undefined (which J2HParse should prevent now)
            document.getElementById("chat").innerHTML += htmlContent;
        } else {
            console.warn("J2HParse returned an empty string, nothing to append.");
        }
    } else {
        console.warn("Received unexpected data type from WebSocket:", typeof event.data, event.data);
    }
};

// well, errors
connection.onerror = (event) => {
  console.error("WebSocket error:", event);
};

// connection close handler
connection.onclose = (event) => {
  console.error("Connection closed... code:", event.code, "reason:", event.reason);
  alert("Connection closed... code: " + event.code + ", reason: " + event.reason);
};

// send message from input
function send() {
  if (connection.readyState === WebSocket.OPEN) {
    const message = document.getElementById("msg").value;
    const msgTemp = `{
    "type": "message",
    "client": "textbored",
    "username": "${un}",
    "color": "${col}",
    "message": "${message}",
    "timestamp": "${timeString(true)}"
}`
    if (message !== "") {
      const data = msgTemp
			connection.send(data);
      document.getElementById("msg").value = "";
    };
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

// send message on enter key press
document.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    send();
  }
});

// a lot is done by gemini