export function formatPrice(price: number) {
    return price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' });
}