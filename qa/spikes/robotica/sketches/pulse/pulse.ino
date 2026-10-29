void setup() { Serial.begin(9600); pinMode(7, INPUT); }
void loop() {
  unsigned long d = pulseIn(7, HIGH, 30000UL);
  unsigned long t = micros(); delayMicroseconds(1000); unsigned long e = micros() - t;
  Serial.print("pulse="); Serial.print(d); Serial.print(" dt="); Serial.println(e);
}
