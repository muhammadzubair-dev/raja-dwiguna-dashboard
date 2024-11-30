function calculatePercentage(part, whole) {
  // Validate that the whole is not zero to avoid division by zero
  if (whole === 0) {
    throw new Error("The 'whole' value cannot be zero.");
  }
  // Calculate the percentage and round to two decimal places
  const percentage = (part / whole) * 100;
  return Math.round(percentage * 100) / 100; // Round to 2 decimal places
}

export default calculatePercentage;
