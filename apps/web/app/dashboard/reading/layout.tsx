import { ReadingSettingsProvider } from "@/context/ReadingSettingsContext";

export default function ReadingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReadingSettingsProvider>{children}</ReadingSettingsProvider>;
}
