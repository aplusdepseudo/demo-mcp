import {
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser';

const COGNITIVE_SERVICES_SCOPE = 'https://cognitiveservices.azure.com/.default';

let msalInstance: PublicClientApplication | null = null;

function getMsalConfig() {
  const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;
  const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID;

  if (!clientId || !tenantId) {
    throw new Error(
      'Missing VITE_ENTRA_CLIENT_ID and/or VITE_ENTRA_TENANT_ID in environment variables.',
    );
  }

  return {
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      redirectUri: window.location.origin,
    },
  };
}

async function getInstance(): Promise<PublicClientApplication> {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(getMsalConfig());
    await msalInstance.initialize();
  }
  return msalInstance;
}

/**
 * Acquire a bearer token for Azure Cognitive Services.
 * Tries silent acquisition first, falls back to interactive popup.
 */
export async function getAccessToken(): Promise<string> {
  const msal = await getInstance();
  const accounts = msal.getAllAccounts();

  if (accounts.length > 0) {
    try {
      const result: AuthenticationResult = await msal.acquireTokenSilent({
        scopes: [COGNITIVE_SERVICES_SCOPE],
        account: accounts[0],
      });
      return result.accessToken;
    } catch {
      // Silent acquisition failed — fall through to interactive
    }
  }

  const result: AuthenticationResult = await msal.acquireTokenPopup({
    scopes: [COGNITIVE_SERVICES_SCOPE],
  });
  return result.accessToken;
}

/** Return the currently signed-in account, or null. */
export async function getAccount(): Promise<AccountInfo | null> {
  const msal = await getInstance();
  return msal.getAllAccounts()[0] ?? null;
}
