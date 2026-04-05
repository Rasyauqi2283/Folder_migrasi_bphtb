"use client";

import MonitoringKeterlambatanContent from "../../../components/ppat/MonitoringKeterlambatanContent";

export default function AdminMonitoringPpatKeterlambatanPage() {
  return (
    <MonitoringKeterlambatanContent
      backHref="/admin"
      backLabel="← Kembali ke Admin"
      showCountdownBanner={false}
    />
  );
}
