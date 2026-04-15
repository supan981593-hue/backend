function calculateAmount(pages, copies) {
  const pricePerPage = Number(process.env.PRICE_PER_PAGE || 2);
  const totalRupees = pricePerPage * Number(pages) * Number(copies);

  // Razorpay accepts amount in paise.
  return Math.round(totalRupees * 100);
}

module.exports = calculateAmount;
