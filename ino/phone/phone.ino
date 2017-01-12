const int vPhoneL = 2; // red to phone jack yellow
const int sPhoneL = 3; // blue to 17 above ringer to phone jack black
const int leftRelayPin = 4; // yellow to 11 left of relay
const int leftInhPin = 5; // green to 25 left of ringer

char inChar = 0;
bool ringing = false;

void ring() {
  if (!ringing){
//    Serial.println("ring on");
    digitalWrite(leftRelayPin, HIGH); // switch relay to ringer circuit
    delay(20);
    digitalWrite(leftInhPin, LOW); // uninhibit ringer
    ringing = true;
  }
}

void killRing() {
  if (ringing){
//    Serial.println("ring off");
    digitalWrite(leftInhPin, HIGH); // inhibit ringer
    delay(20);
    digitalWrite(leftRelayPin, LOW); // switch to audio circuit
    ringing = false;
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

  // phone on hook
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

