import { formatINR, formatCompactINR, formatDateTime } from './formatters';

export const generateValuationReportHTML = (prediction) => {
  const isCovered = prediction.predictionStatus === 'completed' && prediction.predictedPrice !== null;
  const reportId = prediction._id || `HAI-${Date.now()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>HOUSE AI Property Valuation Report - ${reportId}</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif; color: #1E293B; margin: 0; padding: 36px; background: #FFFFFF; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0F172A; padding-bottom: 20px; margin-bottom: 28px; }
    .brand { font-size: 24px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
    .brand span { color: #2563EB; }
    .subtitle { font-size: 12px; color: #64748B; margin-top: 4px; }
    .meta { text-align: right; font-size: 12px; color: #64748B; line-height: 1.6; }
    .hero-box { background: #F4F7FB; border: 1px solid #CBD5E1; border-left: 6px solid #2563EB; border-radius: 12px; padding: 24px; margin-bottom: 28px; }
    .price-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748B; font-weight: 700; }
    .price-main { font-size: 34px; font-weight: 800; color: #0F172A; margin: 8px 0 4px 0; }
    .price-sub { font-size: 15px; color: #2563EB; font-weight: 600; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .card { border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; }
    .card h3 { margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #0F172A; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #F1F5F9; }
    .row span:first-child { color: #64748B; }
    .row span:last-child { font-weight: 600; color: #1E293B; }
    .disclaimer { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 14px; font-size: 11.5px; color: #92400E; line-height: 1.5; margin-top: 24px; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">HOUSE <span>AI</span></div>
      <div class="subtitle">India-Wide AI Real Estate Price Prediction & Valuation Platform</div>
    </div>
    <div class="meta">
      <div><strong>Report ID:</strong> ${reportId}</div>
      <div><strong>Generated:</strong> ${formatDateTime(prediction.createdAt || new Date())}</div>
      <div><strong>Coverage Status:</strong> ${prediction.predictionCoverage || 'Verified'}</div>
    </div>
  </div>

  <div class="hero-box">
    <div class="price-label">AI Estimated Residential Property Value</div>
    <div class="price-main">${isCovered ? formatINR(prediction.predictedPrice) : 'Insufficient Training Coverage'}</div>
    <div class="price-sub">
      ${isCovered ? `${formatCompactINR(prediction.predictedPrice)} • ${formatINR(prediction.pricePerSqFt)} / sq.ft.` : 'Location is registered in the India Location Database but outside current ML training coverage.'}
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Location Intelligence</h3>
      <div class="row"><span>Country</span><span>${prediction.country || 'India'}</span></div>
      <div class="row"><span>State / UT</span><span>${prediction.state}</span></div>
      <div class="row"><span>District</span><span>${prediction.district || 'Standard Administrative District'}</span></div>
      <div class="row"><span>City / Town</span><span>${prediction.city}</span></div>
      <div class="row"><span>Locality / Micro-Market</span><span>${prediction.locality}</span></div>
    </div>
    <div class="card">
      <h3>Property Specifications</h3>
      <div class="row"><span>Property Type</span><span>${prediction.propertyType}</span></div>
      <div class="row"><span>Built-up Area</span><span>${prediction.area} sq.ft.</span></div>
      <div class="row"><span>Configuration</span><span>${prediction.bhk} BHK • ${prediction.bathrooms} Bathrooms</span></div>
      <div class="row"><span>Balconies & Parking</span><span>${prediction.balconies ?? 1} Balcony • Parking: ${prediction.parking || 'Yes'}</span></div>
      <div class="row"><span>Property Age & Furnishing</span><span>${prediction.houseAge} Years • ${prediction.furnishingStatus || 'Semi-Furnished'}</span></div>
      <div class="row"><span>Floor Level</span><span>Floor ${prediction.floorNumber ?? 2} of ${prediction.totalFloors ?? 5}</span></div>
    </div>
  </div>

  <div class="card">
    <h3>Machine Learning Model Metadata</h3>
    <div class="row"><span>Active Model Artifact</span><span>${prediction.modelName}</span></div>
    <div class="row"><span>Model Version</span><span>v${prediction.modelVersion}</span></div>
    <div class="row"><span>Coverage Tier</span><span>${prediction.predictionCoverage}</span></div>
    <div class="row"><span>Dataset Provenance</span><span>HOUSE AI Synthetic India Urban Residential Benchmark Dataset</span></div>
  </div>

  <div class="disclaimer">
    <strong>Important Valuation Disclaimer:</strong> ${
      prediction.disclaimer ||
      'Predictions are generated by a machine learning model trained on a structured synthetic benchmark dataset for analytical and educational decision-support purposes. This report does not constitute an official certified appraisal or legal market guarantee.'
    }
  </div>

  <div class="footer">
    Generated by HOUSE AI Enterprise Property Analytics Engine • India-Wide Location Intelligence System
  </div>
</body>
</html>`;
};

export const downloadPredictionReport = (prediction) => {
  const htmlContent = generateValuationReportHTML(prediction);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const citySlug = (prediction.city || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  a.href = url;
  a.download = `HOUSE-AI-Valuation-${citySlug}-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const printPredictionReport = (prediction) => {
  const htmlContent = generateValuationReportHTML(prediction);
  const printWindow = window.open('', '_blank', 'width=900,height=750');
  if (!printWindow) {
    window.print();
    return;
  }
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
};
