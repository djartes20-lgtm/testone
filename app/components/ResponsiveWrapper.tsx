"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

const ResponsiveWrapper: React.FC<Props> = ({ children }) => {
  return (
    <div className="responsive-container">
      {children}

      <style jsx>{`
        .responsive-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .responsive-container {
            padding: 10px;
            gap: 12px;
          }

          .responsive-container .grid-cols-2 {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .responsive-container button {
            font-size: 14px;
            padding: 8px 10px;
          }

          .responsive-container .p-5 {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResponsiveWrapper;
