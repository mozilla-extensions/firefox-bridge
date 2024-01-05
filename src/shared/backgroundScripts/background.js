import { initSharedListeners, initSharedTelemetry } from "./listeners.js";
import { initPlatformListeners } from "../../chromium/interfaces/listeners.js";

initPlatformListeners();
initSharedListeners();
initSharedTelemetry();