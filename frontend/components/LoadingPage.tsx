// components/Spinner.tsx
"use client";

import React from "react";

type SpinnerProps = {
  /** размер в пикселях (по умолчанию 28) */
  size?: number;
  /** основной цвет (акцент) — будет плавно исчезать */
  accent?: string;
  /** при true — позиционируется абсолютно по центру контейнера (обычно не нужен, если вы используете flex) */
  center?: boolean;
  className?: string;
};

export default function Spinner({
  size = 28,
  accent = "#5E62DB",
  center = false,
  className = "",
}: SpinnerProps) {
  // CSS custom properties через inline style
  const style: React.CSSProperties = {
    // --size управляет размерами, остальная геометрия сделана в em
    ["--size" as any]: `${size}px`,
    ["--accent" as any]: accent,
  };

  return (
    <div
      role="status"
      aria-label="Загрузка"
      className={`spinner ${center ? "spinner-center" : ""} ${className}`}
      style={style}
    >
      {/* 12 лопастей */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="spinner-blade" />
      ))}

      <style jsx>{`
        .spinner {
          /* используется единица em, где 1em = var(--size) */
          font-size: var(--size, 28px);
          position: relative;
          display: inline-block;
          width: 1em;
          height: 1em;
        }

        /* если нужно абсолютное центрирование внутри контейнера */
        .spinner-center {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
        }

        .spinner .spinner-blade {
          position: absolute;
          left: 0.4629em;
          bottom: 0;
          width: 0.074em;
          height: 0.2777em;
          border-radius: 0.0555em;
          background-color: transparent;
          transform-origin: center -0.2222em;
          animation: spinner-fade 1s infinite linear;
        }

        /* повороты и задержки (каждые 30deg, шаг задержки ~1/12 = 0.0833s) */
        .spinner .spinner-blade:nth-child(1)  { transform: rotate(0deg);     animation-delay: 0s;     }
        .spinner .spinner-blade:nth-child(2)  { transform: rotate(30deg);    animation-delay: 0.083s;  }
        .spinner .spinner-blade:nth-child(3)  { transform: rotate(60deg);    animation-delay: 0.166s;  }
        .spinner .spinner-blade:nth-child(4)  { transform: rotate(90deg);    animation-delay: 0.249s;  }
        .spinner .spinner-blade:nth-child(5)  { transform: rotate(120deg);   animation-delay: 0.332s;  }
        .spinner .spinner-blade:nth-child(6)  { transform: rotate(150deg);   animation-delay: 0.415s;  }
        .spinner .spinner-blade:nth-child(7)  { transform: rotate(180deg);   animation-delay: 0.498s;  }
        .spinner .spinner-blade:nth-child(8)  { transform: rotate(210deg);   animation-delay: 0.581s;  }
        .spinner .spinner-blade:nth-child(9)  { transform: rotate(240deg);   animation-delay: 0.664s;  }
        .spinner .spinner-blade:nth-child(10) { transform: rotate(270deg);   animation-delay: 0.747s;  }
        .spinner .spinner-blade:nth-child(11) { transform: rotate(300deg);   animation-delay: 0.830s;  }
        .spinner .spinner-blade:nth-child(12) { transform: rotate(330deg);   animation-delay: 0.913s;  }

        /* анимация — от акцента к прозрачному */
        @keyframes spinner-fade {
          0%   { background-color: var(--accent); }
          100% { background-color: transparent;   }
        }
      `}</style>
    </div>
  );
}
