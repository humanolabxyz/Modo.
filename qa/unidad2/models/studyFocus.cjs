"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/study/studyFocus.ts
var studyFocus_exports = {};
__export(studyFocus_exports, {
  unit2OutlineUrl: () => unit2OutlineUrl,
  unit2ReviewUrl: () => unit2ReviewUrl
});
module.exports = __toCommonJS(studyFocus_exports);
var unit2ReviewUrl = "/estudio?curso=s2-5&unidad=mtfm01-u2&clase=mtfm01-repaso-u2";
var unit2OutlineUrl = "/estudio?curso=s2-5&unidad=mtfm01-u2#mtfm01-u2";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  unit2OutlineUrl,
  unit2ReviewUrl
});
