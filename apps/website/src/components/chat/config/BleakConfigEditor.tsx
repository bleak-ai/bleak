import React, {useState} from "react";
import {Button} from "../../ui/button";
import {Textarea} from "../../ui/textarea";
import {BLEAK_ELEMENT_CONFIG} from "../../../config/bleakConfig";
import type {BleakElementConfig} from "bleakai";

interface BleakElementConfigEditorProps {
  onConfigChange: (config: BleakElementConfig) => void;
  isCollapsed?: boolean;
}

export const BleakElementConfigEditor: React.FC<
  BleakElementConfigEditorProps
> = ({onConfigChange, isCollapsed = false}) => {
  const [config, setConfig] =
    useState<BleakElementConfig>(BLEAK_ELEMENT_CONFIG);
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.keys(BLEAK_ELEMENT_CONFIG).map((key) => [key, true])
    )
  );

  const updateConfig = (
    newConfig: BleakElementConfig,
    newEnabled: Record<string, boolean>
  ) => {
    const filteredConfig: BleakElementConfig = {};
    Object.entries(newConfig).forEach(([key, value]) => {
      if (newEnabled[key]) filteredConfig[key] = value;
    });
    onConfigChange(filteredConfig);
  };

  const handleDescriptionChange = (type: string, description: string) => {
    const newConfig = {
      ...config,
      [type]: {...config[type], description}
    };
    setConfig(newConfig);
    updateConfig(newConfig, enabled);
  };

  const handleToggle = (type: string) => {
    const newEnabled = {...enabled, [type]: !enabled[type]};
    setEnabled(newEnabled);
    updateConfig(config, newEnabled);
  };

  const handleReset = () => {
    setConfig(BLEAK_ELEMENT_CONFIG);
    const resetEnabled = Object.fromEntries(
      Object.keys(BLEAK_ELEMENT_CONFIG).map((key) => [key, true])
    );
    setEnabled(resetEnabled);
    onConfigChange(BLEAK_ELEMENT_CONFIG);
  };

  if (isCollapsed) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Component Types</h3>
        <Button variant="ghost" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {Object.entries(config).map(([type, typeConfig]) => (
        <div key={type} className="border rounded p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium capitalize">
              {type.replace("_", " ")}
            </span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enabled[type]}
                onChange={() => handleToggle(type)}
              />
              Enabled
            </label>
          </div>

          <Textarea
            value={typeConfig.description}
            onChange={(e) => handleDescriptionChange(type, e.target.value)}
            placeholder="Describe when to use this component..."
            className="text-sm"
            rows={2}
            disabled={!enabled[type]}
          />
        </div>
      ))}
    </div>
  );
};
