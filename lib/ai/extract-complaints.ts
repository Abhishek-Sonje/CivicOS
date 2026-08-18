function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Splits Mid-Day-style "Problems" articles into individual citizen complaint records.
 * Returns an empty array for standard news pieces without a Problems section.
 */
export function extractComplaintsFromArticle(raw: Record<string, unknown>): Record<string, unknown>[] {
  const content = String(raw.article_content || "");
  const articleUrl = String(raw.article_url || raw.product_page_url || "");
  const publishDate = raw.publish_date || raw.timestamp || new Date().toLocaleString();
  const featuredImage = raw.featured_image || raw.image_url || null;

  const problemsMatch = content.match(/<h2>\s*Problems\s*<\/h2>/i);
  if (!problemsMatch || problemsMatch.index === undefined) {
    return [];
  }

  const afterProblems = content.slice(problemsMatch.index + problemsMatch[0].length);
  const sectionRegex = /<h2>([^<]+)<\/h2>\s*([\s\S]*?)(?=<h2>|$)/gi;
  const complaints: Record<string, unknown>[] = [];

  let match: RegExpExecArray | null;
  while ((match = sectionRegex.exec(afterProblems)) !== null) {
    const sectionTitle = stripHtml(match[1]);
    if (!sectionTitle || sectionTitle.toLowerCase() === "problems") {
      continue;
    }

    const sectionHtml = match[2];
    const paragraphMatch = sectionHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (!paragraphMatch) {
      continue;
    }

    const description = stripHtml(paragraphMatch[1]);
    if (description.length < 20) {
      continue;
    }

    const slug = slugify(sectionTitle) || "complaint";
    const sourceUrl = articleUrl ? `${articleUrl}#${slug}` : `http://unknown-source.local#${slug}`;

    complaints.push({
      post_title: sectionTitle,
      description_text: description,
      article_title: raw.article_title,
      article_content: description,
      featured_image: featuredImage,
      publish_date: publishDate,
      article_url: sourceUrl,
      report_url: sourceUrl,
      location: raw.location,
    });
  }

  return complaints;
}
