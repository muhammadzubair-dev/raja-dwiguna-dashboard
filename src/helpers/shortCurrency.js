function shortCurrency(number) {
  const absNumber = Math.abs(number);

  if (absNumber >= 1e9) {
    return (number / 1e9).toFixed(0) + ' m';
  } else if (absNumber >= 1e6) {
    return (number / 1e6).toFixed(0) + ' jt';
  } else if (absNumber >= 1e3) {
    return (number / 1e3).toFixed(0) + ' rb';
  } else {
    return number.toString();
  }
}

export default shortCurrency;
