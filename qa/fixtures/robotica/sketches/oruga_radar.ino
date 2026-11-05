// Robot de orugas con cabeza de radar, cara y brazos.
// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Cuello (servo): D3. Hombros (servos): izquierdo D11, derecho D2. Codos: D13 y A0. Pinzas: A1 y A2. HC-SR04: TRIG=D9, ECHO=D10. Pantalla OLED por I2C: SDA=A4, SCL=A5.
// Avanza mirando al frente. Si ve algo cerca se sorprende y levanta los brazos, mira a los lados con el cuello, elige el lado mas libre y gira hacia el.
#include <Wire.h>
#include <Servo.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 pantalla(128, 64, &Wire, -1);
Servo cuello, brazoIzq, brazoDer, codoIzq, codoDer, pinzaIzq, pinzaDer;

const int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)

long distanciaCm() {
  digitalWrite(9, LOW); delayMicroseconds(2);
  digitalWrite(9, HIGH); delayMicroseconds(10);
  digitalWrite(9, LOW);
  unsigned long us = pulseIn(10, HIGH, 25000UL);
  if (us == 0) return 400;
  return us / 58;
}

void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);
  analogWrite(5, fuerza); analogWrite(6, fuerza);
}
// Freno: los cuatro IN en bajo con el enable puesto cortocircuitan los motores y los detienen de golpe (con el enable apagado giran libres y el robot sigue de largo).
void parar() {
  digitalWrite(4, LOW); digitalWrite(7, LOW); digitalWrite(8, LOW); digitalWrite(12, LOW);
  analogWrite(5, 255); analogWrite(6, 255);
}

// Cara: 0 = normal, 1 = sorprendido, 2 = mira a SU izquierda, 3 = mira a SU derecha (quien la ve de frente tiene la izquierda del robot a la derecha de la pantalla)
void cara(int estado) {
  int dx = (estado == 2) ? 6 : (estado == 3) ? -6 : 0;
  pantalla.clearDisplay();
  if (estado == 1) {                                          // sorpresa: ojos enormes y boca redonda
    pantalla.fillCircle(38, 24, 18, SSD1306_WHITE); pantalla.fillCircle(90, 24, 18, SSD1306_WHITE);
    pantalla.fillCircle(38, 24, 4, SSD1306_BLACK);  pantalla.fillCircle(90, 24, 4, SSD1306_BLACK);
    pantalla.fillCircle(64, 52, 8, SSD1306_WHITE);  pantalla.fillCircle(64, 52, 4, SSD1306_BLACK);
  } else {                                                    // ojos con pupila y boca contenta
    pantalla.fillCircle(38, 24, 15, SSD1306_WHITE); pantalla.fillCircle(90, 24, 15, SSD1306_WHITE);
    pantalla.fillCircle(38 + dx, 24, 6, SSD1306_BLACK); pantalla.fillCircle(90 + dx, 24, 6, SSD1306_BLACK);
    pantalla.fillRoundRect(40, 50, 48, 8, 4, SSD1306_WHITE);
  }
  pantalla.display();
}

void mirar(int angulo) { cuello.write(angulo); delay(300); }   // el servo tarda un momento en llegar
// Hombros: 90 = brazos colgando a los lados del cuerpo; menos de 90 = los adelanta y los levanta. El derecho se mueve en espejo (180 - angulo).
void brazos(int angulo) { brazoIzq.write(angulo); brazoDer.write(180 - angulo); }

void setup() {
  Serial.begin(9600);
  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);
  pinMode(9, OUTPUT); pinMode(10, INPUT);
  cuello.attach(3); cuello.write(CENTRO);
  brazoIzq.attach(11); brazoDer.attach(2); brazos(90);
  codoIzq.attach(13); codoDer.attach(A0); codoIzq.write(140); codoDer.write(40);     // codos doblados hacia adelante
  pinzaIzq.attach(A1); pinzaDer.attach(A2); pinzaIzq.write(20); pinzaDer.write(20); // pinzas abiertas
  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  cara(0);
}


const int LIBRE_CM = 29;
unsigned long ultimaManiobra = 0, avanceDesde = 0, lecturaEstableDesde = 0;
long distanciaReferencia = 0;
int intentos = 0;
bool ultimoGiroIzquierda = false;

void loop() {
  const long frente = distanciaCm();
  const unsigned long ahora = millis();
  if (frente > LIBRE_CM) {
    if (!avanceDesde) {
      avanceDesde = ahora;
      lecturaEstableDesde = ahora;
      distanciaReferencia = frente;
    }
    if (abs(frente - distanciaReferencia) > 4) {
      distanciaReferencia = frente;
      lecturaEstableDesde = ahora;
    }
    // Si la distancia no cambia al ordenar avance, puede estar trabado contra
    // un obstáculo bajo o lateral. Sin eco, hace una maniobra de exploración más tarde.
    const unsigned long espera = frente == 400 ? 4600 : 1350;
    if (ahora - lecturaEstableDesde < espera) {
      motores(true, true, frente < 45 ? 165 : 200);
      if (ahora - avanceDesde > 1600 && ahora - lecturaEstableDesde < 650) intentos = 0;
      delay(35);
      return;
    }
  }

  const bool recuperar = frente > LIBRE_CM || (ultimaManiobra && ahora - ultimaManiobra < 1800);
  if (recuperar) intentos = min(intentos + 1, 4); else intentos = 0;
  avanceDesde = 0;
  parar();
  Serial.println(recuperar ? F("@robot:recover") : F("@robot:surprise"));
  cara(1); brazos(40);
  delay(150);
  // La marcha atrás deja espacio para que el cuerpo y los brazos puedan pivotar.
  motores(false, false, 185);
  delay(220 + 135 * intentos);
  parar(); delay(100);

  cara(2); mirar(IZQUIERDA); const long izq = distanciaCm();
  cara(3); mirar(DERECHA); const long der = distanciaCm();
  const bool parejo = abs(izq - der) < 12;
  const bool izquierda = (parejo || intentos >= 2) ? !ultimoGiroIzquierda : izq > der;
  ultimoGiroIzquierda = izquierda;
  mirar(CENTRO);
  cara(izquierda ? 2 : 3);
  Serial.println(izquierda ? F("@robot:left") : F("@robot:right"));
  motores(!izquierda, izquierda, 205);
  delay(550 + 150 * intentos);
  parar(); delay(100);
  ultimaManiobra = millis();
  cara(0); brazos(90);
}
