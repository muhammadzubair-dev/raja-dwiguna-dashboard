function formatSnake(str) {
  // Replace underscores with spaces, capitalize each word, and return the formatted string
  return str
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
}

export default formatSnake;
