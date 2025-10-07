// components/LoadingPage.tsx
"use client";

import React from "react";

type LoadingPageProps = {
  /** Основное сообщение (заголовок) */
  message?: string;
  /** Если передать число 0..100, покажется индикатор прогресса */
  progress?: number | null;
  /** Подсказка под прогрессом */
  hint?: string;
};

export default function LoadingPage({
  message = "Загрузка...",
  progress = null,
  hint = "Подождите немного — мы подготавливаем данные",
}: LoadingPageProps) {
  const showProgress = typeof progress === "number" && !Number.isNaN(progress);

  return (
    <div className="pt-14 pb-16 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
      <div className="w-full max-w-xl px-6">
        <div className="mx-auto rounded-xl p-8 bg-white dark:bg-gray-900 text-center">
          <div role="status" aria-live="polite" className="flex items-center justify-center mb-6">
            <svg
              className="w-20 h-20 animate-spin"
              viewBox="0 0 50 50"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="lg" x1="0" x2="1">
                  <stop offset="0%" stopColor="#5E62DB" />
                  <stop offset="100%" stopColor="#7C9BFF" />
                </linearGradient>
              </defs>

              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                strokeOpacity="0.08"
                fill="none"
                className="text-gray-600 dark:text-gray-300"
              />

              <path
                d="M25 5
                   a20 20 0 0 1 0 40
                   a20 20 0 0 1 0 -40"
                stroke="url(#lg)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="80"
                strokeDashoffset="60"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{message}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Мы загружаем страницу и подготавливаем данные — это не займёт много времени.
          </p>

          <div className="mt-6">
            {showProgress ? (
              <>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-100 dark:border-gray-800">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, progress as number))}%`,
                      background: "linear-gradient(90deg,#5E62DB 0%,#7C9BFF 100%)",
                      transition: "width 400ms ease",
                    }}
                  />
                </div>
                <div className="mt-3 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                  <span>{Math.round(Math.max(0, Math.min(100, progress as number)))}%</span>
                  <span>{hint}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#5E62DB", animation: "bounce 0.9s infinite" }} />
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#7C9BFF", animation: "bounce 0.9s infinite 0.12s" }} />
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#A7C0FF", animation: "bounce 0.9s infinite 0.24s" }} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Подключение к серверу…</div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Если загрузка длится очень долго — проверьте интернет-соединение или перезагрузите страницу.
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-6px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.9; }
        }
        /* ensure svg spin speed is comfortable */
        .animate-spin { animation: spin 1.4s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
