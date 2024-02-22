import {formatSupabaseTime} from "@/app/components/utils/date";

export class DailyPrayers
{
    constructor(
        public readonly date: string,
        public readonly hijri: number,
        public readonly fajr_adhan: string,
        public readonly fajr_iqama: string,
        public readonly sunrise: string,
        public readonly dhuhr_adhan: string,
        public readonly dhuhr_iqama: string,
        public readonly asr_adhan: string,
        public readonly asr_iqama: string,
        public readonly mughrib_adhan: string,
        public readonly isha_adhan: string,
        public readonly isha_iqama: string
    ) {}
}

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