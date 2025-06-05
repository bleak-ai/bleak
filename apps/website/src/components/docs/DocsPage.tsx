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

        // Load Dynamic Forms parent page
        const dynamicFormsResponse = await fetch("/docs/dynamic-forms.mdx");
        if (dynamicFormsResponse.ok) {
          contents["dynamic-forms"] = await dynamicFormsResponse.text();
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

        // Load API Reference parent page
        const apiReferenceResponse = await fetch("/docs/api-reference.mdx");
        if (apiReferenceResponse.ok) {
          contents["api-reference"] = await apiReferenceResponse.text();
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
        <div className={`flex items-center ${level > 0 ? "ml-8" : ""}`}>
          {hasSubpages && (
            <button
              onClick={() => toggleSection(section.id)}
              className="p-1 hover:bg-accent rounded-lg mr-2 transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
            className={`flex-1 flex items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-200 rounded-lg group ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">{section.title}</span>
          </button>
        </div>

        {hasSubpages && isExpanded && (
          <div className="mt-2 space-y-1">
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
      if (section.id === sectionId) return section.title;
      if (section.subpages) {
        for (const subpage of section.subpages) {
          if (subpage.id === sectionId) return subpage.title;
        }
      }
    }
    return "Documentation";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-background border-r border-border overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-medium text-foreground">
                  Documentation
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <nav className="space-y-2">
                {sections.map((section) => renderSidebarSection(section))}
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar - Silent Edge: Clean, structured */}
        <aside className="hidden lg:block w-80 border-r border-border bg-muted/20">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <div className="p-8 border-b border-border">
              <h2 className="text-lg font-medium text-foreground">
                Documentation
              </h2>
            </div>
            <nav className="p-6 space-y-2">
              {sections.map((section) => renderSidebarSection(section))}
            </nav>
          </div>
        </aside>

        {/* Main Content - Silent Edge: Spacious, readable */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors duration-200"
                >
                  <Menu className="h-5 w-5 text-muted-foreground" />
                </button>
                <h1 className="text-xl font-medium text-foreground">
                  {findSectionTitle(activeSection)}
                </h1>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="content-max section-padding">
            {currentContent ? (
              <div className="prose prose-invert max-w-none">
                <MDXContent content={currentContent} />
              </div>
            ) : (
              <div className="silent-card text-center space-y-4">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">
                    Loading documentation...
                  </h3>
                  <p className="text-muted-foreground">
                    Please wait while we load the content
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsPage;
