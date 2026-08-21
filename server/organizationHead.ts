import { buildOrganizationJsonLd, serializeOrganizationJsonLd } from "../shared/organizationSchema";
import { buildWebsiteJsonLd, serializeWebsiteJsonLd } from "../shared/websiteSchema";
import { renderHtmlWithProductHead, type ProductHeadLookup } from "./productHead";

export function injectOrganizationSchema(template: string) {
  const schema = `<script type="application/ld+json" data-organization-schema="true">${serializeOrganizationJsonLd(buildOrganizationJsonLd())}</script>`;
  return /<script\s+type=["']application\/ld\+json["'][^>]*data-organization-schema=["']true["'][^>]*>[\s\S]*?<\/script>/i.test(template)
    ? template.replace(/<script\s+type=["']application\/ld\+json["'][^>]*data-organization-schema=["']true["'][^>]*>[\s\S]*?<\/script>/i, schema)
    : template.replace(/<\/head>/i, `  ${schema}\n  </head>`);
}

export function injectWebsiteSchema(template: string) {
  const schema = `<script type="application/ld+json" data-website-schema="true">${serializeWebsiteJsonLd(buildWebsiteJsonLd())}</script>`;
  return /<script\s+type=["']application\/ld\+json["'][^>]*data-website-schema=["']true["'][^>]*>[\s\S]*?<\/script>/i.test(template)
    ? template.replace(/<script\s+type=["']application\/ld\+json["'][^>]*data-website-schema=["']true["'][^>]*>[\s\S]*?<\/script>/i, schema)
    : template.replace(/<\/head>/i, `  ${schema}\n  </head>`);
}

export async function renderHtmlWithRouteStructuredData(template: string, requestUrl: string, getProduct?: ProductHeadLookup) {
  const productPage = await renderHtmlWithProductHead(template, requestUrl, getProduct);
  const pathname = requestUrl.split("?", 1)[0] ?? requestUrl;
  return pathname === "/" ? injectWebsiteSchema(injectOrganizationSchema(productPage)) : productPage;
}
