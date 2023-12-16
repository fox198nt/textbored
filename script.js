const connection= new WebSocket("wss://was2.fox198nt.repl.co/");
var col = document.querySelector("#col").value;
var un = document.querySelector("#un").value;
var ci = document.querySelector("#ci")

connection.onopen = (event) => {
  connection.send(`<p><strong class="unms" style="outline: 2px solid ${col}">${un}</strong> has joined the chat.</p><br>`)
  console.log("Connection is open")
}
connection.onmessage = (event) => {
  document.getElementById("chat").innerHTML += event.data;
}
connection.onerror = (event) => {
  console.error(event.data);
}
connection.onclose = (event) => {
  console.log("Connection is... closed?")
  console.error(event.data);
}

function timeString(t = false) {
  let d = new Date();
  if (t) {
    return d.toLocaleTimeString('en-IN', {hour: 'numeric', minute: 'numeric', hour12: true});
  } else {
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let day = days[d.getDay()];
    let month = months[d.getMonth()];
    return `${day}, ${d.getDate()} ${month}`;
  }
}
function send(event) {
  if (connection.readyState === WebSocket.OPEN) {
    if (document.getElementById("msg").value == "") {} else { 
      const data = `<p class="msg"><strong class="unms" style="outline: 2px solid ${col}">${un}</strong> ${timeString(true)} <br><br> ${document.getElementById("msg").value}</p><br>`;
      connection.send(data);
      document.getElementById("msg").value = "";
    }
  }
}
function setNaC() {
  col = document.querySelector("#col").value;
  un = document.querySelector("#un").value;
  Cookies.set('col', col)
  Cookies.set('un', un)
}

ci.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("send-btn").click();
  }
});
window.onload = function() {
  /* if (Cookies.get("un") == null) {} else {
    col = Cookies.get("col")
    un = Cookies.get('un')
  } */
	un = "user" + Math.floor(Math.random() * 999);

  var p1 = Math.floor(Math.random() * 255).toString();
	var p2 = Math.floor(Math.random() * 255).toString();
  var p3 = Math.floor(Math.random() * 255).toString();
	col = `rgb(${p1}, ${p2}, ${p3})`;
}