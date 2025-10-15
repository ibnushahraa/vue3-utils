// composables/useCurrency.js
export function useCurrency(value) {
    const format = (val = value) => {
        if (isNaN(val)) return 'Invalid Number'
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val)
    }

    return { format }
}
