// Email service for handling newsletter subscriptions
// Configure this with your SMTP2Go or preferred email service

export interface EmailSubmission {
  email: string;
  source?: string;
  timestamp?: Date;
}

export async function subscribeToNewsletter(email: string): Promise<boolean> {
  try {
    // TODO: Replace with your actual email service integration
    // Example SMTP2Go integration:

    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        source: "landing-page",
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error("Failed to subscribe");
    }

    return true;
  } catch (error) {
    console.error("Email subscription error:", error);
    return false;
  }
}

// For development/demo purposes - stores emails in localStorage
export function storeEmailLocally(email: string): boolean {
  try {
    const existingEmails = JSON.parse(
      localStorage.getItem("bleak-emails") || "[]"
    );
    if (!existingEmails.includes(email)) {
      existingEmails.push(email);
      localStorage.setItem("bleak-emails", JSON.stringify(existingEmails));
    }
    console.log("Email stored locally:", email);
    return true;
  } catch (error) {
    console.error("Failed to store email locally:", error);
    return false;
  }
}

export function getStoredEmails(): string[] {
  try {
    return JSON.parse(localStorage.getItem("bleak-emails") || "[]");
  } catch {
    return [];
  }
}
