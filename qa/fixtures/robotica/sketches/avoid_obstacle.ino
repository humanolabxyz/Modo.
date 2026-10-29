// Evitar obstáculos: avanza; si el HC-SR04 ve algo a menos de 20 cm, gira a la derecha un momento.
// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Sensor: TRIG=D9, ECHO=D10.
long distanciaCm() {
  digitalWrite(9, LOW); delayMicroseconds(2); digitalWrite(9, HIGH); delayMicroseconds(10); digitalWrite(9, LOW);
  unsigned long us = pulseIn(10, HIGH, 25000UL);
  if (us == 0) return 400;
  return us / 58;
}
void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);
  analogWrite(5, fuerza); analogWrite(6, fuerza);
}
void setup() { pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT); pinMode(9, OUTPUT); pinMode(10, INPUT); }
void loop() {
  if (distanciaCm() < 20) { motores(true, false, 200); delay(400); }
  else motores(true, true, 200);
  delay(30);
}
