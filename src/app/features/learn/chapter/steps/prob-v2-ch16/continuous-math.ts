const coefficients = [
  676.5203681218851, -1259.1392167224028, 771.3234287776531, -176.6150291621406, 12.507343278686905,
  -0.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7,
];

export function logGamma(value: number): number {
  if (value < 0.5)
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  const z = value - 1;
  let series = 0.9999999999998099;
  coefficients.forEach((coefficient, index) => {
    series += coefficient / (z + index + 1);
  });
  const t = z + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(series);
}

export function betaPdf(x: number, alpha: number, beta: number): number {
  if (x <= 0 || x >= 1) return 0;
  const logBeta = logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
  return Math.exp((alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - logBeta);
}

export function betaMean(alpha: number, beta: number): number {
  return alpha / (alpha + beta);
}

export function betaVariance(alpha: number, beta: number): number {
  const total = alpha + beta;
  return (alpha * beta) / (total * total * (total + 1));
}

export function percent(value: number, digits = 1): string {
  return (value * 100).toFixed(digits) + '%';
}
