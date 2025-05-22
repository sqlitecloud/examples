
export function renderLoginPage(clientId: string, redirectUri: string, state: string): string {
    return `<html><body>
      <a href="https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=openid%20email%20profile&state=${state}">Login with Google</a>
    </body></html>`;
  }
  