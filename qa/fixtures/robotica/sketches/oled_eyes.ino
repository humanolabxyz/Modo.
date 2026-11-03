// Cara en una pantalla OLED SSD1306 de 128x64 (I2C, 0x3C) con la biblioteca Adafruit: dos ojos y una boca.
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 pantalla(128, 64, &Wire, -1);

void cara() {
  pantalla.clearDisplay();
  pantalla.fillCircle(38, 24, 15, SSD1306_WHITE);   // ojo izquierdo
  pantalla.fillCircle(90, 24, 15, SSD1306_WHITE);   // ojo derecho
  pantalla.fillCircle(38, 24, 6, SSD1306_BLACK);    // pupilas
  pantalla.fillCircle(90, 24, 6, SSD1306_BLACK);
  pantalla.fillRoundRect(40, 50, 48, 8, 4, SSD1306_WHITE);   // boca
  pantalla.display();
}

void setup() {
  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  cara();
}
void loop() {}
