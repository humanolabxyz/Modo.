var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/avr8js/dist/cjs/cpu/interrupt.js
var require_interrupt = __commonJS({
  "node_modules/avr8js/dist/cjs/cpu/interrupt.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.avrInterrupt = avrInterrupt;
    function avrInterrupt(cpu, addr) {
      const sp = cpu.dataView.getUint16(93, true);
      cpu.data[sp] = cpu.pc & 255;
      cpu.data[sp - 1] = cpu.pc >> 8 & 255;
      if (cpu.pc22Bits) {
        cpu.data[sp - 2] = cpu.pc >> 16 & 255;
      }
      cpu.dataView.setUint16(93, sp - (cpu.pc22Bits ? 3 : 2), true);
      cpu.data[95] &= 127;
      cpu.cycles += 2;
      cpu.pc = addr;
    }
  }
});

// node_modules/avr8js/dist/cjs/cpu/cpu.js
var require_cpu = __commonJS({
  "node_modules/avr8js/dist/cjs/cpu/cpu.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CPU = void 0;
    var interrupt_1 = require_interrupt();
    var registerSpace = 256;
    var MAX_INTERRUPTS = 128;
    var CPU2 = class {
      constructor(progMem, sramBytes = 8192) {
        this.progMem = progMem;
        this.sramBytes = sramBytes;
        this.data = new Uint8Array(this.sramBytes + registerSpace);
        this.data16 = new Uint16Array(this.data.buffer);
        this.dataView = new DataView(this.data.buffer);
        this.progBytes = new Uint8Array(this.progMem.buffer);
        this.readHooks = [];
        this.writeHooks = [];
        this.pendingInterrupts = new Array(MAX_INTERRUPTS);
        this.nextClockEvent = null;
        this.clockEventPool = [];
        this.pc22Bits = this.progBytes.length > 131072;
        this.gpioPorts = /* @__PURE__ */ new Set();
        this.gpioByPort = [];
        this.onWatchdogReset = () => {
        };
        this.pc = 0;
        this.cycles = 0;
        this.nextInterrupt = -1;
        this.maxInterrupt = 0;
        this.reset();
      }
      reset() {
        this.SP = this.data.length - 1;
        this.pc = 0;
        this.pendingInterrupts.fill(null);
        this.nextInterrupt = -1;
        this.nextClockEvent = null;
      }
      readData(addr) {
        if (addr >= 32 && this.readHooks[addr]) {
          return this.readHooks[addr](addr);
        }
        return this.data[addr];
      }
      writeData(addr, value, mask = 255) {
        const hook = this.writeHooks[addr];
        if (hook) {
          if (hook(value, this.data[addr], addr, mask)) {
            return;
          }
        }
        this.data[addr] = value;
      }
      get SP() {
        return this.dataView.getUint16(93, true);
      }
      set SP(value) {
        this.dataView.setUint16(93, value, true);
      }
      get SREG() {
        return this.data[95];
      }
      get interruptsEnabled() {
        return this.SREG & 128 ? true : false;
      }
      setInterruptFlag(interrupt) {
        const { flagRegister, flagMask, enableRegister, enableMask } = interrupt;
        if (interrupt.inverseFlag) {
          this.data[flagRegister] &= ~flagMask;
        } else {
          this.data[flagRegister] |= flagMask;
        }
        if (this.data[enableRegister] & enableMask) {
          this.queueInterrupt(interrupt);
        }
      }
      updateInterruptEnable(interrupt, registerValue) {
        const { enableMask, flagRegister, flagMask, inverseFlag } = interrupt;
        if (registerValue & enableMask) {
          const bitSet = this.data[flagRegister] & flagMask;
          if (inverseFlag ? !bitSet : bitSet) {
            this.queueInterrupt(interrupt);
          }
        } else {
          this.clearInterrupt(interrupt, false);
        }
      }
      queueInterrupt(interrupt) {
        const { address } = interrupt;
        this.pendingInterrupts[address] = interrupt;
        if (this.nextInterrupt === -1 || this.nextInterrupt > address) {
          this.nextInterrupt = address;
        }
        if (address > this.maxInterrupt) {
          this.maxInterrupt = address;
        }
      }
      clearInterrupt({ address, flagRegister, flagMask }, clearFlag = true) {
        if (clearFlag) {
          this.data[flagRegister] &= ~flagMask;
        }
        const { pendingInterrupts, maxInterrupt } = this;
        if (!pendingInterrupts[address]) {
          return;
        }
        pendingInterrupts[address] = null;
        if (this.nextInterrupt === address) {
          this.nextInterrupt = -1;
          for (let i = address + 1; i <= maxInterrupt; i++) {
            if (pendingInterrupts[i]) {
              this.nextInterrupt = i;
              break;
            }
          }
        }
      }
      clearInterruptByFlag(interrupt, registerValue) {
        const { flagRegister, flagMask } = interrupt;
        if (registerValue & flagMask) {
          this.data[flagRegister] &= ~flagMask;
          this.clearInterrupt(interrupt);
        }
      }
      addClockEvent(callback, cycles) {
        const { clockEventPool } = this;
        cycles = this.cycles + Math.max(1, cycles);
        const maybeEntry = clockEventPool.pop();
        const entry = maybeEntry !== null && maybeEntry !== void 0 ? maybeEntry : { cycles, callback, next: null };
        entry.cycles = cycles;
        entry.callback = callback;
        let { nextClockEvent: clockEvent } = this;
        let lastItem = null;
        while (clockEvent && clockEvent.cycles < cycles) {
          lastItem = clockEvent;
          clockEvent = clockEvent.next;
        }
        if (lastItem) {
          lastItem.next = entry;
          entry.next = clockEvent;
        } else {
          this.nextClockEvent = entry;
          entry.next = clockEvent;
        }
        return callback;
      }
      updateClockEvent(callback, cycles) {
        if (this.clearClockEvent(callback)) {
          this.addClockEvent(callback, cycles);
          return true;
        }
        return false;
      }
      clearClockEvent(callback) {
        let { nextClockEvent: clockEvent } = this;
        if (!clockEvent) {
          return false;
        }
        const { clockEventPool } = this;
        let lastItem = null;
        while (clockEvent) {
          if (clockEvent.callback === callback) {
            if (lastItem) {
              lastItem.next = clockEvent.next;
            } else {
              this.nextClockEvent = clockEvent.next;
            }
            if (clockEventPool.length < 10) {
              clockEventPool.push(clockEvent);
            }
            return true;
          }
          lastItem = clockEvent;
          clockEvent = clockEvent.next;
        }
        return false;
      }
      tick() {
        const { nextClockEvent } = this;
        if (nextClockEvent && nextClockEvent.cycles <= this.cycles) {
          nextClockEvent.callback();
          this.nextClockEvent = nextClockEvent.next;
          if (this.clockEventPool.length < 10) {
            this.clockEventPool.push(nextClockEvent);
          }
        }
        const { nextInterrupt } = this;
        if (this.interruptsEnabled && nextInterrupt >= 0) {
          const interrupt = this.pendingInterrupts[nextInterrupt];
          (0, interrupt_1.avrInterrupt)(this, interrupt.address);
          if (!interrupt.constant) {
            this.clearInterrupt(interrupt);
          }
        }
      }
    };
    exports.CPU = CPU2;
  }
});

// node_modules/avr8js/dist/cjs/cpu/instruction.js
var require_instruction = __commonJS({
  "node_modules/avr8js/dist/cjs/cpu/instruction.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.avrInstruction = avrInstruction2;
    function isTwoWordInstruction(opcode) {
      return (
        /* LDS */
        (opcode & 65039) === 36864 || /* STS */
        (opcode & 65039) === 37376 || /* CALL */
        (opcode & 65038) === 37902 || /* JMP */
        (opcode & 65038) === 37900
      );
    }
    function avrInstruction2(cpu) {
      const opcode = cpu.progMem[cpu.pc];
      if ((opcode & 64512) === 7168) {
        const d = cpu.data[(opcode & 496) >> 4];
        const r = cpu.data[opcode & 15 | (opcode & 512) >> 5];
        const sum = d + r + (cpu.data[95] & 1);
        const R = sum & 255;
        cpu.data[(opcode & 496) >> 4] = R;
        let sreg = cpu.data[95] & 192;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= (R ^ r) & (d ^ R) & 128 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= sum & 256 ? 1 : 0;
        sreg |= 1 & (d & r | r & ~R | ~R & d) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 64512) === 3072) {
        const d = cpu.data[(opcode & 496) >> 4];
        const r = cpu.data[opcode & 15 | (opcode & 512) >> 5];
        const R = d + r & 255;
        cpu.data[(opcode & 496) >> 4] = R;
        let sreg = cpu.data[95] & 192;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= (R ^ r) & (R ^ d) & 128 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= d + r & 256 ? 1 : 0;
        sreg |= 1 & (d & r | r & ~R | ~R & d) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 65280) === 38400) {
        const addr = 2 * ((opcode & 48) >> 4) + 24;
        const value = cpu.dataView.getUint16(addr, true);
        const R = value + (opcode & 15 | (opcode & 192) >> 2) & 65535;
        cpu.dataView.setUint16(addr, R, true);
        let sreg = cpu.data[95] & 224;
        sreg |= R ? 0 : 2;
        sreg |= 32768 & R ? 4 : 0;
        sreg |= ~value & R & 32768 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= ~R & value & 32768 ? 1 : 0;
        cpu.data[95] = sreg;
        cpu.cycles++;
      } else if ((opcode & 64512) === 8192) {
        const R = cpu.data[(opcode & 496) >> 4] & cpu.data[opcode & 15 | (opcode & 512) >> 5];
        cpu.data[(opcode & 496) >> 4] = R;
        let sreg = cpu.data[95] & 225;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 61440) === 28672) {
        const R = cpu.data[((opcode & 240) >> 4) + 16] & (opcode & 15 | (opcode & 3840) >> 4);
        cpu.data[((opcode & 240) >> 4) + 16] = R;
        let sreg = cpu.data[95] & 225;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 65039) === 37893) {
        const value = cpu.data[(opcode & 496) >> 4];
        const R = value >>> 1 | 128 & value;
        cpu.data[(opcode & 496) >> 4] = R;
        let sreg = cpu.data[95] & 224;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= value & 1;
        sreg |= sreg >> 2 & 1 ^ sreg & 1 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 65423) === 38024) {
        cpu.data[95] &= ~(1 << ((opcode & 112) >> 4));
      } else if ((opcode & 65032) === 63488) {
        const b = opcode & 7;
        const d = (opcode & 496) >> 4;
        cpu.data[d] = ~(1 << b) & cpu.data[d] | (cpu.data[95] >> 6 & 1) << b;
      } else if ((opcode & 64512) === 62464) {
        if (!(cpu.data[95] & 1 << (opcode & 7))) {
          cpu.pc = cpu.pc + (((opcode & 504) >> 3) - (opcode & 512 ? 64 : 0));
          cpu.cycles++;
        }
      } else if ((opcode & 64512) === 61440) {
        if (cpu.data[95] & 1 << (opcode & 7)) {
          cpu.pc = cpu.pc + (((opcode & 504) >> 3) - (opcode & 512 ? 64 : 0));
          cpu.cycles++;
        }
      } else if ((opcode & 65423) === 37896) {
        cpu.data[95] |= 1 << ((opcode & 112) >> 4);
      } else if ((opcode & 65032) === 64e3) {
        const d = cpu.data[(opcode & 496) >> 4];
        const b = opcode & 7;
        cpu.data[95] = cpu.data[95] & 191 | (d >> b & 1 ? 64 : 0);
      } else if ((opcode & 65038) === 37902) {
        const k = cpu.progMem[cpu.pc + 1] | (opcode & 1) << 16 | (opcode & 496) << 13;
        const ret = cpu.pc + 2;
        const sp = cpu.dataView.getUint16(93, true);
        const { pc22Bits } = cpu;
        cpu.data[sp] = 255 & ret;
        cpu.data[sp - 1] = ret >> 8 & 255;
        if (pc22Bits) {
          cpu.data[sp - 2] = ret >> 16 & 255;
        }
        cpu.dataView.setUint16(93, sp - (pc22Bits ? 3 : 2), true);
        cpu.pc = k - 1;
        cpu.cycles += pc22Bits ? 4 : 3;
      } else if ((opcode & 65280) === 38912) {
        const A = opcode & 248;
        const b = opcode & 7;
        const R = cpu.readData((A >> 3) + 32);
        const mask = 1 << b;
        cpu.writeData((A >> 3) + 32, R & ~mask, mask);
      } else if ((opcode & 65039) === 37888) {
        const d = (opcode & 496) >> 4;
        const R = 255 - cpu.data[d];
        cpu.data[d] = R;
        let sreg = cpu.data[95] & 225 | 1;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 64512) === 5120) {
        const val1 = cpu.data[(opcode & 496) >> 4];
        const val2 = cpu.data[opcode & 15 | (opcode & 512) >> 5];
        const R = val1 - val2;
        let sreg = cpu.data[95] & 192;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= 0 !== ((val1 ^ val2) & (val1 ^ R) & 128) ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= val2 > val1 ? 1 : 0;
        sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 64512) === 1024) {
        const arg1 = cpu.data[(opcode & 496) >> 4];
        const arg2 = cpu.data[opcode & 15 | (opcode & 512) >> 5];
        let sreg = cpu.data[95];
        const r = arg1 - arg2 - (sreg & 1);
        sreg = sreg & 192 | (!r && sreg >> 1 & 1 ? 2 : 0) | (arg2 + (sreg & 1) > arg1 ? 1 : 0);
        sreg |= 128 & r ? 4 : 0;
        sreg |= (arg1 ^ arg2) & (arg1 ^ r) & 128 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= 1 & (~arg1 & arg2 | arg2 & r | r & ~arg1) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 61440) === 12288) {
        const arg1 = cpu.data[((opcode & 240) >> 4) + 16];
        const arg2 = opcode & 15 | (opcode & 3840) >> 4;
        const r = arg1 - arg2;
        let sreg = cpu.data[95] & 192;
        sreg |= r ? 0 : 2;
        sreg |= 128 & r ? 4 : 0;
        sreg |= (arg1 ^ arg2) & (arg1 ^ r) & 128 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= arg2 > arg1 ? 1 : 0;
        sreg |= 1 & (~arg1 & arg2 | arg2 & r | r & ~arg1) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 64512) === 4096) {
        if (cpu.data[(opcode & 496) >> 4] === cpu.data[opcode & 15 | (opcode & 512) >> 5]) {
          const nextOpcode = cpu.progMem[cpu.pc + 1];
          const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
          cpu.pc += skipSize;
          cpu.cycles += skipSize;
        }
      } else if ((opcode & 65039) === 37898) {
        const value = cpu.data[(opcode & 496) >> 4];
        const R = value - 1;
        cpu.data[(opcode & 496) >> 4] = R;
        let sreg = cpu.data[95] & 225;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= 128 === value ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if (opcode === 38169) {
        const retAddr = cpu.pc + 1;
        const sp = cpu.dataView.getUint16(93, true);
        const eind = cpu.data[92];
        cpu.data[sp] = retAddr & 255;
        cpu.data[sp - 1] = retAddr >> 8 & 255;
        cpu.data[sp - 2] = retAddr >> 16 & 255;
        cpu.dataView.setUint16(93, sp - 3, true);
        cpu.pc = (eind << 16 | cpu.dataView.getUint16(30, true)) - 1;
        cpu.cycles += 3;
      } else if (opcode === 37913) {
        const eind = cpu.data[92];
        cpu.pc = (eind << 16 | cpu.dataView.getUint16(30, true)) - 1;
        cpu.cycles++;
      } else if (opcode === 38360) {
        const rampz = cpu.data[91];
        cpu.data[0] = cpu.progBytes[rampz << 16 | cpu.dataView.getUint16(30, true)];
        cpu.cycles += 2;
      } else if ((opcode & 65039) === 36870) {
        const rampz = cpu.data[91];
        cpu.data[(opcode & 496) >> 4] = cpu.progBytes[rampz << 16 | cpu.dataView.getUint16(30, true)];
        cpu.cycles += 2;
      } else if ((opcode & 65039) === 36871) {
        const rampz = cpu.data[91];
        const i = cpu.dataView.getUint16(30, true);
        cpu.data[(opcode & 496) >> 4] = cpu.progBytes[rampz << 16 | i];
        cpu.dataView.setUint16(30, i + 1, true);
        if (i === 65535) {
          cpu.data[91] = (rampz + 1) % (cpu.progBytes.length >> 16);
        }
        cpu.cycles += 2;
      } else if ((opcode & 64512) === 9216) {
        const R = cpu.data[(opcode & 496) >> 4] ^ cpu.data[opcode & 15 | (opcode & 512) >> 5];
        cpu.data[(opcode & 496) >> 4] = R;
        let sreg = cpu.data[95] & 225;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 65416) === 776) {
        const v1 = cpu.data[((opcode & 112) >> 4) + 16];
        const v2 = cpu.data[(opcode & 7) + 16];
        const R = v1 * v2 << 1;
        cpu.dataView.setUint16(0, R, true);
        cpu.data[95] = cpu.data[95] & 252 | (65535 & R ? 0 : 2) | (v1 * v2 & 32768 ? 1 : 0);
        cpu.cycles++;
      } else if ((opcode & 65416) === 896) {
        const v1 = cpu.dataView.getInt8(((opcode & 112) >> 4) + 16);
        const v2 = cpu.dataView.getInt8((opcode & 7) + 16);
        const R = v1 * v2 << 1;
        cpu.dataView.setInt16(0, R, true);
        cpu.data[95] = cpu.data[95] & 252 | (65535 & R ? 0 : 2) | (v1 * v2 & 32768 ? 1 : 0);
        cpu.cycles++;
      } else if ((opcode & 65416) === 904) {
        const v1 = cpu.dataView.getInt8(((opcode & 112) >> 4) + 16);
        const v2 = cpu.data[(opcode & 7) + 16];
        const R = v1 * v2 << 1;
        cpu.dataView.setInt16(0, R, true);
        cpu.data[95] = cpu.data[95] & 252 | (65535 & R ? 2 : 0) | (v1 * v2 & 32768 ? 1 : 0);
        cpu.cycles++;
      } else if (opcode === 38153) {
        const retAddr = cpu.pc + 1;
        const sp = cpu.dataView.getUint16(93, true);
        const { pc22Bits } = cpu;
        cpu.data[sp] = retAddr & 255;
        cpu.data[sp - 1] = retAddr >> 8 & 255;
        if (pc22Bits) {
          cpu.data[sp - 2] = retAddr >> 16 & 255;
        }
        cpu.dataView.setUint16(93, sp - (pc22Bits ? 3 : 2), true);
        cpu.pc = cpu.dataView.getUint16(30, true) - 1;
        cpu.cycles += pc22Bits ? 3 : 2;
      } else if (opcode === 37897) {
        cpu.pc = cpu.dataView.getUint16(30, true) - 1;
        cpu.cycles++;
      } else if ((opcode & 63488) === 45056) {
        const i = cpu.readData((opcode & 15 | (opcode & 1536) >> 5) + 32);
        cpu.data[(opcode & 496) >> 4] = i;
      } else if ((opcode & 65039) === 37891) {
        const d = cpu.data[(opcode & 496) >> 4];
        const r = d + 1 & 255;
        cpu.data[(opcode & 496) >> 4] = r;
        let sreg = cpu.data[95] & 225;
        sreg |= r ? 0 : 2;
        sreg |= 128 & r ? 4 : 0;
        sreg |= 127 === d ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 65038) === 37900) {
        cpu.pc = (cpu.progMem[cpu.pc + 1] | (opcode & 1) << 16 | (opcode & 496) << 13) - 1;
        cpu.cycles += 2;
      } else if ((opcode & 65039) === 37382) {
        const r = (opcode & 496) >> 4;
        const clear = cpu.data[r];
        const value = cpu.readData(cpu.dataView.getUint16(30, true));
        cpu.writeData(cpu.dataView.getUint16(30, true), value & 255 - clear);
        cpu.data[r] = value;
      } else if ((opcode & 65039) === 37381) {
        const r = (opcode & 496) >> 4;
        const set = cpu.data[r];
        const value = cpu.readData(cpu.dataView.getUint16(30, true));
        cpu.writeData(cpu.dataView.getUint16(30, true), value | set);
        cpu.data[r] = value;
      } else if ((opcode & 65039) === 37383) {
        const r = cpu.data[(opcode & 496) >> 4];
        const R = cpu.readData(cpu.dataView.getUint16(30, true));
        cpu.writeData(cpu.dataView.getUint16(30, true), r ^ R);
        cpu.data[(opcode & 496) >> 4] = R;
      } else if ((opcode & 61440) === 57344) {
        cpu.data[((opcode & 240) >> 4) + 16] = opcode & 15 | (opcode & 3840) >> 4;
      } else if ((opcode & 65039) === 36864) {
        cpu.cycles++;
        const value = cpu.readData(cpu.progMem[cpu.pc + 1]);
        cpu.data[(opcode & 496) >> 4] = value;
        cpu.pc++;
      } else if ((opcode & 65039) === 36876) {
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(cpu.dataView.getUint16(26, true));
      } else if ((opcode & 65039) === 36877) {
        const x = cpu.dataView.getUint16(26, true);
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(x);
        cpu.dataView.setUint16(26, x + 1, true);
      } else if ((opcode & 65039) === 36878) {
        const x = cpu.dataView.getUint16(26, true) - 1;
        cpu.dataView.setUint16(26, x, true);
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(x);
      } else if ((opcode & 65039) === 32776) {
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(cpu.dataView.getUint16(28, true));
      } else if ((opcode & 65039) === 36873) {
        const y = cpu.dataView.getUint16(28, true);
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(y);
        cpu.dataView.setUint16(28, y + 1, true);
      } else if ((opcode & 65039) === 36874) {
        const y = cpu.dataView.getUint16(28, true) - 1;
        cpu.dataView.setUint16(28, y, true);
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(y);
      } else if ((opcode & 53768) === 32776 && opcode & 7 | (opcode & 3072) >> 7 | (opcode & 8192) >> 8) {
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(cpu.dataView.getUint16(28, true) + (opcode & 7 | (opcode & 3072) >> 7 | (opcode & 8192) >> 8));
      } else if ((opcode & 65039) === 32768) {
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(cpu.dataView.getUint16(30, true));
      } else if ((opcode & 65039) === 36865) {
        const z = cpu.dataView.getUint16(30, true);
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(z);
        cpu.dataView.setUint16(30, z + 1, true);
      } else if ((opcode & 65039) === 36866) {
        const z = cpu.dataView.getUint16(30, true) - 1;
        cpu.dataView.setUint16(30, z, true);
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(z);
      } else if ((opcode & 53768) === 32768 && opcode & 7 | (opcode & 3072) >> 7 | (opcode & 8192) >> 8) {
        cpu.cycles++;
        cpu.data[(opcode & 496) >> 4] = cpu.readData(cpu.dataView.getUint16(30, true) + (opcode & 7 | (opcode & 3072) >> 7 | (opcode & 8192) >> 8));
      } else if (opcode === 38344) {
        cpu.data[0] = cpu.progBytes[cpu.dataView.getUint16(30, true)];
        cpu.cycles += 2;
      } else if ((opcode & 65039) === 36868) {
        cpu.data[(opcode & 496) >> 4] = cpu.progBytes[cpu.dataView.getUint16(30, true)];
        cpu.cycles += 2;
      } else if ((opcode & 65039) === 36869) {
        const i = cpu.dataView.getUint16(30, true);
        cpu.data[(opcode & 496) >> 4] = cpu.progBytes[i];
        cpu.dataView.setUint16(30, i + 1, true);
        cpu.cycles += 2;
      } else if ((opcode & 65039) === 37894) {
        const value = cpu.data[(opcode & 496) >> 4];
        const R = value >>> 1;
        cpu.data[(opcode & 496) >> 4] = R;
        let sreg = cpu.data[95] & 224;
        sreg |= R ? 0 : 2;
        sreg |= value & 1;
        sreg |= sreg >> 2 & 1 ^ sreg & 1 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 64512) === 11264) {
        cpu.data[(opcode & 496) >> 4] = cpu.data[opcode & 15 | (opcode & 512) >> 5];
      } else if ((opcode & 65280) === 256) {
        const r2 = 2 * (opcode & 15);
        const d2 = 2 * ((opcode & 240) >> 4);
        cpu.data[d2] = cpu.data[r2];
        cpu.data[d2 + 1] = cpu.data[r2 + 1];
      } else if ((opcode & 64512) === 39936) {
        const R = cpu.data[(opcode & 496) >> 4] * cpu.data[opcode & 15 | (opcode & 512) >> 5];
        cpu.dataView.setUint16(0, R, true);
        cpu.data[95] = cpu.data[95] & 252 | (65535 & R ? 0 : 2) | (32768 & R ? 1 : 0);
        cpu.cycles++;
      } else if ((opcode & 65280) === 512) {
        const R = cpu.dataView.getInt8(((opcode & 240) >> 4) + 16) * cpu.dataView.getInt8((opcode & 15) + 16);
        cpu.dataView.setInt16(0, R, true);
        cpu.data[95] = cpu.data[95] & 252 | (65535 & R ? 0 : 2) | (32768 & R ? 1 : 0);
        cpu.cycles++;
      } else if ((opcode & 65416) === 768) {
        const R = cpu.dataView.getInt8(((opcode & 112) >> 4) + 16) * cpu.data[(opcode & 7) + 16];
        cpu.dataView.setInt16(0, R, true);
        cpu.data[95] = cpu.data[95] & 252 | (65535 & R ? 0 : 2) | (32768 & R ? 1 : 0);
        cpu.cycles++;
      } else if ((opcode & 65039) === 37889) {
        const d = (opcode & 496) >> 4;
        const value = cpu.data[d];
        const R = 0 - value;
        cpu.data[d] = R;
        let sreg = cpu.data[95] & 192;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= 128 === R ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= R ? 1 : 0;
        sreg |= 1 & (R | value) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if (opcode === 0) {
      } else if ((opcode & 64512) === 10240) {
        const R = cpu.data[(opcode & 496) >> 4] | cpu.data[opcode & 15 | (opcode & 512) >> 5];
        cpu.data[(opcode & 496) >> 4] = R;
        let sreg = cpu.data[95] & 225;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 61440) === 24576) {
        const R = cpu.data[((opcode & 240) >> 4) + 16] | (opcode & 15 | (opcode & 3840) >> 4);
        cpu.data[((opcode & 240) >> 4) + 16] = R;
        let sreg = cpu.data[95] & 225;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 63488) === 47104) {
        cpu.writeData((opcode & 15 | (opcode & 1536) >> 5) + 32, cpu.data[(opcode & 496) >> 4]);
      } else if ((opcode & 65039) === 36879) {
        const value = cpu.dataView.getUint16(93, true) + 1;
        cpu.dataView.setUint16(93, value, true);
        cpu.data[(opcode & 496) >> 4] = cpu.data[value];
        cpu.cycles++;
      } else if ((opcode & 65039) === 37391) {
        const value = cpu.dataView.getUint16(93, true);
        cpu.data[value] = cpu.data[(opcode & 496) >> 4];
        cpu.dataView.setUint16(93, value - 1, true);
        cpu.cycles++;
      } else if ((opcode & 61440) === 53248) {
        const k = (opcode & 2047) - (opcode & 2048 ? 2048 : 0);
        const retAddr = cpu.pc + 1;
        const sp = cpu.dataView.getUint16(93, true);
        const { pc22Bits } = cpu;
        cpu.data[sp] = 255 & retAddr;
        cpu.data[sp - 1] = retAddr >> 8 & 255;
        if (pc22Bits) {
          cpu.data[sp - 2] = retAddr >> 16 & 255;
        }
        cpu.dataView.setUint16(93, sp - (pc22Bits ? 3 : 2), true);
        cpu.pc += k;
        cpu.cycles += pc22Bits ? 3 : 2;
      } else if (opcode === 38152) {
        const { pc22Bits } = cpu;
        const i = cpu.dataView.getUint16(93, true) + (pc22Bits ? 3 : 2);
        cpu.dataView.setUint16(93, i, true);
        cpu.pc = (cpu.data[i - 1] << 8) + cpu.data[i] - 1;
        if (pc22Bits) {
          cpu.pc |= cpu.data[i - 2] << 16;
        }
        cpu.cycles += pc22Bits ? 4 : 3;
      } else if (opcode === 38168) {
        const { pc22Bits } = cpu;
        const i = cpu.dataView.getUint16(93, true) + (pc22Bits ? 3 : 2);
        cpu.dataView.setUint16(93, i, true);
        cpu.pc = (cpu.data[i - 1] << 8) + cpu.data[i] - 1;
        if (pc22Bits) {
          cpu.pc |= cpu.data[i - 2] << 16;
        }
        cpu.cycles += pc22Bits ? 4 : 3;
        cpu.data[95] |= 128;
      } else if ((opcode & 61440) === 49152) {
        cpu.pc = cpu.pc + ((opcode & 2047) - (opcode & 2048 ? 2048 : 0));
        cpu.cycles++;
      } else if ((opcode & 65039) === 37895) {
        const d = cpu.data[(opcode & 496) >> 4];
        const r = d >>> 1 | (cpu.data[95] & 1) << 7;
        cpu.data[(opcode & 496) >> 4] = r;
        let sreg = cpu.data[95] & 224;
        sreg |= r ? 0 : 2;
        sreg |= 128 & r ? 4 : 0;
        sreg |= 1 & d ? 1 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg & 1 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 64512) === 2048) {
        const val1 = cpu.data[(opcode & 496) >> 4];
        const val2 = cpu.data[opcode & 15 | (opcode & 512) >> 5];
        let sreg = cpu.data[95];
        const R = val1 - val2 - (sreg & 1);
        cpu.data[(opcode & 496) >> 4] = R;
        sreg = sreg & 192 | (!R && sreg >> 1 & 1 ? 2 : 0) | (val2 + (sreg & 1) > val1 ? 1 : 0);
        sreg |= 128 & R ? 4 : 0;
        sreg |= (val1 ^ val2) & (val1 ^ R) & 128 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 61440) === 16384) {
        const val1 = cpu.data[((opcode & 240) >> 4) + 16];
        const val2 = opcode & 15 | (opcode & 3840) >> 4;
        let sreg = cpu.data[95];
        const R = val1 - val2 - (sreg & 1);
        cpu.data[((opcode & 240) >> 4) + 16] = R;
        sreg = sreg & 192 | (!R && sreg >> 1 & 1 ? 2 : 0) | (val2 + (sreg & 1) > val1 ? 1 : 0);
        sreg |= 128 & R ? 4 : 0;
        sreg |= (val1 ^ val2) & (val1 ^ R) & 128 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 65280) === 39424) {
        const target = ((opcode & 248) >> 3) + 32;
        const mask = 1 << (opcode & 7);
        cpu.writeData(target, cpu.readData(target) | mask, mask);
        cpu.cycles++;
      } else if ((opcode & 65280) === 39168) {
        const value = cpu.readData(((opcode & 248) >> 3) + 32);
        if (!(value & 1 << (opcode & 7))) {
          const nextOpcode = cpu.progMem[cpu.pc + 1];
          const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
          cpu.cycles += skipSize;
          cpu.pc += skipSize;
        }
      } else if ((opcode & 65280) === 39680) {
        const value = cpu.readData(((opcode & 248) >> 3) + 32);
        if (value & 1 << (opcode & 7)) {
          const nextOpcode = cpu.progMem[cpu.pc + 1];
          const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
          cpu.cycles += skipSize;
          cpu.pc += skipSize;
        }
      } else if ((opcode & 65280) === 38656) {
        const i = 2 * ((opcode & 48) >> 4) + 24;
        const a = cpu.dataView.getUint16(i, true);
        const l = opcode & 15 | (opcode & 192) >> 2;
        const R = a - l;
        cpu.dataView.setUint16(i, R, true);
        let sreg = cpu.data[95] & 192;
        sreg |= R ? 0 : 2;
        sreg |= 32768 & R ? 4 : 0;
        sreg |= a & ~R & 32768 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= l > a ? 1 : 0;
        sreg |= 1 & (~a & l | l & R | R & ~a) ? 32 : 0;
        cpu.data[95] = sreg;
        cpu.cycles++;
      } else if ((opcode & 65032) === 64512) {
        if (!(cpu.data[(opcode & 496) >> 4] & 1 << (opcode & 7))) {
          const nextOpcode = cpu.progMem[cpu.pc + 1];
          const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
          cpu.cycles += skipSize;
          cpu.pc += skipSize;
        }
      } else if ((opcode & 65032) === 65024) {
        if (cpu.data[(opcode & 496) >> 4] & 1 << (opcode & 7)) {
          const nextOpcode = cpu.progMem[cpu.pc + 1];
          const skipSize = isTwoWordInstruction(nextOpcode) ? 2 : 1;
          cpu.cycles += skipSize;
          cpu.pc += skipSize;
        }
      } else if (opcode === 38280) {
      } else if (opcode === 38376) {
      } else if (opcode === 38392) {
      } else if ((opcode & 65039) === 37376) {
        const value = cpu.data[(opcode & 496) >> 4];
        const addr = cpu.progMem[cpu.pc + 1];
        cpu.writeData(addr, value);
        cpu.pc++;
        cpu.cycles++;
      } else if ((opcode & 65039) === 37388) {
        cpu.writeData(cpu.dataView.getUint16(26, true), cpu.data[(opcode & 496) >> 4]);
        cpu.cycles++;
      } else if ((opcode & 65039) === 37389) {
        const x = cpu.dataView.getUint16(26, true);
        cpu.writeData(x, cpu.data[(opcode & 496) >> 4]);
        cpu.dataView.setUint16(26, x + 1, true);
        cpu.cycles++;
      } else if ((opcode & 65039) === 37390) {
        const i = cpu.data[(opcode & 496) >> 4];
        const x = cpu.dataView.getUint16(26, true) - 1;
        cpu.dataView.setUint16(26, x, true);
        cpu.writeData(x, i);
        cpu.cycles++;
      } else if ((opcode & 65039) === 33288) {
        cpu.writeData(cpu.dataView.getUint16(28, true), cpu.data[(opcode & 496) >> 4]);
        cpu.cycles++;
      } else if ((opcode & 65039) === 37385) {
        const i = cpu.data[(opcode & 496) >> 4];
        const y = cpu.dataView.getUint16(28, true);
        cpu.writeData(y, i);
        cpu.dataView.setUint16(28, y + 1, true);
        cpu.cycles++;
      } else if ((opcode & 65039) === 37386) {
        const i = cpu.data[(opcode & 496) >> 4];
        const y = cpu.dataView.getUint16(28, true) - 1;
        cpu.dataView.setUint16(28, y, true);
        cpu.writeData(y, i);
        cpu.cycles++;
      } else if ((opcode & 53768) === 33288 && opcode & 7 | (opcode & 3072) >> 7 | (opcode & 8192) >> 8) {
        cpu.writeData(cpu.dataView.getUint16(28, true) + (opcode & 7 | (opcode & 3072) >> 7 | (opcode & 8192) >> 8), cpu.data[(opcode & 496) >> 4]);
        cpu.cycles++;
      } else if ((opcode & 65039) === 33280) {
        cpu.writeData(cpu.dataView.getUint16(30, true), cpu.data[(opcode & 496) >> 4]);
        cpu.cycles++;
      } else if ((opcode & 65039) === 37377) {
        const z = cpu.dataView.getUint16(30, true);
        cpu.writeData(z, cpu.data[(opcode & 496) >> 4]);
        cpu.dataView.setUint16(30, z + 1, true);
        cpu.cycles++;
      } else if ((opcode & 65039) === 37378) {
        const i = cpu.data[(opcode & 496) >> 4];
        const z = cpu.dataView.getUint16(30, true) - 1;
        cpu.dataView.setUint16(30, z, true);
        cpu.writeData(z, i);
        cpu.cycles++;
      } else if ((opcode & 53768) === 33280 && opcode & 7 | (opcode & 3072) >> 7 | (opcode & 8192) >> 8) {
        cpu.writeData(cpu.dataView.getUint16(30, true) + (opcode & 7 | (opcode & 3072) >> 7 | (opcode & 8192) >> 8), cpu.data[(opcode & 496) >> 4]);
        cpu.cycles++;
      } else if ((opcode & 64512) === 6144) {
        const val1 = cpu.data[(opcode & 496) >> 4];
        const val2 = cpu.data[opcode & 15 | (opcode & 512) >> 5];
        const R = val1 - val2;
        cpu.data[(opcode & 496) >> 4] = R;
        let sreg = cpu.data[95] & 192;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= (val1 ^ val2) & (val1 ^ R) & 128 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= val2 > val1 ? 1 : 0;
        sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 61440) === 20480) {
        const val1 = cpu.data[((opcode & 240) >> 4) + 16];
        const val2 = opcode & 15 | (opcode & 3840) >> 4;
        const R = val1 - val2;
        cpu.data[((opcode & 240) >> 4) + 16] = R;
        let sreg = cpu.data[95] & 192;
        sreg |= R ? 0 : 2;
        sreg |= 128 & R ? 4 : 0;
        sreg |= (val1 ^ val2) & (val1 ^ R) & 128 ? 8 : 0;
        sreg |= sreg >> 2 & 1 ^ sreg >> 3 & 1 ? 16 : 0;
        sreg |= val2 > val1 ? 1 : 0;
        sreg |= 1 & (~val1 & val2 | val2 & R | R & ~val1) ? 32 : 0;
        cpu.data[95] = sreg;
      } else if ((opcode & 65039) === 37890) {
        const d = (opcode & 496) >> 4;
        const i = cpu.data[d];
        cpu.data[d] = (15 & i) << 4 | (240 & i) >>> 4;
      } else if (opcode === 38312) {
        cpu.onWatchdogReset();
      } else if ((opcode & 65039) === 37380) {
        const r = (opcode & 496) >> 4;
        const val1 = cpu.data[r];
        const val2 = cpu.data[cpu.dataView.getUint16(30, true)];
        cpu.data[cpu.dataView.getUint16(30, true)] = val1;
        cpu.data[r] = val2;
      }
      cpu.pc = (cpu.pc + 1) % cpu.progMem.length;
      cpu.cycles++;
    }
  }
});

// node_modules/avr8js/dist/cjs/peripherals/adc.js
var require_adc = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/adc.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVRADC = exports.adcConfig = exports.atmega328Channels = exports.ADCMuxInputType = exports.ADCReference = void 0;
    var ADCReference;
    (function(ADCReference2) {
      ADCReference2[ADCReference2["AVCC"] = 0] = "AVCC";
      ADCReference2[ADCReference2["AREF"] = 1] = "AREF";
      ADCReference2[ADCReference2["Internal1V1"] = 2] = "Internal1V1";
      ADCReference2[ADCReference2["Internal2V56"] = 3] = "Internal2V56";
      ADCReference2[ADCReference2["Reserved"] = 4] = "Reserved";
    })(ADCReference || (exports.ADCReference = ADCReference = {}));
    var ADCMuxInputType;
    (function(ADCMuxInputType2) {
      ADCMuxInputType2[ADCMuxInputType2["SingleEnded"] = 0] = "SingleEnded";
      ADCMuxInputType2[ADCMuxInputType2["Differential"] = 1] = "Differential";
      ADCMuxInputType2[ADCMuxInputType2["Constant"] = 2] = "Constant";
      ADCMuxInputType2[ADCMuxInputType2["Temperature"] = 3] = "Temperature";
    })(ADCMuxInputType || (exports.ADCMuxInputType = ADCMuxInputType = {}));
    exports.atmega328Channels = {
      0: { type: ADCMuxInputType.SingleEnded, channel: 0 },
      1: { type: ADCMuxInputType.SingleEnded, channel: 1 },
      2: { type: ADCMuxInputType.SingleEnded, channel: 2 },
      3: { type: ADCMuxInputType.SingleEnded, channel: 3 },
      4: { type: ADCMuxInputType.SingleEnded, channel: 4 },
      5: { type: ADCMuxInputType.SingleEnded, channel: 5 },
      6: { type: ADCMuxInputType.SingleEnded, channel: 6 },
      7: { type: ADCMuxInputType.SingleEnded, channel: 7 },
      8: { type: ADCMuxInputType.Temperature },
      14: { type: ADCMuxInputType.Constant, voltage: 1.1 },
      15: { type: ADCMuxInputType.Constant, voltage: 0 }
    };
    var fallbackMuxInput = {
      type: ADCMuxInputType.Constant,
      voltage: 0
    };
    exports.adcConfig = {
      ADMUX: 124,
      ADCSRA: 122,
      ADCSRB: 123,
      ADCL: 120,
      ADCH: 121,
      DIDR0: 126,
      adcInterrupt: 42,
      numChannels: 8,
      muxInputMask: 15,
      muxChannels: exports.atmega328Channels,
      adcReferences: [
        ADCReference.AREF,
        ADCReference.AVCC,
        ADCReference.Reserved,
        ADCReference.Internal1V1
      ]
    };
    var ADPS_MASK = 7;
    var ADIE = 8;
    var ADIF = 16;
    var ADSC = 64;
    var ADEN = 128;
    var MUX_MASK = 31;
    var ADLAR = 32;
    var MUX5 = 8;
    var REFS2 = 8;
    var REFS_MASK = 3;
    var REFS_SHIFT = 6;
    var AVRADC2 = class {
      constructor(cpu, config) {
        this.cpu = cpu;
        this.config = config;
        this.channelValues = new Array(this.config.numChannels);
        this.avcc = 5;
        this.aref = 5;
        this.onADCRead = (input) => {
          var _a;
          let voltage = 0;
          switch (input.type) {
            case ADCMuxInputType.Constant:
              voltage = input.voltage;
              break;
            case ADCMuxInputType.SingleEnded:
              voltage = (_a = this.channelValues[input.channel]) !== null && _a !== void 0 ? _a : 0;
              break;
            case ADCMuxInputType.Differential:
              voltage = input.gain * ((this.channelValues[input.positiveChannel] || 0) - (this.channelValues[input.negativeChannel] || 0));
              break;
            case ADCMuxInputType.Temperature:
              voltage = 0.378125;
              break;
          }
          const rawValue = voltage / this.referenceVoltage * 1024;
          const result = Math.min(Math.max(Math.floor(rawValue), 0), 1023);
          this.cpu.addClockEvent(() => this.completeADCRead(result), this.sampleCycles);
        };
        this.converting = false;
        this.conversionCycles = 25;
        this.ADC = {
          address: this.config.adcInterrupt,
          flagRegister: this.config.ADCSRA,
          flagMask: ADIF,
          enableRegister: this.config.ADCSRA,
          enableMask: ADIE
        };
        cpu.writeHooks[config.ADCSRA] = (value, oldValue) => {
          var _a;
          if (value & ADEN && !(oldValue & ADEN)) {
            this.conversionCycles = 25;
          }
          cpu.data[config.ADCSRA] = value;
          cpu.updateInterruptEnable(this.ADC, value);
          if (!this.converting && value & ADSC) {
            if (!(value & ADEN)) {
              this.cpu.addClockEvent(() => this.completeADCRead(0), this.sampleCycles);
              return true;
            }
            let channel = this.cpu.data[this.config.ADMUX] & MUX_MASK;
            if (cpu.data[config.ADCSRB] & MUX5) {
              channel |= 32;
            }
            channel &= config.muxInputMask;
            const muxInput = (_a = config.muxChannels[channel]) !== null && _a !== void 0 ? _a : fallbackMuxInput;
            this.converting = true;
            this.onADCRead(muxInput);
            return true;
          }
        };
      }
      completeADCRead(value) {
        const { ADCL, ADCH, ADMUX, ADCSRA } = this.config;
        this.converting = false;
        this.conversionCycles = 13;
        if (this.cpu.data[ADMUX] & ADLAR) {
          this.cpu.data[ADCL] = value << 6 & 255;
          this.cpu.data[ADCH] = value >> 2;
        } else {
          this.cpu.data[ADCL] = value & 255;
          this.cpu.data[ADCH] = value >> 8 & 3;
        }
        this.cpu.data[ADCSRA] &= ~ADSC;
        this.cpu.setInterruptFlag(this.ADC);
      }
      get prescaler() {
        const { ADCSRA } = this.config;
        const adcsra = this.cpu.data[ADCSRA];
        const adps = adcsra & ADPS_MASK;
        switch (adps) {
          case 0:
          case 1:
            return 2;
          case 2:
            return 4;
          case 3:
            return 8;
          case 4:
            return 16;
          case 5:
            return 32;
          case 6:
            return 64;
          case 7:
          default:
            return 128;
        }
      }
      get referenceVoltageType() {
        var _a;
        const { ADMUX, adcReferences } = this.config;
        let refs = this.cpu.data[ADMUX] >> REFS_SHIFT & REFS_MASK;
        if (adcReferences.length > 4 && this.cpu.data[ADMUX] & REFS2) {
          refs |= 4;
        }
        return (_a = adcReferences[refs]) !== null && _a !== void 0 ? _a : ADCReference.Reserved;
      }
      get referenceVoltage() {
        switch (this.referenceVoltageType) {
          case ADCReference.AVCC:
            return this.avcc;
          case ADCReference.AREF:
            return this.aref;
          case ADCReference.Internal1V1:
            return 1.1;
          case ADCReference.Internal2V56:
            return 2.56;
          default:
            return this.avcc;
        }
      }
      get sampleCycles() {
        return this.conversionCycles * this.prescaler;
      }
    };
    exports.AVRADC = AVRADC2;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/clock.js
var require_clock = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/clock.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVRClock = exports.clockConfig = void 0;
    var CLKPCE = 128;
    exports.clockConfig = {
      CLKPR: 97
    };
    var prescalers = [
      1,
      2,
      4,
      8,
      16,
      32,
      64,
      128,
      256,
      // The following values are "reserved" according to the datasheet, so we measured
      // with a scope to figure them out (on ATmega328p)
      2,
      4,
      8,
      16,
      32,
      64,
      128
    ];
    var AVRClock = class {
      constructor(cpu, baseFreqHz, config = exports.clockConfig) {
        this.cpu = cpu;
        this.baseFreqHz = baseFreqHz;
        this.config = config;
        this.clockEnabledCycles = 0;
        this.prescalerValue = 1;
        this.cyclesDelta = 0;
        this.cpu.writeHooks[this.config.CLKPR] = (clkpr) => {
          if ((!this.clockEnabledCycles || this.clockEnabledCycles < cpu.cycles) && clkpr === CLKPCE) {
            this.clockEnabledCycles = this.cpu.cycles + 4;
          } else if (this.clockEnabledCycles && this.clockEnabledCycles >= cpu.cycles) {
            this.clockEnabledCycles = 0;
            const index = clkpr & 15;
            const oldPrescaler = this.prescalerValue;
            this.prescalerValue = prescalers[index];
            this.cpu.data[this.config.CLKPR] = index;
            if (oldPrescaler !== this.prescalerValue) {
              this.cyclesDelta = (cpu.cycles + this.cyclesDelta) * (oldPrescaler / this.prescalerValue) - cpu.cycles;
            }
          }
          return true;
        };
      }
      get frequency() {
        return this.baseFreqHz / this.prescalerValue;
      }
      get prescaler() {
        return this.prescalerValue;
      }
      get timeNanos() {
        return (this.cpu.cycles + this.cyclesDelta) / this.frequency * 1e9;
      }
      get timeMicros() {
        return (this.cpu.cycles + this.cyclesDelta) / this.frequency * 1e6;
      }
      get timeMillis() {
        return (this.cpu.cycles + this.cyclesDelta) / this.frequency * 1e3;
      }
    };
    exports.AVRClock = AVRClock;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/eeprom.js
var require_eeprom = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/eeprom.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVREEPROM = exports.eepromConfig = exports.EEPROMMemoryBackend = void 0;
    var EEPROMMemoryBackend = class {
      constructor(size) {
        this.memory = new Uint8Array(size);
        this.memory.fill(255);
      }
      readMemory(addr) {
        return this.memory[addr];
      }
      writeMemory(addr, value) {
        this.memory[addr] &= value;
      }
      eraseMemory(addr) {
        this.memory[addr] = 255;
      }
    };
    exports.EEPROMMemoryBackend = EEPROMMemoryBackend;
    exports.eepromConfig = {
      eepromReadyInterrupt: 44,
      EECR: 63,
      EEDR: 64,
      EEARL: 65,
      EEARH: 66,
      eraseCycles: 28800,
      // 1.8ms at 16MHz
      writeCycles: 28800
      // 1.8ms at 16MHz
    };
    var EERE = 1 << 0;
    var EEPE = 1 << 1;
    var EEMPE = 1 << 2;
    var EERIE = 1 << 3;
    var EEPM0 = 1 << 4;
    var EEPM1 = 1 << 5;
    var EECR_WRITE_MASK = EEPE | EEMPE | EERIE | EEPM0 | EEPM1;
    var AVREEPROM = class {
      constructor(cpu, backend, config = exports.eepromConfig) {
        this.cpu = cpu;
        this.backend = backend;
        this.config = config;
        this.writeEnabledCycles = 0;
        this.writeCompleteCycles = 0;
        this.EER = {
          address: this.config.eepromReadyInterrupt,
          flagRegister: this.config.EECR,
          flagMask: EEPE,
          enableRegister: this.config.EECR,
          enableMask: EERIE,
          constant: true,
          inverseFlag: true
        };
        this.cpu.writeHooks[this.config.EECR] = (eecr) => {
          const { EEARH, EEARL, EECR, EEDR } = this.config;
          const addr = this.cpu.data[EEARH] << 8 | this.cpu.data[EEARL];
          this.cpu.data[EECR] = this.cpu.data[EECR] & ~EECR_WRITE_MASK | eecr & EECR_WRITE_MASK;
          this.cpu.updateInterruptEnable(this.EER, eecr);
          if (eecr & EERE) {
            this.cpu.clearInterrupt(this.EER);
          }
          if (eecr & EEMPE) {
            const eempeCycles = 4;
            this.writeEnabledCycles = this.cpu.cycles + eempeCycles;
            this.cpu.addClockEvent(() => {
              this.cpu.data[EECR] &= ~EEMPE;
            }, eempeCycles);
          }
          if (eecr & EERE) {
            this.cpu.data[EEDR] = this.backend.readMemory(addr);
            this.cpu.cycles += 4;
            return true;
          }
          if (eecr & EEPE) {
            if (this.cpu.cycles >= this.writeEnabledCycles) {
              this.cpu.data[EECR] &= ~EEPE;
              return true;
            }
            if (this.cpu.cycles < this.writeCompleteCycles) {
              return true;
            }
            const eedr = this.cpu.data[EEDR];
            this.writeCompleteCycles = this.cpu.cycles;
            if (!(eecr & EEPM1)) {
              this.backend.eraseMemory(addr);
              this.writeCompleteCycles += this.config.eraseCycles;
            }
            if (!(eecr & EEPM0)) {
              this.backend.writeMemory(addr, eedr);
              this.writeCompleteCycles += this.config.writeCycles;
            }
            this.cpu.data[EECR] |= EEPE;
            this.cpu.addClockEvent(() => {
              this.cpu.setInterruptFlag(this.EER);
            }, this.writeCompleteCycles - this.cpu.cycles);
            this.cpu.cycles += 2;
          }
          return true;
        };
      }
    };
    exports.AVREEPROM = AVREEPROM;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/gpio.js
var require_gpio = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/gpio.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVRIOPort = exports.PinOverrideMode = exports.PinState = exports.portLConfig = exports.portKConfig = exports.portJConfig = exports.portHConfig = exports.portGConfig = exports.portFConfig = exports.portEConfig = exports.portDConfig = exports.portCConfig = exports.portBConfig = exports.portAConfig = exports.PCINT2 = exports.PCINT1 = exports.PCINT0 = exports.INT1 = exports.INT0 = void 0;
    exports.INT0 = {
      EICR: 105,
      EIMSK: 61,
      EIFR: 60,
      index: 0,
      iscOffset: 0,
      interrupt: 2
    };
    exports.INT1 = {
      EICR: 105,
      EIMSK: 61,
      EIFR: 60,
      index: 1,
      iscOffset: 2,
      interrupt: 4
    };
    exports.PCINT0 = {
      PCIE: 0,
      PCICR: 104,
      PCIFR: 59,
      PCMSK: 107,
      pinChangeInterrupt: 6,
      mask: 255,
      offset: 0
    };
    exports.PCINT1 = {
      PCIE: 1,
      PCICR: 104,
      PCIFR: 59,
      PCMSK: 108,
      pinChangeInterrupt: 8,
      mask: 255,
      offset: 0
    };
    exports.PCINT2 = {
      PCIE: 2,
      PCICR: 104,
      PCIFR: 59,
      PCMSK: 109,
      pinChangeInterrupt: 10,
      mask: 255,
      offset: 0
    };
    exports.portAConfig = {
      PIN: 32,
      DDR: 33,
      PORT: 34,
      externalInterrupts: []
    };
    exports.portBConfig = {
      PIN: 35,
      DDR: 36,
      PORT: 37,
      // Interrupt settings
      pinChange: exports.PCINT0,
      externalInterrupts: []
    };
    exports.portCConfig = {
      PIN: 38,
      DDR: 39,
      PORT: 40,
      // Interrupt settings
      pinChange: exports.PCINT1,
      externalInterrupts: []
    };
    exports.portDConfig = {
      PIN: 41,
      DDR: 42,
      PORT: 43,
      // Interrupt settings
      pinChange: exports.PCINT2,
      externalInterrupts: [null, null, exports.INT0, exports.INT1]
    };
    exports.portEConfig = {
      PIN: 44,
      DDR: 45,
      PORT: 46,
      externalInterrupts: []
    };
    exports.portFConfig = {
      PIN: 47,
      DDR: 48,
      PORT: 49,
      externalInterrupts: []
    };
    exports.portGConfig = {
      PIN: 50,
      DDR: 51,
      PORT: 52,
      externalInterrupts: []
    };
    exports.portHConfig = {
      PIN: 256,
      DDR: 257,
      PORT: 258,
      externalInterrupts: []
    };
    exports.portJConfig = {
      PIN: 259,
      DDR: 260,
      PORT: 261,
      externalInterrupts: []
    };
    exports.portKConfig = {
      PIN: 262,
      DDR: 263,
      PORT: 264,
      externalInterrupts: []
    };
    exports.portLConfig = {
      PIN: 265,
      DDR: 266,
      PORT: 267,
      externalInterrupts: []
    };
    var PinState2;
    (function(PinState3) {
      PinState3[PinState3["Low"] = 0] = "Low";
      PinState3[PinState3["High"] = 1] = "High";
      PinState3[PinState3["Input"] = 2] = "Input";
      PinState3[PinState3["InputPullUp"] = 3] = "InputPullUp";
    })(PinState2 || (exports.PinState = PinState2 = {}));
    var PinOverrideMode;
    (function(PinOverrideMode2) {
      PinOverrideMode2[PinOverrideMode2["None"] = 0] = "None";
      PinOverrideMode2[PinOverrideMode2["Enable"] = 1] = "Enable";
      PinOverrideMode2[PinOverrideMode2["Set"] = 2] = "Set";
      PinOverrideMode2[PinOverrideMode2["Clear"] = 3] = "Clear";
      PinOverrideMode2[PinOverrideMode2["Toggle"] = 4] = "Toggle";
    })(PinOverrideMode || (exports.PinOverrideMode = PinOverrideMode = {}));
    var InterruptMode;
    (function(InterruptMode2) {
      InterruptMode2[InterruptMode2["LowLevel"] = 0] = "LowLevel";
      InterruptMode2[InterruptMode2["Change"] = 1] = "Change";
      InterruptMode2[InterruptMode2["FallingEdge"] = 2] = "FallingEdge";
      InterruptMode2[InterruptMode2["RisingEdge"] = 3] = "RisingEdge";
    })(InterruptMode || (InterruptMode = {}));
    var AVRIOPort2 = class {
      constructor(cpu, portConfig) {
        var _a, _b, _c, _d;
        this.cpu = cpu;
        this.portConfig = portConfig;
        this.externalClockListeners = [];
        this.listeners = [];
        this.pinValue = 0;
        this.overrideMask = 255;
        this.overrideValue = 0;
        this.lastValue = 0;
        this.lastDdr = 0;
        this.lastPin = 0;
        this.openCollector = 0;
        cpu.gpioPorts.add(this);
        cpu.gpioByPort[portConfig.PORT] = this;
        cpu.writeHooks[portConfig.DDR] = (value) => {
          const portValue = cpu.data[portConfig.PORT];
          cpu.data[portConfig.DDR] = value;
          this.writeGpio(portValue, value);
          this.updatePinRegister(value);
          return true;
        };
        cpu.writeHooks[portConfig.PORT] = (value) => {
          const ddrMask = cpu.data[portConfig.DDR];
          cpu.data[portConfig.PORT] = value;
          this.writeGpio(value, ddrMask);
          this.updatePinRegister(ddrMask);
          return true;
        };
        cpu.writeHooks[portConfig.PIN] = (value, oldValue, addr, mask) => {
          const oldPortValue = cpu.data[portConfig.PORT];
          const ddrMask = cpu.data[portConfig.DDR];
          const portValue = oldPortValue ^ value & mask;
          cpu.data[portConfig.PORT] = portValue;
          this.writeGpio(portValue, ddrMask);
          this.updatePinRegister(ddrMask);
          return true;
        };
        const { externalInterrupts } = portConfig;
        this.externalInts = externalInterrupts.map((externalConfig) => externalConfig ? {
          address: externalConfig.interrupt,
          flagRegister: externalConfig.EIFR,
          flagMask: 1 << externalConfig.index,
          enableRegister: externalConfig.EIMSK,
          enableMask: 1 << externalConfig.index
        } : null);
        const EICR = new Set(externalInterrupts.map((item) => item === null || item === void 0 ? void 0 : item.EICR));
        for (const EICRx of EICR) {
          this.attachInterruptHook(EICRx || 0);
        }
        const EIMSK = (_b = (_a = externalInterrupts.find((item) => item && item.EIMSK)) === null || _a === void 0 ? void 0 : _a.EIMSK) !== null && _b !== void 0 ? _b : 0;
        this.attachInterruptHook(EIMSK, "mask");
        const EIFR = (_d = (_c = externalInterrupts.find((item) => item && item.EIFR)) === null || _c === void 0 ? void 0 : _c.EIFR) !== null && _d !== void 0 ? _d : 0;
        this.attachInterruptHook(EIFR, "flag");
        const { pinChange } = portConfig;
        this.PCINT = pinChange ? {
          address: pinChange.pinChangeInterrupt,
          flagRegister: pinChange.PCIFR,
          flagMask: 1 << pinChange.PCIE,
          enableRegister: pinChange.PCICR,
          enableMask: 1 << pinChange.PCIE
        } : null;
        if (pinChange) {
          const { PCIFR, PCMSK } = pinChange;
          cpu.writeHooks[PCIFR] = (value) => {
            for (const gpio of this.cpu.gpioPorts) {
              const { PCINT } = gpio;
              if (PCINT) {
                cpu.clearInterruptByFlag(PCINT, value);
              }
            }
            return true;
          };
          cpu.writeHooks[PCMSK] = (value) => {
            cpu.data[PCMSK] = value;
            for (const gpio of this.cpu.gpioPorts) {
              const { PCINT } = gpio;
              if (PCINT) {
                cpu.updateInterruptEnable(PCINT, value);
              }
            }
            return true;
          };
        }
      }
      addListener(listener) {
        this.listeners.push(listener);
      }
      removeListener(listener) {
        this.listeners = this.listeners.filter((l) => l !== listener);
      }
      /**
       * Get the state of a given GPIO pin
       *
       * @param index Pin index to return from 0 to 7
       * @returns PinState.Low or PinState.High if the pin is set to output, PinState.Input if the pin is set
       *   to input, and PinState.InputPullUp if the pin is set to input and the internal pull-up resistor has
       *   been enabled.
       */
      pinState(index) {
        const ddr = this.cpu.data[this.portConfig.DDR];
        const port = this.cpu.data[this.portConfig.PORT];
        const bitMask = 1 << index;
        const openState = port & bitMask ? PinState2.InputPullUp : PinState2.Input;
        const highValue = this.openCollector & bitMask ? openState : PinState2.High;
        if (ddr & bitMask) {
          return this.lastValue & bitMask ? highValue : PinState2.Low;
        } else {
          return openState;
        }
      }
      /**
       * Sets the input value for the given pin. This is the value that
       * will be returned when reading from the PIN register.
       */
      setPin(index, value) {
        const bitMask = 1 << index;
        this.pinValue &= ~bitMask;
        if (value) {
          this.pinValue |= bitMask;
        }
        this.updatePinRegister(this.cpu.data[this.portConfig.DDR]);
      }
      /**
       * Internal method - do not call this directly!
       * Used by the timer compare output units to override GPIO pins.
       */
      timerOverridePin(pin2, mode) {
        const { cpu, portConfig } = this;
        const pinMask = 1 << pin2;
        if (mode === PinOverrideMode.None) {
          this.overrideMask |= pinMask;
          this.overrideValue &= ~pinMask;
        } else {
          this.overrideMask &= ~pinMask;
          switch (mode) {
            case PinOverrideMode.Enable:
              this.overrideValue &= ~pinMask;
              this.overrideValue |= cpu.data[portConfig.PORT] & pinMask;
              break;
            case PinOverrideMode.Set:
              this.overrideValue |= pinMask;
              break;
            case PinOverrideMode.Clear:
              this.overrideValue &= ~pinMask;
              break;
            case PinOverrideMode.Toggle:
              this.overrideValue ^= pinMask;
              break;
          }
        }
        const ddrMask = cpu.data[portConfig.DDR];
        this.writeGpio(cpu.data[portConfig.PORT], ddrMask);
        this.updatePinRegister(ddrMask);
      }
      updatePinRegister(ddr) {
        var _a, _b;
        const newPin = this.pinValue & ~ddr | this.lastValue & ddr;
        this.cpu.data[this.portConfig.PIN] = newPin;
        if (this.lastPin !== newPin) {
          for (let index = 0; index < 8; index++) {
            if ((newPin & 1 << index) !== (this.lastPin & 1 << index)) {
              const value = !!(newPin & 1 << index);
              this.toggleInterrupt(index, value);
              (_b = (_a = this.externalClockListeners)[index]) === null || _b === void 0 ? void 0 : _b.call(_a, value);
            }
          }
          this.lastPin = newPin;
        }
      }
      toggleInterrupt(pin2, risingEdge) {
        const { cpu, portConfig, externalInts, PCINT } = this;
        const { externalInterrupts, pinChange } = portConfig;
        const externalConfig = externalInterrupts[pin2];
        const external = externalInts[pin2];
        if (external && externalConfig) {
          const { EIMSK, index, EICR, iscOffset } = externalConfig;
          if (cpu.data[EIMSK] & 1 << index) {
            const configuration = cpu.data[EICR] >> iscOffset & 3;
            let generateInterrupt = false;
            external.constant = false;
            switch (configuration) {
              case InterruptMode.LowLevel:
                generateInterrupt = !risingEdge;
                external.constant = true;
                break;
              case InterruptMode.Change:
                generateInterrupt = true;
                break;
              case InterruptMode.FallingEdge:
                generateInterrupt = !risingEdge;
                break;
              case InterruptMode.RisingEdge:
                generateInterrupt = risingEdge;
                break;
            }
            if (generateInterrupt) {
              cpu.setInterruptFlag(external);
            } else if (external.constant) {
              cpu.clearInterrupt(external, true);
            }
          }
        }
        if (pinChange && PCINT && pinChange.mask & 1 << pin2) {
          const { PCMSK } = pinChange;
          if (cpu.data[PCMSK] & 1 << pin2 + pinChange.offset) {
            cpu.setInterruptFlag(PCINT);
          }
        }
      }
      attachInterruptHook(register, registerType = "other") {
        if (!register) {
          return;
        }
        const { cpu } = this;
        cpu.writeHooks[register] = (value) => {
          if (registerType !== "flag") {
            cpu.data[register] = value;
          }
          for (const gpio of cpu.gpioPorts) {
            for (const external of gpio.externalInts) {
              if (external && registerType === "mask") {
                cpu.updateInterruptEnable(external, value);
              }
              if (external && !external.constant && registerType === "flag") {
                cpu.clearInterruptByFlag(external, value);
              }
            }
            gpio.checkExternalInterrupts();
          }
          return true;
        };
      }
      checkExternalInterrupts() {
        const { cpu } = this;
        const { externalInterrupts } = this.portConfig;
        for (let pin2 = 0; pin2 < 8; pin2++) {
          const external = externalInterrupts[pin2];
          if (!external) {
            continue;
          }
          const pinValue = !!(this.lastPin & 1 << pin2);
          const { EIFR, EIMSK, index, EICR, iscOffset, interrupt } = external;
          if (!(cpu.data[EIMSK] & 1 << index) || pinValue) {
            continue;
          }
          const configuration = cpu.data[EICR] >> iscOffset & 3;
          if (configuration === InterruptMode.LowLevel) {
            cpu.queueInterrupt({
              address: interrupt,
              flagRegister: EIFR,
              flagMask: 1 << index,
              enableRegister: EIMSK,
              enableMask: 1 << index,
              constant: true
            });
          }
        }
      }
      writeGpio(value, ddr) {
        const newValue = (value & this.overrideMask | this.overrideValue) & ddr | value & ~ddr;
        const prevValue = this.lastValue;
        if (newValue !== prevValue || ddr !== this.lastDdr) {
          this.lastValue = newValue;
          this.lastDdr = ddr;
          for (const listener of this.listeners) {
            listener(newValue, prevValue);
          }
        }
      }
    };
    exports.AVRIOPort = AVRIOPort2;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/spi.js
var require_spi = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/spi.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVRSPI = exports.spiConfig = void 0;
    var SPCR_SPIE = 128;
    var SPCR_SPE = 64;
    var SPCR_DORD = 32;
    var SPCR_MSTR = 16;
    var SPCR_CPOL = 8;
    var SPCR_CPHA = 4;
    var SPCR_SPR1 = 2;
    var SPCR_SPR0 = 1;
    var SPSR_SPR_MASK = SPCR_SPR1 | SPCR_SPR0;
    var SPSR_SPIF = 128;
    var SPSR_WCOL = 64;
    var SPSR_SPI2X = 1;
    exports.spiConfig = {
      spiInterrupt: 34,
      SPCR: 76,
      SPSR: 77,
      SPDR: 78
    };
    var bitsPerByte = 8;
    var AVRSPI = class {
      constructor(cpu, config, freqHz) {
        this.cpu = cpu;
        this.config = config;
        this.freqHz = freqHz;
        this.onTransfer = () => 0;
        this.onByte = (value) => {
          const valueIn = this.onTransfer(value);
          this.cpu.addClockEvent(() => this.completeTransfer(valueIn), this.transferCycles);
        };
        this.transmissionActive = false;
        this.SPI = {
          address: this.config.spiInterrupt,
          flagRegister: this.config.SPSR,
          flagMask: SPSR_SPIF,
          enableRegister: this.config.SPCR,
          enableMask: SPCR_SPIE
        };
        const { SPCR, SPSR, SPDR } = config;
        cpu.writeHooks[SPDR] = (value) => {
          if (!(cpu.data[SPCR] & SPCR_SPE)) {
            return;
          }
          if (this.transmissionActive) {
            cpu.data[SPSR] |= SPSR_WCOL;
            return true;
          }
          cpu.data[SPSR] &= ~SPSR_WCOL;
          this.cpu.clearInterrupt(this.SPI);
          this.transmissionActive = true;
          this.onByte(value);
          return true;
        };
        cpu.writeHooks[SPCR] = (value) => {
          this.cpu.updateInterruptEnable(this.SPI, value);
        };
        cpu.writeHooks[SPSR] = (value) => {
          this.cpu.data[SPSR] = value;
          this.cpu.clearInterruptByFlag(this.SPI, value);
        };
      }
      reset() {
        this.transmissionActive = false;
      }
      /**
       * Completes an SPI transaction. Call this method only from the `onByte` callback.
       *
       * @param receivedByte Byte read from the SPI MISO line.
       */
      completeTransfer(receivedByte) {
        const { SPDR } = this.config;
        this.cpu.data[SPDR] = receivedByte;
        this.cpu.setInterruptFlag(this.SPI);
        this.transmissionActive = false;
      }
      get isMaster() {
        return this.cpu.data[this.config.SPCR] & SPCR_MSTR ? true : false;
      }
      get dataOrder() {
        return this.cpu.data[this.config.SPCR] & SPCR_DORD ? "lsbFirst" : "msbFirst";
      }
      get spiMode() {
        const CPHA = this.cpu.data[this.config.SPCR] & SPCR_CPHA;
        const CPOL = this.cpu.data[this.config.SPCR] & SPCR_CPOL;
        return (CPHA ? 2 : 0) | (CPOL ? 1 : 0);
      }
      /**
       * The clock divider is only relevant for Master mode
       */
      get clockDivider() {
        const base = this.cpu.data[this.config.SPSR] & SPSR_SPI2X ? 2 : 4;
        switch (this.cpu.data[this.config.SPCR] & SPSR_SPR_MASK) {
          case 0:
            return base;
          case 1:
            return base * 4;
          case 2:
            return base * 16;
          case 3:
            return base * 32;
        }
        throw new Error("Invalid divider value!");
      }
      /** Number of cycles to complete a single byte SPI transaction */
      get transferCycles() {
        return this.clockDivider * bitsPerByte;
      }
      /**
       * The SPI freqeuncy is only relevant to Master mode.
       * In slave mode, the frequency can be as high as F(osc) / 4.
       */
      get spiFrequency() {
        return this.freqHz / this.clockDivider;
      }
    };
    exports.AVRSPI = AVRSPI;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/timer.js
var require_timer = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/timer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVRTimer = exports.timer2Config = exports.timer1Config = exports.timer0Config = void 0;
    var gpio_1 = require_gpio();
    var timer01Dividers = {
      0: 0,
      1: 1,
      2: 8,
      3: 64,
      4: 256,
      5: 1024,
      6: 0,
      // External clock - see ExternalClockMode
      7: 0
      // Ditto
    };
    var ExternalClockMode;
    (function(ExternalClockMode2) {
      ExternalClockMode2[ExternalClockMode2["FallingEdge"] = 6] = "FallingEdge";
      ExternalClockMode2[ExternalClockMode2["RisingEdge"] = 7] = "RisingEdge";
    })(ExternalClockMode || (ExternalClockMode = {}));
    var defaultTimerBits = {
      // TIFR bits
      TOV: 1,
      OCFA: 2,
      OCFB: 4,
      OCFC: 0,
      // Unused
      // TIMSK bits
      TOIE: 1,
      OCIEA: 2,
      OCIEB: 4,
      OCIEC: 0
      // Unused
    };
    exports.timer0Config = Object.assign({ bits: 8, captureInterrupt: 0, compAInterrupt: 28, compBInterrupt: 30, compCInterrupt: 0, ovfInterrupt: 32, TIFR: 53, OCRA: 71, OCRB: 72, OCRC: 0, ICR: 0, TCNT: 70, TCCRA: 68, TCCRB: 69, TCCRC: 0, TIMSK: 110, dividers: timer01Dividers, compPortA: gpio_1.portDConfig.PORT, compPinA: 6, compPortB: gpio_1.portDConfig.PORT, compPinB: 5, compPortC: 0, compPinC: 0, externalClockPort: gpio_1.portDConfig.PORT, externalClockPin: 4 }, defaultTimerBits);
    exports.timer1Config = Object.assign({ bits: 16, captureInterrupt: 20, compAInterrupt: 22, compBInterrupt: 24, compCInterrupt: 0, ovfInterrupt: 26, TIFR: 54, OCRA: 136, OCRB: 138, OCRC: 0, ICR: 134, TCNT: 132, TCCRA: 128, TCCRB: 129, TCCRC: 130, TIMSK: 111, dividers: timer01Dividers, compPortA: gpio_1.portBConfig.PORT, compPinA: 1, compPortB: gpio_1.portBConfig.PORT, compPinB: 2, compPortC: 0, compPinC: 0, externalClockPort: gpio_1.portDConfig.PORT, externalClockPin: 5 }, defaultTimerBits);
    exports.timer2Config = Object.assign({ bits: 8, captureInterrupt: 0, compAInterrupt: 14, compBInterrupt: 16, compCInterrupt: 0, ovfInterrupt: 18, TIFR: 55, OCRA: 179, OCRB: 180, OCRC: 0, ICR: 0, TCNT: 178, TCCRA: 176, TCCRB: 177, TCCRC: 0, TIMSK: 112, dividers: {
      0: 0,
      1: 1,
      2: 8,
      3: 32,
      4: 64,
      5: 128,
      6: 256,
      7: 1024
    }, compPortA: gpio_1.portBConfig.PORT, compPinA: 3, compPortB: gpio_1.portDConfig.PORT, compPinB: 3, compPortC: 0, compPinC: 0, externalClockPort: 0, externalClockPin: 0 }, defaultTimerBits);
    var TimerMode;
    (function(TimerMode2) {
      TimerMode2[TimerMode2["Normal"] = 0] = "Normal";
      TimerMode2[TimerMode2["PWMPhaseCorrect"] = 1] = "PWMPhaseCorrect";
      TimerMode2[TimerMode2["CTC"] = 2] = "CTC";
      TimerMode2[TimerMode2["FastPWM"] = 3] = "FastPWM";
      TimerMode2[TimerMode2["PWMPhaseFrequencyCorrect"] = 4] = "PWMPhaseFrequencyCorrect";
      TimerMode2[TimerMode2["Reserved"] = 5] = "Reserved";
    })(TimerMode || (TimerMode = {}));
    var TOVUpdateMode;
    (function(TOVUpdateMode2) {
      TOVUpdateMode2[TOVUpdateMode2["Max"] = 0] = "Max";
      TOVUpdateMode2[TOVUpdateMode2["Top"] = 1] = "Top";
      TOVUpdateMode2[TOVUpdateMode2["Bottom"] = 2] = "Bottom";
    })(TOVUpdateMode || (TOVUpdateMode = {}));
    var OCRUpdateMode;
    (function(OCRUpdateMode2) {
      OCRUpdateMode2[OCRUpdateMode2["Immediate"] = 0] = "Immediate";
      OCRUpdateMode2[OCRUpdateMode2["Top"] = 1] = "Top";
      OCRUpdateMode2[OCRUpdateMode2["Bottom"] = 2] = "Bottom";
    })(OCRUpdateMode || (OCRUpdateMode = {}));
    var TopOCRA = 1;
    var TopICR = 2;
    var OCToggle = 1;
    var { Normal, PWMPhaseCorrect, CTC, FastPWM, Reserved, PWMPhaseFrequencyCorrect } = TimerMode;
    var wgmModes8Bit = [
      /*0*/
      [Normal, 255, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
      /*1*/
      [PWMPhaseCorrect, 255, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
      /*2*/
      [CTC, TopOCRA, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
      /*3*/
      [FastPWM, 255, OCRUpdateMode.Bottom, TOVUpdateMode.Max, 0],
      /*4*/
      [Reserved, 255, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
      /*5*/
      [PWMPhaseCorrect, TopOCRA, OCRUpdateMode.Top, TOVUpdateMode.Bottom, OCToggle],
      /*6*/
      [Reserved, 255, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
      /*7*/
      [FastPWM, TopOCRA, OCRUpdateMode.Bottom, TOVUpdateMode.Top, OCToggle]
    ];
    var wgmModes16Bit = [
      /*0 */
      [Normal, 65535, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
      /*1 */
      [PWMPhaseCorrect, 255, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
      /*2 */
      [PWMPhaseCorrect, 511, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
      /*3 */
      [PWMPhaseCorrect, 1023, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
      /*4 */
      [CTC, TopOCRA, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
      /*5 */
      [FastPWM, 255, OCRUpdateMode.Bottom, TOVUpdateMode.Top, 0],
      /*6 */
      [FastPWM, 511, OCRUpdateMode.Bottom, TOVUpdateMode.Top, 0],
      /*7 */
      [FastPWM, 1023, OCRUpdateMode.Bottom, TOVUpdateMode.Top, 0],
      /*8 */
      [PWMPhaseFrequencyCorrect, TopICR, OCRUpdateMode.Bottom, TOVUpdateMode.Bottom, 0],
      /*9 */
      [PWMPhaseFrequencyCorrect, TopOCRA, OCRUpdateMode.Bottom, TOVUpdateMode.Bottom, OCToggle],
      /*10*/
      [PWMPhaseCorrect, TopICR, OCRUpdateMode.Top, TOVUpdateMode.Bottom, 0],
      /*11*/
      [PWMPhaseCorrect, TopOCRA, OCRUpdateMode.Top, TOVUpdateMode.Bottom, OCToggle],
      /*12*/
      [CTC, TopICR, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
      /*13*/
      [Reserved, 65535, OCRUpdateMode.Immediate, TOVUpdateMode.Max, 0],
      /*14*/
      [FastPWM, TopICR, OCRUpdateMode.Bottom, TOVUpdateMode.Top, OCToggle],
      /*15*/
      [FastPWM, TopOCRA, OCRUpdateMode.Bottom, TOVUpdateMode.Top, OCToggle]
    ];
    function compToOverride(comp) {
      switch (comp) {
        case 1:
          return gpio_1.PinOverrideMode.Toggle;
        case 2:
          return gpio_1.PinOverrideMode.Clear;
        case 3:
          return gpio_1.PinOverrideMode.Set;
        default:
          return gpio_1.PinOverrideMode.Enable;
      }
    }
    var FOCA = 1 << 7;
    var FOCB = 1 << 6;
    var FOCC = 1 << 5;
    var AVRTimer2 = class {
      constructor(cpu, config) {
        this.cpu = cpu;
        this.config = config;
        this.MAX = this.config.bits === 16 ? 65535 : 255;
        this.lastCycle = 0;
        this.ocrA = 0;
        this.nextOcrA = 0;
        this.ocrB = 0;
        this.nextOcrB = 0;
        this.hasOCRC = this.config.OCRC > 0;
        this.ocrC = 0;
        this.nextOcrC = 0;
        this.ocrUpdateMode = OCRUpdateMode.Immediate;
        this.tovUpdateMode = TOVUpdateMode.Max;
        this.icr = 0;
        this.tcnt = 0;
        this.tcntNext = 0;
        this.tcntUpdated = false;
        this.updateDivider = false;
        this.countingUp = true;
        this.divider = 0;
        this.externalClockRisingEdge = false;
        this.highByteTemp = 0;
        this.OVF = {
          address: this.config.ovfInterrupt,
          flagRegister: this.config.TIFR,
          flagMask: this.config.TOV,
          enableRegister: this.config.TIMSK,
          enableMask: this.config.TOIE
        };
        this.OCFA = {
          address: this.config.compAInterrupt,
          flagRegister: this.config.TIFR,
          flagMask: this.config.OCFA,
          enableRegister: this.config.TIMSK,
          enableMask: this.config.OCIEA
        };
        this.OCFB = {
          address: this.config.compBInterrupt,
          flagRegister: this.config.TIFR,
          flagMask: this.config.OCFB,
          enableRegister: this.config.TIMSK,
          enableMask: this.config.OCIEB
        };
        this.OCFC = {
          address: this.config.compCInterrupt,
          flagRegister: this.config.TIFR,
          flagMask: this.config.OCFC,
          enableRegister: this.config.TIMSK,
          enableMask: this.config.OCIEC
        };
        this.count = (reschedule = true, external = false) => {
          const { divider, lastCycle, cpu: cpu2 } = this;
          const { cycles } = cpu2;
          const delta = cycles - lastCycle;
          if (divider && delta >= divider || external) {
            const counterDelta = external ? 1 : Math.floor(delta / divider);
            this.lastCycle += counterDelta * divider;
            const val = this.tcnt;
            const { timerMode, TOP } = this;
            const phasePwm = timerMode === PWMPhaseCorrect || timerMode === PWMPhaseFrequencyCorrect;
            const newVal = phasePwm ? this.phasePwmCount(val, counterDelta) : (val + counterDelta) % (TOP + 1);
            const overflow = val + counterDelta > TOP;
            if (!this.tcntUpdated) {
              this.tcnt = newVal;
              if (!phasePwm) {
                this.timerUpdated(newVal, val);
              }
            }
            if (!phasePwm) {
              if (timerMode === FastPWM && overflow) {
                const { compA, compB } = this;
                if (compA) {
                  this.updateCompPin(compA, "A", true);
                }
                if (compB) {
                  this.updateCompPin(compB, "B", true);
                }
              }
              if (this.ocrUpdateMode == OCRUpdateMode.Bottom && overflow) {
                this.ocrA = this.nextOcrA;
                this.ocrB = this.nextOcrB;
                this.ocrC = this.nextOcrC;
              }
              if (overflow && (this.tovUpdateMode == TOVUpdateMode.Top || TOP === this.MAX)) {
                cpu2.setInterruptFlag(this.OVF);
              }
            }
          }
          if (this.tcntUpdated) {
            this.tcnt = this.tcntNext;
            this.tcntUpdated = false;
            if (this.tcnt === 0 && this.ocrUpdateMode === OCRUpdateMode.Bottom || this.tcnt === this.TOP && this.ocrUpdateMode === OCRUpdateMode.Top) {
              this.ocrA = this.nextOcrA;
              this.ocrB = this.nextOcrB;
              this.ocrC = this.nextOcrC;
            }
          }
          if (this.updateDivider) {
            const { CS } = this;
            const { externalClockPin } = this.config;
            const newDivider = this.config.dividers[CS];
            this.lastCycle = newDivider ? this.cpu.cycles : 0;
            this.updateDivider = false;
            this.divider = newDivider;
            if (this.config.externalClockPort && !this.externalClockPort) {
              this.externalClockPort = this.cpu.gpioByPort[this.config.externalClockPort];
            }
            if (this.externalClockPort) {
              this.externalClockPort.externalClockListeners[externalClockPin] = null;
            }
            if (newDivider) {
              cpu2.addClockEvent(this.count, this.lastCycle + newDivider - cpu2.cycles);
            } else if (this.externalClockPort && (CS === ExternalClockMode.FallingEdge || CS === ExternalClockMode.RisingEdge)) {
              this.externalClockPort.externalClockListeners[externalClockPin] = this.externalClockCallback;
              this.externalClockRisingEdge = CS === ExternalClockMode.RisingEdge;
            }
            return;
          }
          if (reschedule && divider) {
            cpu2.addClockEvent(this.count, this.lastCycle + divider - cpu2.cycles);
          }
        };
        this.externalClockCallback = (value) => {
          if (value === this.externalClockRisingEdge) {
            this.count(false, true);
          }
        };
        this.updateWGMConfig();
        this.cpu.readHooks[config.TCNT] = (addr) => {
          this.count(false);
          if (this.config.bits === 16) {
            this.cpu.data[addr + 1] = this.tcnt >> 8;
          }
          return this.cpu.data[addr] = this.tcnt & 255;
        };
        this.cpu.writeHooks[config.TCNT] = (value) => {
          this.tcntNext = this.highByteTemp << 8 | value;
          this.countingUp = true;
          this.tcntUpdated = true;
          this.cpu.updateClockEvent(this.count, 0);
          if (this.divider) {
            this.timerUpdated(this.tcntNext, this.tcntNext);
          }
        };
        this.cpu.writeHooks[config.OCRA] = (value) => {
          this.nextOcrA = this.highByteTemp << 8 | value;
          if (this.ocrUpdateMode === OCRUpdateMode.Immediate) {
            this.ocrA = this.nextOcrA;
          }
        };
        this.cpu.writeHooks[config.OCRB] = (value) => {
          this.nextOcrB = this.highByteTemp << 8 | value;
          if (this.ocrUpdateMode === OCRUpdateMode.Immediate) {
            this.ocrB = this.nextOcrB;
          }
        };
        if (this.hasOCRC) {
          this.cpu.writeHooks[config.OCRC] = (value) => {
            this.nextOcrC = this.highByteTemp << 8 | value;
            if (this.ocrUpdateMode === OCRUpdateMode.Immediate) {
              this.ocrC = this.nextOcrC;
            }
          };
        }
        if (this.config.bits === 16) {
          this.cpu.writeHooks[config.ICR] = (value) => {
            this.icr = this.highByteTemp << 8 | value;
          };
          const updateTempRegister = (value) => {
            this.highByteTemp = value;
          };
          const updateOCRHighRegister = (value, old, addr) => {
            this.highByteTemp = value & this.ocrMask >> 8;
            cpu.data[addr] = this.highByteTemp;
            return true;
          };
          this.cpu.writeHooks[config.TCNT + 1] = updateTempRegister;
          this.cpu.writeHooks[config.OCRA + 1] = updateOCRHighRegister;
          this.cpu.writeHooks[config.OCRB + 1] = updateOCRHighRegister;
          if (this.hasOCRC) {
            this.cpu.writeHooks[config.OCRC + 1] = updateOCRHighRegister;
          }
          this.cpu.writeHooks[config.ICR + 1] = updateTempRegister;
        }
        cpu.writeHooks[config.TCCRA] = (value) => {
          this.cpu.data[config.TCCRA] = value;
          this.updateWGMConfig();
          return true;
        };
        cpu.writeHooks[config.TCCRB] = (value) => {
          if (!config.TCCRC) {
            this.checkForceCompare(value);
            value &= ~(FOCA | FOCB);
          }
          this.cpu.data[config.TCCRB] = value;
          this.updateDivider = true;
          this.cpu.clearClockEvent(this.count);
          this.cpu.addClockEvent(this.count, 0);
          this.updateWGMConfig();
          return true;
        };
        if (config.TCCRC) {
          cpu.writeHooks[config.TCCRC] = (value) => {
            this.checkForceCompare(value);
          };
        }
        cpu.writeHooks[config.TIFR] = (value) => {
          this.cpu.data[config.TIFR] = value;
          this.cpu.clearInterruptByFlag(this.OVF, value);
          this.cpu.clearInterruptByFlag(this.OCFA, value);
          this.cpu.clearInterruptByFlag(this.OCFB, value);
          return true;
        };
        cpu.writeHooks[config.TIMSK] = (value) => {
          this.cpu.updateInterruptEnable(this.OVF, value);
          this.cpu.updateInterruptEnable(this.OCFA, value);
          this.cpu.updateInterruptEnable(this.OCFB, value);
        };
      }
      reset() {
        this.divider = 0;
        this.lastCycle = 0;
        this.ocrA = 0;
        this.nextOcrA = 0;
        this.ocrB = 0;
        this.nextOcrB = 0;
        this.ocrC = 0;
        this.nextOcrC = 0;
        this.icr = 0;
        this.tcnt = 0;
        this.tcntNext = 0;
        this.tcntUpdated = false;
        this.countingUp = false;
        this.updateDivider = true;
      }
      get TCCRA() {
        return this.cpu.data[this.config.TCCRA];
      }
      get TCCRB() {
        return this.cpu.data[this.config.TCCRB];
      }
      get TIMSK() {
        return this.cpu.data[this.config.TIMSK];
      }
      get CS() {
        return this.TCCRB & 7;
      }
      get WGM() {
        const mask = this.config.bits === 16 ? 24 : 8;
        return (this.TCCRB & mask) >> 1 | this.TCCRA & 3;
      }
      get TOP() {
        switch (this.topValue) {
          case TopOCRA:
            return this.ocrA;
          case TopICR:
            return this.icr;
          default:
            return this.topValue;
        }
      }
      get ocrMask() {
        switch (this.topValue) {
          case TopOCRA:
          case TopICR:
            return 65535;
          default:
            return this.topValue;
        }
      }
      /** Expose the raw value of TCNT, for use by the unit tests */
      get debugTCNT() {
        return this.tcnt;
      }
      updateWGMConfig() {
        const { config, WGM } = this;
        const wgmModes = config.bits === 16 ? wgmModes16Bit : wgmModes8Bit;
        const TCCRA = this.cpu.data[config.TCCRA];
        const [timerMode, topValue, ocrUpdateMode, tovUpdateMode, flags] = wgmModes[WGM];
        this.timerMode = timerMode;
        this.topValue = topValue;
        this.ocrUpdateMode = ocrUpdateMode;
        this.tovUpdateMode = tovUpdateMode;
        const pwmMode = timerMode === FastPWM || timerMode === PWMPhaseCorrect || timerMode === PWMPhaseFrequencyCorrect;
        const prevCompA = this.compA;
        this.compA = TCCRA >> 6 & 3;
        if (this.compA === 1 && pwmMode && !(flags & OCToggle)) {
          this.compA = 0;
        }
        if (!!prevCompA !== !!this.compA) {
          this.updateCompA(this.compA ? gpio_1.PinOverrideMode.Enable : gpio_1.PinOverrideMode.None);
        }
        const prevCompB = this.compB;
        this.compB = TCCRA >> 4 & 3;
        if (this.compB === 1 && pwmMode) {
          this.compB = 0;
        }
        if (!!prevCompB !== !!this.compB) {
          this.updateCompB(this.compB ? gpio_1.PinOverrideMode.Enable : gpio_1.PinOverrideMode.None);
        }
        if (this.hasOCRC) {
          const prevCompC = this.compC;
          this.compC = TCCRA >> 2 & 3;
          if (this.compC === 1 && pwmMode) {
            this.compC = 0;
          }
          if (!!prevCompC !== !!this.compC) {
            this.updateCompC(this.compC ? gpio_1.PinOverrideMode.Enable : gpio_1.PinOverrideMode.None);
          }
        }
      }
      phasePwmCount(value, delta) {
        const { ocrA, ocrB, ocrC, hasOCRC, TOP, MAX, tcntUpdated } = this;
        if (!value && !TOP) {
          delta = 0;
          if (this.ocrUpdateMode === OCRUpdateMode.Top) {
            this.ocrA = this.nextOcrA;
            this.ocrB = this.nextOcrB;
            this.ocrC = this.nextOcrC;
          }
        }
        while (delta > 0) {
          if (this.countingUp) {
            value++;
            if (value === TOP && !tcntUpdated) {
              this.countingUp = false;
              if (this.ocrUpdateMode === OCRUpdateMode.Top) {
                this.ocrA = this.nextOcrA;
                this.ocrB = this.nextOcrB;
                this.ocrC = this.nextOcrC;
              }
            }
          } else {
            value--;
            if (!value && !tcntUpdated) {
              this.countingUp = true;
              this.cpu.setInterruptFlag(this.OVF);
              if (this.ocrUpdateMode === OCRUpdateMode.Bottom) {
                this.ocrA = this.nextOcrA;
                this.ocrB = this.nextOcrB;
                this.ocrC = this.nextOcrC;
              }
            }
          }
          if (!tcntUpdated) {
            if (value === ocrA) {
              this.cpu.setInterruptFlag(this.OCFA);
              if (this.compA) {
                this.updateCompPin(this.compA, "A");
              }
            }
            if (value === ocrB) {
              this.cpu.setInterruptFlag(this.OCFB);
              if (this.compB) {
                this.updateCompPin(this.compB, "B");
              }
            }
            if (hasOCRC && value === ocrC) {
              this.cpu.setInterruptFlag(this.OCFC);
              if (this.compC) {
                this.updateCompPin(this.compC, "C");
              }
            }
          }
          delta--;
        }
        return value & MAX;
      }
      timerUpdated(value, prevValue) {
        const { ocrA, ocrB, ocrC, hasOCRC } = this;
        const overflow = prevValue > value;
        if ((prevValue < ocrA || overflow) && value >= ocrA || prevValue < ocrA && overflow) {
          this.cpu.setInterruptFlag(this.OCFA);
          if (this.compA) {
            this.updateCompPin(this.compA, "A");
          }
        }
        if ((prevValue < ocrB || overflow) && value >= ocrB || prevValue < ocrB && overflow) {
          this.cpu.setInterruptFlag(this.OCFB);
          if (this.compB) {
            this.updateCompPin(this.compB, "B");
          }
        }
        if (hasOCRC && ((prevValue < ocrC || overflow) && value >= ocrC || prevValue < ocrC && overflow)) {
          this.cpu.setInterruptFlag(this.OCFC);
          if (this.compC) {
            this.updateCompPin(this.compC, "C");
          }
        }
      }
      checkForceCompare(value) {
        if (this.timerMode == TimerMode.FastPWM || this.timerMode == TimerMode.PWMPhaseCorrect || this.timerMode == TimerMode.PWMPhaseFrequencyCorrect) {
          return;
        }
        if (value & FOCA) {
          this.updateCompPin(this.compA, "A");
        }
        if (value & FOCB) {
          this.updateCompPin(this.compB, "B");
        }
        if (this.config.compPortC && value & FOCC) {
          this.updateCompPin(this.compC, "C");
        }
      }
      updateCompPin(compValue, pinName, bottom = false) {
        let newValue = gpio_1.PinOverrideMode.None;
        const invertingMode = compValue === 3;
        const isSet = this.countingUp === invertingMode;
        switch (this.timerMode) {
          case Normal:
          case CTC:
            newValue = compToOverride(compValue);
            break;
          case FastPWM:
            if (compValue === 1) {
              newValue = bottom ? gpio_1.PinOverrideMode.None : gpio_1.PinOverrideMode.Toggle;
            } else {
              newValue = invertingMode !== bottom ? gpio_1.PinOverrideMode.Set : gpio_1.PinOverrideMode.Clear;
            }
            break;
          case PWMPhaseCorrect:
          case PWMPhaseFrequencyCorrect:
            if (compValue === 1) {
              newValue = gpio_1.PinOverrideMode.Toggle;
            } else {
              newValue = isSet ? gpio_1.PinOverrideMode.Set : gpio_1.PinOverrideMode.Clear;
            }
            break;
        }
        if (newValue !== gpio_1.PinOverrideMode.None) {
          if (pinName === "A") {
            this.updateCompA(newValue);
          } else if (pinName === "B") {
            this.updateCompB(newValue);
          } else {
            this.updateCompC(newValue);
          }
        }
      }
      updateCompA(value) {
        const { compPortA, compPinA } = this.config;
        const port = this.cpu.gpioByPort[compPortA];
        port === null || port === void 0 ? void 0 : port.timerOverridePin(compPinA, value);
      }
      updateCompB(value) {
        const { compPortB, compPinB } = this.config;
        const port = this.cpu.gpioByPort[compPortB];
        port === null || port === void 0 ? void 0 : port.timerOverridePin(compPinB, value);
      }
      updateCompC(value) {
        const { compPortC, compPinC } = this.config;
        const port = this.cpu.gpioByPort[compPortC];
        port === null || port === void 0 ? void 0 : port.timerOverridePin(compPinC, value);
      }
    };
    exports.AVRTimer = AVRTimer2;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/timer-attiny.js
var require_timer_attiny = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/timer-attiny.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ATtinyTimer1 = exports.attinyTimer1Config = void 0;
    var gpio_1 = require_gpio();
    var CTC1 = 1 << 7;
    var PWM1A = 1 << 6;
    var CS_MASK = 15;
    var PWM1B_BIT = 1 << 6;
    var FOC1B = 1 << 3;
    var FOC1A = 1 << 2;
    var PSR1 = 1 << 1;
    exports.attinyTimer1Config = {
      TCCR1: 80,
      GTCCR: 76,
      TCNT1: 79,
      OCR1A: 78,
      OCR1B: 75,
      OCR1C: 77,
      TIFR: 88,
      TIMSK: 89,
      ovfInterrupt: 4,
      compAInterrupt: 3,
      compBInterrupt: 9,
      TOV1: 1 << 2,
      OCF1A: 1 << 6,
      OCF1B: 1 << 5,
      TOIE1: 1 << 2,
      OCIE1A: 1 << 6,
      OCIE1B: 1 << 5,
      compPortB: 56,
      compPinA: 1,
      // PB1
      compPinB: 4,
      // PB4
      dividers: {
        0: 0,
        1: 1,
        2: 2,
        3: 4,
        4: 8,
        5: 16,
        6: 32,
        7: 64,
        8: 128,
        9: 256,
        10: 512,
        11: 1024,
        12: 2048,
        13: 4096,
        14: 8192,
        15: 16384
      }
    };
    var ATtinyTimer1 = class {
      constructor(cpu, config) {
        this.cpu = cpu;
        this.config = config;
        this.lastCycle = 0;
        this.tcnt = 0;
        this.tcntNext = 0;
        this.tcntUpdated = false;
        this.ocrA = 0;
        this.ocrB = 0;
        this.ocrC = 0;
        this.divider = 0;
        this.updateDivider = false;
        this.countingUp = true;
        this.OVF = {
          address: this.config.ovfInterrupt,
          flagRegister: this.config.TIFR,
          flagMask: this.config.TOV1,
          enableRegister: this.config.TIMSK,
          enableMask: this.config.TOIE1
        };
        this.OCFA = {
          address: this.config.compAInterrupt,
          flagRegister: this.config.TIFR,
          flagMask: this.config.OCF1A,
          enableRegister: this.config.TIMSK,
          enableMask: this.config.OCIE1A
        };
        this.OCFB = {
          address: this.config.compBInterrupt,
          flagRegister: this.config.TIFR,
          flagMask: this.config.OCF1B,
          enableRegister: this.config.TIMSK,
          enableMask: this.config.OCIE1B
        };
        this.count = (reschedule = true) => {
          var _a;
          const { divider, lastCycle, cpu: cpu2 } = this;
          const { cycles } = cpu2;
          const delta = cycles - lastCycle;
          if (divider && delta >= divider) {
            const counterDelta = Math.floor(delta / divider);
            this.lastCycle += counterDelta * divider;
            const val = this.tcnt;
            const top = this.TOP;
            const phasePwm = (this.pwmA || this.pwmB) && !this.ctcMode;
            const newVal = phasePwm ? this.phasePwmCount(val, counterDelta) : (val + counterDelta) % (top + 1);
            const overflow = val + counterDelta > top;
            if (!this.tcntUpdated) {
              this.tcnt = newVal;
              if (!phasePwm) {
                this.timerUpdated(newVal, val);
              }
            }
            if (!phasePwm && overflow) {
              cpu2.setInterruptFlag(this.OVF);
            }
          }
          if (this.tcntUpdated) {
            this.tcnt = this.tcntNext;
            this.tcntUpdated = false;
          }
          if (this.updateDivider) {
            const cs = this.CS;
            const newDivider = (_a = this.config.dividers[cs]) !== null && _a !== void 0 ? _a : 0;
            this.lastCycle = newDivider ? this.cpu.cycles : 0;
            this.updateDivider = false;
            this.divider = newDivider;
            if (newDivider) {
              cpu2.addClockEvent(this.count, this.lastCycle + newDivider - cpu2.cycles);
            }
            return;
          }
          if (reschedule && divider) {
            cpu2.addClockEvent(this.count, this.lastCycle + divider - cpu2.cycles);
          }
        };
        const { TCCR1, GTCCR, TCNT1, OCR1A, OCR1B, OCR1C, TIFR, TIMSK } = config;
        cpu.readHooks[TCNT1] = () => {
          this.count(false);
          return cpu.data[TCNT1] = this.tcnt & 255;
        };
        cpu.writeHooks[TCNT1] = (value) => {
          this.tcntNext = value;
          this.countingUp = true;
          this.tcntUpdated = true;
          cpu.updateClockEvent(this.count, 0);
          if (this.divider) {
            this.timerUpdated(this.tcntNext, this.tcntNext);
          }
        };
        cpu.writeHooks[OCR1A] = (value) => {
          this.ocrA = value;
        };
        cpu.writeHooks[OCR1B] = (value) => {
          this.ocrB = value;
        };
        cpu.writeHooks[OCR1C] = (value) => {
          this.ocrC = value;
        };
        cpu.writeHooks[TCCR1] = (value) => {
          cpu.data[TCCR1] = value;
          this.updateDivider = true;
          cpu.clearClockEvent(this.count);
          cpu.addClockEvent(this.count, 0);
          this.updateCompConfig();
          return true;
        };
        const prevGtccrHook = cpu.writeHooks[GTCCR];
        cpu.writeHooks[GTCCR] = (value, oldValue, addr, mask) => {
          if (value & FOC1A) {
            this.forceCompare("A");
          }
          if (value & FOC1B) {
            this.forceCompare("B");
          }
          if (value & PSR1) {
            this.lastCycle = this.cpu.cycles;
          }
          value &= ~(FOC1A | FOC1B | PSR1);
          if (prevGtccrHook) {
            prevGtccrHook(value, oldValue, addr, mask);
          } else {
            cpu.data[GTCCR] = value;
          }
          this.updateCompConfig();
          return true;
        };
        const prevTifrHook = cpu.writeHooks[TIFR];
        cpu.writeHooks[TIFR] = (value, oldValue, addr, mask) => {
          if (prevTifrHook) {
            prevTifrHook(value, oldValue, addr, mask);
          } else {
            cpu.data[TIFR] = value;
          }
          cpu.clearInterruptByFlag(this.OVF, value);
          cpu.clearInterruptByFlag(this.OCFA, value);
          cpu.clearInterruptByFlag(this.OCFB, value);
          return true;
        };
        const prevTimskHook = cpu.writeHooks[TIMSK];
        cpu.writeHooks[TIMSK] = (value, oldValue, addr, mask) => {
          if (prevTimskHook) {
            prevTimskHook(value, oldValue, addr, mask);
          }
          cpu.updateInterruptEnable(this.OVF, value);
          cpu.updateInterruptEnable(this.OCFA, value);
          cpu.updateInterruptEnable(this.OCFB, value);
        };
      }
      get tccr1() {
        return this.cpu.data[this.config.TCCR1];
      }
      get gtccr() {
        return this.cpu.data[this.config.GTCCR];
      }
      get CS() {
        return this.tccr1 & CS_MASK;
      }
      get ctcMode() {
        return !!(this.tccr1 & CTC1);
      }
      get pwmA() {
        return !!(this.tccr1 & PWM1A);
      }
      get pwmB() {
        return !!(this.gtccr & PWM1B_BIT);
      }
      get comA() {
        return this.tccr1 >> 4 & 3;
      }
      get comB() {
        return this.gtccr >> 4 & 3;
      }
      /** TOP = OCR1C in CTC/PWM modes, 0xFF in Normal mode */
      get TOP() {
        if (this.ctcMode || this.pwmA || this.pwmB) {
          return this.ocrC;
        }
        return 255;
      }
      phasePwmCount(value, delta) {
        const top = this.TOP;
        while (delta > 0) {
          if (this.countingUp) {
            value++;
            if (value >= top) {
              value = top;
              this.countingUp = false;
            }
          } else {
            value--;
            if (value <= 0) {
              value = 0;
              this.countingUp = true;
              this.cpu.setInterruptFlag(this.OVF);
            }
          }
          if (!this.tcntUpdated) {
            if (value === this.ocrA) {
              this.cpu.setInterruptFlag(this.OCFA);
              this.updateCompPinPwm("A");
            }
            if (value === this.ocrB) {
              this.cpu.setInterruptFlag(this.OCFB);
              this.updateCompPinPwm("B");
            }
          }
          delta--;
        }
        return value & 255;
      }
      timerUpdated(value, prevValue) {
        const { ocrA, ocrB } = this;
        const overflow = prevValue > value;
        if ((prevValue < ocrA || overflow) && value >= ocrA || prevValue < ocrA && overflow) {
          this.cpu.setInterruptFlag(this.OCFA);
          if (this.comA && !this.pwmA) {
            this.updateCompPinNonPwm("A");
          }
        }
        if ((prevValue < ocrB || overflow) && value >= ocrB || prevValue < ocrB && overflow) {
          this.cpu.setInterruptFlag(this.OCFB);
          if (this.comB && !this.pwmB) {
            this.updateCompPinNonPwm("B");
          }
        }
      }
      forceCompare(channel) {
        if (channel === "A" && !this.pwmA && this.comA) {
          this.updateCompPinNonPwm("A");
        } else if (channel === "B" && !this.pwmB && this.comB) {
          this.updateCompPinNonPwm("B");
        }
      }
      updateCompPinNonPwm(channel) {
        var _a;
        const com = channel === "A" ? this.comA : this.comB;
        const pin2 = channel === "A" ? this.config.compPinA : this.config.compPinB;
        let mode;
        switch (com) {
          case 1:
            mode = gpio_1.PinOverrideMode.Toggle;
            break;
          case 2:
            mode = gpio_1.PinOverrideMode.Clear;
            break;
          case 3:
            mode = gpio_1.PinOverrideMode.Set;
            break;
          default:
            return;
        }
        (_a = this.cpu.gpioByPort[this.config.compPortB]) === null || _a === void 0 ? void 0 : _a.timerOverridePin(pin2, mode);
      }
      updateCompPinPwm(channel) {
        var _a;
        const com = channel === "A" ? this.comA : this.comB;
        const pin2 = channel === "A" ? this.config.compPinA : this.config.compPinB;
        const invertingMode = com === 3;
        const isSet = this.countingUp === invertingMode;
        let mode;
        switch (com) {
          case 1:
            mode = gpio_1.PinOverrideMode.Toggle;
            break;
          case 2:
          case 3:
            mode = isSet ? gpio_1.PinOverrideMode.Set : gpio_1.PinOverrideMode.Clear;
            break;
          default:
            return;
        }
        (_a = this.cpu.gpioByPort[this.config.compPortB]) === null || _a === void 0 ? void 0 : _a.timerOverridePin(pin2, mode);
      }
      updateCompConfig() {
        const port = this.cpu.gpioByPort[this.config.compPortB];
        if (!port)
          return;
        port.timerOverridePin(this.config.compPinA, this.comA ? gpio_1.PinOverrideMode.Enable : gpio_1.PinOverrideMode.None);
        port.timerOverridePin(this.config.compPinB, this.comB ? gpio_1.PinOverrideMode.Enable : gpio_1.PinOverrideMode.None);
      }
    };
    exports.ATtinyTimer1 = ATtinyTimer1;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/twi.js
var require_twi = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/twi.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVRTWI = exports.NoopTWIEventHandler = exports.twiConfig = void 0;
    var TWCR_TWINT = 128;
    var TWCR_TWEA = 64;
    var TWCR_TWSTA = 32;
    var TWCR_TWSTO = 16;
    var TWCR_TWEN = 4;
    var TWCR_TWIE = 1;
    var TWSR_TWS_MASK = 248;
    var TWSR_TWPS1 = 2;
    var TWSR_TWPS0 = 1;
    var TWSR_TWPS_MASK = TWSR_TWPS1 | TWSR_TWPS0;
    var STATUS_TWI_IDLE = 248;
    var STATUS_START = 8;
    var STATUS_REPEATED_START = 16;
    var STATUS_SLAW_ACK = 24;
    var STATUS_SLAW_NACK = 32;
    var STATUS_DATA_SENT_ACK = 40;
    var STATUS_DATA_SENT_NACK = 48;
    var STATUS_SLAR_ACK = 64;
    var STATUS_SLAR_NACK = 72;
    var STATUS_DATA_RECEIVED_ACK = 80;
    var STATUS_DATA_RECEIVED_NACK = 88;
    exports.twiConfig = {
      twiInterrupt: 48,
      TWBR: 184,
      TWSR: 185,
      TWAR: 186,
      TWDR: 187,
      TWCR: 188,
      TWAMR: 189
    };
    var NoopTWIEventHandler = class {
      constructor(twi) {
        this.twi = twi;
      }
      start() {
        this.twi.completeStart();
      }
      stop() {
        this.twi.completeStop();
      }
      connectToSlave() {
        this.twi.completeConnect(false);
      }
      writeByte() {
        this.twi.completeWrite(false);
      }
      readByte() {
        this.twi.completeRead(255);
      }
    };
    exports.NoopTWIEventHandler = NoopTWIEventHandler;
    var AVRTWI2 = class {
      constructor(cpu, config, freqHz) {
        this.cpu = cpu;
        this.config = config;
        this.freqHz = freqHz;
        this.eventHandler = new NoopTWIEventHandler(this);
        this.busy = false;
        this.TWI = {
          address: this.config.twiInterrupt,
          flagRegister: this.config.TWCR,
          flagMask: TWCR_TWINT,
          enableRegister: this.config.TWCR,
          enableMask: TWCR_TWIE
        };
        this.updateStatus(STATUS_TWI_IDLE);
        this.cpu.writeHooks[config.TWCR] = (value) => {
          this.cpu.data[config.TWCR] = value;
          const clearInt = value & TWCR_TWINT;
          this.cpu.clearInterruptByFlag(this.TWI, value);
          this.cpu.updateInterruptEnable(this.TWI, value);
          const { status } = this;
          if (clearInt && value & TWCR_TWEN && !this.busy) {
            const twdrValue = this.cpu.data[this.config.TWDR];
            this.cpu.addClockEvent(() => {
              if (value & TWCR_TWSTA) {
                this.busy = true;
                this.eventHandler.start(status !== STATUS_TWI_IDLE);
              } else if (value & TWCR_TWSTO) {
                this.busy = true;
                this.eventHandler.stop();
              } else if (status === STATUS_START || status === STATUS_REPEATED_START) {
                this.busy = true;
                this.eventHandler.connectToSlave(twdrValue >> 1, twdrValue & 1 ? false : true);
              } else if (status === STATUS_SLAW_ACK || status === STATUS_DATA_SENT_ACK) {
                this.busy = true;
                this.eventHandler.writeByte(twdrValue);
              } else if (status === STATUS_SLAR_ACK || status === STATUS_DATA_RECEIVED_ACK) {
                this.busy = true;
                const ack = !!(value & TWCR_TWEA);
                this.eventHandler.readByte(ack);
              }
            }, 0);
            return true;
          }
        };
      }
      get prescaler() {
        switch (this.cpu.data[this.config.TWSR] & TWSR_TWPS_MASK) {
          case 0:
            return 1;
          case 1:
            return 4;
          case 2:
            return 16;
          case 3:
            return 64;
        }
        throw new Error("Invalid prescaler value!");
      }
      get sclFrequency() {
        return this.freqHz / (16 + 2 * this.cpu.data[this.config.TWBR] * this.prescaler);
      }
      completeStart() {
        this.busy = false;
        this.updateStatus(this.status === STATUS_TWI_IDLE ? STATUS_START : STATUS_REPEATED_START);
      }
      completeStop() {
        this.busy = false;
        this.cpu.data[this.config.TWCR] &= ~TWCR_TWSTO;
        this.updateStatus(STATUS_TWI_IDLE);
      }
      completeConnect(ack) {
        this.busy = false;
        if (this.cpu.data[this.config.TWDR] & 1) {
          this.updateStatus(ack ? STATUS_SLAR_ACK : STATUS_SLAR_NACK);
        } else {
          this.updateStatus(ack ? STATUS_SLAW_ACK : STATUS_SLAW_NACK);
        }
      }
      completeWrite(ack) {
        this.busy = false;
        this.updateStatus(ack ? STATUS_DATA_SENT_ACK : STATUS_DATA_SENT_NACK);
      }
      completeRead(value) {
        this.busy = false;
        const ack = !!(this.cpu.data[this.config.TWCR] & TWCR_TWEA);
        this.cpu.data[this.config.TWDR] = value;
        this.updateStatus(ack ? STATUS_DATA_RECEIVED_ACK : STATUS_DATA_RECEIVED_NACK);
      }
      get status() {
        return this.cpu.data[this.config.TWSR] & TWSR_TWS_MASK;
      }
      updateStatus(value) {
        const { TWSR } = this.config;
        this.cpu.data[TWSR] = this.cpu.data[TWSR] & ~TWSR_TWS_MASK | value;
        this.cpu.setInterruptFlag(this.TWI);
      }
    };
    exports.AVRTWI = AVRTWI2;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/usart.js
var require_usart = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/usart.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVRUSART = exports.usart0Config = void 0;
    exports.usart0Config = {
      rxCompleteInterrupt: 36,
      dataRegisterEmptyInterrupt: 38,
      txCompleteInterrupt: 40,
      UCSRA: 192,
      UCSRB: 193,
      UCSRC: 194,
      UBRRL: 196,
      UBRRH: 197,
      UDR: 198
    };
    var UCSRA_RXC = 128;
    var UCSRA_TXC = 64;
    var UCSRA_UDRE = 32;
    var UCSRA_U2X = 2;
    var UCSRA_MPCM = 1;
    var UCSRA_CFG_MASK = UCSRA_U2X;
    var UCSRB_RXCIE = 128;
    var UCSRB_TXCIE = 64;
    var UCSRB_UDRIE = 32;
    var UCSRB_RXEN = 16;
    var UCSRB_TXEN = 8;
    var UCSRB_UCSZ2 = 4;
    var UCSRB_CFG_MASK = UCSRB_UCSZ2 | UCSRB_RXEN | UCSRB_TXEN;
    var UCSRC_UPM1 = 32;
    var UCSRC_UPM0 = 16;
    var UCSRC_USBS = 8;
    var UCSRC_UCSZ1 = 4;
    var UCSRC_UCSZ0 = 2;
    var rxMasks = {
      5: 31,
      6: 63,
      7: 127,
      8: 255,
      9: 255
    };
    var AVRUSART2 = class {
      constructor(cpu, config, freqHz) {
        this.cpu = cpu;
        this.config = config;
        this.freqHz = freqHz;
        this.onByteTransmit = null;
        this.onLineTransmit = null;
        this.onRxComplete = null;
        this.onConfigurationChange = null;
        this.rxBusyValue = false;
        this.rxByte = 0;
        this.lineBuffer = "";
        this.RXC = {
          address: this.config.rxCompleteInterrupt,
          flagRegister: this.config.UCSRA,
          flagMask: UCSRA_RXC,
          enableRegister: this.config.UCSRB,
          enableMask: UCSRB_RXCIE,
          constant: true
        };
        this.UDRE = {
          address: this.config.dataRegisterEmptyInterrupt,
          flagRegister: this.config.UCSRA,
          flagMask: UCSRA_UDRE,
          enableRegister: this.config.UCSRB,
          enableMask: UCSRB_UDRIE
        };
        this.TXC = {
          address: this.config.txCompleteInterrupt,
          flagRegister: this.config.UCSRA,
          flagMask: UCSRA_TXC,
          enableRegister: this.config.UCSRB,
          enableMask: UCSRB_TXCIE
        };
        this.reset();
        this.cpu.writeHooks[config.UCSRA] = (value, oldValue) => {
          var _a;
          cpu.data[config.UCSRA] = value & (UCSRA_MPCM | UCSRA_U2X);
          cpu.clearInterruptByFlag(this.TXC, value);
          if ((value & UCSRA_CFG_MASK) !== (oldValue & UCSRA_CFG_MASK)) {
            (_a = this.onConfigurationChange) === null || _a === void 0 ? void 0 : _a.call(this);
          }
          return true;
        };
        this.cpu.writeHooks[config.UCSRB] = (value, oldValue) => {
          var _a;
          cpu.updateInterruptEnable(this.RXC, value);
          cpu.updateInterruptEnable(this.UDRE, value);
          cpu.updateInterruptEnable(this.TXC, value);
          if (value & UCSRB_RXEN && oldValue & UCSRB_RXEN) {
            cpu.clearInterrupt(this.RXC);
          }
          if (value & UCSRB_TXEN && !(oldValue & UCSRB_TXEN)) {
            cpu.setInterruptFlag(this.UDRE);
          }
          cpu.data[config.UCSRB] = value;
          if ((value & UCSRB_CFG_MASK) !== (oldValue & UCSRB_CFG_MASK)) {
            (_a = this.onConfigurationChange) === null || _a === void 0 ? void 0 : _a.call(this);
          }
          return true;
        };
        this.cpu.writeHooks[config.UCSRC] = (value) => {
          var _a;
          cpu.data[config.UCSRC] = value;
          (_a = this.onConfigurationChange) === null || _a === void 0 ? void 0 : _a.call(this);
          return true;
        };
        this.cpu.readHooks[config.UDR] = () => {
          var _a;
          const mask = (_a = rxMasks[this.bitsPerChar]) !== null && _a !== void 0 ? _a : 255;
          const result = this.rxByte & mask;
          this.rxByte = 0;
          this.cpu.clearInterrupt(this.RXC);
          return result;
        };
        this.cpu.writeHooks[config.UDR] = (value) => {
          if (this.onByteTransmit) {
            this.onByteTransmit(value);
          }
          if (this.onLineTransmit) {
            const ch = String.fromCharCode(value);
            if (ch === "\n") {
              this.onLineTransmit(this.lineBuffer);
              this.lineBuffer = "";
            } else {
              this.lineBuffer += ch;
            }
          }
          this.cpu.addClockEvent(() => {
            cpu.setInterruptFlag(this.UDRE);
            cpu.setInterruptFlag(this.TXC);
          }, this.cyclesPerChar);
          this.cpu.clearInterrupt(this.TXC);
          this.cpu.clearInterrupt(this.UDRE);
        };
        this.cpu.writeHooks[config.UBRRH] = (value) => {
          var _a;
          this.cpu.data[config.UBRRH] = value;
          (_a = this.onConfigurationChange) === null || _a === void 0 ? void 0 : _a.call(this);
          return true;
        };
        this.cpu.writeHooks[config.UBRRL] = (value) => {
          var _a;
          this.cpu.data[config.UBRRL] = value;
          (_a = this.onConfigurationChange) === null || _a === void 0 ? void 0 : _a.call(this);
          return true;
        };
      }
      reset() {
        this.cpu.data[this.config.UCSRA] = UCSRA_UDRE;
        this.cpu.data[this.config.UCSRB] = 0;
        this.cpu.data[this.config.UCSRC] = UCSRC_UCSZ1 | UCSRC_UCSZ0;
        this.rxBusyValue = false;
        this.rxByte = 0;
        this.lineBuffer = "";
      }
      get rxBusy() {
        return this.rxBusyValue;
      }
      writeByte(value, immediate = false) {
        var _a;
        const { cpu } = this;
        if (this.rxBusyValue || !this.rxEnable) {
          return false;
        }
        if (immediate) {
          this.rxByte = value;
          cpu.setInterruptFlag(this.RXC);
          (_a = this.onRxComplete) === null || _a === void 0 ? void 0 : _a.call(this);
        } else {
          this.rxBusyValue = true;
          cpu.addClockEvent(() => {
            this.rxBusyValue = false;
            this.writeByte(value, true);
          }, this.cyclesPerChar);
          return true;
        }
      }
      get cyclesPerChar() {
        const symbolsPerChar = 1 + this.bitsPerChar + this.stopBits + (this.parityEnabled ? 1 : 0);
        return (this.UBRR + 1) * this.multiplier * symbolsPerChar;
      }
      get UBRR() {
        const { UBRRH, UBRRL } = this.config;
        return this.cpu.data[UBRRH] << 8 | this.cpu.data[UBRRL];
      }
      get multiplier() {
        return this.cpu.data[this.config.UCSRA] & UCSRA_U2X ? 8 : 16;
      }
      get rxEnable() {
        return !!(this.cpu.data[this.config.UCSRB] & UCSRB_RXEN);
      }
      get txEnable() {
        return !!(this.cpu.data[this.config.UCSRB] & UCSRB_TXEN);
      }
      get baudRate() {
        return Math.floor(this.freqHz / (this.multiplier * (1 + this.UBRR)));
      }
      get bitsPerChar() {
        const ucsz = (this.cpu.data[this.config.UCSRC] & (UCSRC_UCSZ1 | UCSRC_UCSZ0)) >> 1 | this.cpu.data[this.config.UCSRB] & UCSRB_UCSZ2;
        switch (ucsz) {
          case 0:
            return 5;
          case 1:
            return 6;
          case 2:
            return 7;
          case 3:
            return 8;
          default:
          // 4..6 are reserved
          case 7:
            return 9;
        }
      }
      get stopBits() {
        return this.cpu.data[this.config.UCSRC] & UCSRC_USBS ? 2 : 1;
      }
      get parityEnabled() {
        return this.cpu.data[this.config.UCSRC] & UCSRC_UPM1 ? true : false;
      }
      get parityOdd() {
        return this.cpu.data[this.config.UCSRC] & UCSRC_UPM0 ? true : false;
      }
    };
    exports.AVRUSART = AVRUSART2;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/usi.js
var require_usi = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/usi.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVRUSI = void 0;
    var USICR = 45;
    var USISR = 46;
    var USIDR = 47;
    var USIBR = 48;
    var USICNT_MASK = 15;
    var USIDC = 1 << 4;
    var USIPF = 1 << 5;
    var USIOIF = 1 << 6;
    var USISIF = 1 << 7;
    var USITC = 1 << 0;
    var USICLK = 1 << 1;
    var USICS0 = 1 << 2;
    var USICS1 = 1 << 3;
    var USIWM0 = 1 << 4;
    var USIWM1 = 1 << 5;
    var USIOIE = 1 << 6;
    var USISIE = 1 << 7;
    var AVRUSI = class {
      constructor(cpu, port, portPin, dataPin, clockPin) {
        this.START = {
          address: 13,
          flagRegister: USISR,
          flagMask: USISIF,
          enableRegister: USICR,
          enableMask: USISIE
        };
        this.OVF = {
          address: 14,
          flagRegister: USISR,
          flagMask: USIOIF,
          enableRegister: USICR,
          enableMask: USIOIE
        };
        const PIN = portPin;
        const PORT = PIN + 2;
        port.addListener((value) => {
          const twoWire = (cpu.data[USICR] & USIWM1) === USIWM1;
          if (twoWire) {
            if (value & 1 << clockPin && !(value & 1 << dataPin)) {
              cpu.setInterruptFlag(this.START);
            }
            if (value & 1 << clockPin && value & 1 << dataPin) {
              cpu.data[USISR] |= USIPF;
            }
          }
        });
        const updateOutput = () => {
          const oldValue = cpu.data[PORT];
          const newValue = cpu.data[USIDR] & 128 ? oldValue | 1 << dataPin : oldValue & ~(1 << dataPin);
          cpu.writeHooks[PORT](newValue, oldValue, PORT, 255);
          if (newValue & 128 && !(cpu.data[PIN] & 128)) {
            cpu.data[USISR] |= USIDC;
          } else {
            cpu.data[USISR] &= ~USIDC;
          }
        };
        const count = () => {
          const counter = cpu.data[USISR] + 1 & USICNT_MASK;
          cpu.data[USISR] = cpu.data[USISR] & ~USICNT_MASK | counter;
          if (!counter) {
            cpu.data[USIBR] = cpu.data[USIDR];
            cpu.setInterruptFlag(this.OVF);
          }
        };
        const shift = (inputValue) => {
          cpu.data[USIDR] = cpu.data[USIDR] << 1 | inputValue;
          updateOutput();
        };
        cpu.writeHooks[USIDR] = (value) => {
          cpu.data[USIDR] = value;
          updateOutput();
          return true;
        };
        cpu.writeHooks[USISR] = (value) => {
          const writeClearMask = USISIF | USIOIF | USIPF;
          cpu.data[USISR] = cpu.data[USISR] & writeClearMask & ~value | value & 15;
          cpu.clearInterruptByFlag(this.START, value);
          cpu.clearInterruptByFlag(this.OVF, value);
          return true;
        };
        cpu.writeHooks[USICR] = (value) => {
          cpu.data[USICR] = value & ~(USICLK | USITC);
          cpu.updateInterruptEnable(this.START, value);
          cpu.updateInterruptEnable(this.OVF, value);
          const clockSrc = value & (USICS1 | USICS0) >> 2;
          const mode = value & (USIWM1 | USIWM0) >> 4;
          const usiClk = value & USICLK;
          port.openCollector = mode >= 2 ? 1 << dataPin : 0;
          const inputValue = cpu.data[PIN] & 1 << dataPin ? 1 : 0;
          if (usiClk && !clockSrc) {
            shift(inputValue);
            count();
          }
          if (value & USITC) {
            cpu.writeHooks[PIN](1 << clockPin, cpu.data[PIN], PIN, 255);
            const newValue = cpu.data[PIN] & 1 << clockPin;
            if (usiClk && (clockSrc === 2 || clockSrc === 3)) {
              if (clockSrc === 2 && newValue) {
                shift(inputValue);
              }
              if (clockSrc === 3 && !newValue) {
                shift(inputValue);
              }
              count();
            }
            return true;
          }
        };
      }
    };
    exports.AVRUSI = AVRUSI;
  }
});

// node_modules/avr8js/dist/cjs/peripherals/watchdog.js
var require_watchdog = __commonJS({
  "node_modules/avr8js/dist/cjs/peripherals/watchdog.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AVRWatchdog = exports.watchdogConfig = void 0;
    var MCUSR_WDRF = 8;
    var WDTCSR_WDIF = 128;
    var WDTCSR_WDIE = 64;
    var WDTCSR_WDP3 = 32;
    var WDTCSR_WDCE = 16;
    var WDTCSR_WDE = 8;
    var WDTCSR_WDP2 = 4;
    var WDTCSR_WDP1 = 2;
    var WDTCSR_WDP0 = 1;
    var WDTCSR_WDP210 = WDTCSR_WDP2 | WDTCSR_WDP1 | WDTCSR_WDP0;
    var WDTCSR_PROTECT_MASK = WDTCSR_WDE | WDTCSR_WDP3 | WDTCSR_WDP210;
    exports.watchdogConfig = {
      watchdogInterrupt: 12,
      MCUSR: 84,
      WDTCSR: 96
    };
    var AVRWatchdog = class {
      constructor(cpu, config, clock) {
        this.cpu = cpu;
        this.config = config;
        this.clock = clock;
        this.clockFrequency = 128e3;
        this.changeEnabledCycles = 0;
        this.watchdogTimeout = 0;
        this.enabledValue = false;
        this.scheduled = false;
        this.Watchdog = {
          address: this.config.watchdogInterrupt,
          flagRegister: this.config.WDTCSR,
          flagMask: WDTCSR_WDIF,
          enableRegister: this.config.WDTCSR,
          enableMask: WDTCSR_WDIE
        };
        this.checkWatchdog = () => {
          if (this.enabled && this.cpu.cycles >= this.watchdogTimeout) {
            const wdtcsr = this.cpu.data[this.config.WDTCSR];
            if (wdtcsr & WDTCSR_WDIE) {
              this.cpu.setInterruptFlag(this.Watchdog);
            }
            if (wdtcsr & WDTCSR_WDE) {
              if (wdtcsr & WDTCSR_WDIE) {
                this.cpu.data[this.config.WDTCSR] &= ~WDTCSR_WDIE;
              } else {
                this.cpu.reset();
                this.scheduled = false;
                this.cpu.data[this.config.MCUSR] |= MCUSR_WDRF;
                return;
              }
            }
            this.resetWatchdog();
          }
          if (this.enabled) {
            this.scheduled = true;
            this.cpu.addClockEvent(this.checkWatchdog, this.watchdogTimeout - this.cpu.cycles);
          } else {
            this.scheduled = false;
          }
        };
        const { WDTCSR } = config;
        this.cpu.onWatchdogReset = () => {
          this.resetWatchdog();
        };
        cpu.writeHooks[WDTCSR] = (value, oldValue) => {
          if (value & WDTCSR_WDCE && value & WDTCSR_WDE) {
            this.changeEnabledCycles = this.cpu.cycles + 4;
            value = value & ~WDTCSR_PROTECT_MASK;
          } else {
            if (this.cpu.cycles >= this.changeEnabledCycles) {
              value = value & ~WDTCSR_PROTECT_MASK | oldValue & WDTCSR_PROTECT_MASK;
            }
            this.enabledValue = !!(value & WDTCSR_WDE || value & WDTCSR_WDIE);
            this.cpu.data[WDTCSR] = value;
          }
          if (this.enabled) {
            this.resetWatchdog();
          }
          if (this.enabled && !this.scheduled) {
            this.cpu.addClockEvent(this.checkWatchdog, this.watchdogTimeout - this.cpu.cycles);
          }
          this.cpu.clearInterruptByFlag(this.Watchdog, value);
          return true;
        };
      }
      resetWatchdog() {
        const cycles = Math.floor(this.clock.frequency / this.clockFrequency * this.prescaler);
        this.watchdogTimeout = this.cpu.cycles + cycles;
      }
      get enabled() {
        return this.enabledValue;
      }
      /**
       * The base clock frequency is 128KHz. Thus, a prescaler of 2048 gives 16ms timeout.
       */
      get prescaler() {
        const wdtcsr = this.cpu.data[this.config.WDTCSR];
        const value = (wdtcsr & WDTCSR_WDP3) >> 2 | wdtcsr & WDTCSR_WDP210;
        return 2048 << value;
      }
    };
    exports.AVRWatchdog = AVRWatchdog;
  }
});

// node_modules/avr8js/dist/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/avr8js/dist/cjs/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.watchdogConfig = exports.AVRWatchdog = exports.AVRUSI = exports.usart0Config = exports.AVRUSART = exports.attinyTimer1Config = exports.ATtinyTimer1 = exports.timer2Config = exports.timer1Config = exports.timer0Config = exports.AVRTimer = exports.spiConfig = exports.AVRSPI = exports.portLConfig = exports.portKConfig = exports.portJConfig = exports.portHConfig = exports.portGConfig = exports.portFConfig = exports.portEConfig = exports.portDConfig = exports.portCConfig = exports.portBConfig = exports.portAConfig = exports.PinState = exports.PCINT2 = exports.PCINT1 = exports.PCINT0 = exports.INT1 = exports.INT0 = exports.AVRIOPort = exports.eepromConfig = exports.EEPROMMemoryBackend = exports.AVREEPROM = exports.clockConfig = exports.AVRClock = exports.atmega328Channels = exports.adcConfig = exports.AVRADC = exports.ADCReference = exports.ADCMuxInputType = exports.avrInterrupt = exports.avrInstruction = exports.CPU = void 0;
    var cpu_1 = require_cpu();
    Object.defineProperty(exports, "CPU", { enumerable: true, get: function() {
      return cpu_1.CPU;
    } });
    var instruction_1 = require_instruction();
    Object.defineProperty(exports, "avrInstruction", { enumerable: true, get: function() {
      return instruction_1.avrInstruction;
    } });
    var interrupt_1 = require_interrupt();
    Object.defineProperty(exports, "avrInterrupt", { enumerable: true, get: function() {
      return interrupt_1.avrInterrupt;
    } });
    var adc_1 = require_adc();
    Object.defineProperty(exports, "ADCMuxInputType", { enumerable: true, get: function() {
      return adc_1.ADCMuxInputType;
    } });
    Object.defineProperty(exports, "ADCReference", { enumerable: true, get: function() {
      return adc_1.ADCReference;
    } });
    Object.defineProperty(exports, "AVRADC", { enumerable: true, get: function() {
      return adc_1.AVRADC;
    } });
    Object.defineProperty(exports, "adcConfig", { enumerable: true, get: function() {
      return adc_1.adcConfig;
    } });
    Object.defineProperty(exports, "atmega328Channels", { enumerable: true, get: function() {
      return adc_1.atmega328Channels;
    } });
    var clock_1 = require_clock();
    Object.defineProperty(exports, "AVRClock", { enumerable: true, get: function() {
      return clock_1.AVRClock;
    } });
    Object.defineProperty(exports, "clockConfig", { enumerable: true, get: function() {
      return clock_1.clockConfig;
    } });
    var eeprom_1 = require_eeprom();
    Object.defineProperty(exports, "AVREEPROM", { enumerable: true, get: function() {
      return eeprom_1.AVREEPROM;
    } });
    Object.defineProperty(exports, "EEPROMMemoryBackend", { enumerable: true, get: function() {
      return eeprom_1.EEPROMMemoryBackend;
    } });
    Object.defineProperty(exports, "eepromConfig", { enumerable: true, get: function() {
      return eeprom_1.eepromConfig;
    } });
    var gpio_1 = require_gpio();
    Object.defineProperty(exports, "AVRIOPort", { enumerable: true, get: function() {
      return gpio_1.AVRIOPort;
    } });
    Object.defineProperty(exports, "INT0", { enumerable: true, get: function() {
      return gpio_1.INT0;
    } });
    Object.defineProperty(exports, "INT1", { enumerable: true, get: function() {
      return gpio_1.INT1;
    } });
    Object.defineProperty(exports, "PCINT0", { enumerable: true, get: function() {
      return gpio_1.PCINT0;
    } });
    Object.defineProperty(exports, "PCINT1", { enumerable: true, get: function() {
      return gpio_1.PCINT1;
    } });
    Object.defineProperty(exports, "PCINT2", { enumerable: true, get: function() {
      return gpio_1.PCINT2;
    } });
    Object.defineProperty(exports, "PinState", { enumerable: true, get: function() {
      return gpio_1.PinState;
    } });
    Object.defineProperty(exports, "portAConfig", { enumerable: true, get: function() {
      return gpio_1.portAConfig;
    } });
    Object.defineProperty(exports, "portBConfig", { enumerable: true, get: function() {
      return gpio_1.portBConfig;
    } });
    Object.defineProperty(exports, "portCConfig", { enumerable: true, get: function() {
      return gpio_1.portCConfig;
    } });
    Object.defineProperty(exports, "portDConfig", { enumerable: true, get: function() {
      return gpio_1.portDConfig;
    } });
    Object.defineProperty(exports, "portEConfig", { enumerable: true, get: function() {
      return gpio_1.portEConfig;
    } });
    Object.defineProperty(exports, "portFConfig", { enumerable: true, get: function() {
      return gpio_1.portFConfig;
    } });
    Object.defineProperty(exports, "portGConfig", { enumerable: true, get: function() {
      return gpio_1.portGConfig;
    } });
    Object.defineProperty(exports, "portHConfig", { enumerable: true, get: function() {
      return gpio_1.portHConfig;
    } });
    Object.defineProperty(exports, "portJConfig", { enumerable: true, get: function() {
      return gpio_1.portJConfig;
    } });
    Object.defineProperty(exports, "portKConfig", { enumerable: true, get: function() {
      return gpio_1.portKConfig;
    } });
    Object.defineProperty(exports, "portLConfig", { enumerable: true, get: function() {
      return gpio_1.portLConfig;
    } });
    var spi_1 = require_spi();
    Object.defineProperty(exports, "AVRSPI", { enumerable: true, get: function() {
      return spi_1.AVRSPI;
    } });
    Object.defineProperty(exports, "spiConfig", { enumerable: true, get: function() {
      return spi_1.spiConfig;
    } });
    var timer_1 = require_timer();
    Object.defineProperty(exports, "AVRTimer", { enumerable: true, get: function() {
      return timer_1.AVRTimer;
    } });
    Object.defineProperty(exports, "timer0Config", { enumerable: true, get: function() {
      return timer_1.timer0Config;
    } });
    Object.defineProperty(exports, "timer1Config", { enumerable: true, get: function() {
      return timer_1.timer1Config;
    } });
    Object.defineProperty(exports, "timer2Config", { enumerable: true, get: function() {
      return timer_1.timer2Config;
    } });
    var timer_attiny_1 = require_timer_attiny();
    Object.defineProperty(exports, "ATtinyTimer1", { enumerable: true, get: function() {
      return timer_attiny_1.ATtinyTimer1;
    } });
    Object.defineProperty(exports, "attinyTimer1Config", { enumerable: true, get: function() {
      return timer_attiny_1.attinyTimer1Config;
    } });
    __exportStar(require_twi(), exports);
    var usart_1 = require_usart();
    Object.defineProperty(exports, "AVRUSART", { enumerable: true, get: function() {
      return usart_1.AVRUSART;
    } });
    Object.defineProperty(exports, "usart0Config", { enumerable: true, get: function() {
      return usart_1.usart0Config;
    } });
    var usi_1 = require_usi();
    Object.defineProperty(exports, "AVRUSI", { enumerable: true, get: function() {
      return usi_1.AVRUSI;
    } });
    var watchdog_1 = require_watchdog();
    Object.defineProperty(exports, "AVRWatchdog", { enumerable: true, get: function() {
      return watchdog_1.AVRWatchdog;
    } });
    Object.defineProperty(exports, "watchdogConfig", { enumerable: true, get: function() {
      return watchdog_1.watchdogConfig;
    } });
  }
});

// src/robotics/catalog/combat.ts
var prism = (width, yz, x = 0, massFraction = 1) => ({ vertices: [-1, 1].flatMap((sign) => yz.flatMap(([y, z]) => [x + sign * width / 2, y, z])), massFraction });
var box = (w, h, d, at, fraction) => prism(w, [[at[1] - h / 2, at[2] - d / 2], [at[1] + h / 2, at[2] - d / 2], [at[1] + h / 2, at[2] + d / 2], [at[1] - h / 2, at[2] + d / 2]], at[0], fraction);
var shapes = {
  "sumo-wedge": [prism(0.18, [[-0.02, -0.0375], [0.02, -0.0375], [-0.018, 0.0375], [-0.02, 0.0375]])],
  "sumo-scoop": [
    prism(0.2, [[-0.0225, -0.035], [-0.0145, -0.035], [-0.0195, 0.055], [-0.0225, 0.055]], 0, 0.4),
    box(0.2, 0.045, 3e-3, [0, 0, -0.0335], 0.22),
    prism(3e-3, [[-0.0225, -0.035], [0.0225, -0.035], [-0.01, 0.055], [-0.0225, 0.055]], -0.0985, 0.15),
    prism(3e-3, [[-0.0225, -0.035], [0.0225, -0.035], [-0.01, 0.055], [-0.0225, 0.055]], 0.0985, 0.15),
    box(0.012, 4e-3, 0.02, [-0.05, 0.0175, -0.045], 0.04),
    box(0.012, 4e-3, 0.02, [0.05, 0.0175, -0.045], 0.04)
  ],
  "sumo-bumper": [box(0.2, 0.065, 0.018, [0, 0, 0], 1)]
};
var COMBAT_DEFINITIONS = [
  { id: "sumo-wedge", name: "Cu\xF1a de sumo", dimensions: [0.18, 0.04, 0.075], massKg: 0.065, mountY: 0.02, summary: "Rampa fija de perfil bajo para entrar bajo el rival y empujarlo. Modelo did\xE1ctico de 180 \xD7 40 \xD7 75 mm.", keywords: ["cu\xF1a", "pala", "sumo", "rampa", "empujar", "combate", "blade"] },
  { id: "sumo-scoop", name: "Pala empujadora", dimensions: [0.2, 0.045, 0.11], massKg: 0.1, mountY: 0.0175, summary: "Pala fija con base inclinada, respaldo, laterales y pesta\xF1as de montaje. Modelo did\xE1ctico de 200 \xD7 45 \xD7 110 mm; sin mecanismo de elevaci\xF3n.", keywords: ["pala", "cuchara", "bulldozer", "empujar", "sumo", "combate", "scoop"] },
  { id: "sumo-bumper", name: "Defensa frontal ancha", dimensions: [0.2, 0.065, 0.018], massKg: 0.09, mountY: 75e-4, summary: "Escudo fijo vertical para empujar y proteger el frente. Modelo did\xE1ctico de 200 \xD7 65 \xD7 18 mm.", keywords: ["defensa", "escudo", "parachoques", "empujar", "sumo", "combate"] }
].map((d) => ({ ...d, dimensions: d.dimensions, category: "structure", dimensionsSource: "approximate", pins: [], anchors: [{ id: "back", label: "Fijaci\xF3n posterior", position: [0, d.mountY, -d.dimensions[2] / 2], normal: [0, 0, -1], tag: "combat-mount", accepts: [] }], scalable: false, model: "procedural" }));

// src/robotics/conveyor/constants.ts
var CONVEYOR_ID = "educational-conveyor";

// src/robotics/conveyor/catalog.ts
var conveyorDefinition = {
  id: CONVEYOR_ID,
  name: "Cinta transportadora \xB7 c\xE9lula educativa",
  category: "actuator",
  dimensions: [0.16, 0.08, 0.72],
  dimensionsSource: "approximate",
  massKg: 1.2,
  pins: [],
  anchors: [],
  scalable: false,
  model: "procedural",
  props: [
    { id: "speedMps", label: "Velocidad de cinta (m/s)", type: "number", min: 0.02, max: 0.12, default: 0.08 },
    { id: "jammed", label: "Falla: cinta atascada", type: "boolean", default: false },
    { id: "sensorFault", label: "Falla: sensor no detecta", type: "boolean", default: false }
  ],
  summary: "Banda de 720 mm, rodillos, sensor de presencia y lectura RGB did\xE1cticos. Transporte y clasificaci\xF3n coordinados con el E6; control por secuencia, sin conexi\xF3n el\xE9ctrica ni hardware real.",
  keywords: ["cinta", "transportadora", "banda", "linea", "clasificacion", "color", "sensor", "produccion"]
};

// src/robotics/catalog/index.ts
var mm = (v) => v / 1e3;
var pin = (id, label, position, role, extra = {}) => ({ id, label, position, role, ...extra });
var anchor = (id, label, position, normal, tag, accepts = []) => ({ id, label, position, normal, tag, accepts });
var UP = [0, 1, 0];
var DOWN = [0, -1, 0];
var PWM_PINS = /* @__PURE__ */ new Set([3, 5, 6, 9, 10, 11]);
var unoPins = [];
var pitch = mm(2.54);
var hx = mm(23.5);
var digitalZ = (i) => mm(31.5) - i * pitch - (i >= 8 ? mm(4) : 0);
for (let n = 0; n <= 13; n++) unoPins.push(pin(`D${n}`, `D${n}`, [hx, mm(7.5), digitalZ(n)], PWM_PINS.has(n) ? "pwm" : "digital", { electrical: { vMax: 5, iMax: 0.02 } }));
unoPins.push(pin("GND.3", "GND", [hx, mm(7.5), digitalZ(14)], "ground", { internalNet: "GND" }));
["A0", "A1", "A2", "A3", "A4", "A5"].forEach((id, i) => unoPins.push(pin(id, id, [-hx, mm(7.5), mm(10) - i * pitch], "analog", { electrical: { vMax: 5 } })));
unoPins.push(pin("VIN", "VIN", [-hx, mm(7.5), mm(10) + 1 * pitch], "power-in", { electrical: { vMax: 12 } }));
unoPins.push(pin("GND.1", "GND", [-hx, mm(7.5), mm(10) + 2 * pitch], "ground", { internalNet: "GND" }));
unoPins.push(pin("GND.2", "GND", [-hx, mm(7.5), mm(10) + 3 * pitch], "ground", { internalNet: "GND" }));
unoPins.push(pin("5V", "5V", [-hx, mm(7.5), mm(10) + 4 * pitch], "power-out", { electrical: { vMax: 5, iMax: 0.5 } }));
unoPins.push(pin("3V3", "3,3V", [-hx, mm(7.5), mm(10) + 5 * pitch], "power-out", { electrical: { vMax: 3.3, iMax: 0.15 } }));
var arduino = {
  id: "arduino-uno-r3",
  name: "Arduino UNO R3",
  category: "control",
  dimensions: [mm(53.4), mm(15), mm(68.6)],
  dimensionsSource: "datasheet",
  massKg: 0.025,
  pins: unoPins,
  anchors: [anchor("base", "Base", [0, -mm(7.5), 0], DOWN, "board-mount")],
  props: [{ id: "usb", label: "Alimentada por USB (virtual, 5 V)", type: "boolean", default: false }],
  scalable: false,
  model: "procedural",
  summary: "Placa de control con el microcontrolador ATmega328P.",
  keywords: ["arduino", "uno", "placa", "microcontrolador", "atmega"]
};
var l298n = {
  id: "l298n-module",
  name: "Driver L298N",
  category: "driver",
  dimensions: [mm(43), mm(27), mm(43)],
  dimensionsSource: "approximate",
  massKg: 0.03,
  pins: [
    pin("OUT1", "OUT1", [-mm(21.5), mm(8), mm(8)], "motor"),
    pin("OUT2", "OUT2", [-mm(21.5), mm(8), mm(2)], "motor"),
    pin("OUT3", "OUT3", [mm(21.5), mm(8), mm(8)], "motor"),
    pin("OUT4", "OUT4", [mm(21.5), mm(8), mm(2)], "motor"),
    pin("+12V", "+12V", [-mm(5), mm(8), -mm(21.5)], "power-in", { electrical: { vMax: 35, iMax: 2 } }),
    pin("GND", "GND", [0, mm(8), -mm(21.5)], "ground"),
    pin("+5V", "+5V", [mm(5), mm(8), -mm(21.5)], "power-out", { electrical: { vMax: 5, iMax: 0.5 } }),
    pin("ENA", "ENA", [-mm(10), mm(8), mm(21.5)], "pwm"),
    pin("IN1", "IN1", [-mm(6), mm(8), mm(21.5)], "digital"),
    pin("IN2", "IN2", [-mm(2), mm(8), mm(21.5)], "digital"),
    pin("IN3", "IN3", [mm(2), mm(8), mm(21.5)], "digital"),
    pin("IN4", "IN4", [mm(6), mm(8), mm(21.5)], "digital"),
    pin("ENB", "ENB", [mm(10), mm(8), mm(21.5)], "pwm")
  ],
  anchors: [anchor("base", "Base", [0, -mm(13.5), 0], DOWN, "driver-mount")],
  props: [
    { id: "jumperENA", label: "Puente ENA (canal A siempre activo)", type: "boolean", default: true },
    { id: "jumperENB", label: "Puente ENB (canal B siempre activo)", type: "boolean", default: true },
    { id: "jumper5V", label: "Puente regulador 5 V", type: "boolean", default: true }
  ],
  scalable: false,
  model: "procedural",
  summary: "Puente H para dos motores DC; los puentes de ENA/ENB y 5 V son ajustables.",
  keywords: ["l298n", "driver", "puente h", "motor", "controlador"]
};
var hcsr04 = {
  id: "hc-sr04",
  name: "Sensor HC-SR04",
  category: "sensor",
  dimensions: [mm(45), mm(20), mm(15)],
  dimensionsSource: "datasheet",
  massKg: 9e-3,
  pins: [pin("VCC", "VCC", [-mm(3.8), -mm(7), -mm(7.5)], "power-in", { electrical: { vMax: 5.5 } }), pin("TRIG", "TRIG", [-mm(1.3), -mm(7), -mm(7.5)], "digital"), pin("ECHO", "ECHO", [mm(1.3), -mm(7), -mm(7.5)], "digital"), pin("GND", "GND", [mm(3.8), -mm(7), -mm(7.5)], "ground")],
  anchors: [anchor("base", "Base", [0, -mm(10), 0], DOWN, "sensor-mount")],
  // Banco de pruebas controlado (etapa 4): la física con obstáculos llega en la etapa 5.
  props: [{ id: "testDistance", label: "Distancia de prueba (m) \u2014 banco controlado", type: "number", min: 0.02, max: 4, default: 0.3 }],
  scalable: false,
  model: "procedural",
  summary: "Mide distancia con ultrasonido (2\u2013400 cm).",
  keywords: ["hc-sr04", "ultrasonico", "ultrasonido", "distancia", "sensor", "trig", "echo"]
};
var motor = {
  id: "dc-motor-tt",
  name: "Motor DC TT",
  category: "actuator",
  dimensions: [mm(70), mm(22), mm(18)],
  dimensionsSource: "approximate",
  massKg: 0.03,
  pins: [pin("M+", "M+", [-mm(30), mm(4), -mm(9)], "motor"), pin("M-", "M\u2212", [-mm(30), -mm(4), -mm(9)], "motor")],
  anchors: [
    anchor("base", "Base", [0, mm(11), 0], UP, "motor-mount"),
    anchor("axle-r", "Eje derecho", [mm(42), 0, 0], [1, 0, 0], "axle", ["wheel-hub"]),
    anchor("axle-l", "Eje izquierdo", [-mm(42), 0, 0], [-1, 0, 0], "axle", ["wheel-hub"]),
    anchor("track-r", "Oruga derecha", [mm(42), 0, 0], [1, 0, 0], "slot-track-r", ["track-mount"]),
    anchor("track-l", "Oruga izquierda", [-mm(42), 0, 0], [-1, 0, 0], "slot-track-l", ["track-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Motor con reductora y doble eje para las ruedas.",
  keywords: ["motor", "dc", "tt", "reductora", "eje"]
};
var wheel = {
  id: "wheel-65",
  name: "Rueda 65 mm",
  category: "structure",
  dimensions: [mm(26), mm(65), mm(65)],
  dimensionsSource: "approximate",
  massKg: 0.03,
  pins: [],
  anchors: [anchor("hub", "Cubo", [0, 0, 0], [1, 0, 0], "wheel-hub")],
  scalable: false,
  model: "procedural",
  summary: "Rueda de goma de 65 mm para el eje del motor.",
  keywords: ["rueda", "llanta", "goma"]
};
var caster = {
  id: "caster-ball",
  name: "Rueda loca",
  category: "structure",
  dimensions: [mm(25), mm(43), mm(25)],
  dimensionsSource: "approximate",
  massKg: 0.01,
  pins: [],
  anchors: [anchor("base", "Base", [0, mm(21.5), 0], UP, "caster-mount")],
  scalable: false,
  model: "procedural",
  summary: "Esfera de apoyo libre, sin motor (con separador: su base toca el suelo con las ruedas de 65 mm).",
  keywords: ["rueda loca", "caster", "bola", "apoyo"]
};
var chassis = {
  id: "chassis-2wd",
  name: "Chasis 2WD",
  category: "structure",
  dimensions: [mm(140), mm(4), mm(210)],
  dimensionsSource: "approximate",
  massKg: 0.12,
  pins: [],
  props: [{ id: "color", label: "Acabado: placa acr\xEDlica azul o base blanca de oruga", type: "enum", options: ["azul", "oruga"], default: "azul" }],
  anchors: [
    anchor("combat-front", "Pala, cu\xF1a o defensa frontal", [0, 0, mm(105)], [0, 0, 1], "slot-combat", ["combat-mount"]),
    anchor("combat-sensor", "Sensor elevado para sumo", [0, mm(30), mm(45)], UP, "slot-combat-sensor", ["bracket-mount"]),
    anchor("combat-ir", "Sensores de borde para pala 4WD", [0, -mm(2), mm(95)], DOWN, "slot-combat-ir", ["line-support"]),
    anchor("motor-l", "Motor izquierdo", [-mm(62), -mm(2), -mm(20)], DOWN, "slot-motor", ["motor-mount"]),
    anchor("motor-r", "Motor derecho", [mm(62), -mm(2), -mm(20)], DOWN, "slot-motor", ["motor-mount"]),
    anchor("caster", "Rueda loca", [0, -mm(2), mm(85)], DOWN, "slot-caster", ["caster-mount"]),
    anchor("board-left", "Arduino lateral", [mm(-33), mm(2), mm(15)], UP, "slot-board-left", ["board-mount"]),
    anchor("breadboard", "Protoboard", [mm(32), mm(2), mm(10)], UP, "slot-breadboard", ["board-mount"]),
    anchor("driver-rear", "Driver posterior", [mm(-10), mm(2), mm(-70)], UP, "slot-driver-rear", ["driver-mount"]),
    anchor("regulator", "Regulador", [mm(44), mm(2), mm(-70)], UP, "slot-regulator", ["regulator-mount"]),
    anchor("switch", "Interruptor", [mm(-48), mm(2), mm(-75)], UP, "slot-switch", ["switch-mount"]),
    anchor("line-sensors", "Soporte infrarrojos", [0, -mm(2), mm(80)], DOWN, "slot-line-support", ["line-support"]),
    anchor("neck", "Cuello (servo)", [-mm(5.6), mm(2), mm(95)], UP, "slot-neck", ["sensor-mount"]),
    // el cuerno del servo queda justo en el eje central del robot
    anchor("torso", "Armaz\xF3n superior (torso)", [0, mm(2), -mm(5)], UP, "slot-torso", ["torso-mount"]),
    // Alternative mechanical layouts reuse the same parts; original anchors stay available.
    anchor("4wd-motor-rl", "Motor trasero izquierdo", [mm(-62), mm(-2), mm(-65)], DOWN, "slot-4wd-motor-rl", ["motor-mount"]),
    anchor("4wd-motor-rr", "Motor trasero derecho", [mm(62), mm(-2), mm(-65)], DOWN, "slot-4wd-motor-rr", ["motor-mount"]),
    anchor("4wd-motor-fl", "Motor delantero izquierdo", [mm(-62), mm(-2), mm(65)], DOWN, "slot-4wd-motor-fl", ["motor-mount"]),
    anchor("4wd-motor-fr", "Motor delantero derecho", [mm(62), mm(-2), mm(65)], DOWN, "slot-4wd-motor-fr", ["motor-mount"]),
    anchor("4wd-driver-a", "Driver posterior izquierdo", [mm(-30), mm(2), mm(-75)], UP, "slot-4wd-driver-a", ["driver-mount"]),
    anchor("4wd-driver-b", "Driver posterior derecho", [mm(30), mm(2), mm(-75)], UP, "slot-4wd-driver-b", ["driver-mount"]),
    anchor("4wd-regulator", "Regulador delantero", [mm(44), mm(2), mm(75)], UP, "slot-4wd-regulator", ["regulator-mount"]),
    anchor("4wd-switch", "Interruptor delantero", [mm(-48), mm(2), mm(75)], UP, "slot-4wd-switch", ["switch-mount"]),
    anchor("4wd-battery", "Bateria central inferior", [0, mm(-2), 0], DOWN, "slot-4wd-battery", ["battery-mount"]),
    anchor("tower-post-fl", "Columna delantera izquierda", [mm(-45), mm(2), mm(75)], UP, "slot-tower-post-fl", ["bracket-mount"]),
    anchor("tower-post-fr", "Columna delantera derecha", [mm(45), mm(2), mm(75)], UP, "slot-tower-post-fr", ["bracket-mount"]),
    anchor("tower-post-rl", "Columna trasera izquierda", [mm(-45), mm(2), mm(-75)], UP, "slot-tower-post-rl", ["bracket-mount"]),
    anchor("tower-post-rr", "Columna trasera derecha", [mm(45), mm(2), mm(-75)], UP, "slot-tower-post-rr", ["bracket-mount"]),
    anchor("tower-driver", "Driver del piso inferior", [0, mm(2), mm(-55)], UP, "slot-tower-driver", ["driver-mount"]),
    anchor("tower-regulator", "Regulador del piso inferior", [mm(45), mm(2), mm(-50)], UP, "slot-tower-regulator", ["regulator-mount"]),
    anchor("tower-switch", "Interruptor del piso inferior", [mm(-48), mm(2), mm(-45)], UP, "slot-tower-switch", ["switch-mount"]),
    anchor("tower-board", "Protoboard transversal", [0, mm(2), mm(10)], UP, "slot-tower-board", ["board-mount"]),
    anchor("sumo-motor-l", "Traccion delantera izquierda", [mm(-64), mm(-2), mm(45)], DOWN, "slot-sumo-motor-l", ["motor-mount"]),
    anchor("sumo-motor-r", "Traccion delantera derecha", [mm(64), mm(-2), mm(45)], DOWN, "slot-sumo-motor-r", ["motor-mount"]),
    anchor("sumo-caster", "Apoyo trasero", [0, mm(-2), mm(-85)], DOWN, "slot-sumo-caster", ["caster-mount"]),
    anchor("sumo-battery", "Bateria trasera inferior", [0, mm(-2), mm(-40)], DOWN, "slot-sumo-battery", ["battery-mount"]),
    anchor("sumo-uno", "Placa transversal trasera", [0, mm(2), mm(-75)], UP, "slot-sumo-uno", ["board-mount"]),
    anchor("sumo-board", "Protoboard transversal central", [0, mm(2), mm(-10)], UP, "slot-sumo-board", ["board-mount"]),
    anchor("sumo-driver", "Driver lateral delantero", [mm(-38), mm(2), mm(55)], UP, "slot-sumo-driver", ["driver-mount"]),
    anchor("sumo-regulator", "Regulador lateral", [mm(45), mm(2), mm(45)], UP, "slot-sumo-regulator", ["regulator-mount"]),
    anchor("sumo-switch", "Interruptor lateral", [mm(45), mm(2), mm(75)], UP, "slot-sumo-switch", ["switch-mount"]),
    anchor("sumo-ir", "Sensores adelantados", [0, mm(-2), mm(55)], DOWN, "slot-sumo-ir", ["line-support"]),
    anchor("sumo-post-l", "Defensa izquierda", [mm(-40), mm(-2), mm(90)], DOWN, "slot-sumo-post-l", ["bracket-mount"]),
    anchor("sumo-post-c", "Defensa central", [0, mm(-2), mm(90)], DOWN, "slot-sumo-post-c", ["bracket-mount"]),
    anchor("sumo-post-r", "Defensa derecha", [mm(40), mm(-2), mm(90)], DOWN, "slot-sumo-post-r", ["bracket-mount"]),
    anchor("stack-corner", "Apoyo de esquina para segundo piso", [-mm(45), -mm(2), -mm(75)], DOWN, "plate-mount"),
    anchor("board", "Placa", [0, mm(2), mm(40)], UP, "slot-board", ["board-mount"]),
    anchor("driver", "Driver", [0, mm(2), -mm(45)], UP, "slot-driver", ["driver-mount"]),
    anchor("battery", "Portapilas", [0, -mm(2), mm(30)], DOWN, "slot-battery", ["battery-mount"]),
    anchor("front", "Soporte frontal", [0, mm(2), mm(100)], UP, "slot-front", ["bracket-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Base de acr\xEDlico con anclajes para motores, placa, driver, portapilas y soporte.",
  keywords: ["chasis", "base", "acrilico", "2wd", "robot"]
};
var battery = {
  id: "battery-holder-4aa",
  name: "Portapilas 4\xD7AA",
  category: "power",
  dimensions: [mm(63), mm(16), mm(58)],
  dimensionsSource: "approximate",
  massKg: 0.08,
  // D-11 (resuelta con un supuesto): el voltaje es una propiedad editable. 4 pilas AA alcalinas ≈ 6 V; se corrige con el kit real.
  pins: [pin("B+", "Positivo (+)", [mm(-26), mm(8.5), mm(-27)], "power-out", { electrical: { vMax: 24, iMax: 2 } }), pin("B-", "Negativo (\u2212)", [mm(26), mm(8.5), mm(-27)], "ground")],
  props: [{ id: "voltage", label: "Voltaje (V) \u2014 supuesto de 4\xD7AA; verif\xEDcalo con el kit", type: "number", min: 1.5, max: 24, default: 6 }],
  anchors: [anchor("base", "Base", [0, mm(8), 0], UP, "battery-mount")],
  scalable: false,
  model: "procedural",
  summary: "Portapilas con terminales + y \u2212. Voltaje editable (por defecto 6 V, 4\xD7AA: supuesto a verificar con el kit).",
  keywords: ["portapilas", "bateria", "pilas", "aa", "alimentacion", "voltaje"]
};
var sensorBracket = {
  id: "sensor-bracket",
  name: "Soporte del sensor",
  category: "structure",
  dimensions: [mm(50), mm(30), mm(12)],
  dimensionsSource: "approximate",
  massKg: 0.01,
  pins: [],
  anchors: [anchor("base", "Base", [0, -mm(15), 0], DOWN, "bracket-mount"), anchor("sensor", "Sensor", [0, 0, mm(6)], [0, 0, 1], "slot-sensor", ["sensor-mount"])],
  scalable: false,
  model: "procedural",
  summary: "Escuadra para fijar el HC-SR04 al frente del chasis.",
  keywords: ["soporte", "escuadra", "sensor", "bracket"]
};
var genericBracket = {
  id: "bracket-generic",
  name: "Soporte gen\xE9rico",
  category: "structure",
  dimensions: [mm(40), mm(20), mm(20)],
  dimensionsSource: "approximate",
  massKg: 8e-3,
  pins: [],
  anchors: [anchor("base", "Base", [0, -mm(10), 0], DOWN, "bracket-mount"), anchor("top", "Superior", [0, mm(10), 0], UP, "slot-generic", ["board-mount", "driver-mount", "battery-mount", "sensor-mount", "bracket-mount", "plate-mount"]), anchor("front-low", "Extension baja frontal", [0, mm(10), -mm(10)], UP, "slot-low-bumper", ["bracket-mount"])],
  scalable: false,
  model: "procedural",
  summary: "Bloque para elevar o fijar cualquier placa o m\xF3dulo.",
  keywords: ["soporte", "separador", "bloque", "generico"]
};
var led = {
  id: "led-5mm",
  name: "LED 5 mm",
  category: "actuator",
  dimensions: [mm(5.8), mm(9), mm(5.8)],
  dimensionsSource: "approximate",
  massKg: 5e-4,
  pins: [pin("A", "\xC1nodo (+)", [-mm(1.27), -mm(4.5), 0], "signal"), pin("K", "C\xE1todo (\u2212)", [mm(1.27), -mm(4.5), 0], "signal")],
  props: [{ id: "color", label: "Color", type: "enum", options: ["rojo", "verde", "amarillo", "azul"], default: "rojo" }],
  anchors: [anchor("base", "Patas", [0, -mm(4.5), 0], DOWN, "led-mount")],
  scalable: false,
  model: "procedural",
  summary: "Diodo emisor de luz. Sin resistencia en serie se puede quemar.",
  keywords: ["led", "diodo", "luz", "indicador"]
};
var resistor = {
  id: "resistor",
  name: "Resistencia",
  category: "passive",
  dimensions: [mm(6.3), mm(2.4), mm(2.4)],
  dimensionsSource: "approximate",
  massKg: 2e-4,
  pins: [pin("P1", "Pata 1", [-mm(4.5), 0, 0], "signal"), pin("P2", "Pata 2", [mm(4.5), 0, 0], "signal")],
  props: [{ id: "ohms", label: "Resistencia (\u03A9)", type: "number", min: 1, max: 1e6, default: 220 }],
  anchors: [anchor("base", "Apoyo", [0, -mm(1.2), 0], DOWN, "resistor-mount")],
  scalable: false,
  model: "procedural",
  summary: "Resistencia de 1/4 W; por defecto 220 \u03A9, la de un LED con 5 V.",
  keywords: ["resistencia", "resistor", "ohm", "pasivo"]
};
var breadboardPins = [];
var breadboardColumns = [-13.97, -11.43, -8.89, -6.35, -3.81, 3.81, 6.35, 8.89, 11.43, 13.97];
for (let row = 1; row <= 30; row++) {
  for (let col = 0; col < 10; col++) {
    const id = `${"ABCDEFGHIJ"[col]}${row}`;
    breadboardPins.push(pin(id, id, [mm(breadboardColumns[col]), mm(4.65), mm((row - 15.5) * 2.54)], "signal", { internalNet: `${col < 5 ? "left" : "right"}-${row}` }));
  }
}
for (const [side, sign, x] of [["L", "+", -22.86], ["L", "-", -20.32], ["R", "+", 20.32], ["R", "-", 22.86]]) {
  for (let n = 1; n <= 25; n++) {
    const id = `${side}${sign}${n}`;
    const z = -35.56 + (n - 1 + Math.floor((n - 1) / 5)) * 2.54;
    breadboardPins.push(pin(id, `${side === "L" ? "Izq." : "Der."} ${sign} ${n}`, [mm(x), mm(4.65), mm(z)], "signal", { internalNet: `rail-${side}-${sign}` }));
  }
}
var breadboard = {
  id: "breadboard-400",
  name: "Protoboard 400 puntos",
  category: "passive",
  dimensions: [mm(55), mm(9.3), mm(82.6)],
  dimensionsSource: "approximate",
  massKg: 0.038,
  pins: breadboardPins,
  anchors: [anchor("base", "Base adhesiva", [0, -mm(4.65), 0], DOWN, "board-mount"), anchor("indicator", "LED filas 20\u201321", [-mm(13.97), mm(4.65), mm(12.7)], UP, "slot-led", ["led-mount"]), anchor("resistor", "Resistencia filas 21\u201325", [-mm(8.89), mm(4.65), mm(19.05)], UP, "slot-resistor", ["resistor-mount"])],
  scalable: false,
  model: "procedural",
  summary: "400 puntos: A\u2013E y F\u2013J unidos por fila, separados por el canal central. Cuatro rieles continuos de 25 puntos, aislados entre s\xED; +/\u2212 no alimentan por s\xED solos.",
  keywords: ["protoboard", "breadboard", "placa de pruebas", "400", "riel", "orificios", "sin soldadura"]
};
var irSensor = {
  id: "tcrt5000-module",
  name: "Sensor de l\xEDnea TCRT5000",
  category: "sensor",
  dimensions: [mm(12), mm(8), mm(32)],
  dimensionsSource: "approximate",
  massKg: 4e-3,
  pins: [pin("VCC", "VCC", [-mm(2.54), mm(4), -mm(13)], "power-in", { electrical: { vMax: 5.5 } }), pin("GND", "GND", [0, mm(4), -mm(13)], "ground"), pin("DO", "DO", [mm(2.54), mm(4), -mm(13)], "digital")],
  anchors: [anchor("base", "Fijaci\xF3n superior", [0, mm(4), 0], UP, "ir-mount")],
  props: [{ id: "activeLow", label: "Salida baja sobre negro (invertir polaridad)", type: "boolean", default: false }, { id: "testBlack", label: "Negro en banco de pruebas (sin f\xEDsica)", type: "boolean", default: false }],
  scalable: false,
  model: "procedural",
  summary: "Sensor reflectivo digital mirando al suelo. Requiere 5 V y GND; DO cambia sobre la pista. Negro = HIGH por defecto; polaridad invertible.",
  keywords: ["infrarrojo", "ir", "linea", "tcrt5000", "reflectancia", "seguidor"]
};
var servoSg90 = {
  id: "servo-sg90",
  name: "Servo SG90",
  category: "actuator",
  dimensions: [mm(32.5), mm(22.7), mm(12)],
  dimensionsSource: "approximate",
  massKg: 9e-3,
  pins: [pin("SIG", "Se\xF1al", [-mm(18), -mm(4), -mm(2.54)], "pwm"), pin("VCC", "VCC", [-mm(18), -mm(4), 0], "power-in", { electrical: { vMax: 6 } }), pin("GND", "GND", [-mm(18), -mm(4), mm(2.54)], "ground")],
  anchors: [anchor("base", "Base", [0, -mm(11.35), 0], DOWN, "sensor-mount"), anchor("horn", "Cuerno (gira lo que le pongas encima)", [mm(5.6), mm(16.6), 0], UP, "slot-servo-horn", ["neck-mount"])],
  scalable: false,
  model: "procedural",
  summary: "Gira a un \xE1ngulo de 0\xB0 a 180\xB0 seg\xFAn el ancho del pulso de la se\xF1al (0,54\u20132,4 ms cada 20 ms). Necesita 5 V y GND; usa la biblioteca Servo.",
  keywords: ["servo", "sg90", "servomotor", "angulo", "brazo", "garra", "pwm", "actuador"]
};
var oled = {
  id: "oled-ssd1306",
  name: 'Pantalla OLED 2,42" I\xB2C',
  category: "actuator",
  dimensions: [mm(66), mm(4.5), mm(41)],
  dimensionsSource: "approximate",
  massKg: 0.012,
  pins: [
    pin("GND", "GND", [-mm(3.81), mm(2.5), -mm(17.5)], "ground"),
    pin("VCC", "VCC", [-mm(1.27), mm(2.5), -mm(17.5)], "power-in", { electrical: { vMax: 5.5 } }),
    pin("SCL", "SCL", [mm(1.27), mm(2.5), -mm(17.5)], "digital"),
    pin("SDA", "SDA", [mm(3.81), mm(2.5), -mm(17.5)], "digital")
  ],
  anchors: [anchor("base", "Base", [0, -mm(2.25), 0], DOWN, "sensor-mount")],
  props: [{ id: "address", label: "Direcci\xF3n I\xB2C (60 = 0x3C, 61 = 0x3D)", type: "number", min: 60, max: 61, default: 60 }],
  scalable: false,
  model: "procedural",
  summary: "Pantalla de 128 \xD7 64 p\xEDxeles y 2,42 pulgadas (la versi\xF3n grande del SSD1306: sirve para una cara con ojos y boca). En el Arduino UNO el I\xB2C usa A4 (SDA) y A5 (SCL). Se programa con Adafruit_SSD1306 y Adafruit_GFX: lo que dibujas se ve en la pantalla.",
  keywords: ["pantalla", "oled", "display", "ssd1306", "i2c", "cara", "ojos", "boca", "adafruit", "wire", "2.42"]
};
var pushButton = {
  id: "push-button-6mm",
  name: "Pulsador",
  category: "sensor",
  dimensions: [mm(12), mm(8), mm(12)],
  dimensionsSource: "approximate",
  massKg: 3e-3,
  pins: [pin("P1", "Terminal 1", [-mm(3.5), mm(2), -mm(5.5)], "digital"), pin("P2", "Terminal 2", [mm(3.5), mm(2), -mm(5.5)], "digital")],
  anchors: [anchor("base", "Base", [0, -mm(4), 0], DOWN, "sensor-mount")],
  props: [{ id: "pressed", label: "Pulsado al iniciar la simulaci\xF3n", type: "boolean", default: false }],
  scalable: false,
  model: "procedural",
  summary: "Al pulsarlo (bot\xF3n \xABPulsar\xBB del panel Estado o la tecla Espacio) une sus dos terminales. Con\xE9ctalo entre un pin y GND y usa pinMode(pin, INPUT_PULLUP): pulsado = LOW.",
  keywords: ["pulsador", "boton", "button", "interruptor", "entrada", "digital", "pullup"]
};
var potentiometer = {
  id: "potentiometer-10k",
  name: "Potenci\xF3metro 10 k\u03A9",
  category: "sensor",
  dimensions: [mm(18), mm(16), mm(18)],
  dimensionsSource: "approximate",
  massKg: 6e-3,
  pins: [pin("VCC", "Extremo 1 (VCC)", [-mm(5), -mm(5), -mm(8)], "power-in", { electrical: { vMax: 5.5 } }), pin("OUT", "Cursor (OUT)", [0, -mm(5), -mm(8)], "analog"), pin("GND", "Extremo 2 (GND)", [mm(5), -mm(5), -mm(8)], "ground")],
  anchors: [anchor("base", "Base", [0, -mm(8), 0], DOWN, "sensor-mount")],
  props: [{ id: "position", label: "Posici\xF3n inicial del cursor (0\u20131)", type: "number", min: 0, max: 1, default: 0.5 }],
  scalable: false,
  model: "procedural",
  summary: "Divisor de tensi\xF3n ajustable con el deslizador del panel Estado. Extremos a 5 V y GND, cursor a una entrada anal\xF3gica (A0\u2013A5): analogRead da 0\u20131023.",
  keywords: ["potenciometro", "pot", "perilla", "analogico", "analogread", "divisor", "tension", "resistencia variable"]
};
var robotHead = {
  id: "robot-head",
  name: "Cabeza del robot",
  category: "structure",
  dimensions: [mm(104), mm(78), mm(78)],
  dimensionsSource: "approximate",
  massKg: 0.08,
  pins: [],
  anchors: [
    anchor("base", "Cuello (al cuerno del servo)", [0, -mm(39), 0], DOWN, "neck-mount"),
    anchor("screen", "Pantalla (cara)", [0, mm(2), mm(39)], [0, 0, 1], "slot-head-screen", ["sensor-mount"]),
    anchor("visor", "Visor del radar", [0, mm(39), mm(12)], UP, "slot-head-visor", ["sensor-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Carcasa redondeada de 104 \xD7 78 \xD7 78 mm con el marco de la pantalla al frente y un soporte arriba para el HC-SR04. Gira con el servo del cuello: la cara y el radar miran hacia donde gira.",
  keywords: ["cabeza", "cara", "cuello", "robot", "radar", "carcasa", "oruga"]
};
var trackSprocket = {
  id: "track-sprocket",
  name: "Rueda motriz de oruga",
  category: "structure",
  dimensions: [mm(22), mm(65), mm(65)],
  dimensionsSource: "approximate",
  massKg: 0.035,
  pins: [],
  anchors: [anchor("hub", "Cubo", [0, 0, 0], [1, 0, 0], "wheel-hub")],
  scalable: false,
  model: "procedural",
  summary: "Rueda dentada de 65 mm que va en el eje del motor. Empuja al robot; la banda de la oruga se apoya sobre ella.",
  keywords: ["oruga", "rueda motriz", "sprocket", "dentada", "tanque"]
};
var trackBelt = {
  id: "track-belt",
  name: "Banda de oruga",
  category: "structure",
  dimensions: [mm(26), mm(65), mm(160)],
  dimensionsSource: "approximate",
  massKg: 0.045,
  pins: [],
  anchors: [anchor("base", "Fijaci\xF3n al motor", [0, 0, 0], [1, 0, 0], "track-mount")],
  scalable: false,
  model: "procedural",
  summary: "Banda de 160 mm con dientes que rodea la rueda motriz. En la simulaci\xF3n desliza sobre el suelo y el robot avanza por la rueda motriz: se comporta como un robot de dos ruedas con patines largos.",
  keywords: ["oruga", "banda", "cadena", "tanque", "patin"]
};
var robotTorso = {
  id: "robot-torso",
  name: "Cuerpo del robot (carcasa)",
  category: "structure",
  dimensions: [mm(136), mm(112), mm(150)],
  dimensionsSource: "approximate",
  massKg: 0.1,
  pins: [],
  anchors: [
    anchor("base", "Base (al chasis)", [0, -mm(56), 0], DOWN, "torso-mount"),
    anchor("neck", "Cuello (servo) arriba", [-mm(5.6), mm(56), mm(10)], UP, "slot-neck-top", ["sensor-mount"]),
    anchor("shoulder-l", "Hombro izquierdo (servo)", [mm(62), mm(34), mm(8)], [1, 0, 0], "slot-shoulder-l", ["sensor-mount"]),
    anchor("shoulder-r", "Hombro derecho (servo)", [-mm(62), mm(34), mm(8)], [-1, 0, 0], "slot-shoulder-r", ["sensor-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Carcasa compacta: marco blanco con paredes de vidrio ahumado, as\xED la electr\xF3nica del chasis se ve por dentro. Arriba lleva el cuello con la cabeza y a los lados los servos de los hombros.",
  keywords: ["torso", "cuerpo", "carcasa", "armazon", "estructura", "robot", "hombro", "vidrio"]
};
var robotArm = {
  id: "robot-arm",
  name: "Brazo del robot",
  category: "structure",
  dimensions: [mm(32), mm(84), mm(36)],
  dimensionsSource: "approximate",
  massKg: 0.05,
  pins: [],
  anchors: [
    anchor("base", "Hombro (al cuerno del servo)", [0, mm(42), 0], UP, "neck-mount"),
    anchor("elbow-l", "Codo (servo) del brazo izquierdo", [mm(28), -mm(38), 0], [1, 0, 0], "slot-elbow-l", ["sensor-mount"]),
    anchor("elbow-r", "Codo (servo) del brazo derecho", [-mm(28), -mm(38), 0], [-1, 0, 0], "slot-elbow-r", ["sensor-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Brazo de 84 mm con hombro azul. Cuelga del cuerno del servo del hombro (a 90\xB0 queda recto) y lleva en su extremo el servo del codo, que mueve el antebrazo.",
  keywords: ["brazo", "hombro", "robot", "codo", "saludar"]
};
var robotForearm = {
  id: "robot-forearm",
  name: "Antebrazo del robot",
  category: "structure",
  dimensions: [mm(28), mm(72), mm(24)],
  dimensionsSource: "approximate",
  massKg: 0.04,
  pins: [],
  anchors: [
    anchor("base", "Codo (al cuerno del servo)", [0, mm(36), 0], UP, "neck-mount"),
    anchor("wrist", "Mu\xF1eca (pinza)", [0, -mm(36), 0], DOWN, "slot-wrist", ["claw-mount"])
  ],
  scalable: false,
  model: "procedural",
  summary: "Antebrazo de 72 mm: cuelga del cuerno del servo del codo y lleva la pinza en la mu\xF1eca.",
  keywords: ["antebrazo", "codo", "brazo", "robot", "mu\xF1eca"]
};
var robotClaw = {
  id: "robot-claw",
  name: "Pinza del robot",
  category: "actuator",
  dimensions: [mm(34), mm(36), mm(40)],
  dimensionsSource: "approximate",
  massKg: 0.04,
  pins: [],
  anchors: [
    anchor("base", "Mu\xF1eca (al antebrazo)", [0, mm(18), 0], UP, "claw-mount"),
    anchor("servo", "Servo de la pinza (al frente)", [0, mm(18), mm(26)], UP, "slot-claw-servo", ["sensor-mount"])
  ],
  props: [],
  scalable: false,
  model: "procedural",
  summary: "Pinza de dos dedos paralelos. Su servo la abre y la cierra: a 0\xB0 est\xE1 muy abierta (64 mm) y a 90\xB0 casi cerrada (19 mm). Un objeto movible que quede entre los dedos con la separaci\xF3n justa se agarra y se lleva.",
  keywords: ["pinza", "garra", "mano", "agarrar", "recoger", "dedos", "robot"]
};
var lineSupport = {
  id: "ir-double-bracket",
  name: "Soporte doble infrarrojo",
  category: "structure",
  dimensions: [mm(56), mm(34), mm(34)],
  dimensionsSource: "approximate",
  massKg: 0.012,
  pins: [],
  anchors: [anchor("base", "Fijaci\xF3n al chasis", [0, mm(17), 0], UP, "line-support"), anchor("left", "Sensor izquierdo", [-mm(18), -mm(17), 0], DOWN, "slot-ir-left", ["ir-mount"]), anchor("right", "Sensor derecho", [mm(18), -mm(17), 0], DOWN, "slot-ir-right", ["ir-mount"])],
  scalable: false,
  model: "procedural",
  summary: "Separadores y travesa\xF1o para dos sensores de l\xEDnea bajo el frente del chasis.",
  keywords: ["soporte", "infra", "separador", "linea"]
};
var powerSwitch = {
  id: "power-switch",
  name: "Interruptor general",
  category: "power",
  dimensions: [mm(14), mm(16), mm(24)],
  dimensionsSource: "approximate",
  massKg: 6e-3,
  pins: [pin("IN", "Entrada", [0, -mm(7), -mm(8)], "signal"), pin("OUT", "Salida", [0, -mm(7), mm(8)], "signal")],
  anchors: [anchor("base", "Fijaci\xF3n", [0, -mm(8), 0], DOWN, "switch-mount")],
  props: [{ id: "closed", label: "Encendido", type: "boolean", default: true }],
  scalable: false,
  model: "procedural",
  summary: "Contacto SPST: encendido une IN y OUT; apagado corta la alimentaci\xF3n. C\xE1mbialo en Propiedades con la simulaci\xF3n detenida.",
  keywords: ["interruptor", "encendido", "apagado", "switch"]
};
var regulator = {
  id: "regulator-5v",
  name: "Regulador 5 V buck-boost",
  category: "power",
  dimensions: [mm(20), mm(12), mm(28)],
  dimensionsSource: "approximate",
  massKg: 5e-3,
  pins: [pin("VIN", "VIN", [-mm(7), mm(5), -mm(9)], "power-in", { electrical: { vMax: 11.8 } }), pin("GND", "GND", [-mm(7), mm(5), mm(9)], "ground"), pin("5V", "5V", [mm(7), mm(5), -mm(9)], "power-out", { electrical: { vMax: 5, iMax: 0.5 } }), pin("GND.OUT", "GND salida", [mm(7), mm(5), mm(9)], "ground", { internalNet: "GND" })],
  anchors: [anchor("base", "Base", [0, -mm(6), 0], DOWN, "regulator-mount")],
  scalable: false,
  model: "procedural",
  summary: "Modelo did\xE1ctico buck-boost: entrada 2,7\u201311,8 V, salida regulada de 5 V. Alimenta la l\xF3gica; los motores van al driver.",
  keywords: ["regulador", "5v", "buck", "boost", "alimentacion"]
};
regulator.pins.find((p) => p.id === "GND").internalNet = "GND";
var arm = {
  id: "educational-arm-e6",
  name: "Brazo educativo \xB7 referencia E6",
  category: "actuator",
  dimensions: [0.162, 0.103, 0.12],
  dimensionsSource: "approximate",
  massKg: 7.2,
  pins: [],
  anchors: [],
  scalable: false,
  model: "procedural",
  summary: "Modelo mec\xE1nico oficial E6: seis articulaciones, Jog, MovJ/MovL, ense\xF1anza de puntos y pinza de pr\xE1ctica. Simulaci\xF3n local sin equipo conectado.",
  keywords: ["brazo", "robot", "dobot", "e6", "pinza", "articulacion"]
};
var practiceBlock = {
  id: "arm-practice-block",
  name: "Pieza de pr\xE1ctica \xB7 50 g",
  category: "structure",
  dimensions: [0.035, 0.035, 0.035],
  dimensionsSource: "approximate",
  massKg: 0.05,
  pins: [],
  anchors: [],
  scalable: false,
  model: "procedural",
  props: [{ id: "massKg", label: "Masa de la pieza (kg)", type: "number", min: 1e-3, max: 2, default: 0.05 }, ...["R", "G", "B"].map((channel, i) => ({ id: `surface${channel}`, label: `Superficie \xB7 canal ${channel} (0\u2013255)`, type: "number", min: 0, max: 255, default: [220, 150, 55][i] }))],
  summary: "Cubo manipulable con la pinza del brazo educativo.",
  keywords: ["pieza", "cubo", "brazo", "carga"]
};
var dropZone = {
  id: "arm-drop-zone",
  name: "Zona de entrega",
  category: "structure",
  dimensions: [0.12, 4e-3, 0.12],
  dimensionsSource: "approximate",
  massKg: 0.01,
  pins: [],
  anchors: [],
  scalable: false,
  model: "procedural",
  summary: "Objetivo azul para depositar la pieza de pr\xE1ctica.",
  keywords: ["zona", "entrega", "brazo"]
};
var CATALOG = [chassis, motor, wheel, caster, arduino, l298n, hcsr04, battery, sensorBracket, genericBracket, led, resistor, breadboard, irSensor, servoSg90, oled, robotHead, trackSprocket, trackBelt, robotTorso, robotArm, robotForearm, robotClaw, pushButton, potentiometer, lineSupport, powerSwitch, regulator, arm, practiceBlock, dropZone, ...COMBAT_DEFINITIONS, conveyorDefinition];
var byId = new Map(CATALOG.map((d) => [d.id, d]));
var definitionIds = new Set(CATALOG.map((d) => d.id));
var catalogShape = new Map(CATALOG.map((d) => [d.id, { pins: new Set(d.pins.map((p) => p.id)), anchors: new Set(d.anchors.map((a) => a.id)) }]));

// src/robotics/project/types.ts
var LIMITS = {
  projects: 30,
  parts: 200,
  attachments: 400,
  connections: 1e3,
  firmware: 8,
  obstacles: 100,
  sketchBytes: 64 * 1024,
  hexBytes: 256 * 1024,
  name: 100,
  label: 60,
  importBytes: 2 * 1024 * 1024,
  history: 50
};

// src/robotics/project/math.ts
var DEG = Math.PI / 180;

// src/robotics/mcu/avr/runtime.ts
var import_avr8js = __toESM(require_cjs(), 1);

// src/robotics/mcu/avr/pins.ts
var UNO_PINS = {};
for (let n = 0; n <= 7; n++) UNO_PINS[`D${n}`] = { port: "D", bit: n };
for (let n = 8; n <= 13; n++) UNO_PINS[`D${n}`] = { port: "B", bit: n - 8 };
for (let n = 0; n <= 5; n++) UNO_PINS[`A${n}`] = { port: "C", bit: n };

// src/robotics/mcu/i2c/ssd1306.ts
var OLED_HEIGHT = 64;
var OLED_PAGES = OLED_HEIGHT / 8;

// src/robotics/mcu/sha256.ts
var K = Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var rotr = (x, n) => x >>> n | x << 32 - n;
function sha256(text) {
  const data = new TextEncoder().encode(text), bitLen = data.length * 8;
  const padded = new Uint8Array(data.length + 9 + 63 >> 6 << 6);
  padded.set(data);
  padded[data.length] = 128;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 2 ** 32));
  view.setUint32(padded.length - 4, bitLen >>> 0);
  const h = Uint32Array.from([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]), w = new Uint32Array(64);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ w[i - 15] >>> 3, s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ w[i - 2] >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const t1 = hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + (e & f ^ ~e & g) + K[i] + w[i] | 0, t2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + (a & b ^ a & c ^ b & c) | 0;
      hh = g;
      g = f;
      f = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    h[0] += a;
    h[1] += b;
    h[2] += c;
    h[3] += d;
    h[4] += e;
    h[5] += f;
    h[6] += g;
    h[7] += hh;
  }
  return Array.from(h, (x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
}

// src/robotics/mcu/compiler/state.ts
var hashSource = sha256;
function artifactStatus(art, currentHash) {
  if (!art) return "none";
  if (art.origin === "hex-import") return "imported";
  return art.sourceHash === currentHash ? "fresh" : "stale";
}

// src/robotics/guide/programHex.generated.ts
var PROGRAM_HEX = {
  "6669d79f41bccaace3cb03f336f87dd9545dd4c65f0cbee281698d8db9684f40": ":100000000C9452000C9464000C9464000C946400F2\r\n:100010000C9464000C9464000C9464000C946400D0\r\n:100020000C9464000C9464000C9464000C946400C0\r\n:100030000C9464000C9464000C9464000C946400B0\r\n:100040000C9497000C9464000C9464000C9464006D\r\n:100050000C9464000C9464000C9464000C94640090\r\n:100060000C9464000C94640000000000250028003B\r\n:100070002B0000000000240027002A0004040404D0\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A0000408102011241FBECFEFD8E0DEBFCDBF63\r\n:1000B00021E0A0E0B1E001C01D92A930B207E1F754\r\n:1000C0000E94E1000C9443010C940000CF93DF9355\r\n:1000D00090E0FC01E057FF4F249184589F4FFC01B2\r\n:1000E00084918823D1F090E0880F991FFC01EE588D\r\n:1000F000FF4FA591B491FC01E859FF4FC591D491F0\r\n:1001000061110EC09FB7F8948C91E22FE0958E2379\r\n:100110008C932881E223E8839FBFDF91CF910895DC\r\n:100120008FB7F894EC91E22BEC938FBFF6CF1F9230\r\n:100130000F920FB60F9211242F933F938F939F939B\r\n:10014000AF93BF938091050190910601A0910701A3\r\n:10015000B09108013091040123E0230F2D3758F5A9\r\n:100160000196A11DB11D2093040180930501909378\r\n:100170000601A0930701B0930801809100019091BE\r\n:100180000101A0910201B09103010196A11DB11DD1\r\n:100190008093000190930101A0930201B0930301A9\r\n:1001A000BF91AF919F918F913F912F910F900FBE73\r\n:1001B0000F901F90189526E8230F0296A11DB11DE0\r\n:1001C000D2CF789484B5826084BD84B5816084BDCB\r\n:1001D00085B5826085BD85B5816085BD80916E00E5\r\n:1001E000816080936E001092810080918100826016\r\n:1001F0008093810080918100816080938100809153\r\n:1002000080008160809380008091B1008460809341\r\n:10021000B1008091B00081608093B00080917A003D\r\n:10022000846080937A0080917A00826080937A0063\r\n:1002300080917A00816080937A0080917A00806852\r\n:1002400080937A001092C10061E084E00E94660011\r\n:1002500061E087E00E94660061E088E00E9466003D\r\n:1002600061E08CE00E94660061E089E00E94660027\r\n:1002700060E08AE00E946600C0E0D0E02097F1F3E1\r\n:0A0280000E940000FBCFF894FFCFAE\r\n:00000001FF\r\n",
  "219c208eb4c005a81490d7a87f7195ffb2b94c5de9b7e3991621533ae5219caa": ":100000000C945C000C946E000C946E000C946E00CA\r\n:100010000C946E000C946E000C946E000C946E00A8\r\n:100020000C946E000C946E000C946E000C946E0098\r\n:100030000C946E000C946E000C946E000C946E0088\r\n:100040000C9438010C946E000C946E000C946E00AD\r\n:100050000C946E000C946E000C946E000C946E0068\r\n:100060000C946E000C946E00000000002400270029\r\n:100070002A0000000000250028002B0004040404CE\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A00004081020000000080002010000030407FB\r\n:1000B000000000000000000011241FBECFEFD8E0B8\r\n:1000C000DEBFCDBF21E0A0E0B1E001C01D92A930AC\r\n:1000D000B207E1F70E9482010C9402020C94000026\r\n:1000E00090E0FC01EC55FF4F2491FC01E057FF4FDD\r\n:1000F0003491FC01E458FF4FE491EE23C9F0222330\r\n:1001000039F0233001F1A8F4213019F1223029F11E\r\n:10011000F0E0EE0FFF1FEE58FF4FA591B4918FB79F\r\n:10012000F894EC91611126C030953E233C938FBF2B\r\n:1001300008952730A9F02830C9F0243049F780917C\r\n:1001400080008F7D03C0809180008F778093800036\r\n:10015000DFCF84B58F7784BDDBCF84B58F7DFBCFB8\r\n:100160008091B0008F778093B000D2CF8091B000A3\r\n:100170008F7DF9CF3E2BDACFCF93DF9390E0FC0158\r\n:10018000E057FF4F249184589F4FFC0184918823AE\r\n:10019000D1F090E0880F991FFC01E859FF4FA5911D\r\n:1001A000B491FC01EE58FF4FC591D49161110EC07E\r\n:1001B0009FB7F8948C91E22FE0958E238C93288141\r\n:1001C000E223E8839FBFDF91CF9108958FB7F89422\r\n:1001D000EC91E22BEC938FBFF6CFE82FF0E0EC55DB\r\n:1001E000FF4FE491E33031F138F4E130B9F0E2301F\r\n:1001F000D9F061E00C947000E73041F1E83079F11A\r\n:10020000E430B9F78091800080628093800088ECB0\r\n:1002100090E090938B0080938A00089584B5806865\r\n:1002200084BD88EC87BD089584B5806284BD88EC68\r\n:1002300088BD08958091800080688093800088EC5C\r\n:1002400090E0909389008093880008958091B00099\r\n:1002500080688093B00088EC8093B300089580910B\r\n:10026000B00080628093B00088EC8093B400089561\r\n:100270001F920F920FB60F9211242F933F938F93DB\r\n:100280009F93AF93BF938091050190910601A09138\r\n:100290000701B09108013091040123E0230F2D37AD\r\n:1002A00058F50196A11DB11D20930401809305010D\r\n:1002B00090930601A0930701B0930801809100017B\r\n:1002C00090910101A0910201B09103010196A11D3D\r\n:1002D000B11D8093000190930101A0930201B0939E\r\n:1002E0000301BF91AF919F918F913F912F910F90FB\r\n:1002F0000FBE0F901F90189526E8230F0296A11DA0\r\n:10030000B11DD2CF789484B5826084BD84B58160FC\r\n:1003100084BD85B5826085BD85B5816085BD8091D0\r\n:100320006E00816080936E00109281008091810048\r\n:100330008260809381008091810081608093810040\r\n:10034000809180008160809380008091B100846002\r\n:100350008093B1008091B00081608093B000809163\r\n:100360007A00846080937A0080917A008260809322\r\n:100370007A0080917A00816080937A0080917A007F\r\n:10038000806880937A001092C10061E084E00E944E\r\n:10039000BC0061E087E00E94BC0061E088E00E9450\r\n:1003A000BC0061E08CE00E94BC0061E089E00E943A\r\n:1003B000BC0060E08AE00E94BC00C0E0D0E061E0E8\r\n:1003C00084E00E94700060E087E00E94700061E0BD\r\n:1003D00088E00E94700060E08CE00E94700061E0A4\r\n:1003E00085E00E94BC0085E00E94ED0061E086E0AF\r\n:1003F0000E94BC0086E00E94ED00209701F30E945D\r\n:080400000000DDCFF894FFCFEE\r\n:00000001FF\r\n",
  "ac41bd7265583a1a95549c97cb12cf9c0a6cd976e6c1e5f5e7b7d6167d8b2025": ":100000000C9462000C948A000C948A000C948A0070\r\n:100010000C948A000C948A000C948A000C948A0038\r\n:100020000C948A000C948A000C948A000C948A0028\r\n:100030000C948A000C948A000C948A000C948A0018\r\n:100040000C9493020C948A000C9403030C94DD022C\r\n:100050000C948A000C948A000C948A000C948A00F8\r\n:100060000C948A000C948A000000000023002600F3\r\n:10007000290000000000240027002A0000000000E2\r\n:10008000250028002B0004040404040404040202D4\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C0000000D80411241FBECFEFD8E0DEBFCDBFA3\r\n:1000D00011E0A0E0B1E0EEE5FAE002C005900D927B\r\n:1000E000A632B107D9F721E0A6E2B1E001C01D9226\r\n:1000F000AC3CB207E1F710E0C2E6D0E004C02197C3\r\n:10010000FE010E942705C136D107C9F70E947A0374\r\n:100110000C942D050C94000090E0FC01E255FF4F7B\r\n:100120002491FC01E656FF4F3491FC01EA57FF4F42\r\n:10013000E491EE23C9F0222339F0233001F1A8F431\r\n:10014000213019F1223029F1F0E0EE0FFF1FE458C1\r\n:10015000FF4FA591B4918FB7F894EC91611126C02F\r\n:1001600030953E233C938FBF08952730A9F0283067\r\n:10017000C9F0243049F7809180008F7D03C08091C1\r\n:1001800080008F7780938000DFCF84B58F7784BD28\r\n:10019000DBCF84B58F7DFBCF8091B0008F778093CC\r\n:1001A000B000D2CF8091B0008F7DF9CF3E2BDACF57\r\n:1001B000CF93DF9390E0FC01E656FF4F24918A57DE\r\n:1001C0009F4FFC0184918823D1F090E0880F991F04\r\n:1001D000FC01EE58FF4FA591B491FC01E458FF4F8C\r\n:1001E000C591D49161110EC09FB7F8948C91E22F04\r\n:1001F000E0958E238C932881E223E8839FBFDF91D3\r\n:10020000CF9108958FB7F894EC91E22BEC938FBFC8\r\n:10021000F6CF3FB7F89480912B0190912C01A091DB\r\n:100220002D01B0912E0126B5A89B05C02F3F19F0D6\r\n:100230000196A11DB11D3FBFBA2FA92F982F882766\r\n:10024000BC01CD01620F711D811D911D42E0660F41\r\n:10025000771F881F991F4A95D1F70895AF92BF92D3\r\n:10026000CF92DF92EF92FF920F931F93CF93DF9382\r\n:100270006C017B018B01040F151FEB015E01AE18B1\r\n:10028000BF08C017D10759F06991D601ED91FC91D3\r\n:100290000190F081E02DC6010995892B79F7C50100\r\n:1002A000DF91CF911F910F91FF90EF90DF90CF9052\r\n:1002B000BF90AF900895FC01538D448D252F30E001\r\n:1002C000842F90E0821B930B541710F0CF96089563\r\n:1002D00001970895FC01918D828D981761F0A28D90\r\n:1002E000AE0FBF2FB11D5D968C91928D9F5F9F7356\r\n:1002F000928F90E008958FEF9FEF0895FC01918D0C\r\n:10030000828D981731F0828DE80FF11D858D90E078\r\n:1003100008958FEF9FEF0895FC01918D228D892F15\r\n:1003200090E0805C9F4F821B91098F7399270895FD\r\n:100330008FE291E00E948C0121E0892B09F420E0FA\r\n:10034000822F089580E090E0892B29F00E94980187\r\n:1003500081110C9400000895FC01A48DA80FB92F01\r\n:10036000B11DA35ABF4F2C91848D90E001968F73DD\r\n:100370009927848FA689B7892C93A089B1898C91FC\r\n:10038000837080648C93938D848D981306C002884B\r\n:10039000F389E02D80818F7D80830895EF92FF9215\r\n:1003A0000F931F93CF93DF93EC0181E0888F9B8D98\r\n:1003B0008C8D98131AC0E889F989808185FF15C052\r\n:1003C0009FB7F894EE89FF896083E889F989808175\r\n:1003D0008370806480839FBF81E090E0DF91CF9144\r\n:1003E0001F910F91FF90EF900895F62E0B8D10E066\r\n:1003F0000F5F1F4F0F731127E02E8C8D8E110CC0D5\r\n:100400000FB607FCFACFE889F989808185FFF5CF1F\r\n:10041000CE010E94AC01F1CFEB8DEC0FFD2FF11D51\r\n:10042000E35AFF4FF0829FB7F8940B8FEA89FB895C\r\n:1004300080818062CFCFCF93DF93EC01888D8823BA\r\n:10044000B9F0AA89BB89E889F9898C9185FD03C037\r\n:10045000808186FD0DC00FB607FCF7CF8C9185FF1C\r\n:10046000F2CF808185FFEDCFCE010E94AC01E9CFB4\r\n:10047000DF91CF910895E82FF0E0E255FF4FE4912E\r\n:10048000E33031F138F4E130B9F0E230D9F061E035\r\n:100490000C948C00E73041F1E83079F1E430B9F7A1\r\n:1004A0008091800080628093800088EC90E090933F\r\n:1004B0008B0080938A00089584B5806884BD88ECA1\r\n:1004C00087BD089584B5806284BD88EC88BD089599\r\n:1004D0008091800080688093800088EC90E0909309\r\n:1004E00089008093880008958091B000806880938F\r\n:1004F000B00088EC8093B30008958091B0008062D2\r\n:100500008093B00088EC8093B4000895FC010190C2\r\n:100510000020E9F73197AF01481B590BBC018FE26E\r\n:1005200091E00C942E011F920F920FB60F9211249E\r\n:100530002F933F938F939F93AF93BF938091270106\r\n:1005400090912801A0912901B0912A0130912601B2\r\n:1005500023E0230F2D3758F50196A11DB11D2093DF\r\n:1005600026018093270190932801A0932901B0933D\r\n:100570002A0180912B0190912C01A0912D01B09125\r\n:100580002E010196A11DB11D80932B0190932C018A\r\n:10059000A0932D01B0932E01BF91AF919F918F91A8\r\n:1005A0003F912F910F900FBE0F901F90189526E846\r\n:1005B000230F0296A11DB11DD2CF1F920F920FB62D\r\n:1005C0000F9211242F933F934F935F936F937F93D9\r\n:1005D0008F939F93AF93BF93EF93FF938FE291E03D\r\n:1005E0000E94AC01FF91EF91BF91AF919F918F91CC\r\n:1005F0007F916F915F914F913F912F910F900FBE1F\r\n:100600000F901F9018951F920F920FB60F92112402\r\n:100610002F938F939F93EF93FF93E0913F01F0917E\r\n:1006200040018081E0914501F091460182FD1BC0AF\r\n:100630009081809148018F5F8F73209149018217CB\r\n:1006400041F0E0914801F0E0E15DFE4F958F80932D\r\n:100650004801FF91EF919F918F912F910F900FBEC5\r\n:100660000F901F9018958081F4CFCF92DF92EF9278\r\n:10067000FF920F931F93E82FF92F05C00150110926\r\n:100680002109310961F1908196239417B9F305C0CE\r\n:10069000015011092109310911F190819623941318\r\n:1006A000F7CFC12CD12CE12CF12C0AC08FEFC81A46\r\n:1006B000D80AE80AF80A0C151D052E053F0579F041\r\n:1006C00080818623841791F36C2D7D2D8E2D9F2D97\r\n:1006D0001F910F91FF90EF90DF90CF90089560E011\r\n:1006E00070E080E090E01F910F91FF90EF90DF901D\r\n:1006F000CF900895CF93DF93CDB7DEB7A1970FB614\r\n:10070000F894DEBF0FBECDBF789484B5826084BDFF\r\n:1007100084B5816084BD85B5826085BD85B5816005\r\n:1007200085BD80916E00816080936E001092810083\r\n:10073000809181008260809381008091810081603E\r\n:1007400080938100809180008160809380008091FF\r\n:10075000B10084608093B1008091B000816080938B\r\n:10076000B00080917A00846080937A0080917A0052\r\n:10077000826080937A0080917A00816080937A0011\r\n:1007800080917A00806880937A001092C100E09195\r\n:100790003F01F091400182E08083E0913B01F091C4\r\n:1007A0003C011082E0913D01F0913E018FEC80838D\r\n:1007B00010924701E0914301F091440186E080836B\r\n:1007C000E0914101F0914201808180618083E0915C\r\n:1007D0004101F0914201808188608083E091410174\r\n:1007E000F0914201808180688083E0914101F09125\r\n:1007F000420180818F7D808361E084E00E94D80087\r\n:1008000061E087E00E94D80061E088E00E94D800A3\r\n:1008100061E08CE00E94D80061E089E00E94D8008D\r\n:1008200060E08AE00E94D8002AE3422E512C612C1D\r\n:10083000712C30E0232E30E0332E60E089E00E94FE\r\n:100840008C0083E090E00197F1F761E089E00E947D\r\n:100850008C0083E290E00197F1F760E089E00E946C\r\n:100860008C00E4EAF0E06491E0E9F0E08491E82FA4\r\n:10087000F0E0EE0FFF1FE859FF4F8591949108EAD1\r\n:1008800011E620E030E0462F0E9435036115710526\r\n:100890008105910509F487C06F5F7F4F8F4F9F4F90\r\n:1008A0009F70611571058105910509F47CC0A30154\r\n:1008B00092010E94050589017A0182E191E00E947E\r\n:1008C00086029801A70119A28E010F5D1F4FCA0170\r\n:1008D000B9012AE030E040E050E00E940505605D8B\r\n:1008E000F80162938F01211531054105510579F712\r\n:1008F000309719F0CF010E9486028EE191E00E94AC\r\n:10090000860282E291E00E94860261E084E00E9419\r\n:100910008C0060E087E00E948C0061E088E00E942B\r\n:100920008C0060E08CE00E948C0061E085E00E9419\r\n:10093000D80085E00E943B0261E086E00E94D8007A\r\n:1009400086E00E943B020E9409014B015C0184E6A3\r\n:10095000C82ED12CE12CF12C0E94090168197909CB\r\n:100960008A099B09683E734081059105A8F3F1E06F\r\n:10097000CF1AD108E108F10828EE820E23E0921E7A\r\n:10098000A11CB11CC114D104E104F10429F7211404\r\n:10099000310409F452CF0E949801882309F44DCF05\r\n:1009A0000E9400004ACF00E911E0E12CF12C85CF34\r\n:1009B000EFE2F1E01382128288EE93E0A0E0B0E073\r\n:1009C00084839583A683B78384E091E091838083B9\r\n:1009D00085EC90E09587848784EC90E09787868704\r\n:1009E00080EC90E0918B808B81EC90E0938B828BFC\r\n:1009F00082EC90E0958B848B86EC90E0978B868BD5\r\n:100A0000118E128E138E148E0895A1E21A2EAA1B37\r\n:100A1000BB1BFD010DC0AA1FBB1FEE1FFF1FA217AE\r\n:100A2000B307E407F50720F0A21BB30BE40BF50BAB\r\n:100A3000661F771F881F991F1A9469F76095709534\r\n:100A4000809590959B01AC01BD01CF010895EE0FFB\r\n:0E0A5000FF1F0590F491E02D0994F894FFCF5C\r\n:100A5E0000000000CE012E015B011B028C016A0119\r\n:100A6E007E0164697374616E6369613A200020636C\r\n:060A7E006D000D0A0000EE\r\n:00000001FF\r\n",
  "a4459a38013bdefb5def3e6980df7b9e98af02042612e4e65c71ef997b954f1b": ":100000000C9461000C9473000C9473000C947300B6\r\n:100010000C9473000C9473000C9473000C94730094\r\n:100020000C9473000C9473000C9473000C94730084\r\n:100030000C9473000C9473000C9473000C94730074\r\n:100040000C94B6010C9473000C9473000C94730020\r\n:100050000C9473000C9473000C9473000C94730054\r\n:100060000C9473000C947300000000002300260021\r\n:10007000290000000000240027002A0000000000E2\r\n:10008000250028002B0004040404040404040202D4\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C000000011241FBECFEFD8E0DEBFCDBF21E07E\r\n:1000D000A0E0B1E001C01D92A930B207E1F70E9493\r\n:1000E00045020C9404030C94000090E0FC01E255DE\r\n:1000F000FF4F2491FC01E656FF4F3491FC01EA5773\r\n:10010000FF4FE491EE23C9F0222339F0233001F1AF\r\n:10011000A8F4213019F1223029F1F0E0EE0FFF1F91\r\n:10012000E458FF4FA591B4918FB7F894EC91611109\r\n:1001300026C030953E233C938FBF08952730A9F009\r\n:100140002830C9F0243049F7809180008F7D03C0AA\r\n:10015000809180008F7780938000DFCF84B58F7788\r\n:1001600084BDDBCF84B58F7DFBCF8091B0008F77CE\r\n:100170008093B000D2CF8091B0008F7DF9CF3E2B1D\r\n:10018000DACFCF93DF9390E0FC01E656FF4F249146\r\n:100190008A579F4FFC0184918823D1F090E0880F0B\r\n:1001A000991FFC01EE58FF4FA591B491FC01E45852\r\n:1001B000FF4FC591D49161110EC09FB7F8948C91F7\r\n:1001C000E22FE0958E238C932881E223E8839FBF62\r\n:1001D000DF91CF9108958FB7F894EC91E22BEC93D7\r\n:1001E0008FBFF6CF3FB7F89480910501909106013B\r\n:1001F000A0910701B091080126B5A89B05C02F3F2B\r\n:1002000019F00196A11DB11D3FBFBA2FA92F982F3C\r\n:100210008827BC01CD01620F711D811D911D42E037\r\n:10022000660F771F881F991F4A95D1F708958F92FF\r\n:100230009F92AF92BF92CF92DF92EF92FF924B01CB\r\n:100240005C010E94F2006B017C010E94F2006C19BB\r\n:100250007D098E099F09683E734081059105A8F3C9\r\n:1002600021E0821A9108A108B10888EEC80E83E047\r\n:10027000D81EE11CF11C81149104A104B10429F7DA\r\n:10028000FF90EF90DF90CF90BF90AF909F908F90B6\r\n:100290000895E82FF0E0E255FF4FE491E33031F1AB\r\n:1002A00038F4E130B9F0E230D9F061E00C94750037\r\n:1002B000E73041F1E83079F1E430B9F7809180001E\r\n:1002C00080628093800088EC90E090938B00809314\r\n:1002D0008A00089584B5806884BD88EC87BD089540\r\n:1002E00084B5806284BD88EC88BD089580918000CB\r\n:1002F00080688093800088EC90E0909389008093E0\r\n:10030000880008958091B00080688093B00088ECE8\r\n:100310008093B30008958091B00080628093B00014\r\n:1003200088EC8093B4000895CF93C82F61E084E0F7\r\n:100330000E94750060E087E00E9475006C2F88E0E5\r\n:100340000E94750061E06C278CE00E94750061E0FE\r\n:1003500085E00E94C10085E00E94490161E086E0DD\r\n:100360000E94C10086E0CF910C9449011F920F9228\r\n:100370000FB60F9211242F933F938F939F93AF93B8\r\n:10038000BF938091010190910201A0910301B0916E\r\n:1003900004013091000123E0230F2D3758F5019619\r\n:1003A000A11DB11D209300018093010190930201D2\r\n:1003B000A0930301B093040180910501909106017F\r\n:1003C000A0910701B09108010196A11DB11D809374\r\n:1003D000050190930601A0930701B0930801BF9116\r\n:1003E000AF919F918F913F912F910F900FBE0F90E2\r\n:1003F0001F90189526E8230F0296A11DB11DD2CF9C\r\n:10040000CF92DF92EF92FF920F931F93E82FF92F75\r\n:1004100005C0015011092109310961F1908196232C\r\n:100420009417B9F305C0015011092109310911F1DF\r\n:10043000908196239413F7CFC12CD12CE12CF12C71\r\n:100440000AC08FEFC81AD80AE80AF80A0C151D0569\r\n:100450002E053F0579F080818623841791F36C2D5A\r\n:100460007D2D8E2D9F2D1F910F91FF90EF90DF908E\r\n:10047000CF90089560E070E080E090E01F910F91D0\r\n:10048000FF90EF90DF90CF900895789484B58260CC\r\n:1004900084BD84B5816084BD85B5826085BD85B528\r\n:1004A000816085BD80916E00816080936E001092A6\r\n:1004B0008100809181008260809381008091810021\r\n:1004C00081608093810080918000816080938000B2\r\n:1004D0008091B10084608093B1008091B000816010\r\n:1004E0008093B00080917A00846080937A0080913C\r\n:1004F0007A00826080937A0080917A008160809394\r\n:100500007A0080917A00806880937A001092C1000E\r\n:1005100061E084E00E94C10061E087E00E94C100C8\r\n:1005200061E088E00E94C10061E08CE00E94C100AF\r\n:1005300061E089E00E94C10060E08AE00E94C100A1\r\n:10054000C3E0D0E093E2E92EF12C24EAC22E20E0B1\r\n:10055000D22E30E9A32E30E0B32E40E0842E40E0CE\r\n:10056000942E60E089E00E947500CE010197F1F7BA\r\n:1005700061E089E00E947500C7010197F1F760E032\r\n:1005800089E00E947500F6016491F5018491E82FDD\r\n:10059000F0E0EE0FFF1FE859FF4F8591949108EAB4\r\n:1005A00011E620E030E0462F0E940002611571053F\r\n:1005B0008105910529F1DC01CB010196A11DB11D39\r\n:1005C000BF700097A105B105D9F088389440A10506\r\n:1005D000B105B0F480E00E94940160E971E080E030\r\n:1005E00090E00E9417016EE170E080E090E00E94D0\r\n:1005F00017018114910409F4B4CF0E940000B1CF17\r\n:0C06000081E00E949401EFCFF894FFCF3E\r\n:00000001FF\r\n",
  "ee6ba289054779ff5927ae0311af07ff260ba6e03537b232ef0384d1461503ee": ":100000000C9452000C9464000C9464000C946400F2\r\n:100010000C9464000C9464000C9464000C946400D0\r\n:100020000C9464000C9464000C9464000C946400C0\r\n:100030000C9464000C9464000C9464000C946400B0\r\n:100040000C9497000C9464000C9464000C9464006D\r\n:100050000C9464000C9464000C9464000C94640090\r\n:100060000C9464000C94640000000000250028003B\r\n:100070002B0000000000240027002A0004040404D0\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A0000408102011241FBECFEFD8E0DEBFCDBF63\r\n:1000B00021E0A0E0B1E001C01D92A930B207E1F754\r\n:1000C0000E94E1000C9443010C940000CF93DF9355\r\n:1000D00090E0FC01E057FF4F249184589F4FFC01B2\r\n:1000E00084918823D1F090E0880F991FFC01EE588D\r\n:1000F000FF4FA591B491FC01E859FF4FC591D491F0\r\n:1001000061110EC09FB7F8948C91E22FE0958E2379\r\n:100110008C932881E223E8839FBFDF91CF910895DC\r\n:100120008FB7F894EC91E22BEC938FBFF6CF1F9230\r\n:100130000F920FB60F9211242F933F938F939F939B\r\n:10014000AF93BF938091050190910601A0910701A3\r\n:10015000B09108013091040123E0230F2D3758F5A9\r\n:100160000196A11DB11D2093040180930501909378\r\n:100170000601A0930701B0930801809100019091BE\r\n:100180000101A0910201B09103010196A11DB11DD1\r\n:100190008093000190930101A0930201B0930301A9\r\n:1001A000BF91AF919F918F913F912F910F900FBE73\r\n:1001B0000F901F90189526E8230F0296A11DB11DE0\r\n:1001C000D2CF789484B5826084BD84B5816084BDCB\r\n:1001D00085B5826085BD85B5816085BD80916E00E5\r\n:1001E000816080936E001092810080918100826016\r\n:1001F0008093810080918100816080938100809153\r\n:1002000080008160809380008091B1008460809341\r\n:10021000B1008091B00081608093B00080917A003D\r\n:10022000846080937A0080917A00826080937A0063\r\n:1002300080917A00816080937A0080917A00806852\r\n:1002400080937A001092C10060E082E00E94660014\r\n:1002500060E083E00E94660061E084E00E94660046\r\n:1002600061E087E00E94660061E088E00E9466002D\r\n:1002700061E08CE00E946600C0E0D0E02097F1F3DE\r\n:0A0280000E940000FBCFF894FFCFAE\r\n:00000001FF\r\n",
  "c86d3c3ada337b85348e85cefa65db6d1ea54b1b4f5d2c863df167f69b112026": ":100000000C945C000C946E000C946E000C946E00CA\r\n:100010000C946E000C946E000C946E000C946E00A8\r\n:100020000C946E000C946E000C946E000C946E0098\r\n:100030000C946E000C946E000C946E000C946E0088\r\n:100040000C9438010C946E000C946E000C946E00AD\r\n:100050000C946E000C946E000C946E000C946E0068\r\n:100060000C946E000C946E00000000002400270029\r\n:100070002A0000000000250028002B0004040404CE\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A00004081020000000080002010000030407FB\r\n:1000B000000000000000000011241FBECFEFD8E0B8\r\n:1000C000DEBFCDBF21E0A0E0B1E001C01D92A930AC\r\n:1000D000B207E1F70E9482010C9402020C94000026\r\n:1000E00090E0FC01EC55FF4F2491FC01E057FF4FDD\r\n:1000F0003491FC01E458FF4FE491EE23C9F0222330\r\n:1001000039F0233001F1A8F4213019F1223029F11E\r\n:10011000F0E0EE0FFF1FEE58FF4FA591B4918FB79F\r\n:10012000F894EC91611126C030953E233C938FBF2B\r\n:1001300008952730A9F02830C9F0243049F780917C\r\n:1001400080008F7D03C0809180008F778093800036\r\n:10015000DFCF84B58F7784BDDBCF84B58F7DFBCFB8\r\n:100160008091B0008F778093B000D2CF8091B000A3\r\n:100170008F7DF9CF3E2BDACFCF93DF9390E0FC0158\r\n:10018000E057FF4F249184589F4FFC0184918823AE\r\n:10019000D1F090E0880F991FFC01E859FF4FA5911D\r\n:1001A000B491FC01EE58FF4FC591D49161110EC07E\r\n:1001B0009FB7F8948C91E22FE0958E238C93288141\r\n:1001C000E223E8839FBFDF91CF9108958FB7F89422\r\n:1001D000EC91E22BEC938FBFF6CFE82FF0E0EC55DB\r\n:1001E000FF4FE491E33031F138F4E130B9F0E2301F\r\n:1001F000D9F061E00C947000E73041F1E83079F11A\r\n:10020000E430B9F78091800080628093800084EBB5\r\n:1002100090E090938B0080938A00089584B5806865\r\n:1002200084BD84EB87BD089584B5806284BD84EB72\r\n:1002300088BD08958091800080688093800084EB61\r\n:1002400090E0909389008093880008958091B00099\r\n:1002500080688093B00084EB8093B3000895809110\r\n:10026000B00080628093B00084EB8093B400089566\r\n:100270001F920F920FB60F9211242F933F938F93DB\r\n:100280009F93AF93BF938091050190910601A09138\r\n:100290000701B09108013091040123E0230F2D37AD\r\n:1002A00058F50196A11DB11D20930401809305010D\r\n:1002B00090930601A0930701B0930801809100017B\r\n:1002C00090910101A0910201B09103010196A11D3D\r\n:1002D000B11D8093000190930101A0930201B0939E\r\n:1002E0000301BF91AF919F918F913F912F910F90FB\r\n:1002F0000FBE0F901F90189526E8230F0296A11DA0\r\n:10030000B11DD2CF789484B5826084BD84B58160FC\r\n:1003100084BD85B5826085BD85B5816085BD8091D0\r\n:100320006E00816080936E00109281008091810048\r\n:100330008260809381008091810081608093810040\r\n:10034000809180008160809380008091B100846002\r\n:100350008093B1008091B00081608093B000809163\r\n:100360007A00846080937A0080917A008260809322\r\n:100370007A0080917A00816080937A0080917A007F\r\n:10038000806880937A001092C10060E082E00E9451\r\n:10039000BC0060E083E00E94BC0061E084E00E9459\r\n:1003A000BC0061E087E00E94BC0061E088E00E9440\r\n:1003B000BC0061E08CE00E94BC00C0E0D0E061E0E5\r\n:1003C00084E00E94700060E087E00E94700061E0BD\r\n:1003D00088E00E94700060E08CE00E94700061E0A4\r\n:1003E00085E00E94BC0085E00E94ED0061E086E0AF\r\n:1003F0000E94BC0086E00E94ED00209701F30E945D\r\n:080400000000DDCFF894FFCFEE\r\n:00000001FF\r\n",
  "b1ff92eebbb239cd82a10794ed31178defa820307fb4bdd2b34b3ad5acd12dcb": ":100000000C9462000C948A000C948A000C948A0070\r\n:100010000C948A000C948A000C948A000C948A0038\r\n:100020000C948A000C948A000C948A000C948A0028\r\n:100030000C948A000C948A000C948A000C948A0018\r\n:100040000C940B030C948A000C947B030C945503C2\r\n:100050000C948A000C948A000C948A000C948A00F8\r\n:100060000C948A000C948A000000000024002700F1\r\n:100070002A0000000000250028002B0000000000DE\r\n:1000800023002600290004040404040404040202DA\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C0000000B80411241FBECFEFD8E0DEBFCDBFC3\r\n:1000D00011E0A0E0B1E0EEE1FAE002C005900D927F\r\n:1000E000A032B107D9F721E0A0E2B1E001C01D9232\r\n:1000F000A63CB207E1F710E0C2E6D0E004C02197C9\r\n:10010000FE010E940705C136D107C9F70E94AD0361\r\n:100110000C940D050C940000833081F028F481309C\r\n:1001200099F08230A9F008958730A9F08830C9F09D\r\n:100130008430B1F4809180008F7D03C08091800075\r\n:100140008F7780938000089584B58F7784BD08955C\r\n:1001500084B58F7DFBCF8091B0008F778093B00006\r\n:1001600008958091B0008F7DF9CFCF93DF93282F32\r\n:1001700030E0F901E255FF4F8491F901E656FF4F57\r\n:10018000D491F901EA57FF4FC491CC23A1F081111A\r\n:100190000E948C00EC2FF0E0EE0FFF1FE458FF4FA1\r\n:1001A000A591B491EC91ED2381E090E009F480E019\r\n:1001B000DF91CF91089580E090E0FACF1F93CF9325\r\n:1001C000DF93282F30E0F901E255FF4F8491F901C8\r\n:1001D000E656FF4FD491F901EA57FF4FC491CC2363\r\n:1001E000A9F0162F81110E948C00EC2FF0E0EE0F89\r\n:1001F000FF1FEE58FF4FA591B4918FB7F894EC9183\r\n:10020000111108C0D095DE23DC938FBFDF91CF9111\r\n:100210001F910895DE2BF8CFCF93DF9390E0FC0180\r\n:10022000E656FF4F24918A579F4FFC018491882303\r\n:10023000D1F090E0880F991FFC01E859FF4FA5917C\r\n:10024000B491FC01EE58FF4FC591D49161110EC0DD\r\n:100250009FB7F8948C91E22FE0958E238C932881A0\r\n:10026000E223E8839FBFDF91CF9108958FB7F89481\r\n:10027000EC91E22BEC938FBFF6CF3FB7F8948091CF\r\n:10028000250190912601A0912701B091280126B562\r\n:10029000A89B05C02F3F19F00196A11DB11D3FBFBE\r\n:1002A000BA2FA92F982F8827BC01CD01620F711D8D\r\n:1002B000811D911D42E0660F771F881F991F4A9587\r\n:1002C000D1F70895AF92BF92CF92DF92EF92FF9253\r\n:1002D0000F931F93CF93DF936C017B018B01040F6E\r\n:1002E000151FEB015E01AE18BF08C017D10759F00A\r\n:1002F0006991D601ED91FC910190F081E02DC6014C\r\n:100300000995892B79F7C501DF91CF911F910F9145\r\n:10031000FF90EF90DF90CF90BF90AF900895FC01D9\r\n:10032000538D448D252F30E0842F90E0821B930B5A\r\n:10033000541710F0CF96089501970895FC01918D00\r\n:10034000828D981761F0A28DAE0FBF2FB11D5D9603\r\n:100350008C91928D9F5F9F73928F90E008958FEFA5\r\n:100360009FEF0895FC01918D828D981731F0828D59\r\n:10037000E80FF11D858D90E008958FEF9FEF0895B0\r\n:10038000FC01918D228D892F90E0805C9F4F821B14\r\n:1003900091098F739927089589E291E00E94C00125\r\n:1003A00021E0892B09F420E0822F089580E090E07D\r\n:1003B000892B29F00E94CC0181110C940000089532\r\n:1003C000FC01A48DA80FB92FB11DA35ABF4F2C91CA\r\n:1003D000848D90E001968F739927848FA689B789C1\r\n:1003E0002C93A089B1898C91837080648C93938DB8\r\n:1003F000848D981306C00288F389E02D80818F7D5B\r\n:1004000080830895EF92FF920F931F93CF93DF9312\r\n:10041000EC0181E0888F9B8D8C8D98131AC0E88940\r\n:10042000F989808185FF15C09FB7F894EE89FF890F\r\n:100430006083E889F98980818370806480839FBFAD\r\n:1004400081E090E0DF91CF911F910F91FF90EF90AD\r\n:100450000895F62E0B8D10E00F5F1F4F0F731127BD\r\n:10046000E02E8C8D8E110CC00FB607FCFACFE889F8\r\n:10047000F989808185FFF5CFCE010E94E001F1CF9F\r\n:10048000EB8DEC0FFD2FF11DE35AFF4FF0829FB76C\r\n:10049000F8940B8FEA89FB8980818062CFCFCF935C\r\n:1004A000DF93EC01888D8823B9F0AA89BB89E8899C\r\n:1004B000F9898C9185FD03C0808186FD0DC00FB642\r\n:1004C00007FCF7CF8C9185FFF2CF808185FFEDCFC0\r\n:1004D000CE010E94E001E9CFDF91CF910895E82F8E\r\n:1004E000F0E0E255FF4FE491E33031F138F4E130D0\r\n:1004F000B9F0E230D9F061E00C94DE00E73041F170\r\n:10050000E83079F1E430B9F780918000806280931F\r\n:10051000800084EB90E090938B0080938A00089594\r\n:1005200084B5806884BD84EB87BD089584B58062FE\r\n:1005300084BD84EB88BD089580918000806880939D\r\n:10054000800084EB90E09093890080938800089568\r\n:100550008091B00080688093B00084EB8093B300FA\r\n:1005600008958091B00080628093B00084EB809306\r\n:10057000B4000895FC0101900020E9F73197AF0124\r\n:10058000481B590BBC0189E291E00C9462018F92E7\r\n:100590009F92AF92BF920F931F93CF93DF93CDB7EC\r\n:1005A000DEB7A1970FB6F894DEBF0FBECDBF19A27C\r\n:1005B000423008F44AE08E010F5D1F4F842E912CCB\r\n:1005C000B12CA12CA50194010E94E504E62FB901EC\r\n:1005D000CA01EA30F4F4E05DD801EE938D01232BDB\r\n:1005E000242B252B79F790E080E0109719F0CD01AE\r\n:1005F0000E94BA02A1960FB6F894DEBF0FBECDBF1F\r\n:10060000DF91CF911F910F91BF90AF909F908F90EE\r\n:100610000895E95CE1CF1F920F920FB60F9211245B\r\n:100620002F933F938F939F93AF93BF93809121011B\r\n:1006300090912201A0912301B091240130912001D9\r\n:1006400023E0230F2D3758F50196A11DB11D2093EE\r\n:1006500020018093210190932201A0932301B09364\r\n:1006600024018091250190912601A0912701B0914C\r\n:1006700028010196A11DB11D8093250190932601AB\r\n:10068000A0932701B0932801BF91AF919F918F91C3\r\n:100690003F912F910F900FBE0F901F90189526E855\r\n:1006A000230F0296A11DB11DD2CF1F920F920FB63C\r\n:1006B0000F9211242F933F934F935F936F937F93E8\r\n:1006C0008F939F93AF93BF93EF93FF9389E291E052\r\n:1006D0000E94E001FF91EF91BF91AF919F918F91A7\r\n:1006E0007F916F915F914F913F912F910F900FBE2E\r\n:1006F0000F901F9018951F920F920FB60F92112412\r\n:100700002F938F939F93EF93FF93E0913901F09193\r\n:100710003A018081E0913F01F091400182FD1BC0D0\r\n:100720009081809142018F5F8F73209143018217E6\r\n:1007300041F0E0914201F0E0E75DFE4F958F80933C\r\n:100740004201FF91EF919F918F912F910F900FBEDA\r\n:100750000F901F9018958081F4CF789484B58260B3\r\n:1007600084BD84B5816084BD85B5826085BD85B555\r\n:10077000816085BD80916E00816080936E001092D3\r\n:10078000810080918100826080938100809181004E\r\n:1007900081608093810080918000816080938000DF\r\n:1007A0008091B10084608093B1008091B00081603D\r\n:1007B0008093B00080917A00846080937A00809169\r\n:1007C0007A00826080937A0080917A0081608093C1\r\n:1007D0007A0080917A00806880937A001092C1003C\r\n:1007E000E0913901F0913A0182E08083E091350196\r\n:1007F000F09136011082E0913701F09138018FECD1\r\n:10080000808310924101E0913D01F0913E0186E02C\r\n:100810008083E0913B01F0913C0180818061808385\r\n:10082000E0913B01F0913C01808188608083E09100\r\n:100830003B01F0913C01808180688083E0913B0125\r\n:10084000F0913C0180818F7D808360E082E00E9496\r\n:100850000C0160E083E00E940C0161E084E00E94F2\r\n:100860000C0161E087E00E940C0161E088E00E94D9\r\n:100870000C0161E08CE00E940C01C0E0D0E082E05D\r\n:100880000E94B5006C0183E00E94B5007C0182E10A\r\n:1008900091E00E94BA0261E070E080E090E0CD2833\r\n:1008A00019F460E070E0CB014AE00E94C70287E1E2\r\n:1008B00091E00E94BA0261E070E080E090E0EF28F1\r\n:1008C00019F460E070E0CB014AE00E94C7028DE1BC\r\n:1008D00091E00E94BA0261E084E00E94DE0060E0E4\r\n:1008E00087E00E94DE0061E088E00E94DE0060E0B8\r\n:1008F0008CE00E94DE0061E085E00E940C0185E052\r\n:100900000E946F0261E086E00E940C0186E00E9476\r\n:100910006F020E943D014B015C0184E6C82ED12C80\r\n:10092000E12CF12C0E943D01681979098A099B0983\r\n:10093000683E734081059105A8F321E0C21AD108F1\r\n:10094000E108F10888EE880E83E0981EA11CB11C16\r\n:10095000C114D104E104F10429F7209709F48FCFE1\r\n:100960000E94CC01882309F48ACF0E94000087CF1F\r\n:10097000E9E2F1E01382128288EE93E0A0E0B0E0B9\r\n:1009800084839583A683B78384E091E091838083F9\r\n:1009900085EC90E09587848784EC90E09787868744\r\n:1009A00080EC90E0918B808B81EC90E0938B828B3C\r\n:1009B00082EC90E0958B848B86EC90E0978B868B15\r\n:1009C000118E128E138E148E0895A1E21A2EAA1B78\r\n:1009D000BB1BFD010DC0AA1FBB1FEE1FFF1FA217EF\r\n:1009E000B307E407F50720F0A21BB30BE40BF50BEC\r\n:1009F000661F771F881F991F1A9469F76095709575\r\n:100A0000809590959B01AC01BD01CF010895EE0F3B\r\n:0E0A1000FF1F0590F491E02D0994F894FFCF9C\r\n:100A1E0000000000020262018F014F02C0019E0120\r\n:100A2E00B201697A713D00206465723D000D0A00C5\r\n:00000001FF\r\n",
  "7d5e990dbdd831be8de94f8a8c50eafabb556a657a9fd25cdb0bad8ed26d4c9f": ":100000000C9461000C9473000C9473000C947300B6\r\n:100010000C9473000C9473000C9473000C94730094\r\n:100020000C9473000C9473000C9473000C94730084\r\n:100030000C9473000C9473000C9473000C94730074\r\n:100040000C94C3010C9473000C9473000C94730013\r\n:100050000C9473000C9473000C9473000C94730054\r\n:100060000C9473000C94730000000000240027001F\r\n:100070002A0000000000250028002B0000000000DE\r\n:1000800023002600290004040404040404040202DA\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C000000011241FBECFEFD8E0DEBFCDBF21E07E\r\n:1000D000A0E0B1E001C01D92A930B207E1F70E9493\r\n:1000E0000D020C94B0020C940000833081F028F4CF\r\n:1000F000813099F08230A9F008958730A9F08830D6\r\n:10010000C9F08430B1F4809180008F7D03C080916C\r\n:1001100080008F7780938000089584B58F7784BDA9\r\n:10012000089584B58F7DFBCF8091B0008F77809349\r\n:10013000B00008958091B0008F7DF9CFCF93DF9309\r\n:10014000282F30E0F901E255FF4F8491F901E6567E\r\n:10015000FF4FD491F901EA57FF4FC491CC23A1F08E\r\n:1001600081110E947500EC2FF0E0EE0FFF1FE458A4\r\n:10017000FF4FA591B491EC91ED2381E090E009F45B\r\n:1001800080E0DF91CF91089580E090E0FACF1F9357\r\n:10019000CF93DF93282F30E0F901E255FF4F849190\r\n:1001A000F901E656FF4FD491F901EA57FF4FC49188\r\n:1001B000CC23A9F0162F81110E947500EC2FF0E0DE\r\n:1001C000EE0FFF1FEE58FF4FA591B4918FB7F89433\r\n:1001D000EC91111108C0D095DE23DC938FBFDF9125\r\n:1001E000CF911F910895DE2BF8CFCF93DF9390E04E\r\n:1001F000FC01E656FF4F24918A579F4FFC018491E2\r\n:100200008823D1F090E0880F991FFC01E859FF4F37\r\n:10021000A591B491FC01EE58FF4FC591D4916111A5\r\n:100220000EC09FB7F8948C91E22FE0958E238C93AB\r\n:100230002881E223E8839FBFDF91CF9108958FB794\r\n:10024000F894EC91E22BEC938FBFF6CF1F93CF93F2\r\n:10025000DF93182FEB0161E00E94F500E12FF0E041\r\n:10026000E255FF4FE491E33069F178F4E130E9F0D1\r\n:10027000E23019F160E0C038D1050CF061E0812F67\r\n:10028000DF91CF911F910C94C700E73029F1E8303E\r\n:1002900059F1E43079F7809180008062809380008A\r\n:1002A000D0938B00C0938A0004C084B5806884BD5D\r\n:1002B000C7BDDF91CF911F91089584B5806284BD41\r\n:1002C000C8BDF7CF80918000806880938000D09374\r\n:1002D0008900C0938800EDCF8091B0008068809342\r\n:1002E000B000C093B300E5CF8091B00080628093EE\r\n:1002F000B000C093B400DDCF3FB7F8948091050102\r\n:1003000090910601A0910701B091080126B5A89B24\r\n:1003100005C02F3F19F00196A11DB11D3FBFBA2F97\r\n:10032000A92F982F8827BC01CD01620F711D811D57\r\n:10033000911D42E0660F771F881F991F4A95D1F7DC\r\n:1003400008950F931F93CF93DF938C01EB0161E02E\r\n:1003500084E00E94C70060E087E00E94C70061E07F\r\n:1003600088E00E94C70060E08CE00E94C700B801EE\r\n:1003700085E00E942601BE0186E0DF91CF911F91AA\r\n:100380000F910C9426011F920F920FB60F92112419\r\n:100390002F933F938F939F93AF93BF9380910101CE\r\n:1003A00090910201A0910301B091040130910001EC\r\n:1003B00023E0230F2D3758F50196A11DB11D209381\r\n:1003C00000018093010190930201A0930301B09377\r\n:1003D00004018091050190910601A0910701B0915F\r\n:1003E00008010196A11DB11D80930501909306019E\r\n:1003F000A0930701B0930801BF91AF919F918F9196\r\n:100400003F912F910F900FBE0F901F90189526E8E7\r\n:10041000230F0296A11DB11DD2CF789484B58260BE\r\n:1004200084BD84B5816084BD85B5826085BD85B598\r\n:10043000816085BD80916E00816080936E00109216\r\n:100440008100809181008260809381008091810091\r\n:100450008160809381008091800081608093800022\r\n:100460008091B10084608093B1008091B000816080\r\n:100470008093B00080917A00846080937A008091AC\r\n:100480007A00826080937A0080917A008160809304\r\n:100490007A0080917A00806880937A001092C1007F\r\n:1004A00060E082E00E94F50060E083E00E94F500D9\r\n:1004B00061E084E00E94F50061E087E00E94F500C1\r\n:1004C00061E088E00E94F50061E08CE00E94F500A8\r\n:1004D000C0E0D0E082E00E949E007C0183E00E94A8\r\n:1004E0009E00EF28B1F1892B79F568EC70E081E48A\r\n:1004F00090E00E94A1010E947C014B015C0185E01B\r\n:10050000C82ED12CE12CF12C0E947C0168197909AC\r\n:100510008A099B09683E734081059105A8F321E093\r\n:10052000C21AD108E108F10888EE880E83E0981E0F\r\n:10053000A11CB11CC114D104E104F10429F72097D6\r\n:1005400049F20E940000C6CF64EB70E084EB90E0BB\r\n:10055000D0CF892BC9F361E470E088EC90E0C9CF7B\r\n:04056000F894FFCF3D\r\n:00000001FF\r\n",
  "1bb357aefff7e50bf9f89f3f5949deb373d59c20b2656360a3b8413fb7de38dd": ":100000000C9452000C9464000C9464000C946400F2\r\n:100010000C9464000C9464000C9464000C946400D0\r\n:100020000C9464000C9464000C9464000C946400C0\r\n:100030000C9464000C9464000C9464000C946400B0\r\n:100040000C9497000C9464000C9464000C9464006D\r\n:100050000C9464000C9464000C9464000C94640090\r\n:100060000C9464000C94640000000000250028003B\r\n:100070002B0000000000240027002A0004040404D0\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A0000408102011241FBECFEFD8E0DEBFCDBF63\r\n:1000B00021E0A0E0B1E001C01D92A930B207E1F754\r\n:1000C0000E94E1000C9443010C940000CF93DF9355\r\n:1000D00090E0FC01E057FF4F249184589F4FFC01B2\r\n:1000E00084918823D1F090E0880F991FFC01EE588D\r\n:1000F000FF4FA591B491FC01E859FF4FC591D491F0\r\n:1001000061110EC09FB7F8948C91E22FE0958E2379\r\n:100110008C932881E223E8839FBFDF91CF910895DC\r\n:100120008FB7F894EC91E22BEC938FBFF6CF1F9230\r\n:100130000F920FB60F9211242F933F938F939F939B\r\n:10014000AF93BF938091050190910601A0910701A3\r\n:10015000B09108013091040123E0230F2D3758F5A9\r\n:100160000196A11DB11D2093040180930501909378\r\n:100170000601A0930701B0930801809100019091BE\r\n:100180000101A0910201B09103010196A11DB11DD1\r\n:100190008093000190930101A0930201B0930301A9\r\n:1001A000BF91AF919F918F913F912F910F900FBE73\r\n:1001B0000F901F90189526E8230F0296A11DB11DE0\r\n:1001C000D2CF789484B5826084BD84B5816084BDCB\r\n:1001D00085B5826085BD85B5816085BD80916E00E5\r\n:1001E000816080936E001092810080918100826016\r\n:1001F0008093810080918100816080938100809153\r\n:1002000080008160809380008091B1008460809341\r\n:10021000B1008091B00081608093B00080917A003D\r\n:10022000846080937A0080917A00826080937A0063\r\n:1002300080917A00816080937A0080917A00806852\r\n:1002400080937A001092C10060E082E00E94660014\r\n:1002500060E083E00E94660061E084E00E94660046\r\n:1002600061E087E00E94660061E088E00E9466002D\r\n:1002700061E08CE00E946600C0E0D0E02097F1F3DE\r\n:0A0280000E940000FBCFF894FFCFAE\r\n:00000001FF\r\n",
  "a72148475d18e8b27e152873446882e0b1c4b781712053ed0211adc604968637": ":100000000C945C000C946E000C946E000C946E00CA\r\n:100010000C946E000C946E000C946E000C946E00A8\r\n:100020000C946E000C946E000C946E000C946E0098\r\n:100030000C946E000C946E000C946E000C946E0088\r\n:100040000C9438010C946E000C946E000C946E00AD\r\n:100050000C946E000C946E000C946E000C946E0068\r\n:100060000C946E000C946E00000000002400270029\r\n:100070002A0000000000250028002B0004040404CE\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A00004081020000000080002010000030407FB\r\n:1000B000000000000000000011241FBECFEFD8E0B8\r\n:1000C000DEBFCDBF21E0A0E0B1E001C01D92A930AC\r\n:1000D000B207E1F70E9482010C9402020C94000026\r\n:1000E00090E0FC01EC55FF4F2491FC01E057FF4FDD\r\n:1000F0003491FC01E458FF4FE491EE23C9F0222330\r\n:1001000039F0233001F1A8F4213019F1223029F11E\r\n:10011000F0E0EE0FFF1FEE58FF4FA591B4918FB79F\r\n:10012000F894EC91611126C030953E233C938FBF2B\r\n:1001300008952730A9F02830C9F0243049F780917C\r\n:1001400080008F7D03C0809180008F778093800036\r\n:10015000DFCF84B58F7784BDDBCF84B58F7DFBCFB8\r\n:100160008091B0008F778093B000D2CF8091B000A3\r\n:100170008F7DF9CF3E2BDACFCF93DF9390E0FC0158\r\n:10018000E057FF4F249184589F4FFC0184918823AE\r\n:10019000D1F090E0880F991FFC01E859FF4FA5911D\r\n:1001A000B491FC01EE58FF4FC591D49161110EC07E\r\n:1001B0009FB7F8948C91E22FE0958E238C93288141\r\n:1001C000E223E8839FBFDF91CF9108958FB7F89422\r\n:1001D000EC91E22BEC938FBFF6CFE82FF0E0EC55DB\r\n:1001E000FF4FE491E33031F138F4E130B9F0E2301F\r\n:1001F000D9F061E00C947000E73041F1E83079F11A\r\n:10020000E430B9F78091800080628093800086E9B5\r\n:1002100090E090938B0080938A00089584B5806865\r\n:1002200084BD86E987BD089584B5806284BD86E972\r\n:1002300088BD08958091800080688093800086E961\r\n:1002400090E0909389008093880008958091B00099\r\n:1002500080688093B00086E98093B3000895809110\r\n:10026000B00080628093B00086E98093B400089566\r\n:100270001F920F920FB60F9211242F933F938F93DB\r\n:100280009F93AF93BF938091050190910601A09138\r\n:100290000701B09108013091040123E0230F2D37AD\r\n:1002A00058F50196A11DB11D20930401809305010D\r\n:1002B00090930601A0930701B0930801809100017B\r\n:1002C00090910101A0910201B09103010196A11D3D\r\n:1002D000B11D8093000190930101A0930201B0939E\r\n:1002E0000301BF91AF919F918F913F912F910F90FB\r\n:1002F0000FBE0F901F90189526E8230F0296A11DA0\r\n:10030000B11DD2CF789484B5826084BD84B58160FC\r\n:1003100084BD85B5826085BD85B5816085BD8091D0\r\n:100320006E00816080936E00109281008091810048\r\n:100330008260809381008091810081608093810040\r\n:10034000809180008160809380008091B100846002\r\n:100350008093B1008091B00081608093B000809163\r\n:100360007A00846080937A0080917A008260809322\r\n:100370007A0080917A00816080937A0080917A007F\r\n:10038000806880937A001092C10060E082E00E9451\r\n:10039000BC0060E083E00E94BC0061E084E00E9459\r\n:1003A000BC0061E087E00E94BC0061E088E00E9440\r\n:1003B000BC0061E08CE00E94BC00C0E0D0E061E0E5\r\n:1003C00084E00E94700060E087E00E94700061E0BD\r\n:1003D00088E00E94700060E08CE00E94700061E0A4\r\n:1003E00085E00E94BC0085E00E94ED0061E086E0AF\r\n:1003F0000E94BC0086E00E94ED00209701F30E945D\r\n:080400000000DDCFF894FFCFEE\r\n:00000001FF\r\n",
  "3604582dc2b98ecab3188ea81e07ad297e08f6122b0b5af6d220e972fe5bed8c": ":100000000C9462000C948A000C948A000C948A0070\r\n:100010000C948A000C948A000C948A000C948A0038\r\n:100020000C948A000C948A000C948A000C948A0028\r\n:100030000C948A000C948A000C948A000C948A0018\r\n:100040000C94BA020C948A000C942A030C940403B6\r\n:100050000C948A000C948A000C948A000C948A00F8\r\n:100060000C948A000C948A000000000024002700F1\r\n:100070002A0000000000250028002B0000000000DE\r\n:1000800023002600290004040404040404040202DA\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C00000005A0411241FBECFEFD8E0DEBFCDBF21\r\n:1000D00011E0A0E0B1E0EEE1F9E002C005900D9280\r\n:1000E000A232B107D9F721E0A2E2B1E001C01D922E\r\n:1000F000A83CB207E1F710E0C2E6D0E004C02197C7\r\n:10010000FE010E948704C136D107C9F70E945C0333\r\n:100110000C948D040C940000833081F028F481301D\r\n:1001200099F08230A9F008958730A9F08830C9F09D\r\n:100130008430B1F4809180008F7D03C08091800075\r\n:100140008F7780938000089584B58F7784BD08955C\r\n:1001500084B58F7DFBCF8091B0008F778093B00006\r\n:1001600008958091B0008F7DF9CFCF93DF93282F32\r\n:1001700030E0F901E255FF4F8491F901E656FF4F57\r\n:10018000D491F901EA57FF4FC491CC23A1F081111A\r\n:100190000E948C00EC2FF0E0EE0FFF1FE458FF4FA1\r\n:1001A000A591B491EC91ED2381E090E009F480E019\r\n:1001B000DF91CF91089580E090E0FACF1F93CF9325\r\n:1001C000DF93282F30E0F901E255FF4F8491F901C8\r\n:1001D000E656FF4FD491F901EA57FF4FC491CC2363\r\n:1001E000A9F0162F81110E948C00EC2FF0E0EE0F89\r\n:1001F000FF1FEE58FF4FA591B4918FB7F894EC9183\r\n:10020000111108C0D095DE23DC938FBFDF91CF9111\r\n:100210001F910895DE2BF8CFCF93DF9390E0FC0180\r\n:10022000E656FF4F24918A579F4FFC018491882303\r\n:10023000D1F090E0880F991FFC01E859FF4FA5917C\r\n:10024000B491FC01EE58FF4FC591D49161110EC0DD\r\n:100250009FB7F8948C91E22FE0958E238C932881A0\r\n:10026000E223E8839FBFDF91CF9108958FB7F89481\r\n:10027000EC91E22BEC938FBFF6CF3FB7F8948091CF\r\n:10028000C4019091C501A091C601B091C70126B5E6\r\n:10029000A89B05C02F3F19F00196A11DB11D3FBFBE\r\n:1002A000BA2FA92F982F8827BC01CD01620F711D8D\r\n:1002B000811D911D42E0660F771F881F991F4A9587\r\n:1002C000D1F70895AF92BF92CF92DF92EF92FF9253\r\n:1002D0000F931F93CF93DF936C017B018B01040F6E\r\n:1002E000151FEB015E01AE18BF08C017D10759F00A\r\n:1002F0006991D601ED91FC910190F081E02DC6014C\r\n:100300000995892B79F7C501DF91CF911F910F9145\r\n:10031000FF90EF90DF90CF90BF90AF900895FC01D9\r\n:10032000538D448D252F30E0842F90E0821B930B5A\r\n:10033000541710F0CF96089501970895FC01918D00\r\n:10034000828D981761F0A28DAE0FBF2FB11D5D9603\r\n:100350008C91928D9F5F9F73928F90E008958FEFA5\r\n:100360009FEF0895FC01918D828D981731F0828D59\r\n:10037000E80FF11D858D90E008958FEF9FEF0895B0\r\n:10038000FC01918D228D892F90E0805C9F4F821B14\r\n:1003900091098F739927089582E291E00E94C0012C\r\n:1003A00021E0892B09F420E0822F089580E090E07D\r\n:1003B000892B29F00E94CC0181110C940000089532\r\n:1003C000FC01A48DA80FB92FB11DA35ABF4F2C91CA\r\n:1003D000848D90E001968F739927848FA689B789C1\r\n:1003E0002C93A089B1898C91837080648C93938DB8\r\n:1003F000848D981306C00288F389E02D80818F7D5B\r\n:1004000080830895EF92FF920F931F93CF93DF9312\r\n:10041000EC0181E0888F9B8D8C8D98131AC0E88940\r\n:10042000F989808185FF15C09FB7F894EE89FF890F\r\n:100430006083E889F98980818370806480839FBFAD\r\n:1004400081E090E0DF91CF911F910F91FF90EF90AD\r\n:100450000895F62E0B8D10E00F5F1F4F0F731127BD\r\n:10046000E02E8C8D8E110CC00FB607FCFACFE889F8\r\n:10047000F989808185FFF5CFCE010E94E001F1CF9F\r\n:10048000EB8DEC0FFD2FF11DE35AFF4FF0829FB76C\r\n:10049000F8940B8FEA89FB8980818062CFCFCF935C\r\n:1004A000DF93EC01888D8823B9F0AA89BB89E8899C\r\n:1004B000F9898C9185FD03C0808186FD0DC00FB642\r\n:1004C00007FCF7CF8C9185FFF2CF808185FFEDCFC0\r\n:1004D000CE010E94E001E9CFDF91CF910895E82F8E\r\n:1004E000F0E0E255FF4FE491E33031F138F4E130D0\r\n:1004F000B9F0E230D9F061E00C94DE00E73041F170\r\n:10050000E83079F1E430B9F780918000806280931F\r\n:10051000800086E990E090938B0080938A00089594\r\n:1005200084B5806884BD86E987BD089584B58062FE\r\n:1005300084BD86E988BD089580918000806880939D\r\n:10054000800086E990E09093890080938800089568\r\n:100550008091B00080688093B00086E98093B300FA\r\n:1005600008958091B00080628093B00086E9809306\r\n:10057000B40008951F920F920FB60F9211242F937B\r\n:100580003F938F939F93AF93BF938091C0019091BE\r\n:10059000C101A091C201B091C3013091BF0123E01C\r\n:1005A000230F2D3758F50196A11DB11D2093BF01D2\r\n:1005B0008093C0019093C101A093C201B093C30185\r\n:1005C0008091C4019091C501A091C601B091C7016D\r\n:1005D0000196A11DB11D8093C4019093C501A09304\r\n:1005E000C601B093C701BF91AF919F918F913F9189\r\n:1005F0002F910F900FBE0F901F90189526E8230F94\r\n:100600000296A11DB11DD2CF1F920F920FB60F926D\r\n:1006100011242F933F934F935F936F937F938F9307\r\n:100620009F93AF93BF93EF93FF9382E291E00E9479\r\n:10063000E001FF91EF91BF91AF919F918F917F91D9\r\n:100640006F915F914F913F912F910F900FBE0F903F\r\n:100650001F9018951F920F920FB60F9211242F938F\r\n:100660008F939F93EF93FF93E0913201F0913301C9\r\n:100670008081E0913801F091390182FD1BC09081A9\r\n:1006800080913B018F5F8F7320913C01821741F075\r\n:10069000E0913B01F0E0EE5DFE4F958F80933B01D2\r\n:1006A000FF91EF919F918F912F910F900FBE0F901F\r\n:1006B0001F9018958081F4CF789484B5826084BDB2\r\n:1006C00084B5816084BD85B5826085BD85B5816056\r\n:1006D00085BD80916E00816080936E0010928100D4\r\n:1006E000809181008260809381008091810081608F\r\n:1006F0008093810080918000816080938000809150\r\n:10070000B10084608093B1008091B00081608093DB\r\n:10071000B00080917A00846080937A0080917A00A2\r\n:10072000826080937A0080917A00816080937A0061\r\n:1007300080917A00806880937A001092C100E091E5\r\n:100740003201F091330182E08083E0912E01F0913B\r\n:100750002F011082E0913001F09131018FEC808304\r\n:1007600010923A01E0913601F091370186E08083E2\r\n:10077000E0913401F0913501808180618083E091C6\r\n:100780003401F0913501808188608083E0913401EB\r\n:10079000F0913501808180688083E0913401F0918F\r\n:1007A000350180818F7D808360E082E00E940C01B2\r\n:1007B00060E083E00E940C0161E084E00E940C0193\r\n:1007C00061E087E00E940C0161E088E00E940C017A\r\n:1007D00061E08CE00E940C01C0E0D0E082E00E9469\r\n:1007E000B5007C0183E00E94B500EF2821F462E1AE\r\n:1007F00071E0892B11F068E171E045E050E082E2A0\r\n:1008000091E00E94620142E050E06EE171E082E21C\r\n:1008100091E00E94620161E084E00E94DE0060E0FD\r\n:1008200087E00E94DE0061E088E00E94DE0060E078\r\n:100830008CE00E94DE0061E085E00E940C0185E012\r\n:100840000E946F0261E086E00E940C0186E00E9437\r\n:100850006F020E943D014B015C0184E6C82ED12C41\r\n:10086000E12CF12C10C021E0C21AD108E108F108F6\r\n:1008700088EE880E83E0981EA11CB11CC114D1041F\r\n:10088000E104F10461F00E943D01681979098A09C7\r\n:100890009B09683E73408105910528F7F4CF2097A6\r\n:1008A00009F49CCF0E94CC01882309F497CF0E94C1\r\n:1008B000000094CFE2E2F1E01382128288EE93E02E\r\n:1008C000A0E0B0E084839583A683B78384E091E0C1\r\n:1008D0009183808385EC90E09587848784EC90E019\r\n:1008E0009787868780EC90E0918B808B81EC90E0FD\r\n:1008F000938B828B82EC90E0958B848B86EC90E0DE\r\n:10090000978B868B118E128E138E148E0895EE0F98\r\n:0E091000FF1F0590F491E02D0994F894FFCF9D\r\n:10091E0000000000020262018F014F02C0019E0121\r\n:10092E00B2016C6962726500424F524445000D0A75\r\n:02093E000000B7\r\n:00000001FF\r\n",
  "3f68e789ae76eac3772c878de2411641744fe858c39fd3ae445f02a6405f6d56": ":100000000C9461000C9473000C9473000C947300B6\r\n:100010000C9473000C9473000C9473000C94730094\r\n:100020000C9473000C9473000C9473000C94730084\r\n:100030000C9473000C9473000C9473000C94730074\r\n:100040000C94FD010C9473000C9473000C947300D9\r\n:100050000C9473000C9473000C9473000C94730054\r\n:100060000C9473000C94730000000000240027001F\r\n:100070002A0000000000250028002B0000000000DE\r\n:1000800023002600290004040404040404040202DA\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C000000011241FBECFEFD8E0DEBFCDBF21E07E\r\n:1000D000A0E0B1E001C01D92A930B207E1F70E9493\r\n:1000E00047020C94D9020C940000833081F028F46C\r\n:1000F000813099F08230A9F008958730A9F08830D6\r\n:10010000C9F08430B1F4809180008F7D03C080916C\r\n:1001100080008F7780938000089584B58F7784BDA9\r\n:10012000089584B58F7DFBCF8091B0008F77809349\r\n:10013000B00008958091B0008F7DF9CFCF93DF9309\r\n:10014000282F30E0F901E255FF4F8491F901E6567E\r\n:10015000FF4FD491F901EA57FF4FC491CC23A1F08E\r\n:1001600081110E947500EC2FF0E0EE0FFF1FE458A4\r\n:10017000FF4FA591B491EC91ED2381E090E009F45B\r\n:1001800080E0DF91CF91089580E090E0FACF1F9357\r\n:10019000CF93DF93282F30E0F901E255FF4F849190\r\n:1001A000F901E656FF4FD491F901EA57FF4FC49188\r\n:1001B000CC23A9F0162F81110E947500EC2FF0E0DE\r\n:1001C000EE0FFF1FEE58FF4FA591B4918FB7F89433\r\n:1001D000EC91111108C0D095DE23DC938FBFDF9125\r\n:1001E000CF911F910895DE2BF8CFCF93DF9390E04E\r\n:1001F000FC01E656FF4F24918A579F4FFC018491E2\r\n:100200008823D1F090E0880F991FFC01E859FF4F37\r\n:10021000A591B491FC01EE58FF4FC591D4916111A5\r\n:100220000EC09FB7F8948C91E22FE0958E238C93AB\r\n:100230002881E223E8839FBFDF91CF9108958FB794\r\n:10024000F894EC91E22BEC938FBFF6CF1F93CF93F2\r\n:10025000DF93D82FC62F172F61E00E94F500ED2FF6\r\n:10026000F0E0E255FF4FE491E33059F158F4E1300A\r\n:10027000D9F0E23009F161E08D2FDF91CF911F912C\r\n:100280000C94C700E73049F1E83079F1E43099F790\r\n:10029000809180008062809380008C2F912F9093BA\r\n:1002A0008B0080938A0004C084B5806884BDC7BD7C\r\n:1002B000DF91CF911F91089584B5806284BDC8BD40\r\n:1002C000F7CF809180008068809380008C2F912FE1\r\n:1002D0009093890080938800EBCF8091B000806874\r\n:1002E0008093B000C093B300E3CF8091B0008062F0\r\n:1002F0008093B000C093B400DBCF3FB7F8948091F7\r\n:10030000050190910601A0910701B091080126B561\r\n:10031000A89B05C02F3F19F00196A11DB11D3FBF3D\r\n:10032000BA2FA92F982F8827BC01CD01620F711D0C\r\n:10033000811D911D42E0660F771F881F991F4A9506\r\n:10034000D1F708958F929F92AF92BF92CF92DF9292\r\n:10035000EF92FF924B015C010E947D016B017C01D9\r\n:100360000E947D016C197D098E099F09683E7340CA\r\n:1003700081059105A8F321E0821A9108A108B1082E\r\n:1003800088EEC80E83E0D81EE11CF11C8114910494\r\n:10039000A104B10429F7FF90EF90DF90CF90BF90B8\r\n:1003A000AF909F908F900895FF920F931F93CF93DC\r\n:1003B000DF93D82FC62F8A01682F84E00E94C700E0\r\n:1003C000FF24F3946D2F6F2587E00E94C7006C2FE8\r\n:1003D00088E00E94C7006C2F6F258CE00E94C70048\r\n:1003E000B80185E00E942601B80186E0DF91CF9137\r\n:1003F0001F910F91FF900C9426011F920F920FB640\r\n:100400000F9211242F933F938F939F93AF93BF939A\r\n:100410008091010190910201A0910301B09104012A\r\n:100420003091000123E0230F2D3758F50196A11DCF\r\n:10043000B11D209300018093010190930201A093CC\r\n:100440000301B09304018091050190910601A091F0\r\n:100450000701B09108010196A11DB11D809305010E\r\n:1004600090930601A0930701B0930801BF91AF914B\r\n:100470009F918F913F912F910F900FBE0F901F90E2\r\n:10048000189526E8230F0296A11DB11DD2CF7894AE\r\n:1004900084B5826084BD84B5816084BD85B5826089\r\n:1004A00085BD85B5816085BD80916E00816080933A\r\n:1004B0006E001092810080918100826080938100A3\r\n:1004C00080918100816080938100809180008160B3\r\n:1004D000809380008091B10084608093B10080910E\r\n:1004E000B00081608093B00080917A008460809336\r\n:1004F0007A0080917A00826080937A0080917A00FD\r\n:10050000816080937A0080917A00806880937A007D\r\n:100510001092C10060E082E00E94F50060E083E09C\r\n:100520000E94F50061E084E00E94F50061E087E050\r\n:100530000E94F50061E088E00E94F50061E08CE037\r\n:100540000E94F500C0E0D0E082E00E949E008C0195\r\n:1005500083E00E949E00012B11F4892B19F144EBDA\r\n:1005600050E060E080E00E94D40160E471E080E04F\r\n:1005700090E00E94A20144EB50E060E081E00E9424\r\n:10058000D40164EA71E080E090E00E94A20165E09D\r\n:1005900070E080E090E00E94A2012097A9F20E9402\r\n:1005A0000000D2CF46E950E061E081E00E94D40132\r\n:0605B000EECFF894FFCF2E\r\n:00000001FF\r\n",
  "89d6216a0b6bd28769e86443e32da298e60562bc21205c579d97ce49797aa0fc": ":100000000C945C000C946E000C946E000C946E00CA\r\n:100010000C946E000C946E000C946E000C946E00A8\r\n:100020000C946E000C946E000C946E000C946E0098\r\n:100030000C946E000C946E000C946E000C946E0088\r\n:100040000C948B010C946E000C946E000C946E005A\r\n:100050000C946E000C946E000C946E000C946E0068\r\n:100060000C946E000C946E00000000002400270029\r\n:100070002A0000000000250028002B0004040404CE\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A00004081020000000080002010000030407FB\r\n:1000B000000000000000000011241FBECFEFD8E0B8\r\n:1000C000DEBFCDBF21E0A0E0B1E001C01D92A930AC\r\n:1000D000B207E1F70E94D5010C947E020C94000057\r\n:1000E00090E0FC01EC55FF4F2491FC01E057FF4FDD\r\n:1000F0003491FC01E458FF4FE491EE23C9F0222330\r\n:1001000039F0233001F1A8F4213019F1223029F11E\r\n:10011000F0E0EE0FFF1FEE58FF4FA591B4918FB79F\r\n:10012000F894EC91611126C030953E233C938FBF2B\r\n:1001300008952730A9F02830C9F0243049F780917C\r\n:1001400080008F7D03C0809180008F778093800036\r\n:10015000DFCF84B58F7784BDDBCF84B58F7DFBCFB8\r\n:100160008091B0008F778093B000D2CF8091B000A3\r\n:100170008F7DF9CF3E2BDACFCF93DF9390E0FC0158\r\n:10018000E057FF4F249184589F4FFC0184918823AE\r\n:10019000D1F090E0880F991FFC01E859FF4FA5911D\r\n:1001A000B491FC01EE58FF4FC591D49161110EC07E\r\n:1001B0009FB7F8948C91E22FE0958E238C93288141\r\n:1001C000E223E8839FBFDF91CF9108958FB7F89422\r\n:1001D000EC91E22BEC938FBFF6CFE82FF0E0EC55DB\r\n:1001E000FF4FE491E33011F138F4E130A9F0E2304F\r\n:1001F000C1F061E00C947000E73011F1E83041F19A\r\n:10020000E430B9F780918000806280938000709321\r\n:100210008B0060938A00089584B5806884BD67BDB3\r\n:10022000089584B5806284BD68BD08958091800082\r\n:10023000806880938000709389006093880008959F\r\n:100240008091B00080688093B0006093B3000895FF\r\n:100250008091B00080628093B0006093B4000895F4\r\n:100260003FB7F8948091050190910601A091070194\r\n:10027000B091080126B5A89B05C02F3F19F0019643\r\n:10028000A11DB11D3FBFBA2FA92F982F8827BC01F0\r\n:10029000CD01620F711D811D911D42E0660F771F18\r\n:1002A000881F991F4A95D1F708958F929F92AF9218\r\n:1002B000BF92CF92DF92EF92FF920E9430014B01EA\r\n:1002C0005C0188EEC82E83E0D82EE12CF12C0E9430\r\n:1002D0003001681979098A099B09683E73408105D4\r\n:1002E0009105A8F321E0C21AD108E108F10888EECF\r\n:1002F000880E83E0981EA11CB11CC114D104E10436\r\n:10030000F10429F7FF90EF90DF90CF90BF90AF906E\r\n:100310009F908F9008951F920F920FB60F92112405\r\n:100320002F933F938F939F93AF93BF93809101013E\r\n:1003300090910201A0910301B0910401309100015C\r\n:1003400023E0230F2D3758F50196A11DB11D2093F1\r\n:1003500000018093010190930201A0930301B093E7\r\n:1003600004018091050190910601A0910701B091CF\r\n:1003700008010196A11DB11D80930501909306010E\r\n:10038000A0930701B0930801BF91AF919F918F9106\r\n:100390003F912F910F900FBE0F901F90189526E858\r\n:1003A000230F0296A11DB11DD2CF789484B582602F\r\n:1003B00084BD84B5816084BD85B5826085BD85B509\r\n:1003C000816085BD80916E00816080936E00109287\r\n:1003D0008100809181008260809381008091810002\r\n:1003E0008160809381008091800081608093800093\r\n:1003F0008091B10084608093B1008091B0008160F1\r\n:100400008093B00080917A00846080937A0080911C\r\n:100410007A00826080937A0080917A008160809374\r\n:100420007A0080917A00806880937A001092C100EF\r\n:1004300061E084E00E94BC0061E087E00E94BC00B3\r\n:1004400061E088E00E94BC0061E08CE00E94BC009A\r\n:1004500061E089E00E94BC0060E08AE00E94BC008C\r\n:10046000C0E0D0E061E084E00E94700060E087E0DE\r\n:100470000E94700061E088E00E94700060E08CE003\r\n:100480000E94700061E085E00E94BC0068EC70E0B2\r\n:1004900085E00E94ED0061E086E00E94BC0068EC0F\r\n:1004A00070E086E00E94ED000E94550160E084E06B\r\n:1004B0000E94700060E087E00E94700060E088E0C9\r\n:1004C0000E94700060E08CE00E94700061E085E0B6\r\n:1004D0000E94BC0061E085E00E94700061E086E05F\r\n:1004E0000E94BC0061E086E00E9470000E945501FD\r\n:1004F000209709F4B7CF0E940000B4CFF894FFCF43\r\n:00000001FF\r\n",
  "011347bc4ecc7d0751df84fcc3c976cac74de2eee9e745cb784611e7d2656de3": ":100000000C945D000C9485000C9485000C94850084\r\n:100010000C9485000C9485000C9485000C9485004C\r\n:100020000C9485000C9485000C9485000C940E02B1\r\n:100030000C9485000C9485000C9485000C9485002C\r\n:100040000C94C4010C9485000C9485000C948500DC\r\n:100050000C9485000C9485000C9485000C9485000C\r\n:100060000C9485000C9485000000000024002700FB\r\n:100070002A0000000000250028002B0004040404CE\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A00004081020000000080002010000030407FB\r\n:1000B0000000000000000000980311241FBECFEFD5\r\n:1000C000D8E0DEBFCDBF11E0A0E0B1E0E4E5F8E0AC\r\n:1000D00002C005900D92A030B107D9F721E0A0E051\r\n:1000E000B1E001C01D92A233B207E1F710E0CDE507\r\n:1000F000D0E004C02197FE010E942204CC35D10734\r\n:10010000C9F70E94CA020C9428040C9400008F9234\r\n:100110009F92AF92BF92FF920F931F93CF93DF9363\r\n:10012000F0902F012BE02F1508F44CC020913101E5\r\n:1001300008E512E0021B110927FD1395000F111F9E\r\n:10014000000F111F20913001C8E8D0E0C21BD10977\r\n:1001500027FDD395CC0FDD1FCC0FDD1F4E010D2EDB\r\n:10016000000CAA08BB089801012E000C440B550B8B\r\n:10017000281939094A095B09DC010E94DD0324EBD7\r\n:1001800030E040E050E00E94B303820E931EA41EB4\r\n:10019000B51E8C169D062CF0E801801691060CF415\r\n:1001A000E4012297CC0FDD1F2FB7F8948F2D90E03C\r\n:1001B000FC01EE0FFF1FE80FF91FE55FFE4FD28332\r\n:1001C000C1832FBFDF91CF911F910F91FF90BF90FF\r\n:1001D000AF909F908F90089590E0FC01EC55FF4FF9\r\n:1001E0002491FC01E057FF4F3491FC01E458FF4F8C\r\n:1001F000E491EE23C9F0222339F0233001F1A8F471\r\n:10020000213019F1223029F1F0E0EE0FFF1FEE58F6\r\n:10021000FF4FA591B4918FB7F894EC91611126C06E\r\n:1002200030953E233C938FBF08952730A9F02830A6\r\n:10023000C9F0243049F7809180008F7D03C0809100\r\n:1002400080008F7780938000DFCF84B58F7784BD67\r\n:10025000DBCF84B58F7DFBCF8091B0008F7780930B\r\n:10026000B000D2CF8091B0008F7DF9CF3E2BDACF96\r\n:10027000CF93DF9390E0FC01E057FF4F2491845827\r\n:100280009F4FFC0184918823D1F090E0880F991F43\r\n:10029000FC01E859FF4FA591B491FC01EE58FF4FC6\r\n:1002A000C591D49161110EC09FB7F8948C91E22F43\r\n:1002B000E0958E238C932881E223E8839FBFDF9112\r\n:1002C000CF9108958FB7F894EC91E22BEC938FBF08\r\n:1002D000F6CF3FB7F8948091070190910801A09163\r\n:1002E0000901B0910A0126B5A89B05C02F3F19F05E\r\n:1002F0000196A11DB11D3FBFBA2FA92F982F8827A6\r\n:10030000BC01CD01620F711D811D911D42E0660F80\r\n:10031000771F881F991F4A95D1F708958F929F9252\r\n:10032000AF92BF92CF92DF92EF92FF920E9469014B\r\n:100330004B015C0180E2C82E83E0D82EE12CF12C29\r\n:100340000E946901681979098A099B09683E73400E\r\n:1003500081059105A8F321E0C21AD108E108F1084E\r\n:1003600088EE880E83E0981EA11CB11CC114D10434\r\n:10037000E104F10429F7FF90EF90DF90CF90BF9058\r\n:10038000AF909F908F9008951F920F920FB60F928B\r\n:1003900011242F933F938F939F93AF93BF9380919B\r\n:1003A000030190910401A0910501B09106013091E3\r\n:1003B000020123E0230F2D3758F50196A11DB11D31\r\n:1003C000209302018093030190930401A0930501FF\r\n:1003D000B09306018091070190910801A091090155\r\n:1003E000B0910A010196A11DB11D80930701909360\r\n:1003F0000801A0930901B0930A01BF91AF919F91A9\r\n:100400008F913F912F910F900FBE0F901F901895D5\r\n:1004100026E8230F0296A11DB11DD2CF1F920F9285\r\n:100420000FB60F9211242F933F934F935F936F93C7\r\n:100430007F938F939F93AF93BF93CF93DF93EF936C\r\n:10044000FF9380910101C0910001D0E087FF24C09B\r\n:100450001092850010928400809101018F5F80933B\r\n:10046000010180910101082E000C990B8C179D074A\r\n:1004700024F4809101018C30C4F18091840090912A\r\n:100480008500049680349C4908F47AC080918400E9\r\n:1004900090918500049676C080910101082E000C91\r\n:1004A000990B8C179D07C4F6E09101018E2FEE0F7A\r\n:1004B000990BFC01EE0FFF1FE80FF91FE55FFE4FE0\r\n:1004C000808186FFC9CFE09101018E2FEE0F990B3D\r\n:1004D000FC01EE0FFF1FE80FF91FE55FFE4F808163\r\n:1004E00060E08F730E94EC00B7CF209184003091C0\r\n:1004F0008500E09101018E2FEE0F990BFC01EE0FAC\r\n:10050000FF1FE80FF91FE55FFE4F81819281820F87\r\n:10051000931F9093890080938800E09101018E2FB2\r\n:10052000EE0F990BFC01EE0FFF1FE80FF91FE55FBF\r\n:10053000FE4F808186FF11C0E09101018E2FEE0FEA\r\n:10054000990BFC01EE0FFF1FE80FF91FE55FFE4F4F\r\n:10055000808161E08F730E94EC00FF91EF91DF9149\r\n:10056000CF91BF91AF919F918F917F916F915F914B\r\n:100570004F913F912F910F900FBE0F901F901895A4\r\n:1005800080E49CE990938900809388008FEF8093AA\r\n:100590000101E3CF789484B5826084BD84B5816025\r\n:1005A00084BD85B5826085BD85B5816085BD80913E\r\n:1005B0006E00816080936E001092810080918100B6\r\n:1005C00082608093810080918100816080938100AE\r\n:1005D000809180008160809380008091B100846070\r\n:1005E0008093B1008091B00081608093B0008091D1\r\n:1005F0007A00846080937A0080917A008260809390\r\n:100600007A0080917A00816080937A0080917A00EC\r\n:10061000806880937A001092C10061E084E00E94BB\r\n:10062000380161E087E00E94380161E088E00E94C3\r\n:10063000380161E08CE00E94380161E089E00E94AD\r\n:10064000380160E08AE00E94380180912F018C30EF\r\n:1006500008F051C061E083E00E94380180912F01D1\r\n:10066000282F30E0F901EE0FFF1FE20FF31FE55FC7\r\n:10067000FE4F9081907C9360908310923001109295\r\n:1006800031012CE0622F0E941604829FB0011124D8\r\n:1006900030E020E0AB01420F531FFA01EE0FFF1FC5\r\n:1006A000E40FF51FE55FFE4F908196FD16C02F5FAA\r\n:1006B0003F4F2C30310571F781110FC0109280002F\r\n:1006C00082E0809381001092850010928400B19A9C\r\n:1006D00080916F00826080936F00E0912F018E2FD8\r\n:1006E00090E0FC01EE0FFF1FE80FF91FE55FFE4FE2\r\n:1006F0008081806480838AE590E00E948700C0E06A\r\n:10070000D0E080EA90E00E9487000E948E0184E1A0\r\n:1007100090E00E9487000E948E018AE590E00E948E\r\n:1007200087000E948E01209761F30E940000E9CFAC\r\n:10073000809100018C3098F491E0980F9093000123\r\n:1007400080932F0190E0FC01EE0FFF1FE80FF91FCF\r\n:10075000E55FFE4F88EB9BE09283818308958FEFE6\r\n:1007600080932F010895052E97FB1EF400940E949C\r\n:10077000CA0357FD07D00E94E50307FC03D04EF4DF\r\n:100780000C94CA0350954095309521953F4F4F4F9B\r\n:100790005F4F089590958095709561957F4F8F4F2D\r\n:1007A0009F4F08950E940704A59F900DB49F900D40\r\n:1007B000A49F800D911D11240895B7FF0C94D203BE\r\n:1007C0000E94D203821B930B0895A1E21A2EAA1B4A\r\n:1007D000BB1BFD010DC0AA1FBB1FEE1FFF1FA217F1\r\n:1007E000B307E407F50720F0A21BB30BE40BF50BEE\r\n:1007F000661F771F881F991F1A9469F76095709577\r\n:10080000809590959B01AC01BD01CF010895A29FF9\r\n:10081000B001B39FC001A39F700D811D1124911DD4\r\n:10082000B29F700D811D1124911D0895991B79E0CF\r\n:1008300004C0991F961708F0961B881F7A95C9F770\r\n:1008400080950895EE0FFF1F0590F491E02D099417\r\n:04085000F894FFCF4A\r\n:00000001FF\r\n",
  "535122f24e438ee0a8252db90f45d34701f1e2667319a389ef669b109f95ff62": ":100000000C9462000C948A000C948A000C948A0070\r\n:100010000C948A000C948A000C948A000C948A0038\r\n:100020000C948A000C948A000C948A000C94160498\r\n:100030000C948A000C948A000C948A000C948A0018\r\n:100040000C9474030C948A000C94E4030C94BE0387\r\n:100050000C948A000C948A000C948A000C948A00F8\r\n:100060000C948A000C948A000000000023002600F3\r\n:10007000290000000000240027002A0000000000E2\r\n:10008000250028002B0004040404040404040202D4\r\n:100090000202020203030303030301020408102007\r\n:1000A0004080010204081020010204081020000012\r\n:1000B0000008000201000003040700000000000027\r\n:1000C0000000170511241FBECFEFD8E0DEBFCDBF63\r\n:1000D00011E0A0E0B1E0E0E6FEE002C005900D9284\r\n:1000E000A032B107D9F721E0A0E2B1E001C01D9232\r\n:1000F000AF3EB207E1F710E0C2E6D0E004C02197BE\r\n:10010000FE010E942807C136D107C9F70E94740575\r\n:100110000C942E070C9400008F929F92AF92BF9286\r\n:10012000FF920F931F93CF93DF93F090EC012BE09E\r\n:100130002F1508F44CC02091EE0108E512E0021BD7\r\n:10014000110927FD1395000F111F000F111F20919A\r\n:10015000ED01C8E8D0E0C21BD10927FDD395CC0F33\r\n:10016000DD1FCC0FDD1F4E010D2E000CAA08BB08B1\r\n:100170009801012E000C440B550B281939094A0926\r\n:100180005B09DC010E94E30624EB30E040E050E034\r\n:100190000E94B906820E931EA41EB51E8C169D06E3\r\n:1001A0002CF0E801801691060CF4E4012297CC0FA4\r\n:1001B000DD1F2FB7F8948F2D90E0FC01EE0FFF1F8D\r\n:1001C000E80FF91FE953FE4FD283C1832FBFDF91A0\r\n:1001D000CF911F910F91FF90BF90AF909F908F9004\r\n:1001E000089590E0FC01E255FF4F2491FC01E65692\r\n:1001F000FF4F3491FC01EA57FF4FE491EE23C9F021\r\n:10020000222339F0233001F1A8F4213019F12230F2\r\n:1002100029F1F0E0EE0FFF1FE458FF4FA591B491D4\r\n:100220008FB7F894EC91611126C030953E233C9332\r\n:100230008FBF08952730A9F02830C9F0243049F73E\r\n:10024000809180008F7D03C0809180008F778093A4\r\n:100250008000DFCF84B58F7784BDDBCF84B58F7D01\r\n:10026000FBCF8091B0008F778093B000D2CF809188\r\n:10027000B0008F7DF9CF3E2BDACFCF93DF9390E0A4\r\n:10028000FC01E656FF4F24918A579F4FFC01849151\r\n:100290008823D1F090E0880F991FFC01EE58FF4FA2\r\n:1002A000A591B491FC01E458FF4FC591D49161111F\r\n:1002B0000EC09FB7F8948C91E22FE0958E238C931B\r\n:1002C0002881E223E8839FBFDF91CF9108958FB704\r\n:1002D000F894EC91E22BEC938FBFF6CF3FB7F894F4\r\n:1002E0008091260190912701A0912801B0912901C8\r\n:1002F00026B5A89B05C02F3F19F00196A11DB11D81\r\n:100300003FBFBA2FA92F982F8827BC01CD01620FBC\r\n:10031000711D811D911D42E0660F771F881F991F77\r\n:100320004A95D1F708958F929F92AF92BF92CF9244\r\n:10033000DF92EF92FF924B015C010E946E016B0114\r\n:100340007C010E946E016C197D098E099F09683E2F\r\n:10035000734081059105A8F321E0821A9108A10854\r\n:10036000B10888EEC80E83E0D81EE11CF11C811490\r\n:100370009104A104B10429F7FF90EF90DF90CF9092\r\n:10038000BF90AF909F908F900895AF92BF92CF9201\r\n:10039000DF92EF92FF920F931F93CF93DF936C0145\r\n:1003A0007B018B01040F151FEB015E01AE18BF0826\r\n:1003B000C017D10759F06991D601ED91FC910190D8\r\n:1003C000F081E02DC6010995892B79F7C501DF91F0\r\n:1003D000CF911F910F91FF90EF90DF90CF90BF9042\r\n:1003E000AF900895FC01538D448D252F30E0842F6C\r\n:1003F00090E0821B930B541710F0CF96089501974D\r\n:100400000895FC01918D828D981761F0A28DAE0F39\r\n:10041000BF2FB11D5D968C91928D9F5F9F73928FC0\r\n:1004200090E008958FEF9FEF0895FC01918D828DEC\r\n:10043000981731F0828DE80FF11D858D90E00895B9\r\n:100440008FEF9FEF0895FC01918D228D892F90E011\r\n:10045000805C9F4F821B91098F73992708958AE2D0\r\n:1004600091E00E94230221E0892B09F420E0822FF1\r\n:10047000089580E090E0892B29F00E942F028111DD\r\n:100480000C9400000895FC01A48DA80FB92FB11D94\r\n:10049000A35ABF4F2C91848D90E001968F739927BA\r\n:1004A000848FA689B7892C93A089B1898C91837098\r\n:1004B00080648C93938D848D981306C00288F38991\r\n:1004C000E02D80818F7D80830895EF92FF920F93BE\r\n:1004D0001F93CF93DF93EC0181E0888F9B8D8C8DF0\r\n:1004E00098131AC0E889F989808185FF15C09FB7E4\r\n:1004F000F894EE89FF896083E889F98980818370A7\r\n:10050000806480839FBF81E090E0DF91CF911F9155\r\n:100510000F91FF90EF900895F62E0B8D10E00F5F76\r\n:100520001F4F0F731127E02E8C8D8E110CC00FB64C\r\n:1005300007FCFACFE889F989808185FFF5CFCE01E4\r\n:100540000E944302F1CFEB8DEC0FFD2FF11DE35A1A\r\n:10055000FF4FF0829FB7F8940B8FEA89FB89808167\r\n:100560008062CFCFCF93DF93EC01888D8823B9F0E1\r\n:10057000AA89BB89E889F9898C9185FD03C08081AE\r\n:1005800086FD0DC00FB607FCF7CF8C9185FFF2CF2B\r\n:10059000808185FFEDCFCE010E944302E9CFDF913C\r\n:1005A000CF9108950E948C006CE271E080E090E0B1\r\n:1005B0000C949301FC0101900020E9F73197AF0101\r\n:1005C000481B590BBC018AE291E00C94C5018F9243\r\n:1005D0009F92AF92BF920F931F93CF93DF93CDB7AC\r\n:1005E000DEB7A1970FB6F894DEBF0FBECDBF19A23C\r\n:1005F000423008F44AE08E010F5D1F4F842E912C8B\r\n:10060000B12CA12CA50194010E94EB06E62FB901A3\r\n:10061000CA01EA30F4F4E05DD801EE938D01232B9A\r\n:10062000242B252B79F790E080E0109719F0CD016D\r\n:100630000E94DA02A1960FB6F894DEBF0FBECDBFBE\r\n:10064000DF91CF911F910F91BF90AF909F908F90AE\r\n:100650000895E95CE1CF0F931F9360E089E00E9469\r\n:10066000F10083E090E00197F1F761E089E00E94FA\r\n:10067000F10083E290E00197F1F760E089E00E94E9\r\n:10068000F100E4EAF0E06491E0E9F0E0E491F0E008\r\n:10069000EE0FFF1FE859FF4F8591949108EA11E68C\r\n:1006A00020E030E0462F0E94D204611571058105DB\r\n:1006B0009105A9F06F5F7F4F8F4F9F4F9F7061151E\r\n:1006C00071058105910559F02AE330E040E050E0E2\r\n:1006D0000E94EB06CA01B9011F910F91089520E90C\r\n:1006E00031E040E050E0F6CF1F920F920FB60F922C\r\n:1006F00011242F933F938F939F93AF93BF93809138\r\n:10070000220190912301A0912401B0912501309103\r\n:10071000210123E0230F2D3758F50196A11DB11DAE\r\n:10072000209321018093220190932301A09324011F\r\n:10073000B09325018091260190912701A091280175\r\n:10074000B09129010196A11DB11D809326019093BE\r\n:100750002701A0932801B0932901BF91AF919F91E8\r\n:100760008F913F912F910F900FBE0F901F90189572\r\n:1007700026E8230F0296A11DB11DD2CF1F920F9222\r\n:100780000FB60F9211242F933F934F935F936F9364\r\n:100790007F938F939F93AF93BF93EF93FF938AE2DF\r\n:1007A00091E00E944302FF91EF91BF91AF919F9121\r\n:1007B0008F917F916F915F914F913F912F910F900A\r\n:1007C0000FBE0F901F9018951F920F920FB60F92A9\r\n:1007D00011242F938F939F93EF93FF93E0913A010E\r\n:1007E000F0913B018081E0914001F091410182FD57\r\n:1007F0001BC09081809143018F5F8F7320914401D2\r\n:10080000821741F0E0914301F0E0E65DFE4F958FE5\r\n:1008100080934301FF91EF919F918F912F910F90C2\r\n:100820000FBE0F901F9018958081F4CF1F920F92EA\r\n:100830000FB60F9211242F933F934F935F936F93B3\r\n:100840007F938F939F93AF93BF93CF93DF93EF9358\r\n:10085000FF9380912001C091EB01D0E087FF24C07D\r\n:100860001092850010928400809120018F5F809308\r\n:10087000200180912001082E000C990B8C179D07F8\r\n:1008800024F4809120018C30C4F1809184009091F7\r\n:100890008500049680349C4908F47AC080918400D5\r\n:1008A00090918500049676C080912001082E000C5E\r\n:1008B000990B8C179D07C4F6E09120018E2FEE0F47\r\n:1008C000990BFC01EE0FFF1FE80FF91FE953FE4FD4\r\n:1008D000808186FFC9CFE09120018E2FEE0F990B0A\r\n:1008E000FC01EE0FFF1FE80FF91FE953FE4F808157\r\n:1008F00060E08F730E94F100B7CF209184003091A7\r\n:100900008500E09120018E2FEE0F990BFC01EE0F78\r\n:10091000FF1FE80FF91FE953FE4F81819281820F7B\r\n:10092000931F9093890080938800E09120018E2F7F\r\n:10093000EE0F990BFC01EE0FFF1FE80FF91FE953B3\r\n:10094000FE4F808186FF11C0E09120018E2FEE0FB7\r\n:10095000990BFC01EE0FFF1FE80FF91FE953FE4F43\r\n:10096000808161E08F730E94F100FF91EF91DF9130\r\n:10097000CF91BF91AF919F918F917F916F915F9137\r\n:100980004F913F912F910F900FBE0F901F90189590\r\n:1009900080E49CE990938900809388008FEF809396\r\n:1009A0002001E3CFCF92DF92EF92FF920F931F933C\r\n:1009B000E82FF92F05C0015011092109310961F112\r\n:1009C000908196239417B9F305C0015011092109AC\r\n:1009D000310911F1908196239413F7CFC12CD12CBA\r\n:1009E000E12CF12C0AC08FEFC81AD80AE80AF80ADD\r\n:1009F0000C151D052E053F0579F08081862384178F\r\n:100A000091F36C2D7D2D8E2D9F2D1F910F91FF90B9\r\n:100A1000EF90DF90CF90089560E070E080E090E08C\r\n:100A20001F910F91FF90EF90DF90CF90089510925B\r\n:100A30002D0110922C0188EE93E0A0E0B0E08093AD\r\n:100A40002E0190932F01A0933001B093310184E0E7\r\n:100A500091E090932B0180932A0185EC90E0909394\r\n:100A600037018093360184EC90E0909339018093B4\r\n:100A7000380180EC90E090933B0180933A0181EC47\r\n:100A800090E090933D0180933C0182EC90E0909344\r\n:100A90003F0180933E0186EC90E09093410180936A\r\n:100AA00040011092430110924401109245011092AE\r\n:100AB00046018091EB018C3098F491E0980F90936F\r\n:100AC000EB018093EC0190E0FC01EE0FFF1FE80FBB\r\n:100AD000F91FE953FE4F88EB9BE0928381830895D1\r\n:100AE0008FEF8093EC010895789484B5826084BD83\r\n:100AF00084B5816084BD85B5826085BD85B5816022\r\n:100B000085BD80916E00816080936E00109281009F\r\n:100B1000809181008260809381008091810081605A\r\n:100B2000809381008091800081608093800080911B\r\n:100B3000B10084608093B1008091B00081608093A7\r\n:100B4000B00080917A00846080937A0080917A006E\r\n:100B5000826080937A0080917A00816080937A002D\r\n:100B600080917A00806880937A001092C100E091B1\r\n:100B70003A01F0913B0182E08083E0913601F091EF\r\n:100B800037011082E0913801F09139018FEC8083B8\r\n:100B900010924201E0913E01F0913F0186E0808396\r\n:100BA000E0913C01F0913D01808180618083E09182\r\n:100BB0003C01F0913D01808188608083E0913C019F\r\n:100BC000F0913D01808180688083E0913C01F0914B\r\n:100BD0003D0180818F7D808361E084E00E943D0142\r\n:100BE00061E087E00E943D0161E088E00E943D01F4\r\n:100BF00061E08CE00E943D0161E089E00E943D01DE\r\n:100C000060E08AE00E943D018091EC018C3008F0A8\r\n:100C100051C061E083E00E943D018091EC01282FEA\r\n:100C200030E0F901EE0FFF1FE20FF31FE953FE4F13\r\n:100C30009081907C936090831092ED011092EE0170\r\n:100C40002CE0622F0E941C07829FB001112430E02B\r\n:100C500020E0AB01420F531FFA01EE0FFF1FE40F1C\r\n:100C6000F51FE953FE4F908196FD16C02F5F3F4F51\r\n:100C70002C30310571F781110FC01092800082E095\r\n:100C8000809381001092850010928400B19A809127\r\n:100C90006F00826080936F00E091EC018E2F90E0F6\r\n:100CA000FC01EE0FFF1FE80FF91FE953FE4F808193\r\n:100CB000806480838AE590E00E948C00C0E0D0E0F0\r\n:100CC00080EA90E00E94D2020E942B034B015C015B\r\n:100CD00084E190E00E94D2020E942B036B017C0110\r\n:100CE0008AE590E00E94D20282E191E00E94DA025D\r\n:100CF0004AE0C501B401B7FE0DC06DE28AE291E0A1\r\n:100D00000E94650266277727CB01681979098A094D\r\n:100D10009B094AE00E94E70287E191E00E94DA0223\r\n:100D20004AE0C701B601F7FE0DC06DE28AE291E02C\r\n:100D30000E94650266277727CB016C197D098E0911\r\n:100D40009F094AE00E94E7028DE191E00E94DA02E9\r\n:100D500068EC70E080E090E00E949301209709F435\r\n:100D6000AFCF0E942F02882309F4AACF0E9400006F\r\n:100D7000A7CF052E97FB1EF400940E94D00657FDC6\r\n:100D800007D00E94EB0607FC03D04EF40C94D0066B\r\n:100D900050954095309521953F4F4F4F5F4F0895A7\r\n:100DA00090958095709561957F4F8F4F9F4F0895D7\r\n:100DB0000E940D07A59F900DB49F900DA49F800DDC\r\n:100DC000911D11240895B7FF0C94D8060E94D806EF\r\n:100DD000821B930B0895A1E21A2EAA1BBB1BFD01D7\r\n:100DE0000DC0AA1FBB1FEE1FFF1FA217B307E4070A\r\n:100DF000F50720F0A21BB30BE40BF50B661F771F62\r\n:100E0000881F991F1A9469F7609570958095909541\r\n:100E10009B01AC01BD01CF010895A29FB001B39F1A\r\n:100E2000C001A39F700D811D1124911DB29F700DF3\r\n:100E3000811D1124911D0895991B79E004C0991F0B\r\n:100E4000961708F0961B881F7A95C9F78095089524\r\n:100E5000EE0FFF1F0590F491E02D0994F894FFCF59\r\n:100E6000000000006502C501F201B2022302010286\r\n:100E70001502697A713D00206465723D000D0A001B\r\n:00000001FF\r\n",
  "47d4ef95c291db21a23ae88a330a22b84da69c1d276ed9cd403a3c528f56eb69": ":100000000C9446050C946E050C946E050C946E05CC\r\n:100010000C946E050C946E050C946E050C946E0594\r\n:100020000C946E050C946E050C946E050C94581689\r\n:100030000C946E050C946E050C946E050C946E0574\r\n:100040000C940E160C946E050C946E050C946E05B3\r\n:100050000C946E050C946E050C946E050C946E0554\r\n:100060000C9414170C946E05000000002300260069\r\n:1000700029002200FF2100000000003E5B4F5B3E94\r\n:100080003E6B4F6B3E1C3E7C3E1C183C7E3C181C5D\r\n:10009000577D571C1C5E7F5E1C00183C1800FFE754\r\n:1000A000C3E7FF0018241800FFE7DBE7FF30483AFA\r\n:1000B000060E2629792926407F050507407F05255C\r\n:1000C0003F5A3CE73C5A7F3E1C1C08081C1C3E7FE4\r\n:1000D00014227F22145F5F005F5F06097F017F00AB\r\n:1000E0006689956A606060606094A2FFA2940804CB\r\n:1000F0007E040810207E201008082A1C08081C2AEC\r\n:1001000008081E101010100C1E0C1E0C30383E3843\r\n:1001100030060E3E0E06000000000000005F0000EA\r\n:100120000007000700147F147F14242A7F2A12235B\r\n:100130001308646236495620500008070300001C6B\r\n:100140002241000041221C002A1C7F1C2A08083E74\r\n:100150000808008070300008080808080000606087\r\n:100160000020100804023E5149453E00427F4000F5\r\n:1001700072494949462141494D331814127F1027CD\r\n:10018000454545393C4A494931412111090736491C\r\n:10019000494936464949291E0000140000004034F0\r\n:1001A00000000008142241141414141400412214F5\r\n:1001B0000802015909063E415D594E7C1211127C1C\r\n:1001C0007F494949363E414141227F4141413E7F7D\r\n:1001D000494949417F090909013E414151737F085D\r\n:1001E00008087F00417F41002040413F017F081403\r\n:1001F00022417F404040407F021C027F7F04081064\r\n:100200007F3E4141413E7F090909063E4151215E41\r\n:100210007F09192946264949493203017F01033FD5\r\n:100220004040403F1F2040201F3F4038403F631464\r\n:1002300008146303047804036159494D43007F4166\r\n:1002400041410204081020004141417F04020102A3\r\n:1002500004404040404000030708002054547840C8\r\n:100260007F284444383844444428384444287F385C\r\n:100270005454541800087E090218A4A49C787F08DE\r\n:1002800004047800447D40002040403D007F102859\r\n:10029000440000417F40007C047804787C0804041A\r\n:1002A000783844444438FC1824241818242418FCB2\r\n:1002B0007C08040408485454542404043F44243C57\r\n:1002C0004040207C1C2040201C3C4030403C4428C6\r\n:1002D0001028444C9090907C4464544C4400083660\r\n:1002E00041000000770000004136080002010204CE\r\n:1002F000023C2623263C1EA1A161123A4040207AEE\r\n:100300003854545559215555794122545478422135\r\n:100310005554784020545579400C1E52721239556C\r\n:100320005555593954545459395554545800004569\r\n:100330007C410002457D420001457C407D12111246\r\n:100340007DF0282528F07C545545002054547C54D9\r\n:100350007C0A097F4932494949323A4444443A3295\r\n:100360004A4848303A4141217A3A42402078009D3B\r\n:10037000A0A07D3D4242423D3D4040403D3C24FFE7\r\n:100380002424487E4943662B2FFC2F2BFF0929F696\r\n:1003900020C0887E090320545479410000447D41E7\r\n:1003A0003048484A32384040227A007A0A0A727D40\r\n:1003B0000D19317D2629292F28262929292630485B\r\n:1003C0004D4020380808080808080808382F10C8C9\r\n:1003D000ACBA2F102834FA00007B000008142A144D\r\n:1003E0002222142A14085500550055AA55AA55AAC8\r\n:1003F000FF55FF55FF000000FF00101010FF001414\r\n:100400001414FF001010FF00FF1010F010F014146F\r\n:1004100014FC001414F700FF0000FF00FF1414F494\r\n:1004200004FC141417101F10101F101F1414141F95\r\n:1004300000101010F0000000001F101010101F100E\r\n:10044000101010F010000000FF101010101010100D\r\n:100450001010FF10000000FF140000FF00FF00005C\r\n:100460001F10170000FC04F414141710171414F4D0\r\n:1004700004F40000FF00F714141414141414F7000B\r\n:10048000F7141414171410101F101F141414F4145C\r\n:100490001010F010F000001F101F0000001F1400CB\r\n:1004A0000000FC140000F010F01010FF10FF1414F6\r\n:1004B00014FF141010101F00000000F010FFFFFFC9\r\n:1004C000FFFFF0F0F0F0F0FFFFFF0000000000FF82\r\n:1004D000FF0F0F0F0F0F3844443844FC4A4A4A3488\r\n:1004E0007E02020606027E027E026355494163389F\r\n:1004F00044443C04407E201E2006027E020299A550\r\n:10050000E7A5991C2A492A1C4C7201724C304A4DAD\r\n:100510004D303048784830BC625A463D3E494949E2\r\n:10052000007E0101017E2A2A2A2A2A44445F44448B\r\n:1005300040514A444040444A51400000FF0103E01A\r\n:1005400080FF000008086B6B083612362436060F51\r\n:10055000090F06000018180000001010003040FFBE\r\n:100560000101001F01011E00191D1712003C3C3C37\r\n:100570003C0000000000000103070F1F3F7F0080C8\r\n:10058000C0E0F0F8FCFEDB40A4A62EAF2000A1C81E\r\n:10059000D300408DAED580A80000600000000000B0\r\n:1005A000000000000000000000E00000000000006B\r\n:1005B0000000000000000001E0000000000000005A\r\n:1005C00000000000000001F000000000000000003A\r\n:1005D000000000000003F000000000000000000028\r\n:1005E0000000000007F00000000000000000000014\r\n:1005F00000000007F80000000000000000000000FC\r\n:1006000000000FF800000003C0007E000001E000C1\r\n:100610007F0FF800000003C000FE000001E000FFB3\r\n:10062000EFF800000003C000FE000001E000FFFF43\r\n:10063000F800000003C000F00000000F007FFE7F04\r\n:10064000C0000003C000F00000000F003FFE7FF874\r\n:100650003FF1FBCFFCFEF3BC3DEFE01FFE7FFF7FD1\r\n:10066000FBFFDFFEFEFFBC3DEFE01FC6FFFF7FFB91\r\n:10067000FFDFFEFEFFBC3DEFE00FE3C7FE787BC36C\r\n:10068000DE1EF0FFBC3DEF0007FF87FC787BC3DE7A\r\n:100690001EF0F83C3DEF0001FFFFF0007BC3C01EE1\r\n:1006A000F0F03C3DEF0001F37FE03FFBC3CFFEF0F5\r\n:1006B000F03C3DEF0003E33F807FFBC3DFFEF0F043\r\n:1006C0003C3DEF0007E73C00787BC3DE1EF0F03CCA\r\n:1006D0003DEF0007FFBE00787BC3DE1EF0F03C3D1F\r\n:1006E000EF0007FFFE00787BC3DE1EF0F03C3DEF1D\r\n:1006F000000FFFFE007FFBFFDFFEF0F03FFDEFE0AD\r\n:100700000FFFFF007FFBFFDFFEF0F03FFDEFE00F8C\r\n:10071000F9FF003E79F9CF9EF0F01F3DE7E01FF1B1\r\n:10072000FF0000000000000000000000001F80FF2C\r\n:10073000007FFFFFFFFFFFFFFFFFFFE01C007F00C8\r\n:100740007FFFFFFFFEB46D888D18E000001F007F63\r\n:10075000FFFFFFFE95AD7DB577E000000F007FFF46\r\n:10076000FFFFFEA5AD9D8D19E0000006007FFFFF95\r\n:10077000FFFEB5ADEDB57EE0000000000001800099\r\n:1007800000000000000000000380000000000000E6\r\n:1007900000000007C000000000000000000007C0CB\r\n:1007A0000000000000000000000FC000000000007A\r\n:1007B000000000001FE00000000000000000001F1B\r\n:1007C000E00000000000000000003FE0000000002A\r\n:1007D00000000000003FF0000000000000000000EA\r\n:1007E0007FF0000000000000001FF87FF000000014\r\n:1007F000000000003FFE7FF0000000000000003F0E\r\n:10080000FF7FF0000000000000001FFFFBE0000081\r\n:1008100000000000000FFFF9FFC000000000000012\r\n:100820000FFFF9FFF800000000000007FFF1FFFFD5\r\n:1008300000000000000003FC73FFFF8000000000C8\r\n:100840000001FE3FFFFF80000000000000FF1E0FC0\r\n:10085000FF000000000000007FFE1FFC0000000001\r\n:100860000000003FFFFFF8000000000000000FDF65\r\n:10087000FFE0000000000000001F19FFC0000000A2\r\n:10088000000000003F3CFF00000000000000007E70\r\n:100890007CF800000000000000007FFE7C000000EB\r\n:1008A0000000000000FFFFFC00000000000000004E\r\n:1008B000FFFFFE0000000000000000FFFFFE000040\r\n:1008C000000000000001FFEFFE000000000000003B\r\n:1008D00001FFCFFE0000000000000003FF07FE0044\r\n:1008E00000000000000003FC07FE00000000000004\r\n:1008F0000003F003FE00000000000000018000FE85\r\n:10090000000000000000000000007E000000000069\r\n:1009100000000000003E0000000000000000000099\r\n:100920000C000000000000078000FC000003C00075\r\n:100930000000078001FC000003C0000000078001E8\r\n:10094000FC000003C0000000078001E00000001E62\r\n:10095000000000078001E00000001E007FE3F79F19\r\n:10096000F9FDE7787BDFC0FFF7FFBFFDFDFF787B78\r\n:10097000DFC0FFF7FFBFFDFDFF787BDFC0F0F7872B\r\n:10098000BC3DE1FF787BDE00F0F787BC3DE1F0780D\r\n:100990007BDE0000F787803DE1E0787BDE007FF7BB\r\n:1009A000879FFDE1E0787BDE00FFF787BFFDE1E098\r\n:1009B000787BDE00F0F787BC3DE1E0787BDE00F07D\r\n:1009C000F787BC3DE1E0787BDE00F0F787BC3DE1D6\r\n:1009D000E0787BDE00FFF7FFBFFDE1E07FFBDFC0DB\r\n:1009E000FFF7FFBFFDE1E07FFBDFC07CF3F39F3D3E\r\n:1009F000E1E03E7BCFC000000000000000000000EE\r\n:100A000000FFFFFFFFFFFFFFFFFFFFC0FFFFFFFF34\r\n:100A1000FD68DB111A31C0FFFFFFFFFD2B5AFB6A97\r\n:100A2000EFC0FFFFFFFFFD4B5B3B1A33C0FFFFFF33\r\n:100A3000FFFD6B5BDB6AFDC00000000024002700A7\r\n:100A40002A0000000000250028002B0004040404F4\r\n:100A50000404040402020202020203030303030368\r\n:100A60000102040810204080010204081020010245\r\n:100A70000408102000000008000201000003040721\r\n:100A8000000000000000000078184E1C11241FBE5A\r\n:100A9000CFEFD8E0DEBFCDBF11E0A0E0B1E0E0E2F3\r\n:100AA000FCE302C005900D92A434B107D9F722E00F\r\n:100AB000A4E4B1E001C01D92A138B207E1F715E04E\r\n:100AC000C5E4D5E004C02197FE010E94CC1CC434CB\r\n:100AD000D107C9F70E941D190C94031E0C94000045\r\n:100AE00008958F929F92AF92BF92FF920F931F93A0\r\n:100AF000CF93DF93F0902E022BE02F1508F44CC01B\r\n:100B00002091300208E512E0021B110927FD139520\r\n:100B1000000F111F000F111F20912F02C8E8D0E015\r\n:100B2000C21BD10927FDD395CC0FDD1FCC0FDD1FD4\r\n:100B30004E010D2E000CAA08BB089801012E000CD6\r\n:100B4000440B550B281939094A095B09DC010E943D\r\n:100B5000871C24EB30E040E050E00E945D1C820ED8\r\n:100B6000931EA41EB51E8C169D062CF0E80180165F\r\n:100B700091060CF4E4012297CC0FDD1F2FB7F894F7\r\n:100B80008F2D90E0FC01EE0FFF1FE80FF91FE75FCC\r\n:100B9000FD4FD283C1832FBFDF91CF911F910F9162\r\n:100BA000FF90BF90AF909F908F90089590E0FC01D0\r\n:100BB000EC58F54F2491FC01E05AF54F3491FC01BB\r\n:100BC000E45BF54FE491EE23C9F0222339F02330A2\r\n:100BD00001F1A8F4213019F1223029F1F0E0EE0FF3\r\n:100BE000FF1FEE5BF54FA591B4918FB7F894EC9190\r\n:100BF000611126C030953E233C938FBF0895273066\r\n:100C0000A9F02830C9F0243049F7809180008F7D09\r\n:100C100003C0809180008F7780938000DFCF84B500\r\n:100C20008F7784BDDBCF84B58F7DFBCF8091B00003\r\n:100C30008F778093B000D2CF8091B0008F7DF9CFB5\r\n:100C40003E2BDACFCF93DF9390E0FC01E05AF54FD3\r\n:100C50002491845B954FFC0184918823D1F090E02E\r\n:100C6000880F991FFC01E85CF54FA591B491FC0138\r\n:100C7000EE5BF54FC591D49161110EC09FB7F8940A\r\n:100C80008C91E22FE0958E238C932881E223E883D8\r\n:100C90009FBFDF91CF9108958FB7F894EC91E22B2D\r\n:100CA000EC938FBFF6CF3FB7F894809101029091FB\r\n:100CB0000202A0910302B091040226B5A89B05C0D0\r\n:100CC0002F3F19F00196A11DB11D3FBFBA2FA92FCB\r\n:100CD000982F8827BC01CD01620F711D811D911DC8\r\n:100CE00042E0660F771F881F991F4A95D1F7089534\r\n:100CF0008F929F92AF92BF92CF92DF92EF92FF922C\r\n:100D00004B015C010E9453066B017C010E9453065B\r\n:100D10006C197D098E099F09683E73408105910514\r\n:100D2000A8F321E0821A9108A108B10888EEC80E44\r\n:100D300083E0D81EE11CF11C81149104A104B104CC\r\n:100D400029F7FF90EF90DF90CF90BF90AF909F90EA\r\n:100D50008F90089508950895AF92BF92CF92DF9239\r\n:100D6000EF92FF920F931F93CF93DF936C017B0160\r\n:100D70008B01040F151FEB015E01AE18BF08C017F1\r\n:100D8000D10759F06991D601ED91FC910190F08164\r\n:100D9000E02DC6010995892B79F7C501DF91CF9127\r\n:100DA0001F910F91FF90EF90DF90CF90BF90AF9089\r\n:100DB0000895EF92FF920F931F93CF93DF93EC016F\r\n:100DC000EC80FD806E157F050CF070C057FF04C0ED\r\n:100DD000240F351F50E040E08E819F81FA01E20F21\r\n:100DE000F31F8E179F071CF49C01241B350B121652\r\n:100DF00013060CF05BC0922F842F869586958695FE\r\n:100E00008E9DD0018F9DB00D11246A0F7B1FAF8D79\r\n:100E1000B8A1A60FB71F477049F188E0841B482F7F\r\n:100E2000682F70E0FB01E258FA4FE491281708F0B0\r\n:100E300063C0621B71092FEF30E002C03595279522\r\n:100E40006A95E2F7E2230130110539F0B0F1023082\r\n:100E5000110561F58C91E82702C08C91E82BEC9389\r\n:100E6000941720F12C813D81A20FB31FE92FE41BC1\r\n:100E7000E83078F00230110521F58E2F9C91909585\r\n:100E80009C932C813D81A20FB31F88508830B0F70E\r\n:100E9000E770EE2359F0F0E0EA58FA4FE4910130A0\r\n:100EA0001105F9F010F10230110519F1DF91CF9120\r\n:100EB0001F910F91FF90EF900895E0958C91E8239A\r\n:100EC000CECF81E00115110509F480E081959E2FB8\r\n:100ED0008C932C813D81A20FB31F98509830C0F79E\r\n:100EE000D7CF8C91E82BEC93E1CFE0958C91E82360\r\n:100EF000FACF8C91E827F7CF0130110509F4ADCF77\r\n:100F0000E0F20230110509F4A5CFAE0DBF1DAECF42\r\n:100F10000F931F93CF93DF9377FF04C0260F371FE4\r\n:100F200070E060E0DC011496CD91DC91FB01E20FF2\r\n:100F3000F31FCE17DF071CF49E01261B370B12167A\r\n:100F400013064CF5FA0157FD3796A3E0F595E795A2\r\n:100F5000AA95E1F7EC9FD001ED9FB00DFC9FB00D7D\r\n:100F600011246A0F7B1FDC015F96ED91FC91E60F67\r\n:100F7000F71F4770552781E090E001C0880F4A9520\r\n:100F8000EAF7482F0130110559F0A8F02E0F3F1F46\r\n:100F900002301105E1F0DF91CF911F910F9108957B\r\n:100FA0002E0F3F1FE217F307B1F38191DF01119775\r\n:100FB000842B8C93F7CF80952E0F3F1FE217F307FA\r\n:100FC00051F39191DF01119798239C93F7CFE2178A\r\n:100FD000F30709F38191DF01119784278C93F7CFF1\r\n:100FE0000F931F93FA01DC0156964C9156974230AD\r\n:100FF000E9F04330A1F1413061F514964D915C91D7\r\n:10100000DA01AE1BBF0BFD01E21BF30B77FD0BC03A\r\n:10101000DC0116964D915C916417750724F4AB01C1\r\n:10102000BF010E9488071F910F91089514964D915A\r\n:101030005C91DA01A61BB70BBD0161507109DC019F\r\n:1010400016964D915C91DA01AE1BBF0BFD01E21BC0\r\n:10105000F30B77FDE8CFAF010E94D906E4CF1696D7\r\n:101060004D915C91DA01A61BB70BBD01615071096E\r\n:10107000CDCF0F931F93FA01DC0156964C915697F2\r\n:101080004230A9F0433091F1413019F514964D9159\r\n:101090005C91DA01AE1BBF0BFD013197F7FD04C077\r\n:1010A000AB01BF010E94D9061F910F9108951496BC\r\n:1010B0004D915C91DA01A61BB70BBD01DC011696C0\r\n:1010C0004D915C91DA01AE1BBF0BFD013197621BA4\r\n:1010D000730BF7FDE9CFDC0116964D915C91E41797\r\n:1010E000F50714F7AF010E948807DECF16964D91E1\r\n:1010F0005C91DA01A61BB70BBD01621B730BCECF4F\r\n:10110000FC0177FD64C080859185681779070CF034\r\n:101110005EC057FD5CC082859385481759070CF067\r\n:1011200056C086898230B1F0833029F1813041F494\r\n:1011300084819581841B950BAB01BC0161507109C1\r\n:101140002130310509F108F443C02230310509F49A\r\n:1011500063C0089584819581DC01A61BB70BBD0196\r\n:101160006150710986819781DC01A41BB50BAD012B\r\n:1011700041505109E5CF86819781861B970BBA01B3\r\n:10118000AC0141505109DCCFCA0157FD0796A3E0DD\r\n:1011900095958795AA95E1F7A481B5818A9F9001DD\r\n:1011A0008B9F300D9A9F300D1124620F731F078C97\r\n:1011B000F0A1E02DE60FF71F4770552721E030E042\r\n:1011C00001C0220F4A95EAF78081822B808308951F\r\n:1011D000CA0157FD079633E0959587953A95E1F753\r\n:1011E000A481B5818A9F90018B9F300D9A9F300D0D\r\n:1011F0001124620F731F078CF0A1E02DE60FF71F7B\r\n:101200004770552781E090E001C0880F4A95EAF7C2\r\n:10121000809590818923DACFCA0157FD079623E094\r\n:10122000959587952A95E1F7A481B5818A9F9001CC\r\n:101230008B9F300D9A9F300D1124620F731F078C06\r\n:10124000F0A1E02DE60FF71F4770552721E030E0B1\r\n:1012500001C0220F4A95EAF780818227B7CF08950F\r\n:101260008EBD00000DB407FEFDCF8EB508958CBD78\r\n:101270009DBD08950895FC016370668B84819581FE\r\n:1012800026813781613039F0633029F0918780877A\r\n:10129000338722870895318720879387828708952F\r\n:1012A0002F923F924F925F926F927F928F929F9276\r\n:1012B000AF92BF92CF92DF92EF92FF920F931F9364\r\n:1012C000CF93DF93CDB7DEB76A970FB6F894DEBF42\r\n:1012D0000FBECDBF9A8F898F7A8369834A01D22E40\r\n:1012E00018870F833701BC2CDC0159962D913C9156\r\n:1012F0005A972115310509F015C118968D919C91C9\r\n:101300001997681779070CF0D9C11A968D919C919D\r\n:10131000481759070CF0D2C14C2C512CB6E0CB9E8B\r\n:10132000600D711D11247C876B87161617060CF053\r\n:10133000C5C1EA2DF0E0FA87E98793E0EE0FFF1FC1\r\n:101340009A95E1F7F88BEF87CF01840F951F181658\r\n:1013500019060CF0B3C1A98DBA8D58968C918111E4\r\n:1013600004C0BFEABD1508F4D394A98DBA8DED91E0\r\n:10137000FC9111970284F385E02DCD010995B5E02C\r\n:10138000DB9EC0011124E981FA81FC83EB83312CBF\r\n:10139000212C9C012A583F4F388F2F8B4A2D50E02B\r\n:1013A0005E8B4D8BEF89F88DE20DF31D44919E828B\r\n:1013B0008D82D12CC12C69817A81620D731D7A8B4B\r\n:1013C000698B842F90E09C8B8B8BE98DFA8DA081AB\r\n:1013D000B18140FF82C0F1E0BF126FC0AF126DC09B\r\n:1013E0001C96ED91FC912F813885A4014C0D5D1D5B\r\n:1013F00069897A89898D9A8D0995EB89FC89F5959A\r\n:10140000E7954E2F5FEFC51AD50A6D817E818D89D4\r\n:101410009E89680F791F7E836D8398E0C916D10479\r\n:1014200081F6AFEF2A1A3A0AEB81FC81E40DF51D33\r\n:10143000FC83EB83F5E02F16310409F0B3CF2F8145\r\n:10144000388526153705B9F0A98DBA8DED91FC9137\r\n:10145000B1E0BB1257C0AB1255C069817A816B5F96\r\n:101460007F4F0088F189E02D830128E030E0A4015E\r\n:10147000898D9A8D0995A98DBA8DED91FC91119761\r\n:101480000688F789E02DCD016A960FB6F894DEBF85\r\n:101490000FBECDBFDF91CF911F910F91FF90EF90C5\r\n:1014A000DF90CF90BF90AF909F908F907F906F9084\r\n:1014B0005F904F903F902F9009941E96ED91FC9174\r\n:1014C000EF80F88409851A8592014D815E816B81D8\r\n:1014D0007C81898D9A8D099590CF2F81388526152D\r\n:1014E000370509F48ACF31E0B31207C0A31205C053\r\n:1014F0001C96ED91FC91930178CF1E96ED91FC9195\r\n:101500007301E0CF6B857C85641975090684F785C6\r\n:10151000E02D73010F8518899201A401898D9A8DA0\r\n:101520000995A9CFF901349645915491F901329664\r\n:1015300085919491D41AB7E0DB9E800D911D112402\r\n:10154000F901259134913C8B2B8BFC012590349033\r\n:10155000FC013296749031963491398B32966490B6\r\n:101560003196449041E04C1518F04A1508F07FC0C0\r\n:10157000662D062C000C770B7C836B83842D042C4A\r\n:10158000000C990B9E838D83A98DBA8DED91FC91F2\r\n:1015900011970284F385E02DCD010995512CD12CB2\r\n:1015A000C12CEA2DF0E0FA87E9872B2D30E03C874B\r\n:1015B0002B87A401440D511D47FC5A95588F4F8B22\r\n:1015C00069817A81660D711D67FC7A957E876D87CA\r\n:1015D0007989C71608F04FCF2C2D30E04D815E8100\r\n:1015E000420F531FA985BA854A9FC0014B9F900D9A\r\n:1015F0005A9F900D1124FC01E80DF91DF88BEF871F\r\n:10160000852D612C4F89588D420F531F5E8B4D8B5A\r\n:10161000671408F050C044244394480E877041F486\r\n:10162000C1010196EB89FC89E20DF31DD4901C01E8\r\n:10163000D7FE19C0A98DBA8DED91FC91662D70E091\r\n:10164000B1E0BB1219C0AB1217C02D853E85620FE9\r\n:10165000731F0484F585E02D2F8138854D895E89BF\r\n:10166000898D9A8D0995DD0C6394842DD1CF1E82CE\r\n:101670001D821C821B8288CF4B815C81640F751F89\r\n:10168000AB85BC856A9FC0016B9F900D7A9F900DC2\r\n:10169000112469817A81680F791F0684F785E02D0E\r\n:1016A000EF80F88409851A859D014F855889898DB9\r\n:1016B0009A8D0995D8CF570CC3948ACF6A960FB6E6\r\n:1016C000F894DEBF0FBECDBFDF91CF911F910F9178\r\n:1016D000FF90EF90DF90CF90BF90AF909F908F9052\r\n:1016E0007F906F905F904F903F902F9008958F92D2\r\n:1016F0009F92AF92CF92EF92FF920F931F93CF934F\r\n:10170000DF93EC01262F898D9A8D009709F051C047\r\n:101710006A30D1F41D861C868D8948E0849F900133\r\n:1017200011248E859F85820F931F9F878E8781E06E\r\n:1017300090E0DF91CF911F910F91FF90EF90CF90AC\r\n:10174000AF909F908F9008956D3089F3CC88AD88CD\r\n:101750008F898823C1F08C859D8536E0C39E800DDE\r\n:10176000911D1124488559854817590764F44E8501\r\n:101770005F851D861C8638E0A39EC0011124840F5E\r\n:10178000951F9F878E87EA88FB88088919894E856F\r\n:101790005F856C857D85CE010E9450092C898C85E2\r\n:1017A0009D8546E0249F800D911D11249D878C8787\r\n:1017B000BECF6A3069F41D861C86FC013896E49120\r\n:1017C0002D898E859F85E29F800D911D1124ADCFBF\r\n:1017D0006D3009F4ACCFFC0134964591549170E022\r\n:1017E0006417750708F4A3CFFC013696A591B49150\r\n:1017F000A617B70708F49BCFFC013296859094900A\r\n:10180000362F341B47E0349F800C911C1124F401C7\r\n:10181000329634913196E4913323A9F1EE2399F174\r\n:10182000CC88F4013596E491AD884F89442301F1C9\r\n:101830000E2E000CFF0BE30FF11DCE9EA001CF9EDC\r\n:10184000500D11246C857D85460F571F688579855D\r\n:10185000641775076CF44E855F851D861C86FC0138\r\n:101860003896E491AE9E400D511D11245F874E873E\r\n:10187000EA88FB88088919894E855F856C857D8596\r\n:10188000CE010E945009F4013496E4912C898C8594\r\n:101890009D85E29F800D911D112488CF6F927F92CC\r\n:1018A0008F929F92AF92BF92CF92DF92EF92FF9270\r\n:1018B0000F931F93CF93DF93EC016B015A01390112\r\n:1018C0004801E881F9810284F385E02D0995E881DA\r\n:1018D000F9810288F389E02D87019301A501B60102\r\n:1018E000CE010995A501480D591D41505109E881C6\r\n:1018F000F9810288F389E02D9301B601CE010995A3\r\n:10190000E881F9810088F189E02D9401A501B601F3\r\n:10191000CE010995C60CD71CB60161507109E8814A\r\n:10192000F9810088F189E02D9401A501CE01099586\r\n:10193000E881F9810688F789E02DCE01DF91CF910A\r\n:101940001F910F91FF90EF90DF90CF90BF90AF90DD\r\n:101950009F908F907F906F9009946F927F928F925B\r\n:101960009F92AF92BF92CF92DF92EF92FF920F932E\r\n:101970001F93CF93DF935C01EB016A0149013801AA\r\n:101980008701DC01ED91FC916217730719F564166C\r\n:1019900075062CF0962D872D3A01C92ED82E96016A\r\n:1019A000261937092F5F3F4F048CF58DE02DA301D9\r\n:1019B000BE01C5010995DF91CF911F910F91FF9055\r\n:1019C000EF90DF90CF90BF90AF909F908F907F90DF\r\n:1019D0006F9008954615570591F42617370724F0A0\r\n:1019E000892D4B01C22FD82F9E01281939092F5F4D\r\n:1019F0003F4F068CF78DE02DA601B401DACF0284AB\r\n:101A0000F385E02D0995D501ED91FC910488F589C8\r\n:101A1000E02D83019401A601BE01C5010995D50100\r\n:101A2000ED91FC910688F789E02DC501DF91CF91FA\r\n:101A30001F910F91FF90EF90DF90CF90BF90AF90EC\r\n:101A40009F908F907F906F900994EF92FF920F93E9\r\n:101A50001F93DC011A960D911C911B9718962D91DE\r\n:101A60003C911997ED91FC9100A0F1A1E02D7B0133\r\n:101A700050E040E070E060E009951F910F91FF9009\r\n:101A8000EF9008954F925F926F927F928F929F9204\r\n:101A9000AF92BF92CF92DF92EF92FF920F931F937C\r\n:101AA000CF93DF936C012B015A0139014801DC010E\r\n:101AB000ED91FC910284F385E02D0995E201640C1F\r\n:101AC000751CD601ED91FC91C615D7055CF4008814\r\n:101AD000F189E02D87019401A501BE01C601099598\r\n:101AE0002196EFCF0688F789E02DC601DF91CF91CF\r\n:101AF0001F910F91FF90EF90DF90CF90BF90AF902C\r\n:101B00009F908F907F906F905F904F9009948F92ED\r\n:101B10009F92AF92BF92CF92DF92EF92FF920F937C\r\n:101B20001F93CF93DF93EC015B014A016901E881C8\r\n:101B3000F9810284F385E02D099595012C0D3D1D59\r\n:101B400021503109E881F9810488F589E02D780177\r\n:101B50008401A401B501CE010995E881F9810688C7\r\n:101B6000F789E02DCE01DF91CF911F910F91FF906A\r\n:101B7000EF90DF90CF90BF90AF909F908F9009949F\r\n:101B80008F929F92AF92BF92CF92DF92EF92FF928D\r\n:101B90000F931F93CF93DF93EC015B014A0169011F\r\n:101BA0007801E881F9810284F385E02D0995C80C5C\r\n:101BB000D91C860101501109E881F9810488F58951\r\n:101BC000E02D9501A401B501CE010995E881F981C7\r\n:101BD0000688F789E02DCE01DF91CF911F910F91FB\r\n:101BE000FF90EF90DF90CF90BF90AF909F908F903D\r\n:101BF0000994EF92FF920F931F93DC01ED91FC91FA\r\n:101C000000A0F1A1E02D09951F910F91FF90EF9099\r\n:101C100008950F931F93DC01ED91FC91068CF78DD5\r\n:101C2000E02D09951F910F9108950F931F93DC01EB\r\n:101C3000ED91FC91048CF58DE02D09951F910F918C\r\n:101C400008952F923F924F925F926F927F928F9260\r\n:101C50009F92AF92BF92CF92DF92EF92FF920F933B\r\n:101C60001F93CF93DF93CDB7DEB72C970FB6F894C1\r\n:101C7000DEBF0FBECDBF3C017C836B835C874B878F\r\n:101C80001801270181E090E05C01A41AB50ACA019D\r\n:101C9000919581959109AC01440F551F5A83498351\r\n:101CA000C80101969E838D83F12CE12C88248394B6\r\n:101CB000912C922F91709F8322702887AB014F5FE8\r\n:101CC0005F4F5A8749878B859C85E816F9060CF08B\r\n:101CD0007AC0CB84DC84B7FC0CC06C0191E0C91ADB\r\n:101CE000D10849815A814E5F5F4F5A834983A40EC0\r\n:101CF000B51E5FEFE51AF50A82E0880E911CA80C6C\r\n:101D0000B91CCE14DF0464F19F81992399F09601E8\r\n:101D1000220F331F4D815E81240F351F82014B81BD\r\n:101D20005C814C195D09B701660D771D8DE392E06A\r\n:101D30000E94150E5885552399F09601220F331FE6\r\n:101D40008D819E81280F391F82014B815C814C1946\r\n:101D50005D09B3016E197F098DE392E00E94150EB3\r\n:101D60004B855C854C155D0559F15F81552391F0DC\r\n:101D7000940122503109220D331D820149855A8573\r\n:101D80004E195F096B857C85660D771D8DE392E0AA\r\n:101D90000E94150E8885882399F0940122503109FC\r\n:101DA000220D331DB3014B855C85641B750B8201CD\r\n:101DB00049855A854E195F098DE392E00E94150E00\r\n:101DC000DC86CB8680CF2C960FB6F894DEBF0FBE94\r\n:101DD000CDBFDF91CF911F910F91FF90EF90DF90DA\r\n:101DE000CF90BF90AF909F908F907F906F905F90BB\r\n:101DF0004F903F902F900895AF92BF92CF92DF9275\r\n:101E0000EF92FF920F931F93CF93DF936C015B01CF\r\n:101E1000EA0179019A01220F331F2F5F3F4FAB0177\r\n:101E20004C1B5D0B8701B6018DE392E00E94150EFD\r\n:101E300010E000E023E0AE01B501C6010E94210ED2\r\n:101E4000DF91CF911F910F91FF90EF90DF90CF9096\r\n:101E5000BF90AF900895DC01ED91FC910084F18575\r\n:101E6000E02D09943F924F925F926F927F928F92F2\r\n:101E70009F92AF92BF92CF92DF92EF92FF920F9319\r\n:101E80001F93CF93DF935C017B014A016901390104\r\n:101E900087E0680E711C93E0759467949A95E1F75A\r\n:101EA0002B01400E511E10E000E0312CD0E0C0E0CC\r\n:101EB000CE0187709927330C892B59F4FE0183E0FA\r\n:101EC000F595E7958A95E1F7E00FF11FE80DF91D0B\r\n:101ED000349037FE0AC021E030E0A701B5016C0F55\r\n:101EE0007D1F8DE392E00E942B0F2196CC16DD061C\r\n:101EF000F9F68FEFE81AF80A060D171DE414F50439\r\n:101F0000A9F6DF91CF911F910F91FF90EF90DF9095\r\n:101F1000CF90BF90AF909F908F907F906F905F9089\r\n:101F20004F903F9008952F923F924F925F926F9201\r\n:101F30007F928F929F92AF92BF92CF92DF92EF9259\r\n:101F4000FF920F931F93CF93DF9300D000D000D068\r\n:101F5000CDB7DEB73C016A013E832D83FC82EB8264\r\n:101F60005801A41AB50AB7FE03C0B194A194B108F0\r\n:101F70008D809E80861A970A97FE03C09194819463\r\n:101F800091088A149B045CF0902F812F0D811E8193\r\n:101F90009D838E839C2D8D2D6B01692F782F0C15C1\r\n:101FA0001D055CF09D818E817E836D83692F782F66\r\n:101FB000902F812F8601C92ED82E1601201A310AA2\r\n:101FC0002B012D813E81421A530A57FE03C05194C2\r\n:101FD00041945108710137FE03C03FEFE31AF30A41\r\n:101FE000F594E7948D819E81861797075CF5A1E0B3\r\n:101FF000B0E0BA83A983C016D1064CF1D301ED91AC\r\n:10200000FC910484F585E02D2B813C81A8016D8134\r\n:102010007E818A149B041CF04D815E81B801C3014E\r\n:102020000995E418F508F7FE0AC02D813E818981E3\r\n:102030009A81280F391F3E832D83E20CF31C0F5F1A\r\n:102040001F4FD9CF2FEF3FEF3A832983D4CF269666\r\n:102050000FB6F894DEBF0FBECDBFDF91CF911F91B9\r\n:102060000F91FF90EF90DF90CF90BF90AF909F9037\r\n:102070008F907F906F905F904F903F902F9008953A\r\n:1020800008952091AA01260F3327331F21323105ED\r\n:10209000ECF42091CE01FC0190E080E0243069F066\r\n:1020A00082E00895A091AA012191AC0146575E4FAC\r\n:1020B000A40FB52FB11D2C930196861798F380912C\r\n:1020C000AA01680F6093AA0180E0089581E0089555\r\n:1020D0001092CE0181E08093D0011092CF0161E097\r\n:1020E00082E10E94D60561E083E10E94D605E9EB1A\r\n:1020F000F0E080818E7F808380818D7F808388E483\r\n:102100008093B80085E48093BC000895CF93DF935B\r\n:1021100091E0909389018823B9F0C091B800D091E3\r\n:10212000BA008091BC008A7B8093BC0060E082E1B1\r\n:102130000E94D60560E083E10E94D6050E946810E7\r\n:10214000D093BA00C093B800DF91CF910895E09189\r\n:10215000FB018091FA01E81730F4F0E0EC59FE4FF2\r\n:10216000808190E008958FEF9FEF08959091FB019B\r\n:102170008091FA012FEF3FEF981748F4E92FF0E034\r\n:10218000EC59FE4F208130E09F5F9093FB01C90125\r\n:1021900008958091FA019091FB01891B990B089594\r\n:1021A000CF92DF92EF92FF920F931F93CF93DF9323\r\n:1021B0007C01CB018A0120910802222389F0EB01E6\r\n:1021C0006B01C40ED51ECC15DD0569F06991D701F0\r\n:1021D000ED91FC910190F081E02DC7010995F3CFBD\r\n:1021E000642F0E944110C801DF91CF911F910F9180\r\n:1021F000FF90EF90DF90CF900895CF93DF931F92E1\r\n:10220000CDB7DEB76983209108022223F9F020912F\r\n:102210000502203258F021E030E0FC0133832283B4\r\n:1022200090E080E00F90DF91CF91089580910602B9\r\n:10223000E82FF0E0EC5BFE4F998190838F5F8093F5\r\n:1022400006028093050281E090E0ECCF61E0CE01D0\r\n:1022500001960E944110F7CFCF92DF92EF92FF924A\r\n:102260000F931F93CF93DF93D091050281E0D1327A\r\n:1022700008F09CC0C09107020E9453066B017C01CC\r\n:102280008091CE0181116CC082E08093CE0181E00B\r\n:102290008093D0018FEF8093CD011092F201D09303\r\n:1022A000F101A4E4B1E0E1EDF1E080E0D8138DC0EC\r\n:1022B0001092F3018091F301CC0FC82BC093F3016E\r\n:1022C0008091CF01813009F084C01092CF010E942B\r\n:1022D00053066B017C018091F3018093BB008091D8\r\n:1022E000850190918601A0918701B0918801892B89\r\n:1022F0008A2B8B2BA1F00E9453060091850110912F\r\n:10230000860120918701309188016C197D098E0921\r\n:102310009F09061717072807390708F442C080915C\r\n:10232000BC0083FDD8CF85EC8093BC000E9453068F\r\n:102330006B017C018091CE01823009F44CC0809108\r\n:10234000CD018F3F09F469C08091CD01803209F43D\r\n:1023500066C08091CD01803309F463C084E026C05B\r\n:102360008091850190918601A0918701B0918801AB\r\n:10237000892B8A2B8B2B09F483CF0E945306009163\r\n:1023800085011091860120918701309188016C1997\r\n:102390007D098E099F09061717072807390708F0D6\r\n:1023A0006FCF809184010E94861085E01092060212\r\n:1023B0001092050210920802DF91CF911F910F91A8\r\n:1023C000FF90EF90DF90CF9008959D9191938F5F54\r\n:1023D0006DCF85EEA9CF8091850190918601A09166\r\n:1023E0008701B0918801892B8A2B8B2B09F4A2CF0E\r\n:1023F0000E9453060091850110918601209187016A\r\n:10240000309188016C197D098E099F0906171707FD\r\n:102410002807390708F08ECFC4CF80E0C7CF82E00D\r\n:10242000C5CF83E0C3CFEF92FF920F931F93CF935B\r\n:10243000DF937C01C62F80915A0290915B02009736\r\n:1024400009F459C020915E0231E0309308022093D4\r\n:1024500007021092060210920502DC01ED91FC9138\r\n:102460000190F081E02D60E009958701EE24E3946E\r\n:10247000F12CD1E0C15080915A0290915B02CF3F84\r\n:1024800091F1B0E2EB16F104D8F00E942C1180918A\r\n:102490005A0290915B0220915E02D0930802209331\r\n:1024A00007021092060210920502DC01ED91FC91E8\r\n:1024B0000190F081E02D60E00995EE24E394F12C89\r\n:1024C00080915A0290915B02F8016491DC01ED91D8\r\n:1024D000FC910190F081E02D0995BFEFEB1AFB0A0A\r\n:1024E0000F5F1F4FC7CFDF91CF911F910F91FF90CB\r\n:1024F000EF900C942C11E0916A02F0916B029081A4\r\n:10250000809170028095892380838701C15008F4EF\r\n:1025100038C0F80184912091580230915902232B40\r\n:1025200029F00E9430090F5F1F4FF0CF28E030E004\r\n:1025300040E8E0916602F091670290916E02582F98\r\n:102540005423D9F05081952B9083E0916802F0914B\r\n:102550006902908150916F02952B9083E0916802FF\r\n:10256000F0916902508190916F029095952390832C\r\n:10257000469521503109E9F6D6CF508190959523A3\r\n:10258000E3CFDF91CF911F910F91FF90EF900895CE\r\n:102590001F93CF93DF93EC018D8D9E8D009721F1DA\r\n:1025A000162F29A131E030930802209307021092E0\r\n:1025B000060210920502DC01ED91FC910190F08180\r\n:1025C000E02D60E009958D8D9E8DDC01ED91FC91F3\r\n:1025D0000190F081E02D612F09958D8D9E8DDF9109\r\n:1025E000CF911F910C942C11ADA5BEA59C918BA9E8\r\n:1025F000809589238C938B8D9C8D892B31F0862F30\r\n:10260000DF91CF911F910C94300928E030E080E8F1\r\n:10261000A9A5BAA599A9462F4823C1F04C91942B9E\r\n:102620009C93ABA5BCA59C914AA9942B9C93ABA56C\r\n:10263000BCA54C919AA9909594239C938695215082\r\n:10264000310931F7DF91CF911F9108954C91909509\r\n:102650009423E6CF1F93CF93DF93EC01162F8D8D3C\r\n:102660009E8D892BB1F12DA93EA94FA958AD60E0EF\r\n:1026700074E284EF90E00E948F1C205131094109DF\r\n:10268000510956954795379527952093B80066EAE6\r\n:10269000111167EACE010E94C8128D8D9E8D892B83\r\n:1026A00041F129AD3AAD4BAD5CAD60E074E284EF31\r\n:1026B00090E00E948F1C2051310941095109569523\r\n:1026C0004795379527952093B800DF91CF911F91BB\r\n:1026D00008958B8D9C8D892B21F08EAD9FAD0E942E\r\n:1026E0003709EFA5F8A990818CA98095892380836B\r\n:1026F000CECFEFA5F8A980819CA9892B8083E5CF57\r\n:1027000090E080E008950E9471056CE271E080E045\r\n:1027100090E00C9478062091430230914402C90164\r\n:10272000079697FD079623E0959587952A95E1F7FB\r\n:102730002091410230914202829FA001839F500D5F\r\n:10274000929F500D112470E060E080915C029091A6\r\n:102750005D020C94FC1DDF92EF92FF920F931F938A\r\n:10276000CF93DF938C01C6E0D0E08230910531F049\r\n:10277000CAEFDFEF039711F0D0E0C0E00E948B13A7\r\n:1027800021E030E00130110509F0E6C042E150E0FF\r\n:1027900068E170E086E290E00E94FC0E21E030E00B\r\n:1027A00042E150E068E170E08AE590E00E94FC0EB2\r\n:1027B00030E020E044E050E068E170E086E290E044\r\n:1027C0000E94FC0E30E020E044E050E068E170E060\r\n:1027D0008AE590E00E94FC0E21E030E048E050E005\r\n:1027E00064E370E080E490E00E94FC0E30E020E0C2\r\n:1027F00044E050E064E370E080E490E00E94FC0E6E\r\n:1028000080915A0290915B02892B09F4F0C02091CB\r\n:10281000720230917302409174025091750260E02F\r\n:1028200074E284EF90E00E948F1C2051310941092D\r\n:10283000510956954795379527952093B80064E040\r\n:1028400082E790E00E94131280914102909142022F\r\n:102850008034910509F0E2C060E28DE392E00E94CD\r\n:10286000C81260914102615E8DE392E00E94C8123D\r\n:102870002091430230914402C901079697FD0796C3\r\n:1028800033E0959587953A95E1F720914102309193\r\n:102890004202829F8001839F100D929F100D112490\r\n:1028A000C0915C02D0915D0280915A0290915B02CE\r\n:1028B0000C0F1D1F009709F4E3C020915E0231E068\r\n:1028C000309308022093070210920602109205022C\r\n:1028D000DC01ED91FC910190F081E02D60E409951F\r\n:1028E000EE24E394F12CDD24D39480915A0290914C\r\n:1028F0005B020C171D0709F49AC0B0E2EB16F10455\r\n:10290000D8F00E942C1180915A0290915B02209184\r\n:102910005E02D092080220930702109206021092E3\r\n:102920000502DC01ED91FC910190F081E02D60E465\r\n:102930000995EE24E394F12C80915A0290915B0268\r\n:102940006991DC01ED91FC910190F081E02D0995F8\r\n:10295000BFEFEB1AFB0AC9CF4FE050E068E170E02F\r\n:1029600086E290E00E94FC0E21E030E04FE050E073\r\n:1029700068E170E08AE590E00E94FC0E30E020E023\r\n:1029800046E050E068E170E0CE0186960E94FC0EC1\r\n:1029900030E020E046E050E068E170E0CE01865A89\r\n:1029A0009F4F0E94FC0EEE24E394F12C08E010E00F\r\n:1029B00028E230E042E350E06CE270E08DE392E028\r\n:1029C0000E94F90D0FEF1FEF21E044E050E066E3B5\r\n:1029D00070E083E590E00E94210E22E044E050E0A8\r\n:1029E00066E370E08CE290E00E94210E09CF8091B6\r\n:1029F000580290915902892B31F080917B0290917D\r\n:102A00007C020E943709E0916C02F0916D02908186\r\n:102A10008091710280958923808311CF60E08DE3DE\r\n:102A200092E00E94C8126091410261501DCF0E9445\r\n:102A30002C1180915A0290915B02892B09F461C09C\r\n:102A4000209176023091770240917802509179027C\r\n:102A500060E074E284EF90E00E948F1C2051310905\r\n:102A60004109510956954795379527952093B80008\r\n:102A7000DF91CF911F910F91FF90EF90DF9008951C\r\n:102A8000E0916A02F0916B02808190917002892B33\r\n:102A900080830C171D0769F28991209158023091AB\r\n:102AA0005902232B19F00E943009F3CF28E030E0BF\r\n:102AB00040E8E0916602F091670290916E02582F13\r\n:102AC0005423D9F05081952B9083E0916802F091C6\r\n:102AD0006902908150916F02952B9083E09168027A\r\n:102AE000F0916902508190916F02909595239083A7\r\n:102AF000469521503109E9F6CCCF50819095952328\r\n:102B0000E3CFE0916C02F0916D02808190917102AF\r\n:102B1000892B8083ADCF0E94F71D85ED8093BC008B\r\n:102B20008091850190918601A0918701B0918801E3\r\n:102B30000796A11DB11D23E0B695A795979587959A\r\n:102B40002A95D1F72091BC0024FD03C01092CE013C\r\n:102B5000089540918501509186016091870170919F\r\n:102B60008801452B462B472B69F30097A105B1053A\r\n:102B700041F02AE22A95F1F700C00197A109B109B5\r\n:102B8000E1CF809184010C9486100F931F9360E035\r\n:102B900089E00E94D60583E090E00197F1F761E0BB\r\n:102BA00089E00E94D60583E290E00197F1F760E0AA\r\n:102BB00089E00E94D605EAE6FAE06491E6E5FAE0EB\r\n:102BC000E491F0E0EE0FFF1FE859FF4F85919491DB\r\n:102BD00008EA11E620E030E0462F0E943318611524\r\n:102BE000710581059105A9F06F5F7F4F8F4F9F4F52\r\n:102BF0009F70611571058105910559F02AE330E058\r\n:102C000040E050E00E948F1CCA01B9011F910F9152\r\n:102C1000089520E931E040E050E0F6CF1F920F9296\r\n:102C20000FB60F9211242F933F938F939F93AF93DF\r\n:102C3000BF938091FD019091FE01A091FF01B091A1\r\n:102C400000023091FC0123E0230F2D3758F5019647\r\n:102C5000A11DB11D2093FC018093FD019093FE0105\r\n:102C6000A093FF01B09300028091010290910202B3\r\n:102C7000A0910302B09104020196A11DB11D8093A1\r\n:102C8000010290930202A0930302B0930402BF9149\r\n:102C9000AF919F918F913F912F910F900FBE0F9009\r\n:102CA0001F90189526E8230F0296A11DB11DD2CFC3\r\n:102CB0001F920F920FB60F9211242F933F934F93B1\r\n:102CC0005F936F937F938F939F93AF93BF93CF93B4\r\n:102CD000DF93EF93FF938091F401C0912D02D0E038\r\n:102CE00087FF24C010928500109284008091F40127\r\n:102CF0008F5F8093F4018091F401082E000C990BF2\r\n:102D00008C179D0724F48091F4018C30C4F18091DC\r\n:102D1000840090918500049680349C4908F47AC020\r\n:102D20008091840090918500049676C08091F40192\r\n:102D3000082E000C990B8C179D07C4F6E091F40146\r\n:102D40008E2FEE0F990BFC01EE0FFF1FE80FF91FFE\r\n:102D5000E75FFD4F808186FFC9CFE091F4018E2FA0\r\n:102D6000EE0F990BFC01EE0FFF1FE80FF91FE75F55\r\n:102D7000FD4F808160E08F730E94D605B7CF209110\r\n:102D8000840030918500E091F4018E2FEE0F990BB5\r\n:102D9000FC01EE0FFF1FE80FF91FE75FFD4F818178\r\n:102DA0009281820F931F9093890080938800E09115\r\n:102DB000F4018E2FEE0F990BFC01EE0FFF1FE80FB1\r\n:102DC000F91FE75FFD4F808186FF11C0E091F4019C\r\n:102DD0008E2FEE0F990BFC01EE0FFF1FE80FF91F6E\r\n:102DE000E75FFD4F808161E08F730E94D605FF9100\r\n:102DF000EF91DF91CF91BF91AF919F918F917F9193\r\n:102E00006F915F914F913F912F910F900FBE0F9057\r\n:102E10001F90189580E49CE9909389008093880026\r\n:102E20008FEF8093F401E3CF1F920F920FB60F92B2\r\n:102E300011242F933F934F935F936F937F938F93BF\r\n:102E40009F93AF93BF93EF93FF938091B900887FD7\r\n:102E5000803609F44AC0F0F5883209F4A7C018F5A5\r\n:102E6000803109F49BC0B8F4882309F4F9C0883094\r\n:102E700009F494C0FF91EF91BF91AF919F918F9111\r\n:102E80007F916F915F914F913F912F910F900FBE66\r\n:102E90000F901F901895883109F488C0803251F73F\r\n:102EA0008093CD0114C0803409F49DC040F4803378\r\n:102EB000B9F38833F9F68093CD0185ECB0C0803545\r\n:102EC00009F485C0883509F496C0883499F60E94C3\r\n:102ED0008D15D0CF883909F48CC038F5883729F0A2\r\n:102EE00050F4883611F0803729F683E08093CE01C4\r\n:102EF0001092CC0157C0883809F47BC0803919F092\r\n:102F0000803809F0B7CF8091CC01803208F071C0D1\r\n:102F1000E091CC0181E08E0F8093CC018091BB00C9\r\n:102F2000F0E0E455FE4F80833DC0803B39F0E0F493\r\n:102F3000803A09F479C0883A09F09CCF84E0809304\r\n:102F4000CE011092AB011092AA01E091F801F0912C\r\n:102F5000F90109958091AA0181110FC081E0809348\r\n:102F6000AA0110928A0109C0803C09F4A6CF883CCE\r\n:102F700009F4A3CF883B09F07DCFE091AB0181E05C\r\n:102F80008E0F8093AB01F0E0E657FE4F8081809377\r\n:102F9000BB009091AB018091AA0129C08091F301FF\r\n:102FA0008093BB0085EC8093BC0064CF9091F201CC\r\n:102FB0008091F101981758F5E091F20181E08E0FB0\r\n:102FC0008093F201F0E0EF52FE4F8081E9CFE09173\r\n:102FD000F20181E08E0F8093F2018091BB00F0E05E\r\n:102FE000EF52FE4F80839091F2018091F10198178A\r\n:102FF000C8F285E8D8CFE091F20181E08E0F80938E\r\n:10300000F2018091BB00F0E0EF52FE4F808380918F\r\n:10301000D00181115CCF81E08093CF0184EA80935D\r\n:10302000BC001092CE0126CF85EC8093BC0010929C\r\n:10303000CE018091CC01803230F4E091CC01F0E0FF\r\n:10304000E455FE4F10826091CC0170E0E091F601F2\r\n:10305000F091F7018CEA91E009951092CC010ACF2A\r\n:103060001092CD0134CFCF92DF92EF92FF920F9367\r\n:103070001F93E82FF92F05C00150110921093109CB\r\n:1030800061F1908196239417B9F305C0015011099D\r\n:103090002109310911F1908196239413F7CFC12CA6\r\n:1030A000D12CE12CF12C0AC08FEFC81AD80AE80AFB\r\n:1030B000F80A0C151D052E053F0579F08081862341\r\n:1030C000841791F36C2D7D2D8E2D9F2D1F910F91C7\r\n:1030D000FF90EF90DF90CF90089560E070E080E087\r\n:1030E00090E01F910F91FF90EF90DF90CF900895A7\r\n:1030F000109234021092330288EE93E0A0E0B0E028\r\n:103100008093350290933602A0933702B093380231\r\n:103110008AE091E090933202809331021092400253\r\n:1031200010923F0220E830E03093420220934102A7\r\n:1031300080E490E0909344028093430230934602EF\r\n:1031400020934502909348028093470210925302C5\r\n:1031500010924A021092490210924C0210924B02B5\r\n:1031600081E080935202809351022FEF3FEF309322\r\n:10317000500220934F0230934E0220934D028093D1\r\n:1031800054021092550210925702109256028CE18E\r\n:1031900091E090933E0280933D021092590210926A\r\n:1031A000580281E392E090935B0280935A0210925E\r\n:1031B0005D0210925C029FEF909361029093620215\r\n:1031C00090936302909364029093650240E85AE101\r\n:1031D00066E070E040937202509373026093740251\r\n:1031E0007093750240EA56E861E070E04093760221\r\n:1031F00050937702609378027093790280E5809310\r\n:103200007B0210927C0280912D028C3098F491E028\r\n:10321000980F90932D0280932E0290E0FC01EE0F08\r\n:10322000FF1FE80FF91FE75FFD4F88EB9BE09283DC\r\n:103230008183089590932E020895789484B58260D6\r\n:1032400084BD84B5816084BD85B5826085BD85B54A\r\n:10325000816085BD80916E00816080936E001092C8\r\n:103260008100809181008260809381008091810043\r\n:1032700081608093810080918000816080938000D4\r\n:103280008091B10084608093B1008091B000816032\r\n:103290008093B00080917A00846080937A0080915E\r\n:1032A0007A00826080937A0080917A0081608093B6\r\n:1032B0007A0080917A00806880937A001092C10031\r\n:1032C00061E084E00E94220661E087E00E9422061D\r\n:1032D00061E088E00E94220661E08CE00E94220604\r\n:1032E00061E089E00E94220660E08AE00E942206F6\r\n:1032F00080912E028C3008F051C061E083E00E9482\r\n:10330000220680912E02282F30E0F901EE0FFF1FD8\r\n:10331000E20FF31FE75FFD4F9081907C93609083F5\r\n:1033200010922F02109230022CE0622F0E94C01CDB\r\n:10333000829FB001112430E020E0AB01420F531F07\r\n:10334000FA01EE0FFF1FE40FF51FE75FFD4F9081BD\r\n:1033500096FD16C02F5F3F4F2C30310571F781115C\r\n:103360000FC01092800082E080938100109285004F\r\n:1033700010928400B19A80916F00826080936F00F8\r\n:10338000E0912E028E2F90E0FC01EE0FFF1FE80F60\r\n:10339000F91FE75FFD4F8081806480838AE590E0BC\r\n:1033A0000E94710580915C0290915D02892B11F160\r\n:1033B0000E948B132091430230914402809141027C\r\n:1033C00090914202213231050CF063C0B901605284\r\n:1033D000710977FF02C06F5F7F4F759567958357BF\r\n:1033E000910997FD019600E210E023E730E048E9FB\r\n:1033F00055E062C02091430230914402C901079612\r\n:1034000097FD0796B3E095958795BA95E1F72091DA\r\n:10341000410230914202AC01429FC001439F900D96\r\n:10342000529F900D11240E94D21C90935D028093B4\r\n:103430005C02892B09F0BCCF90E080E00E94AB13C6\r\n:10344000C0E0D0E080EA90E00E9483130E94C5159E\r\n:1034500082E090E00E94AB1384E190E00E9483132D\r\n:103460000E94C51583E090E00E94AB138AE590E0CE\r\n:103470000E94831390E080E00E94AB136CE271E045\r\n:1034800080E090E00E9478062097E1F20E94000020\r\n:10349000D9CFB9016054710977FF02C06F5F7F4FC8\r\n:1034A000759567958255910997FD019600E410E0A6\r\n:1034B00022E530E048E757E0959587950E94320F66\r\n:1034C00082E080935F0280915A0290915B02892B87\r\n:1034D00009F494C08CE380935E021092FB01109279\r\n:1034E000FA0110920602109205020E9468108AEA00\r\n:1034F00096E09093F9018093F8018BEA96E090931F\r\n:10350000F7018093F6018091650287FD1EC061E09E\r\n:103510000E94220661E0809165020E94D60561E06A\r\n:1035200070E080E090E00E94780660E080916502A3\r\n:103530000E94D6056AE070E080E090E00E94780684\r\n:1035400061E0809165020E94D60580915A029091B7\r\n:103550005B02892B09F411C1209172023091730230\r\n:10356000409174025091750260E074E284EF90E043\r\n:103570000E948F1C205131094109510956954795E8\r\n:10358000379527952093B80064E084E995E00E9480\r\n:1035900013126091430261508DE392E00E94C812C1\r\n:1035A00064E080E995E00E94131280915F0264E17B\r\n:1035B000813009F460E18DE392E00E94C81264E07A\r\n:1035C0008CE895E00E9413128FE880937A02809134\r\n:1035D0004102909142028038910509F031C18091F9\r\n:1035E0004302909144028034910509F039C18091E1\r\n:1035F0005F02813009F4D8C08FECD7C061E08091C0\r\n:1036000063020E94220661E0809164020E94220609\r\n:1036100080916302082E000C990BFC01E45BF54FCE\r\n:10362000E491F0E0EE0FFF1FEE5BF54F2591349132\r\n:1036300030936B0220936A02FC01E05AF54FE4914B\r\n:10364000E093700280916402082E000C990BFC013B\r\n:10365000E45BF54FE491F0E0EE0FFF1FEE5BF54FFA\r\n:10366000A591B491B0936D02A0936C02FC01E05A55\r\n:10367000F54FE491E09371028C91E82BEC938091EB\r\n:10368000580290915902892B09F434C0CFB7F894AD\r\n:103690008091F501811127C0E6E5FAE08491EAE620\r\n:1036A000FAE09491E82FF0E0EE0FFF1FE85CF54F91\r\n:1036B000A591B491EC91E92321F461E08AE00E94A4\r\n:1036C000D60561E08AE00E9422068CB580618CBD3F\r\n:1036D0008CB580648CBD61E08DE00E94220661E0C3\r\n:1036E0008BE00E9422068091F5018F5F8093F501A7\r\n:1036F000CFBF09CF61E0809161020E94220661E0A4\r\n:10370000809162020E94220680916102082E000CC4\r\n:10371000990BFC01E45BF54FE491F0E0EE0FFF1F25\r\n:10372000EE5BF54F2591349130936702209366024A\r\n:10373000FC01E05AF54FE491E0936E028091620241\r\n:10374000082E000C990BFC01E45BF54FE491F0E0CE\r\n:10375000EE0FFF1FEE5BF54FA591B491B093690298\r\n:10376000A0936802FC01E05AF54FE491E0936F02E8\r\n:103770008C91E095E823EC93C6CE8091580290910D\r\n:103780005902892B31F080917B0290917C020E943A\r\n:103790003709E0916C02F0916D0290818091710285\r\n:1037A000809589238083F0CE8FE980937A02C2E1ED\r\n:1037B0006AED8DE392E00E94C8126C2F8DE392E0D7\r\n:1037C0000E94C81261E88DE392E00E94C8126091E5\r\n:1037D0007A028DE392E00E94C81269ED8DE392E0D7\r\n:1037E0000E94C81280915F0261EF813009F462E2A9\r\n:1037F0008DE392E00E94C81266E086E895E00E94A0\r\n:10380000131280915A0290915B02892BE9F1209169\r\n:10381000760230917702409178025091790260E00F\r\n:1038200074E284EF90E00E948F1C2051310941091D\r\n:10383000510956954795379527952093B800FCCDAB\r\n:103840008036910589F4809143029091440240971B\r\n:1038500039F480915F02813029F08FEA80937A02F7\r\n:10386000C2E0A6CF80E1FACF80349105C9F78091FC\r\n:10387000430290914402809799F780915F028130D2\r\n:1038800009F0BACE80E191CFE0916C02F0916D0227\r\n:10389000808190917102892B8083CECD8CE191E063\r\n:1038A00090933E0280933D0280915C0290915D0274\r\n:1038B000009711F00C946E1D0895052E97FB1EF4D1\r\n:1038C00000940E94741C57FD07D00E948F1C07FCB7\r\n:1038D00003D04EF40C94741C50954095309521956E\r\n:1038E0003F4F4F4F5F4F089590958095709561952C\r\n:1038F0007F4F8F4F9F4F08950E94B11CA59F900D41\r\n:10390000B49F900DA49F800D911D11240895B7FFC1\r\n:103910000C947C1C0E947C1C821B930B0895A1E2DA\r\n:103920001A2EAA1BBB1BFD010DC0AA1FBB1FEE1F39\r\n:10393000FF1FA217B307E407F50720F0A21BB30B84\r\n:10394000E40BF50B661F771F881F991F1A9469F700\r\n:1039500060957095809590959B01AC01BD01CF015C\r\n:103960000895A29FB001B39FC001A39F700D811D58\r\n:103970001124911DB29F700D811D1124911D089578\r\n:10398000991B79E004C0991F961708F0961B881FB1\r\n:103990007A95C9F780950895EE0FFF1F0590F49171\r\n:1039A000E02D09940F931F93CF93DF9382309105FD\r\n:1039B00010F482E090E0E0917F02F091800230E02C\r\n:1039C00020E0B0E0A0E0309799F42115310509F42A\r\n:1039D0004AC0281B390B24303105D8F58A819B81D8\r\n:1039E0006115710589F1FB0193838283FE0111C08A\r\n:1039F000408151810281138148175907E0F048172F\r\n:103A0000590799F4109761F012960C931297139638\r\n:103A10001C933296CF01DF91CF911F910F910895A2\r\n:103A200000937F0210938002F4CF2115310551F0ED\r\n:103A30004217530738F0A901DB019A01BD01DF01EC\r\n:103A4000F801C1CFEF01F9CF9093800280937F02FC\r\n:103A5000CDCFFE01E20FF31F8193919322503109E4\r\n:103A600039832883D7CF20917D0230917E02232B8A\r\n:103A700041F4209102013091030130937E022093A2\r\n:103A80007D0220910001309101012115310541F4A1\r\n:103A90002DB73EB74091040150910501241B350B11\r\n:103AA000E0917D02F0917E02E217F307A0F42E1B55\r\n:103AB0003F0B2817390778F0AC014E5F5F4F241792\r\n:103AC000350748F04E0F5F1F50937E0240937D02F2\r\n:103AD000819391939FCFF0E0E0E09CCFCF93DF9371\r\n:103AE0000097E9F0FC01329713821282A0917F02C5\r\n:103AF000B0918002ED0130E020E01097A1F4208128\r\n:103B00003181820F931F20917D0230917E02281710\r\n:103B1000390709F061C0F0937E02E0937D02DF91E6\r\n:103B2000CF910895EA01CE17DF07E8F54A815B815E\r\n:103B30009E0141155105B1F7E901FB83EA834991E3\r\n:103B40005991C40FD51FEC17FD0761F48081918155\r\n:103B50000296840F951FE90199838883828193815E\r\n:103B60009B838A83F0E0E0E012968D919C911397FD\r\n:103B70000097B9F52D913C911197CD010296820FD6\r\n:103B8000931F20917D0230917E022817390739F664\r\n:103B9000309751F51092800210927F02B0937E020E\r\n:103BA000A0937D02BCCFD383C28340815181840F17\r\n:103BB000951FC817D90761F44E5F5F4F88819981BF\r\n:103BC000480F591F518340838A819B81938382834D\r\n:103BD0002115310509F0B0CFF0938002E0937F0208\r\n:103BE0009ECFFD01DC01C0CF13821282D7CF81E0CE\r\n:103BF00090E0F8940C94031EDC0101C06D934150D9\r\n:103C00005040E0F7089515E0C5E4D5E004C0FE019A\r\n:103C10000E94CC1C2196C634D107C9F7F894FFCF77\r\n:103C200000008102800000000000FD10D010801311\r\n:103C30007005C910B610A71000000000770BAC0685\r\n:103C400080134010800870052B0FF90D150E090E1A\r\n:103C5000930F70053B092A13F0073908420D250D13\r\n:043C6000AD0C4E0C4D\r\n:00000001FF\r\n",
  "c7d9ac8507c1e17ee80c4adfa9b80f1ab14d6d7d75ccdcdd5a03b613de42af57": ":100000000C9446050C946E050C946E050C946E05CC\r\n:100010000C946E050C946E050C946E050C946E0594\r\n:100020000C946E050C946E050C946E050C94FB16E6\r\n:100030000C946E050C946E050C946E050C946E0574\r\n:100040000C94B1160C946E050C946E050C946E0510\r\n:100050000C946E050C946E050C946E050C946E0554\r\n:100060000C94B7170C946E050000000023002600C6\r\n:1000700029002200FF2100000000003E5B4F5B3E94\r\n:100080003E6B4F6B3E1C3E7C3E1C183C7E3C181C5D\r\n:10009000577D571C1C5E7F5E1C00183C1800FFE754\r\n:1000A000C3E7FF0018241800FFE7DBE7FF30483AFA\r\n:1000B000060E2629792926407F050507407F05255C\r\n:1000C0003F5A3CE73C5A7F3E1C1C08081C1C3E7FE4\r\n:1000D00014227F22145F5F005F5F06097F017F00AB\r\n:1000E0006689956A606060606094A2FFA2940804CB\r\n:1000F0007E040810207E201008082A1C08081C2AEC\r\n:1001000008081E101010100C1E0C1E0C30383E3843\r\n:1001100030060E3E0E06000000000000005F0000EA\r\n:100120000007000700147F147F14242A7F2A12235B\r\n:100130001308646236495620500008070300001C6B\r\n:100140002241000041221C002A1C7F1C2A08083E74\r\n:100150000808008070300008080808080000606087\r\n:100160000020100804023E5149453E00427F4000F5\r\n:1001700072494949462141494D331814127F1027CD\r\n:10018000454545393C4A494931412111090736491C\r\n:10019000494936464949291E0000140000004034F0\r\n:1001A00000000008142241141414141400412214F5\r\n:1001B0000802015909063E415D594E7C1211127C1C\r\n:1001C0007F494949363E414141227F4141413E7F7D\r\n:1001D000494949417F090909013E414151737F085D\r\n:1001E00008087F00417F41002040413F017F081403\r\n:1001F00022417F404040407F021C027F7F04081064\r\n:100200007F3E4141413E7F090909063E4151215E41\r\n:100210007F09192946264949493203017F01033FD5\r\n:100220004040403F1F2040201F3F4038403F631464\r\n:1002300008146303047804036159494D43007F4166\r\n:1002400041410204081020004141417F04020102A3\r\n:1002500004404040404000030708002054547840C8\r\n:100260007F284444383844444428384444287F385C\r\n:100270005454541800087E090218A4A49C787F08DE\r\n:1002800004047800447D40002040403D007F102859\r\n:10029000440000417F40007C047804787C0804041A\r\n:1002A000783844444438FC1824241818242418FCB2\r\n:1002B0007C08040408485454542404043F44243C57\r\n:1002C0004040207C1C2040201C3C4030403C4428C6\r\n:1002D0001028444C9090907C4464544C4400083660\r\n:1002E00041000000770000004136080002010204CE\r\n:1002F000023C2623263C1EA1A161123A4040207AEE\r\n:100300003854545559215555794122545478422135\r\n:100310005554784020545579400C1E52721239556C\r\n:100320005555593954545459395554545800004569\r\n:100330007C410002457D420001457C407D12111246\r\n:100340007DF0282528F07C545545002054547C54D9\r\n:100350007C0A097F4932494949323A4444443A3295\r\n:100360004A4848303A4141217A3A42402078009D3B\r\n:10037000A0A07D3D4242423D3D4040403D3C24FFE7\r\n:100380002424487E4943662B2FFC2F2BFF0929F696\r\n:1003900020C0887E090320545479410000447D41E7\r\n:1003A0003048484A32384040227A007A0A0A727D40\r\n:1003B0000D19317D2629292F28262929292630485B\r\n:1003C0004D4020380808080808080808382F10C8C9\r\n:1003D000ACBA2F102834FA00007B000008142A144D\r\n:1003E0002222142A14085500550055AA55AA55AAC8\r\n:1003F000FF55FF55FF000000FF00101010FF001414\r\n:100400001414FF001010FF00FF1010F010F014146F\r\n:1004100014FC001414F700FF0000FF00FF1414F494\r\n:1004200004FC141417101F10101F101F1414141F95\r\n:1004300000101010F0000000001F101010101F100E\r\n:10044000101010F010000000FF101010101010100D\r\n:100450001010FF10000000FF140000FF00FF00005C\r\n:100460001F10170000FC04F414141710171414F4D0\r\n:1004700004F40000FF00F714141414141414F7000B\r\n:10048000F7141414171410101F101F141414F4145C\r\n:100490001010F010F000001F101F0000001F1400CB\r\n:1004A0000000FC140000F010F01010FF10FF1414F6\r\n:1004B00014FF141010101F00000000F010FFFFFFC9\r\n:1004C000FFFFF0F0F0F0F0FFFFFF0000000000FF82\r\n:1004D000FF0F0F0F0F0F3844443844FC4A4A4A3488\r\n:1004E0007E02020606027E027E026355494163389F\r\n:1004F00044443C04407E201E2006027E020299A550\r\n:10050000E7A5991C2A492A1C4C7201724C304A4DAD\r\n:100510004D303048784830BC625A463D3E494949E2\r\n:10052000007E0101017E2A2A2A2A2A44445F44448B\r\n:1005300040514A444040444A51400000FF0103E01A\r\n:1005400080FF000008086B6B083612362436060F51\r\n:10055000090F06000018180000001010003040FFBE\r\n:100560000101001F01011E00191D1712003C3C3C37\r\n:100570003C0000000000000103070F1F3F7F0080C8\r\n:10058000C0E0F0F8FCFEDB40A4A62EAF2000A1C81E\r\n:10059000D300408DAED580A80000600000000000B0\r\n:1005A000000000000000000000E00000000000006B\r\n:1005B0000000000000000001E0000000000000005A\r\n:1005C00000000000000001F000000000000000003A\r\n:1005D000000000000003F000000000000000000028\r\n:1005E0000000000007F00000000000000000000014\r\n:1005F00000000007F80000000000000000000000FC\r\n:1006000000000FF800000003C0007E000001E000C1\r\n:100610007F0FF800000003C000FE000001E000FFB3\r\n:10062000EFF800000003C000FE000001E000FFFF43\r\n:10063000F800000003C000F00000000F007FFE7F04\r\n:10064000C0000003C000F00000000F003FFE7FF874\r\n:100650003FF1FBCFFCFEF3BC3DEFE01FFE7FFF7FD1\r\n:10066000FBFFDFFEFEFFBC3DEFE01FC6FFFF7FFB91\r\n:10067000FFDFFEFEFFBC3DEFE00FE3C7FE787BC36C\r\n:10068000DE1EF0FFBC3DEF0007FF87FC787BC3DE7A\r\n:100690001EF0F83C3DEF0001FFFFF0007BC3C01EE1\r\n:1006A000F0F03C3DEF0001F37FE03FFBC3CFFEF0F5\r\n:1006B000F03C3DEF0003E33F807FFBC3DFFEF0F043\r\n:1006C0003C3DEF0007E73C00787BC3DE1EF0F03CCA\r\n:1006D0003DEF0007FFBE00787BC3DE1EF0F03C3D1F\r\n:1006E000EF0007FFFE00787BC3DE1EF0F03C3DEF1D\r\n:1006F000000FFFFE007FFBFFDFFEF0F03FFDEFE0AD\r\n:100700000FFFFF007FFBFFDFFEF0F03FFDEFE00F8C\r\n:10071000F9FF003E79F9CF9EF0F01F3DE7E01FF1B1\r\n:10072000FF0000000000000000000000001F80FF2C\r\n:10073000007FFFFFFFFFFFFFFFFFFFE01C007F00C8\r\n:100740007FFFFFFFFEB46D888D18E000001F007F63\r\n:10075000FFFFFFFE95AD7DB577E000000F007FFF46\r\n:10076000FFFFFEA5AD9D8D19E0000006007FFFFF95\r\n:10077000FFFEB5ADEDB57EE0000000000001800099\r\n:1007800000000000000000000380000000000000E6\r\n:1007900000000007C000000000000000000007C0CB\r\n:1007A0000000000000000000000FC000000000007A\r\n:1007B000000000001FE00000000000000000001F1B\r\n:1007C000E00000000000000000003FE0000000002A\r\n:1007D00000000000003FF0000000000000000000EA\r\n:1007E0007FF0000000000000001FF87FF000000014\r\n:1007F000000000003FFE7FF0000000000000003F0E\r\n:10080000FF7FF0000000000000001FFFFBE0000081\r\n:1008100000000000000FFFF9FFC000000000000012\r\n:100820000FFFF9FFF800000000000007FFF1FFFFD5\r\n:1008300000000000000003FC73FFFF8000000000C8\r\n:100840000001FE3FFFFF80000000000000FF1E0FC0\r\n:10085000FF000000000000007FFE1FFC0000000001\r\n:100860000000003FFFFFF8000000000000000FDF65\r\n:10087000FFE0000000000000001F19FFC0000000A2\r\n:10088000000000003F3CFF00000000000000007E70\r\n:100890007CF800000000000000007FFE7C000000EB\r\n:1008A0000000000000FFFFFC00000000000000004E\r\n:1008B000FFFFFE0000000000000000FFFFFE000040\r\n:1008C000000000000001FFEFFE000000000000003B\r\n:1008D00001FFCFFE0000000000000003FF07FE0044\r\n:1008E00000000000000003FC07FE00000000000004\r\n:1008F0000003F003FE00000000000000018000FE85\r\n:10090000000000000000000000007E000000000069\r\n:1009100000000000003E0000000000000000000099\r\n:100920000C000000000000078000FC000003C00075\r\n:100930000000078001FC000003C0000000078001E8\r\n:10094000FC000003C0000000078001E00000001E62\r\n:10095000000000078001E00000001E007FE3F79F19\r\n:10096000F9FDE7787BDFC0FFF7FFBFFDFDFF787B78\r\n:10097000DFC0FFF7FFBFFDFDFF787BDFC0F0F7872B\r\n:10098000BC3DE1FF787BDE00F0F787BC3DE1F0780D\r\n:100990007BDE0000F787803DE1E0787BDE007FF7BB\r\n:1009A000879FFDE1E0787BDE00FFF787BFFDE1E098\r\n:1009B000787BDE00F0F787BC3DE1E0787BDE00F07D\r\n:1009C000F787BC3DE1E0787BDE00F0F787BC3DE1D6\r\n:1009D000E0787BDE00FFF7FFBFFDE1E07FFBDFC0DB\r\n:1009E000FFF7FFBFFDE1E07FFBDFC07CF3F39F3D3E\r\n:1009F000E1E03E7BCFC000000000000000000000EE\r\n:100A000000FFFFFFFFFFFFFFFFFFFFC0FFFFFFFF34\r\n:100A1000FD68DB111A31C0FFFFFFFFFD2B5AFB6A97\r\n:100A2000EFC0FFFFFFFFFD4B5B3B1A33C0FFFFFF33\r\n:100A3000FFFD6B5BDB6AFDC00000000024002700A7\r\n:100A40002A0000000000250028002B0004040404F4\r\n:100A50000404040402020202020203030303030368\r\n:100A60000102040810204080010204081020010245\r\n:100A70000408102000000008000201000003040721\r\n:100A800000000000000000003619D11C11241FBE18\r\n:100A9000CFEFD8E0DEBFCDBF11E0A0E0B1E0E6E2ED\r\n:100AA000FDE302C005900D92A434B107D9F722E00E\r\n:100AB000A4E4B1E001C01D92A339B207E1F715E04B\r\n:100AC000C5E4D5E004C02197FE010E944F1DC43447\r\n:100AD000D107C9F70E94AC190C94861E0C94000033\r\n:100AE000089590E0FC01EC58F54F2491FC01E05A88\r\n:100AF000F54F3491FC01E45BF54FE491EE23C9F02E\r\n:100B0000222339F0233001F1A8F4213019F12230E9\r\n:100B100029F1F0E0EE0FFF1FEE5BF54FA591B491C8\r\n:100B20008FB7F894EC91611126C030953E233C9329\r\n:100B30008FBF08952730A9F02830C9F0243049F735\r\n:100B4000809180008F7D03C0809180008F7780939B\r\n:100B50008000DFCF84B58F7784BDDBCF84B58F7DF8\r\n:100B6000FBCF8091B0008F778093B000D2CF80917F\r\n:100B7000B0008F7DF9CF3E2BDACFCF93DF9390E09B\r\n:100B8000FC01E05AF54F2491845B954FFC01849160\r\n:100B90008823D1F090E0880F991FFC01E85CF54FA5\r\n:100BA000A591B491FC01EE5BF54FC591D491611113\r\n:100BB0000EC09FB7F8948C91E22FE0958E238C9312\r\n:100BC0002881E223E8839FBFDF91CF9108958FB7FB\r\n:100BD000F894EC91E22BEC938FBFF6CF3FB7F894EB\r\n:100BE0008091260290912702A0912802B0912902BB\r\n:100BF00026B5A89B05C02F3F19F00196A11DB11D78\r\n:100C00003FBFBA2FA92F982F8827BC01CD01620FB3\r\n:100C1000711D811D911D42E0660F771F881F991F6E\r\n:100C20004A95D1F708958F929F92AF92BF92CF923B\r\n:100C3000DF92EF92FF924B015C010E94EE056B0187\r\n:100C40007C010E94EE056C197D098E099F09683EA2\r\n:100C5000734081059105A8F321E0821A9108A1084B\r\n:100C6000B10888EEC80E83E0D81EE11CF11C811487\r\n:100C70009104A104B10429F7FF90EF90DF90CF9089\r\n:100C8000BF90AF909F908F90089508950895AF9270\r\n:100C9000BF92CF92DF92EF92FF920F931F93CF9369\r\n:100CA000DF936C017B018B01040F151FEB015E01CB\r\n:100CB000AE18BF08C017D10759F06991D601ED9160\r\n:100CC000FC910190F081E02DC6010995892B79F7FF\r\n:100CD000C501DF91CF911F910F91FF90EF90DF90B1\r\n:100CE000CF90BF90AF900895EF92FF920F931F9314\r\n:100CF000CF93DF93EC01EC80FD806E157F050CF047\r\n:100D000070C057FF04C0240F351F50E040E08E81B3\r\n:100D10009F81FA01E20FF31F8E179F071CF49C01BD\r\n:100D2000241B350B121613060CF05BC0922F842F78\r\n:100D30008695869586958E9DD0018F9DB00D112448\r\n:100D40006A0F7B1FAF8DB8A1A60FB71F477049F17F\r\n:100D500088E0841B482F682F70E0FB01E258FA4FAF\r\n:100D6000E491281708F063C0621B71092FEF30E08F\r\n:100D700002C0359527956A95E2F7E2230130110507\r\n:100D800039F0B0F10230110561F58C91E82702C00D\r\n:100D90008C91E82BEC93941720F12C813D81A20FCC\r\n:100DA000B31FE92FE41BE83078F00230110521F57C\r\n:100DB0008E2F9C9190959C932C813D81A20FB31F07\r\n:100DC00088508830B0F7E770EE2359F0F0E0EA5829\r\n:100DD000FA4FE49101301105F9F010F102301105DC\r\n:100DE00019F1DF91CF911F910F91FF90EF9008952E\r\n:100DF000E0958C91E823CECF81E00115110509F42F\r\n:100E000080E081959E2F8C932C813D81A20FB31F92\r\n:100E100098509830C0F7D7CF8C91E82BEC93E1CF66\r\n:100E2000E0958C91E823FACF8C91E827F7CF013039\r\n:100E3000110509F4ADCFE0F20230110509F4A5CF98\r\n:100E4000AE0DBF1DAECF0F931F93CF93DF9377FFF0\r\n:100E500004C0260F371F70E060E0DC011496CD91CE\r\n:100E6000DC91FB01E20FF31FCE17DF071CF49E019C\r\n:100E7000261B370B121613064CF5FA0157FD379651\r\n:100E8000A3E0F595E795AA95E1F7EC9FD001ED9FDA\r\n:100E9000B00DFC9FB00D11246A0F7B1FDC015F9623\r\n:100EA000ED91FC91E60FF71F4770552781E090E028\r\n:100EB00001C0880F4A95EAF7482F0130110559F013\r\n:100EC000A8F02E0F3F1F02301105E1F0DF91CF9106\r\n:100ED0001F910F9108952E0F3F1FE217F307B1F3F3\r\n:100EE0008191DF011197842B8C93F7CF80952E0F82\r\n:100EF0003F1FE217F30751F39191DF0111979823F8\r\n:100F00009C93F7CFE217F30709F38191DF01119763\r\n:100F100084278C93F7CF0F931F93FA01DC01569629\r\n:100F20004C9156974230E9F04330A1F1413061F5E0\r\n:100F300014964D915C91DA01AE1BBF0BFD01E21BD3\r\n:100F4000F30B77FD0BC0DC0116964D915C91641795\r\n:100F5000750724F4AB01BF010E9423071F910F9175\r\n:100F6000089514964D915C91DA01A61BB70BBD0153\r\n:100F700061507109DC0116964D915C91DA01AE1B4E\r\n:100F8000BF0BFD01E21BF30B77FDE8CFAF010E9421\r\n:100F90007406E4CF16964D915C91DA01A61BB70B4F\r\n:100FA000BD0161507109CDCF0F931F93FA01DC0190\r\n:100FB00056964C9156974230A9F0433091F141300A\r\n:100FC00019F514964D915C91DA01AE1BBF0BFD0132\r\n:100FD0003197F7FD04C0AB01BF010E9474061F9159\r\n:100FE0000F91089514964D915C91DA01A61BB70BF1\r\n:100FF000BD01DC0116964D915C91DA01AE1BBF0B71\r\n:10100000FD013197621B730BF7FDE9CFDC011696EA\r\n:101010004D915C91E417F50714F7AF010E94230787\r\n:10102000DECF16964D915C91DA01A61BB70BBD0180\r\n:10103000621B730BCECFFC0177FD64C08085918568\r\n:10104000681779070CF05EC057FD5CC082859385F8\r\n:10105000481759070CF056C086898230B1F08330AA\r\n:1010600029F1813041F484819581841B950BAB017A\r\n:10107000BC01615071092130310509F108F443C008\r\n:101080002230310509F463C0089584819581DC0123\r\n:10109000A61BB70BBD016150710986819781DC01E8\r\n:1010A000A41BB50BAD0141505109E5CF8681978155\r\n:1010B000861B970BBA01AC0141505109DCCFCA0124\r\n:1010C00057FD0796A3E095958795AA95E1F7A4812A\r\n:1010D000B5818A9F90018B9F300D9A9F300D11240E\r\n:1010E000620F731F078CF0A1E02DE60FF71F47700A\r\n:1010F000552721E030E001C0220F4A95EAF78081B0\r\n:10110000822B80830895CA0157FD079633E0959599\r\n:1011100087953A95E1F7A481B5818A9F90018B9FCD\r\n:10112000300D9A9F300D1124620F731F078CF0A1B0\r\n:10113000E02DE60FF71F4770552781E090E001C0D2\r\n:10114000880F4A95EAF7809590818923DACFCA0102\r\n:1011500057FD079623E0959587952A95E1F7A48199\r\n:10116000B5818A9F90018B9F300D9A9F300D11247D\r\n:10117000620F731F078CF0A1E02DE60FF71F477079\r\n:10118000552721E030E001C0220F4A95EAF780811F\r\n:101190008227B7CF08958EBD00000DB407FEFDCFA6\r\n:1011A0008EB508958CBD9DBD08950895FC016370B2\r\n:1011B000668B8481958126813781613039F0633077\r\n:1011C00029F0918780873387228708953187208788\r\n:1011D0009387828708952F923F924F925F926F92EA\r\n:1011E0007F928F929F92AF92BF92CF92DF92EF92B7\r\n:1011F000FF920F931F93CF93DF93CDB7DEB76A971C\r\n:101200000FB6F894DEBF0FBECDBF9A8F898F7A8359\r\n:1012100069834A01D22E18870F833701BC2CDC0169\r\n:1012200059962D913C915A972115310509F015C118\r\n:1012300018968D919C911997681779070CF0D9C170\r\n:101240001A968D919C91481759070CF0D2C14C2CDD\r\n:10125000512CB6E0CB9E600D711D11247C876B87ED\r\n:10126000161617060CF0C5C1EA2DF0E0FA87E987DB\r\n:1012700093E0EE0FFF1F9A95E1F7F88BEF87CF0110\r\n:10128000840F951F181619060CF0B3C1A98DBA8DDD\r\n:1012900058968C91811104C0BFEABD1508F4D3940F\r\n:1012A000A98DBA8DED91FC9111970284F385E02D03\r\n:1012B000CD010995B5E0DB9EC0011124E981FA81D9\r\n:1012C000FC83EB83312C212C9C012A583F4F388F13\r\n:1012D0002F8B4A2D50E05E8B4D8BEF89F88DE20D00\r\n:1012E000F31D44919E828D82D12CC12C69817A811B\r\n:1012F000620D731D7A8B698B842F90E09C8B8B8B96\r\n:10130000E98DFA8DA081B18140FF82C0F1E0BF126A\r\n:101310006FC0AF126DC01C96ED91FC912F81388586\r\n:10132000A4014C0D5D1D69897A89898D9A8D099575\r\n:10133000EB89FC89F595E7954E2F5FEFC51AD50A25\r\n:101340006D817E818D899E89680F791F7E836D8373\r\n:1013500098E0C916D10481F6AFEF2A1A3A0AEB8158\r\n:10136000FC81E40DF51DFC83EB83F5E02F163104C1\r\n:1013700009F0B3CF2F81388526153705B9F0A98D2F\r\n:10138000BA8DED91FC91B1E0BB1257C0AB1255C0C4\r\n:1013900069817A816B5F7F4F0088F189E02D83013D\r\n:1013A00028E030E0A401898D9A8D0995A98DBA8D28\r\n:1013B000ED91FC9111970688F789E02DCD016A9691\r\n:1013C0000FB6F894DEBF0FBECDBFDF91CF911F9156\r\n:1013D0000F91FF90EF90DF90CF90BF90AF909F90D4\r\n:1013E0008F907F906F905F904F903F902F900994D7\r\n:1013F0001E96ED91FC91EF80F88409851A85920183\r\n:101400004D815E816B817C81898D9A8D099590CF0C\r\n:101410002F8138852615370509F48ACF31E0B312BC\r\n:1014200007C0A31205C01C96ED91FC91930178CFE3\r\n:101430001E96ED91FC917301E0CF6B857C8564195C\r\n:1014400075090684F785E02D73010F8518899201CF\r\n:10145000A401898D9A8D0995A9CFF90134964591FA\r\n:101460005491F901329685919491D41AB7E0DB9E9C\r\n:10147000800D911D1124F901259134913C8B2B8B0A\r\n:10148000FC0125903490FC01329674903196349191\r\n:10149000398B329664903196449041E04C1518F0A7\r\n:1014A0004A1508F07FC0662D062C000C770B7C8354\r\n:1014B0006B83842D042C000C990B9E838D83A98D46\r\n:1014C000BA8DED91FC9111970284F385E02DCD0149\r\n:1014D0000995512CD12CC12CEA2DF0E0FA87E9872F\r\n:1014E0002B2D30E03C872B87A401440D511D47FC78\r\n:1014F0005A95588F4F8B69817A81660D711D67FCF3\r\n:101500007A957E876D877989C71608F04FCF2C2D85\r\n:1015100030E04D815E81420F531FA985BA854A9FF5\r\n:10152000C0014B9F900D5A9F900D1124FC01E80DB6\r\n:10153000F91DF88BEF87852D612C4F89588D420F4F\r\n:10154000531F5E8B4D8B671408F050C044244394A6\r\n:10155000480E877041F4C1010196EB89FC89E20DC8\r\n:10156000F31DD4901C01D7FE19C0A98DBA8DED9141\r\n:10157000FC91662D70E0B1E0BB1219C0AB1217C030\r\n:101580002D853E85620F731F0484F585E02D2F8124\r\n:1015900038854D895E89898D9A8D0995DD0C639416\r\n:1015A000842DD1CF1E821D821C821B8288CF4B814D\r\n:1015B0005C81640F751FAB85BC856A9FC0016B9F02\r\n:1015C000900D7A9F900D112469817A81680F791F9F\r\n:1015D0000684F785E02DEF80F88409851A859D0142\r\n:1015E0004F855889898D9A8D0995D8CF570CC3940A\r\n:1015F0008ACF6A960FB6F894DEBF0FBECDBFDF91DB\r\n:10160000CF911F910F91FF90EF90DF90CF90BF90FF\r\n:10161000AF909F908F907F906F905F904F903F9092\r\n:101620002F9008958F929F92AF92CF92EF92FF9258\r\n:101630000F931F93CF93DF93EC01262F898D9A8D03\r\n:10164000009709F051C06A30D1F41D861C868D893F\r\n:1016500048E0849F900111248E859F85820F931FFF\r\n:101660009F878E8781E090E0DF91CF911F910F914E\r\n:10167000FF90EF90CF90AF909F908F9008956D3036\r\n:1016800089F3CC88AD888F898823C1F08C859D85AE\r\n:1016900036E0C39E800D911D112448855985481759\r\n:1016A000590764F44E855F851D861C8638E0A39E2D\r\n:1016B000C0011124840F951F9F878E87EA88FB88BD\r\n:1016C000088919894E855F856C857D85CE010E94CC\r\n:1016D000EB082C898C859D8546E0249F800D911D0B\r\n:1016E00011249D878C87BECF6A3069F41D861C86C5\r\n:1016F000FC013896E4912D898E859F85E29F800DAF\r\n:10170000911D1124ADCF6D3009F4ACCFFC0134969E\r\n:101710004591549170E06417750708F4A3CFFC015C\r\n:101720003696A591B491A617B70708F49BCFFC0194\r\n:10173000329685909490362F341B47E0349F800C6E\r\n:10174000911C1124F401329634913196E4913323A3\r\n:10175000A9F1EE2399F1CC88F4013596E491AD8896\r\n:101760004F89442301F10E2E000CFF0BE30FF11DF6\r\n:10177000CE9EA001CF9E500D11246C857D85460F15\r\n:10178000571F68857985641775076CF44E855F85EA\r\n:101790001D861C86FC013896E491AE9E400D511DBD\r\n:1017A00011245F874E87EA88FB88088919894E854E\r\n:1017B0005F856C857D85CE010E94EB08F40134962F\r\n:1017C000E4912C898C859D85E29F800D911D1124CB\r\n:1017D00088CF6F927F928F929F92AF92BF92CF925B\r\n:1017E000DF92EF92FF920F931F93CF93DF93EC0161\r\n:1017F0006B015A0139014801E881F9810284F385BE\r\n:10180000E02D0995E881F9810288F389E02D8701AF\r\n:101810009301A501B601CE010995A501480D591DF9\r\n:1018200041505109E881F9810288F389E02D930143\r\n:10183000B601CE010995E881F9810088F189E02D92\r\n:101840009401A501B601CE010995C60CD71CB601BD\r\n:1018500061507109E881F9810088F189E02D9401D6\r\n:10186000A501CE010995E881F9810688F789E02D67\r\n:10187000CE01DF91CF911F910F91FF90EF90DF90FC\r\n:10188000CF90BF90AF909F908F907F906F90099472\r\n:101890006F927F928F929F92AF92BF92CF92DF9280\r\n:1018A000EF92FF920F931F93CF93DF935C01EB01B5\r\n:1018B0006A01490138018701DC01ED91FC91621751\r\n:1018C000730719F5641675062CF0962D872D3A01CD\r\n:1018D000C92ED82E9601261937092F5F3F4F048C49\r\n:1018E000F58DE02DA301BE01C5010995DF91CF91D2\r\n:1018F0001F910F91FF90EF90DF90CF90BF90AF902E\r\n:101900009F908F907F906F9008954615570591F4A2\r\n:101910002617370724F0892D4B01C22FD82F9E019F\r\n:10192000281939092F5F3F4F068CF78DE02DA6014E\r\n:10193000B401DACF0284F385E02D0995D501ED914C\r\n:10194000FC910488F589E02D83019401A601BE0174\r\n:10195000C5010995D501ED91FC910688F789E02D27\r\n:10196000C501DF91CF911F910F91FF90EF90DF9014\r\n:10197000CF90BF90AF909F908F907F906F90099481\r\n:10198000EF92FF920F931F93DC011A960D911C9119\r\n:101990001B9718962D913C911997ED91FC9100A001\r\n:1019A000F1A1E02D7B0150E040E070E060E009959E\r\n:1019B0001F910F91FF90EF9008954F925F926F9259\r\n:1019C0007F928F929F92AF92BF92CF92DF92EF92CF\r\n:1019D000FF920F931F93CF93DF936C012B015A015A\r\n:1019E00039014801DC01ED91FC910284F385E02D81\r\n:1019F0000995E201640C751CD601ED91FC91C615A8\r\n:101A0000D7055CF40088F189E02D87019401A501D8\r\n:101A1000BE01C60109952196EFCF0688F789E02D12\r\n:101A2000C601DF91CF911F910F91FF90EF90DF9052\r\n:101A3000CF90BF90AF909F908F907F906F905F906E\r\n:101A40004F9009948F929F92AF92BF92CF92DF9264\r\n:101A5000EF92FF920F931F93CF93DF93EC015B0103\r\n:101A60004A016901E881F9810284F385E02D099535\r\n:101A700095012C0D3D1D21503109E881F981048823\r\n:101A8000F589E02D78018401A401B501CE01099505\r\n:101A9000E881F9810688F789E02DCE01DF91CF91A9\r\n:101AA0001F910F91FF90EF90DF90CF90BF90AF907C\r\n:101AB0009F908F9009948F929F92AF92BF92CF92F6\r\n:101AC000DF92EF92FF920F931F93CF93DF93EC017E\r\n:101AD0005B014A0169017801E881F9810284F3859B\r\n:101AE000E02D0995C80CD91C860101501109E88127\r\n:101AF000F9810488F589E02D9501A401B501CE0195\r\n:101B00000995E881F9810688F789E02DCE01DF91FA\r\n:101B1000CF911F910F91FF90EF90DF90CF90BF90EA\r\n:101B2000AF909F908F900994EF92FF920F931F9325\r\n:101B3000DC01ED91FC9100A0F1A1E02D09951F9130\r\n:101B40000F91FF90EF9008950F931F93DC01ED919B\r\n:101B5000FC91068CF78DE02D09951F910F9108954A\r\n:101B60000F931F93DC01ED91FC91048CF58DE02D1A\r\n:101B700009951F910F9108952F923F924F925F9276\r\n:101B80006F927F928F929F92AF92BF92CF92DF928D\r\n:101B9000EF92FF920F931F93CF93DF93CDB7DEB7F2\r\n:101BA0002C970FB6F894DEBF0FBECDBF3C017C83EF\r\n:101BB0006B835C874B871801270181E090E05C0113\r\n:101BC000A41AB50ACA01919581959109AC01440FF7\r\n:101BD000551F5A834983C80101969E838D83F12C3A\r\n:101BE000E12C88248394912C922F91709F832270F2\r\n:101BF0002887AB014F5F5F4F5A8749878B859C854C\r\n:101C0000E816F9060CF07AC0CB84DC84B7FC0CC073\r\n:101C10006C0191E0C91AD10849815A814E5F5F4F2A\r\n:101C20005A834983A40EB51E5FEFE51AF50A82E0D8\r\n:101C3000880E911CA80CB91CCE14DF0464F19F819E\r\n:101C4000992399F09601220F331F4D815E81240F55\r\n:101C5000351F82014B815C814C195D09B701660D0E\r\n:101C6000771D8FE492E00E94B00D5885552399F0BE\r\n:101C70009601220F331F8D819E81280F391F82010B\r\n:101C80004B815C814C195D09B3016E197F098FE4AA\r\n:101C900092E00E94B00D4B855C854C155D0559F1B5\r\n:101CA0005F81552391F0940122503109220D331D9B\r\n:101CB000820149855A854E195F096B857C85660DC1\r\n:101CC000771D8FE492E00E94B00D8885882399F0FB\r\n:101CD000940122503109220D331DB3014B855C85DF\r\n:101CE000641B750B820149855A854E195F098FE483\r\n:101CF00092E00E94B00DDC86CB8680CF2C960FB68A\r\n:101D0000F894DEBF0FBECDBFDF91CF911F910F9131\r\n:101D1000FF90EF90DF90CF90BF90AF909F908F900B\r\n:101D20007F906F905F904F903F902F900895AF926B\r\n:101D3000BF92CF92DF92EF92FF920F931F93CF93B8\r\n:101D4000DF936C015B01EA0179019A01220F331FD5\r\n:101D50002F5F3F4FAB014C1B5D0B8701B6018FE43A\r\n:101D600092E00E94B00D10E000E023E0AE01B5016A\r\n:101D7000C6010E94BC0DDF91CF911F910F91FF9082\r\n:101D8000EF90DF90CF90BF90AF900895DC01ED9180\r\n:101D9000FC910084F185E02D09943F924F925F926F\r\n:101DA0006F927F928F929F92AF92BF92CF92DF926B\r\n:101DB000EF92FF920F931F93CF93DF935C017B0110\r\n:101DC0004A016901390187E0680E711C93E075943E\r\n:101DD00067949A95E1F72B01400E511E10E000E048\r\n:101DE000312CD0E0C0E0CE0187709927330C892BCD\r\n:101DF00059F4FE0183E0F595E7958A95E1F7E00F48\r\n:101E0000F11FE80DF91D349037FE0AC021E030E0E3\r\n:101E1000A701B5016C0F7D1F8FE492E00E94C60EF2\r\n:101E20002196CC16DD06F9F68FEFE81AF80A060DB2\r\n:101E3000171DE414F504A9F6DF91CF911F910F91BE\r\n:101E4000FF90EF90DF90CF90BF90AF909F908F90DA\r\n:101E50007F906F905F904F903F9008952F923F92A8\r\n:101E60004F925F926F927F928F929F92AF92BF92AA\r\n:101E7000CF92DF92EF92FF920F931F93CF93DF9356\r\n:101E800000D000D000D0CDB7DEB73C016A013E8360\r\n:101E90002D83FC82EB825801A41AB50AB7FE03C059\r\n:101EA000B194A194B1088D809E80861A970A97FEFE\r\n:101EB00003C09194819491088A149B045CF0902F44\r\n:101EC000812F0D811E819D838E839C2D8D2D6B0115\r\n:101ED000692F782F0C151D055CF09D818E817E8306\r\n:101EE0006D83692F782F902F812F8601C92ED82ED0\r\n:101EF0001601201A310A2B012D813E81421A530A04\r\n:101F000057FE03C0519441945108710137FE03C03C\r\n:101F10003FEFE31AF30AF594E7948D819E818617CB\r\n:101F200097075CF5A1E0B0E0BA83A983C016D1069B\r\n:101F30004CF1D301ED91FC910484F585E02D2B81CA\r\n:101F40003C81A8016D817E818A149B041CF04D8127\r\n:101F50005E81B801C3010995E418F508F7FE0AC0CF\r\n:101F60002D813E8189819A81280F391F3E832D83DF\r\n:101F7000E20CF31C0F5F1F4FD9CF2FEF3FEF3A83D7\r\n:101F80002983D4CF26960FB6F894DEBF0FBECDBFFF\r\n:101F9000DF91CF911F910F91FF90EF90DF90CF9045\r\n:101FA000BF90AF909F908F907F906F905F904F9079\r\n:101FB0003F902F9008950895CF92DF92EF92FF9275\r\n:101FC000CF93DF93EC01603282E07807CCF5653B7C\r\n:101FD000710514F064EB70E0898128E830E0281B7B\r\n:101FE000310987FD3395220F331F220F331F6901FB\r\n:101FF000330FEE08FF088A8128E532E0281B3109FB\r\n:1020000087FD3395220F331F220F331F032E000C41\r\n:10201000440B550B2C193D094E095F09DB0177FF75\r\n:1020200002C0B0E0A0E00E940A1D24EB30E040E0D6\r\n:1020300050E00E94E01CC20ED31EE41EF51EB60145\r\n:10204000E881EC3070F5298188E890E0821B9109E5\r\n:1020500027FD9395880F991F880F991F6817790797\r\n:102060007CF02A8188E592E0821B910927FD9395F7\r\n:10207000880F991F880F991F681779070CF4CB01F7\r\n:102080000297880F991F4FB7F8942E2F30E0F9016F\r\n:10209000EE0FFF1FE20FF31FEA50FE4F9283818382\r\n:1020A0004FBFDF91CF91FF90EF90DF90CF900895D9\r\n:1020B0000F931F93CF93DF938C01EB01BC018DE352\r\n:1020C00092E00E94DC0F64EB70E0601B710B8AE30E\r\n:1020D00092E00E94DC0F6AE570E087E392E00E94E4\r\n:1020E000DC0F6AE570E084E392E00E94DC0FBE0141\r\n:1020F00081E392E00E94DC0FBE018EE292E0DF916C\r\n:10210000CF911F910F910C94DC0F1F93CF93DF930E\r\n:10211000EC01162F88818C3008F04EC061E0812FD1\r\n:102120000E94BD058881282F30E0F901EE0FFF1FC6\r\n:10213000E20FF31FEA50FE4F1F736081607C612B3A\r\n:10214000608319821A822CE0622F0E94431D829FB5\r\n:10215000B001112430E020E0AB01420F531FFA011F\r\n:10216000EE0FFF1FE40FF51FEA50FE4F908196FD22\r\n:1021700016C02F5F3F4F2C30310571F781110FC012\r\n:102180001092800082E0809381001092850010926E\r\n:102190008400B19A80916F00826080936F00E88123\r\n:1021A0008E2F90E0FC01EE0FFF1FE80FF91FEA50A1\r\n:1021B000FE4F8081806480838881DF91CF911F9161\r\n:1021C00008952091AA01260F3327331F21323105AC\r\n:1021D000ECF42091CE01FC0190E080E0243069F025\r\n:1021E00082E00895A091AA012191AC0146575E4F6B\r\n:1021F000A40FB52FB11D2C930196861798F38091EB\r\n:10220000AA01680F6093AA0180E0089581E0089513\r\n:102210001092CE0181E08093D0011092CF0161E055\r\n:1022200082E10E94710561E083E10E947105E9EBA2\r\n:10223000F0E080818E7F808380818D7F808388E441\r\n:102240008093B80085E48093BC000895CF93DF931A\r\n:1022500091E0909389018823B9F0C091B800D091A2\r\n:10226000BA008091BC008A7B8093BC0060E082E170\r\n:102270000E94710560E083E10E9471050E940811CF\r\n:10228000D093BA00C093B800DF91CF910895E09148\r\n:10229000200280911F02E81730F4F0E0EC59FE4F65\r\n:1022A000808190E008958FEF9FEF08959091200234\r\n:1022B00080911F022FEF3FEF981748F4E92FF0E0CD\r\n:1022C000EC59FE4F208130E09F5F90932002C901BE\r\n:1022D000089580911F0290912002891B990B089507\r\n:1022E000CF92DF92EF92FF920F931F93CF93DF93E2\r\n:1022F0007C01CB018A0120912D02222389F0EB0180\r\n:102300006B01C40ED51ECC15DD0569F06991D701AE\r\n:10231000ED91FC910190F081E02DC7010995F3CF7B\r\n:10232000642F0E94E110C801DF91CF911F910F919E\r\n:10233000FF90EF90DF90CF900895CF93DF931F929F\r\n:10234000CDB7DEB7698320912D022223F9F02091C9\r\n:102350002A02203258F021E030E0FC01338322834E\r\n:1023600090E080E00F90DF91CF91089580912B0253\r\n:10237000E82FF0E0EC5BFE4F998190838F5F8093B4\r\n:102380002B0280932A0281E090E0ECCF61E0CE0145\r\n:1023900001960E94E110F7CFCF92DF92EF92FF9269\r\n:1023A0000F931F93CF93DF93D0912A0281E0D13214\r\n:1023B00008F09CC0C0912C020E94EE056B017C01CC\r\n:1023C0008091CE0181116CC082E08093CE0181E0CA\r\n:1023D0008093D0018FEF8093CD011092F201D093C2\r\n:1023E000F101A4E4B1E0E1EDF1E080E0D8138DC0AB\r\n:1023F0001092F3018091F301CC0FC82BC093F3012D\r\n:102400008091CF01813009F084C01092CF010E94E9\r\n:10241000EE056B017C018091F3018093BB008091FC\r\n:10242000850190918601A0918701B0918801892B47\r\n:102430008A2B8B2BA1F00E94EE0500918501109153\r\n:10244000860120918701309188016C197D098E09E0\r\n:102450009F09061717072807390708F442C080911B\r\n:10246000BC0083FDD8CF85EC8093BC000E94EE05B4\r\n:102470006B017C018091CE01823009F44CC08091C7\r\n:10248000CD018F3F09F469C08091CD01803209F4FC\r\n:1024900066C08091CD01803309F463C084E026C01A\r\n:1024A0008091850190918601A0918701B09188016A\r\n:1024B000892B8A2B8B2B09F483CF0E94EE05009188\r\n:1024C00085011091860120918701309188016C1956\r\n:1024D0007D098E099F09061717072807390708F095\r\n:1024E0006FCF809184010E94261185E010922B020B\r\n:1024F00010922A0210922D02DF91CF911F910F911D\r\n:10250000FF90EF90DF90CF9008959D9191938F5F12\r\n:102510006DCF85EEA9CF8091850190918601A09124\r\n:102520008701B0918801892B8A2B8B2B09F4A2CFCC\r\n:102530000E94EE050091850110918601209187018E\r\n:10254000309188016C197D098E099F0906171707BC\r\n:102550002807390708F08ECFC4CF80E0C7CF82E0CC\r\n:10256000C5CF83E0C3CFEF92FF920F931F93CF931A\r\n:10257000DF937C01C62F80916C0290916D020097D1\r\n:1025800009F459C02091700231E030932D0220935C\r\n:102590002C0210922B0210922A02DC01ED91FC9188\r\n:1025A0000190F081E02D60E009958701EE24E3942D\r\n:1025B000F12CD1E0C15080916C0290916D02CF3F1F\r\n:1025C00091F1B0E2EB16F104D8F00E94CC118091A9\r\n:1025D0006C0290916D0220917002D0932D02209395\r\n:1025E0002C0210922B0210922A02DC01ED91FC9138\r\n:1025F0000190F081E02D60E00995EE24E394F12C48\r\n:1026000080916C0290916D02F8016491DC01ED9172\r\n:10261000FC910190F081E02D0995BFEFEB1AFB0AC8\r\n:102620000F5F1F4FC7CFDF91CF911F910F91FF9089\r\n:10263000EF900C94CC11E0917C02F0917D0290819E\r\n:10264000809182028095892380838701C15008F49C\r\n:1026500038C0F801849120916A0230916B02232BDB\r\n:1026600029F00E94CB080F5F1F4FF0CF28E030E029\r\n:1026700040E8E0917802F091790290918002582F21\r\n:102680005423D9F05081952B9083E0917A02F091F8\r\n:102690007B02908150918102952B9083E0917A0288\r\n:1026A000F0917B02508190918102909595239083C7\r\n:1026B000469521503109E9F6D6CF50819095952362\r\n:1026C000E3CFDF91CF911F910F91FF90EF9008958D\r\n:1026D0001F93CF93DF93EC018D8D9E8D009721F199\r\n:1026E000162F29A131E030932D0220932C02109255\r\n:1026F0002B0210922A02DC01ED91FC910190F081F5\r\n:10270000E02D60E009958D8D9E8DDC01ED91FC91B1\r\n:102710000190F081E02D612F09958D8D9E8DDF91C7\r\n:10272000CF911F910C94CC11ADA5BEA59C918BA906\r\n:10273000809589238C938B8D9C8D892B31F0862FEE\r\n:10274000DF91CF911F910C94CB0828E030E080E816\r\n:10275000A9A5BAA599A9462F4823C1F04C91942B5D\r\n:102760009C93ABA5BCA59C914AA9942B9C93ABA52B\r\n:10277000BCA54C919AA9909594239C938695215041\r\n:10278000310931F7DF91CF911F9108954C919095C8\r\n:102790009423E6CF1F93CF93DF93EC01162F8D8DFB\r\n:1027A0009E8D892BB1F12DA93EA94FA958AD60E0AE\r\n:1027B00074E284EF90E00E94121D2051310941091A\r\n:1027C000510956954795379527952093B80066EAA5\r\n:1027D000111167EACE010E9468138D8D9E8D892BA1\r\n:1027E00041F129AD3AAD4BAD5CAD60E074E284EFF0\r\n:1027F00090E00E94121D205131094109510956955E\r\n:102800004795379527952093B800DF91CF911F9179\r\n:1028100008958B8D9C8D892B21F08EAD9FAD0E94EC\r\n:10282000D208EFA5F8A990818CA98095892380838F\r\n:10283000CECFEFA5F8A980819CA9892B8083E5CF15\r\n:1028400090E080E00895BC0180E492E00E94DC0FFB\r\n:102850006CE271E080E090E00C9413062091550248\r\n:1028600030915602C901079697FD079623E095958A\r\n:1028700087952A95E1F72091530230915402829F67\r\n:10288000A001839F500D929F500D112470E060E0D5\r\n:1028900080916E0290916F020C947F1EDF92EF92F6\r\n:1028A000FF920F931F93CF93DF938C01C6E0D0E08C\r\n:1028B0008230910531F0CAEFDFEF039711F0D0E0DD\r\n:1028C000C0E00E942E1421E030E00130110509F033\r\n:1028D000E6C042E150E068E170E086E290E00E94EC\r\n:1028E000970E21E030E042E150E068E170E08AE5D7\r\n:1028F00090E00E94970E30E020E044E050E068E174\r\n:1029000070E086E290E00E94970E30E020E044E024\r\n:1029100050E068E170E08AE590E00E94970E21E0C7\r\n:1029200030E048E050E064E370E080E490E00E9432\r\n:10293000970E30E020E044E050E064E370E080E493\r\n:1029400090E00E94970E80916C0290916D02892B0D\r\n:1029500009F4F0C0209184023091850240918602F2\r\n:102960005091870260E074E284EF90E00E94121DB3\r\n:1029700020513109410951095695479537952795B9\r\n:102980002093B80064E082E790E00E94B312809147\r\n:102990005302909154028034910509F0E2C060E244\r\n:1029A0008FE492E00E94681360915302615E8FE4AD\r\n:1029B00092E00E9468132091550230915602C9019D\r\n:1029C000079697FD079633E0959587953A95E1F739\r\n:1029D0002091530230915402829F8001839F100DF9\r\n:1029E000929F100D1124C0916E02D0916F028091C0\r\n:1029F0006C0290916D020C0F1D1F009709F4E3C04B\r\n:102A00002091700231E030932D0220932C0210921D\r\n:102A10002B0210922A02DC01ED91FC910190F081D1\r\n:102A2000E02D60E40995EE24E394F12CDD24D394A9\r\n:102A300080916C0290916D020C171D0709F49AC0E9\r\n:102A4000B0E2EB16F104D8F00E94CC1180916C0238\r\n:102A500090916D0220917002D0922D0220932C0251\r\n:102A600010922B0210922A02DC01ED91FC91019050\r\n:102A7000F081E02D60E40995EE24E394F12C80913F\r\n:102A80006C0290916D026991DC01ED91FC910190D5\r\n:102A9000F081E02D0995BFEFEB1AFB0AC9CF4FE09B\r\n:102AA00050E068E170E086E290E00E94970E21E03D\r\n:102AB00030E04FE050E068E170E08AE590E00E948D\r\n:102AC000970E30E020E046E050E068E170E0CE0193\r\n:102AD00086960E94970E30E020E046E050E068E1E4\r\n:102AE00070E0CE01865A9F4F0E94970EEE24E39429\r\n:102AF000F12C08E010E028E230E042E350E06CE224\r\n:102B000070E08FE492E00E94940D0FEF1FEF21E040\r\n:102B100044E050E066E370E083E590E00E94BC0D85\r\n:102B200022E044E050E066E370E08CE290E00E9436\r\n:102B3000BC0D09CF80916A0290916B02892B31F014\r\n:102B400080918D0290918E020E94D208E0917E02C7\r\n:102B5000F0917F0290818091830280958923808308\r\n:102B600011CF60E08FE492E00E94681360915302FD\r\n:102B700061501DCF0E94CC1180916C0290916D022A\r\n:102B8000892B09F461C0209188023091890240911B\r\n:102B90008A0250918B0260E074E284EF90E00E9420\r\n:102BA000121D205131094109510956954795379514\r\n:102BB00027952093B800DF91CF911F910F91FF903F\r\n:102BC000EF90DF900895E0917C02F0917D0280818A\r\n:102BD00090918202892B80830C171D0769F28991DD\r\n:102BE00020916A0230916B02232B19F00E94CB08CE\r\n:102BF000F3CF28E030E040E8E0917802F0917902EC\r\n:102C000090918002582F5423D9F05081952B9083B6\r\n:102C1000E0917A02F0917B02908150918102952B94\r\n:102C20009083E0917A02F0917B0250819091810231\r\n:102C3000909595239083469521503109E9F6CCCFA4\r\n:102C4000508190959523E3CFE0917E02F0917F0231\r\n:102C5000808190918302892B8083ADCF0E947A1E60\r\n:102C600085ED8093BC008091850190918601A091B3\r\n:102C70008701B09188010796A11DB11D23E0B6958B\r\n:102C8000A795979587952A95D1F72091BC0024FDAB\r\n:102C900003C01092CE0108954091850150918601A4\r\n:102CA0006091870170918801452B462B472B69F372\r\n:102CB0000097A105B10541F02AE22A95F1F700C07D\r\n:102CC0000197A109B109E1CF809184010C942611EB\r\n:102CD0000F931F9360E089E00E94710583E090E00C\r\n:102CE0000197F1F761E089E00E94710583E290E0CD\r\n:102CF0000197F1F760E089E00E947105EAE6FAE0E9\r\n:102D00006491E6E5FAE0E491F0E0EE0FFF1FE85988\r\n:102D1000FF4F8591949108EA11E620E030E0462FBC\r\n:102D20000E94D6186115710581059105A9F06F5FA4\r\n:102D30007F4F8F4F9F4F9F706115710581059105E2\r\n:102D400059F02AE330E040E050E00E94121DCA0131\r\n:102D5000B9011F910F91089520E931E040E050E062\r\n:102D6000F6CF1F920F920FB60F9211242F933F931D\r\n:102D70008F939F93AF93BF938091220290912302F0\r\n:102D8000A0912402B09125023091210223E0230F6B\r\n:102D90002D3758F50196A11DB11D20932102809376\r\n:102DA000220290932302A0932402B09325028091E3\r\n:102DB000260290912702A0912802B0912902019643\r\n:102DC000A11DB11D8093260290932702A093280293\r\n:102DD000B0932902BF91AF919F918F913F912F9115\r\n:102DE0000F900FBE0F901F90189526E8230F0296A4\r\n:102DF000A11DB11DD2CF1F920F920FB60F921124B9\r\n:102E00002F933F934F935F936F937F938F939F93F2\r\n:102E1000AF93BF93CF93DF93EF93FF938091F40130\r\n:102E2000C091F501D0E087FF24C010928500109278\r\n:102E300084008091F4018F5F8093F4018091F4010C\r\n:102E4000082E000C990B8C179D0724F48091F40137\r\n:102E50008C30C4F180918400909185000496803478\r\n:102E60009C4908F47AC08091840090918500049672\r\n:102E700076C08091F401082E000C990B8C179D07E9\r\n:102E8000C4F6E091F4018E2FEE0F990BFC01EE0FCA\r\n:102E9000FF1FE80FF91FEA50FE4F808186FFC9CF60\r\n:102EA000E091F4018E2FEE0F990BFC01EE0FFF1F46\r\n:102EB000E80FF91FEA50FE4F808160E08F730E9497\r\n:102EC0007105B7CF2091840030918500E091F40125\r\n:102ED0008E2FEE0F990BFC01EE0FFF1FE80FF91F6D\r\n:102EE000EA50FE4F81819281820F931F9093890057\r\n:102EF00080938800E091F4018E2FEE0F990BFC0176\r\n:102F0000EE0FFF1FE80FF91FEA50FE4F808186FF8A\r\n:102F100011C0E091F4018E2FEE0F990BFC01EE0F22\r\n:102F2000FF1FE80FF91FEA50FE4F808161E08F73A9\r\n:102F30000E947105FF91EF91DF91CF91BF91AF9109\r\n:102F40009F918F917F916F915F914F913F912F91C1\r\n:102F50000F900FBE0F901F90189580E49CE99093FE\r\n:102F60008900809388008FEF8093F401E3CF1F9254\r\n:102F70000F920FB60F9211242F933F934F935F93AD\r\n:102F80006F937F938F939F93AF93BF93EF93FF9331\r\n:102F90008091B900887F803609F44AC0F0F5883204\r\n:102FA00009F4A7C018F5803109F49BC0B8F4882350\r\n:102FB00009F4F9C0883009F494C0FF91EF91BF91F2\r\n:102FC000AF919F918F917F916F915F914F913F91C1\r\n:102FD0002F910F900FBE0F901F901895883109F414\r\n:102FE00088C0803251F78093CD0114C0803409F439\r\n:102FF0009DC040F48033B9F38833F9F68093CD0156\r\n:1030000085ECB0C0803509F485C0883509F496C0D8\r\n:10301000883499F60E943016D0CF883909F48CC0D4\r\n:1030200038F5883729F050F4883611F0803729F6C2\r\n:1030300083E08093CE011092CC0157C0883809F408\r\n:103040007BC0803919F0803809F0B7CF8091CC016E\r\n:10305000803208F071C0E091CC0181E08E0F809346\r\n:10306000CC018091BB00F0E0E455FE4F80833DC071\r\n:10307000803B39F0E0F4803A09F479C0883A09F0ED\r\n:103080009CCF84E08093CE011092AB011092AA01F4\r\n:10309000E0911D02F0911E0209958091AA01811113\r\n:1030A0000FC081E08093AA0110928A0109C0803C80\r\n:1030B00009F4A6CF883C09F4A3CF883B09F07DCF63\r\n:1030C000E091AB0181E08E0F8093AB01F0E0E65719\r\n:1030D000FE4F80818093BB009091AB018091AA014B\r\n:1030E00029C08091F3018093BB0085EC8093BC00E4\r\n:1030F00064CF9091F2018091F101981758F5E09119\r\n:10310000F20181E08E0F8093F201F0E0EF52FE4F6A\r\n:103110008081E9CFE091F20181E08E0F8093F2018E\r\n:103120008091BB00F0E0EF52FE4F80839091F2015E\r\n:103130008091F1019817C8F285E8D8CFE091F201AB\r\n:1031400081E08E0F8093F2018091BB00F0E0EF529E\r\n:10315000FE4F80838091D00181115CCF81E080930C\r\n:10316000CF0184EA8093BC001092CE0126CF85EC7B\r\n:103170008093BC001092CE018091CC01803230F45B\r\n:10318000E091CC01F0E0E455FE4F10826091CC015B\r\n:1031900070E0E0911B02F0911C028CEA91E009952D\r\n:1031A0001092CC010ACF1092CD0134CFCF92DF9292\r\n:1031B000EF92FF920F931F93E82FF92F05C0015054\r\n:1031C00011092109310961F1908196239417B9F30E\r\n:1031D00005C0015011092109310911F1908196238F\r\n:1031E0009413F7CFC12CD12CE12CF12C0AC08FEF16\r\n:1031F000C81AD80AE80AF80A0C151D052E053F055D\r\n:1032000079F080818623841791F36C2D7D2D8E2D8E\r\n:103210009F2D1F910F91FF90EF90DF90CF90089519\r\n:1032200060E070E080E090E01F910F91FF90EF90E0\r\n:10323000DF90CF900895FC019091F5019C3098F4B7\r\n:1032400081E0890F8093F5019083892F90E0FC0144\r\n:10325000EE0FFF1FE80FF91FEA50FE4F88EB9BE0CF\r\n:103260009283818308958FEF80830895A3E4B2E071\r\n:1032700013961C921E92129748EE53E060E070E0A5\r\n:1032800014964D935D936D937C9317978AE091E02C\r\n:1032900011969C938E93EFE4F2E01382128220E861\r\n:1032A00030E03583248380E490E097838683318700\r\n:1032B000208793878287168A158614861786168636\r\n:1032C00081E0858B848B2FEF3FEF338B228B318B0B\r\n:1032D000208B878B108E128E118E8CE191E0918362\r\n:1032E0008083148E138EB68FA58F10A2178E8FEF4A\r\n:1032F00084A385A386A387A380A780E89AE1A6E09C\r\n:10330000B0E085AB96ABA7ABB0AF80EA96E8A1E0A2\r\n:10331000B0E081AF92AFA3AFB4AF80E586AF17AE98\r\n:1033200080E492E00E941B198DE392E00E941B1939\r\n:103330008AE392E00E941B1987E392E00E941B1926\r\n:1033400084E392E00E941B1981E392E00E941B1922\r\n:103350008EE292E00C941B19789484B5826084BD4F\r\n:1033600084B5816084BD85B5826085BD85B5816089\r\n:1033700085BD80916E00816080936E001092810007\r\n:1033800080918100826080938100809181008160C2\r\n:103390008093810080918000816080938000809183\r\n:1033A000B10084608093B1008091B000816080930F\r\n:1033B000B00080917A00846080937A0080917A00D6\r\n:1033C000826080937A0080917A00816080937A0095\r\n:1033D00080917A00806880937A001092C10061E049\r\n:1033E00084E00E94BD0561E087E00E94BD0561E0C8\r\n:1033F00088E00E94BD0561E08CE00E94BD0561E0AF\r\n:1034000089E00E94BD0560E08AE00E94BD0563E09E\r\n:1034100070E080E492E00E9485106AE570E080E44C\r\n:1034200092E00E94DC0F6BE070E08DE392E00E947E\r\n:10343000851062E070E08AE392E00E9485106DE002\r\n:1034400070E087E392E00E9485106EE070E084E314\r\n:1034500092E00E9485106FE070E081E392E00E94AC\r\n:10346000851060E170E08EE292E00E94851064E1D8\r\n:1034700070E08AE590E00E94581080916E02909171\r\n:103480006F02892B11F10E942E1420915502309168\r\n:1034900056028091530290915402213231050CF072\r\n:1034A0007BC0B9016052710977FF02C06F5F7F4F27\r\n:1034B000759567958357910997FD019600E210E095\r\n:1034C00023E730E048E955E07AC020915502309179\r\n:1034D0005602C901079697FD0796B3E09595879523\r\n:1034E000BA95E1F72091530230915402AC01429F0A\r\n:1034F000C001439F900D529F900D11240E94551DB5\r\n:1035000090936F0280936E02892B09F0BCCF90E0FC\r\n:1035100080E00E944E14C0E0D0E064E170E088E2F8\r\n:1035200090E00E94581080EA90E00E9423140E94CC\r\n:10353000681682E090E00E944E1484E190E00E94C0\r\n:1035400023140E94681683E090E00E944E148AE5DE\r\n:1035500090E00E94231490E080E00E944E1460E40A\r\n:1035600070E08AE590E00E94581068E572E080E023\r\n:1035700090E00E94130664E170E08AE590E00E940A\r\n:1035800058106CE271E080E090E00E9413062097F2\r\n:1035900021F20E940000C1CFB9016054710977FF88\r\n:1035A00002C06F5F7F4F759567958255910997FDB2\r\n:1035B000019600E410E022E530E048E757E09595F9\r\n:1035C00087950E94CD0E82E08093710280916C02FB\r\n:1035D00090916D02892B09F494C08CE38093700262\r\n:1035E0001092200210921F0210922B0210922A02B7\r\n:1035F0000E94081185E496E090931E0280931D02BC\r\n:1036000086E496E090931C0280931B0280917702DF\r\n:1036100087FD1EC061E00E94BD0561E080917702D8\r\n:103620000E94710561E070E080E090E00E94130666\r\n:1036300060E0809177020E9471056AE070E080E0AE\r\n:1036400090E00E94130661E0809177020E9471056C\r\n:1036500080916C0290916D02892B09F411C1209127\r\n:10366000840230918502409186025091870260E089\r\n:1036700074E284EF90E00E94121D2051310941094B\r\n:10368000510956954795379527952093B80064E0E2\r\n:1036900084E995E00E94B3126091550261508FE475\r\n:1036A00092E00E94681364E080E995E00E94B31202\r\n:1036B0008091710264E1813009F460E18FE492E06D\r\n:1036C0000E94681364E08CE895E00E94B3128FE8D2\r\n:1036D00080938C028091530290915402803891051E\r\n:1036E00009F031C1809155029091560280349105C4\r\n:1036F00009F039C180917102813009F4D8C08FEC92\r\n:10370000D7C061E0809175020E94BD0561E08091A3\r\n:1037100076020E94BD0580917502082E000C990B5F\r\n:10372000FC01E45BF54FE491F0E0EE0FFF1FEE5B70\r\n:10373000F54F2591349130937D0220937C02FC015A\r\n:10374000E05AF54FE491E093820280917602082ED0\r\n:10375000000C990BFC01E45BF54FE491F0E0EE0FF7\r\n:10376000FF1FEE5BF54FA591B491B0937F02A0933C\r\n:103770007E02FC01E05AF54FE491E09383028C91C4\r\n:10378000E82BEC9380916A0290916B02892B09F4EB\r\n:1037900034C0CFB7F89480911A02811127C0E6E5B2\r\n:1037A000FAE08491EAE6FAE09491E82FF0E0EE0F77\r\n:1037B000FF1FE85CF54FA591B491EC91E92321F44A\r\n:1037C00061E08AE00E94710561E08AE00E94BD0527\r\n:1037D0008CB580618CBD8CB580648CBD61E08DE062\r\n:1037E0000E94BD0561E08BE00E94BD0580911A0238\r\n:1037F0008F5F80931A02CFBF09CF61E0809173027F\r\n:103800000E94BD0561E0809174020E94BD05809117\r\n:103810007302082E000C990BFC01E45BF54FE49158\r\n:10382000F0E0EE0FFF1FEE5BF54F259134913093E2\r\n:10383000790220937802FC01E05AF54FE491E0937D\r\n:10384000800280917402082E000C990BFC01E45B4D\r\n:10385000F54FE491F0E0EE0FFF1FEE5BF54FA59101\r\n:10386000B491B0937B02A0937A02FC01E05AF54F29\r\n:10387000E491E09381028C91E095E823EC93C6CE2D\r\n:1038800080916A0290916B02892B31F080918D02B8\r\n:1038900090918E020E94D208E0917E02F0917F0208\r\n:1038A000908180918302809589238083F0CE8FE977\r\n:1038B00080938C02C2E16AED8FE492E00E9468136B\r\n:1038C0006C2F8FE492E00E94681361E88FE492E02D\r\n:1038D0000E94681360918C028FE492E00E9468134A\r\n:1038E00069ED8FE492E00E9468138091710261EFAC\r\n:1038F000813009F462E28FE492E00E94681366E08E\r\n:1039000086E895E00E94B31280916C0290916D025E\r\n:10391000892BE9F1209188023091890240918A0235\r\n:1039200050918B0260E074E284EF90E00E94121DDF\r\n:1039300020513109410951095695479537952795E9\r\n:103940002093B800E4CD8036910589F4809155022A\r\n:1039500090915602409739F480917102813029F09C\r\n:103960008FEA80938C02C2E0A6CF80E1FACF803448\r\n:103970009105C9F78091550290915602809799F769\r\n:1039800080917102813009F0BACE80E191CFE0914F\r\n:103990007E02F0917F02808190918302892B808347\r\n:1039A000B6CD8CE191E09093500280934F028091CC\r\n:1039B0006E0290916F02009711F00C94F11D089522\r\n:1039C000052E97FB1EF400940E94F71C57FD07D0AC\r\n:1039D0000E94121D07FC03D04EF40C94F71C509566\r\n:1039E0004095309521953F4F4F4F5F4F08959095EB\r\n:1039F0008095709561957F4F8F4F9F4F08950E94DE\r\n:103A0000341DA59F900DB49F900DA49F800D911D16\r\n:103A100011240895B7FF0C94FF1C0E94FF1C821B09\r\n:103A2000930B0895A1E21A2EAA1BBB1BFD010DC02A\r\n:103A3000AA1FBB1FEE1FFF1FA217B307E407F5075E\r\n:103A400020F0A21BB30BE40BF50B661F771F881F3A\r\n:103A5000991F1A9469F760957095809590959B01D0\r\n:103A6000AC01BD01CF010895A29FB001B39FC00179\r\n:103A7000A39F700D811D1124911DB29F700D811D9A\r\n:103A80001124911D0895991B79E004C0991F961780\r\n:103A900008F0961B881F7A95C9F780950895EE0F58\r\n:103AA000FF1F0590F491E02D09940F931F93CF937E\r\n:103AB000DF938230910510F482E090E0E091910272\r\n:103AC000F091920230E020E0B0E0A0E0309799F46D\r\n:103AD0002115310509F44AC0281B390B2430310562\r\n:103AE000D8F58A819B816115710589F1FB0193836A\r\n:103AF0008283FE0111C040815181028113814817E8\r\n:103B00005907E0F04817590799F4109761F0129699\r\n:103B10000C93129713961C933296CF01DF91CF919D\r\n:103B20001F910F9108950093910210939202F4CF88\r\n:103B30002115310551F04217530738F0A901DB0177\r\n:103B40009A01BD01DF01F801C1CFEF01F9CF9093D8\r\n:103B5000920280939102CDCFFE01E20FF31F819379\r\n:103B600091932250310939832883D7CF20918F0236\r\n:103B700030919002232B41F42091020130910301F6\r\n:103B80003093900220938F02209100013091010127\r\n:103B90002115310541F42DB73EB7409104015091F4\r\n:103BA0000501241B350BE0918F02F0919002E21782\r\n:103BB000F307A0F42E1B3F0B2817390778F0AC0150\r\n:103BC0004E5F5F4F2417350748F04E0F5F1F50932D\r\n:103BD000900240938F02819391939FCFF0E0E0E0B9\r\n:103BE0009CCFCF93DF930097E9F0FC0132971382CB\r\n:103BF0001282A0919102B0919202ED0130E020E09A\r\n:103C00001097A1F420813181820F931F20918F02A0\r\n:103C1000309190022817390709F061C0F0939002A3\r\n:103C2000E0938F02DF91CF910895EA01CE17DF076D\r\n:103C3000E8F54A815B819E0141155105B1F7E90123\r\n:103C4000FB83EA8349915991C40FD51FEC17FD07F7\r\n:103C500061F4808191810296840F951FE901998317\r\n:103C60008883828193819B838A83F0E0E0E01296CF\r\n:103C70008D919C9113970097B9F52D913C911197D7\r\n:103C8000CD010296820F931F20918F0230919002F6\r\n:103C90002817390739F6309751F510929202109291\r\n:103CA0009102B0939002A0938F02BCCFD383C283C2\r\n:103CB00040815181840F951FC817D90761F44E5F69\r\n:103CC0005F4F88819981480F591F518340838A81B2\r\n:103CD0009B81938382832115310509F0B0CFF09346\r\n:103CE0009202E09391029ECFFD01DC01C0CF1382CE\r\n:103CF0001282D7CF81E090E0F8940C94861EDC010C\r\n:103D000001C06D9341505040E0F7089515E0C5E4BF\r\n:103D1000D5E004C0FE010E944F1D2196C634D10794\r\n:063D2000C9F7F894FFCF83\r\n:103D2600000093028000000000009D117011201415\r\n:103D3600700569115611471100000000120B470665\r\n:103D46002014DB0F1B087005C60E940DB00DA40DD4\r\n:103D56002E0F7005D608CA138B07D407DD0CC00CCE\r\n:043D6600480CE90B11\r\n:00000001FF\r\n",
  "919265f2d71965d29f5325cc2d44a55594d1be7d76c7c6153a5d8a2c0486c053": ":100000000C9446050C946E050C946E050C946E05CC\r\n:100010000C946E050C946E050C946E050C946E0594\r\n:100020000C946E050C946E050C946E050C94701770\r\n:100030000C946E050C946E050C946E050C946E0574\r\n:100040000C9426170C946E050C946E050C946E059A\r\n:100050000C946E050C946E050C946E050C946E0554\r\n:100060000C942C180C946E05000000002300260050\r\n:1000700029002200FF2100000000003E5B4F5B3E94\r\n:100080003E6B4F6B3E1C3E7C3E1C183C7E3C181C5D\r\n:10009000577D571C1C5E7F5E1C00183C1800FFE754\r\n:1000A000C3E7FF0018241800FFE7DBE7FF30483AFA\r\n:1000B000060E2629792926407F050507407F05255C\r\n:1000C0003F5A3CE73C5A7F3E1C1C08081C1C3E7FE4\r\n:1000D00014227F22145F5F005F5F06097F017F00AB\r\n:1000E0006689956A606060606094A2FFA2940804CB\r\n:1000F0007E040810207E201008082A1C08081C2AEC\r\n:1001000008081E101010100C1E0C1E0C30383E3843\r\n:1001100030060E3E0E06000000000000005F0000EA\r\n:100120000007000700147F147F14242A7F2A12235B\r\n:100130001308646236495620500008070300001C6B\r\n:100140002241000041221C002A1C7F1C2A08083E74\r\n:100150000808008070300008080808080000606087\r\n:100160000020100804023E5149453E00427F4000F5\r\n:1001700072494949462141494D331814127F1027CD\r\n:10018000454545393C4A494931412111090736491C\r\n:10019000494936464949291E0000140000004034F0\r\n:1001A00000000008142241141414141400412214F5\r\n:1001B0000802015909063E415D594E7C1211127C1C\r\n:1001C0007F494949363E414141227F4141413E7F7D\r\n:1001D000494949417F090909013E414151737F085D\r\n:1001E00008087F00417F41002040413F017F081403\r\n:1001F00022417F404040407F021C027F7F04081064\r\n:100200007F3E4141413E7F090909063E4151215E41\r\n:100210007F09192946264949493203017F01033FD5\r\n:100220004040403F1F2040201F3F4038403F631464\r\n:1002300008146303047804036159494D43007F4166\r\n:1002400041410204081020004141417F04020102A3\r\n:1002500004404040404000030708002054547840C8\r\n:100260007F284444383844444428384444287F385C\r\n:100270005454541800087E090218A4A49C787F08DE\r\n:1002800004047800447D40002040403D007F102859\r\n:10029000440000417F40007C047804787C0804041A\r\n:1002A000783844444438FC1824241818242418FCB2\r\n:1002B0007C08040408485454542404043F44243C57\r\n:1002C0004040207C1C2040201C3C4030403C4428C6\r\n:1002D0001028444C9090907C4464544C4400083660\r\n:1002E00041000000770000004136080002010204CE\r\n:1002F000023C2623263C1EA1A161123A4040207AEE\r\n:100300003854545559215555794122545478422135\r\n:100310005554784020545579400C1E52721239556C\r\n:100320005555593954545459395554545800004569\r\n:100330007C410002457D420001457C407D12111246\r\n:100340007DF0282528F07C545545002054547C54D9\r\n:100350007C0A097F4932494949323A4444443A3295\r\n:100360004A4848303A4141217A3A42402078009D3B\r\n:10037000A0A07D3D4242423D3D4040403D3C24FFE7\r\n:100380002424487E4943662B2FFC2F2BFF0929F696\r\n:1003900020C0887E090320545479410000447D41E7\r\n:1003A0003048484A32384040227A007A0A0A727D40\r\n:1003B0000D19317D2629292F28262929292630485B\r\n:1003C0004D4020380808080808080808382F10C8C9\r\n:1003D000ACBA2F102834FA00007B000008142A144D\r\n:1003E0002222142A14085500550055AA55AA55AAC8\r\n:1003F000FF55FF55FF000000FF00101010FF001414\r\n:100400001414FF001010FF00FF1010F010F014146F\r\n:1004100014FC001414F700FF0000FF00FF1414F494\r\n:1004200004FC141417101F10101F101F1414141F95\r\n:1004300000101010F0000000001F101010101F100E\r\n:10044000101010F010000000FF101010101010100D\r\n:100450001010FF10000000FF140000FF00FF00005C\r\n:100460001F10170000FC04F414141710171414F4D0\r\n:1004700004F40000FF00F714141414141414F7000B\r\n:10048000F7141414171410101F101F141414F4145C\r\n:100490001010F010F000001F101F0000001F1400CB\r\n:1004A0000000FC140000F010F01010FF10FF1414F6\r\n:1004B00014FF141010101F00000000F010FFFFFFC9\r\n:1004C000FFFFF0F0F0F0F0FFFFFF0000000000FF82\r\n:1004D000FF0F0F0F0F0F3844443844FC4A4A4A3488\r\n:1004E0007E02020606027E027E026355494163389F\r\n:1004F00044443C04407E201E2006027E020299A550\r\n:10050000E7A5991C2A492A1C4C7201724C304A4DAD\r\n:100510004D303048784830BC625A463D3E494949E2\r\n:10052000007E0101017E2A2A2A2A2A44445F44448B\r\n:1005300040514A444040444A51400000FF0103E01A\r\n:1005400080FF000008086B6B083612362436060F51\r\n:10055000090F06000018180000001010003040FFBE\r\n:100560000101001F01011E00191D1712003C3C3C37\r\n:100570003C0000000000000103070F1F3F7F0080C8\r\n:10058000C0E0F0F8FCFEDB40A4A62EAF2000A1C81E\r\n:10059000D300408DAED580A80000600000000000B0\r\n:1005A000000000000000000000E00000000000006B\r\n:1005B0000000000000000001E0000000000000005A\r\n:1005C00000000000000001F000000000000000003A\r\n:1005D000000000000003F000000000000000000028\r\n:1005E0000000000007F00000000000000000000014\r\n:1005F00000000007F80000000000000000000000FC\r\n:1006000000000FF800000003C0007E000001E000C1\r\n:100610007F0FF800000003C000FE000001E000FFB3\r\n:10062000EFF800000003C000FE000001E000FFFF43\r\n:10063000F800000003C000F00000000F007FFE7F04\r\n:10064000C0000003C000F00000000F003FFE7FF874\r\n:100650003FF1FBCFFCFEF3BC3DEFE01FFE7FFF7FD1\r\n:10066000FBFFDFFEFEFFBC3DEFE01FC6FFFF7FFB91\r\n:10067000FFDFFEFEFFBC3DEFE00FE3C7FE787BC36C\r\n:10068000DE1EF0FFBC3DEF0007FF87FC787BC3DE7A\r\n:100690001EF0F83C3DEF0001FFFFF0007BC3C01EE1\r\n:1006A000F0F03C3DEF0001F37FE03FFBC3CFFEF0F5\r\n:1006B000F03C3DEF0003E33F807FFBC3DFFEF0F043\r\n:1006C0003C3DEF0007E73C00787BC3DE1EF0F03CCA\r\n:1006D0003DEF0007FFBE00787BC3DE1EF0F03C3D1F\r\n:1006E000EF0007FFFE00787BC3DE1EF0F03C3DEF1D\r\n:1006F000000FFFFE007FFBFFDFFEF0F03FFDEFE0AD\r\n:100700000FFFFF007FFBFFDFFEF0F03FFDEFE00F8C\r\n:10071000F9FF003E79F9CF9EF0F01F3DE7E01FF1B1\r\n:10072000FF0000000000000000000000001F80FF2C\r\n:10073000007FFFFFFFFFFFFFFFFFFFE01C007F00C8\r\n:100740007FFFFFFFFEB46D888D18E000001F007F63\r\n:10075000FFFFFFFE95AD7DB577E000000F007FFF46\r\n:10076000FFFFFEA5AD9D8D19E0000006007FFFFF95\r\n:10077000FFFEB5ADEDB57EE0000000000001800099\r\n:1007800000000000000000000380000000000000E6\r\n:1007900000000007C000000000000000000007C0CB\r\n:1007A0000000000000000000000FC000000000007A\r\n:1007B000000000001FE00000000000000000001F1B\r\n:1007C000E00000000000000000003FE0000000002A\r\n:1007D00000000000003FF0000000000000000000EA\r\n:1007E0007FF0000000000000001FF87FF000000014\r\n:1007F000000000003FFE7FF0000000000000003F0E\r\n:10080000FF7FF0000000000000001FFFFBE0000081\r\n:1008100000000000000FFFF9FFC000000000000012\r\n:100820000FFFF9FFF800000000000007FFF1FFFFD5\r\n:1008300000000000000003FC73FFFF8000000000C8\r\n:100840000001FE3FFFFF80000000000000FF1E0FC0\r\n:10085000FF000000000000007FFE1FFC0000000001\r\n:100860000000003FFFFFF8000000000000000FDF65\r\n:10087000FFE0000000000000001F19FFC0000000A2\r\n:10088000000000003F3CFF00000000000000007E70\r\n:100890007CF800000000000000007FFE7C000000EB\r\n:1008A0000000000000FFFFFC00000000000000004E\r\n:1008B000FFFFFE0000000000000000FFFFFE000040\r\n:1008C000000000000001FFEFFE000000000000003B\r\n:1008D00001FFCFFE0000000000000003FF07FE0044\r\n:1008E00000000000000003FC07FE00000000000004\r\n:1008F0000003F003FE00000000000000018000FE85\r\n:10090000000000000000000000007E000000000069\r\n:1009100000000000003E0000000000000000000099\r\n:100920000C000000000000078000FC000003C00075\r\n:100930000000078001FC000003C0000000078001E8\r\n:10094000FC000003C0000000078001E00000001E62\r\n:10095000000000078001E00000001E007FE3F79F19\r\n:10096000F9FDE7787BDFC0FFF7FFBFFDFDFF787B78\r\n:10097000DFC0FFF7FFBFFDFDFF787BDFC0F0F7872B\r\n:10098000BC3DE1FF787BDE00F0F787BC3DE1F0780D\r\n:100990007BDE0000F787803DE1E0787BDE007FF7BB\r\n:1009A000879FFDE1E0787BDE00FFF787BFFDE1E098\r\n:1009B000787BDE00F0F787BC3DE1E0787BDE00F07D\r\n:1009C000F787BC3DE1E0787BDE00F0F787BC3DE1D6\r\n:1009D000E0787BDE00FFF7FFBFFDE1E07FFBDFC0DB\r\n:1009E000FFF7FFBFFDE1E07FFBDFC07CF3F39F3D3E\r\n:1009F000E1E03E7BCFC000000000000000000000EE\r\n:100A000000FFFFFFFFFFFFFFFFFFFFC0FFFFFFFF34\r\n:100A1000FD68DB111A31C0FFFFFFFFFD2B5AFB6A97\r\n:100A2000EFC0FFFFFFFFFD4B5B3B1A33C0FFFFFF33\r\n:100A3000FFFD6B5BDB6AFDC00000000024002700A7\r\n:100A40002A0000000000250028002B0004040404F4\r\n:100A50000404040402020202020203030303030368\r\n:100A60000102040810204080010204081020010245\r\n:100A70000408102000000008000201000003040721\r\n:100A80000000000000000000AB197B1D11241FBEF8\r\n:100A9000CFEFD8E0DEBFCDBF11E0A0E0B1E0EAE7E4\r\n:100AA000FEE302C005900D92A434B107D9F722E00D\r\n:100AB000A4E4B1E001C01D92A339B207E1F715E04B\r\n:100AC000C5E4D5E004C02197FE010E94F91DC4349D\r\n:100AD000D107C9F70E94211A0C94301F0C94000012\r\n:100AE000089590E0FC01EC58F54F2491FC01E05A88\r\n:100AF000F54F3491FC01E45BF54FE491EE23C9F02E\r\n:100B0000222339F0233001F1A8F4213019F12230E9\r\n:100B100029F1F0E0EE0FFF1FEE5BF54FA591B491C8\r\n:100B20008FB7F894EC91611126C030953E233C9329\r\n:100B30008FBF08952730A9F02830C9F0243049F735\r\n:100B4000809180008F7D03C0809180008F7780939B\r\n:100B50008000DFCF84B58F7784BDDBCF84B58F7DF8\r\n:100B6000FBCF8091B0008F778093B000D2CF80917F\r\n:100B7000B0008F7DF9CF3E2BDACFCF93DF9390E09B\r\n:100B8000FC01E05AF54F2491845B954FFC01849160\r\n:100B90008823D1F090E0880F991FFC01E85CF54FA5\r\n:100BA000A591B491FC01EE5BF54FC591D491611113\r\n:100BB0000EC09FB7F8948C91E22FE0958E238C9312\r\n:100BC0002881E223E8839FBFDF91CF9108958FB7FB\r\n:100BD000F894EC91E22BEC938FBFF6CFE82FF0E086\r\n:100BE000EC58F54FE491E33011F138F4E130A9F01D\r\n:100BF000E230C1F061E00C947105E73011F1E830AA\r\n:100C000041F1E430B9F780918000806280938000E8\r\n:100C100070938B0060938A00089584B5806884BDCA\r\n:100C200067BD089584B5806284BD68BD08958091D4\r\n:100C300080008068809380007093890060938800B2\r\n:100C400008958091B00080688093B0006093B300F5\r\n:100C500008958091B00080628093B0006093B400EA\r\n:100C600008953FB7F8948091260290912702A091B1\r\n:100C70002802B091290226B5A89B05C02F3F19F084\r\n:100C80000196A11DB11D3FBFBA2FA92F982F88270C\r\n:100C9000BC01CD01620F711D811D911D42E0660FE7\r\n:100CA000771F881F991F4A95D1F708958F929F92B9\r\n:100CB000AF92BF92CF92DF92EF92FF924B015C0115\r\n:100CC0000E9431066B017C010E9431066C197D097E\r\n:100CD0008E099F09683E734081059105A8F321E0C4\r\n:100CE000821A9108A108B10888EEC80E83E0D81EC8\r\n:100CF000E11CF11C81149104A104B10429F7FF90B7\r\n:100D0000EF90DF90CF90BF90AF909F908F9008951D\r\n:100D100008950895AF92BF92CF92DF92EF92FF9223\r\n:100D20000F931F93CF93DF936C017B018B01040F13\r\n:100D3000151FEB015E01AE18BF08C017D10759F0AF\r\n:100D40006991D601ED91FC910190F081E02DC601F1\r\n:100D50000995892B79F7C501DF91CF911F910F91EB\r\n:100D6000FF90EF90DF90CF90BF90AF900895EF92FB\r\n:100D7000FF920F931F93CF93DF93EC01EC80FD80E4\r\n:100D80006E157F050CF070C057FF04C0240F351F8F\r\n:100D900050E040E08E819F81FA01E20FF31F8E1731\r\n:100DA0009F071CF49C01241B350B121613060CF034\r\n:100DB0005BC0922F842F8695869586958E9DD00157\r\n:100DC0008F9DB00D11246A0F7B1FAF8DB8A1A60FA8\r\n:100DD000B71F477049F188E0841B482F682F70E0E7\r\n:100DE000FB01E258FA4FE491281708F063C0621B38\r\n:100DF00071092FEF30E002C0359527956A95E2F72B\r\n:100E0000E2230130110539F0B0F10230110561F52E\r\n:100E10008C91E82702C08C91E82BEC93941720F179\r\n:100E20002C813D81A20FB31FE92FE41BE83078F03D\r\n:100E30000230110521F58E2F9C9190959C932C8169\r\n:100E40003D81A20FB31F88508830B0F7E770EE23C2\r\n:100E500059F0F0E0EA58FA4FE49101301105F9F049\r\n:100E600010F10230110519F1DF91CF911F910F910F\r\n:100E7000FF90EF900895E0958C91E823CECF81E02C\r\n:100E80000115110509F480E081959E2F8C932C812A\r\n:100E90003D81A20FB31F98509830C0F7D7CF8C91E7\r\n:100EA000E82BEC93E1CFE0958C91E823FACF8C917D\r\n:100EB000E827F7CF0130110509F4ADCFE0F2023099\r\n:100EC000110509F4A5CFAE0DBF1DAECF0F931F9333\r\n:100ED000CF93DF9377FF04C0260F371F70E060E0E9\r\n:100EE000DC011496CD91DC91FB01E20FF31FCE17CC\r\n:100EF000DF071CF49E01261B370B121613064CF558\r\n:100F0000FA0157FD3796A3E0F595E795AA95E1F725\r\n:100F1000EC9FD001ED9FB00DFC9FB00D11246A0F26\r\n:100F20007B1FDC015F96ED91FC91E60FF71F477088\r\n:100F3000552781E090E001C0880F4A95EAF7482FD5\r\n:100F40000130110559F0A8F02E0F3F1F0230110596\r\n:100F5000E1F0DF91CF911F910F9108952E0F3F1F68\r\n:100F6000E217F307B1F38191DF011197842B8C9382\r\n:100F7000F7CF80952E0F3F1FE217F30751F39191A2\r\n:100F8000DF01119798239C93F7CFE217F30709F33A\r\n:100F90008191DF01119784278C93F7CF0F931F93D3\r\n:100FA000FA01DC0156964C9156974230E9F04330F5\r\n:100FB000A1F1413061F514964D915C91DA01AE1BBF\r\n:100FC000BF0BFD01E21BF30B77FD0BC0DC01169696\r\n:100FD0004D915C916417750724F4AB01BF010E9429\r\n:100FE00066071F910F91089514964D915C91DA0157\r\n:100FF000A61BB70BBD0161507109DC0116964D911E\r\n:101000005C91DA01AE1BBF0BFD01E21BF30B77FD18\r\n:10101000E8CFAF010E94B706E4CF16964D915C91E0\r\n:10102000DA01A61BB70BBD0161507109CDCF0F933B\r\n:101030001F93FA01DC0156964C9156974230A9F065\r\n:10104000433091F1413019F514964D915C91DA01DC\r\n:10105000AE1BBF0BFD013197F7FD04C0AB01BF0113\r\n:101060000E94B7061F910F91089514964D915C91BF\r\n:10107000DA01A61BB70BBD01DC0116964D915C9100\r\n:10108000DA01AE1BBF0BFD013197621B730BF7FD3D\r\n:10109000E9CFDC0116964D915C91E417F50714F742\r\n:1010A000AF010E946607DECF16964D915C91DA0182\r\n:1010B000A61BB70BBD01621B730BCECFFC0177FDE6\r\n:1010C00064C080859185681779070CF05EC057FD74\r\n:1010D0005CC082859385481759070CF056C08689F5\r\n:1010E0008230B1F0833029F1813041F484819581DF\r\n:1010F000841B950BAB01BC01615071092130310596\r\n:1011000009F108F443C02230310509F463C00895A1\r\n:1011100084819581DC01A61BB70BBD01615071096B\r\n:1011200086819781DC01A41BB50BAD0141505109AB\r\n:10113000E5CF86819781861B970BBA01AC014150A0\r\n:101140005109DCCFCA0157FD0796A3E09595879515\r\n:10115000AA95E1F7A481B5818A9F90018B9F300DFC\r\n:101160009A9F300D1124620F731F078CF0A1E02DA0\r\n:10117000E60FF71F4770552721E030E001C0220F2E\r\n:101180004A95EAF78081822B80830895CA0157FD32\r\n:10119000079633E0959587953A95E1F7A481B58157\r\n:1011A0008A9F90018B9F300D9A9F300D1124620F02\r\n:1011B000731F078CF0A1E02DE60FF71F477055272E\r\n:1011C00081E090E001C0880F4A95EAF78095908110\r\n:1011D0008923DACFCA0157FD079623E095958795B5\r\n:1011E0002A95E1F7A481B5818A9F90018B9F300DEC\r\n:1011F0009A9F300D1124620F731F078CF0A1E02D10\r\n:10120000E60FF71F4770552721E030E001C0220F9D\r\n:101210004A95EAF780818227B7CF08958EBD0000F6\r\n:101220000DB407FEFDCF8EB508958CBD9DBD08950C\r\n:101230000895FC016370668B8481958126813781D6\r\n:10124000613039F0633029F09187808733872287B6\r\n:101250000895318720879387828708952F923F9240\r\n:101260004F925F926F927F928F929F92AF92BF92B6\r\n:10127000CF92DF92EF92FF920F931F93CF93DF9362\r\n:10128000CDB7DEB76A970FB6F894DEBF0FBECDBFFD\r\n:101290009A8F898F7A8369834A01D22E18870F83A8\r\n:1012A0003701BC2CDC0159962D913C915A972115A0\r\n:1012B000310509F015C118968D919C911997681701\r\n:1012C00079070CF0D9C11A968D919C91481759074E\r\n:1012D0000CF0D2C14C2C512CB6E0CB9E600D711D90\r\n:1012E00011247C876B87161617060CF0C5C1EA2DF2\r\n:1012F000F0E0FA87E98793E0EE0FFF1F9A95E1F798\r\n:10130000F88BEF87CF01840F951F181619060CF084\r\n:10131000B3C1A98DBA8D58968C91811104C0BFEAD2\r\n:10132000BD1508F4D394A98DBA8DED91FC91119758\r\n:101330000284F385E02DCD010995B5E0DB9EC00167\r\n:101340001124E981FA81FC83EB83312C212C9C014F\r\n:101350002A583F4F388F2F8B4A2D50E05E8B4D8B94\r\n:10136000EF89F88DE20DF31D44919E828D82D12C80\r\n:10137000C12C69817A81620D731D7A8B698B842FF0\r\n:1013800090E09C8B8B8BE98DFA8DA081B18140FF21\r\n:1013900082C0F1E0BF126FC0AF126DC01C96ED911C\r\n:1013A000FC912F813885A4014C0D5D1D69897A89D6\r\n:1013B000898D9A8D0995EB89FC89F595E7954E2FD6\r\n:1013C0005FEFC51AD50A6D817E818D899E89680F70\r\n:1013D000791F7E836D8398E0C916D10481F6AFEF43\r\n:1013E0002A1A3A0AEB81FC81E40DF51DFC83EB839C\r\n:1013F000F5E02F16310409F0B3CF2F81388526157B\r\n:101400003705B9F0A98DBA8DED91FC91B1E0BB1211\r\n:1014100057C0AB1255C069817A816B5F7F4F0088DE\r\n:10142000F189E02D830128E030E0A401898D9A8DB7\r\n:101430000995A98DBA8DED91FC9111970688F789D0\r\n:10144000E02DCD016A960FB6F894DEBF0FBECDBF7A\r\n:10145000DF91CF911F910F91FF90EF90DF90CF9090\r\n:10146000BF90AF909F908F907F906F905F904F90C4\r\n:101470003F902F9009941E96ED91FC91EF80F88497\r\n:1014800009851A8592014D815E816B817C81898DF0\r\n:101490009A8D099590CF2F8138852615370509F447\r\n:1014A0008ACF31E0B31207C0A31205C01C96ED919C\r\n:1014B000FC91930178CF1E96ED91FC917301E0CFE2\r\n:1014C0006B857C85641975090684F785E02D7301A9\r\n:1014D0000F8518899201A401898D9A8D0995A9CF4C\r\n:1014E000F901349645915491F90132968591949180\r\n:1014F000D41AB7E0DB9E800D911D1124F9012591CE\r\n:1015000034913C8B2B8BFC0125903490FC0132965E\r\n:10151000749031963491398B329664903196449020\r\n:1015200041E04C1518F04A1508F07FC0662D062CD6\r\n:10153000000C770B7C836B83842D042C000C990B9F\r\n:101540009E838D83A98DBA8DED91FC9111970284B4\r\n:10155000F385E02DCD010995512CD12CC12CEA2D1C\r\n:10156000F0E0FA87E9872B2D30E03C872B87A40138\r\n:10157000440D511D47FC5A95588F4F8B69817A81D4\r\n:10158000660D711D67FC7A957E876D877989C71610\r\n:1015900008F04FCF2C2D30E04D815E81420F531F5C\r\n:1015A000A985BA854A9FC0014B9F900D5A9F900D07\r\n:1015B0001124FC01E80DF91DF88BEF87852D612CB6\r\n:1015C0004F89588D420F531F5E8B4D8B671408F067\r\n:1015D00050C044244394480E877041F4C1010196E1\r\n:1015E000EB89FC89E20DF31DD4901C01D7FE19C0D4\r\n:1015F000A98DBA8DED91FC91662D70E0B1E0BB1222\r\n:1016000019C0AB1217C02D853E85620F731F04846D\r\n:10161000F585E02D2F8138854D895E89898D9A8DDC\r\n:101620000995DD0C6394842DD1CF1E821D821C820E\r\n:101630001B8288CF4B815C81640F751FAB85BC8595\r\n:101640006A9FC0016B9F900D7A9F900D1124698154\r\n:101650007A81680F791F0684F785E02DEF80F88482\r\n:1016600009851A859D014F855889898D9A8D09951F\r\n:10167000D8CF570CC3948ACF6A960FB6F894DEBFC2\r\n:101680000FBECDBFDF91CF911F910F91FF90EF90D3\r\n:10169000DF90CF90BF90AF909F908F907F906F9092\r\n:1016A0005F904F903F902F9008958F929F92AF92AE\r\n:1016B000CF92EF92FF920F931F93CF93DF93EC01A2\r\n:1016C000262F898D9A8D009709F051C06A30D1F488\r\n:1016D0001D861C868D8948E0849F900111248E858B\r\n:1016E0009F85820F931F9F878E8781E090E0DF9117\r\n:1016F000CF911F910F91FF90EF90CF90AF909F905F\r\n:101700008F9008956D3089F3CC88AD888F898823B8\r\n:10171000C1F08C859D8536E0C39E800D911D1124FE\r\n:10172000488559854817590764F44E855F851D869D\r\n:101730001C8638E0A39EC0011124840F951F9F874B\r\n:101740008E87EA88FB88088919894E855F856C85B4\r\n:101750007D85CE010E942E092C898C859D8546E0D1\r\n:10176000249F800D911D11249D878C87BECF6A30E8\r\n:1017700069F41D861C86FC013896E4912D898E85BE\r\n:101780009F85E29F800D911D1124ADCF6D3009F42E\r\n:10179000ACCFFC0134964591549170E06417750705\r\n:1017A00008F4A3CFFC013696A591B491A617B7070C\r\n:1017B00008F49BCFFC01329685909490362F341B11\r\n:1017C00047E0349F800C911C1124F401329634912F\r\n:1017D0003196E4913323A9F1EE2399F1CC88F401F9\r\n:1017E0003596E491AD884F89442301F10E2E000C0B\r\n:1017F000FF0BE30FF11DCE9EA001CF9E500D1124D3\r\n:101800006C857D85460F571F688579856417750738\r\n:101810006CF44E855F851D861C86FC013896E4912C\r\n:10182000AE9E400D511D11245F874E87EA88FB88CC\r\n:10183000088919894E855F856C857D85CE010E945A\r\n:101840002E09F4013496E4912C898C859D85E29FC4\r\n:10185000800D911D112488CF6F927F928F929F925D\r\n:10186000AF92BF92CF92DF92EF92FF920F931F93AE\r\n:10187000CF93DF93EC016B015A0139014801E881F4\r\n:10188000F9810284F385E02D0995E881F9810288C8\r\n:10189000F389E02D87019301A501B601CE010995D9\r\n:1018A000A501480D591D41505109E881F98102886F\r\n:1018B000F389E02D9301B601CE010995E881F98104\r\n:1018C0000088F189E02D9401A501B601CE010995AA\r\n:1018D000C60CD71CB60161507109E881F9810088F6\r\n:1018E000F189E02D9401A501CE010995E881F981E6\r\n:1018F0000688F789E02DCE01DF91CF911F910F91DE\r\n:10190000FF90EF90DF90CF90BF90AF909F908F901F\r\n:101910007F906F9009946F927F928F929F92AF9277\r\n:10192000BF92CF92DF92EF92FF920F931F93CF93CC\r\n:10193000DF935C01EB016A01490138018701DC0199\r\n:10194000ED91FC916217730719F5641675062CF07A\r\n:10195000962D872D3A01C92ED82E960126193709C2\r\n:101960002F5F3F4F048CF58DE02DA301BE01C50113\r\n:101970000995DF91CF911F910F91FF90EF90DF902C\r\n:10198000CF90BF90AF909F908F907F906F90089571\r\n:101990004615570591F42617370724F0892D4B017A\r\n:1019A000C22FD82F9E01281939092F5F3F4F068C6F\r\n:1019B000F78DE02DA601B401DACF0284F385E02D86\r\n:1019C0000995D501ED91FC910488F589E02D8301FD\r\n:1019D0009401A601BE01C5010995D501ED91FC91C7\r\n:1019E0000688F789E02DC501DF91CF911F910F91F6\r\n:1019F000FF90EF90DF90CF90BF90AF909F908F902F\r\n:101A00007F906F900994EF92FF920F931F93DC01E8\r\n:101A10001A960D911C911B9718962D913C91199730\r\n:101A2000ED91FC9100A0F1A1E02D7B0150E040E0A0\r\n:101A300070E060E009951F910F91FF90EF9008957D\r\n:101A40004F925F926F927F928F929F92AF92BF92CE\r\n:101A5000CF92DF92EF92FF920F931F93CF93DF937A\r\n:101A60006C012B015A0139014801DC01ED91FC9117\r\n:101A70000284F385E02D0995E201640C751CD60102\r\n:101A8000ED91FC91C615D7055CF40088F189E02D35\r\n:101A900087019401A501BE01C60109952196EFCFEA\r\n:101AA0000688F789E02DC601DF91CF911F910F9134\r\n:101AB000FF90EF90DF90CF90BF90AF909F908F906E\r\n:101AC0007F906F905F904F9009948F929F92AF920A\r\n:101AD000BF92CF92DF92EF92FF920F931F93CF931B\r\n:101AE000DF93EC015B014A016901E881F98102841D\r\n:101AF000F385E02D099595012C0D3D1D21503109EF\r\n:101B0000E881F9810488F589E02D78018401A40138\r\n:101B1000B501CE010995E881F9810688F789E02DA4\r\n:101B2000CE01DF91CF911F910F91FF90EF90DF9049\r\n:101B3000CF90BF90AF909F908F9009948F929F927B\r\n:101B4000AF92BF92CF92DF92EF92FF920F931F93CB\r\n:101B5000CF93DF93EC015B014A0169017801E881D1\r\n:101B6000F9810284F385E02D0995C80CD91C860102\r\n:101B700001501109E881F9810488F589E02D95016A\r\n:101B8000A401B501CE010995E881F9810688F7899C\r\n:101B9000E02DCE01DF91CF911F910F91FF90EF903B\r\n:101BA000DF90CF90BF90AF909F908F900994EF926D\r\n:101BB000FF920F931F93DC01ED91FC9100A0F1A126\r\n:101BC000E02D09951F910F91FF90EF9008950F93CD\r\n:101BD0001F93DC01ED91FC91068CF78DE02D0995AA\r\n:101BE0001F910F9108950F931F93DC01ED91FC91CC\r\n:101BF000048CF58DE02D09951F910F9108952F927A\r\n:101C00003F924F925F926F927F928F929F92AF928C\r\n:101C1000BF92CF92DF92EF92FF920F931F93CF93D9\r\n:101C2000DF93CDB7DEB72C970FB6F894DEBF0FBEAB\r\n:101C3000CDBF3C017C836B835C874B8718012701F8\r\n:101C400081E090E05C01A41AB50ACA0191958195E2\r\n:101C50009109AC01440F551F5A834983C80101966D\r\n:101C60009E838D83F12CE12C88248394912C922FD8\r\n:101C700091709F8322702887AB014F5F5F4F5A8717\r\n:101C800049878B859C85E816F9060CF07AC0CB84D1\r\n:101C9000DC84B7FC0CC06C0191E0C91AD108498101\r\n:101CA0005A814E5F5F4F5A834983A40EB51E5FEF82\r\n:101CB000E51AF50A82E0880E911CA80CB91CCE1416\r\n:101CC000DF0464F19F81992399F09601220F331F5D\r\n:101CD0004D815E81240F351F82014B815C814C193F\r\n:101CE0005D09B701660D771D8FE492E00E94F30D48\r\n:101CF0005885552399F09601220F331F8D819E81BF\r\n:101D0000280F391F82014B815C814C195D09B30199\r\n:101D10006E197F098FE492E00E94F30D4B855C857C\r\n:101D20004C155D0559F15F81552391F094012250C6\r\n:101D30003109220D331D820149855A854E195F09EB\r\n:101D40006B857C85660D771D8FE492E00E94F30D14\r\n:101D50008885882399F0940122503109220D331D82\r\n:101D6000B3014B855C85641B750B820149855A85DF\r\n:101D70004E195F098FE492E00E94F30DDC86CB865A\r\n:101D800080CF2C960FB6F894DEBF0FBECDBFDF918B\r\n:101D9000CF911F910F91FF90EF90DF90CF90BF9068\r\n:101DA000AF909F908F907F906F905F904F903F90FB\r\n:101DB0002F900895AF92BF92CF92DF92EF92FF9251\r\n:101DC0000F931F93CF93DF936C015B01EA017901BD\r\n:101DD0009A01220F331F2F5F3F4FAB014C1B5D0B4E\r\n:101DE0008701B6018FE492E00E94F30D10E000E05D\r\n:101DF00023E0AE01B501C6010E94FF0DDF91CF9136\r\n:101E00001F910F91FF90EF90DF90CF90BF90AF9018\r\n:101E10000895DC01ED91FC910084F185E02D099499\r\n:101E20003F924F925F926F927F928F929F92AF926A\r\n:101E3000BF92CF92DF92EF92FF920F931F93CF93B7\r\n:101E4000DF935C017B014A016901390187E0680E7B\r\n:101E5000711C93E0759467949A95E1F72B01400EFD\r\n:101E6000511E10E000E0312CD0E0C0E0CE018770C0\r\n:101E70009927330C892B59F4FE0183E0F595E795FA\r\n:101E80008A95E1F7E00FF11FE80DF91D349037FE58\r\n:101E90000AC021E030E0A701B5016C0F7D1F8FE47F\r\n:101EA00092E00E94090F2196CC16DD06F9F68FEF1D\r\n:101EB000E81AF80A060D171DE414F504A9F6DF91D7\r\n:101EC000CF911F910F91FF90EF90DF90CF90BF9037\r\n:101ED000AF909F908F907F906F905F904F903F90CA\r\n:101EE00008952F923F924F925F926F927F928F92BE\r\n:101EF0009F92AF92BF92CF92DF92EF92FF920F9399\r\n:101F00001F93CF93DF9300D000D000D0CDB7DEB7C2\r\n:101F10003C016A013E832D83FC82EB825801A41AA6\r\n:101F2000B50AB7FE03C0B194A194B1088D809E801C\r\n:101F3000861A970A97FE03C09194819491088A1497\r\n:101F40009B045CF0902F812F0D811E819D838E83D9\r\n:101F50009C2D8D2D6B01692F782F0C151D055CF0C4\r\n:101F60009D818E817E836D83692F782F902F812FA5\r\n:101F70008601C92ED82E1601201A310A2B012D8177\r\n:101F80003E81421A530A57FE03C0519441945108AE\r\n:101F9000710137FE03C03FEFE31AF30AF594E794AB\r\n:101FA0008D819E81861797075CF5A1E0B0E0BA832A\r\n:101FB000A983C016D1064CF1D301ED91FC910484A4\r\n:101FC000F585E02D2B813C81A8016D817E818A14ED\r\n:101FD0009B041CF04D815E81B801C3010995E41892\r\n:101FE000F508F7FE0AC02D813E8189819A81280F6C\r\n:101FF000391F3E832D83E20CF31C0F5F1F4FD9CF97\r\n:102000002FEF3FEF3A832983D4CF26960FB6F8946B\r\n:10201000DEBF0FBECDBFDF91CF911F910F91FF901B\r\n:10202000EF90DF90CF90BF90AF909F908F907F9078\r\n:102030006F905F904F903F902F9008950895CF92AA\r\n:10204000DF92EF92FF92CF93DF93EC01603282E058\r\n:102050007807CCF5653B710514F064EB70E089817D\r\n:1020600028E830E0281B310987FD3395220F331F04\r\n:10207000220F331F6901330FEE08FF088A8128E51C\r\n:1020800032E0281B310987FD3395220F331F220FC1\r\n:10209000331F032E000C440B550B2C193D094E0920\r\n:1020A0005F09DB0177FF02C0B0E0A0E00E94B41D31\r\n:1020B00024EB30E040E050E00E948A1DC20ED31EA7\r\n:1020C000E41EF51EB601E881EC3070F5298188E840\r\n:1020D00090E0821B910927FD9395880F991F880F27\r\n:1020E000991F681779077CF02A8188E592E0821BA6\r\n:1020F000910927FD9395880F991F880F991F6817DD\r\n:1021000079070CF4CB010297880F991F4FB7F89409\r\n:102110002E2F30E0F901EE0FFF1FE20FF31FEA5000\r\n:10212000FE4F928381834FBFDF91CF91FF90EF905D\r\n:10213000DF90CF9008951F93CF93DF93EC01162F7C\r\n:1021400088818C3008F04EC061E0812F0E94BD056F\r\n:102150008881282F30E0F901EE0FFF1FE20FF31FF7\r\n:10216000EA50FE4F1F736081607C612B608319828F\r\n:102170001A822CE0622F0E94ED1D829FB001112473\r\n:1021800030E020E0AB01420F531FFA01EE0FFF1FBA\r\n:10219000E40FF51FEA50FE4F908196FD16C02F5FA9\r\n:1021A0003F4F2C30310571F781110FC01092800024\r\n:1021B00082E0809381001092850010928400B19A91\r\n:1021C00080916F00826080936F00E8818E2F90E095\r\n:1021D000FC01EE0FFF1FE80FF91FEA50FE4F808150\r\n:1021E000806480838881DF91CF911F910895209131\r\n:1021F000AA01260F3327331F21323105ECF4209139\r\n:10220000CE01FC0190E080E0243069F082E0089586\r\n:10221000A091AA012191AC0146575E4FA40FB52FA2\r\n:10222000B11D2C930196861798F38091AA01680F2F\r\n:102230006093AA0180E0089581E008951092CE0194\r\n:1022400081E08093D0011092CF0161E082E10E9491\r\n:10225000710561E083E10E947105E9EBF0E08081A6\r\n:102260008E7F808380818D7F808388E48093B80017\r\n:1022700085E48093BC000895CF93DF9391E0909321\r\n:1022800089018823B9F0C091B800D091BA0080913B\r\n:10229000BC008A7B8093BC0060E082E10E947105F3\r\n:1022A00060E083E10E9471050E941E11D093BA0084\r\n:1022B000C093B800DF91CF910895E0912002809102\r\n:1022C0001F02E81730F4F0E0EC59FE4F808190E0F7\r\n:1022D00008958FEF9FEF08959091200280911F0243\r\n:1022E0002FEF3FEF981748F4E92FF0E0EC59FE4F3D\r\n:1022F000208130E09F5F90932002C9010895809172\r\n:102300001F0290912002891B990B0895CF92DF92B2\r\n:10231000EF92FF920F931F93CF93DF937C01CB013A\r\n:102320008A0120912D02222389F0EB016B01C40E5A\r\n:10233000D51ECC15DD0569F06991D701ED91FC91B1\r\n:102340000190F081E02DC7010995F3CF642F0E9421\r\n:10235000F710C801DF91CF911F910F91FF90EF907F\r\n:10236000DF90CF900895CF93DF931F92CDB7DEB764\r\n:10237000698320912D022223F9F020912A02203234\r\n:1023800058F021E030E0FC013383228390E080E0CC\r\n:102390000F90DF91CF91089580912B02E82FF0E00C\r\n:1023A000EC5BFE4F998190838F5F80932B0280932B\r\n:1023B0002A0281E090E0ECCF61E0CE0101960E941C\r\n:1023C000F710F7CFCF92DF92EF92FF920F931F9308\r\n:1023D000CF93DF93D0912A0281E0D13208F09CC0E4\r\n:1023E000C0912C020E9431066B017C018091CE01CC\r\n:1023F00081116CC082E08093CE0181E08093D00196\r\n:102400008FEF8093CD011092F201D093F101A4E4FB\r\n:10241000B1E0E1EDF1E080E0D8138DC01092F3015E\r\n:102420008091F301CC0FC82BC093F3018091CF01B1\r\n:10243000813009F084C01092CF010E9431066B01F7\r\n:102440007C018091F3018093BB0080918501909184\r\n:102450008601A0918701B0918801892B8A2B8B2B53\r\n:10246000A1F00E9431060091850110918601209112\r\n:102470008701309188016C197D098E099F09061723\r\n:1024800017072807390708F442C08091BC0083FD74\r\n:10249000D8CF85EC8093BC000E9431066B017C0193\r\n:1024A0008091CE01823009F44CC08091CD018F3FE4\r\n:1024B00009F469C08091CD01803209F466C0809131\r\n:1024C000CD01803309F463C084E026C0809185018A\r\n:1024D00090918601A0918701B0918801892B8A2B68\r\n:1024E0008B2B09F483CF0E94310600918501109156\r\n:1024F000860120918701309188016C197D098E0930\r\n:102500009F09061717072807390708F06FCF809132\r\n:1025100084010E943C1185E010922B0210922A0245\r\n:1025200010922D02DF91CF911F910F91FF90EF90AC\r\n:10253000DF90CF9008959D9191938F5F6DCF85EE41\r\n:10254000A9CF8091850190918601A0918701B091DA\r\n:102550008801892B8A2B8B2B09F4A2CF0E9431068C\r\n:1025600000918501109186012091870130918801A9\r\n:102570006C197D098E099F09061717072807390767\r\n:1025800008F08ECFC4CF80E0C7CF82E0C5CF83E014\r\n:10259000C3CFEF92FF920F931F93CF93DF937C01F2\r\n:1025A000C62F80916C0290916D02009709F459C07A\r\n:1025B0002091700231E030932D0220932C02109272\r\n:1025C0002B0210922A02DC01ED91FC910190F08126\r\n:1025D000E02D60E009958701EE24E394F12CD1E031\r\n:1025E000C15080916C0290916D02CF3F91F1B0E2A9\r\n:1025F000EB16F104D8F00E94E21180916C029091E8\r\n:102600006D0220917002D0932D0220932C02109223\r\n:102610002B0210922A02DC01ED91FC910190F081D5\r\n:10262000E02D60E00995EE24E394F12C80916C029A\r\n:1026300090916D02F8016491DC01ED91FC910190A3\r\n:10264000F081E02D0995BFEFEB1AFB0A0F5F1F4FDA\r\n:10265000C7CFDF91CF911F910F91FF90EF900C9416\r\n:10266000E211E0917C02F0917D02908180918202E2\r\n:102670008095892380838701C15008F438C0F80110\r\n:10268000849120916A0230916B02232B29F00E94E1\r\n:102690000E090F5F1F4FF0CF28E030E040E8E091D7\r\n:1026A0007802F091790290918002582F5423D9F04A\r\n:1026B0005081952B9083E0917A02F0917B0290817A\r\n:1026C00050918102952B9083E0917A02F0917B02E8\r\n:1026D0005081909181029095952390834695215049\r\n:1026E0003109E9F6D6CF508190959523E3CFDF915C\r\n:1026F000CF911F910F91FF90EF9008951F93CF936B\r\n:10270000DF93EC018D8D9E8D009721F1162F29A16D\r\n:1027100031E030932D0220932C0210922B02109264\r\n:102720002A02DC01ED91FC910190F081E02D60E046\r\n:1027300009958D8D9E8DDC01ED91FC910190F081CC\r\n:10274000E02D612F09958D8D9E8DDF91CF911F9189\r\n:102750000C94E211ADA5BEA59C918BA9809589230F\r\n:102760008C938B8D9C8D892B31F0862FDF91CF91AF\r\n:102770001F910C940E0928E030E080E8A9A5BAA5C5\r\n:1027800099A9462F4823C1F04C91942B9C93ABA55B\r\n:10279000BCA59C914AA9942B9C93ABA5BCA54C913C\r\n:1027A0009AA9909594239C9386952150310931F7ED\r\n:1027B000DF91CF911F9108954C9190959423E6CF8E\r\n:1027C0001F93CF93DF93EC01162F8D8D9E8D892B58\r\n:1027D000B1F12DA93EA94FA958AD60E074E284EF94\r\n:1027E00090E00E94BC1D20513109410951095695C4\r\n:1027F0004795379527952093B80066EA111167EA47\r\n:10280000CE010E947E138D8D9E8D892B41F129ADC5\r\n:102810003AAD4BAD5CAD60E074E284EF90E00E94B5\r\n:10282000BC1D2051310941095109569547953795ED\r\n:1028300027952093B800DF91CF911F9108958B8D3C\r\n:102840009C8D892B21F08EAD9FAD0E941509EFA5BF\r\n:10285000F8A990818CA9809589238083CECFEFA59C\r\n:10286000F8A980819CA9892B8083E5CF90E080E046\r\n:102870000895CF93DF93EC01BC018DE392E00E94B9\r\n:102880001F1064EB70E06C1B7D0B8AE392E0DF911C\r\n:10289000CF910C941F10BC0180E492E00E941F10A5\r\n:1028A0006CE271E080E090E00C9456061F93CF93A9\r\n:1028B000DF93D82FC62F682F84E00E94710511E0A6\r\n:1028C0006D2F612787E00E9471056C2F88E00E94C0\r\n:1028D00071056C2F61278CE00E94710561E085E035\r\n:1028E0000E94BD0568EC70E085E00E94EE0561E0A5\r\n:1028F00086E00E94BD0568EC70E086E0DF91CF9134\r\n:102900001F910C94EE0560E084E00E94710560E088\r\n:1029100087E00E94710560E088E00E94710560E038\r\n:102920008CE00E94710561E085E00E94BD0561E0D8\r\n:1029300085E00E94710561E086E00E94BD0561E0CE\r\n:1029400086E00C9471052091550230915602C90120\r\n:10295000079697FD079623E0959587952A95E1F7C9\r\n:102960002091530230915402829FA001839F500D09\r\n:10297000929F500D112470E060E080916E02909162\r\n:102980006F020C94291FDF92EF92FF920F931F9317\r\n:10299000CF93DF938C01C6E0D0E08230910531F017\r\n:1029A000CAEFDFEF039711F0D0E0C0E00E94A3145C\r\n:1029B00021E030E00130110509F0E6C042E150E0CD\r\n:1029C00068E170E086E290E00E94DA0E21E030E0FB\r\n:1029D00042E150E068E170E08AE590E00E94DA0EA2\r\n:1029E00030E020E044E050E068E170E086E290E012\r\n:1029F0000E94DA0E30E020E044E050E068E170E050\r\n:102A00008AE590E00E94DA0E21E030E048E050E0F4\r\n:102A100064E370E080E490E00E94DA0E30E020E0B1\r\n:102A200044E050E064E370E080E490E00E94DA0E5D\r\n:102A300080916C0290916D02892B09F4F0C0209175\r\n:102A4000840230918502409186025091870260E0B5\r\n:102A500074E284EF90E00E94BC1D205131094109CD\r\n:102A6000510956954795379527952093B80064E00E\r\n:102A700082E790E00E94C912809153029091540223\r\n:102A80008034910509F0E2C060E28FE492E00E9498\r\n:102A90007E1360915302615E8FE492E00E947E1388\r\n:102AA0002091550230915602C901079697FD07966D\r\n:102AB00033E0959587953A95E1F72091530230914F\r\n:102AC0005402829F8001839F100D929F100D11244C\r\n:102AD000C0916E02D0916F0280916C0290916D0254\r\n:102AE0000C0F1D1F009709F4E3C02091700231E024\r\n:102AF00030932D0220932C0210922B0210922A0266\r\n:102B0000DC01ED91FC910190F081E02D60E40995EC\r\n:102B1000EE24E394F12CDD24D39480916C02909107\r\n:102B20006D020C171D0709F49AC0B0E2EB16F10410\r\n:102B3000D8F00E94E21180916C0290916D02209178\r\n:102B40007002D0922D0220932C0210922B02109230\r\n:102B50002A02DC01ED91FC910190F081E02D60E40E\r\n:102B60000995EE24E394F12C80916C0290916D0212\r\n:102B70006991DC01ED91FC910190F081E02D0995C6\r\n:102B8000BFEFEB1AFB0AC9CF4FE050E068E170E0FD\r\n:102B900086E290E00E94DA0E21E030E04FE050E063\r\n:102BA00068E170E08AE590E00E94DA0E30E020E013\r\n:102BB00046E050E068E170E0CE0186960E94DA0EB1\r\n:102BC00030E020E046E050E068E170E0CE01865A57\r\n:102BD0009F4F0E94DA0EEE24E394F12C08E010E0FF\r\n:102BE00028E230E042E350E06CE270E08FE492E0F3\r\n:102BF0000E94D70D0FEF1FEF21E044E050E066E3A5\r\n:102C000070E083E590E00E94FF0D22E044E050E098\r\n:102C100066E370E08CE290E00E94FF0D09CF8091A6\r\n:102C20006A0290916B02892B31F080918D02909114\r\n:102C30008E020E941509E0917E02F0917F02908140\r\n:102C40008091830280958923808311CF60E08FE497\r\n:102C500092E00E947E136091530261501DCF0E944A\r\n:102C6000E21180916C0290916D02892B09F461C090\r\n:102C7000209188023091890240918A0250918B0202\r\n:102C800060E074E284EF90E00E94BC1D20513109A5\r\n:102C90004109510956954795379527952093B800D6\r\n:102CA000DF91CF911F910F91FF90EF90DF900895EA\r\n:102CB000E0917C02F0917D02808190918202892BCB\r\n:102CC00080830C171D0769F2899120916A02309167\r\n:102CD0006B02232B19F00E940E09F3CF28E030E09D\r\n:102CE00040E8E0917802F091790290918002582FAB\r\n:102CF0005423D9F05081952B9083E0917A02F09182\r\n:102D00007B02908150918102952B9083E0917A0211\r\n:102D1000F0917B0250819091810290959523908350\r\n:102D2000469521503109E9F6CCCF508190959523F5\r\n:102D3000E3CFE0917E02F0917F0280819091830247\r\n:102D4000892B8083ADCF0E94241F85ED8093BC002A\r\n:102D50008091850190918601A0918701B0918801B1\r\n:102D60000796A11DB11D23E0B695A7959795879568\r\n:102D70002A95D1F72091BC0024FD03C01092CE010A\r\n:102D8000089540918501509186016091870170916D\r\n:102D90008801452B462B472B69F30097A105B10508\r\n:102DA00041F02AE22A95F1F700C00197A109B10983\r\n:102DB000E1CF809184010C943C110F931F9360E04C\r\n:102DC00089E00E94710583E090E00197F1F761E0EE\r\n:102DD00089E00E94710583E290E00197F1F760E0DD\r\n:102DE00089E00E947105EAE6FAE06491E6E5FAE01E\r\n:102DF000E491F0E0EE0FFF1FE859FF4F85919491A9\r\n:102E000008EA11E620E030E0462F0E944B196115D8\r\n:102E1000710581059105A9F06F5F7F4F8F4F9F4F1F\r\n:102E20009F70611571058105910559F02AE330E025\r\n:102E300040E050E00E94BC1DCA01B9011F910F91F2\r\n:102E4000089520E931E040E050E0F6CF1F920F9264\r\n:102E50000FB60F9211242F933F938F939F93AF93AD\r\n:102E6000BF938091220290912302A0912402B091FD\r\n:102E700025023091210223E0230F2D3758F50196CA\r\n:102E8000A11DB11D20932102809322029093230261\r\n:102E9000A0932402B09325028091260290912702EC\r\n:102EA000A0912802B09129020196A11DB11D809325\r\n:102EB000260290932702A0932802B0932902BF9183\r\n:102EC000AF919F918F913F912F910F900FBE0F90D7\r\n:102ED0001F90189526E8230F0296A11DB11DD2CF91\r\n:102EE0001F920F920FB60F9211242F933F934F937F\r\n:102EF0005F936F937F938F939F93AF93BF93CF9382\r\n:102F0000DF93EF93FF938091F401C091F501D0E03E\r\n:102F100087FF24C010928500109284008091F401F4\r\n:102F20008F5F8093F4018091F401082E000C990BBF\r\n:102F30008C179D0724F48091F4018C30C4F18091AA\r\n:102F4000840090918500049680349C4908F47AC0EE\r\n:102F50008091840090918500049676C08091F40160\r\n:102F6000082E000C990B8C179D07C4F6E091F40114\r\n:102F70008E2FEE0F990BFC01EE0FFF1FE80FF91FCC\r\n:102F8000EA50FE4F808186FFC9CFE091F4018E2F79\r\n:102F9000EE0F990BFC01EE0FFF1FE80FF91FEA502F\r\n:102FA000FE4F808160E08F730E947105B7CF209142\r\n:102FB000840030918500E091F4018E2FEE0F990B83\r\n:102FC000FC01EE0FFF1FE80FF91FEA50FE4F818151\r\n:102FD0009281820F931F9093890080938800E091E3\r\n:102FE000F4018E2FEE0F990BFC01EE0FFF1FE80F7F\r\n:102FF000F91FEA50FE4F808186FF11C0E091F40175\r\n:103000008E2FEE0F990BFC01EE0FFF1FE80FF91F3B\r\n:10301000EA50FE4F808161E08F730E947105FF913D\r\n:10302000EF91DF91CF91BF91AF919F918F917F9160\r\n:103030006F915F914F913F912F910F900FBE0F9025\r\n:103040001F90189580E49CE99093890080938800F4\r\n:103050008FEF8093F401E3CF1F920F920FB60F9280\r\n:1030600011242F933F934F935F936F937F938F938D\r\n:103070009F93AF93BF93EF93FF938091B900887FA5\r\n:10308000803609F44AC0F0F5883209F4A7C018F573\r\n:10309000803109F49BC0B8F4882309F4F9C0883062\r\n:1030A00009F494C0FF91EF91BF91AF919F918F91DF\r\n:1030B0007F916F915F914F913F912F910F900FBE34\r\n:1030C0000F901F901895883109F488C0803251F70D\r\n:1030D0008093CD0114C0803409F49DC040F4803346\r\n:1030E000B9F38833F9F68093CD0185ECB0C0803513\r\n:1030F00009F485C0883509F496C0883499F60E9491\r\n:10310000A516D0CF883909F48CC038F5883729F056\r\n:1031100050F4883611F0803729F683E08093CE0191\r\n:103120001092CC0157C0883809F47BC0803919F05F\r\n:10313000803809F0B7CF8091CC01803208F071C09F\r\n:10314000E091CC0181E08E0F8093CC018091BB0097\r\n:10315000F0E0E455FE4F80833DC0803B39F0E0F461\r\n:10316000803A09F479C0883A09F09CCF84E08093D2\r\n:10317000CE011092AB011092AA01E0911D02F091D4\r\n:103180001E0209958091AA0181110FC081E08093F0\r\n:10319000AA0110928A0109C0803C09F4A6CF883C9C\r\n:1031A00009F4A3CF883B09F07DCFE091AB0181E02A\r\n:1031B0008E0F8093AB01F0E0E657FE4F8081809345\r\n:1031C000BB009091AB018091AA0129C08091F301CD\r\n:1031D0008093BB0085EC8093BC0064CF9091F2019A\r\n:1031E0008091F101981758F5E091F20181E08E0F7E\r\n:1031F0008093F201F0E0EF52FE4F8081E9CFE09141\r\n:10320000F20181E08E0F8093F2018091BB00F0E02B\r\n:10321000EF52FE4F80839091F2018091F101981757\r\n:10322000C8F285E8D8CFE091F20181E08E0F80935B\r\n:10323000F2018091BB00F0E0EF52FE4F808380915D\r\n:10324000D00181115CCF81E08093CF0184EA80932B\r\n:10325000BC001092CE0126CF85EC8093BC0010926A\r\n:10326000CE018091CC01803230F4E091CC01F0E0CD\r\n:10327000E455FE4F10826091CC0170E0E0911B029A\r\n:10328000F0911C028CEA91E009951092CC010ACFD2\r\n:103290001092CD0134CFCF92DF92EF92FF920F9335\r\n:1032A0001F93E82FF92F05C0015011092109310999\r\n:1032B00061F1908196239417B9F305C0015011096B\r\n:1032C0002109310911F1908196239413F7CFC12C74\r\n:1032D000D12CE12CF12C0AC08FEFC81AD80AE80AC9\r\n:1032E000F80A0C151D052E053F0579F0808186230F\r\n:1032F000841791F36C2D7D2D8E2D9F2D1F910F9195\r\n:10330000FF90EF90DF90CF90089560E070E080E054\r\n:1033100090E01F910F91FF90EF90DF90CF90089574\r\n:10332000FC019091F5019C3098F481E0890F809325\r\n:10333000F5019083892F90E0FC01EE0FFF1FE80F4D\r\n:10334000F91FEA50FE4F88EB9BE09283818308953A\r\n:103350008FEF80830895A3E4B2E013961C921E922F\r\n:10336000129748EE53E060E070E014964D935D9341\r\n:103370006D937C9317978AE091E011969C938E93BE\r\n:10338000EFE4F2E01382128220E830E035832483F8\r\n:1033900080E490E0978386833187208793878287B4\r\n:1033A000168A158614861786168681E0858B848B8F\r\n:1033B0002FEF3FEF338B228B318B208B878B108E3F\r\n:1033C000128E118E8CE191E091838083148E138E86\r\n:1033D000B68FA58F10A2178E8FEF84A385A386A327\r\n:1033E00087A380A780E89AE1A6E0B0E085AB96AB22\r\n:1033F000A7ABB0AF80EA96E8A1E0B0E081AF92AFB2\r\n:10340000A3AFB4AF80E586AF17AE80E492E00E9430\r\n:1034100090198DE392E00E9490198AE392E00E9455\r\n:10342000901987E392E00E94901984E392E00E9451\r\n:10343000901981E392E00E9490198EE292E00C9440\r\n:103440009019789484B5826084BD84B5816084BD10\r\n:1034500085B5826085BD85B5816085BD80916E0032\r\n:10346000816080936E001092810080918100826063\r\n:1034700080938100809181008160809381008091A0\r\n:1034800080008160809380008091B100846080938F\r\n:10349000B1008091B00081608093B00080917A008B\r\n:1034A000846080937A0080917A00826080937A00B1\r\n:1034B00080917A00816080937A0080917A008068A0\r\n:1034C00080937A001092C10061E084E00E94BD0503\r\n:1034D00061E087E00E94BD0561E088E00E94BD05D3\r\n:1034E00061E08CE00E94BD0561E089E00E94BD05BD\r\n:1034F00060E08AE00E94BD0563E070E080E492E055\r\n:103500000E949B106AE570E080E492E00E941F1028\r\n:103510006BE070E08DE392E00E949B1062E070E04F\r\n:103520008AE392E00E949B108AE590E00E943914A1\r\n:103530006DE070E087E392E00E949B106EE070E027\r\n:1035400084E392E00E949B106AE570E087E392E0DA\r\n:103550000E941F106AE570E084E392E00E941F1051\r\n:103560006FE070E081E392E00E949B1060E170E008\r\n:103570008EE292E00E949B1064E170E081E392E0B1\r\n:103580000E941F1064E170E08EE292E00E941F1022\r\n:1035900080916E0290916F02892B11F10E94A31409\r\n:1035A000209155023091560280915302909154021D\r\n:1035B000213231050CF053C0B9016052710977FF17\r\n:1035C00002C06F5F7F4F759567958357910997FD8F\r\n:1035D000019600E210E023E730E048E955E052C0F0\r\n:1035E0002091550230915602C901079697FD079622\r\n:1035F000B3E095958795BA95E1F720915302309104\r\n:103600005402AC01429FC001439F900D529F900D08\r\n:1036100011240E94FF1D90936F0280936E02892BEC\r\n:1036200009F0BCCF90E080E00E94C314C0E0D0E07D\r\n:103630000E94DD166A317105810591050CF414C2F2\r\n:1036400061E081E00E9456146EE170E080E090E05D\r\n:103650000E945606209761F30E940000E9CFB9014D\r\n:103660006054710977FF02C06F5F7F4F7595679552\r\n:103670008255910997FD019600E410E022E530E0C3\r\n:1036800048E757E0959587950E94100F82E0809358\r\n:10369000710280916C0290916D02892B09F494C0A3\r\n:1036A0008CE3809370021092200210921F021092FD\r\n:1036B0002B0210922A020E941E1188E896E0909335\r\n:1036C0001E0280931D0289E896E090931C0280936D\r\n:1036D0001B028091770287FD1EC061E00E94BD053C\r\n:1036E00061E0809177020E94710561E070E080E006\r\n:1036F00090E00E94560660E0809177020E9471057A\r\n:103700006AE070E080E090E00E94560661E08091FF\r\n:1037100077020E94710580916C0290916D02892B55\r\n:1037200009F411C1209184023091850240918602F2\r\n:103730005091870260E074E284EF90E00E94BC1D2B\r\n:1037400020513109410951095695479537952795DB\r\n:103750002093B80064E084E995E00E94C91260916A\r\n:10376000550261508FE492E00E947E1364E080E98C\r\n:1037700095E00E94C9128091710264E1813009F4E0\r\n:1037800060E18FE492E00E947E1364E08CE895E0B3\r\n:103790000E94C9128FE880938C028091530290910D\r\n:1037A00054028038910509F031C180915502909101\r\n:1037B00056028034910509F039C18091710281303F\r\n:1037C00009F4D8C08FECD7C061E0809175020E94E7\r\n:1037D000BD0561E0809176020E94BD058091750271\r\n:1037E000082E000C990BFC01E45BF54FE491F0E02E\r\n:1037F000EE0FFF1FEE5BF54F2591349130937D0264\r\n:1038000020937C02FC01E05AF54FE491E0938202A0\r\n:1038100080917602082E000C990BFC01E45BF54FB9\r\n:10382000E491F0E0EE0FFF1FEE5BF54FA591B49130\r\n:10383000B0937F02A0937E02FC01E05AF54FE49121\r\n:10384000E09383028C91E82BEC9380916A02909133\r\n:103850006B02892B09F434C0CFB7F89480911A0217\r\n:10386000811127C0E6E5FAE08491EAE6FAE0949156\r\n:10387000E82FF0E0EE0FFF1FE85CF54FA591B49143\r\n:10388000EC91E92321F461E08AE00E94710561E096\r\n:103890008AE00E94BD058CB580618CBD8CB58064CA\r\n:1038A0008CBD61E08DE00E94BD0561E08BE00E946F\r\n:1038B000BD0580911A028F5F80931A02CFBF09CF96\r\n:1038C00061E0809173020E94BD0561E08091740205\r\n:1038D0000E94BD0580917302082E000C990BFC011B\r\n:1038E000E45BF54FE491F0E0EE0FFF1FEE5BF54F68\r\n:1038F000259134913093790220937802FC01E05AAB\r\n:10390000F54FE491E093800280917402082E000C40\r\n:10391000990BFC01E45BF54FE491F0E0EE0FFF1F23\r\n:10392000EE5BF54FA591B491B0937B02A0937A0220\r\n:10393000FC01E05AF54FE491E09381028C91E0950F\r\n:10394000E823EC93C6CE80916A0290916B02892B9A\r\n:1039500031F080918D0290918E020E941509E091C4\r\n:103960007E02F0917F02908180918302809589236D\r\n:103970008083F0CE8FE980938C02C2E16AED8FE400\r\n:1039800092E00E947E136C2F8FE492E00E947E13DF\r\n:1039900061E88FE492E00E947E1360918C028FE4D4\r\n:1039A00092E00E947E1369ED8FE492E00E947E1304\r\n:1039B0008091710261EF813009F462E28FE492E05C\r\n:1039C0000E947E1366E086E895E00E94C91280910D\r\n:1039D0006C0290916D02892BE9F12091880230915F\r\n:1039E000890240918A0250918B0260E074E284EF78\r\n:1039F00090E00E94BC1D20513109410951095695A2\r\n:103A00004795379527952093B8000CCE80369105C1\r\n:103A100089F48091550290915602409739F4809133\r\n:103A20007102813029F08FEA80938C02C2E0A6CF28\r\n:103A300080E1FACF80349105C9F7809155029091C9\r\n:103A40005602809799F780917102813009F0BACEC1\r\n:103A500080E191CFE0917E02F0917F028081909190\r\n:103A60008302892B8083DECD0E94831481E090E065\r\n:103A70000E94C31488E290E00E94391480EA90E02A\r\n:103A80000E944B140E94DD164B015C0182E090E025\r\n:103A90000E94C31484E190E00E944B140E94DD1642\r\n:103AA0006B017C0183E090E00E94C3148AE590E002\r\n:103AB0000E944B1461E0C814D904EA04FB040CF022\r\n:103AC00060E081E0C814D904EA04FB040CF480E04F\r\n:103AD0000E94561468E072E080E090E00E94560672\r\n:103AE0000E94831490E080E00E94C3148AE590E075\r\n:103AF0000E943914A9CD8CE191E0909350028093FB\r\n:103B00004F0280916E0290916F02009711F00C9419\r\n:103B10009B1E0895052E97FB1EF400940E94A11D84\r\n:103B200057FD07D00E94BC1D07FC03D04EF40C9437\r\n:103B3000A11D50954095309521953F4F4F4F5F4FB8\r\n:103B4000089590958095709561957F4F8F4F9F4F09\r\n:103B500008950E94DE1DA59F900DB49F900DA49F17\r\n:103B6000800D911D11240895B7FF0C94A91D0E948A\r\n:103B7000A91D821B930B0895A1E21A2EAA1BBB1B41\r\n:103B8000FD010DC0AA1FBB1FEE1FFF1FA217B30729\r\n:103B9000E407F50720F0A21BB30BE40BF50B661F3F\r\n:103BA000771F881F991F1A9469F760957095809503\r\n:103BB00090959B01AC01BD01CF010895A29FB0017A\r\n:103BC000B39FC001A39F700D811D1124911DB29F51\r\n:103BD000700D811D1124911D0895991B79E004C079\r\n:103BE000991F961708F0961B881F7A95C9F780953C\r\n:103BF0000895EE0FFF1F0590F491E02D09940F93A7\r\n:103C00001F93CF93DF938230910510F482E090E010\r\n:103C1000E0919102F091920230E020E0B0E0A0E06B\r\n:103C2000309799F42115310509F44AC0281B390B46\r\n:103C300024303105D8F58A819B816115710589F1A0\r\n:103C4000FB0193838283FE0111C040815181028177\r\n:103C5000138148175907E0F04817590799F410974E\r\n:103C600061F012960C93129713961C933296CF0123\r\n:103C7000DF91CF911F910F910895009391021093BE\r\n:103C80009202F4CF2115310551F04217530738F055\r\n:103C9000A901DB019A01BD01DF01F801C1CFEF01EC\r\n:103CA000F9CF9093920280939102CDCFFE01E20F63\r\n:103CB000F31F819391932250310939832883D7CF01\r\n:103CC00020918F0230919002232B41F42091020128\r\n:103CD000309103013093900220938F0220910001D4\r\n:103CE000309101012115310541F42DB73EB74091C6\r\n:103CF000040150910501241B350BE0918F02F091D6\r\n:103D00009002E217F307A0F42E1B3F0B2817390788\r\n:103D100078F0AC014E5F5F4F2417350748F04E0F27\r\n:103D20005F1F5093900240938F02819391939FCF96\r\n:103D3000F0E0E0E09CCFCF93DF930097E9F0FC0147\r\n:103D4000329713821282A0919102B0919202ED01FA\r\n:103D500030E020E01097A1F420813181820F931F81\r\n:103D600020918F02309190022817390709F061C025\r\n:103D7000F0939002E0938F02DF91CF910895EA01D2\r\n:103D8000CE17DF07E8F54A815B819E014115510599\r\n:103D9000B1F7E901FB83EA8349915991C40FD51F1B\r\n:103DA000EC17FD0761F4808191810296840F951FC5\r\n:103DB000E90199838883828193819B838A83F0E0E0\r\n:103DC000E0E012968D919C9113970097B9F52D9193\r\n:103DD0003C911197CD010296820F931F20918F0283\r\n:103DE000309190022817390739F6309751F5109223\r\n:103DF000920210929102B0939002A0938F02BCCFD6\r\n:103E0000D383C28340815181840F951FC817D9077E\r\n:103E100061F44E5F5F4F88819981480F591F51832C\r\n:103E200040838A819B81938382832115310509F028\r\n:103E3000B0CFF0939202E09391029ECFFD01DC019E\r\n:103E4000C0CF13821282D7CF81E090E0F8940C9417\r\n:103E5000301FDC0101C06D9341505040E0F70895E0\r\n:103E600015E0C5E4D5E004C0FE010E94F91D2196CD\r\n:0A3E7000C634D107C9F7F894FFCF5C\r\n:103E7A0000009302800000000000B311861136147E\r\n:103E8A0070057F116C115D1100000000550B8A0648\r\n:103E9A0036141E105E087005090FD70DF30DE70DD5\r\n:103EAA00710F70051909E013CE071708200D030DCD\r\n:043EBA008B0C2C0C35\r\n:00000001FF\r\n",
  "27ab50b410353367e0c07a5390af4dda0ad9261c483e82c787fa26c1efcada13": ":100000000C945D000C9485000C9485000C94850084\r\n:100010000C9485000C9485000C9485000C9485004C\r\n:100020000C9485000C9485000C9485000C9493022C\r\n:100030000C9485000C9485000C9485000C9485002C\r\n:100040000C9449020C9485000C9485000C94850056\r\n:100050000C9485000C9485000C9485000C9485000C\r\n:100060000C9485000C9485000000000024002700FB\r\n:100070002A0000000000250028002B0004040404CE\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A00004081020000000080002010000030407FB\r\n:1000B0000000000000000000F40311241FBECFEF79\r\n:1000C000D8E0DEBFCDBF11E0A0E0B1E0EEE0F9E0A6\r\n:1000D00002C005900D92A030B107D9F721E0A0E051\r\n:1000E000B1E001C01D92A434B207E1F710E0CDE504\r\n:1000F000D0E004C02197FE010E947F04CC35D107D7\r\n:10010000C9F70E946A030C9485040C94000090E0E7\r\n:10011000FC01EC55FF4F2491FC01E057FF4F349157\r\n:10012000FC01E458FF4FE491EE23C9F0222339F09B\r\n:10013000233001F1A8F4213019F1223029F1F0E047\r\n:10014000EE0FFF1FEE58FF4FA591B4918FB7F894B3\r\n:10015000EC91611126C030953E233C938FBF0895EA\r\n:100160002730A9F02830C9F0243049F78091800069\r\n:100170008F7D03C0809180008F7780938000DFCFD8\r\n:1001800084B58F7784BDDBCF84B58F7DFBCF809125\r\n:10019000B0008F778093B000D2CF8091B0008F7D78\r\n:1001A000F9CF3E2BDACF3FB7F89480912E01909192\r\n:1001B0002F01A0913001B091310126B5A89B05C057\r\n:1001C0002F3F19F00196A11DB11D3FBFBA2FA92FD6\r\n:1001D000982F8827BC01CD01620F711D811D911DD3\r\n:1001E00042E0660F771F881F991F4A95D1F708953F\r\n:1001F0008F929F92AF92BF92CF92DF92EF92FF9237\r\n:100200000E94D3004B015C0188EEC82E83E0D82EFB\r\n:10021000E12CF12C0E94D300681979098A099B0905\r\n:10022000683E734081059105A8F321E0C21AD10808\r\n:10023000E108F10888EE880E83E0981EA11CB11C2D\r\n:10024000C114D104E104F10429F7FF90EF90DF908D\r\n:10025000CF90BF90AF909F908F900895CF92DF92F4\r\n:10026000EF92FF92CF93DF93EC01603282E0780748\r\n:10027000CCF5653B710514F064EB70E0898128E8EA\r\n:1002800030E0281B310987FD3395220F331F220FE1\r\n:10029000331F6901330FEE08FF088A8128E532E039\r\n:1002A000281B310987FD3395220F331F220F331F7F\r\n:1002B000032E000C440B550B2C193D094E095F0908\r\n:1002C000DB0177FF02C0B0E0A0E00E943A0424EB1B\r\n:1002D00030E040E050E00E941004C20ED31EE41E45\r\n:1002E000F51EB601E881EC3070F5298188E890E0D0\r\n:1002F000821B910927FD9395880F991F880F991FDD\r\n:10030000681779077CF02A8188E592E0821B9109C1\r\n:1003100027FD9395880F991F880F991F68177907F4\r\n:100320000CF4CB010297880F991F4FB7F8942E2F2A\r\n:1003300030E0F901EE0FFF1FE20FF31FEE5FFE4FFB\r\n:10034000928381834FBFDF91CF91FF90EF90DF9039\r\n:10035000CF900895CF93DF93EC016AE570E081E4DC\r\n:1003600091E00E942E016AE570E08EE391E00E9428\r\n:100370002E016AE570E08BE391E00E942E016AE5B0\r\n:1003800070E088E391E00E942E01BE0185E391E0D8\r\n:100390000E942E01BE0182E391E0DF91CF910C9487\r\n:1003A0002E01CF93DF93DC018C918C3008F06DC06F\r\n:1003B000CB01FB01E057FF4F249184589F4FFC0174\r\n:1003C0008491882399F090E0880F991FFC01E859E7\r\n:1003D000FF4FC591D491FC01EE58FF4F8591949148\r\n:1003E0008FB7F894E881E22BE8838FBF8C91282F98\r\n:1003F00030E0F901EE0FFF1FE20FF31FEE5FFE4F3B\r\n:10040000962F9F736081607C692B608311961C928C\r\n:10041000119712961C9212972CE0622F0E9473047F\r\n:10042000829FB001112430E020E0AB01420F531F46\r\n:10043000FA01EE0FFF1FE40FF51FEE5FFE4F9081F4\r\n:1004400096FD16C02F5F3F4F2C30310571F781119B\r\n:100450000FC01092800082E080938100109285008E\r\n:1004600010928400B19A80916F00826080936F0037\r\n:10047000EC918E2F90E0FC01EE0FFF1FE80FF91FAB\r\n:10048000EE5FFE4F8081806480838C91DF91CF91FD\r\n:1004900008951F920F920FB60F9211242F933F933E\r\n:1004A0008F939F93AF93BF9380912A0190912B01DB\r\n:1004B000A0912C01B0912D013091290123E0230F4F\r\n:1004C0002D3758F50196A11DB11D20932901809368\r\n:1004D0002A0190932B01A0932C01B0932D018091C0\r\n:1004E0002E0190912F01A0913001B0913101019620\r\n:1004F000A11DB11D80932E0190932F01A093300177\r\n:10050000B0933101BF91AF919F918F913F912F9106\r\n:100510000F900FBE0F901F90189526E8230F02969C\r\n:10052000A11DB11DD2CF1F920F920FB60F921124B1\r\n:100530002F933F934F935F936F937F938F939F93EB\r\n:10054000AF93BF93CF93DF93EF93FF93809100011D\r\n:10055000C0910101D0E087FF24C010928500109265\r\n:100560008400809100018F5F8093000180910001E1\r\n:10057000082E000C990B8C179D0724F48091000124\r\n:100580008C30C4F180918400909185000496803471\r\n:100590009C4908F47AC0809184009091850004966B\r\n:1005A00076C080910001082E000C990B8C179D07D6\r\n:1005B000C4F6E09100018E2FEE0F990BFC01EE0FB7\r\n:1005C000FF1FE80FF91FEE5FFE4F808186FFC9CF46\r\n:1005D000E09100018E2FEE0F990BFC01EE0FFF1F33\r\n:1005E000E80FF91FEE5FFE4F808160E08F730E947D\r\n:1005F0008700B7CF2091840030918500E091000101\r\n:100600008E2FEE0F990BFC01EE0FFF1FE80FF91F65\r\n:10061000EE5FFE4F81819281820F931F909389003C\r\n:1006200080938800E09100018E2FEE0F990BFC0162\r\n:10063000EE0FFF1FE80FF91FEE5FFE4F808186FF70\r\n:1006400011C0E09100018E2FEE0F990BFC01EE0F0F\r\n:10065000FF1FE80FF91FEE5FFE4F808161E08F738F\r\n:100660000E948700FF91EF91DF91CF91BF91AF91F1\r\n:100670009F918F917F916F915F914F913F912F91BA\r\n:100680000F900FBE0F901F90189580E49CE99093F7\r\n:100690008900809388008FEF80930001E3CFFC01F5\r\n:1006A000909101019C3098F481E0890F80930101C1\r\n:1006B0009083892F90E0FC01EE0FFF1FE80FF91FD8\r\n:1006C000EE5FFE4F88EB9BE09283818308958FEF6E\r\n:1006D00080830895789484B5826084BD84B58160F8\r\n:1006E00084BD85B5826085BD85B5816085BD8091FD\r\n:1006F0006E00816080936E00109281008091810075\r\n:10070000826080938100809181008160809381006C\r\n:10071000809180008160809380008091B10084602E\r\n:100720008093B1008091B00081608093B00080918F\r\n:100730007A00846080937A0080917A00826080934E\r\n:100740007A0080917A00816080937A0080917A00AB\r\n:10075000806880937A001092C10063E070E086E2C6\r\n:1007600091E00E94D1016AE570E086E291E00E948A\r\n:100770002E016BE070E081E491E00E94D10162E023\r\n:1007800070E08EE391E00E94D1016DE070E08BE3B8\r\n:1007900091E00E94D1016EE070E088E391E00E9458\r\n:1007A000D1016FE070E085E391E00E94D10160E14A\r\n:1007B00070E082E391E00E94D10184E190E00E9428\r\n:1007C000AA01C0E0D0E080E490E00E94AA010E946B\r\n:1007D000F80084E190E00E94AA010E94F8002097AE\r\n:1007E00091F30E940000EFCF86E291E00E944F0358\r\n:1007F00081E491E00E944F038EE391E00E944F0359\r\n:100800008BE391E00E944F0388E391E00E944F0345\r\n:1008100085E391E00E944F0382E391E00C944F0343\r\n:10082000052E97FB1EF400940E94270457FD07D065\r\n:100830000E94420407FC03D04EF40C942704509508\r\n:100840004095309521953F4F4F4F5F4F08959095BC\r\n:100850008095709561957F4F8F4F9F4F08950E94AF\r\n:100860006404A59F900DB49F900DA49F800D911DD1\r\n:1008700011240895B7FF0C942F040E942F04821BAB\r\n:10088000930B0895A1E21A2EAA1BBB1BFD010DC0FC\r\n:10089000AA1FBB1FEE1FFF1FA217B307E407F50730\r\n:1008A00020F0A21BB30BE40BF50B661F771F881F0C\r\n:1008B000991F1A9469F760957095809590959B01A2\r\n:1008C000AC01BD01CF010895A29FB001B39FC0014B\r\n:1008D000A39F700D811D1124911DB29F700D811D6C\r\n:1008E0001124911D0895991B79E004C0991F961752\r\n:1008F00008F0961B881F7A95C9F780950895EE0F2A\r\n:0E090000FF1F0590F491E02D0994F894FFCFAD\r\n:00000001FF\r\n",
  "b1315769769411a8219882b7140d14c8ebbae0cb3bd5b707e055c9933f7c18e6": ":100000000C945D000C9485000C9485000C94850084\r\n:100010000C9485000C9485000C9485000C9485004C\r\n:100020000C9485000C9485000C9485000C9495022A\r\n:100030000C9485000C9485000C9485000C9485002C\r\n:100040000C944B020C9485000C9485000C94850054\r\n:100050000C9485000C9485000C9485000C9485000C\r\n:100060000C9485000C9485000000000024002700FB\r\n:100070002A0000000000250028002B0004040404CE\r\n:100080000404040402020202020203030303030342\r\n:10009000010204081020408001020408102001021F\r\n:1000A00004081020000000080002010000030407FB\r\n:1000B0000000000000000000160411241FBECFEF56\r\n:1000C000D8E0DEBFCDBF11E0A0E0B1E0E2E5F9E0AD\r\n:1000D00002C005900D92A030B107D9F721E0A0E051\r\n:1000E000B1E001C01D92A434B207E1F710E0CDE504\r\n:1000F000D0E004C02197FE010E94A104CC35D107B5\r\n:10010000C9F70E946C030C94A7040C94000090E0C3\r\n:10011000FC01EC55FF4F2491FC01E057FF4F349157\r\n:10012000FC01E458FF4FE491EE23C9F0222339F09B\r\n:10013000233001F1A8F4213019F1223029F1F0E047\r\n:10014000EE0FFF1FEE58FF4FA591B4918FB7F894B3\r\n:10015000EC91611126C030953E233C938FBF0895EA\r\n:100160002730A9F02830C9F0243049F78091800069\r\n:100170008F7D03C0809180008F7780938000DFCFD8\r\n:1001800084B58F7784BDDBCF84B58F7DFBCF809125\r\n:10019000B0008F778093B000D2CF8091B0008F7D78\r\n:1001A000F9CF3E2BDACF3FB7F89480912E01909192\r\n:1001B0002F01A0913001B091310126B5A89B05C057\r\n:1001C0002F3F19F00196A11DB11D3FBFBA2FA92FD6\r\n:1001D000982F8827BC01CD01620F711D811D911DD3\r\n:1001E00042E0660F771F881F991F4A95D1F708953F\r\n:1001F0008F929F92AF92BF92CF92DF92EF92FF9237\r\n:100200004B015C010E94D3006B017C010E94D30072\r\n:100210006C197D098E099F09683E7340810591051F\r\n:10022000A8F321E0821A9108A108B10888EEC80E4F\r\n:1002300083E0D81EE11CF11C81149104A104B104D7\r\n:1002400029F7FF90EF90DF90CF90BF90AF909F90F5\r\n:100250008F900895CF92DF92EF92FF92CF93DF932A\r\n:10026000EC01603282E07807CCF5653B710514F053\r\n:1002700064EB70E0898128E830E0281B310987FDB4\r\n:100280003395220F331F220F331F6901330FEE08FE\r\n:10029000FF088A8128E532E0281B310987FD339564\r\n:1002A000220F331F220F331F032E000C440B550B5C\r\n:1002B0002C193D094E095F09DB0177FF02C0B0E050\r\n:1002C000A0E00E945C0424EB30E040E050E00E949B\r\n:1002D0003204C20ED31EE41EF51EB601E881EC30D6\r\n:1002E00070F5298188E890E0821B910927FD93959C\r\n:1002F000880F991F880F991F681779077CF02A814A\r\n:1003000088E592E0821B910927FD9395880F991F3C\r\n:10031000880F991F681779070CF4CB010297880F93\r\n:10032000991F4FB7F8942E2F30E0F901EE0FFF1F01\r\n:10033000E20FF31FEE5FFE4F928381834FBFDF9189\r\n:10034000CF91FF90EF90DF90CF9008950F931F9380\r\n:10035000CF93DF938C01EB016AE570E081E491E0DB\r\n:100360000E942A016AE570E08EE391E00E942A0172\r\n:10037000B8018BE391E00E942A0164EB70E0601BFE\r\n:10038000710B88E391E00E942A01BE0185E391E0B0\r\n:100390000E942A01BE0182E391E0DF91CF911F917B\r\n:1003A0000F910C942A01CF93DF93DC018C918C3058\r\n:1003B00008F06DC0CB01FB01E057FF4F249184583A\r\n:1003C0009F4FFC018491882399F090E0880F991F3A\r\n:1003D000FC01E859FF4FC591D491FC01EE58FF4F45\r\n:1003E000859194918FB7F894E881E22BE8838FBFD1\r\n:1003F0008C91282F30E0F901EE0FFF1FE20FF31F61\r\n:10040000EE5FFE4F962F9F736081607C692B608347\r\n:1004100011961C92119712961C9212972CE0622F43\r\n:100420000E949504829FB001112430E020E0AB01CE\r\n:10043000420F531FFA01EE0FFF1FE40FF51FEE5F8F\r\n:10044000FE4F908196FD16C02F5F3F4F2C30310537\r\n:1004500071F781110FC01092800082E080938100BB\r\n:100460001092850010928400B19A80916F00826092\r\n:1004700080936F00EC918E2F90E0FC01EE0FFF1F38\r\n:10048000E80FF91FEE5FFE4F8081806480838C91BE\r\n:10049000DF91CF9108951F920F920FB60F92112402\r\n:1004A0002F933F938F939F93AF93BF9380912A0194\r\n:1004B00090912B01A0912C01B0912D013091290137\r\n:1004C00023E0230F2D3758F50196A11DB11D209370\r\n:1004D000290180932A0190932B01A0932C01B093C2\r\n:1004E0002D0180912E0190912F01A0913001B091AA\r\n:1004F00031010196A11DB11D80932E0190932F0112\r\n:10050000A0933001B0933101BF91AF919F918F9132\r\n:100510003F912F910F900FBE0F901F90189526E8D6\r\n:10052000230F0296A11DB11DD2CF1F920F920FB6BD\r\n:100530000F9211242F933F934F935F936F937F9369\r\n:100540008F939F93AF93BF93CF93DF93EF93FF93DB\r\n:1005500080910001C0910101D0E087FF24C010927A\r\n:10056000850010928400809100018F5F80930001CC\r\n:1005700080910001082E000C990B8C179D0724F424\r\n:10058000809100018C30C4F18091840090918500AD\r\n:10059000049680349C4908F47AC08091840090913C\r\n:1005A0008500049676C080910001082E000C990BFE\r\n:1005B0008C179D07C4F6E09100018E2FEE0F990B6A\r\n:1005C000FC01EE0FFF1FE80FF91FEE5FFE4F808169\r\n:1005D00086FFC9CFE09100018E2FEE0F990BFC0131\r\n:1005E000EE0FFF1FE80FF91FEE5FFE4F808160E006\r\n:1005F0008F730E948700B7CF2091840030918500CF\r\n:10060000E09100018E2FEE0F990BFC01EE0FFF1F02\r\n:10061000E80FF91FEE5FFE4F81819281820F931FD9\r\n:100620009093890080938800E09100018E2FEE0F57\r\n:10063000990BFC01EE0FFF1FE80FF91FEE5FFE4F55\r\n:10064000808186FF11C0E09100018E2FEE0F990B83\r\n:10065000FC01EE0FFF1FE80FF91FEE5FFE4F8081D8\r\n:1006600061E08F730E948700FF91EF91DF91CF913E\r\n:10067000BF91AF919F918F917F916F915F914F91BA\r\n:100680003F912F910F900FBE0F901F90189580E40F\r\n:100690009CE990938900809388008FEF80930001FC\r\n:1006A000E3CFFC01909101019C3098F481E0890F27\r\n:1006B000809301019083892F90E0FC01EE0FFF1FD2\r\n:1006C000E80FF91FEE5FFE4F88EB9BE0928381837A\r\n:1006D00008958FEF80830895789484B5826084BDF7\r\n:1006E00084B5816084BD85B5826085BD85B5816036\r\n:1006F00085BD80916E00816080936E0010928100B4\r\n:10070000809181008260809381008091810081606E\r\n:10071000809381008091800081608093800080912F\r\n:10072000B10084608093B1008091B00081608093BB\r\n:10073000B00080917A00846080937A0080917A0082\r\n:10074000826080937A0080917A00816080937A0041\r\n:1007500080917A00806880937A001092C10063E0F3\r\n:1007600070E086E291E00E94D3016AE570E086E2E3\r\n:1007700091E00E942A016BE070E081E491E00E9428\r\n:10078000D30162E070E08EE391E00E94D3016DE05E\r\n:1007900070E08BE391E00E94D3016EE070E088E3AB\r\n:1007A00091E00E94D3016FE070E085E391E00E9448\r\n:1007B000D30160E170E082E391E00E94D30164E143\r\n:1007C00070E08AE590E00E94A60160E273E080E0BC\r\n:1007D00090E00E94F800C0E0D0E064E170E084E6C0\r\n:1007E00090E00E94A6016CED75E080E090E00E9430\r\n:1007F000F80060E470E084E690E00E94A6016CEDF1\r\n:1008000075E080E090E00E94F80064E170E08AE525\r\n:1008100090E00E94A6016CED75E080E090E00E94FF\r\n:10082000F8002097D1F20E940000D7CF86E291E035\r\n:100830000E94510381E491E00E9451038EE391E014\r\n:100840000E9451038BE391E00E94510388E391E001\r\n:100850000E94510385E391E00E94510382E391E0FD\r\n:100860000C945103052E97FB1EF400940E9449043A\r\n:1008700057FD07D00E94640407FC03D04EF40C948B\r\n:10088000490450954095309521953F4F4F4F5F4F0C\r\n:10089000089590958095709561957F4F8F4F9F4FEC\r\n:1008A00008950E948604A59F900DB49F900DA49F6B\r\n:1008B000800D911D11240895B7FF0C9451040E94DE\r\n:1008C0005104821B930B0895A1E21A2EAA1BBB1B95\r\n:1008D000FD010DC0AA1FBB1FEE1FFF1FA217B3070C\r\n:1008E000E407F50720F0A21BB30BE40BF50B661F22\r\n:1008F000771F881F991F1A9469F7609570958095E6\r\n:1009000090959B01AC01BD01CF010895A29FB0015C\r\n:10091000B39FC001A39F700D811D1124911DB29F33\r\n:10092000700D811D1124911D0895991B79E004C05B\r\n:10093000991F961708F0961B881F7A95C9F780951E\r\n:100940000895EE0FFF1F0590F491E02D0994F8949F\r\n:02095000FFCFD7\r\n:00000001FF\r\n",
  "1efd369ce7d578ddfb1a750598c2ddab98159232cfc0e983fd26a4b755a7f912": ":100000000C9441050C9469050C9469050C946905E0\r\n:100010000C9469050C9469050C9469050C946905A8\r\n:100020000C9469050C9469050C9469050C94C91627\r\n:100030000C9469050C9469050C9469050C94690588\r\n:100040000C947F160C9469050C9469050C94690551\r\n:100050000C9469050C9469050C9469050C94690568\r\n:100060000C9485170C9469052200FF210000000004\r\n:10007000003E5B4F5B3E3E6B4F6B3E1C3E7C3E1C2E\r\n:10008000183C7E3C181C577D571C1C5E7F5E1C0074\r\n:10009000183C1800FFE7C3E7FF0018241800FFE72B\r\n:1000A000DBE7FF30483A060E2629792926407F05EE\r\n:1000B0000507407F05253F5A3CE73C5A7F3E1C1C04\r\n:1000C00008081C1C3E7F14227F22145F5F005F5FC4\r\n:1000D00006097F017F006689956A606060606094B0\r\n:1000E000A2FFA29408047E040810207E20100808B5\r\n:1000F0002A1C08081C2A08081E101010100C1E0CC0\r\n:100100001E0C30383E3830060E3E0E060000000051\r\n:100110000000005F00000007000700147F147F1438\r\n:10012000242A7F2A1223130864623649562050007D\r\n:1001300008070300001C2241000041221C002A1C69\r\n:100140007F1C2A08083E0808008070300008080854\r\n:100150000808000060600020100804023E51494574\r\n:100160003E00427F400072494949462141494D3392\r\n:100170001814127F1027454545393C4A49493141F9\r\n:10018000211109073649494936464949291E0000C7\r\n:10019000140000004034000000081422411414141C\r\n:1001A0001414004122140802015909063E415D5908\r\n:1001B0004E7C1211127C7F494949363E4141412211\r\n:1001C0007F4141413E7F494949417F090909013E3B\r\n:1001D000414151737F0808087F00417F4100204062\r\n:1001E000413F017F081422417F404040407F021C74\r\n:1001F000027F7F0408107F3E4141413E7F0909098B\r\n:10020000063E4151215E7F09192946264949493256\r\n:1002100003017F01033F4040403F1F2040201F3F1C\r\n:100220004038403F631408146303047804036159A1\r\n:10023000494D43007F4141410204081020004141E3\r\n:10024000417F04020102044040404040000307088F\r\n:100250000020545478407F2844443838444444288B\r\n:10026000384444287F385454541800087E09021832\r\n:10027000A4A49C787F0804047800447D40002040BA\r\n:10028000403D007F1028440000417F40007C0478FE\r\n:1002900004787C080404783844444438FC18242446\r\n:1002A0001818242418FC7C080404084854545424C6\r\n:1002B00004043F44243C4040207C1C2040201C3C43\r\n:1002C0004030403C44281028444C9090907C44643A\r\n:1002D000544C4400083641000000770000004136CD\r\n:1002E000080002010204023C2623263C1EA1A16153\r\n:1002F000123A4040207A3854545559215555794185\r\n:100300002254547842215554784020545579400C59\r\n:100310001E5272123955555559395454545939553C\r\n:100320005454580000457C410002457D420001457F\r\n:100330007C407D1211127DF0282528F07C54554513\r\n:10034000002054547C547C0A097F4932494949327F\r\n:100350003A4444443A324A4848303A4141217A3A90\r\n:1003600042402078009DA0A07D3D4242423D3D405C\r\n:1003700040403D3C24FF2424487E4943662B2FFC0B\r\n:100380002F2BFF0929F620C0887E090320545479B9\r\n:10039000410000447D413048484A32384040227A8A\r\n:1003A000007A0A0A727D0D19317D2629292F282607\r\n:1003B0002929292630484D4020380808080808080F\r\n:1003C0000808382F10C8ACBA2F102834FA00007B68\r\n:1003D000000008142A142222142A1408550055007B\r\n:1003E00055AA55AA55AAFF55FF55FF000000FF006A\r\n:1003F000101010FF00141414FF001010FF00FF1065\r\n:1004000010F010F0141414FC001414F700FF000096\r\n:10041000FF00FF1414F404FC141417101F10101F15\r\n:10042000101F1414141F00101010F0000000001F03\r\n:10043000101010101F10101010F010000000FF100E\r\n:100440001010101010101010FF10000000FF14000A\r\n:1004500000FF00FF00001F10170000FC04F414143C\r\n:100460001710171414F404F40000FF00F714141408\r\n:1004700014141414F700F7141414171410101F1088\r\n:100480001F141414F4141010F010F000001F101FAB\r\n:100490000000001F14000000FC140000F010F01019\r\n:1004A00010FF10FF141414FF141010101F00000090\r\n:1004B00000F010FFFFFFFFFFF0F0F0F0F0FFFFFF94\r\n:1004C0000000000000FFFF0F0F0F0F0F38444438EB\r\n:1004D00044FC4A4A4A347E02020606027E027E023A\r\n:1004E00063554941633844443C04407E201E200645\r\n:1004F000027E020299A5E7A5991C2A492A1C4C7282\r\n:1005000001724C304A4D4D303048784830BC625A08\r\n:10051000463D3E494949007E0101017E2A2A2A2A98\r\n:100520002A44445F444440514A444040444A514074\r\n:100530000000FF0103E080FF000008086B6B083635\r\n:1005400012362436060F090F0600001818000000A6\r\n:100550001010003040FF0101001F01011E00191D95\r\n:100560001712003C3C3C3C00000000000001030767\r\n:100570000F1F3F7F0080C0E0F0F8FCFEDB40A4A628\r\n:100580002EAF2000A1C8D300408DAED580A80000BA\r\n:10059000600000000000000000000000000000E01B\r\n:1005A0000000000000000000000000000001E0006A\r\n:1005B00000000000000000000000000001F000004A\r\n:1005C000000000000000000000000003F000000038\r\n:1005D0000000000000000000000007F00000000024\r\n:1005E00000000000000000000007F800000000000C\r\n:1005F00000000000000000000FF800000003C00031\r\n:100600007E000001E0007F0FF800000003C000FE44\r\n:10061000000001E000FFEFF800000003C000FE0052\r\n:100620000001E000FFFFF800000003C000F0000040\r\n:10063000000F007FFE7FC0000003C000F00000003C\r\n:100640000F003FFE7FF83FF1FBCFFCFEF3BC3DEF18\r\n:10065000E01FFE7FFF7FFBFFDFFEFEFFBC3DEFE004\r\n:100660001FC6FFFF7FFBFFDFFEFEFFBC3DEFE00F7D\r\n:10067000E3C7FE787BC3DE1EF0FFBC3DEF0007FF43\r\n:1006800087FC787BC3DE1EF0F83C3DEF0001FFFFE6\r\n:10069000F0007BC3C01EF0F03C3DEF0001F37FE0B3\r\n:1006A0003FFBC3CFFEF0F03C3DEF0003E33F807F14\r\n:1006B000FBC3DFFEF0F03C3DEF0007E73C00787B3A\r\n:1006C000C3DE1EF0F03C3DEF0007FFBE00787BC3A9\r\n:1006D000DE1EF0F03C3DEF0007FFFE00787BC3DE3E\r\n:1006E0001EF0F03C3DEF000FFFFE007FFBFFDFFE42\r\n:1006F000F0F03FFDEFE00FFFFF007FFBFFDFFEF0BC\r\n:10070000F03FFDEFE00FF9FF003E79F9CF9EF0F0EA\r\n:100710001F3DE7E01FF1FF000000000000000000A7\r\n:100720000000001F80FF007FFFFFFFFFFFFFFFFFB4\r\n:10073000FFE01C007F007FFFFFFFFEB46D888D1877\r\n:10074000E000001F007FFFFFFFFE95AD7DB577E065\r\n:1007500000000F007FFFFFFFFEA5AD9D8D19E0009B\r\n:100760000006007FFFFFFFFEB5ADEDB57EE00000A7\r\n:100770000000000180000000000000000000038075\r\n:1007800000000000000000000007C00000000000A2\r\n:100790000000000007C00000000000000000000F83\r\n:1007A000C00000000000000000001FE0000000008A\r\n:1007B00000000000001FE00000000000000000003A\r\n:1007C0003FE00000000000000000003FF0000000DB\r\n:1007D0000000000000007FF0000000000000001F8B\r\n:1007E000F87FF0000000000000003FFE7FF00000F6\r\n:1007F00000000000003FFF7FF0000000000000004C\r\n:100800001FFFFBE0000000000000000FFFF9FFC029\r\n:100810000000000000000FFFF9FFF80000000000DA\r\n:100820000007FFF1FFFF00000000000003FC73FF62\r\n:10083000FF80000000000001FE3FFFFF800000007D\r\n:10084000000000FF1E0FFF000000000000007FFE00\r\n:100850001FFC000000000000003FFFFFF800000048\r\n:10086000000000000FDFFFE0000000000000001F9C\r\n:1008700019FFC0000000000000003F3CFF00000026\r\n:1008800000000000007E7CF8000000000000000076\r\n:100890007FFE7C0000000000000000FFFFFC000065\r\n:1008A000000000000000FFFFFE000000000000004C\r\n:1008B00000FFFFFE0000000000000001FFEFFE004F\r\n:1008C00000000000000001FFCFFE0000000000005B\r\n:1008D0000003FF07FE0000000000000003FC07FE0D\r\n:1008E0000000000000000003F003FE000000000014\r\n:1008F0000000018000FE0000000000000000000079\r\n:100900007E000000000000000000003E000000002B\r\n:100910000000000000000C00000000000007800044\r\n:10092000FC000003C0000000078001FC000003C0C1\r\n:10093000000000078001FC000003C00000000780E9\r\n:1009400001E00000001E000000078001E000000040\r\n:100950001E007FE3F79FF9FDE7787BDFC0FFF7FF1D\r\n:10096000BFFDFDFF787BDFC0FFF7FFBFFDFDFF7818\r\n:100970007BDFC0F0F787BC3DE1FF787BDE00F0F75E\r\n:1009800087BC3DE1F0787BDE0000F787803DE1E049\r\n:10099000787BDE007FF7879FFDE1E0787BDE00FF5C\r\n:1009A000F787BFFDE1E0787BDE00F0F787BC3DE133\r\n:1009B000E0787BDE00F0F787BC3DE1E0787BDE008D\r\n:1009C000F0F787BC3DE1E0787BDE00FFF7FFBFFD7D\r\n:1009D000E1E07FFBDFC0FFF7FFBFFDE1E07FFBDF72\r\n:1009E000C07CF3F39F3DE1E03E7BCFC00000000000\r\n:1009F00000000000000000FFFFFFFFFFFFFFFFFF00\r\n:100A0000FFC0FFFFFFFFFD68DB111A31C0FFFFFFD2\r\n:100A1000FFFD2B5AFB6AEFC0FFFFFFFFFD4B5B3B67\r\n:100A20001A33C0FFFFFFFFFD6B5BDB6AFDC00000F8\r\n:100A3000000800020100000304070000000000009D\r\n:100A4000000000000000250028002B00000000002E\r\n:100A5000240027002A0004040404040404040202FD\r\n:100A6000020202020303030303030102040810202D\r\n:100A70004080010204081020010204081020BF1861\r\n:100A8000631C11241FBECFEFD8E0DEBFCDBF11E045\r\n:100A9000A0E0B1E0EAE4FCE302C005900D92A434CA\r\n:100AA000B107D9F722E0A4E4B1E001C01D92A33957\r\n:100AB000B207E1F715E0C0E4D5E004C02197FE01DC\r\n:100AC0000E94E11CCF33D107C9F70E9435190C945D\r\n:100AD000181E0C940000089590E0FC01E659F54FB3\r\n:100AE00024918A5A954FFC018491882399F090E0D3\r\n:100AF000880F991FFC01E45BF54FA591B491FC01AF\r\n:100B0000EE5BF54F859194918FB7F894EC91E22BC1\r\n:100B1000EC938FBF089590E0FC01E25DF54F2491C6\r\n:100B2000FC01E659F54F3491FC01EA5AF54FE49186\r\n:100B3000EE23C9F0222339F0233001F1A8F421304B\r\n:100B400019F1223029F1F0E0EE0FFF1FEE5BF54FB7\r\n:100B5000A591B4918FB7F894EC91611126C03095AE\r\n:100B60003E233C938FBF08952730A9F02830C9F069\r\n:100B7000243049F7809180008F7D03C080918000F0\r\n:100B80008F7780938000DFCF84B58F7784BDDBCFF4\r\n:100B900084B58F7DFBCF8091B0008F778093B000BC\r\n:100BA000D2CF8091B0008F7DF9CF3E2BDACF3FB707\r\n:100BB000F8948091260290912702A0912802B0918A\r\n:100BC000290226B5A89B05C02F3F19F00196A11D4B\r\n:100BD000B11D3FBFBA2FA92F982F8827BC01CD0187\r\n:100BE000620F711D811D911D42E0660F771F881FE6\r\n:100BF000991F4A95D1F708958F929F92AF92BF9215\r\n:100C0000CF92DF92EF92FF924B015C010E94D705D9\r\n:100C10006B017C010E94D7056C197D098E099F0923\r\n:100C2000683E734081059105A8F321E0821A91087E\r\n:100C3000A108B10888EEC80E83E0D81EE11CF11CA3\r\n:100C400081149104A104B10429F7FF90EF90DF9083\r\n:100C5000CF90BF90AF909F908F9008950895089582\r\n:100C6000AF92BF92CF92DF92EF92FF920F931F93BA\r\n:100C7000CF93DF936C017B018B01040F151FEB01F8\r\n:100C80005E01AE18BF08C017D10759F06991D601AF\r\n:100C9000ED91FC910190F081E02DC6010995892B21\r\n:100CA00079F7C501DF91CF911F910F91FF90EF90E0\r\n:100CB000DF90CF90BF90AF900895EF92FF920F9387\r\n:100CC0001F93CF93DF93EC01EC80FD806E157F05C1\r\n:100CD0000CF070C057FF04C0240F351F50E040E0F7\r\n:100CE0008E819F81FA01E20FF31F8E179F071CF47C\r\n:100CF0009C01241B350B121613060CF05BC0922FBF\r\n:100D0000842F8695869586958E9DD0018F9DB00DFA\r\n:100D100011246A0F7B1FAF8DB8A1A60FB71F4770B4\r\n:100D200049F188E0841B482F682F70E0FB01EC58E4\r\n:100D3000FA4FE491281708F063C0621B71092FEF86\r\n:100D400030E002C0359527956A95E2F7E22301303D\r\n:100D5000110539F0B0F10230110561F58C91E827E9\r\n:100D600002C08C91E82BEC93941720F12C813D81EB\r\n:100D7000A20FB31FE92FE41BE83078F00230110511\r\n:100D800021F58E2F9C9190959C932C813D81A20FF3\r\n:100D9000B31F88508830B0F7E770EE2359F0F0E0C9\r\n:100DA000E459FA4FE49101301105F9F010F10230E5\r\n:100DB000110519F1DF91CF911F910F91FF90EF90E5\r\n:100DC0000895E0958C91E823CECF81E001151105BF\r\n:100DD00009F480E081959E2F8C932C813D81A20F98\r\n:100DE000B31F98509830C0F7D7CF8C91E82BEC9375\r\n:100DF000E1CFE0958C91E823FACF8C91E827F7CFEB\r\n:100E00000130110509F4ADCFE0F20230110509F40B\r\n:100E1000A5CFAE0DBF1DAECF0F931F93CF93DF9322\r\n:100E200077FF04C0260F371F70E060E0DC011496E6\r\n:100E3000CD91DC91FB01E20FF31FCE17DF071CF40D\r\n:100E40009E01261B370B121613064CF5FA0157FDAF\r\n:100E50003796A3E0F595E795AA95E1F7EC9FD001C9\r\n:100E6000ED9FB00DFC9FB00D11246A0F7B1FDC01BC\r\n:100E70005F96ED91FC91E60FF71F4770552781E0D3\r\n:100E800090E001C0880F4A95EAF7482F013011051C\r\n:100E900059F0A8F02E0F3F1F02301105E1F0DF914D\r\n:100EA000CF911F910F9108952E0F3F1FE217F30767\r\n:100EB000B1F38191DF011197842B8C93F7CF80954B\r\n:100EC0002E0F3F1FE217F30751F39191DF011197A6\r\n:100ED00098239C93F7CFE217F30709F38191DF0181\r\n:100EE000119784278C93F7CF0F931F93FA01DC019E\r\n:100EF00056964C9156974230E9F04330A1F141307B\r\n:100F000061F514964D915C91DA01AE1BBF0BFD01AA\r\n:100F1000E21BF30B77FD0BC0DC0116964D915C9143\r\n:100F20006417750724F4AB01BF010E940C071F91E1\r\n:100F30000F91089514964D915C91DA01A61BB70BA1\r\n:100F4000BD0161507109DC0116964D915C91DA0189\r\n:100F5000AE1BBF0BFD01E21BF30B77FDE8CFAF012A\r\n:100F60000E945D06E4CF16964D915C91DA01A61BB6\r\n:100F7000B70BBD0161507109CDCF0F931F93FA01DB\r\n:100F8000DC0156964C9156974230A9F0433091F1CE\r\n:100F9000413019F514964D915C91DA01AE1BBF0BEF\r\n:100FA000FD013197F7FD04C0AB01BF010E945D0652\r\n:100FB0001F910F91089514964D915C91DA01A61B33\r\n:100FC000B70BBD01DC0116964D915C91DA01AE1BA9\r\n:100FD000BF0BFD013197621B730BF7FDE9CFDC01FD\r\n:100FE00016964D915C91E417F50714F7AF010E9436\r\n:100FF0000C07DECF16964D915C91DA01A61BB70B5C\r\n:10100000BD01621B730BCECFFC0177FD64C08085F0\r\n:101010009185681779070CF05EC057FD5CC082852A\r\n:101020009385481759070CF056C086898230B1F075\r\n:10103000833029F1813041F484819581841B950BA3\r\n:10104000AB01BC01615071092130310509F108F48F\r\n:1010500043C02230310509F463C00895848195812D\r\n:10106000DC01A61BB70BBD01615071098681978118\r\n:10107000DC01A41BB50BAD0141505109E5CF8681C0\r\n:101080009781861B970BBA01AC0141505109DCCF07\r\n:10109000CA0157FD0796A3E095958795AA95E1F7B4\r\n:1010A000A481B5818A9F90018B9F300D9A9F300D4E\r\n:1010B0001124620F731F078CF0A1E02DE60FF71FBC\r\n:1010C0004770552721E030E001C0220F4A95EAF72A\r\n:1010D0008081822B80830895CA0157FD079633E0F3\r\n:1010E000959587953A95E1F7A481B5818A9F9001FE\r\n:1010F0008B9F300D9A9F300D1124620F731F078C48\r\n:10110000F0A1E02DE60FF71F4770552781E090E032\r\n:1011100001C0880F4A95EAF7809590818923DACF3C\r\n:10112000CA0157FD079623E0959587952A95E1F723\r\n:10113000A481B5818A9F90018B9F300D9A9F300DBD\r\n:101140001124620F731F078CF0A1E02DE60FF71F2B\r\n:101150004770552721E030E001C0220F4A95EAF799\r\n:1011600080818227B7CF08958EBD00000DB407FEA1\r\n:10117000FDCF8EB508958CBD9DBD08950895FC01E9\r\n:101180006370668B8481958126813781613039F067\r\n:10119000633029F0918780873387228708953187CC\r\n:1011A00020879387828708952F923F924F925F9274\r\n:1011B0006F927F928F929F92AF92BF92CF92DF9267\r\n:1011C000EF92FF920F931F93CF93DF93CDB7DEB7CC\r\n:1011D0006A970FB6F894DEBF0FBECDBF9A8F898F86\r\n:1011E0007A8369834A01D22E18870F833701BC2C7A\r\n:1011F000DC0159962D913C915A972115310509F042\r\n:1012000015C118968D919C911997681779070CF064\r\n:10121000D9C11A968D919C91481759070CF0D2C1EB\r\n:101220004C2C512CB6E0CB9E600D711D11247C8797\r\n:101230006B87161617060CF0C5C1EA2DF0E0FA8789\r\n:10124000E98793E0EE0FFF1F9A95E1F7F88BEF87A0\r\n:10125000CF01840F951F181619060CF0B3C1A98D84\r\n:10126000BA8D58968C91811104C0BFEABD1508F45F\r\n:10127000D394A98DBA8DED91FC9111970284F385D9\r\n:10128000E02DCD010995B5E0DB9EC0011124E98177\r\n:10129000FA81FC83EB83312C212C9C0124593F4F94\r\n:1012A000388F2F8B4A2D50E05E8B4D8BEF89F88D58\r\n:1012B000E20DF31D44919E828D82D12CC12C698157\r\n:1012C0007A81620D731D7A8B698B842F90E09C8BE1\r\n:1012D0008B8BE98DFA8DA081B18140FF82C0F1E056\r\n:1012E000BF126FC0AF126DC01C96ED91FC912F81A3\r\n:1012F0003885A4014C0D5D1D69897A89898D9A8D87\r\n:101300000995EB89FC89F595E7954E2F5FEFC51A96\r\n:10131000D50A6D817E818D899E89680F791F7E83B4\r\n:101320006D8398E0C916D10481F6AFEF2A1A3A0A04\r\n:10133000EB81FC81E40DF51DFC83EB83F5E02F16BA\r\n:10134000310409F0B3CF2F81388526153705B9F060\r\n:10135000A98DBA8DED91FC91B1E0BB1257C0AB12D3\r\n:1013600055C069817A816B5F7F4F0088F189E02DDC\r\n:10137000830128E030E0A401898D9A8D0995A98D1B\r\n:10138000BA8DED91FC9111970688F789E02DCD017A\r\n:101390006A960FB6F894DEBF0FBECDBFDF91CF9136\r\n:1013A0001F910F91FF90EF90DF90CF90BF90AF9083\r\n:1013B0009F908F907F906F905F904F903F902F9075\r\n:1013C00009941E96ED91FC91EF80F88409851A85A9\r\n:1013D00092014D815E816B817C81898D9A8D099509\r\n:1013E00090CF2F8138852615370509F48ACF31E053\r\n:1013F000B31207C0A31205C01C96ED91FC91930196\r\n:1014000078CF1E96ED91FC917301E0CF6B857C85C2\r\n:10141000641975090684F785E02D73010F85188915\r\n:101420009201A401898D9A8D0995A9CFF90134966D\r\n:1014300045915491F901329685919491D41AB7E06F\r\n:10144000DB9E800D911D1124F901259134913C8B77\r\n:101450002B8BFC0125903490FC01329674903196D0\r\n:101460003491398B329664903196449041E04C151A\r\n:1014700018F04A1508F07FC0662D062C000C770B7B\r\n:101480007C836B83842D042C000C990B9E838D83AD\r\n:10149000A98DBA8DED91FC9111970284F385E02D11\r\n:1014A000CD010995512CD12CC12CEA2DF0E0FA8701\r\n:1014B000E9872B2D30E03C872B87A401440D511D7B\r\n:1014C00047FC5A95588F4F8B69817A81660D711D43\r\n:1014D00067FC7A957E876D877989C71608F04FCFAC\r\n:1014E0002C2D30E04D815E81420F531FA985BA85B6\r\n:1014F0004A9FC0014B9F900D5A9F900D1124FC01F3\r\n:10150000E80DF91DF88BEF87852D612C4F89588DDB\r\n:10151000420F531F5E8B4D8B671408F050C044245C\r\n:101520004394480E877041F4C1010196EB89FC8910\r\n:10153000E20DF31DD4901C01D7FE19C0A98DBA8D00\r\n:10154000ED91FC91662D70E0B1E0BB1219C0AB12B9\r\n:1015500017C02D853E85620F731F0484F585E02D2D\r\n:101560002F8138854D895E89898D9A8D0995DD0C8D\r\n:101570006394842DD1CF1E821D821C821B8288CF52\r\n:101580004B815C81640F751FAB85BC856A9FC00170\r\n:101590006B9F900D7A9F900D112469817A81680F5D\r\n:1015A000791F0684F785E02DEF80F88409851A8578\r\n:1015B0009D014F855889898D9A8D0995D8CF570CF3\r\n:1015C000C3948ACF6A960FB6F894DEBF0FBECDBF24\r\n:1015D000DF91CF911F910F91FF90EF90DF90CF900F\r\n:1015E000BF90AF909F908F907F906F905F904F9043\r\n:1015F0003F902F9008958F929F92AF92CF92EF924B\r\n:10160000FF920F931F93CF93DF93EC01262F898DC9\r\n:101610009A8D009709F051C06A30D1F41D861C865E\r\n:101620008D8948E0849F900111248E859F85820FCB\r\n:10163000931F9F878E8781E090E0DF91CF911F916C\r\n:101640000F91FF90EF90CF90AF909F908F90089563\r\n:101650006D3089F3CC88AD888F898823C1F08C8563\r\n:101660009D8536E0C39E800D911D112448855985C6\r\n:101670004817590764F44E855F851D861C8638E03F\r\n:10168000A39EC0011124840F951F9F878E87EA882F\r\n:10169000FB88088919894E855F856C857D85CE011B\r\n:1016A0000E94D4082C898C859D8546E0249F800D5E\r\n:1016B000911D11249D878C87BECF6A3069F41D86E9\r\n:1016C0001C86FC013896E4912D898E859F85E29FCA\r\n:1016D000800D911D1124ADCF6D3009F4ACCFFC010C\r\n:1016E00034964591549170E06417750708F4A3CFC0\r\n:1016F000FC013696A591B491A617B70708F49BCFC5\r\n:10170000FC01329685909490362F341B47E0349F2D\r\n:10171000800C911C1124F401329634913196E4919D\r\n:101720003323A9F1EE2399F1CC88F4013596E491A5\r\n:10173000AD884F89442301F10E2E000CFF0BE30FFF\r\n:10174000F11DCE9EA001CF9E500D11246C857D858C\r\n:10175000460F571F68857985641775076CF44E85A9\r\n:101760005F851D861C86FC013896E491AE9E400D77\r\n:10177000511D11245F874E87EA88FB8808891989E3\r\n:101780004E855F856C857D85CE010E94D408F4016D\r\n:101790003496E4912C898C859D85E29F800D911D66\r\n:1017A000112488CF6F927F928F929F92AF92BF92B7\r\n:1017B000CF92DF92EF92FF920F931F93CF93DF931D\r\n:1017C000EC016B015A0139014801E881F981028479\r\n:1017D000F385E02D0995E881F9810288F389E02DF0\r\n:1017E00087019301A501B601CE010995A501480D18\r\n:1017F000591D41505109E881F9810288F389E02D92\r\n:101800009301B601CE010995E881F9810088F1893B\r\n:10181000E02D9401A501B601CE010995C60CD71C97\r\n:10182000B60161507109E881F9810088F189E02DE4\r\n:101830009401A501CE010995E881F9810688F7890F\r\n:10184000E02DCE01DF91CF911F910F91FF90EF908E\r\n:10185000DF90CF90BF90AF909F908F907F906F90D0\r\n:1018600009946F927F928F929F92AF92BF92CF9284\r\n:10187000DF92EF92FF920F931F93CF93DF935C0160\r\n:10188000EB016A01490138018701DC01ED91FC910E\r\n:101890006217730719F5641675062CF0962D872DBF\r\n:1018A0003A01C92ED82E9601261937092F5F3F4FCE\r\n:1018B000048CF58DE02DA301BE01C5010995DF91D2\r\n:1018C000CF911F910F91FF90EF90DF90CF90BF903D\r\n:1018D000AF909F908F907F906F9008954615570519\r\n:1018E00091F42617370724F0892D4B01C22FD82FEA\r\n:1018F0009E01281939092F5F3F4F068CF78DE02D87\r\n:10190000A601B401DACF0284F385E02D0995D50153\r\n:10191000ED91FC910488F589E02D83019401A601E5\r\n:10192000BE01C5010995D501ED91FC910688F789A5\r\n:10193000E02DC501DF91CF911F910F91FF90EF90A6\r\n:10194000DF90CF90BF90AF909F908F907F906F90DF\r\n:101950000994EF92FF920F931F93DC011A960D9159\r\n:101960001C911B9718962D913C911997ED91FC9124\r\n:1019700000A0F1A1E02D7B0150E040E070E060E0CC\r\n:1019800009951F910F91FF90EF9008954F925F92EC\r\n:101990006F927F928F929F92AF92BF92CF92DF927F\r\n:1019A000EF92FF920F931F93CF93DF936C012B0164\r\n:1019B0005A0139014801DC01ED91FC910284F38563\r\n:1019C000E02D0995E201640C751CD601ED91FC91A6\r\n:1019D000C615D7055CF40088F189E02D87019401D4\r\n:1019E000A501BE01C60109952196EFCF0688F789AA\r\n:1019F000E02DC601DF91CF911F910F91FF90EF90E5\r\n:101A0000DF90CF90BF90AF909F908F907F906F901E\r\n:101A10005F904F9009948F929F92AF92BF92CF9216\r\n:101A2000DF92EF92FF920F931F93CF93DF93EC011E\r\n:101A30005B014A016901E881F9810284F385E02DA7\r\n:101A4000099595012C0D3D1D21503109E881F98141\r\n:101A50000488F589E02D78018401A401B501CE0147\r\n:101A60000995E881F9810688F789E02DCE01DF919B\r\n:101A7000CF911F910F91FF90EF90DF90CF90BF908B\r\n:101A8000AF909F908F9009948F929F92AF92BF9248\r\n:101A9000CF92DF92EF92FF920F931F93CF93DF933A\r\n:101AA000EC015B014A0169017801E881F981028456\r\n:101AB000F385E02D0995C80CD91C86010150110948\r\n:101AC000E881F9810488F589E02D9501A401B5012B\r\n:101AD000CE010995E881F9810688F789E02DCE01CC\r\n:101AE000DF91CF911F910F91FF90EF90DF90CF90FA\r\n:101AF000BF90AF909F908F900994EF92FF920F93B9\r\n:101B00001F93DC01ED91FC9100A0F1A1E02D09955E\r\n:101B10001F910F91FF90EF9008950F931F93DC0199\r\n:101B2000ED91FC91068CF78DE02D09951F910F9199\r\n:101B300008950F931F93DC01ED91FC91048CF58DBA\r\n:101B4000E02D09951F910F9108952F923F924F928A\r\n:101B50005F926F927F928F929F92AF92BF92CF923D\r\n:101B6000DF92EF92FF920F931F93CF93DF93CDB746\r\n:101B7000DEB72C970FB6F894DEBF0FBECDBF3C0189\r\n:101B80007C836B835C874B871801270181E090E0A1\r\n:101B90005C01A41AB50ACA01919581959109AC011D\r\n:101BA000440F551F5A834983C80101969E838D8334\r\n:101BB000F12CE12C88248394912C922F91709F8397\r\n:101BC00022702887AB014F5F5F4F5A8749878B850B\r\n:101BD0009C85E816F9060CF07AC0CB84DC84B7FC4F\r\n:101BE0000CC06C0191E0C91AD10849815A814E5F3D\r\n:101BF0005F4F5A834983A40EB51E5FEFE51AF50ABD\r\n:101C000082E0880E911CA80CB91CCE14DF0464F18C\r\n:101C10009F81992399F09601220F331F4D815E8198\r\n:101C2000240F351F82014B815C814C195D09B7017E\r\n:101C3000660D771D8FE492E00E94990D588555231B\r\n:101C400099F09601220F331F8D819E81280F391F35\r\n:101C500082014B815C814C195D09B3016E197F09CA\r\n:101C60008FE492E00E94990D4B855C854C155D05D3\r\n:101C700059F15F81552391F0940122503109220DD1\r\n:101C8000331D820149855A854E195F096B857C8514\r\n:101C9000660D771D8FE492E00E94990D8885882358\r\n:101CA00099F0940122503109220D331DB3014B8567\r\n:101CB0005C85641B750B820149855A854E195F0945\r\n:101CC0008FE492E00E94990DDC86CB8680CF2C9623\r\n:101CD0000FB6F894DEBF0FBECDBFDF91CF911F913D\r\n:101CE0000F91FF90EF90DF90CF90BF90AF909F90BB\r\n:101CF0008F907F906F905F904F903F902F900895BE\r\n:101D00002F923F924F925F926F927F928F929F920B\r\n:101D1000AF92BF92CF92DF92EF92FF920F931F93F9\r\n:101D2000CF93DF932C014B015A016901E901D5954D\r\n:101D3000C7950C171D070CF4E8013E01660C771CD3\r\n:101D40001E01240C351C950126193709EE24E39455\r\n:101D5000F12C8601A401B1018FE492E00E947D0D77\r\n:101D6000C618D70881E0C81AD1088C0E9D1EA40C95\r\n:101D7000B51CC5018C1B9D0B860121E0AE01B40191\r\n:101D800001970E94A50D22E0AE01B401C1010E949D\r\n:101D9000A50DDF91CF911F910F91FF90EF90DF90F4\r\n:101DA000CF90BF90AF909F908F907F906F905F90FB\r\n:101DB0004F903F902F900895AF92BF92CF92DF92B5\r\n:101DC000EF92FF920F931F93CF93DF936C015B0110\r\n:101DD000EA0179019A01220F331F2F5F3F4FAB01B8\r\n:101DE0004C1B5D0B8701B6018FE492E00E94990DB8\r\n:101DF00010E000E023E0AE01B501C6010E94A50D90\r\n:101E0000DF91CF911F910F91FF90EF90DF90CF90D6\r\n:101E1000BF90AF900895DC01ED91FC910084F185B5\r\n:101E2000E02D09943F924F925F926F927F928F9232\r\n:101E30009F92AF92BF92CF92DF92EF92FF920F9359\r\n:101E40001F93CF93DF935C017B014A016901390144\r\n:101E500087E0680E711C93E0759467949A95E1F79A\r\n:101E60002B01400E511E10E000E0312CD0E0C0E00C\r\n:101E7000CE0187709927330C892B59F4FE0183E03A\r\n:101E8000F595E7958A95E1F7E00FF11FE80DF91D4B\r\n:101E9000349037FE0AC021E030E0A701B5016C0F95\r\n:101EA0007D1F8FE492E00E940B0F2196CC16DD0679\r\n:101EB000F9F68FEFE81AF80A060D171DE414F50479\r\n:101EC000A9F6DF91CF911F910F91FF90EF90DF90D6\r\n:101ED000CF90BF90AF909F908F907F906F905F90CA\r\n:101EE0004F903F9008952F923F924F925F926F9242\r\n:101EF0007F928F929F92AF92BF92CF92DF92EF929A\r\n:101F0000FF920F931F93CF93DF9300D000D000D0A8\r\n:101F1000CDB7DEB73C016A013E832D83FC82EB82A4\r\n:101F20005801A41AB50AB7FE03C0B194A194B10830\r\n:101F30008D809E80861A970A97FE03C091948194A3\r\n:101F400091088A149B045CF0902F812F0D811E81D3\r\n:101F50009D838E839C2D8D2D6B01692F782F0C1501\r\n:101F60001D055CF09D818E817E836D83692F782FA6\r\n:101F7000902F812F8601C92ED82E1601201A310AE2\r\n:101F80002B012D813E81421A530A57FE03C0519402\r\n:101F900041945108710137FE03C03FEFE31AF30A81\r\n:101FA000F594E7948D819E81861797075CF5A1E0F3\r\n:101FB000B0E0BA83A983C016D1064CF1D301ED91EC\r\n:101FC000FC910484F585E02D2B813C81A8016D8175\r\n:101FD0007E818A149B041CF04D815E81B801C3018F\r\n:101FE0000995E418F508F7FE0AC02D813E81898124\r\n:101FF0009A81280F391F3E832D83E20CF31C0F5F5B\r\n:102000001F4FD9CF2FEF3FEF3A832983D4CF2696A6\r\n:102010000FB6F894DEBF0FBECDBFDF91CF911F91F9\r\n:102020000F91FF90EF90DF90CF90BF90AF909F9077\r\n:102030008F907F906F905F904F903F902F9008957A\r\n:102040000895CF92DF92EF92FF92CF93DF93EC014E\r\n:10205000603282E07807CCF5653B710514F064EBE3\r\n:1020600070E0898128E830E0281B310987FD33952D\r\n:10207000220F331F220F331F6901330FEE08FF08B1\r\n:102080008A8128E532E0281B310987FD3395220F2C\r\n:10209000331F220F331F032E000C440B550B2C193A\r\n:1020A0003D094E095F09DB0177FF02C0B0E0A0E007\r\n:1020B0000E949C1C24EB30E040E050E00E94721C27\r\n:1020C000C20ED31EE41EF51EB601E881EC3070F599\r\n:1020D000298188E890E0821B910927FD9395880F5C\r\n:1020E000991F880F991F681779077CF02A8188E566\r\n:1020F00092E0821B910927FD9395880F991F880F05\r\n:10210000991F681779070CF4CB010297880F991F64\r\n:102110004FB7F8942E2F30E0F901EE0FFF1FE20FBA\r\n:10212000F31FEA50FE4F928381834FBFDF91CF911F\r\n:10213000FF90EF90DF90CF9008951F93CF93DF93A0\r\n:10214000EC01162F88818C3008F04DC0862F0E943C\r\n:102150006C058881282F30E0F901EE0FFF1FE20F98\r\n:10216000F31FEA50FE4F1F736081607C612B608318\r\n:1021700019821A822CE0622F0E94D51C829FB00126\r\n:10218000112430E020E0AB01420F531FFA01EE0FA3\r\n:10219000FF1FE40FF51FEA50FE4F908196FD16C019\r\n:1021A0002F5F3F4F2C30310571F781110FC0109216\r\n:1021B000800082E08093810010928500109284005C\r\n:1021C000B19A80916F00826080936F00E8818E2FBA\r\n:1021D00090E0FC01EE0FFF1FE80FF91FEA50FE4FE1\r\n:1021E0008081806480838881DF91CF911F910895E1\r\n:1021F0002091AA01260F3327331F21323105ECF439\r\n:102200002091CE01FC0190E080E0243069F082E072\r\n:102210000895A091AA012191AC0146575E4FA40FE9\r\n:10222000B52FB11D2C930196861798F38091AA01C2\r\n:10223000680F6093AA0180E0089581E008951092EC\r\n:10224000CE0181E08093D0011092CF0161E082E164\r\n:102250000E948B0561E083E10E948B05E9EBF0E0D1\r\n:1022600080818E7F808380818D7F808388E48093CE\r\n:10227000B80085E48093BC000895CF93DF9391E08C\r\n:10228000909389018823B9F0C091B800D091BA0029\r\n:102290008091BC008A7B8093BC0060E082E10E9458\r\n:1022A0008B0560E083E10E948B050E941F11D09393\r\n:1022B000BA00C093B800DF91CF910895E091200259\r\n:1022C00080911F02E81730F4F0E0EC59FE4F808156\r\n:1022D00090E008958FEF9FEF0895909120028091F4\r\n:1022E0001F022FEF3FEF981748F4E92FF0E0EC5969\r\n:1022F000FE4F208130E09F5F90932002C901089536\r\n:1023000080911F0290912002891B990B0895CF9212\r\n:10231000DF92EF92FF920F931F93CF93DF937C0195\r\n:10232000CB018A0120912D02222389F0EB016B0160\r\n:10233000C40ED51ECC15DD0569F06991D701ED916C\r\n:10234000FC910190F081E02DC7010995F3CF642F36\r\n:102350000E94F810C801DF91CF911F910F91FF905B\r\n:10236000EF90DF90CF900895CF93DF931F92CDB77A\r\n:10237000DEB7698320912D022223F9F020912A02F1\r\n:10238000203258F021E030E0FC013383228390E0DA\r\n:1023900080E00F90DF91CF91089580912B02E82F7C\r\n:1023A000F0E0EC5BFE4F998190838F5F80932B026E\r\n:1023B00080932A0281E090E0ECCF61E0CE010196AB\r\n:1023C0000E94F810F7CFCF92DF92EF92FF920F9317\r\n:1023D0001F93CF93DF93D0912A0281E0D13208F08E\r\n:1023E0009CC0C0912C020E94D7056B017C0180919A\r\n:1023F000CE0181116CC082E08093CE0181E0809398\r\n:10240000D0018FEF8093CD011092F201D093F101B2\r\n:10241000A4E4B1E0E1EDF1E080E0D8138DC01092CA\r\n:10242000F3018091F301CC0FC82BC093F30180918D\r\n:10243000CF01813009F084C01092CF010E94D705EE\r\n:102440006B017C018091F3018093BB008091850139\r\n:1024500090918601A0918701B0918801892B8A2BE8\r\n:102460008B2BA1F00E94D705009185011091860168\r\n:1024700020918701309188016C197D098E099F098F\r\n:10248000061717072807390708F442C08091BC00D7\r\n:1024900083FDD8CF85EC8093BC000E94D7056B01EB\r\n:1024A0007C018091CE01823009F44CC08091CD0135\r\n:1024B0008F3F09F469C08091CD01803209F466C074\r\n:1024C0008091CD01803309F463C084E026C08091FF\r\n:1024D000850190918601A0918701B0918801892B97\r\n:1024E0008A2B8B2B09F483CF0E94D705009185019D\r\n:1024F0001091860120918701309188016C197D0926\r\n:102500008E099F09061717072807390708F06FCFAC\r\n:10251000809184010E943D1185E010922B0210925F\r\n:102520002A0210922D02DF91CF911F910F91FF90FF\r\n:10253000EF90DF90CF9008959D9191938F5F6DCF35\r\n:1025400085EEA9CF8091850190918601A0918701A8\r\n:10255000B0918801892B8A2B8B2B09F4A2CF0E9482\r\n:10256000D705009185011091860120918701309156\r\n:1025700088016C197D098E099F090617170728071E\r\n:10258000390708F08ECFC4CF80E0C7CF82E0C5CF37\r\n:1025900083E0C3CFEF92FF920F931F93CF93DF930C\r\n:1025A0007C01C62F80916C0290916D02009709F416\r\n:1025B00059C02091700231E030932D0220932C02FB\r\n:1025C00010922B0210922A02DC01ED91FC910190F5\r\n:1025D000F081E02D60E009958701EE24E394F12C71\r\n:1025E000D1E0C15080916C0290916D02CF3F91F18A\r\n:1025F000B0E2EB16F104D8F00E94E31180916C0276\r\n:1026000090916D0220917002D0932D0220932C02A4\r\n:1026100010922B0210922A02DC01ED91FC910190A4\r\n:10262000F081E02D60E00995EE24E394F12C809197\r\n:102630006C0290916D02F8016491DC01ED91FC91C6\r\n:102640000190F081E02D0995BFEFEB1AFB0A0F5FB7\r\n:102650001F4FC7CFDF91CF911F910F91FF90EF9048\r\n:102660000C94E311E0917C02F0917D0290818091C5\r\n:1026700082028095892380838701C15008F438C085\r\n:10268000F801849120916A0230916B02232B29F08A\r\n:102690000E94B4080F5F1F4FF0CF28E030E040E801\r\n:1026A000E0917802F091790290918002582F5423A2\r\n:1026B000D9F05081952B9083E0917A02F0917B02C2\r\n:1026C000908150918102952B9083E0917A02F09154\r\n:1026D0007B0250819091810290959523908346953D\r\n:1026E00021503109E9F6D6CF508190959523E3CF5B\r\n:1026F000DF91CF911F910F91FF90EF9008951F935D\r\n:10270000CF93DF93EC018D8D9E8D009721F1162FD5\r\n:1027100029A131E030932D0220932C0210922B023C\r\n:1027200010922A02DC01ED91FC910190F081E02DE4\r\n:1027300060E009958D8D9E8DDC01ED91FC910190FD\r\n:10274000F081E02D612F09958D8D9E8DDF91CF91C8\r\n:102750001F910C94E311ADA5BEA59C918BA980950A\r\n:1027600089238C938B8D9C8D892B31F0862FDF9163\r\n:10277000CF911F910C94B40828E030E080E8A9A51F\r\n:10278000BAA599A9462F4823C1F04C91942B9C934C\r\n:10279000ABA5BCA59C914AA9942B9C93ABA5BCA5C9\r\n:1027A0004C919AA9909594239C9386952150310938\r\n:1027B00031F7DF91CF911F9108954C91909594231B\r\n:1027C000E6CF1F93CF93DF93EC01162F8D8D9E8D57\r\n:1027D000892BB1F12DA93EA94FA958AD60E074E253\r\n:1027E00084EF90E00E94A41C205131094109510955\r\n:1027F00056954795379527952093B80066EA1111AD\r\n:1028000067EACE010E947F138D8D9E8D892B41F149\r\n:1028100029AD3AAD4BAD5CAD60E074E284EF90E081\r\n:102820000E94A41C20513109410951095695479530\r\n:10283000379527952093B800DF91CF911F91089588\r\n:102840008B8D9C8D892B21F08EAD9FAD0E94BB0896\r\n:10285000EFA5F8A990818CA9809589238083CECF9C\r\n:10286000EFA5F8A980819CA9892B8083E5CF90E012\r\n:1028700080E00895CF92DF92EF92FF920F931F9323\r\n:10288000CF93DF936C017B018A01BC018DE392E061\r\n:102890000E942110C4EBD0E0BE016C197D098AE3CF\r\n:1028A00092E00E942110B70187E392E00E9421107C\r\n:1028B000BE016E197F0984E392E00E942110B801E5\r\n:1028C00081E392E00E942110B8018EE292E0DF9154\r\n:1028D000CF911F910F91FF90EF90DF90CF900C94CC\r\n:1028E00021102091550230915602C901079697FD9B\r\n:1028F000079623E0959587952A95E1F72091530255\r\n:1029000030915402829FA001839F500D929F500DE1\r\n:10291000112470E060E080916E0290916F020C943F\r\n:10292000111EDF92EF92FF920F931F93CF93DF93CD\r\n:10293000EC010E94711421E030E04FE050E021975B\r\n:1029400009F0E0C06CE170E086E290E00E94DC0EED\r\n:1029500021E030E04FE050E06CE170E08AE590E08B\r\n:102960000E94DC0EF12CE12C04E110E024E230E0C6\r\n:102970004CE150E064E170E08FE492E00E94C60C0C\r\n:1029800024E230E04CE150E068E470E08FE492E053\r\n:102990000E94C60C06E010E02CE030E04CE350E072\r\n:1029A0006EE270E082E290E00E94800E80916C0204\r\n:1029B00090916D02892B09F4D4C02091840230914A\r\n:1029C0008502409186025091870260E074E284EFB4\r\n:1029D00090E00E94A41C20513109410951095695EB\r\n:1029E0004795379527952093B80064E088E690E0F6\r\n:1029F0000E94CA1280915302909154028034910532\r\n:102A000009F0C6C060E28FE492E00E947F136091FB\r\n:102A10005302615E8FE492E00E947F132091550281\r\n:102A200030915602C901079697FD079633E09595B8\r\n:102A300087953A95E1F72091530230915402829F95\r\n:102A40008001839F100D929F100D1124C0916E0282\r\n:102A5000D0916F0280916C0290916D020C0F1D1F3E\r\n:102A6000009709F4C7C02091700231E030932D0225\r\n:102A700020932C0210922B0210922A02DC01ED917D\r\n:102A8000FC910190F081E02D60E40995EE24E3943F\r\n:102A9000F12CDD24D39480916C0290916D020C177F\r\n:102AA0001D0709F47EC0B0E2EB16F104D8F00E94D5\r\n:102AB000E31180916C0290916D0220917002D0928E\r\n:102AC0002D0220932C0210922B0210922A02DC017C\r\n:102AD000ED91FC910190F081E02D60E40995EE24E8\r\n:102AE000E394F12C80916C0290916D026991DC016C\r\n:102AF000ED91FC910190F081E02D0995BFEFEB1A6B\r\n:102B0000FB0AC9CF68E170E086E290E00E94DC0E2B\r\n:102B100021E030E04FE050E068E170E08AE590E0CD\r\n:102B20000E94DC0E30E020E046E050E068E170E01A\r\n:102B300086E290E00E94DC0E30E020E046E050E0CB\r\n:102B400068E170E08AE590E00E94DC0E04E010E0AD\r\n:102B500028E030E040E350E062E370E088E290E09B\r\n:102B600023CF80916A0290916B02892B31F0809182\r\n:102B70008D0290918E020E94BB08E0917E02F0913E\r\n:102B80007F029081809183028095892380832DCF5D\r\n:102B900060E08FE492E00E947F13609153026150E5\r\n:102BA00039CF0E94E31180916C0290916D02892BC4\r\n:102BB00009F461C0209188023091890240918A0213\r\n:102BC00050918B0260E074E284EF90E00E94A41CBC\r\n:102BD0002051310941095109569547953795279557\r\n:102BE0002093B800DF91CF911F910F91FF90EF904C\r\n:102BF000DF900895E0917C02F0917D0280819091B8\r\n:102C00008202892B80830C171D0769F2899120911C\r\n:102C10006A0230916B02232B19F00E94B408F3CFA3\r\n:102C200028E030E040E8E0917802F091790290915C\r\n:102C30008002582F5423D9F05081952B9083E09136\r\n:102C40007A02F0917B02908150918102952B9083C2\r\n:102C5000E0917A02F0917B025081909181029095EF\r\n:102C600095239083469521503109E9F6CCCF5081C8\r\n:102C700090959523E3CFE0917E02F0917F028081D1\r\n:102C800090918302892B8083ADCF0E940C1E85ED2D\r\n:102C90008093BC008091850190918601A09187016D\r\n:102CA000B09188010796A11DB11D23E0B695A795A7\r\n:102CB000979587952A95D1F72091BC0024FD03C0F4\r\n:102CC0001092CE0108954091850150918601609146\r\n:102CD000870170918801452B462B472B69F300979C\r\n:102CE000A105B10541F02AE22A95F1F700C001974C\r\n:102CF000A109B109E1CF809184010C943D111F928B\r\n:102D00000F920FB60F9211242F933F938F939F939F\r\n:102D1000AF93BF938091220290912302A09124024D\r\n:102D2000B09125023091210223E0230F2D3758F571\r\n:102D30000196A11DB11D2093210280932202909340\r\n:102D40002302A0932402B093250280912602909141\r\n:102D50002702A0912802B09129020196A11DB11D60\r\n:102D60008093260290932702A0932802B093290211\r\n:102D7000BF91AF919F918F913F912F910F900FBE77\r\n:102D80000F901F90189526E8230F0296A11DB11DE4\r\n:102D9000D2CF1F920F920FB60F9211242F933F9311\r\n:102DA0004F935F936F937F938F939F93AF93BF9353\r\n:102DB000CF93DF93EF93FF938091F401C091F501DE\r\n:102DC000D0E087FF24C0109285001092840080918B\r\n:102DD000F4018F5F8093F4018091F401082E000CC0\r\n:102DE000990B8C179D0724F48091F4018C30C4F169\r\n:102DF0008091840090918500049680349C4908F469\r\n:102E00007AC08091840090918500049676C080916C\r\n:102E1000F401082E000C990B8C179D07C4F6E09165\r\n:102E2000F4018E2FEE0F990BFC01EE0FFF1FE80F40\r\n:102E3000F91FEA50FE4F808186FFC9CFE091F4016F\r\n:102E40008E2FEE0F990BFC01EE0FFF1FE80FF91FFD\r\n:102E5000EA50FE4F808160E08F730E948B05B7CFF0\r\n:102E60002091840030918500E091F4018E2FEE0FC7\r\n:102E7000990BFC01EE0FFF1FE80FF91FEA50FE4F00\r\n:102E800081819281820F931F9093890080938800A3\r\n:102E9000E091F4018E2FEE0F990BFC01EE0FFF1F56\r\n:102EA000E80FF91FEA50FE4F808186FF11C0E091C4\r\n:102EB000F4018E2FEE0F990BFC01EE0FFF1FE80FB0\r\n:102EC000F91FEA50FE4F808161E08F730E948B05ED\r\n:102ED000FF91EF91DF91CF91BF91AF919F918F9132\r\n:102EE0007F916F915F914F913F912F910F900FBE06\r\n:102EF0000F901F90189580E49CE99093890080932F\r\n:102F000088008FEF8093F401E3CF1F920F920FB6EA\r\n:102F10000F9211242F933F934F935F936F937F935F\r\n:102F20008F939F93AF93BF93EF93FF938091B900DB\r\n:102F3000887F803609F44AC0F0F5883209F4A7C0CA\r\n:102F400018F5803109F49BC0B8F4882309F4F9C05E\r\n:102F5000883009F494C0FF91EF91BF91AF919F9198\r\n:102F60008F917F916F915F914F913F912F910F9032\r\n:102F70000FBE0F901F901895883109F488C08032D9\r\n:102F800051F78093CD0114C0803409F49DC040F402\r\n:102F90008033B9F38833F9F68093CD0185ECB0C066\r\n:102FA000803509F485C0883509F496C0883499F6CF\r\n:102FB0000E944716D0CF883909F48CC038F588377D\r\n:102FC00029F050F4883611F0803729F683E0809399\r\n:102FD000CE011092CC0157C0883809F47BC08039EB\r\n:102FE00019F0803809F0B7CF8091CC01803208F019\r\n:102FF00071C0E091CC0181E08E0F8093CC01809173\r\n:10300000BB00F0E0E455FE4F80833DC0803B39F0CB\r\n:10301000E0F4803A09F479C0883A09F09CCF84E062\r\n:103020008093CE011092AB011092AA01E0911D0293\r\n:10303000F0911E0209958091AA0181110FC081E0D3\r\n:103040008093AA0110928A0109C0803C09F4A6CF9E\r\n:10305000883C09F4A3CF883B09F07DCFE091AB0118\r\n:1030600081E08E0F8093AB01F0E0E657FE4F808148\r\n:103070008093BB009091AB018091AA0129C08091FF\r\n:10308000F3018093BB0085EC8093BC0064CF9091EA\r\n:10309000F2018091F101981758F5E091F20181E079\r\n:1030A0008E0F8093F201F0E0EF52FE4F8081E9CF66\r\n:1030B000E091F20181E08E0F8093F2018091BB00DC\r\n:1030C000F0E0EF52FE4F80839091F2018091F10188\r\n:1030D0009817C8F285E8D8CFE091F20181E08E0F11\r\n:1030E0008093F2018091BB00F0E0EF52FE4F8083AD\r\n:1030F0008091D00181115CCF81E08093CF0184EA7F\r\n:103100008093BC001092CE0126CF85EC8093BC004A\r\n:103110001092CE018091CC01803230F4E091CC014C\r\n:10312000F0E0E455FE4F10826091CC0170E0E09138\r\n:103130001B02F0911C028CEA91E009951092CC01DF\r\n:103140000ACF1092CD0134CFFC019091F5019C3053\r\n:1031500098F481E0890F8093F5019083892F90E0A6\r\n:10316000FC01EE0FFF1FE80FF91FEA50FE4F88EB3E\r\n:103170009BE09283818308958FEF80830895A3E479\r\n:10318000B2E013961C921E92129748EE53E060E054\r\n:1031900070E014964D935D936D937C9317978AE03E\r\n:1031A00091E011969C938E93EFE4F2E013821282E9\r\n:1031B00020E830E03583248380E490E097838683A1\r\n:1031C0003187208793878287168A1586148617860B\r\n:1031D000168681E0858B848B2FEF3FEF338B228B1C\r\n:1031E000318B208B878B108E128E118E8CE191E0AB\r\n:1031F00091838083148E138EB68FA58F10A2178EA5\r\n:103200008FEF84A385A386A387A380A780E89AE194\r\n:10321000A6E0B0E085AB96ABA7ABB0AF80EA96E88E\r\n:10322000A1E0B0E081AF92AFA3AFB4AF80E586AFCD\r\n:1032300017AE80E492E00E94A4188DE392E00E9411\r\n:10324000A4188AE392E00E94A41887E392E00E9407\r\n:10325000A41884E392E00E94A41881E392E00E9403\r\n:10326000A4188EE292E00C94A418789484B582603D\r\n:1032700084BD84B5816084BD85B5826085BD85B51A\r\n:10328000816085BD80916E00816080936E00109298\r\n:103290008100809181008260809381008091810013\r\n:1032A00081608093810080918000816080938000A4\r\n:1032B0008091B10084608093B1008091B000816002\r\n:1032C0008093B00080917A00846080937A0080912E\r\n:1032D0007A00826080937A0080917A008160809386\r\n:1032E0007A0080917A00806880937A001092C10001\r\n:1032F00063E070E080E492E00E949D106AE570E077\r\n:1033000080E492E00E9421106BE070E08DE392E097\r\n:103310000E949D1062E070E08AE392E00E949D109E\r\n:103320006DE070E087E392E00E949D106EE070E037\r\n:1033300084E392E00E949D106FE070E081E392E0F0\r\n:103340000E949D1060E170E08EE292E00E949D106C\r\n:1033500044E150E06AE570E08AE590E00E943A14AA\r\n:1033600080916E0290916F02892B11F10E9471146D\r\n:10337000209155023091560280915302909154024F\r\n:10338000213231050CF0A3C0B9016052710977FFF9\r\n:1033900002C06F5F7F4F759567958357910997FDC1\r\n:1033A000019600E210E023E730E04EE855E0A2C0CD\r\n:1033B0002091550230915602C901079697FD079654\r\n:1033C000B3E095958795BA95E1F720915302309136\r\n:1033D0005402AC01429FC001439F900D529F900D3B\r\n:1033E00011240E94E71C90936F0280936E02892B38\r\n:1033F00009F0BCCF90E080E00E94911460EB74E093\r\n:1034000080E090E00E94FC0544E150E064E670E05A\r\n:103410008AE590E00E943A146CED75E080E090E05F\r\n:103420000E94FC0540E450E064E670E08AE590E02C\r\n:103430000E943A1468EE73E080E090E00E94FC0580\r\n:1034400081E090E00E94911440E450E064E670E076\r\n:103450008CE390E00E943A146CED75E080E090E01F\r\n:103460000E94FC0540E450E064E670E08AE590E0EC\r\n:103470000E943A146CED75E080E090E00E94FC053B\r\n:1034800044E150E064E670E08AE590E00E943A147E\r\n:1034900068EE73E080E090E00E94FC0544E150E0BB\r\n:1034A0006AE570E08AE590E00E943A1460E273E019\r\n:1034B00080E090E00E94FC0590E080E00E94911482\r\n:1034C000C0E0D0E02097F1F30E940000FBCFB901EB\r\n:1034D0006054710977FF02C06F5F7F4F75956795E4\r\n:1034E0008255910997FD019600E410E022E530E055\r\n:1034F0004EE657E0959587950E94120F82E08093E3\r\n:10350000710280916C0290916D02892B09F493C035\r\n:103510008CE3809370021092200210921F0210928E\r\n:103520002B0210922A020E941F118EE296E09093C5\r\n:103530001E0280931D028FE296E090931C028093FE\r\n:103540001B028091770287FD1DC00E946C0561E01F\r\n:10355000809177020E948B0561E070E080E090E04E\r\n:103560000E94FC0560E0809177020E948B056AE072\r\n:1035700070E080E090E00E94FC0561E080917702BD\r\n:103580000E948B0580916C0290916D02892B09F449\r\n:1035900009C12091840230918502409186025091A8\r\n:1035A000870260E074E284EF90E00E94A41C205146\r\n:1035B000310941095109569547953795279520932B\r\n:1035C000B80064E08AE895E00E94CA126091550252\r\n:1035D00061508FE492E00E947F1364E086E895E0FA\r\n:1035E0000E94CA128091710264E1813009F460E1A5\r\n:1035F0008FE492E00E947F1364E082E895E00E94ED\r\n:10360000CA128FE880938C028091530290915402E9\r\n:103610008038910509F029C1809155029091560298\r\n:103620008034910509F031C180917102813009F433\r\n:10363000D0C08FECCFC0809175020E946C05809144\r\n:1036400076020E946C0580917502082E000C990B81\r\n:10365000FC01EA5AF54FE491F0E0EE0FFF1FEE5B3C\r\n:10366000F54F2591349130937D0220937C02FC012B\r\n:10367000E659F54FE491E093820280917602082E9C\r\n:10368000000C990BFC01EA5AF54FE491F0E0EE0FC3\r\n:10369000FF1FEE5BF54FA591B491B0937F02A0930D\r\n:1036A0007E02FC01E659F54FE491E09383028C9190\r\n:1036B000E82BEC9380916A0290916B02892B89F13F\r\n:1036C000CFB7F89480911A02811124C0E0E6FAE0A5\r\n:1036D0008491E4E7FAE09491E82FF0E0EE0FFF1F09\r\n:1036E000E45BF54FA591B491EC91E92321F461E0FD\r\n:1036F0008AE00E948B058AE00E946C058CB580618F\r\n:103700008CBD8CB580648CBD8DE00E946C058BE017\r\n:103710000E946C0580911A028F5F80931A02CFBFBE\r\n:1037200010CF809173020E946C05809174020E94F8\r\n:103730006C0580917302082E000C990BFC01EA5A6B\r\n:10374000F54FE491F0E0EE0FFF1FEE5BF54F259192\r\n:1037500034913093790220937802FC01E659F54FB9\r\n:10376000E491E093800280917402082E000C990B82\r\n:10377000FC01EA5AF54FE491F0E0EE0FFF1FEE5B1B\r\n:10378000F54FA591B491B0937B02A0937A02FC010E\r\n:10379000E659F54FE491E09381028C91E095E8239E\r\n:1037A000EC93CFCE80916A0290916B02892B31F01D\r\n:1037B00080918D0290918E020E94BB08E0917E0262\r\n:1037C000F0917F029081809183028095892380838C\r\n:1037D000F8CE8FE980938C02C2E16AED8FE492E02B\r\n:1037E0000E947F136C2F8FE492E00E947F1361E8A8\r\n:1037F0008FE492E00E947F1360918C028FE492E04C\r\n:103800000E947F1369ED8FE492E00E947F13809104\r\n:10381000710261EF813009F462E28FE492E00E946C\r\n:103820007F1366E08CE795E00E94CA1280916C02DB\r\n:1038300090916D02892BE9F12091880230918902E3\r\n:1038400040918A0250918B0260E074E284EF90E034\r\n:103850000E94A41C205131094109510956954795F0\r\n:10386000379527952093B800C5CD8036910589F40A\r\n:103870008091550290915602409739F480917102DF\r\n:10388000813029F08FEA80938C02C2E0A6CF80E1DC\r\n:10389000FACF80349105C9F7809155029091560274\r\n:1038A000809799F780917102813009F0C2CE80E152\r\n:1038B00091CFE0917E02F0917F028081909183020E\r\n:1038C000892B808397CD8CE191E090935002809377\r\n:1038D0004F0280916E0290916F02009711F00C944C\r\n:1038E000831D0895052E97FB1EF400940E94891CE9\r\n:1038F00057FD07D00E94A41C07FC03D04EF40C9483\r\n:10390000891C50954095309521953F4F4F4F5F4F03\r\n:10391000089590958095709561957F4F8F4F9F4F3B\r\n:1039200008950E94C61CA59F900DB49F900DA49F62\r\n:10393000800D911D11240895B7FF0C94911C0E94D5\r\n:10394000911C821B930B0895A1E21A2EAA1BBB1B8C\r\n:10395000FD010DC0AA1FBB1FEE1FFF1FA217B3075B\r\n:10396000E407F50720F0A21BB30BE40BF50B661F71\r\n:10397000771F881F991F1A9469F760957095809535\r\n:1039800090959B01AC01BD01CF010895A29FB001AC\r\n:10399000B39FC001A39F700D811D1124911DB29F83\r\n:1039A000700D811D1124911D0895991B79E004C0AB\r\n:1039B000991F961708F0961B881F7A95C9F780956E\r\n:1039C0000895EE0FFF1F0590F491E02D09940F93D9\r\n:1039D0001F93CF93DF938230910510F482E090E043\r\n:1039E000E0919102F091920230E020E0B0E0A0E09E\r\n:1039F000309799F42115310509F44AC0281B390B79\r\n:103A000024303105D8F58A819B816115710589F1D2\r\n:103A1000FB0193838283FE0111C0408151810281A9\r\n:103A2000138148175907E0F04817590799F4109780\r\n:103A300061F012960C93129713961C933296CF0155\r\n:103A4000DF91CF911F910F910895009391021093F0\r\n:103A50009202F4CF2115310551F04217530738F087\r\n:103A6000A901DB019A01BD01DF01F801C1CFEF011E\r\n:103A7000F9CF9093920280939102CDCFFE01E20F95\r\n:103A8000F31F819391932250310939832883D7CF33\r\n:103A900020918F0230919002232B41F4209102015A\r\n:103AA000309103013093900220938F022091000106\r\n:103AB000309101012115310541F42DB73EB74091F8\r\n:103AC000040150910501241B350BE0918F02F09108\r\n:103AD0009002E217F307A0F42E1B3F0B28173907BB\r\n:103AE00078F0AC014E5F5F4F2417350748F04E0F5A\r\n:103AF0005F1F5093900240938F02819391939FCFC9\r\n:103B0000F0E0E0E09CCFCF93DF930097E9F0FC0179\r\n:103B1000329713821282A0919102B0919202ED012C\r\n:103B200030E020E01097A1F420813181820F931FB3\r\n:103B300020918F02309190022817390709F061C057\r\n:103B4000F0939002E0938F02DF91CF910895EA0104\r\n:103B5000CE17DF07E8F54A815B819E0141155105CB\r\n:103B6000B1F7E901FB83EA8349915991C40FD51F4D\r\n:103B7000EC17FD0761F4808191810296840F951FF7\r\n:103B8000E90199838883828193819B838A83F0E012\r\n:103B9000E0E012968D919C9113970097B9F52D91C5\r\n:103BA0003C911197CD010296820F931F20918F02B5\r\n:103BB000309190022817390739F6309751F5109255\r\n:103BC000920210929102B0939002A0938F02BCCF08\r\n:103BD000D383C28340815181840F951FC817D907B1\r\n:103BE00061F44E5F5F4F88819981480F591F51835F\r\n:103BF00040838A819B81938382832115310509F05B\r\n:103C0000B0CFF0939202E09391029ECFFD01DC01D0\r\n:103C1000C0CF13821282D7CF81E090E0F8940C9449\r\n:103C2000181EDC0101C06D9341505040E0F708952B\r\n:103C300015E0C0E4D5E004C0FE010E94E11C21961D\r\n:0A3C4000C134D107C9F7F894FFCF93\r\n:103C4A0000009302800000000000B41187113714AD\r\n:103C5A006B0580116D115E1100000000FB0A300631\r\n:103C6A003714201004086B050B0F7D0D990D8D0D6F\r\n:103C7A00730F6B05BF08E1137407BD07C60CA90CC7\r\n:043C8A00310CD20B1C\r\n:00000001FF\r\n"
};

// src/robotics/project/trackedSketch.ts
var TRACKED_SKETCH = "// Robot de orugas con cabeza de radar, cara y brazos.\r\n// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Cuello (servo): D3. Hombros (servos): izquierdo D11, derecho D2. Codos: D13 y A0. Pinzas: A1 y A2. HC-SR04: TRIG=D9, ECHO=D10. Pantalla OLED por I2C: SDA=A4, SCL=A5.\r\n// Avanza mirando al frente. Si ve algo cerca se sorprende y levanta los brazos, mira a los lados con el cuello, elige el lado mas libre y gira hacia el.\r\n#include <Wire.h>\r\n#include <Servo.h>\r\n#include <Adafruit_GFX.h>\r\n#include <Adafruit_SSD1306.h>\r\n\r\nAdafruit_SSD1306 pantalla(128, 64, &Wire, -1);\r\nServo cuello, brazoIzq, brazoDer, codoIzq, codoDer, pinzaIzq, pinzaDer;\r\n\r\nconst int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)\r\n\r\nlong distanciaCm() {\r\n  digitalWrite(9, LOW); delayMicroseconds(2);\r\n  digitalWrite(9, HIGH); delayMicroseconds(10);\r\n  digitalWrite(9, LOW);\r\n  unsigned long us = pulseIn(10, HIGH, 25000UL);\r\n  if (us == 0) return 400;\r\n  return us / 58;\r\n}\r\n\r\nvoid motores(bool izqAdelante, bool derAdelante, int fuerza) {\r\n  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);\r\n  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);\r\n  analogWrite(5, fuerza); analogWrite(6, fuerza);\r\n}\r\n// Freno: los cuatro IN en bajo con el enable puesto cortocircuitan los motores y los detienen de golpe (con el enable apagado giran libres y el robot sigue de largo).\r\nvoid parar() {\r\n  digitalWrite(4, LOW); digitalWrite(7, LOW); digitalWrite(8, LOW); digitalWrite(12, LOW);\r\n  analogWrite(5, 255); analogWrite(6, 255);\r\n}\r\n\r\n// Cara: 0 = normal, 1 = sorprendido, 2 = mira a SU izquierda, 3 = mira a SU derecha (quien la ve de frente tiene la izquierda del robot a la derecha de la pantalla)\r\nvoid cara(int estado) {\r\n  int dx = (estado == 2) ? 6 : (estado == 3) ? -6 : 0;\r\n  pantalla.clearDisplay();\r\n  if (estado == 1) {                                          // sorpresa: ojos enormes y boca redonda\r\n    pantalla.fillCircle(38, 24, 18, SSD1306_WHITE); pantalla.fillCircle(90, 24, 18, SSD1306_WHITE);\r\n    pantalla.fillCircle(38, 24, 4, SSD1306_BLACK);  pantalla.fillCircle(90, 24, 4, SSD1306_BLACK);\r\n    pantalla.fillCircle(64, 52, 8, SSD1306_WHITE);  pantalla.fillCircle(64, 52, 4, SSD1306_BLACK);\r\n  } else {                                                    // ojos con pupila y boca contenta\r\n    pantalla.fillCircle(38, 24, 15, SSD1306_WHITE); pantalla.fillCircle(90, 24, 15, SSD1306_WHITE);\r\n    pantalla.fillCircle(38 + dx, 24, 6, SSD1306_BLACK); pantalla.fillCircle(90 + dx, 24, 6, SSD1306_BLACK);\r\n    pantalla.fillRoundRect(40, 50, 48, 8, 4, SSD1306_WHITE);\r\n  }\r\n  pantalla.display();\r\n}\r\n\r\nvoid mirar(int angulo) { cuello.write(angulo); delay(300); }   // el servo tarda un momento en llegar\r\n// Hombros: 90 = brazos al frente, a la altura de las orugas; menos de 90 = los levanta. El derecho se mueve en espejo (180 - angulo).\r\nvoid brazos(int angulo) { brazoIzq.write(angulo); brazoDer.write(180 - angulo); }\r\n\r\nvoid setup() {\r\n  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);\r\n  pinMode(9, OUTPUT); pinMode(10, INPUT);\r\n  cuello.attach(3); cuello.write(CENTRO);\r\n  brazoIzq.attach(11); brazoDer.attach(2); brazos(90);\r\n  codoIzq.attach(13); codoDer.attach(A0); codoIzq.write(90); codoDer.write(90);      // codos rectos\r\n  pinzaIzq.attach(A1); pinzaDer.attach(A2); pinzaIzq.write(20); pinzaDer.write(20); // pinzas abiertas\r\n  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);\r\n  cara(0);\r\n}\r\n\r\nvoid loop() {\r\n  if (distanciaCm() > 25) {\r\n    motores(true, true, 200);                // camino libre: avanza\r\n  } else {\r\n    parar(); cara(1); brazos(40);            // algo cerca: se sorprende y levanta los brazos\r\n    mirar(IZQUIERDA); long izq = distanciaCm(); cara(2);\r\n    mirar(DERECHA);   long der = distanciaCm(); cara(3);\r\n    mirar(CENTRO);\r\n    bool haciaIzquierda = izq > der;\r\n    motores(!haciaIzquierda, haciaIzquierda, 200);   // gira en el sitio hacia el lado mas libre\r\n    delay(520);\r\n    parar(); cara(0); brazos(90);            // vuelve a la calma: brazos al frente\r\n  }\r\n  delay(30);\r\n}\r\n";
var PICK_SKETCH = "// Robot de orugas que recoge dos cubos del suelo, uno con cada mano, los levanta un momento y los suelta.\n// Cuello (servo): D3. Hombros: izquierdo D11, derecho D2. Codos: izquierdo D13, derecho A0. Pinzas: izquierda A1, derecha A2. Pantalla OLED por I2C: SDA=A4, SCL=A5.\n// Los servos del lado derecho van en espejo: reciben 180 - angulo para moverse igual que los del izquierdo.\n#include <Wire.h>\n#include <Servo.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\nAdafruit_SSD1306 pantalla(128, 64, &Wire, -1);\nServo cuello, hombroIzq, hombroDer, codoIzq, codoDer, pinzaIzq, pinzaDer;\n\n// hombro: menos de 90 = levanta el brazo. codo: mas de 90 = estira el antebrazo hacia adelante. pinza: 0 = muy abierta, 90 = casi cerrada.\nvoid brazos(int hombro, int codo, int pinza) {\n  hombroIzq.write(hombro); hombroDer.write(180 - hombro);\n  codoIzq.write(codo);     codoDer.write(180 - codo);\n  pinzaIzq.write(pinza);   pinzaDer.write(pinza);\n}\n\n// Cara: 0 = normal, 1 = contento (ojos cerrados en arco y sonrisa grande)\nvoid cara(int estado) {\n  pantalla.clearDisplay();\n  if (estado == 1) {\n    pantalla.fillCircle(38, 28, 15, SSD1306_WHITE); pantalla.fillCircle(90, 28, 15, SSD1306_WHITE);\n    pantalla.fillRect(20, 28, 36, 20, SSD1306_BLACK); pantalla.fillRect(72, 28, 36, 20, SSD1306_BLACK);   // solo la mitad de arriba: ojos sonrientes\n    pantalla.fillRoundRect(34, 46, 60, 12, 6, SSD1306_WHITE);\n  } else {\n    pantalla.fillCircle(38, 24, 15, SSD1306_WHITE); pantalla.fillCircle(90, 24, 15, SSD1306_WHITE);\n    pantalla.fillCircle(38, 24, 6, SSD1306_BLACK);  pantalla.fillCircle(90, 24, 6, SSD1306_BLACK);\n    pantalla.fillRoundRect(40, 50, 48, 8, 4, SSD1306_WHITE);\n  }\n  pantalla.display();\n}\n\nvoid setup() {\n  cuello.attach(3); cuello.write(90);\n  hombroIzq.attach(11); hombroDer.attach(2); codoIzq.attach(13); codoDer.attach(A0); pinzaIzq.attach(A1); pinzaDer.attach(A2);\n  brazos(90, 90, 20);                     // brazos en reposo y pinzas abiertas\n  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n  cara(0);\n  delay(1200);\n\n  brazos(90, 100, 20);  delay(1500);      // estira los antebrazos hacia los cubos, con las pinzas abiertas\n  brazos(90, 100, 64);  delay(1000);      // cierra las pinzas: agarra los cubos\n  cara(1);\n  brazos(60, 100, 64);  delay(1500);      // levanta los brazos con los cubos\n  brazos(90, 100, 64);  delay(1500);      // los baja otra vez al suelo\n  brazos(90, 100, 20);  delay(1000);      // abre las pinzas: los suelta\n  brazos(90, 90, 20);   delay(800);       // recoge los brazos\n  cara(0);\n}\n\nvoid loop() {}\n";

// src/robotics/guide/programGuideTracked.ts
var HEAD = `// Robot de orugas con cabeza de radar, cara y brazos.
// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Cuello (servo): D3. Hombros (servos): izquierdo D11, derecho D2. Codos: D13 y A0. Pinzas: A1 y A2. HC-SR04: TRIG=D9, ECHO=D10. Pantalla OLED por I2C: SDA=A4, SCL=A5.
`;
var MOTORES = `
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
`;
var DISTANCIA = `
long distanciaCm() {
  digitalWrite(9, LOW); delayMicroseconds(2);
  digitalWrite(9, HIGH); delayMicroseconds(10);
  digitalWrite(9, LOW);
  unsigned long us = pulseIn(10, HIGH, 25000UL);
  if (us == 0) return 400;
  return us / 58;
}
`;
var PINES = `  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);
  pinMode(9, OUTPUT); pinMode(10, INPUT);
`;
var CARA = `
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
`;
var TRACKED_GUIDE = {
  id: "oruga-radar",
  name: "Robot de orugas con radar y cara",
  summary: "6 pasos: orugas con freno, cuello con servo, radar a los lados, cara en la pantalla, brazos y pinzas con servos y decidir hacia d\xF3nde girar.",
  templates: ["robot-oruga-radar"],
  steps: [
    {
      id: "orugas",
      title: "Paso 1 \xB7 Mover las orugas y frenar",
      why: "Las orugas se mueven como dos ruedas: cada motor tiene dos pines de sentido y uno de velocidad. Adem\xE1s de avanzar, el robot necesita FRENAR: con los cuatro IN en bajo y el enable puesto, el puente H cortocircuita los motores y se detienen de golpe.",
      learn: ["IN1/IN2 e IN3/IN4 deciden el sentido; ENA/ENB, la velocidad (PWM).", "Con el enable apagado el motor queda libre y el robot sigue de largo; con IN iguales y enable puesto, frena.", "Una funci\xF3n por cada acci\xF3n (motores, parar) mantiene el programa ordenado."],
      source: HEAD + MOTORES + `
void setup() {
${PINES}}
void loop() {
  motores(true, true, 200);   // avanza un segundo
  delay(1000);
  parar();                    // frena un segundo
  delay(1000);
}
`,
      see: "Pulsa \u25B6: el robot avanza un segundo y se detiene en seco otro segundo, una y otra vez.",
      checks: [
        { label: "avanzando", ms: 500, expect: [{ kind: "motor", motor: 0, above: 1.5 }, { kind: "motor", motor: 1, above: 1.5 }] },
        { label: "frenando", ms: 1500, expect: [{ kind: "motor", motor: 0, above: -0.3, below: 0.3 }, { kind: "motor", motor: 1, above: -0.3, below: 0.3 }] }
      ]
    },
    {
      id: "cuello",
      title: "Paso 2 \xB7 Girar el cuello",
      why: "El cuello es un servo en D3. La biblioteca Servo manda un pulso cada 20 ms: `write(grados)` fija el \xE1ngulo. 90\xB0 es mirar al frente, 160\xB0 a la izquierda y 20\xB0 a la derecha. La cabeza entera gira con \xE9l.",
      learn: ["#include <Servo.h> y un objeto Servo.", "cuello.attach(3) dice en qu\xE9 pin est\xE1 el servo; cuello.write(90) lo manda a 90\xB0.", "El servo tarda un momento en llegar: hay que esperar con delay antes de usarlo."],
      source: HEAD + `#include <Servo.h>
Servo cuello;

const int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)
` + MOTORES + `
void setup() {
${PINES}  cuello.attach(3); cuello.write(CENTRO);
}
void loop() {
  cuello.write(IZQUIERDA); delay(800);   // mira a la izquierda
  cuello.write(DERECHA);   delay(800);   // mira a la derecha
  cuello.write(CENTRO);    delay(800);   // vuelve al frente
}
`,
      see: "Pulsa \u25B6: la cabeza gira a la izquierda, luego a la derecha y vuelve al frente. La Consola muestra el \xE1ngulo del servo.",
      checks: [
        { label: "a los 0,5 s (mirando a la izquierda)", ms: 500, expect: [{ kind: "servo-angle", servo: 0, angle: 160, tolerance: 6 }] },
        { label: "a los 1,3 s (mirando a la derecha)", ms: 1300, expect: [{ kind: "servo-angle", servo: 0, angle: 20, tolerance: 6 }] },
        { label: "a los 2,1 s (de vuelta al frente)", ms: 2100, expect: [{ kind: "servo-angle", servo: 0, angle: 90, tolerance: 6 }] }
      ]
    },
    {
      id: "radar",
      title: "Paso 3 \xB7 El radar: medir a los lados",
      why: "El HC-SR04 va en la cabeza: mide hacia donde mira. Si giras el cuello, mides en otra direcci\xF3n. Mirar a la izquierda, medir, mirar a la derecha, medir y comparar es un radar casero.",
      learn: ["Una funci\xF3n `mirar(angulo)` mueve el cuello y espera a que llegue.", "Medir en cada lado y guardar el resultado en variables (izq, der).", "Serial.print deja ver lo que \xABve\xBB el radar."],
      source: HEAD + `#include <Servo.h>
Servo cuello;

const int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)
` + DISTANCIA + MOTORES + `
void mirar(int angulo) { cuello.write(angulo); delay(300); }   // el servo tarda un momento en llegar

void setup() {
  Serial.begin(9600);
${PINES}  cuello.attach(3); cuello.write(CENTRO);
}
void loop() {
  mirar(IZQUIERDA); long izq = distanciaCm();
  mirar(DERECHA);   long der = distanciaCm();
  mirar(CENTRO);
  Serial.print("izq="); Serial.print(izq); Serial.print(" der="); Serial.println(der);
  delay(200);
}
`,
      see: "En el Monitor serie ves \xABizq=\u2026 der=\u2026\xBB con las distancias a cada lado. Cambia los obst\xE1culos del escenario y cambian los n\xFAmeros.",
      checks: [
        { label: "con obst\xE1culos a 50 cm", set: [{ def: "hc-sr04", prop: "testDistance", value: 0.5 }], ms: 1800, expect: [{ kind: "serial", match: "izq=(49|50|51) der=(49|50|51)", hint: "no se lee \xABizq=50 der=50\xBB" }, { kind: "sensor-echoes", min: 2 }] },
        { label: "con obst\xE1culos a 20 cm", set: [{ def: "hc-sr04", prop: "testDistance", value: 0.2 }], ms: 1800, expect: [{ kind: "serial", match: "izq=(19|20|21) der=(19|20|21)", hint: "no se lee \xABizq=20 der=20\xBB" }] }
      ]
    },
    {
      id: "cara",
      title: "Paso 4 \xB7 La cara en la pantalla",
      why: "La pantalla OLED por I\xB2C (SDA = A4, SCL = A5) se programa con las bibliotecas Adafruit: `fillCircle` dibuja los ojos, `fillRoundRect` la boca y `display()` env\xEDa la imagen a la pantalla. Cambiar la pupila de lugar hace que el robot \xABmire\xBB hacia un lado.",
      learn: ["#include <Wire.h>, <Adafruit_GFX.h> y <Adafruit_SSD1306.h>.", "pantalla.begin(...) arranca la pantalla; clearDisplay() borra; display() muestra lo dibujado.", "Una funci\xF3n cara(estado) con if/else cambia la expresi\xF3n."],
      source: HEAD + `#include <Wire.h>
#include <Servo.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 pantalla(128, 64, &Wire, -1);
Servo cuello;

const int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)
` + DISTANCIA + MOTORES + CARA + `
void mirar(int angulo) { cuello.write(angulo); delay(300); }   // el servo tarda un momento en llegar

void setup() {
${PINES}  cuello.attach(3); cuello.write(CENTRO);
  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  cara(0);
}
void loop() {
  mirar(IZQUIERDA); long izq = distanciaCm(); cara(2);   // mira a la izquierda y su cara tambi\xE9n
  mirar(DERECHA);   long der = distanciaCm(); cara(3);   // mira a la derecha
  mirar(CENTRO);    cara(0);
  delay(300);
}
`,
      see: "La pantalla de la cabeza muestra dos ojos con pupila y una boca; las pupilas se mueven hacia el lado al que mira el cuello.",
      checks: [
        { label: "al encender (0,9 s)", ms: 900, expect: [{ kind: "display-lit", min: 1200, max: 2400, hint: "la pantalla no muestra la cara" }] },
        { label: "despu\xE9s de mirar a los lados", ms: 2500, expect: [{ kind: "display-lit", min: 1200, max: 2400, hint: "la pantalla no muestra la cara" }, { kind: "servo-angle", servo: 0, angle: 90, tolerance: 40 }] }
      ]
    },
    {
      id: "brazos",
      title: "Paso 5 \xB7 Mover los brazos y las pinzas",
      why: "Cada brazo tiene tres servos: el HOMBRO lo sube y lo baja (menos de 90\xB0 = arriba), el CODO estira o recoge el antebrazo (m\xE1s de 90\xB0 = hacia adelante) y la PINZA abre o cierra los dedos (0\xB0 = muy abierta, 90\xB0 = casi cerrada). Los servos del lado derecho est\xE1n espejados: reciben 180 \u2212 \xE1ngulo para moverse igual que los del izquierdo.",
      learn: ["Siete servos en total: cuello D3, hombros D11 y D2, codos D13 y A0, pinzas A1 y A2.", "Una funci\xF3n brazos(hombro, codo, pinza) mueve los seis a la vez.", "El espejo (180 - angulo) hace que los dos brazos se muevan sim\xE9tricos."],
      source: HEAD + `#include <Wire.h>
#include <Servo.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 pantalla(128, 64, &Wire, -1);
Servo cuello, hombroIzq, hombroDer, codoIzq, codoDer, pinzaIzq, pinzaDer;

const int CENTRO = 90, IZQUIERDA = 160, DERECHA = 20;   // angulos del cuello (70 grados a cada lado)
` + DISTANCIA + MOTORES + CARA + `
void mirar(int angulo) { cuello.write(angulo); delay(300); }   // el servo tarda un momento en llegar
// hombro: menos de 90 = levanta el brazo. codo: mas de 90 = estira el antebrazo. pinza: 0 = abierta, 90 = casi cerrada. El lado derecho va en espejo (180 - angulo).
void brazos(int hombro, int codo, int pinza) {
  hombroIzq.write(hombro); hombroDer.write(180 - hombro);
  codoIzq.write(codo);     codoDer.write(180 - codo);
  pinzaIzq.write(pinza);   pinzaDer.write(pinza);
}

void setup() {
${PINES}  cuello.attach(3); cuello.write(CENTRO);
  hombroIzq.attach(11); hombroDer.attach(2); codoIzq.attach(13); codoDer.attach(A0); pinzaIzq.attach(A1); pinzaDer.attach(A2);
  brazos(90, 90, 20);
  pantalla.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  cara(0);
}
void loop() {
  brazos(40, 90, 20);                                     // brazos arriba
  mirar(IZQUIERDA); long izq = distanciaCm(); cara(2);
  mirar(DERECHA);   long der = distanciaCm(); cara(3);
  mirar(CENTRO);    cara(0);
  brazos(90, 90, 64);                                     // brazos al frente y pinzas cerradas
  delay(600);
  brazos(90, 90, 20);                                     // pinzas abiertas
  delay(300);
}
`,
      see: "El robot levanta los dos brazos a la vez mientras la cabeza mira a los lados; luego los baja al frente, cierra las pinzas y las vuelve a abrir.",
      checks: [
        { label: "con los brazos arriba y las pinzas abiertas (0,6 s)", ms: 600, expect: [{ kind: "servo-angle", servo: 1, angle: 40, tolerance: 8 }, { kind: "servo-angle", servo: 4, angle: 140, tolerance: 8 }, { kind: "servo-angle", servo: 3, angle: 20, tolerance: 8 }, { kind: "servo-angle", servo: 6, angle: 20, tolerance: 8 }] },
        { label: "al encender (brazos al frente)", ms: 60, expect: [{ kind: "servo-angle", servo: 1, angle: 90, tolerance: 25 }, { kind: "servo-angle", servo: 4, angle: 90, tolerance: 25 }] },
        { label: "con las pinzas cerradas (3,3 s)", ms: 3300, expect: [{ kind: "servo-angle", servo: 3, angle: 64, tolerance: 8 }, { kind: "servo-angle", servo: 6, angle: 64, tolerance: 8 }] }
      ]
    },
    {
      id: "decidir",
      title: "Paso 6 \xB7 Sorprenderse, elegir y girar",
      why: "Todo junto: si el camino est\xE1 libre, avanza; si ve algo a menos de 25 cm, FRENA, pone cara de sorpresa, levanta los brazos, mira a los dos lados con el radar, compara las distancias y gira hacia el lado m\xE1s libre. Cuando termina, vuelve a la cara normal.",
      learn: ["if / else decide seg\xFAn lo que mide el radar.", "Comparar dos medidas (izq > der) elige el lado.", "motores(!haciaIzquierda, haciaIzquierda, ...) gira en el sitio hacia ese lado."],
      source: TRACKED_SKETCH,
      see: "En Simular el robot avanza, se sorprende al ver la caja, levanta los brazos, gira el cuello a los dos lados y gira hacia donde hay m\xE1s espacio (con la pared a la izquierda, gira a la derecha).",
      checks: [
        { label: "con el camino libre (1 m)", set: [{ def: "hc-sr04", prop: "testDistance", value: 1 }], ms: 1500, expect: [{ kind: "motor", motor: 0, above: 1.5 }, { kind: "motor", motor: 1, above: 1.5 }, { kind: "display-lit", min: 1200, max: 2400, hint: "la cara normal no se ve" }] },
        { label: "al ver un obst\xE1culo a 15 cm (0,2 s)", set: [{ def: "hc-sr04", prop: "testDistance", value: 0.15 }], ms: 200, expect: [{ kind: "motor", motor: 0, above: -0.3, below: 0.3 }, { kind: "motor", motor: 1, above: -0.3, below: 0.3 }, { kind: "display-lit", min: 2e3, max: 3e3, hint: "no se ve la cara de sorpresa (ojos grandes y boca redonda)" }] },
        { label: "con los brazos levantados mientras mira (0,7 s)", set: [{ def: "hc-sr04", prop: "testDistance", value: 0.15 }], ms: 700, expect: [{ kind: "servo-angle", servo: 1, angle: 40, tolerance: 8 }, { kind: "servo-angle", servo: 4, angle: 140, tolerance: 8 }] },
        { label: "despu\xE9s de mirar a los lados, girando en el sitio (1,25 s)", set: [{ def: "hc-sr04", prop: "testDistance", value: 0.15 }], ms: 1250, expect: [{ kind: "motor", motor: 0, above: 1.5 }, { kind: "motor", motor: 1, below: -1.5 }] }
      ]
    }
  ]
};
var PICK_HEAD = `// Robot de orugas que recoge cubos del suelo con las dos manos.
// Cuello (servo): D3. Hombros: izquierdo D11, derecho D2. Codos: izquierdo D13, derecho A0. Pinzas: izquierda A1, derecha A2. Pantalla OLED por I2C: SDA=A4, SCL=A5.
// Los servos del lado derecho van en espejo: reciben 180 - angulo para moverse igual que los del izquierdo.
`;
var PICK_SERVOS = `#include <Servo.h>
Servo cuello, hombroIzq, hombroDer, codoIzq, codoDer, pinzaIzq, pinzaDer;

// hombro: menos de 90 = levanta el brazo. codo: mas de 90 = estira el antebrazo hacia adelante. pinza: 0 = muy abierta, 90 = casi cerrada.
void brazos(int hombro, int codo, int pinza) {
  hombroIzq.write(hombro); hombroDer.write(180 - hombro);
  codoIzq.write(codo);     codoDer.write(180 - codo);
  pinzaIzq.write(pinza);   pinzaDer.write(pinza);
}
void conectarServos() {
  cuello.attach(3); cuello.write(90);
  hombroIzq.attach(11); hombroDer.attach(2); codoIzq.attach(13); codoDer.attach(A0); pinzaIzq.attach(A1); pinzaDer.attach(A2);
  brazos(90, 90, 20);   // brazos en reposo y pinzas abiertas
}
`;
var PICK_GUIDE = {
  id: "oruga-recoger",
  name: "Robot de orugas que recoge cubos",
  summary: "3 pasos: abrir y cerrar las pinzas, estirar el antebrazo hasta el cubo y la rutina completa: agarrar, levantar y soltar los dos cubos.",
  templates: ["robot-oruga-recoger"],
  steps: [
    {
      id: "pinzas",
      title: "Paso 1 \xB7 Abrir y cerrar las pinzas",
      why: "Cada pinza tiene dos dedos que corren sobre un riel; un servo los junta o los separa. Con 20\xB0 quedan muy abiertos (unos 54 mm) y con 64\xB0 casi se tocan (32 mm): un cubo de 30 mm cabe justo. Los dos servos de pinza se mueven igual.",
      learn: ["Un servo por pinza: izquierda en A1 y derecha en A2.", "El \xE1ngulo fija la separaci\xF3n de los dedos: m\xE1s grados = m\xE1s cerrada.", "Los pines anal\xF3gicos (A0\u2013A5) tambi\xE9n sirven como pines digitales para un servo."],
      source: PICK_HEAD + PICK_SERVOS + `
void setup() {
  conectarServos();
}
void loop() {
  brazos(90, 90, 64);   // cierra las pinzas
  delay(1000);
  brazos(90, 90, 20);   // las abre
  delay(1000);
}
`,
      see: "Pulsa \u25B6: los dedos de las dos pinzas se cierran un segundo y se vuelven a abrir, una y otra vez.",
      checks: [
        { label: "pinzas cerradas (0,6 s)", ms: 600, expect: [{ kind: "servo-angle", servo: 3, angle: 64, tolerance: 8 }, { kind: "servo-angle", servo: 6, angle: 64, tolerance: 8 }] },
        { label: "pinzas abiertas (1,6 s)", ms: 1600, expect: [{ kind: "servo-angle", servo: 3, angle: 20, tolerance: 8 }, { kind: "servo-angle", servo: 6, angle: 20, tolerance: 8 }] }
      ]
    },
    {
      id: "estirar",
      title: "Paso 2 \xB7 Estirar el antebrazo hasta el cubo",
      why: "En reposo las pinzas quedan casi pegadas a las orugas. Con el codo a 100\xB0 el antebrazo se estira unos 18 mm hacia adelante y las pinzas quedan justo sobre los cubos, a ras del suelo. El codo derecho est\xE1 espejado: recibe 180 \u2212 100 = 80\xB0.",
      learn: ["El codo con m\xE1s de 90\xB0 estira el antebrazo hacia adelante.", "Primero se llega al cubo con la pinza abierta; reci\xE9n despu\xE9s se cierra.", "delay() da tiempo a que los servos lleguen antes del siguiente movimiento."],
      source: PICK_HEAD + PICK_SERVOS + `
void setup() {
  conectarServos();
  delay(800);
}
void loop() {
  brazos(90, 100, 20);   // estira los antebrazos con las pinzas abiertas
  delay(1500);
  brazos(90, 100, 64);   // cierra las pinzas: agarra
  delay(1500);
  brazos(90, 90, 20);    // recoge todo
  delay(1500);
}
`,
      see: "Los dos antebrazos se estiran hacia adelante, las pinzas se cierran donde est\xE1n los cubos y luego todo vuelve al reposo.",
      checks: [
        { label: "con los antebrazos estirados (1,6 s)", ms: 1600, expect: [{ kind: "servo-angle", servo: 2, angle: 100, tolerance: 8 }, { kind: "servo-angle", servo: 5, angle: 80, tolerance: 8 }, { kind: "servo-angle", servo: 3, angle: 20, tolerance: 8 }] },
        { label: "con las pinzas cerradas (3,6 s)", ms: 3600, expect: [{ kind: "servo-angle", servo: 3, angle: 64, tolerance: 8 }, { kind: "servo-angle", servo: 6, angle: 64, tolerance: 8 }] }
      ]
    },
    {
      id: "recoger",
      title: "Paso 3 \xB7 Agarrar, levantar y soltar",
      why: "La rutina completa: estira los antebrazos, cierra las pinzas, pone cara de contento, levanta los brazos con los cubos (hombro a 60\xB0), los baja otra vez, abre las pinzas para soltarlos y recoge los brazos. En el simulador los cubos son objetos f\xEDsicos: se agarran de verdad, suben con la pinza y caen al soltarlos.",
      learn: ["Una secuencia de posturas con delay() entre ellas.", "El hombro con menos de 90\xB0 levanta el brazo; con 90\xB0 lo deja al frente.", "La cara cambia mientras sostiene los cubos."],
      source: PICK_SKETCH,
      see: "En Simular el robot estira los dos antebrazos, agarra los dos cubos, los levanta unos cent\xEDmetros, los vuelve a poner en el suelo y los suelta. Mientras los sostiene la cara se pone contenta.",
      checks: [
        { label: "estirando hacia los cubos (2,2 s)", ms: 2200, expect: [{ kind: "servo-angle", servo: 2, angle: 100, tolerance: 8 }, { kind: "servo-angle", servo: 5, angle: 80, tolerance: 8 }, { kind: "servo-angle", servo: 3, angle: 20, tolerance: 8 }] },
        { label: "con los cubos levantados (4,8 s)", ms: 4800, expect: [{ kind: "servo-angle", servo: 1, angle: 60, tolerance: 8 }, { kind: "servo-angle", servo: 4, angle: 120, tolerance: 8 }, { kind: "servo-angle", servo: 3, angle: 64, tolerance: 8 }, { kind: "servo-angle", servo: 6, angle: 64, tolerance: 8 }] },
        { label: "con los brazos recogidos otra vez (9,5 s)", ms: 9500, expect: [{ kind: "servo-angle", servo: 2, angle: 90, tolerance: 8 }, { kind: "servo-angle", servo: 3, angle: 20, tolerance: 8 }] }
      ]
    }
  ]
};

// src/robotics/guide/programGuides.ts
var AVOID_HEAD = `// Evitar obst\xE1culos. Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6. Sensor HC-SR04: TRIG=D9, ECHO=D10.
`;
var AVOID_SETUP = (extra = "") => `void setup() {${extra}
  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);  // IN1..IN4: sentido de cada motor
  pinMode(9, OUTPUT);   // TRIG: el Arduino manda el pulso
  pinMode(10, INPUT);   // ECHO: el Arduino escucha el eco
}
`;
var MOTORES2 = `// izqAdelante / derAdelante: true = esa rueda gira hacia adelante. fuerza: 0 a 255 (PWM).
void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);   // motor 1: IN1 y IN2 siempre opuestos
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);  // motor 2: IN3 y IN4 siempre opuestos
  analogWrite(5, fuerza); analogWrite(6, fuerza);                // ENA y ENB: la velocidad
}
`;
var DISTANCIA2 = `// Devuelve la distancia al obst\xE1culo en cent\xEDmetros (400 si no hay eco).
long distanciaCm() {
  digitalWrite(9, LOW); delayMicroseconds(2);
  digitalWrite(9, HIGH); delayMicroseconds(10);   // pulso de 10 \xB5s en TRIG: \xABmide ahora\xBB
  digitalWrite(9, LOW);
  unsigned long us = pulseIn(10, HIGH, 25000UL);  // cu\xE1nto tarda ECHO en volver
  if (us == 0) return 400;
  return us / 58;                                 // 58 \xB5s por cada cent\xEDmetro de ida y vuelta
}
`;
var AVOID_GUIDE = {
  id: "evitar-obstaculos",
  name: "Evitar obst\xE1culos",
  summary: "4 pasos: pines, motores, medir con el HC-SR04 y decidir. Sirve para el robot de 2 ruedas, el explorador y el Rover 4WD.",
  templates: ["robot-2-ruedas-listo", "robot-explorador-luces", "robot-rover-4wd"],
  steps: [
    {
      id: "pines",
      title: "Paso 1 \xB7 Configurar los pines",
      why: "Antes de usar un pin hay que decirle al Arduino si manda (OUTPUT) o escucha (INPUT). Aqu\xED van los seis que usa el robot.",
      learn: ["setup() corre una sola vez al encender.", "pinMode(pin, OUTPUT) = el Arduino manda se\xF1al; INPUT = la lee.", "loop() se repite para siempre (por ahora vac\xEDo)."],
      source: AVOID_HEAD + AVOID_SETUP() + `void loop() {
}
`,
      see: "Nada se mueve todav\xEDa. En Consola \u2192 Serie y estado, D4, D7, D8, D12 y D9 aparecen como salidas.",
      checks: [{ label: "al encender", ms: 300, expect: [
        { kind: "pin-mode", pin: "D4", mode: "out" },
        { kind: "pin-mode", pin: "D7", mode: "out" },
        { kind: "pin-mode", pin: "D8", mode: "out" },
        { kind: "pin-mode", pin: "D12", mode: "out" },
        { kind: "pin-mode", pin: "D9", mode: "out" }
      ] }]
    },
    {
      id: "motores",
      title: "Paso 2 \xB7 Mover los motores",
      why: "Una funci\xF3n `motores()` esconde los detalles del puente H: cada motor tiene dos pines de sentido (siempre opuestos) y un pin de velocidad.",
      learn: ["IN1 alto + IN2 bajo = adelante; al rev\xE9s = atr\xE1s.", "analogWrite(pin, 0..255) manda PWM: m\xE1s n\xFAmero, m\xE1s velocidad.", "Una funci\xF3n con par\xE1metros evita repetir c\xF3digo."],
      source: AVOID_HEAD + MOTORES2 + AVOID_SETUP() + `void loop() {
  motores(true, true, 200);   // los dos hacia adelante
}
`,
      see: "Pulsa \u25B6: el robot avanza en l\xEDnea recta sin parar.",
      checks: [{ label: "avanzando", ms: 400, expect: [
        { kind: "pin-level", pin: "D4", level: "high" },
        { kind: "pin-level", pin: "D7", level: "low" },
        { kind: "pin-level", pin: "D8", level: "high" },
        { kind: "pin-level", pin: "D12", level: "low" },
        { kind: "motor", motor: 0, above: 1.5 },
        { kind: "motor", motor: 1, above: 1.5 }
      ] }]
    },
    {
      id: "medir",
      title: "Paso 3 \xB7 Medir la distancia",
      why: "El HC-SR04 mide con sonido: TRIG lanza un pulso y ECHO se mantiene en alto mientras el sonido va y vuelve. La distancia sale del tiempo.",
      learn: ["pulseIn mide cu\xE1nto dura un pulso en microsegundos.", "El sonido recorre 1 cm de ida y vuelta en unos 58 \xB5s.", "Serial.print escribe en el Monitor serie para ver qu\xE9 \xABve\xBB el robot."],
      source: AVOID_HEAD + DISTANCIA2 + MOTORES2 + AVOID_SETUP("\n  Serial.begin(9600);") + `void loop() {
  long d = distanciaCm();
  Serial.print("distancia: "); Serial.print(d); Serial.println(" cm");
  motores(true, true, 200);
  delay(100);
}
`,
      see: "Abre Consola \u2192 Serie y estado: aparece \xABdistancia: 30 cm\xBB (cambia el obst\xE1culo en el escenario y cambia el n\xFAmero).",
      checks: [
        { label: "con un obst\xE1culo a 50 cm", set: [{ def: "hc-sr04", prop: "testDistance", value: 0.5 }], ms: 700, expect: [{ kind: "serial", match: "distancia: (49|50|51) cm", hint: "no se lee \xABdistancia: 50 cm\xBB" }, { kind: "sensor-echoes", min: 2 }] },
        { label: "con un obst\xE1culo a 15 cm", set: [{ def: "hc-sr04", prop: "testDistance", value: 0.15 }], ms: 700, expect: [{ kind: "serial", match: "distancia: 1[4-6] cm", hint: "no se lee \xABdistancia: 15 cm\xBB" }] }
      ]
    },
    {
      id: "decidir",
      title: "Paso 4 \xB7 Decidir y esquivar",
      why: "Ahora el robot toma una decisi\xF3n con if: si hay algo a menos de 20 cm gira un momento (una rueda adelante y la otra atr\xE1s); si no, sigue recto.",
      learn: ["if / else elige qu\xE9 hacer seg\xFAn lo que mide el sensor.", "Girar en el lugar = una rueda adelante y la otra atr\xE1s.", "delay(400) deja que el giro dure lo suficiente antes de volver a medir."],
      source: AVOID_HEAD + DISTANCIA2 + MOTORES2 + AVOID_SETUP() + `void loop() {
  if (distanciaCm() < 20) { motores(true, false, 200); delay(400); }  // obst\xE1culo cerca: gira a la derecha
  else motores(true, true, 200);                                       // camino libre: avanza
  delay(30);
}
`,
      see: "Pulsa \u25B6 con una caja delante: avanza, gira antes de tocarla y sigue por otro lado.",
      checks: [
        { label: "con el camino libre (1 m)", set: [{ def: "hc-sr04", prop: "testDistance", value: 1 }], ms: 500, expect: [{ kind: "motor", motor: 0, above: 1.5 }, { kind: "motor", motor: 1, above: 1.5 }] },
        { label: "con un obst\xE1culo a 10 cm", set: [{ def: "hc-sr04", prop: "testDistance", value: 0.1 }], ms: 300, expect: [{ kind: "motor", motor: 0, above: 1.5 }, { kind: "motor", motor: 1, below: -1.5 }] }
      ]
    }
  ]
};
var LINE_HEAD = `// Seguidor de l\xEDnea con dos TCRT5000 (negro = ALTO, blanco = BAJO). DO izquierdo=D2, derecho=D3.
// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6.
`;
var LINE_SETUP = (extra = "") => `void setup() {${extra}
  pinMode(2, INPUT); pinMode(3, INPUT);   // los dos sensores de l\xEDnea
  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);   // sentido de los motores
}
`;
var LINE_MOTORES = `// izquierda / derecha: fuerza de cada rueda (0 a 255). Los dos motores siempre van hacia adelante.
void motores(int izquierda, int derecha) {
  digitalWrite(4, HIGH); digitalWrite(7, LOW);
  digitalWrite(8, HIGH); digitalWrite(12, LOW);
  analogWrite(5, izquierda); analogWrite(6, derecha);
}
`;
var LINE_GUIDE = {
  id: "seguidor-linea",
  name: "Seguidor de l\xEDnea",
  summary: "4 pasos: pines, motores con fuerza propia, leer los sensores y corregir el rumbo.",
  templates: ["robot-seguidor-linea"],
  steps: [
    {
      id: "pines",
      title: "Paso 1 \xB7 Configurar los pines",
      why: "Los sensores de l\xEDnea son entradas (INPUT) y los pines del puente H son salidas (OUTPUT).",
      learn: ["Los TCRT5000 entregan ALTO sobre negro y BAJO sobre blanco.", "Un pin de entrada solo lee; uno de salida manda."],
      source: LINE_HEAD + LINE_SETUP() + `void loop() {
}
`,
      see: "Nada se mueve. D2 y D3 son entradas; D4, D7, D8 y D12 salidas.",
      checks: [{ label: "al encender", ms: 300, expect: [{ kind: "pin-mode", pin: "D4", mode: "out" }, { kind: "pin-mode", pin: "D7", mode: "out" }, { kind: "pin-mode", pin: "D8", mode: "out" }, { kind: "pin-mode", pin: "D12", mode: "out" }, { kind: "pin-mode", pin: "D2", mode: "in" }, { kind: "pin-mode", pin: "D3", mode: "in" }] }]
    },
    {
      id: "motores",
      title: "Paso 2 \xB7 Motores con fuerza propia",
      why: "Para seguir una curva cada rueda necesita su propia velocidad. `motores(izquierda, derecha)` fija la fuerza de cada una.",
      learn: ["Girar suave = una rueda m\xE1s lenta que la otra.", "ENA controla el motor izquierdo y ENB el derecho con analogWrite."],
      source: LINE_HEAD + LINE_MOTORES + LINE_SETUP() + `void loop() {
  motores(180, 180);   // ambas ruedas igual: recto
}
`,
      see: "Pulsa \u25B6: el robot avanza recto.",
      checks: [{ label: "avanzando recto", ms: 400, expect: [{ kind: "motor", motor: 0, above: 1.5 }, { kind: "motor", motor: 1, above: 1.5 }, { kind: "motor-close", motor: 0, other: 1, tolerance: 0.4 }] }]
    },
    {
      id: "leer",
      title: "Paso 3 \xB7 Leer los sensores",
      why: "digitalRead devuelve 1 (negro) o 0 (blanco). Verlo en el Monitor serie ayuda a entender qu\xE9 ve cada sensor antes de decidir.",
      learn: ["digitalRead(pin) lee un nivel ALTO/BAJO.", "Un bool guarda un s\xED/no.", "Imprimir lo que lees es la mejor forma de depurar."],
      source: LINE_HEAD + LINE_MOTORES + LINE_SETUP("\n  Serial.begin(9600);") + `void loop() {
  bool izquierda = digitalRead(2), derecha = digitalRead(3);
  Serial.print("izq="); Serial.print(izquierda); Serial.print(" der="); Serial.println(derecha);
  motores(180, 180);
  delay(100);
}
`,
      see: "En el Monitor serie ves \xABizq=0 der=0\xBB. Si pones un sensor sobre negro, su n\xFAmero pasa a 1.",
      checks: [
        { label: "con el sensor izquierdo sobre negro", set: [{ def: "tcrt5000-module", n: 0, prop: "testBlack", value: true }], ms: 500, expect: [{ kind: "serial", match: "izq=1 der=0", hint: "no se lee \xABizq=1 der=0\xBB" }] },
        { label: "con los dos sensores sobre blanco", ms: 500, expect: [{ kind: "serial", match: "izq=0 der=0", hint: "no se lee \xABizq=0 der=0\xBB" }] }
      ]
    },
    {
      id: "corregir",
      title: "Paso 4 \xB7 Corregir el rumbo",
      why: "Si el sensor izquierdo ve negro, la l\xEDnea se fue a la izquierda: frena la rueda izquierda para girar hacia ella. Con el derecho, al rev\xE9s.",
      learn: ["if / else if / else decide entre tres casos.", "Corregir = frenar el lado hacia donde est\xE1 la l\xEDnea.", "Un delay corto (5 ms) hace que el robot reaccione r\xE1pido."],
      source: LINE_HEAD + LINE_MOTORES + LINE_SETUP() + `void loop() {
  bool izquierda = digitalRead(2), derecha = digitalRead(3);
  if (izquierda && !derecha) motores(65, 200);        // l\xEDnea a la izquierda: frena la rueda izquierda
  else if (derecha && !izquierda) motores(200, 65);   // l\xEDnea a la derecha: frena la rueda derecha
  else motores(180, 180);                              // centrado: recto
  delay(5);
}
`,
      see: "En la pista ovalada el robot sigue la l\xEDnea y corrige en las curvas.",
      checks: [
        { label: "con la l\xEDnea a la izquierda", set: [{ def: "tcrt5000-module", n: 0, prop: "testBlack", value: true }], ms: 400, expect: [{ kind: "motor-less-than", motor: 0, other: 1, margin: 0.5 }] },
        { label: "con la l\xEDnea a la derecha", set: [{ def: "tcrt5000-module", n: 1, prop: "testBlack", value: true }], ms: 400, expect: [{ kind: "motor-less-than", motor: 1, other: 0, margin: 0.5 }] },
        { label: "centrado", ms: 400, expect: [{ kind: "motor-close", motor: 0, other: 1, tolerance: 0.4 }, { kind: "motor", motor: 0, above: 1.5 }] }
      ]
    }
  ]
};
var SUMO_HEAD = `// Minisumo: arena con borde negro. Sensores de borde: izquierdo=D2, derecho=D3 (negro = ALTO).
// Puente H: IN1=D4 IN2=D7 IN3=D8 IN4=D12, ENA=D5 ENB=D6.
`;
var SUMO_SETUP = (extra = "") => `void setup() {${extra}
  pinMode(2, INPUT); pinMode(3, INPUT);   // sensores de borde
  pinMode(4, OUTPUT); pinMode(7, OUTPUT); pinMode(8, OUTPUT); pinMode(12, OUTPUT);
}
`;
var SUMO_GUIDE = {
  id: "minisumo-borde",
  name: "Minisumo \xB7 no caerse del borde",
  summary: "4 pasos: pines, motores, detectar el borde negro y reaccionar. Sirve para el minisumo y los robots de combate.",
  templates: ["robot-minisumo-practica", "robot-sumo-cuna", "robot-sumo-pala-4wd", "robot-sumo-defensa"],
  steps: [
    {
      id: "pines",
      title: "Paso 1 \xB7 Configurar los pines",
      why: "Dos sensores miran el suelo para detectar el borde negro de la arena; el resto de los pines mandan al puente H.",
      learn: ["Los sensores de borde son entradas.", "Los motores se controlan desde salidas."],
      source: SUMO_HEAD + SUMO_SETUP() + `void loop() {
}
`,
      see: "Nada se mueve todav\xEDa.",
      checks: [{ label: "al encender", ms: 300, expect: [{ kind: "pin-mode", pin: "D2", mode: "in" }, { kind: "pin-mode", pin: "D3", mode: "in" }, { kind: "pin-mode", pin: "D4", mode: "out" }, { kind: "pin-mode", pin: "D8", mode: "out" }] }]
    },
    {
      id: "motores",
      title: "Paso 2 \xB7 Avanzar y retroceder",
      why: "`motores()` mueve cada rueda hacia adelante o atr\xE1s. Retroceder ser\xE1 lo primero que haga al encontrar el borde.",
      learn: ["Cambiar true/false invierte el sentido de una rueda.", "Dos ruedas en sentidos opuestos hacen girar al robot en su sitio."],
      source: SUMO_HEAD + `void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);
  analogWrite(5, fuerza); analogWrite(6, fuerza);
}
` + SUMO_SETUP() + `void loop() {
  motores(true, true, 150);   // avanza
}
`,
      see: "Pulsa \u25B6: avanza hasta el borde y se saldr\xEDa de la arena.",
      checks: [{ label: "avanzando", ms: 400, expect: [{ kind: "motor", motor: 0, above: 1 }, { kind: "motor", motor: 1, above: 1 }] }]
    },
    {
      id: "borde",
      title: "Paso 3 \xB7 Detectar el borde",
      why: "Si cualquiera de los dos sensores ve negro, el robot est\xE1 en el borde. Primero lo mostramos en el Monitor serie.",
      learn: ["Un OR (||) vale si cualquiera de las dos condiciones es cierta.", "Mostrar la lectura confirma que el sensor funciona antes de actuar."],
      source: SUMO_HEAD + `void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);
  analogWrite(5, fuerza); analogWrite(6, fuerza);
}
` + SUMO_SETUP("\n  Serial.begin(9600);") + `void loop() {
  bool izquierda = digitalRead(2), derecha = digitalRead(3);
  Serial.println((izquierda || derecha) ? "BORDE" : "libre");
  motores(true, true, 150);
  delay(100);
}
`,
      see: "El Monitor serie dice \xABlibre\xBB; con un sensor sobre negro dice \xABBORDE\xBB.",
      checks: [
        { label: "con el sensor derecho sobre negro", set: [{ def: "tcrt5000-module", n: 1, prop: "testBlack", value: true }], ms: 500, expect: [{ kind: "serial", match: "BORDE", hint: "no aparece \xABBORDE\xBB" }] },
        { label: "sobre blanco", ms: 500, expect: [{ kind: "serial", match: "libre", hint: "no aparece \xABlibre\xBB" }] }
      ]
    },
    {
      id: "reaccionar",
      title: "Paso 4 \xB7 Retroceder y girar",
      why: "Al detectar el borde: primero retrocede (para alejarse) y luego gira hacia dentro de la arena. Si no hay borde, avanza.",
      learn: ["Una secuencia de acciones con delay: retroceder 320 ms, luego girar 420 ms.", "else deja el comportamiento normal cuando no hay borde."],
      source: SUMO_HEAD + `void motores(bool izqAdelante, bool derAdelante, int fuerza) {
  digitalWrite(4, izqAdelante); digitalWrite(7, !izqAdelante);
  digitalWrite(8, derAdelante); digitalWrite(12, !derAdelante);
  analogWrite(5, fuerza); analogWrite(6, fuerza);
}
` + SUMO_SETUP() + `void loop() {
  bool izquierda = digitalRead(2), derecha = digitalRead(3);
  if (izquierda || derecha) {
    motores(false, false, 180); delay(320);   // retrocede para alejarse del borde
    motores(true, false, 180); delay(420);    // gira hacia dentro de la arena
  } else {
    motores(true, true, 150);                 // sin borde: avanza
  }
  delay(5);
}
`,
      see: "En la arena el robot avanza, retrocede al ver el borde negro y vuelve a entrar.",
      checks: [
        { label: "al detectar el borde (sensor izquierdo sobre negro)", set: [{ def: "tcrt5000-module", n: 0, prop: "testBlack", value: true }], ms: 200, expect: [{ kind: "motor", motor: 0, below: -1 }, { kind: "motor", motor: 1, below: -1 }] },
        { label: "sin borde", ms: 400, expect: [{ kind: "motor", motor: 0, above: 1 }, { kind: "motor", motor: 1, above: 1 }] }
      ]
    }
  ]
};
var PROGRAM_GUIDES = [AVOID_GUIDE, LINE_GUIDE, SUMO_GUIDE, TRACKED_GUIDE, PICK_GUIDE];

// src/robotics/guide/programCheck.ts
var normalize = (t) => t.replace(/\r\n?/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").trim();
var byNormalized;
function precompiledHex(text) {
  const exact = PROGRAM_HEX[hashSource(text)];
  if (exact) return exact;
  if (!byNormalized) {
    byNormalized = /* @__PURE__ */ new Map();
    for (const g of PROGRAM_GUIDES) for (const s of g.steps) {
      const hex = stepHex(s);
      if (hex) byNormalized.set(normalize(s.source), hex);
    }
  }
  return byNormalized.get(normalize(text));
}
var stepHex = (step) => PROGRAM_HEX[hashSource(step.source)];
export {
  PROGRAM_GUIDES,
  artifactStatus,
  hashSource,
  precompiledHex,
  stepHex
};
