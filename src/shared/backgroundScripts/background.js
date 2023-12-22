import { initSharedListeners } from "./listeners.js";
import { initPlatformListeners } from "../../chromium/interfaces/listeners.js";

initPlatformListeners();
initSharedListeners();