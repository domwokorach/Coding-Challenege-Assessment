"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AntiCheatWarning = {
  message: string;
  count: number;
};

/**
 * Client-side deterrents only, scoped to whichever page mounts this hook.
 *
 * A web page cannot see or block OS-level screenshots, an external screen
 * recorder, or a second device pointed at the monitor — none of that is
 * exposed to JavaScript. What the browser *does* expose is: clipboard
 * events (copy/cut), the context menu, tab/window focus changes, and, on
 * some OS/browser combinations only, the PrintScreen key reaching the page
 * before the OS consumes it. This hook covers exactly that surface and
 * makes no claim beyond it.
 */
export function useAntiCheat() {
  const [violationCount, setViolationCount] = useState(0);
  const [warning, setWarning] = useState<AntiCheatWarning | null>(null);
  const awayRef = useRef(false);
  const countRef = useRef(0);

  const raise = useCallback((message: string) => {
    countRef.current += 1;
    setViolationCount(countRef.current);
    setWarning({ message, count: countRef.current });
  }, []);

  const acknowledge = useCallback(() => {
    setWarning(null);
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        awayRef.current = true;
        return;
      }
      if (awayRef.current) {
        awayRef.current = false;
        raise("Warning: Leaving the assessment page is not allowed.");
      }
    }

    function handleBlur() {
      // visibilitychange already covers switching tabs or minimizing; this
      // catches losing focus while the tab itself stays "visible" (e.g.
      // alt-tabbing to another application window).
      if (!document.hidden) {
        awayRef.current = true;
      }
    }

    function handleFocus() {
      if (awayRef.current) {
        awayRef.current = false;
        raise("Warning: Leaving the assessment page is not allowed.");
      }
    }

    // Best effort only: on most OS/browser combinations the PrintScreen key
    // never reaches the page at all, since the screenshot is captured by
    // the OS before the browser sees the key event. When it does arrive,
    // treat it as an attempted capture.
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "PrintScreen") {
        raise(
          "Warning: Screen capture attempts are not allowed during the assessment."
        );
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [raise]);

  const blockCopyOrCut = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      raise("Warning: Copying assessment content is not allowed.");
    },
    [raise]
  );

  const blockContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      raise("Warning: The right-click menu is disabled during the assessment.");
    },
    [raise]
  );

  return {
    violationCount,
    warning,
    acknowledge,
    blockCopyOrCut,
    blockContextMenu,
  };
}
