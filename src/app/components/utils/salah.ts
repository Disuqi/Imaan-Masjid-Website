export enum SalahType
{
    Fajr,
    Dhuhur,
    Asr,
    Mughrib,
    Isha
}

export class SalahTime {
    constructor(
        public readonly salah : SalahType,
        public readonly adhan: string,
        public readonly iqamah: string,
        public readonly comingUp: boolean = false
    ) {}

    getSalahEnglish() : string
    {
        return SalahToEnglish(this.salah);
    }

    getSalahArabic() : string
    {
        return SalahToArabic(this.salah);
    }
}

export function SalahToEnglish(salah: SalahType) : string
{
    switch(salah)
    {
        case SalahType.Fajr:
            return "Fajr";
        case SalahType.Dhuhur:
            return "Dhuhur";
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
        case SalahType.Dhuhur:
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