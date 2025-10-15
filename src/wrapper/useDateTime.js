// composables/useDateTime.js
export function useDateTime(input = new Date()) {
    // parsing aman: support format DB "YYYY-MM-DD HH:mm:ss"
    const raw = String(input instanceof Date ? input : input || '').trim()
    const date = new Date(raw.replace(' ', 'T'))

    const pad = (n) => String(n).padStart(2, '0')
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]

    const map = (d) => ({
        DD: pad(d.getDate()),
        D: d.getDate(),
        MM: pad(d.getMonth() + 1),
        MMMM: monthNames[d.getMonth()],
        YY: String(d.getFullYear()).slice(2),
        YYYY: d.getFullYear(),
        HH: pad(d.getHours()),
        mm: pad(d.getMinutes()),
        ss: pad(d.getSeconds()),
    })

    const isValid = () => !isNaN(date.getTime())

    const format = (fmt = 'DD MMMM YYYY HH:mm:ss') => {
        if (!isValid()) return 'Invalid Date'
        let out = fmt
        const parts = map(date)
        for (const key in parts) out = out.replace(new RegExp(key, 'g'), parts[key])
        return out
    }

    const add = (value, unit) => {
        if (!isValid()) return api
        const d = new Date(date)
        switch (unit) {
            case 'seconds': d.setSeconds(d.getSeconds() + value); break
            case 'minutes': d.setMinutes(d.getMinutes() + value); break
            case 'hours': d.setHours(d.getHours() + value); break
            case 'days': d.setDate(d.getDate() + value); break
            case 'months': d.setMonth(d.getMonth() + value); break
            case 'years': d.setFullYear(d.getFullYear() + value); break
            default: throw new Error('Invalid unit for add()')
        }
        return useDateTime(d)
    }

    const subtract = (value, unit) => add(-value, unit)
    const toDate = () => date
    const valueOf = () => date.getTime()

    const api = { format, add, subtract, toDate, valueOf, isValid }
    return api
}
