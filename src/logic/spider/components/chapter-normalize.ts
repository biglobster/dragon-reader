const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const units = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '兆', '十', '百', '千', '京', '十', '百', '千', '垓'];
const minus = '负';

function intToChinese(num) {
    let str = '';
    let n = Math.floor(Math.abs(num));
    if (n < 1) {
        return ((num < 0) ? minus : '') + digits[0];
    }
    const uc = units.slice();
    while (n > 0) {
        const u = uc.shift();
        const d = n % 10;
        str = digits[d] + u + str; // ((d > 0) ? u : '') + str;

        n = Math.floor(n / 10);
    }

    const smallUnit = units[1] + units[2] + units[3];
    const bigUnit = units[4] + units[8] + units[12] + units[16] + units[20];
    const zero = digits[0];

    str = str
        .replace(new RegExp('(' + zero + ')[' + smallUnit + ']', 'g'), '$1') // 零千,零百,零十 keeps 零
        .replace(new RegExp('([' + bigUnit + '])[^' + smallUnit + ']+([' + bigUnit + '])', 'g'), '$1' + zero) // 大數中間沒細數，補零
        .replace(new RegExp('([' + smallUnit + '])' + zero + '+([' + bigUnit + '])', 'g'), '$1$2' + zero)
        .replace(new RegExp('(' + digits[0] + ')+', 'g'), '$1') // group 零
        .replace(new RegExp(zero + '+$'), ''); // tail zero remove

    return ((num < 0) ? minus : '') + str;
}

export function normalizeChapter(title) {
    if (title) {
        return title
            .replace(/[ \t]/g, '')
            .replace(/[^0-9\u4e00-\u9fa5〇]/g, '')
            .replace(/[0-9]+/g, (word => intToChinese(Number(word))));
    }
    return 'Unknown';
}
