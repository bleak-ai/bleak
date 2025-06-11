import {BleakUISession, type BleakUISessionConfig} from "./BleakUISession";

// Re-export types for backward compatibility
export type {SessionState} from "./IBleakSession";
export type BleakSessionConfig = BleakUISessionConfig;

/**
 * BleakSession - backward compatibility wrapper around BleakUISession
 *
 * @deprecated Use BleakUISession directly for UI functionality or BleakCoreSession for backend-only usage
 * This class is kept for backward compatibility and will be removed in a future version
 */
export class BleakSession extends BleakUISession {
  constructor(config: BleakSessionConfig) {
    super(config);
  }
}
