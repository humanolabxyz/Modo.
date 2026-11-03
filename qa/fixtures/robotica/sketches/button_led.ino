// Pulsador entre D2 y GND (INPUT_PULLUP): el LED de D13 se enciende mientras se mantiene pulsado.
void setup() { pinMode(2, INPUT_PULLUP); pinMode(13, OUTPUT); }
void loop() { digitalWrite(13, digitalRead(2) == LOW ? HIGH : LOW); }
