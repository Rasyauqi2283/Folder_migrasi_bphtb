import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Jakarta";

/**
 * Batas waktu pelaporan aktivitas bulan sebelumnya: tanggal 10 bulan berikutnya.
 * Mengembalikan Date jatuh tempo terdekat relatif terhadap currentDate (tgl 10 bulan ini atau bulan depan).
 */
export function calculateDeadline(currentDate: Date = new Date()): Date {
  const d = dayjs(currentDate).tz(TZ).startOf("day");
  const thisMonthTenth = d.date(10).startOf("day");
  if (d.isBefore(thisMonthTenth, "day") || d.isSame(thisMonthTenth, "day")) {
    return thisMonthTenth.toDate();
  }
  return d.add(1, "month").date(10).startOf("day").toDate();
}

/** True jika hari ini tgl 1–9 (countdown ke tgl 10 bulan ini). */
export function isInPreDeadlineCountdownWindow(now: Date = new Date()): boolean {
  const d = dayjs(now).tz(TZ);
  const day = d.date();
  return day >= 1 && day <= 9;
}

export type CountdownParts = {
  totalMs: number;
  days: number;
  hours: number;
  urgent: boolean; // sisa <= 3 hari
  warning: boolean; // sisa > 3 hari
};

/** Sisa waktu menuju deadline (tgl 10 bulan berjalan, Jakarta). */
export function getCountdownToMonthTenth(now: Date = new Date()): CountdownParts | null {
  if (!isInPreDeadlineCountdownWindow(now)) return null;
  const d = dayjs(now).tz(TZ);
  const deadline = d.date(10).hour(0).minute(0).second(0).millisecond(0);
  const diff = deadline.diff(d);
  if (diff <= 0) {
    return { totalMs: 0, days: 0, hours: 0, urgent: true, warning: false };
  }
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return {
    totalMs: diff,
    days,
    hours,
    urgent: days <= 3,
    warning: days > 3,
  };
}
