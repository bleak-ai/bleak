// Documentation content loader - imports all MDX files and provides instant access
const loadDocContent = async (): Promise<Record<string, string>> => {
  try {
    // Use dynamic imports to load all MDX files
    const [
      gettingStarted,
      dynamicFormsInitialize,
      dynamicFormsComponents,
      dynamicForms,
      apiReference,
      dynamicFormsQuestions
    ] = await Promise.all([
      fetch("/docs/getting-started.mdx").then((r) => r.text()),
      fetch("/docs/dynamic-forms-initialize.mdx").then((r) => r.text()),
      fetch("/docs/dynamic-forms-components.mdx").then((r) => r.text()),
      fetch("/docs/dynamic-forms.mdx").then((r) => r.text()),
      fetch("/docs/api-reference.mdx").then((r) => r.text()),
      fetch("/docs/dynamic-forms-questions.mdx").then((r) => r.text())
    ]);

    return {
      "getting-started": gettingStarted,
      "dynamic-forms-initialize": dynamicFormsInitialize,
      "dynamic-forms-components": dynamicFormsComponents,
      "dynamic-forms": dynamicForms,
      "api-reference": apiReference,
      "dynamic-forms-questions": dynamicFormsQuestions
    };
  } catch (error) {
    console.error("Failed to load documentation content:", error);
    return {};
  }
};

// Pre-load content and cache it
let cachedContent: Record<string, string> | null = null;
let loadingPromise: Promise<Record<string, string>> | null = null;

export const getDocContent = async (): Promise<Record<string, string>> => {
  if (cachedContent) {
    return cachedContent;
  }

  if (!loadingPromise) {
    loadingPromise = loadDocContent();
  }

  cachedContent = await loadingPromise;
  return cachedContent;
};

// Pre-load content immediately when module is imported
getDocContent().catch(console.error);
