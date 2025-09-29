import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backstage - Switch.fun",
  description: "Prepare your browser stream before going live",
};

export default function BackstageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      {children}
    </div>
  );
}
