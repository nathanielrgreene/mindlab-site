document.addEventListener("DOMContentLoaded", () => {
  // Run-once guard (prevents duplicate nav)
  if (document.querySelector(".pub-year-nav")) return;

  const refs = document.querySelector(".references");
  if (!refs) return;

  const entries = Array.from(refs.querySelectorAll(".csl-entry"));
  if (!entries.length) return;

  // ---- helpers (put them here) ----
  function extractYear(text) {
    // matches (2024) or (2024a) or (2024b) etc.
    const m = text.match(/\((\d{4})([a-z])?\)/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function stripYearSuffixes(node) {
    // visually convert (2023a) -> (2023)
    node.innerHTML = node.innerHTML.replace(/\((\d{4})[a-z]\)/gi, "($1)");
  }
  // ---------------------------------

  const bucketLabel = (year) => (year >= 2021 ? String(year) : "2020 and earlier");

  // Group entries by year label
  const groups = new Map();
  for (const entry of entries) {
    // Optional: remove the a/b/c in the displayed citation
    stripYearSuffixes(entry);

    const year = extractYear(entry.textContent) ?? 0;
    const label = bucketLabel(year);

    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(entry);
  }

  // Sort labels: newest year first, then "2020 and earlier" last
  const yearLabels = Array.from(groups.keys())
    .filter((l) => l !== "2020 and earlier")
    .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

  if (groups.has("2020 and earlier")) yearLabels.push("2020 and earlier");

  // Build the year nav
  const nav = document.createElement("nav");
  nav.className = "pub-year-nav";

  const ul = document.createElement("ul");
  for (const label of yearLabels) {
    const id = label === "2020 and earlier" ? "year-2020" : `year-${label}`;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = label;

    li.appendChild(a);
    ul.appendChild(li);
  }
  nav.appendChild(ul);

  // Build the grouped sections
  const grouped = document.createElement("div");
  grouped.className = "references-by-year";

  for (const label of yearLabels) {
    const id = label === "2020 and earlier" ? "year-2020" : `year-${label}`;

    const section = document.createElement("section");
    section.className = "pub-year-section";
    section.id = id;

    const h = document.createElement("h3");
    h.className = "pub-year-heading";
    h.textContent = label;

    const block = document.createElement("div");
    block.className = "pub-year-entries";

    for (const entry of groups.get(label)) {
      block.appendChild(entry); // move the existing DOM node
    }

    section.appendChild(h);
    section.appendChild(block);
    grouped.appendChild(section);
  }

  // Insert nav above references and replace contents with grouped sections
  refs.parentNode.insertBefore(nav, refs);
  refs.innerHTML = "";
  refs.appendChild(grouped);
});
