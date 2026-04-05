"use client";

import MonitoringKeterlambatanContent from "../../../../components/ppat/MonitoringKeterlambatanContent";

export default function MonitoringKeterlambatanPage() {
  return (
    <MonitoringKeterlambatanContent
      backHref="/pu/laporan"
      backLabel="← Kembali ke Laporan PPAT"
      showCountdownBanner
    />
  );
}
