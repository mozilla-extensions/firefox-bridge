import { initSharedListeners } from "./listeners.js";
import { initPlatformListeners } from "Interfaces/listeners.js";
import { initTelemetryListeners } from "./telemetry.js";

initPlatformListeners();
initSharedListeners();
initTelemetryListeners();
