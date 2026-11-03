// Robot de orugas que recoge dos cubos del suelo, uno con cada mano, los levanta un momento y los suelta.
// Cuello (servo): D3. Hombros: izquierdo D11, derecho D2. Codos: izquierdo D13, derecho A0. Pinzas: izquierda A1, derecha A2. Pantalla OLED por I2C: SDA=A4, SCL=A5.
// Los servos del lado derecho van en espejo: reciben 180 - angulo para moverse igual que los del izquierdo.
#include <Wire.h>
#include <Servo.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 pantalla(128, 64, &Wire, -1);
Servo cuello, hombroIzq, hombroDer, codoIzq, codoDer, pinzaIzq, pinzaDer;

// hombro: 90 = brazo colgando, menos de 90 = lo adelanta (0 = horizontal). codo: 90 = antebrazo recto, mas de 90 = lo dobla hacia adelante. pinza: 0 = muy abierta, 90 = casi cerrada.
void brazos(int hombro, int codo, int pinza) {
  hombroIzq.write(hombro); hombroDer.write(180 - hombro);
  codoIzq.write(codo);     codoDer.write(180 - codo);
  pinzaIzq.write(pinza);   pinzaDer.write(pinza);
}

// Cara: 0 = normal, 1 = contento (ojos cerrados en arco y sonrisa grande)
void cara(int estado) {
  pantalla.clearDisplay();
  if (estado == 1) {
    pantalla.fillCircle(38, 28, 15, SSD1306_WHITE); pantalla.fillCircle(90, 28, 15, SSD1306_WHITE);
    pantalla.fillRect(20, 28, 36, 20, SSD1306_BLACK); pantalla.fillRect(72, 28, 36, 20, SSD1306_BLACK);   // solo la mitad de arriba: ojos sonrientes
    pantalla.fillRoundRect(34, 46, 60, 12, 6, SSD1306_WHITE);
  } else {
    pantalla.fillCircle(38, 24, 15, SSD1306_WHITE); pantalla.fillCircle(90, 24, 15, SSD1306_WHITE);
    pantalla.fillCircle(38, 24, 6, SSD1306_BLACK);  pantalla.fillCircle(90, 24, 6, SSD1306_BLACK);
    pantalla.fillRoundRect(40, 50, 48, 8, 4, SSD1306_WHITE);
  }
  pantalla.display();
}

void setup() {
  cuello.attach(3); cuello.write(90);
  hombroIzq.attach(11); hombroDer.attach(2); codoIzq.attach(13); codoDer.attach(A0); pinzaIzq.attach(A1); pinzaDer.attach(A2);
  brazos(90, 140, 20);                    // brazos colgando con los antebrazos doblados y pinzas abiertas
  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  cara(0);
  delay(1200);

  brazos(28, 28, 20);   delay(1500);      // baja los brazos hacia los cubos, con las pinzas abiertas
  brazos(28, 28, 64);   delay(1000);      // cierra las pinzas: agarra los cubos
  cara(1);
  brazos(0, 50, 64);    delay(1500);      // levanta los brazos con los cubos
  brazos(28, 28, 64);   delay(1500);      // los baja otra vez al suelo
  brazos(28, 28, 20);   delay(1000);      // abre las pinzas: los suelta
  brazos(90, 140, 20);   delay(800);       // vuelve a colgar los brazos
  cara(0);
}

void loop() {}
