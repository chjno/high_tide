#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

ESP8266WebServer server(80);

//const char* ssid     = "chichi";
//const char* password = "internet!";
const char* ssid     = "itpsandbox";
const char* password = "NYU+s0a!+P?";
bool connected = false;

void WiFiEvent(WiFiEvent_t event) {
  Serial.printf("[WiFi-event] event: %d\n", event);

  switch(event) {
    case WIFI_EVENT_STAMODE_GOT_IP:
      Serial.println("WiFi connected");
      Serial.println("IP address: ");
      Serial.println(WiFi.localIP());
      connected = true;
      break;
    case WIFI_EVENT_STAMODE_DISCONNECTED:
      Serial.println("WiFi lost connection");
      connected = false;
      break;
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(LED_BUILTIN, OUTPUT);

  // delete old config
  WiFi.disconnect(true);

  delay(1000);

  WiFi.onEvent(WiFiEvent);

  WiFi.begin(ssid, password);

  Serial.println();
  Serial.println();
  Serial.println("Wait for WiFi... ");

  server.on("/on", [](){
    digitalWrite(LED_BUILTIN, HIGH);
    server.send(200, "text/plain", "LED on");
  });
  server.on("/off", [](){
    digitalWrite(LED_BUILTIN, LOW);
    server.send(200, "text/plain", "LED off");
  });
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  if (connected){
    server.handleClient();
  }
}

