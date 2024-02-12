
export function formatToHijriDate(date) {
    const options = {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-SA-u-ca-islamic-umalqura', options);
}

export function getHijriMonth(date)
{
    const options = {
        timeZone: 'UTC',
        month: 'long',
    };
    return date.toLocaleDateString('en-SA-u-ca-islamic-umalqura', options);
}

export function formatDateWithSuffix(date) {
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };

    // @ts-ignore
    const formatter = new Intl.DateTimeFormat('en-UK', options);
    let formattedDate = formatter.format(date);

    const day = date.getDate();
    const ordinalSuffix = getOrdinalSuffix(day);

    return formattedDate.replace(/\d+/, (match) => match + ordinalSuffix);
}

export function getMonth(date)
{
    const options = {
        month: 'long',
    };
    return date.toLocaleDateString('en-UK', options);
}

export function getOrdinalSuffix(day) {
    if (day >= 11 && day <= 13) {
        return 'th';
    }
    switch (day % 10) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}