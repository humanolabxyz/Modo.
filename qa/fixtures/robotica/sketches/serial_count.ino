void setup() { Serial.begin(9600); Serial.println("hola modo"); }
void loop() { static int n = 0; Serial.println(n++); delay(100); }
