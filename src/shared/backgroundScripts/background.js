import { initSharedListeners } from "./listeners.js";
import { initPlatformListeners } from "Interfaces/listeners.js";
import { initTelemetryListeners } from "./telemetry.js";
import { polyfillBrowser } from "./polyfill.js";

polyfillBrowser();
initPlatformListeners();
initSharedListeners();
initTelemetryListeners();
