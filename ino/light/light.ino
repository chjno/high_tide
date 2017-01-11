#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <Hash.h>

#define USE_SERIAL Serial

WiFiClient client;
const char* ssid     = "itpsandbox";
const char* password = "NYU+s0a!+P?";
bool wifiConnected = false;

WebSocketsServer webSocket = WebSocketsServer(3003);
bool socketConnected = false;

const int relayPin = D5;

void WiFiEvent(WiFiEvent_t event) {
  Serial.printf("[WiFi-event] event: %d\n", event);

  switch(event) {
    case WIFI_EVENT_STAMODE_GOT_IP:
      Serial.println("WiFi connected");
      Serial.println("IP address: ");
      Serial.println(WiFi.localIP());
      wifiConnected = true;
      
      for (int i = 0; i < 3; i++){
        digitalWrite(LED_BUILTIN, LOW);
        delay(100);
        digitalWrite(LED_BUILTIN, HIGH);
        delay(100);
      }
      break;
    case WIFI_EVENT_STAMODE_DISCONNECTED:
      Serial.println("WiFi lost connection");
      wifiConnected = false;
      break;
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) {

  switch (type) {
    case WStype_DISCONNECTED:
      USE_SERIAL.printf("[%u] Disconnected!\n", num);
      socketConnected = false;
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        USE_SERIAL.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
        socketConnected = true;
        
        for (int i = 0; i < 2; i++){
          digitalWrite(LED_BUILTIN, LOW);
          delay(100);
          digitalWrite(LED_BUILTIN, HIGH);
          delay(100);
        }
        // send message to client
        webSocket.sendTXT(num, "light");
      }
      break;
    case WStype_TEXT:
//      USE_SERIAL.printf("[%u] get Text: %s\n", num, payload);
      if (payload[0] == '0'){
        digitalWrite(relayPin, LOW);
        digitalWrite(LED_BUILTIN, LOW);
        USE_SERIAL.println("go low");
      } else if (payload[0] == '1'){
        digitalWrite(relayPin, HIGH);
        digitalWrite(LED_BUILTIN, HIGH);
        USE_SERIAL.println("go high");
      }

      // send message to client
      // webSocket.sendTXT(num, "message here");

      // send data to all connected clients
      // webSocket.broadcastTXT("message here");
      break;
    case WStype_BIN:
      USE_SERIAL.printf("[%u] get binary lenght: %u\n", num, lenght);
      hexdump(payload, lenght);

      // send message to client
      // webSocket.sendBIN(num, payload, lenght);
      break;
  }

}

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);
  
  // USE_SERIAL.begin(921600);
  USE_SERIAL.begin(115200);

  //Serial.setDebugOutput(true);
  USE_SERIAL.setDebugOutput(true);

  USE_SERIAL.println();
  USE_SERIAL.println();
  USE_SERIAL.println();

  for (uint8_t t = 4; t > 0; t--) {
    USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }

  WiFi.disconnect(true);
  delay(1000);
  WiFi.onEvent(WiFiEvent);
  WiFi.begin(ssid, password);
  Serial.println();
  Serial.println();
  Serial.println("Wait for WiFi... ");

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();

  if (wifiConnected){
    if (!socketConnected){
      blink(1000);
    }
  } else {
    blink(500);
  }
  
}

unsigned long timestamp = 0;
bool ledOn = false;
void blink(int pause){
  unsigned long now = millis();

  if ((unsigned long)(now - timestamp) >= pause) {
    if (ledOn){
      digitalWrite(LED_BUILTIN, HIGH);
      timestamp = now;
      ledOn = false;
    } else {
      digitalWrite(LED_BUILTIN, LOW);
      timestamp = now;
      ledOn = true;
    }
  }
}

