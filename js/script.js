/* Edit these */
const GITHUB_USER = "OdaloV";
const DEVTO_USER = "odalov";
const SHOW_FIRST = 6;
const HIDE_REPOS = [GITHUB_USER.toLowerCase()];   // repo names to hide, lowercase
const DESCRIPTIONS = {
  // "repo-name": "Description shown here for repos with none on GitHub"
};
const LINKEDIN_POSTS = [
  // { title: "Post title", url: "https://www.linkedin.com/posts/..." }
];

const FALLBACK_ARTICLES = [   // shown only if dev.to cannot be reached
  { title: "GORM: Dev's Guide to Go's Most Popular ORM", url: "https://dev.to/odalov/gorm-devs-guide-to-gos-most-popular-orm-3263", description: "Setup, models, migrations, CRUD, associations and transactions in Go's most used ORM.", published_at: "2026-07-22" },
  { title: "Postgres vs SQLite", url: "https://dev.to/odalov/postgres-vs-sqlite-4j25", description: "Why the two databases solve different problems and when each one wins.", published_at: "2026-07-16" },
  { title: "A Go Dev's First Month with JavaScript", url: "https://dev.to/odalov/a-go-devs-first-month-with-javascript-p31", description: "What stood out when moving from Go's strictness to JavaScript's flexibility.", published_at: "2026-07-24" },
  { title: "Challenges of working on two languages at the same time, ft Go and JS", url: "https://dev.to/odalov/challenges-of-working-on-two-languages-at-the-same-timeft-go-and-js-1fhn", description: "The syntax clashes that happen when you write Go and JavaScript side by side.", published_at: "2026-07-22" },
  { title: "Building on the Blockchain: A Developer's Guide to Solidity and Smart Contracts", url: "https://dev.to/odalov/building-on-the-blockchain-a-developers-guide-to-solidity-smart-contracts-414c", description: "Smart contracts, Solidity basics, a simple token, security and the developer toolchain.", published_at: "2026-06-01" },
  { title: "Middleware in Go", url: "https://dev.to/odalov/middleware-in-go-2b9n", description: "How middleware chains work, what c.Next() does, and how to register it globally or per group.", published_at: "2026-05-14" },
  { title: "Kenya's proposed AI Bill 2026", url: "https://dev.to/odalov/kenyas-proposed-ai-bill-2026-2n4h", description: "A developer's critique of the bill's criminal penalties and its gaps for foreign companies.", published_at: "2026-05-11" },
  { title: "Digital Hoarding", url: "https://dev.to/odalov/digital-hoarding-3p5h", description: "A personal look at digital clutter across a laptop and a phone.", published_at: "2026-04-11" }
];

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = d => new Date(d).toLocaleDateString("en-GB", {month:"long", year:"numeric"});

function paged(gridId, btnId, items, render){
  const grid = document.getElementById(gridId), btn = document.getElementById(btnId);
  grid.innerHTML = items.map((it,i) => render(it).replace("<article", `<article${i>=SHOW_FIRST?' hidden':''}`)).join("");
  if(items.length > SHOW_FIRST){
    btn.hidden = false;
    btn.onclick = () => { grid.querySelectorAll("[hidden]").forEach(e => e.hidden = false); btn.hidden = true; };
  }
}

async function loadRepos(){
  const el = document.getElementById("repos");
  try{
    const r = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`);
    if(!r.ok) throw new Error(r.status);
    const repos = (await r.json())
      .filter(x => !x.fork && !HIDE_REPOS.includes(x.name.toLowerCase()))
      .map(x => ({...x, desc: x.description || DESCRIPTIONS[x.name] || ""}))
      .filter(x => x.desc);
    if(!repos.length){ el.innerHTML = `<p class="note">No projects to show yet.</p>`; return; }
    paged("repos","reposMore",repos,x => `
      <article class="card">
        <h3><a href="${esc(x.html_url)}">${esc(x.name)}</a></h3>
        <p>${esc(x.desc)}</p>
        <span class="meta">${esc(x.language || "Code")}${x.homepage ? ` | <a href="${esc(x.homepage)}">Live site</a>` : ""}</span>
      </article>`);
  }catch(e){
    el.innerHTML = `<p class="note">Projects could not load right now. See them on <a href="https://github.com/${GITHUB_USER}?tab=repositories">GitHub</a>.</p>`;
  }
}

function renderArticles(posts){
  paged("articleList","articlesMore",posts,p => `
    <article class="card">
      <h3><a href="${esc(p.url)}">${esc(p.title)}</a></h3>
      <p>${esc(p.description)}</p>
      <span class="meta">Dev.to | ${fmt(p.published_at)}</span>
    </article>`);
}

async function loadArticles(){
  try{
    const r = await fetch(`https://dev.to/api/articles?username=${DEVTO_USER}&per_page=100`);
    if(!r.ok) throw new Error(r.status);
    const posts = (await r.json()).filter(p => p.description)
      .sort((a,b) => (b.public_reactions_count - a.public_reactions_count) || (new Date(b.published_at) - new Date(a.published_at)));
    if(!posts.length) throw new Error("empty");
    renderArticles(posts);
  }catch(e){
    renderArticles(FALLBACK_ARTICLES);
  }
}

function loadLinkedIn(){
  const el = document.getElementById("linkedinList");
  if(!LINKEDIN_POSTS.length){
    el.previousElementSibling.remove();
    el.outerHTML = `<p class="note">More posts on <a href="https://www.linkedin.com/in/victoria-odalo-62b159275">my LinkedIn profile</a>.</p>`;
    return;
  }
  el.innerHTML = LINKEDIN_POSTS.map(p => `
    <article class="card">
      <h3><a href="${esc(p.url)}">${esc(p.title)}</a></h3>
      <span class="meta">LinkedIn</span>
    </article>`).join("");
}

loadRepos(); loadArticles(); loadLinkedIn();