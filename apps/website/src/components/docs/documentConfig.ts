import React from "react";
import {
  BookOpen,
  Code,
  Rocket,
  FileText,
  HelpCircle,
  Play,
  ArrowRight,
  CheckCircle
} from "lucide-react";

// Import all MDX content as raw text
import bleakOverviewContent from "./files/bleak-overview.mdx?raw";
import gettingStartedContent from "./files/getting-started.mdx?raw";
import defineComponentsContent from "./files/define-components.mdx?raw";
import createSessionContent from "./files/create-session.mdx?raw";
import startConversationContent from "./files/start-conversation.mdx?raw";
import continueConversationContent from "./files/continue-conversation.mdx?raw";
import finishConversationContent from "./files/finish-conversation.mdx?raw";
import apiReferenceContent from "./files/api-reference.mdx?raw";

export interface DocumentSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  order: number;
  content: string;
}

// Single source of truth for all document configurations
export const DOCUMENT_SECTIONS: DocumentSection[] = [
  {
    id: "bleak-overview",
    title: "BleakAI Overview",
    icon: BookOpen,
    description: "Understanding BleakAI architecture and concepts",
    order: 1,
    content: bleakOverviewContent
  },
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    description: "Installation, setup, and basic configuration",
    order: 2,
    content: gettingStartedContent
  },
  {
    id: "define-components",
    title: "Define Components",
    icon: Code,
    description: "How to create and configure your UI components",
    order: 3,
    content: defineComponentsContent
  },
  {
    id: "create-session",
    title: "Create Session",
    icon: Play,
    description: "Setting up and configuring BleakSession",
    order: 4,
    content: createSessionContent
  },
  {
    id: "start-conversation",
    title: "Start Conversation",
    icon: ArrowRight,
    description: "Initiating conversations with BleakAI",
    order: 5,
    content: startConversationContent
  },
  {
    id: "continue-conversation",
    title: "Continue Conversation",
    icon: FileText,
    description: "Managing ongoing conversations",
    order: 6,
    content: continueConversationContent
  },
  {
    id: "finish-conversation",
    title: "Finish Conversation",
    icon: CheckCircle,
    description: "Completing conversations and getting final answers",
    order: 7,
    content: finishConversationContent
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: BookOpen,
    description: "Complete reference for all types, functions, and classes",
    order: 8,
    content: apiReferenceContent
  }
];

// Helper functions for accessing document data
export const getDocumentById = (id: string): DocumentSection | undefined => {
  return DOCUMENT_SECTIONS.find((doc) => doc.id === id);
};

export const getAllDocumentIds = (): string[] => {
  return DOCUMENT_SECTIONS.map((doc) => doc.id);
};

export const getDocumentContent = (): Record<string, string> => {
  return DOCUMENT_SECTIONS.reduce((acc, doc) => {
    acc[doc.id] = doc.content;
    return acc;
  }, {} as Record<string, string>);
};

export const getSortedDocuments = (): DocumentSection[] => {
  return [...DOCUMENT_SECTIONS].sort((a, b) => a.order - b.order);
};
