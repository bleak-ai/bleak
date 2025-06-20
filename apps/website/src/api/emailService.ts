// Email service for handling newsletter subscriptions
// Connects to the backend API for real email processing

export interface EmailSubmission {
  email: string;
  source?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  email: string;
}

const API_BASE_URL =
  import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:8008";

export async function subscribeToNewsletter(
  email: string,
  source: string = "landing-page"
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        source
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Failed to subscribe");
    }

    const data: SubscriptionResponse = await response.json();
    console.log("Newsletter subscription successful:", data.message);

    // Store locally for demo purposes as backup
    storeEmailLocally(email);

    return data.success;
  } catch (error) {
    console.error("Email subscription error:", error);

    // Fallback to local storage if API fails
    return storeEmailLocally(email);
  }
}

// For development/demo purposes - stores emails in localStorage as backup
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

// Check if email service is available
export async function checkEmailServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/email/health`);
    const data = await response.json();
    return data.status === "healthy";
  } catch {
    return false;
  }
}
