// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6.
void setup() { pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT); digitalWrite(4, HIGH); digitalWrite(7, LOW); digitalWrite(8, HIGH); digitalWrite(12, LOW); analogWrite(5, 180); analogWrite(6, 180); }
void loop() {}
