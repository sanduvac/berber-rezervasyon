import { Barber } from "../types/barber";

export const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];
export const WEEKDAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export function toMinutes(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function isOpenNow(barber: Barber, now: Date = new Date()): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openingMinutes = toMinutes(barber.openingTime);
  const closingMinutes = toMinutes(barber.closingTime);

  if (openingMinutes <= closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }

  return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
}

export function parseDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${WEEKDAY_NAMES[date.getDay()]}`;
}

export function parseDateTime(dateKey: string, time: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function formatRemaining(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Geçti";
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}g ${hours}s`;
  if (hours > 0) return `${hours}s ${minutes}d`;
  return `${minutes} dk`;
}

export function formatRemainingLong(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Geçti";
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} gün ${hours} saat`;
  if (hours > 0) return `${hours} saat ${minutes} dk`;
  return `${minutes} dakika`;
}

export function isPastSlot(dateKey: string, time: string, now: Date = new Date()): boolean {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const slotDate = new Date(year, month - 1, day, hour, minute, 0, 0);
  return slotDate.getTime() <= now.getTime();
}
