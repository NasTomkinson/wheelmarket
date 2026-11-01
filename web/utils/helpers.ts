export function getStrapiMediaUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;

  const baseUrl = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/api\/?$/, "");
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function parseCurrency(amount: number, country?: string, currency?: string) {

  const formatCountry =  country ?? 'en-GB'
  const formatCurrency = currency ?? 'GBP'

  const formatter = Intl.NumberFormat(formatCountry, {
    style: 'currency',
    currency: formatCurrency
  })

  return formatter.format(amount)
}