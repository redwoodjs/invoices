import React from "react";
import stylesUrl from "./style.css?url";
import { requestInfo } from "rwsdk/worker";

import type { DocumentProps } from "rwsdk/router";

export const Document: React.FC<DocumentProps> = ({ children }) => {
  const theme = requestInfo?.ctx?.theme || "system";

  return (
    <html lang="en" data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Billable: Billing Made Simple. Period.</title>
        {/* Script to set theme class BEFORE styles load to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = ${JSON.stringify(theme)};
                const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const shouldBeDark = theme === 'dark' || (theme === 'system' && isSystemDark);
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
        <link rel="stylesheet" href={stylesUrl} />
        <link rel="modulepreload" href="/src/client.tsx" as="script" />
      </head>
      <body>
        <div id="root">{children}</div>
        <script>import("/src/client.tsx")</script>
      </body>
    </html>
  );
};
