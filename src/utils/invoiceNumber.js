export const getFinancialYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // FY April se start hota hai
  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
};
