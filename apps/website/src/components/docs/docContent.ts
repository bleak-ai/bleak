// Documentation content loader - imports all MDX files and provides instant access
// Import MDX files as raw text at build time
import gettingStartedContent from "./files/getting-started.mdx?raw";
import dynamicFormsInitializeContent from "./files/dynamic-forms-initialize.mdx?raw";
import dynamicFormsComponentsContent from "./files/dynamic-forms-components.mdx?raw";
import dynamicFormsContent from "./files/dynamic-forms.mdx?raw";
import apiReferenceContent from "./files/api-reference.mdx?raw";
import dynamicFormsQuestionsContent from "./files/dynamic-forms-questions.mdx?raw";

// Pre-loaded content - available immediately since it's bundled at build time
const docContent: Record<string, string> = {
  "getting-started": gettingStartedContent,
  "dynamic-forms-initialize": dynamicFormsInitializeContent,
  "dynamic-forms-components": dynamicFormsComponentsContent,
  "dynamic-forms": dynamicFormsContent,
  "api-reference": apiReferenceContent,
  "dynamic-forms-questions": dynamicFormsQuestionsContent
};

export const getDocContent = async (): Promise<Record<string, string>> => {
  // Return immediately since content is already loaded
  return docContent;
};

// For compatibility, also support synchronous access
export const getDocContentSync = (): Record<string, string> => {
  return docContent;
};
