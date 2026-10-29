// Mapa de pines del Arduino UNO R3 → puertos del ATmega328P. Los ids son los del catálogo (D0–D13, A0–A5).
export type AvrPort = 'B' | 'C' | 'D';
export const UNO_PINS: Record<string, {port: AvrPort; bit: number}> = {};
for (let n = 0; n <= 7; n++) UNO_PINS[`D${n}`] = {port: 'D', bit: n};
for (let n = 8; n <= 13; n++) UNO_PINS[`D${n}`] = {port: 'B', bit: n - 8};
for (let n = 0; n <= 5; n++) UNO_PINS[`A${n}`] = {port: 'C', bit: n};
export const PIN_BY_PORT_BIT = (port: AvrPort, bit: number): string | undefined => Object.keys(UNO_PINS).find(id => UNO_PINS[id].port === port && UNO_PINS[id].bit === bit);
export const PWM_PINS = ['D3', 'D5', 'D6', 'D9', 'D10', 'D11'];
export const isUnoPin = (id: string) => id in UNO_PINS;
