#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <Hash.h>

#define USE_SERIAL Serial

WiFiClient client;
const char* ssid     = "homely";
const char* password = "Esp8266!";
bool wifiConnected = false;

WebSocketsServer webSocket = WebSocketsServer(3003);
bool socketConnected = false;

const int relayPin = D5;
const int outletPin = D8;

bool toggleOn = false;
bool offHook = false;
bool gain = false;
bool outletHot = false;
bool plugged = false;

void WiFiEvent(WiFiEvent_t event) {
//  Serial.printf("[WiFi-event] event: %d\n", event);

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

      if (payload[0] == 't'){
        if (payload[1] == '0'){
          toggleOn = false;
        } else if (payload[1] == '1'){
          toggleOn = true;
        }
      } else if (payload[0] == 'o'){
        if (payload[1] == '0'){
          outletHot = false;
        } else if (payload[1] == '1'){
          outletHot = true;
        }
      } else if (payload[0] == 'p'){
        if (payload[1] == '0'){
          offHook = false;
        } else if (payload[1] == '1'){
          offHook = true;
        }
      } else if (payload[0] == 'm'){
        if (payload[1] == '0'){
          gain = false;
        } else if (payload[1] == '1'){
          gain = true;
        }
      } else if (payload[0] == '.'){
        webSocket.sendTXT(num, ".");
      }

//      USE_SERIAL.print("toggleOn: ");
//      USE_SERIAL.println(toggleOn);
//      USE_SERIAL.print("outletHot: ");
//      USE_SERIAL.println(outletHot);

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
  pinMode(outletPin, INPUT);
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
  Serial.print("MAC: ");
  Serial.println(WiFi.macAddress());
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
//    else {
//      plugState();
//    }
  } else {
    blink(200);
  }

  plugState();
  maybeLight();
  
}

void light(int state){
  digitalWrite(relayPin, state);
}

void plugState(){
  if (digitalRead(outletPin) == HIGH){
    if (!plugged){
      webSocket.broadcastTXT("1");
//      Serial.println("1");
      digitalWrite(LED_BUILTIN, LOW);
      plugged = true;
    }
  } else {
    if (plugged){
      webSocket.broadcastTXT("0");
//      Serial.println("0");
      digitalWrite(LED_BUILTIN, HIGH);
      plugged = false;
    }
  }
  delay(100);
}

void maybeLight(){
  if (plugged && outletHot){
    if (toggleOn){
      if (offHook){
        if (gain){
          light(1);
        } else {
          light(0);
        }
      } else {
        light(1);
      }
    } else {
      light(1);
    }
  } else {
    light(0);
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

