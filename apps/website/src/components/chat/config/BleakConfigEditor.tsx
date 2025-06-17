import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "../../ui/card";
import {Button} from "../../ui/button";
import {Textarea} from "../../ui/textarea";
import {BLEAK_ELEMENT_CONFIG} from "../../../config/bleakConfig";

interface BleakConfigEditorProps {
  config: typeof BLEAK_ELEMENT_CONFIG | null;
  onConfigChange: (config: typeof BLEAK_ELEMENT_CONFIG | null) => void;
  onClose: () => void;
}

export const BleakElementConfigEditor: React.FC<BleakConfigEditorProps> = ({
  config,
  onConfigChange,
  onClose
}) => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      Object.keys(BLEAK_ELEMENT_CONFIG).map((key) => [key, true])
    )
  );

  // Use default config if config is null
  const currentConfig = config || BLEAK_ELEMENT_CONFIG;

  const updateConfig = (
    newConfig: typeof BLEAK_ELEMENT_CONFIG,
    newEnabled: Record<string, boolean>
  ) => {
    onConfigChange(newConfig);
  };

  const handleDescriptionChange = (type: string, description: string) => {
    const newConfig = {
      ...currentConfig,
      [type]: {
        ...currentConfig[type as keyof typeof currentConfig],
        description
      }
    };
    updateConfig(newConfig, enabled);
  };

  const handleToggle = (type: string) => {
    const newEnabled = {...enabled, [type]: !enabled[type]};
    setEnabled(newEnabled);
    updateConfig(currentConfig, newEnabled);
  };

  const handleReset = () => {
    updateConfig(BLEAK_ELEMENT_CONFIG, enabled);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Component Types</h3>
        <Button variant="ghost" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {Object.entries(currentConfig).map(([type, typeConfig]) => (
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
