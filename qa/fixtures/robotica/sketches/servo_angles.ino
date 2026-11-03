// Servo SG90 en D11 (señal). Recorre 0° → 90° → 180° con un segundo en cada posición.
#include <Servo.h>
Servo brazo;
void setup() { brazo.attach(11); }
void loop() {
  brazo.write(0);   delay(1000);
  brazo.write(90);  delay(1000);
  brazo.write(180); delay(1000);
}
