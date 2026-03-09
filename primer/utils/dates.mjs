
const DAYNAMES = {
    1: "Sunday",
    2: "Monday",
    3: "Tuesday",
    4: "Wednesday",
    5: "Thursday",
    6: "Friday",
    7: "Saturday",
}

/**
 * Explanatory supplement to the Astronomical almanac
 * ISBN: 978-1-891389-45-0 
 * p.603 - p.604
 */

export function jdnToDayOfWeek(JD) {
    let dayIndex = JD - 7 * Math.floor((JD + 1) / 7) + 2;

    return dayIndex;
}

export function jdnToDayOfWeekName(JD) {
    const index = jdnToDayOfWeek(JD);

    return DAYNAMES[index];
}

export function jdnToGregorianDate(JD) {
    let L = JD + 68569;
    let N = Math.trunc((4 * L) / 146097);
    L = L - Math.trunc((146097 * N + 3) / 4);
    let I = Math.trunc((4000 * (L + 1)) / 1461001);
    L = L - Math.trunc((1461 * I) / 4) + 31;
    let J = Math.trunc((80 * L) / 2447);
    let D = L - Math.trunc((2447 * J) / 80);
    L = Math.trunc(J / 11);
    let M = J + 2 - 12 * L;
    let Y = 100 * (N - 49) + I + L;

    return `${Y} / ${M} / ${D}`;
}

export function gregorianDateToJDN(year, month, day) {
    let L = Math.trunc((month - 14) / 12);
    let J = year + 4800 + L;
    let K = month - 2 - 12 * L;
    let M = Math.trunc((year + 4900 + L) / 100);

    let JD = Math.trunc((1461 * J) / 4) +
        Math.trunc((367 * K) / 12) -
        Math.trunc((3 * M) / 4) +
        day - 32075;

    return JD;
}
