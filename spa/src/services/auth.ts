import {
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
} from '@azure/msal-browser';
import type { TokenCredential, AccessToken, GetTokenOptions } from '@azure/core-auth';

const FOUNDRY_SCOPE = 'https://ai.azure.com/.default';

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
 * TokenCredential implementation backed by MSAL browser.
 * Tries silent acquisition first, falls back to interactive popup.
 * Implements the @azure/core-auth TokenCredential interface so it can be
 * passed directly to AIProjectClient.
 */
export class MsalBrowserCredential implements TokenCredential {
  async getToken(
    _scopes: string | string[],
    _options?: GetTokenOptions,
  ): Promise<AccessToken | null> {
    const msal = await getInstance();
    const accounts = msal.getAllAccounts();

    if (accounts.length > 0) {
      try {
        const result: AuthenticationResult = await msal.acquireTokenSilent({
          scopes: [FOUNDRY_SCOPE],
          account: accounts[0],
        });
        return {
          token: result.accessToken,
          expiresOnTimestamp: result.expiresOn?.getTime() ?? Date.now() + 3600_000,
        };
      } catch {
        // Silent acquisition failed — fall through to interactive
      }
    }

    const result: AuthenticationResult = await msal.acquireTokenPopup({
      scopes: [FOUNDRY_SCOPE],
    });
    return {
      token: result.accessToken,
      expiresOnTimestamp: result.expiresOn?.getTime() ?? Date.now() + 3600_000,
    };
  }
}

/** Return the currently signed-in account, or null. */
export async function getAccount(): Promise<AccountInfo | null> {
  const msal = await getInstance();
  return msal.getAllAccounts()[0] ?? null;
}
