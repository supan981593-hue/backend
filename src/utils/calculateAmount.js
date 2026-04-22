function calculateAmount(pages, copies) {
  const pricePerPage = Number(process.env.PRICE_PER_PAGE || 2);
  const totalRupees = pricePerPage * Number(pages) * Number(copies);

  // Store the amount in paise so the mobile app can render rupees cleanly.
  return Math.round(totalRupees * 100);
}

module.exports = calculateAmount;
