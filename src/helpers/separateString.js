function separateString(str) {
  return str?.replace(/(\d{3})(?=\d)/g, '$1-');
}

export default separateString;
