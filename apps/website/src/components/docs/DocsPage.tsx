import React, {useState, useEffect} from "react";
import {Button} from "../ui/button";
import {MDXContent} from "./MDXContent";
import {
  BookOpen,
  Code,
  Rocket,
  FileText,
  Menu,
  X,
  ChevronRight,
  ChevronDown
} from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string;
  subpages?: DocSection[];
}

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [docContents, setDocContents] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["dynamic-forms", "api-reference"])
  );

  const sections: DocSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Rocket,
      content: ""
    },
    {
      id: "dynamic-forms",
      title: "Dynamic Forms",
      icon: Code,
      content: "",
      subpages: [
        {
          id: "dynamic-forms-initialize",
          title: "Initialize Chat Client",
          icon: Rocket,
          content: ""
        },
        {
          id: "dynamic-forms-components",
          title: "Create Custom Components",
          icon: Code,
          content: ""
        },
        {
          id: "dynamic-forms-questions",
          title: "Ask Questions",
          icon: FileText,
          content: ""
        },
        {
          id: "dynamic-forms-answers",
          title: "Send Answers",
          icon: ChevronRight,
          content: ""
        }
      ]
    },
    {
      id: "api-reference",
      title: "API Reference",
      icon: BookOpen,
      content: "",
      subpages: [
        {
          id: "api-reference-sdk",
          title: "SDK Methods",
          icon: Code,
          content: ""
        },
        {
          id: "api-reference-core",
          title: "Core Methods",
          icon: BookOpen,
          content: ""
        }
      ]
    }
  ];

  // Load MDX content from actual files
  useEffect(() => {
    const loadContent = async () => {
      const contents: Record<string, string> = {};

      try {
        // Load main sections
        const gettingStartedResponse = await fetch("/docs/getting-started.mdx");
        if (gettingStartedResponse.ok) {
          contents["getting-started"] = await gettingStartedResponse.text();
        }

        // Load Dynamic Forms subpages
        const dynamicFormsSubpages = [
          "dynamic-forms-initialize",
          "dynamic-forms-components",
          "dynamic-forms-questions",
          "dynamic-forms-answers"
        ];

        for (const subpage of dynamicFormsSubpages) {
          const response = await fetch(`/docs/${subpage}.mdx`);
          if (response.ok) {
            contents[subpage] = await response.text();
          }
        }

        // Load API Reference subpages
        const apiReferenceSubpages = [
          "api-reference-sdk",
          "api-reference-core"
        ];

        for (const subpage of apiReferenceSubpages) {
          const response = await fetch(`/docs/${subpage}.mdx`);
          if (response.ok) {
            contents[subpage] = await response.text();
          }
        }
      } catch (error) {
        console.error("Failed to load MDX files:", error);
        // Fallback content if files can't be loaded
        contents["getting-started"] =
          "# Error\n\nCould not load documentation content.";
      }

      setDocContents(contents);
    };

    loadContent();
  }, []);

  const currentContent = docContents[activeSection] || "";

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderSidebarSection = (section: DocSection, level = 0) => {
    const Icon = section.icon;
    const isActive = activeSection === section.id;
    const hasSubpages = section.subpages && section.subpages.length > 0;
    const isExpanded = expandedSections.has(section.id);

    return (
      <div key={section.id}>
        <div className={`flex items-center ${level > 0 ? "ml-4" : ""}`}>
          {hasSubpages && (
            <button
              onClick={() => toggleSection(section.id)}
              className="p-1 hover:bg-zinc-800 rounded mr-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-zinc-400" />
              )}
            </button>
          )}

          <button
            onClick={() => {
              setActiveSection(section.id);
              setSidebarOpen(false);
              if (hasSubpages && !isExpanded) {
                toggleSection(section.id);
              }
            }}
            className={`flex-1 flex items-center gap-3 px-3 py-2 text-left text-sm transition-all duration-200 rounded-lg group ${
              isActive
                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            } ${!hasSubpages && level > 0 ? "ml-2" : ""}`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isActive
                  ? "text-orange-400"
                  : "text-zinc-500 group-hover:text-zinc-300"
              }`}
            />
            <span className="font-medium">{section.title}</span>
            {isActive && (
              <ChevronRight className="h-4 w-4 ml-auto text-orange-400" />
            )}
          </button>
        </div>

        {hasSubpages && isExpanded && (
          <div className="mt-1 space-y-1">
            {section.subpages!.map((subpage) =>
              renderSidebarSection(subpage, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const findSectionTitle = (sectionId: string): string => {
    for (const section of sections) {
      if (section.id === sectionId) {
        return section.title;
      }
      if (section.subpages) {
        for (const subpage of section.subpages) {
          if (subpage.id === sectionId) {
            return subpage.title;
          }
        }
      }
    }
    return "Documentation";
  };

  return (
    <div className="flex bg-zinc-950 text-white min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-zinc-900 border-r border-zinc-800 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-white">BleakAI</h2>
            <p className="text-sm text-zinc-400">Documentation</p>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <div className="mb-4">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 px-4">
              Documentation
            </div>
            {sections.map((section) => renderSidebarSection(section))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="w-full text-left">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-zinc-400 hover:text-white hover:bg-zinc-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span>Docs</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white font-medium">
                  {findSectionTitle(activeSection)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-24 py-8">
          <div className="max-w-none">
            <MDXContent content={currentContent} />
          </div>
        </div>

        {/* Footer navigation */}
        <div className="border-t border-zinc-800 px-6 py-6">
          <div className="max-w-none flex justify-between">
            {/* Previous section */}
            {sections.findIndex((s) => s.id === activeSection) > 0 && (
              <button
                onClick={() => {
                  const currentIndex = sections.findIndex(
                    (s) => s.id === activeSection
                  );
                  setActiveSection(sections[currentIndex - 1].id);
                }}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>
                  Previous:{" "}
                  {
                    sections[
                      sections.findIndex((s) => s.id === activeSection) - 1
                    ]?.title
                  }
                </span>
              </button>
            )}

            {/* Next section */}
            {sections.findIndex((s) => s.id === activeSection) <
              sections.length - 1 && (
              <button
                onClick={() => {
                  const currentIndex = sections.findIndex(
                    (s) => s.id === activeSection
                  );
                  setActiveSection(sections[currentIndex + 1].id);
                }}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors ml-auto"
              >
                <span>
                  Next:{" "}
                  {
                    sections[
                      sections.findIndex((s) => s.id === activeSection) + 1
                    ]?.title
                  }
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
