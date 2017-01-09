#include <ESP8266WiFi.h>
WiFiClient client;

//const char* ssid     = "chichi";
//const char* password = "internet!";
const char* ssid     = "itpsandbox";
const char* password = "NYU+s0a!+P?";
bool connected = false;

void nodeConnect(){
  IPAddress server(128,122,6,241);
  const uint16_t port = 3000;
  
  while (!client.connect(server, port)) {
    Serial.println("connection failed");
    Serial.println("reconnecting");
    delay(500);
  }
}

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
  if (connected){
    if (Serial.available()){
      nodeConnect();
      char inChar = Serial.read();
      if (inChar == '1'){
        client.println("GET /on HTTP/1.0");
        client.println();
        Serial.println("on");
      } else if (inChar == '0'){
        client.println("GET /off HTTP/1.0");
        client.println();
        Serial.println("off");
      } else if (inChar == 'x'){
        client.stop();
        Serial.println("disconnect from server");
      }
    }
  }
}

