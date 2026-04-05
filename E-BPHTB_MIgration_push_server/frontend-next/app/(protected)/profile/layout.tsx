import type { Metadata } from "next";

import ProfileClientLayout from "./profileClientLayout";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <ProfileClientLayout>{children}</ProfileClientLayout>;
}
