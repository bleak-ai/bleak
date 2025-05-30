import React, {useState} from "react";
import {Button} from "../../ui/button";
import {Input} from "../../ui/input";
import {Textarea} from "../../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog";
import {
  Edit3,
  RotateCcw,
  Type,
  CheckCircle,
  List,
  BarChart3,
  Check,
  Minus
} from "lucide-react";
import {BLEAK_ELEMENT_CONFIG} from "../../../config/bleakConfig";

export interface CustomBleakElementConfig {
  [key: string]: {
    name: string;
    description: string;
    enabled: boolean;
  };
}

interface BleakElementConfigEditorProps {
  onConfigChange: (config: CustomBleakElementConfig) => void;
  isCollapsed?: boolean;
}

const BLEAK_ELEMENT_ICONS = {
  text: Type,
  radio: CheckCircle,
  multi_select: List,
  slider: BarChart3
} as const;

export const BleakElementConfigEditor: React.FC<
  BleakElementConfigEditorProps
> = ({onConfigChange, isCollapsed = false}) => {
  // Initialize config from default BLEAK_ELEMENT_CONFIG
  const [config, setConfig] = useState<CustomBleakElementConfig>(() => {
    const initialConfig: CustomBleakElementConfig = {};
    Object.entries(BLEAK_ELEMENT_CONFIG).forEach(([key, value]) => {
      initialConfig[key] = {
        name: key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        description: value.description,
        enabled: true
      };
    });
    return initialConfig;
  });

  const [editingType, setEditingType] = useState<string | null>(null);
  const [tempConfig, setTempConfig] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartEdit = (type: string) => {
    setEditingType(type);
    setTempConfig({
      name: config[type].name,
      description: config[type].description
    });
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingType) return;

    const newConfig = {
      ...config,
      [editingType]: {
        ...config[editingType],
        name: tempConfig.name,
        description: tempConfig.description
      }
    };
    setConfig(newConfig);
    onConfigChange(newConfig);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setTempConfig({name: "", description: ""});
  };

  const handleReset = () => {
    const resetConfig: CustomBleakElementConfig = {};
    Object.entries(BLEAK_ELEMENT_CONFIG).forEach(([key, value]) => {
      resetConfig[key] = {
        name: key.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        description: value.description,
        enabled: true
      };
    });
    setConfig(resetConfig);
    onConfigChange(resetConfig);
  };

  const handleToggleEnabled = (type: string) => {
    const newConfig = {
      ...config,
      [type]: {
        ...config[type],
        enabled: !config[type].enabled
      }
    };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const enabledCount = Object.values(config).filter((c) => c.enabled).length;

  if (isCollapsed) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-1">
              Component Types
            </h3>
            <p className="text-sm text-neutral-600">
              {enabledCount} of {Object.keys(config).length} types enabled
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>

        {/* Element Types List */}
        <div className="space-y-4">
          {Object.entries(config).map(([type, typeConfig]) => {
            const IconComponent =
              BLEAK_ELEMENT_ICONS[type as keyof typeof BLEAK_ELEMENT_ICONS] ||
              Type;

            return (
              <div
                key={type}
                className="border border-neutral-200 rounded-lg p-4 space-y-4"
              >
                {/* Header with Icon, Name, and Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-neutral-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">
                        {typeConfig.name}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {type} component
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleStartEdit(type)}
                      className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="Edit component settings"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() => handleToggleEnabled(type)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        typeConfig.enabled
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                      title={
                        typeConfig.enabled
                          ? "Disable component"
                          : "Enable component"
                      }
                    >
                      {typeConfig.enabled ? (
                        <>
                          <Check className="h-3 w-3" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <Minus className="h-3 w-3" />
                          Disabled
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="pl-13">
                  <p
                    className={`text-sm leading-relaxed ${
                      typeConfig.enabled
                        ? "text-neutral-600"
                        : "text-neutral-400"
                    }`}
                  >
                    {typeConfig.description.length > 150
                      ? `${typeConfig.description.substring(0, 150)}...`
                      : typeConfig.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {enabledCount === 0 && (
          <div className="text-center py-8 text-neutral-500">
            <p className="text-sm">No component types are enabled.</p>
            <p className="text-xs mt-1">
              Enable at least one type to use the chat.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-neutral-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-neutral-900">
              {editingType && (
                <>
                  {React.createElement(
                    BLEAK_ELEMENT_ICONS[
                      editingType as keyof typeof BLEAK_ELEMENT_ICONS
                    ] || Type,
                    {
                      className: "h-5 w-5 text-neutral-600"
                    }
                  )}
                  Edit {config[editingType]?.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-neutral-600">
              Customize how the AI uses this component type in conversations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900">
                Display Name
              </label>
              <Input
                value={tempConfig.name}
                onChange={(e) =>
                  setTempConfig((prev) => ({...prev, name: e.target.value}))
                }
                placeholder="Component type name"
                className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-900">
                AI Instructions
              </label>
              <Textarea
                value={tempConfig.description}
                onChange={(e) =>
                  setTempConfig((prev) => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                placeholder="Describe when and how this component type should be used..."
                className="min-h-[100px] bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-900 focus:ring-0 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="ghost"
              onClick={handleCloseModal}
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
