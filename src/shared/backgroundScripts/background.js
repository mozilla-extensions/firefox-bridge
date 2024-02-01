import { initSharedListeners } from "./listeners.js";
import { initPlatformListeners } from "Interfaces/listeners.js";
import { initTelemetryListeners } from "./telemetry.js";
import "./polyfill.js";

initPlatformListeners();
initSharedListeners();
initTelemetryListeners();
