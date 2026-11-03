// Seguidor de linea con dos TCRT5000: negro=HIGH, blanco=LOW.
// DO izquierdo=D2, derecho=D3. Driver IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6.
void motores(int izquierda, int derecha) {
 digitalWrite(4,HIGH); digitalWrite(7,LOW); digitalWrite(8,HIGH); digitalWrite(12,LOW);
 analogWrite(5,izquierda); analogWrite(6,derecha);
}
void setup() {
 pinMode(2,INPUT); pinMode(3,INPUT); pinMode(4,OUTPUT); pinMode(7,OUTPUT); pinMode(8,OUTPUT); pinMode(12,OUTPUT);
}
void loop() {
 bool izquierda=digitalRead(2), derecha=digitalRead(3);
 if(izquierda && !derecha) motores(65,200);
 else if(derecha && !izquierda) motores(200,65);
 else motores(180,180);
 delay(5);
}
