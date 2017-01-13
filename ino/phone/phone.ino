const int vPhoneL = 2; // red to phone jack yellow
const int sPhoneL = 3; // blue to 17 above ringer to phone jack black
const int leftRelayPin = 4; // yellow to 11 left of relay
const int leftInhPin = 5; // green to 25 left of ringer

char inChar = 0;

unsigned long timestamp = 0;
const int ringIntervals = 4;
const int ringTime[ringIntervals] = {400, 200, 400, 2000};
int ringIndex = 0;
bool ringing = false;
void ring(){
  if (!ringing){
    ringing = true;
    timestamp = millis();
    digitalWrite(leftRelayPin, HIGH); // switch relay to ringer circuit
    delay(20);
    digitalWrite(leftInhPin, LOW); // uninhibit ringer
  }
  
  unsigned long now = millis();
  if ((unsigned long)(now - timestamp) >= ringTime[ringIndex]) {
    ringIndex++;
    if (ringIndex >= ringIntervals){
      ringIndex = 0;
    }
    timestamp = now;
    if (ringIndex % 2 == 0){
      digitalWrite(leftInhPin, LOW);
    } else {
      digitalWrite(leftInhPin, HIGH);
    }
  }
}

void killRing() {
  if (ringing){
//    Serial.println("ring off");
    digitalWrite(leftInhPin, HIGH); // inhibit ringer
    delay(20);
    digitalWrite(leftRelayPin, LOW); // switch to audio circuit
    ringing = false;
    ringIndex = 0;
  }
}

void setup() {
  pinMode(vPhoneL, OUTPUT);
  pinMode(sPhoneL, INPUT);
  pinMode(leftRelayPin, OUTPUT);
  pinMode(leftInhPin, OUTPUT);

  // send voltage through hook circuit
  digitalWrite(vPhoneL, HIGH);

  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
}

void loop() {
  if (Serial.available()){
    inChar = Serial.read();
//    Serial.println(inChar);
  }

  buttonState();

//  phone on hook
  if (digitalRead(sPhoneL) == HIGH){
    if (inChar == '1'){
      ring();
    } else {
      killRing();
    }

  // phone off hook
  } else {
    killRing();
  }
}

bool offHook = false;
unsigned long hookStamp = 0;
void buttonState(){
  unsigned long now = millis();

  if ((unsigned long)(now - hookStamp) >= 100) {
    if (digitalRead(sPhoneL) == LOW){
      if (!offHook){
        Serial.println("1");
        digitalWrite(LED_BUILTIN, LOW);
        offHook = true;
      }
//      if (inChar == '1'){
//        ring();
//      } else {
//        killRing();
//      }
    } else {
      if (offHook){
        Serial.println("0");
        digitalWrite(LED_BUILTIN, HIGH);
        offHook = false;
      }
//      killRing();
    }
    hookStamp = now;
  }
}

