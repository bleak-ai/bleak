import {useRef, useCallback, useMemo} from "react";
import {ComponentType} from "react";
import {BleakRenderer} from "../core/BleakRenderer";
import {BleakRendererConfig, QuestionComponentProps} from "../types";

/**
 * Hook for managing a BleakRenderer instance
 */
export const useBleakRenderer = (initialConfig: BleakRendererConfig) => {
  const rendererRef = useRef<BleakRenderer | null>(null);

  // Initialize renderer if not already created
  if (!rendererRef.current) {
    rendererRef.current = new BleakRenderer(initialConfig);
  }

  const renderer = rendererRef.current;

  // Memoized methods
  const registerComponent = useCallback(
    (type: string, component: ComponentType<QuestionComponentProps>) => {
      renderer.registerComponent(type, component);
    },
    [renderer]
  );

  const isSupportedType = useCallback(
    (type: string) => renderer.isSupportedType(type),
    [renderer]
  );

  const getSupportedTypes = useCallback(
    () => renderer.getSupportedTypes(),
    [renderer]
  );

  const updateConfig = useCallback(
    (newConfig: Partial<BleakRendererConfig>) => {
      renderer.updateConfig(newConfig);
    },
    [renderer]
  );

  // Return memoized interface
  return useMemo(
    () => ({
      renderer,
      registerComponent,
      isSupportedType,
      getSupportedTypes,
      updateConfig
    }),
    [
      renderer,
      registerComponent,
      isSupportedType,
      getSupportedTypes,
      updateConfig
    ]
  );
};

/**
 * Hook for creating a lightweight renderer instance for one-time use
 */
export const useTemporaryRenderer = (config: BleakRendererConfig) => {
  return useMemo(() => new BleakRenderer(config), [config]);
};
