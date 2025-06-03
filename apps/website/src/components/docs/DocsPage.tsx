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
  ChevronRight
} from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string;
}

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [docContents, setDocContents] = useState<Record<string, string>>({});

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
      content: ""
    },
    {
      id: "api-reference",
      title: "API Reference",
      icon: BookOpen,
      content: ""
    }
  ];

  // Load MDX content from actual files
  useEffect(() => {
    const loadContent = async () => {
      const contents: Record<string, string> = {};

      try {
        // Load each MDX file
        const gettingStartedResponse = await fetch("/docs/getting-started.mdx");
        if (gettingStartedResponse.ok) {
          contents["getting-started"] = await gettingStartedResponse.text();
        }

        const dynamicFormsResponse = await fetch("/docs/dynamic-forms.mdx");
        if (dynamicFormsResponse.ok) {
          contents["dynamic-forms"] = await dynamicFormsResponse.text();
        }

        const apiReferenceResponse = await fetch("/docs/api-reference.mdx");
        if (apiReferenceResponse.ok) {
          contents["api-reference"] = await apiReferenceResponse.text();
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

  const renderSidebarSection = (section: DocSection) => {
    const Icon = section.icon;
    const isActive = activeSection === section.id;

    return (
      <button
        key={section.id}
        onClick={() => {
          setActiveSection(section.id);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-200 rounded-lg group ${
          isActive
            ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        }`}
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
    );
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-zinc-900 border-r border-zinc-800 transform ${
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
            {sections.map(renderSidebarSection)}
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
                  {sections.find((s) => s.id === activeSection)?.title}
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
