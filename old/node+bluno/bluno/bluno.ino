void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  if (Serial.available()){
    Serial.read();
//    char inChar = Serial.read();

    
    
//    Serial.println(inChar);
//    int num = Serial.parseInt();
//    Serial.println(num);


//    if (inChar == '1'){
//      Serial.println('1');
//      digitalWrite(LED_BUILTIN, HIGH);
//    } else {
//      Serial.println('0');
//      digitalWrite(LED_BUILTIN, LOW);
//    }


    Serial.write('6');
//    Serial.println();
//    Serial.write(Serial.read());
    Serial.println();
  }
//  delay(1000);
}
