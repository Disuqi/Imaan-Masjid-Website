import {formatSupabaseTime} from "@/lib/utils/date";

export enum SalahType
{
    Fajr= "fajr",
    Dhuhr = "dhuhr",
    Asr = "asr",
    Mughrib = "mughrib",
    Isha = "isha"
}

export function SalahToEnglish(salah: SalahType) : string
{
    switch(salah)
    {
        case SalahType.Fajr:
            return "Fajr";
        case SalahType.Dhuhr:
            return "Dhuhr";
        case SalahType.Asr:
            return "'Asr";
        case SalahType.Mughrib:
            return "Mughrib";
        case SalahType.Isha:
            return "'Isha";
        default:
            return "";
    }
}

export function SalahToArabic(salah: SalahType) : string
{
    switch(salah)
    {
        case SalahType.Fajr:
            return "فجر";
        case SalahType.Dhuhr:
            return "ظهر";
        case SalahType.Asr:
            return "عصر";
        case SalahType.Mughrib:
            return "مغرب";
        case SalahType.Isha:
            return "عشاء";
        default:
            return "";
    }
}

export function parseSalahTimeToMinutes(timeStr: string, salah: SalahType): number {
    if (!timeStr) return 0;
    
    const lowerStr = timeStr.toLowerCase();
    const isPM = lowerStr.includes('pm') || lowerStr.includes('p.m');
    const isAM = lowerStr.includes('am') || lowerStr.includes('a.m');

    const match = timeStr.match(/(\d+):(\d+)/);
    if (!match) return 0;

    let hour = parseInt(match[1]);
    const minute = parseInt(match[2]);

    if (isPM && hour < 12) {
        hour += 12;
    } else if (isAM && hour === 12) {
        hour = 0;
    } else if (!isPM && !isAM) {
        if (salah === SalahType.Dhuhr) {
            if (hour >= 1 && hour <= 6) {
                hour += 12;
            }
        } else if (salah === SalahType.Asr || salah === SalahType.Mughrib || salah === SalahType.Isha) {
            if (hour >= 1 && hour <= 11) {
                hour += 12;
            }
        }
    }

    return hour * 60 + minute;
}