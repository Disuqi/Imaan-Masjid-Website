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