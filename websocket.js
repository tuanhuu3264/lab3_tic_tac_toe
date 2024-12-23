const { WebSocketServer } = require("ws");
const uuid = require("node-uuid");
function startWebSocketServer(app) {
  const wss = new WebSocketServer({ server: app.listen(5000) });

  let clients = [];
  let clientIndex = 1;

  wss.on("connection", function (ws) {
    const client_uuid = uuid.v4();
    let nickname = `AnonymousUser${clientIndex}`;
    clientIndex++;

    clients.push({ id: client_uuid, ws: ws, nickname: nickname });
    console.log("client [%s] connected", client_uuid);

    ws.on("message", function (message) {
      const datadata = JSON.parse(message);
      const content = datadata.message;
      const username = datadata.username;
      console.log(content);
      console.log(username);
      const kind = datadata.kind;
      if (kind === "world")
        broadcastMessage(content, username, client_uuid, nickname, clients);
      else if (kind === "room") {
        const roomId = datadata.roomId;
        broadcastMessageRoom(
          roomId,
          content,
          username,
          client_uuid,
          nickname,
          clients
        );
      }
    });

    ws.on("close", function () {
      handleDisconnect(client_uuid, clients);
    });
  });

  return wss;
}
function broadcastMessage(content, username, client_uuid, nickname, clients) {
  for (let client of clients) {
    const clientSocket = client.ws;
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(
        JSON.stringify({
          id: client_uuid,
          username: username,
          type: "world",
          message: content,
        })
      );
    }
  }
}
function broadcastMessageRoom(
  roomId,
  content,
  username,
  client_uuid,
  nickname,
  clients
) {
  for (let client of clients) {
    const clientSocket = client.ws;
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.send(
        JSON.stringify({
          id: client_uuid,
          username: username,
          type: "room",
          roomId: roomId,
          message: content,
        })
      );
    }
  }
}

function handleDisconnect(client_uuid, clients) {
  const clientIndex = clients.findIndex((client) => client.id === client_uuid);
  if (clientIndex !== -1) {
    console.log("client [%s] disconnected", client_uuid);
    clients.splice(clientIndex, 1);
  }
}

module.exports = startWebSocketServer;
