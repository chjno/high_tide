//#include <WebSockets.h>
//#include <WebSocketsClient.h>
//#include <WebSocketsServer.h>

#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>

WiFiClient client;
const char* ssid     = "itpsandbox";
const char* password = "NYU+s0a!+P?";
bool connected = false;

WebSocketsClient socket;
bool socketed = false;

IPAddress server(128, 122, 6, 241);
const int port = 3000;

void WiFiEvent(WiFiEvent_t event) {
  Serial.printf("[WiFi-event] event: %d\n", event);

  switch (event) {
    case WIFI_EVENT_STAMODE_GOT_IP:
      Serial.println("WiFi connected");
      Serial.println("IP address: ");
      Serial.println(WiFi.localIP());
      socket.beginSocketIO("128.122.6.241", 3000);
      socket.onEvent(webSocketEvent);
      connected = true;
      break;
    case WIFI_EVENT_STAMODE_DISCONNECTED:
      Serial.println("WiFi lost connection");
      connected = false;
      break;
  }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t lenght) {
  Serial.println(type);
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[WSc] Disconnected!\n");
      socketed = false;
      break;
    case WStype_CONNECTED:
      {
        Serial.printf("[WSc] Connected to url: %s\n",  payload);
        socketed = true;

        // send message to server when Connected
        // socket.io upgrade confirmation message (required)
        socket.sendTXT("5");
      }
      break;
    case WStype_TEXT:
      Serial.printf("[WSc] get text: %s\n", payload);

      // send message to server
      // webSocket.sendTXT("message here");
      break;
    case WStype_BIN:
      Serial.printf("[WSc] get binary lenght: %u\n", lenght);
      hexdump(payload, lenght);

      // send data to server
      // webSocket.sendBIN(payload, lenght);
      break;
  }
}

void setup() {
  Serial.begin(115200);

  // delete old config
  WiFi.disconnect(true);

  delay(1000);

  WiFi.onEvent(WiFiEvent);

  WiFi.begin(ssid, password);

  Serial.println();
  Serial.println();
  Serial.println("Wait for WiFi... ");

}

void loop() {
  socket.loop();
  
  //  if (connected){
  //    if (Serial.available()){
  //      nodeConnect();
  //      char inChar = Serial.read();
  //      if (inChar == '1'){
  //        client.println("GET /on HTTP/1.0");
  //        client.println();
  //        Serial.println("on");
  //      } else if (inChar == '0'){
  //        client.println("GET /off HTTP/1.0");
  //        client.println();
  //        Serial.println("off");
  //      } else if (inChar == 'x'){
  //        client.stop();
  //        Serial.println("disconnect from server");
  //      }
  //    }
  //  }

}
