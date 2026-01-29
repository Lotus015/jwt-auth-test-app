import { useState, useEffect } from 'react';

interface ParsedCookie {
  name: string;
  value: string;
}

export function CookieViewer() {
  const [cookies, setCookies] = useState<ParsedCookie[]>([]);

  useEffect(() => {
    const parseCookies = (): ParsedCookie[] => {
      if (!document.cookie) return [];

      return document.cookie.split(';').map((cookie) => {
        const [name, ...valueParts] = cookie.trim().split('=');
        return {
          name: name.trim(),
          value: valueParts.join('='),
        };
      });
    };

    // Parse cookies initially
    setCookies(parseCookies());

    // Set up interval to refresh cookies
    const interval = setInterval(() => {
      setCookies(parseCookies());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="font-medium text-gray-900 mb-3">Cookie Viewer</h3>

      {/* httpOnly note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">Note:</span> Cookies with the{' '}
          <code className="bg-yellow-100 px-1 rounded">httpOnly</code> flag (like refresh tokens)
          are not visible in JavaScript for security reasons. They are still sent automatically
          with requests to the server.
        </p>
      </div>

      {/* Cookie list */}
      <div className="space-y-2">
        {cookies.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            No cookies visible (httpOnly cookies are hidden)
          </div>
        ) : (
          cookies.map((cookie, index) => (
            <div
              key={`${cookie.name}-${index}`}
              className="bg-white border border-gray-200 rounded p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{cookie.name}</span>
                <span className="text-xs text-gray-400">Visible in JS</span>
              </div>
              <div className="font-mono text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                {cookie.value.length > 100
                  ? `${cookie.value.substring(0, 100)}...`
                  : cookie.value}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cookie Types</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">Regular cookies (visible)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="text-gray-600">httpOnly cookies (hidden)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
