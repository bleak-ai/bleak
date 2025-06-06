// Documentation content loader - imports all MDX files and provides instant access
// Import MDX files as raw text at build time
import gettingStartedContent from "../../../public/docs/getting-started.mdx?raw";
import dynamicFormsInitializeContent from "../../../public/docs/dynamic-forms-initialize.mdx?raw";
import dynamicFormsComponentsContent from "../../../public/docs/dynamic-forms-components.mdx?raw";
import dynamicFormsContent from "../../../public/docs/dynamic-forms.mdx?raw";
import apiReferenceContent from "../../../public/docs/api-reference.mdx?raw";
import dynamicFormsQuestionsContent from "../../../public/docs/dynamic-forms-questions.mdx?raw";

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
