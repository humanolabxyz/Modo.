void setup() { Serial.begin(9600); Serial.println("hola"); }
void loop() { Serial.print("a0="); Serial.println(analogRead(A0)); delay(50); }
