// Leonida Trophy Guide: a checklist, roadmap and tracker for the 55 GTA VI
// PlayStation 5 trophies. Progress is kept in localStorage and can be exported
// to a JSON file and imported back. No network request is ever made: the trophy
// data and the roadmap are local files under app/data/.
const KEY = 'leonida-trophy-guide-v1';
const SPOILER_KEY = 'leonida-trophy-guide-spoilers-v1';
const DEMO_EARNED = [2, 3, 4, 5, 8, 15, 16, 21, 35, 42];

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const roadmap = await (await fetch('data/roadmap.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const knownIds = new Set(trophies.map((t) => t.id));

let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]').filter((id) => knownIds.has(id)));
} catch {
  earned = new Set();
}
if (params.get('demo') === '1' && earned.size === 0) {
  earned = new Set(DEMO_EARNED);
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

let spoiler = localStorage.getItem(SPOILER_KEY) === '1';
if (params.get('spoiler') === 'on') spoiler = true;
if (params.get('spoiler') === 'off') spoiler = false;

let kindFilter = params.get('kind') ?? 'all';
let gradeFilter = 'all';
let query = '';
let hideEarned = false;

const listEl = document.getElementById('trophyList');
const progressText = document.getElementById('progressText');
const gradeCounts = document.getElementById('gradeCounts');
const progressFill = document.getElementById('progressFill');
const countLine = document.getElementById('countLine');
const emptyNote = document.getElementById('emptyNote');
const spoilerToggle = document.getElementById('spoilerToggle');
const searchInput = document.getElementById('searchInput');
const gradeSelect = document.getElementById('gradeFilter');
const hideEarnedBox = document.getElementById('hideEarned');

const KIND_LABELS = {
  all: 'All', story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', crime: 'Crime & Heists', side: 'Side quests',
  misc: 'Misc', online: 'Online', completion: '100% Completion', platinum: 'Platinum',
};

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function isHidden(t) {
  return spoiler && t.kind === 'story' && !earned.has(t.id);
}

function sourceLinks(t) {
  return (t.sources ?? []).map((key) => {
    const s = doc.sources[key];
    if (!s) return null;
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    return a;
  }).filter(Boolean);
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
  card.id = 'trophy-' + t.id;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    render();
  });
  card.append(box);

  const body = document.createElement('div');
  const head = document.createElement('div');
  head.className = 'trophy-head';
  const title = document.createElement('h3');
  title.textContent = isHidden(t) ? 'Hidden story trophy' : t.name;
  if (isHidden(t)) title.className = 'hidden-name';
  head.append(title);
  const chip = document.createElement('span');
  chip.className = 'grade-chip grade-' + t.grade;
  chip.textContent = t.grade;
  head.append(chip);
  const tag = document.createElement('span');
  tag.className = 'kind-tag';
  tag.textContent = KIND_LABELS[t.kind] ?? t.kind;
  head.append(tag);
  if (t.missable) {
    const badge = document.createElement('span');
    badge.className = 'missable-badge';
    badge.textContent = '⚠ Possibly missable';
    head.append(badge);
  }
  body.append(head);

  if (isHidden(t)) {
    const note = document.createElement('p');
    note.className = 'trophy-desc';
    note.textContent = 'Hidden until earned — turn off “Hide story spoilers” to reveal this trophy.';
    body.append(note);
  } else {
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = t.description;
    body.append(desc);
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'How to get it';
    details.append(summary);
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = t.guide;
    details.append(guide);
    const links = sourceLinks(t);
    if (links.length > 0) {
      const line = document.createElement('p');
      line.className = 'source-line';
      line.append(document.createTextNode('Source: '));
      for (const a of links) line.append(a);
      details.append(line);
    }
    body.append(details);
  }
  card.append(body);
  return card;
}

function matches(t) {
  if (kindFilter === 'missable') {
    if (!t.missable) return false;
  } else if (kindFilter === 'online') {
    return false;
  } else if (kindFilter !== 'all' && t.kind !== kindFilter) {
    return false;
  }
  if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
  if (hideEarned && earned.has(t.id)) return false;
  if (query) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  progressText.textContent = earned.size + ' of ' + total + ' earned';
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return g + ' ' + have + '/' + all;
  });
  gradeCounts.textContent = counts.join(' · ');
  progressFill.style.width = Math.round((earned.size / total) * 100) + '%';
}

function render() {
  renderProgress();
  listEl.replaceChildren();
  const shown = trophies.filter(matches);
  countLine.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies'
    + (kindFilter !== 'all' ? ' — ' + (KIND_LABELS[kindFilter] ?? kindFilter) : '');
  emptyNote.hidden = shown.length > 0;
  for (const t of shown) listEl.append(trophyCard(t));
}

function renderRoadmap() {
  document.getElementById('roadmapFacts').innerHTML = '';
  const facts = document.getElementById('roadmapFacts');
  roadmap.facts.forEach((f, i) => {
    if (i > 0) facts.append(document.createTextNode(' · '));
    const b = document.createElement('b');
    b.textContent = f.label + ': ';
    facts.append(b, document.createTextNode(f.value));
  });
  const stages = document.getElementById('roadmapStages');
  stages.replaceChildren();
  for (const s of roadmap.stages) {
    const div = document.createElement('div');
    div.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = 'Stage ' + s.stage + ' — ' + s.name;
    div.append(h);
    const time = document.createElement('p');
    time.className = 'stage-time';
    time.textContent = s.time;
    div.append(time);
    const ol = document.createElement('ol');
    for (const step of s.steps) {
      const li = document.createElement('li');
      li.textContent = step;
      ol.append(li);
    }
    div.append(ol);
    const tr = document.createElement('p');
    tr.className = 'stage-trophies';
    tr.textContent = 'Trophies: ' + s.trophies;
    div.append(tr);
    stages.append(div);
  }
  const warns = document.getElementById('roadmapWarnings');
  warns.replaceChildren();
  for (const w of roadmap.warnings) {
    const li = document.createElement('li');
    li.textContent = w;
    warns.append(li);
  }
}

function showTab(which) {
  const checklist = which === 'checklist';
  document.getElementById('checklistSection').hidden = !checklist;
  document.getElementById('roadmapSection').hidden = checklist;
  document.getElementById('tabChecklist').classList.toggle('active', checklist);
  document.getElementById('tabRoadmap').classList.toggle('active', !checklist);
  document.getElementById('tabChecklist').setAttribute('aria-selected', String(checklist));
  document.getElementById('tabRoadmap').setAttribute('aria-selected', String(!checklist));
}

document.getElementById('tabChecklist').addEventListener('click', () => showTab('checklist'));
document.getElementById('tabRoadmap').addEventListener('click', () => showTab('roadmap'));

spoilerToggle.checked = spoiler;
spoilerToggle.addEventListener('change', () => {
  spoiler = spoilerToggle.checked;
  save();
  render();
});
searchInput.addEventListener('input', () => {
  query = searchInput.value.trim().toLowerCase();
  render();
});
gradeSelect.addEventListener('change', () => {
  gradeFilter = gradeSelect.value;
  render();
});
hideEarnedBox.addEventListener('change', () => {
  hideEarned = hideEarnedBox.checked;
  render();
});
document.getElementById('kindFilters').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-kind]');
  if (!btn) return;
  kindFilter = btn.dataset.kind;
  document.querySelectorAll('#kindFilters .kind').forEach((b) => b.classList.toggle('active', b === btn));
  render();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = {
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  document.getElementById('savedNote').textContent = 'Exported ' + earned.size + ' earned trophies to gta6-trophy-progress.json.';
});
document.getElementById('importInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('bad file');
    earned = new Set(ids.filter((id) => knownIds.has(id)));
    save();
    render();
    document.getElementById('savedNote').textContent = 'Imported ' + earned.size + ' earned trophies from ' + file.name + '.';
  } catch {
    document.getElementById('savedNote').textContent = 'That file is not a trophy progress export — nothing was changed.';
  }
  e.target.value = '';
});

renderRoadmap();
if (kindFilter !== 'all') {
  document.querySelectorAll('#kindFilters .kind').forEach((b) => b.classList.toggle('active', b.dataset.kind === kindFilter));
}
if (params.get('view') === 'roadmap') showTab('roadmap');
render();
if (params.get('open')) {
  const card = document.getElementById('trophy-' + params.get('open'));
  if (card) {
    const details = card.querySelector('details');
    if (details) details.open = true;
    card.scrollIntoView({ block: 'nearest' });
  }
}
