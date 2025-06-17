import React, {useState, useEffect, useMemo} from "react";
import {Button} from "../ui/button";
import {MDXContent} from "../docs/MDXContent";
import {
  BookOpen,
  Code,
  Rocket,
  FileText,
  Menu,
  X,
  HelpCircle
} from "lucide-react";
import {DOCUMENT_SECTIONS, getSortedDocuments} from "../docs/documentConfig";
import type {DocumentSection} from "../docs/documentConfig";

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load documentation content on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        // Content is now pre-loaded in the centralized config
        // No need to fetch anything
      } catch (error) {
        console.error("Failed to load documentation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  // Use centralized document sections
  const sections: DocumentSection[] = getSortedDocuments();

  const currentSection = sections.find((s) => s.id === activeSection);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);

    // Update URL without page reload for better UX
    const newUrl = `/docs#${sectionId}`;
    window.history.pushState({sectionId}, "", newUrl);
  };

  // Handle direct navigation from URLs and browser back/forward
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const hash = window.location.hash.replace("#", "");
      if (hash && sections.find((s) => s.id === hash)) {
        setActiveSection(hash);
      }
    };

    const hash = window.location.hash.replace("#", "");
    if (hash && sections.find((s) => s.id === hash)) {
      setActiveSection(hash);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [sections]);

  const renderSidebarSection = (section: DocumentSection) => {
    const Icon = section.icon;
    const isActive = activeSection === section.id;

    return (
      <button
        key={section.id}
        onClick={() => handleSectionClick(section.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-200 rounded-lg group ${
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium">{section.title}</span>
      </button>
    );
  };

  // Show loading state while content loads
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-left">
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
                <h2 className="text-lg font-semibold text-foreground">
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
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 border-r border-border bg-card/50">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <div className="p-8 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Documentation
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Learn how to use BleakAI
              </p>
            </div>
            <nav className="p-6 space-y-2">
              {sections.map((section) => renderSidebarSection(section))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
            <div className="flex items-center justify-between px-8 py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors duration-200"
                >
                  <Menu className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="flex items-center gap-3">
                  {currentSection && (
                    <currentSection.icon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <h1 className="text-xl font-semibold text-foreground">
                    {currentSection?.title || "Documentation"}
                  </h1>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="md:px-8 py-12 max-w-4xl mx-auto">
            {currentSection?.content ? (
              <div className="prose prose-invert max-w-none">
                <MDXContent
                  content={currentSection.content}
                  onInternalNavigation={handleSectionClick}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <BookOpen className="w-16 h-16 text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">
                    Content not found
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    The requested documentation section could not be loaded.
                    Please try selecting another section.
                  </p>
                </div>
                <Button
                  onClick={() => handleSectionClick("getting-started")}
                  className="mt-4"
                >
                  Go to Getting Started
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsPage;
