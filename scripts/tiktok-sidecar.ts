import { readSidecarConfig } from "./tiktok-sidecar/config";
import { runSidecar } from "./tiktok-sidecar/runtime";

await runSidecar(readSidecarConfig());
