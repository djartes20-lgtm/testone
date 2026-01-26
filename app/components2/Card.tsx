import { ReactNode } from "react";

export default function Card({ title, children }: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border-2 border-red-600 rounded-xl p-4 shadow-[0_0_20px_red] bg-black">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {children}
    </div>
  
);
}
