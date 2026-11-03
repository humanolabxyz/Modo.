// Servo en D11 que sigue a un potenciómetro en A0 (0–1023 → 0–180°).
#include <Servo.h>
Servo brazo;
void setup() { brazo.attach(11); }
void loop() {
  int lectura = analogRead(A0);
  brazo.write(map(lectura, 0, 1023, 0, 180));
  delay(15);
}
