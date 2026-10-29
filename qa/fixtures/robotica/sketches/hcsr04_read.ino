// Sensor HC-SR04: TRIG en D9, ECHO en D10.
void setup() { pinMode(9, OUTPUT); pinMode(10, INPUT); Serial.begin(9600); }
void loop() {
  digitalWrite(9, LOW); delayMicroseconds(2); digitalWrite(9, HIGH); delayMicroseconds(10); digitalWrite(9, LOW);
  unsigned long us = pulseIn(10, HIGH, 30000UL);
  Serial.print("us="); Serial.println(us);
  delay(60);
}
