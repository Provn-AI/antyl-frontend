// Shared skill catalog + helpers used for tech-stack autocomplete.
// Save as: src/lib/skills.ts  (imported as "@/lib/skills")

export const SKILL_CATALOG: string[] = [
  // Languages
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Dart",
  "Scala",
  "R",
  "MATLAB",
  "Perl",
  "Elixir",
  "Haskell",
  "Lua",
  "Solidity",
  "Bash",
  "SQL",
  "HTML",
  "CSS",
  // Frontend
  "React",
  "Next.js",
  "Vue.js",
  "Nuxt.js",
  "Angular",
  "Svelte",
  "SvelteKit",
  "Remix",
  "Astro",
  "Redux",
  "Zustand",
  "React Query",
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Chakra UI",
  "shadcn/ui",
  "Sass",
  "Webpack",
  "Vite",
  "jQuery",
  "Three.js",
  "D3.js",
  "Framer Motion",
  "Storybook",
  // Backend
  "Node.js",
  "Express.js",
  "NestJS",
  "Fastify",
  "Django",
  "Django REST Framework",
  "Flask",
  "FastAPI",
  "Pydantic",
  "Celery",
  "Spring Boot",
  "Hibernate",
  "Ruby on Rails",
  "Laravel",
  "Symfony",
  "ASP.NET",
  ".NET",
  "Gin",
  "Fiber",
  "GraphQL",
  "REST APIs",
  "gRPC",
  "WebSockets",
  "Microservices",
  "tRPC",
  // Mobile
  "React Native",
  "Flutter",
  "Android",
  "iOS",
  "SwiftUI",
  "Jetpack Compose",
  "Expo",
  // Databases
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Oracle",
  "SQL Server",
  "DynamoDB",
  "Cassandra",
  "Elasticsearch",
  "Firebase",
  "Supabase",
  "Neo4j",
  "ClickHouse",
  "Snowflake",
  "BigQuery",
  "SQLAlchemy",
  "Prisma",
  "TypeORM",
  "Alembic",
  // Cloud & DevOps
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitHub Actions",
  "GitLab CI",
  "CI/CD",
  "Linux",
  "Nginx",
  "Git",
  "Helm",
  "Prometheus",
  "Grafana",
  "Datadog",
  "Vercel",
  "Heroku",
  "Cloudflare",
  "Serverless",
  // Data / AI
  "Machine Learning",
  "Deep Learning",
  "Data Science",
  "Data Engineering",
  "NLP",
  "Computer Vision",
  "LLMs",
  "LangChain",
  "LlamaIndex",
  "RAG",
  "OpenAI API",
  "Hugging Face",
  "TensorFlow",
  "PyTorch",
  "Keras",
  "scikit-learn",
  "Pandas",
  "NumPy",
  "SciPy",
  "Matplotlib",
  "Jupyter",
  "Apache Spark",
  "Apache Kafka",
  "Apache Airflow",
  "dbt",
  "Power BI",
  "Tableau",
  // Messaging / Infra
  "RabbitMQ",
  // Testing
  "Jest",
  "Vitest",
  "Cypress",
  "Playwright",
  "Selenium",
  "Pytest",
  "JUnit",
  "React Testing Library",
  // Security / Other
  "OAuth",
  "JWT",
  "Cybersecurity",
  "Blockchain",
  "Web3",
  "Figma",
  "Agile",
  "Scrum",
  "System Design",
  "Data Structures & Algorithms",
];

// Common shorthand → canonical skill. Lets "js" suggest JavaScript, "k8s" suggest Kubernetes, etc.
export const SKILL_ALIASES: Record<string, string[]> = {
  JavaScript: ["js", "ecmascript", "es6"],
  TypeScript: ["ts"],
  Python: ["py", "python3"],
  "Node.js": ["node", "nodejs"],
  "Express.js": ["express", "expressjs"],
  "Next.js": ["next", "nextjs"],
  "Vue.js": ["vue", "vuejs"],
  "Nuxt.js": ["nuxt", "nuxtjs"],
  React: ["reactjs", "react.js"],
  "React Native": ["rn"],
  PostgreSQL: ["postgres", "psql", "pg"],
  MongoDB: ["mongo"],
  Kubernetes: ["k8s"],
  "Google Cloud": ["gcp", "google cloud platform"],
  "Tailwind CSS": ["tailwind"],
  "Spring Boot": ["spring"],
  "Ruby on Rails": ["rails", "ror"],
  "C#": ["csharp", "c sharp"],
  "C++": ["cpp"],
  Go: ["golang"],
  "Machine Learning": ["ml"],
  "Deep Learning": ["dl"],
  NLP: ["natural language processing"],
  LLMs: ["llm", "large language models"],
  "scikit-learn": ["sklearn"],
  "CI/CD": ["cicd", "ci cd"],
  "REST APIs": ["rest", "restful", "rest api"],
  "Data Structures & Algorithms": ["dsa", "data structures", "algorithms"],
  "Apache Spark": ["spark", "pyspark"],
  "Apache Kafka": ["kafka"],
  "Apache Airflow": ["airflow"],
  "Material UI": ["mui"],
  "shadcn/ui": ["shadcn"],
  "D3.js": ["d3"],
  "Three.js": ["three"],
  "Hugging Face": ["huggingface", "hf"],
  "Django REST Framework": ["drf"],
  "SQL Server": ["mssql", "sqlserver"],
  Elasticsearch: ["elastic", "es"],
  ".NET": ["dotnet", "dot net"],
};

export const MAX_SKILL_SUGGESTIONS = 8;

/** Exact (case-insensitive) or alias match → canonical catalog spelling. */
export function findCatalogSkill(raw: string): string | undefined {
  const q = raw.trim().toLowerCase();
  if (!q) return undefined;
  const direct = SKILL_CATALOG.find((s) => s.toLowerCase() === q);
  if (direct) return direct;
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.some((a) => a === q)) return canonical;
  }
  return undefined;
}

/** Canonical spelling if known, otherwise the text exactly as typed. */
export function resolveSkill(raw: string): string {
  const trimmed = raw.trim();
  return findCatalogSkill(trimmed) ?? trimmed;
}

/** Resolve every skill to its canonical spelling and drop duplicates (case-insensitive). */
export function normalizeSkillList(skills: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of skills) {
    const skill = resolveSkill(raw);
    if (!skill) continue;
    const key = skill.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(skill);
  }
  return out;
}

function rankSkillMatch(skill: string, q: string): number | null {
  const name = skill.toLowerCase();
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;

  const aliases = SKILL_ALIASES[skill] || [];
  if (aliases.some((a) => a === q)) return 2;
  if (aliases.some((a) => a.startsWith(q))) return 3;

  const words = name.split(/[^a-z0-9+#.]+/).filter(Boolean);
  if (words.some((w) => w.startsWith(q))) return 4;

  if (q.length >= 2 && name.includes(q)) return 5;
  return null;
}

export function getSkillSuggestions(query: string, alreadyAdded: string[]): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const taken = new Set(alreadyAdded.map((s) => s.toLowerCase()));

  return SKILL_CATALOG.filter((s) => !taken.has(s.toLowerCase()))
    .map((s) => ({ s, rank: rankSkillMatch(s, q) }))
    .filter((x): x is { s: string; rank: number } => x.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.s.length - b.s.length || a.s.localeCompare(b.s))
    .slice(0, MAX_SKILL_SUGGESTIONS)
    .map((x) => x.s);
}