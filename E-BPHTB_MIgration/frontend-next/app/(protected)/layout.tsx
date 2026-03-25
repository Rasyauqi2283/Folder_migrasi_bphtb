import RequireAuth from "../components/RequireAuth";
import { SidebarProvider } from "../context/SidebarContext";
import ProtectedWithHeader from "./ProtectedWithHeader";
import SystemAlert from "../components/SystemAlert";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <SystemAlert />
        <ProtectedWithHeader>{children}</ProtectedWithHeader>
      </SidebarProvider>
    </RequireAuth>
  );
}
