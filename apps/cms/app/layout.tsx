/**
 * Root layout renders only children so Payload admin (payload)/layout can
 * provide its own <html>/<body>. Other routes use (main)/layout for document shell.
 * This avoids nested <html> inside <body> and hydration errors.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
