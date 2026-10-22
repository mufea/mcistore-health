import { describe, expect, it } from "vitest";
import { buildAboutPageJsonLd, buildFaqPageJsonLd, buildTechArticleJsonLd, serializePageJsonLd } from "./pageSchema";

describe("page SEO schemas", () => {
  const base = {
    name: "Transdermal technology",
    description: "A visual guide.",
    urlPath: "/technology",
    imagePath: "/manus-storage/transdermal.jpg",
    inLanguage: "en",
  };

  it("builds an AboutPage with the MCI One More organization", () => {
    const schema = buildAboutPageJsonLd({ ...base, urlPath: "/about" });
    expect(schema["@type"]).toBe("AboutPage");
    expect(schema.url).toBe("https://mcionemore.com/about");
    expect(schema.about.name).toBe("MCI One More");
  });

  it("builds a TechArticle with keywords and main entity URL", () => {
    const schema = buildTechArticleJsonLd({ ...base, keywords: ["transdermal patch"] });
    expect(schema["@type"]).toBe("TechArticle");
    expect(schema.keywords).toEqual(["transdermal patch"]);
    expect(schema.mainEntityOfPage["@id"]).toBe("https://mcionemore.com/technology");
  });

  it("builds FAQPage questions and safely serializes markup characters", () => {
    const schema = buildFaqPageJsonLd({
      ...base,
      urlPath: "/faq-transdermal",
      questions: [{ question: "Can I use <it>?", answer: "Use & follow the label." }],
    });
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity[0].acceptedAnswer.text).toContain("&");
    const serialized = serializePageJsonLd(schema);
    expect(serialized).not.toContain("<it>");
    expect(serialized).toContain("\\u003c");
  });
});
