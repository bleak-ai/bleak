import React, {useState} from "react";
import {Card} from "../../ui/card";
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
  Settings,
  Edit3,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Type,
  CheckCircle,
  List,
  BarChart3,
  X
} from "lucide-react";
import {QUESTION_CONFIG} from "../../../config/questionConfig";

export interface CustomQuestionConfig {
  [key: string]: {
    name: string;
    description: string;
    enabled: boolean;
  };
}

interface QuestionConfigEditorProps {
  onConfigChange: (config: CustomQuestionConfig) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const QUESTION_ICONS = {
  text: Type,
  radio: CheckCircle,
  multi_select: List,
  slider: BarChart3
} as const;

export const QuestionConfigEditor: React.FC<QuestionConfigEditorProps> = ({
  onConfigChange,
  isCollapsed = true,
  onToggleCollapse
}) => {
  // Initialize config from default QUESTION_CONFIG
  const [config, setConfig] = useState<CustomQuestionConfig>(() => {
    const initialConfig: CustomQuestionConfig = {};
    Object.entries(QUESTION_CONFIG).forEach(([key, value]) => {
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
    const resetConfig: CustomQuestionConfig = {};
    Object.entries(QUESTION_CONFIG).forEach(([key, value]) => {
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
    return (
      <Card
        className="bg-white/5 border-white/10 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-white/70" />
              <div>
                <h3 className="font-semibold text-white">
                  Question Configuration
                </h3>
                <p className="text-sm text-white/60">
                  {enabledCount} question types active
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        className="bg-white/5 border-white/10 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 ">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-white/70" />
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Question Configuration
                </h3>
                <p className="text-sm text-white/60">
                  Customize how AI generates questions for your users
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Question Type Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(config).map(([type, typeConfig]) => {
              const IconComponent =
                QUESTION_ICONS[type as keyof typeof QUESTION_ICONS] || Type;

              return (
                <Card
                  key={type}
                  className={`p-4 transition-all duration-200 cursor-pointer border ${
                    typeConfig.enabled
                      ? "bg-white/5 border-white/20 hover:border-white/30 hover:bg-white/10"
                      : "bg-gray-900/50 border-gray-800 opacity-60"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // typeConfig.enabled && handleStartEdit(type);
                    handleToggleEnabled(type);
                  }}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Icon */}
                    <div
                      className={`p-3 rounded-full ${
                        typeConfig.enabled
                          ? "bg-white/10 text-white/80"
                          : "bg-gray-800 text-gray-600"
                      }`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>

                    {/* Title */}
                    <div>
                      <h4
                        className={`font-medium mb-1 ${
                          typeConfig.enabled ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {typeConfig.name}
                      </h4>
                      <p className="text-xs text-white/40 uppercase tracking-wide">
                        {type}
                      </p>
                    </div>

                    {/* Description Preview */}
                    <p
                      className={`text-xs line-clamp-3 leading-relaxed ${
                        typeConfig.enabled ? "text-white/60" : "text-gray-600"
                      }`}
                    >
                      {typeConfig.description.substring(0, 80)}...
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleEnabled(type);
                        }}
                        className={`text-xs ${
                          typeConfig.enabled
                            ? "text-green-400 hover:text-green-300 hover:bg-green-400/10"
                            : "text-gray-500 hover:text-gray-400 hover:bg-gray-700/50"
                        }`}
                      >
                        {typeConfig.enabled ? "Enabled" : "Disabled"}
                      </Button>

                      {typeConfig.enabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(type);
                          }}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-sm text-white/70">
              <strong className="text-white">Active Question Types:</strong>{" "}
              {enabledCount} of {Object.keys(config).length}
              <br />
              <span className="text-white/60">
                These configurations will guide how the AI generates questions
                for your users.
              </span>
            </p>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px] bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              {editingType && (
                <>
                  {React.createElement(
                    QUESTION_ICONS[
                      editingType as keyof typeof QUESTION_ICONS
                    ] || Type,
                    {
                      className: "h-5 w-5 text-rose-400"
                    }
                  )}
                  Edit {config[editingType]?.name} Question Type
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Customize how the AI uses this question type. Your changes will
              guide the AI's behavior when generating questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Display Name
              </label>
              <Input
                value={tempConfig.name}
                onChange={(e) =>
                  setTempConfig((prev) => ({...prev, name: e.target.value}))
                }
                placeholder="Question type name"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-rose-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
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
                placeholder="Describe when and how this question type should be used..."
                className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-rose-400"
              />
              <p className="text-xs text-white/40">
                These instructions help the AI understand when and how to use
                this question type.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={handleCloseModal}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
