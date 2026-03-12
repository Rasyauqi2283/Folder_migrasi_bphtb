import RequireAuth from "../components/RequireAuth";
import { SidebarProvider } from "../context/SidebarContext";
import ProtectedWithHeader from "./ProtectedWithHeader";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <ProtectedWithHeader>{children}</ProtectedWithHeader>
      </SidebarProvider>
    </RequireAuth>
  );
}
