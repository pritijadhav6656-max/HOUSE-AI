export const formatINR = (amount) => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export const formatCompactINR = (amount) => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return 'N/A';
  }
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakhs`;
  }
  return formatINR(num);
};

export const formatNumberIN = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN').format(Number(value));
};

export const formatDateTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (dateInput) => {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};
