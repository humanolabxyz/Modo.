// Pantalla OLED SSD1306 (I2C, direccion 0x3C) con Wire directo: inicializa, pone una ventana de 128x64 y dibuja un patron de bloques.
#include <Wire.h>
#define OLED 0x3C
void cmd(uint8_t c) { Wire.beginTransmission(OLED); Wire.write(0x00); Wire.write(c); Wire.endTransmission(); }
void setup() {
  Wire.begin();
  cmd(0xAE); cmd(0xD5); cmd(0x80); cmd(0xA8); cmd(63); cmd(0xD3); cmd(0x00); cmd(0x40);
  cmd(0x8D); cmd(0x14); cmd(0x20); cmd(0x00); cmd(0xA1); cmd(0xC8); cmd(0xDA); cmd(0x12); cmd(0x81); cmd(0xCF);
  cmd(0xD9); cmd(0xF1); cmd(0xDB); cmd(0x40); cmd(0xA4); cmd(0xA6); cmd(0xAF);
  cmd(0x21); cmd(0); cmd(127); cmd(0x22); cmd(0); cmd(7);
  for (int i = 0; i < 64; i++) {                       // 64 bloques de 16 bytes = 1024 bytes
    Wire.beginTransmission(OLED); Wire.write(0x40);
    for (int j = 0; j < 16; j++) Wire.write((i % 2) ? 0xF0 : 0x0F);
    Wire.endTransmission();
  }
}
void loop() {}
