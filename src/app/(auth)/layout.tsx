import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-[400px] border bg-card text-card-foreground shadow-sm rounded-xl p-6 sm:p-8">
        <div className="flex justify-center mb-8">
          <a href="/" className="font-serif text-3xl font-bold tracking-tighter">CREST</a>
        </div>
        {children}
      </div>
    </div>
  );
}
