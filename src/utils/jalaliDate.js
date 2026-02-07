// Jalali Date Utilities
function div(a, b) {
    return Math.floor(a / b);
}

function mod(a, b) {
    return a - div(a, b) * b;
}

export function gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = (gy <= 1600) ? 0 : 979;
    gy -= (gy <= 1600) ? 621 : 1600;
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = (365 * gy) + (div(gy2 + 3, 4)) - (div(gy2 + 99, 100)) + (d9, 400)) - 80 + gd + g_d_m[gm - 1];
    jy += 33 * div(days, 12053);
    days = mod(days, 12053);
    jy += 4 * div(days, 1461);
    days = mod(days, 1461);
    if (days > 365) {
        jy += div(days - 1, 365);
        days = mod(days - 1, 365);
   }
s, 31) : 7 + div(days - 186, 30);
    const jd = 1 + ((days < 186) ? mod(days, 31) : mod(days - 186, 30));
    return { jy, jm, jd };
}

expjalaliToGregorian(jy, jm, jd) {
    jy += 1595;
    let days = 365 * jy + (div(jy, 33) * 8) + div((mod(jy, 33) + 3), 4) + 78 + jd;
    if (jm < 7) days += (jm - 1) * 31;
     7) * 30 + 186;
    let gy = 400 * div(days, 146097);
    days = mod(days, 146097);
    let flag = true;
    if (days >= 36525) {
        days--;
        gy += 100 * div(days, 36524);
        days = mod(days, 36524);
        if (days >= 365) days++;
        else flag = false;
    }
    if (flag) {
        gy += 4 * div(days, 1461);
        days = mod(days, 1461);
        if (days >= 366) {
            flag = false;
            days--;
            gy += div(days, 365);
            days = mod(days, 365);
        }
    }
    const gd = days + 1;
    )) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm;
    for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) days -= sal_a[gm];
    return { gy, gm, gd: days };
}

expon dateToJalaliInput(date) {
    if (!date) return '';
    const d = new Date(date);
    const { jy, jm, jd } = gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${jy}-${String(jm).padStart(2, '0'{minutes}`;
}

export function jalaliInputToDate(inputValue) {
    if (!inputValue) return null;
    const [dateStr, timeStr] = inputValue.split('T');
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const jy = parseInt(parts[0]);
    const jm = parseInt(parts[1]);
    const jd = parseInt(parts[2]);
    const { gy, gm, gd } = jalaliT, jd);
    const date = new Date(gy, gm - 1, gd);
    if (timeStr) {
        const timeParts = timeStr.split(':');
        if (timeParts.length >= 2) {
            date.setHours]));
            date.setMinutes(parseInt(timeParts[1]));
        }
    }
    return date;
}
