export function validatePhone(inputValue) {
    let value = inputValue;

    if (value[0] !== '+') {
        value = '+' + value.replace(/\D/g, '');
    } else {
        value = value[0] + value.slice(1).replace(/\D/g, '');
    }

    return value;
}