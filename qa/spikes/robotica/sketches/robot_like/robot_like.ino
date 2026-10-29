// Esqueleto parecido al robot 2WD de la etapa 5: L298N (IN1..IN4, ENA/ENB por PWM) + HC-SR04.
const int IN1 = 4, IN2 = 7, IN3 = 8, IN4 = 12, ENA = 5, ENB = 6, TRIG = 9, ECHO = 10;
long distanciaCm() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2); digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000UL); return us / 58;
}
void avanzar(int v) { digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW); analogWrite(ENA, v); analogWrite(ENB, v); }
void detener() { analogWrite(ENA, 0); analogWrite(ENB, 0); }
void setup() { pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENA, OUTPUT); pinMode(ENB, OUTPUT); pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); Serial.begin(9600); }
void loop() { long d = distanciaCm(); Serial.println(d); if (d > 0 && d < 20) detener(); else avanzar(180); delay(60); }
