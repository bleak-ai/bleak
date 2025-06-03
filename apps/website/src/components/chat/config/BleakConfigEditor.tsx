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
import type {BleakElementConfig} from "bleakai";

// Internal type for managing enabled state
interface ElementEnabledState {
  [key: string]: boolean;
}

interface BleakElementConfigEditorProps {
  onConfigChange: (config: BleakElementConfig) => void;
  isCollapsed?: boolean;
}

const BLEAK_ELEMENT_ICONS = {
  text: Type,
  radio: CheckCircle,
  multi_select: List,
  slider: BarChart3
} as const;

const BLEAK_ELEMENT_DISPLAY_NAMES = {
  text: "Text Input",
  radio: "Radio Button",
  multi_select: "Multi Select",
  slider: "Slider"
} as const;

export const BleakElementConfigEditor: React.FC<
  BleakElementConfigEditorProps
> = ({onConfigChange, isCollapsed = false}) => {
  // Initialize config from default BLEAK_ELEMENT_CONFIG
  const [config, setConfig] =
    useState<BleakElementConfig>(BLEAK_ELEMENT_CONFIG);
  const [enabledState, setEnabledState] = useState<ElementEnabledState>(() => {
    const initialEnabled: ElementEnabledState = {};
    Object.keys(BLEAK_ELEMENT_CONFIG).forEach((key) => {
      initialEnabled[key] = true;
    });
    return initialEnabled;
  });

  const [editingType, setEditingType] = useState<string | null>(null);
  const [tempConfig, setTempConfig] = useState<{
    description: string;
  }>({
    description: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartEdit = (type: string) => {
    setEditingType(type);
    setTempConfig({
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
    setTempConfig({description: ""});
  };

  const handleReset = () => {
    setConfig(BLEAK_ELEMENT_CONFIG);
    const resetEnabled: ElementEnabledState = {};
    Object.keys(BLEAK_ELEMENT_CONFIG).forEach((key) => {
      resetEnabled[key] = true;
    });
    setEnabledState(resetEnabled);
    onConfigChange(BLEAK_ELEMENT_CONFIG);
  };

  const handleToggleEnabled = (type: string) => {
    const newEnabledState = {
      ...enabledState,
      [type]: !enabledState[type]
    };
    setEnabledState(newEnabledState);

    // Create filtered config with only enabled elements
    const filteredConfig: BleakElementConfig = {};
    Object.entries(config).forEach(([key, value]) => {
      if (newEnabledState[key]) {
        filteredConfig[key] = value;
      }
    });
    onConfigChange(filteredConfig);
  };

  const enabledCount = Object.values(enabledState).filter(
    (enabled) => enabled
  ).length;

  if (isCollapsed) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Component Types
            </h3>
            <p className="text-sm text-muted-foreground">
              {enabledCount} of {Object.keys(config).length} types enabled
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
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
                className="border border-border rounded-lg p-4 space-y-4 bg-card"
              >
                {/* Header with Icon, Name, and Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {BLEAK_ELEMENT_DISPLAY_NAMES[
                          type as keyof typeof BLEAK_ELEMENT_DISPLAY_NAMES
                        ] || type}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {type} component
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleStartEdit(type)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                      title="Edit component settings"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() => handleToggleEnabled(type)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        enabledState[type]
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      title={
                        enabledState[type]
                          ? "Disable component"
                          : "Enable component"
                      }
                    >
                      {enabledState[type] ? (
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
                      enabledState[type]
                        ? "text-muted-foreground"
                        : "text-muted-foreground/60"
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
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No component types are enabled.</p>
            <p className="text-xs mt-1">
              Enable at least one type to use the chat.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-foreground">
              {editingType && (
                <>
                  {React.createElement(
                    BLEAK_ELEMENT_ICONS[
                      editingType as keyof typeof BLEAK_ELEMENT_ICONS
                    ] || Type,
                    {
                      className: "h-5 w-5 text-muted-foreground"
                    }
                  )}
                  Edit{" "}
                  {BLEAK_ELEMENT_DISPLAY_NAMES[
                    editingType as keyof typeof BLEAK_ELEMENT_DISPLAY_NAMES
                  ] || editingType}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Customize how the AI uses this component type in conversations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
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
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
