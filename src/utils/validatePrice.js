export function validatePrice(inputValue) {
    let value = inputValue;

    value = value.replace(/[^\d.]/g, '');

    if (value.startsWith('0') && !value.startsWith('0.')) {
        value = value.replace(/^0+/, '');
    }

    return value;
}
