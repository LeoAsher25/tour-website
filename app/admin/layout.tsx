/**
 * Admin route group shell.
 * The root admin layout is a pass-through; authenticated pages live under
 * `(main)` which enforces auth + renders the sidebar. /admin/login sits
 * outside `(main)` so it can render standalone.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
