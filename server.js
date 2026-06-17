const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const SYSTEM_PROMPT = `# キャリア戦略アドバイザー

## 絶対ルール（最優先・違反禁止）

### ルール1：あなた自身の発言のみを出力する

絶対にやってはいけないこと：
- 「user」「User」「us」「use」「ユーザー」「学生」「assistant」「model」などで始まる行を出力する
- 学生が次に言いそうなことを代わりに書く
- 会話のやりとりをスクリプト形式（user: ～ / model: ～）で表現する
- 自分の返答を書いた後に続けて書く

→ 自分の返答を1つ書いたら、必ずそこで止まる。

### ルール2：1回の返答で質問は1つだけ

質問を書いたら即停止。次の質問は学生が答えてから。

### ルール3：個人情報を求めない・使わない

名前・学校名・会社名・人名が出てきたら「そのお店」「その方」などに置き換える。

### ルール4：ステージ遷移マーカーを必ず出力する

各ステージに移るとき、最初の文の直前に以下のマーカーを出力する（1回だけ）。
マーカーは画面に表示されないため、必ず出力すること。

- 最初のメッセージ（家庭環境の質問）→ [STAGE:1]
- アルバイト・日常の質問に移るとき → [STAGE:2]
- 人間関係の質問に移るとき → [STAGE:3]
- 自己認識の質問に移るとき → [STAGE:4]
- エネルギーの質問に移るとき → [STAGE:5]
- 戦略レポートを出力するとき → [STAGE:6]

出力例：「[STAGE:2]では次に、アルバイトについて聞かせてください。」

### ルール5：レポートはステージ1〜5をすべて完了してから

ステージ1（家庭環境）・2（バイト/日常）・3（人間関係）・4（自己認識）・5（エネルギー）の
すべてが終わってから、初めて[STAGE:6]とレポートを出力する。
1つでも未完了のステージがあれば、レポートを出してはならない。

---

## あなたの役割

就活支援サービスのAIアドバイザー。新卒3年目で大企業・スタートアップ・行政・金融機関の
経営者・役員と多数接してきた人物の視点で、学生の思考を引き出す。

「今いる環境から何を考え、何を引き出してきたか」という思考の質を見る。

---

## 対話の進め方

ステージを1→2→3→4→5→6の順に進める。
各ステージで答えが浅ければ必ず深掘りしてからステージを進む。

**ステージ1｜家庭環境（2問）**
- 「親御さんの仕事は何ですか？子どもの頃、その仕事を横で見てどう感じていましたか？」
- 「親から受けた教育で、今でも自分の軸になっていることはありますか？逆に、反発したことは？」

**ステージ2｜バイト・日常環境（4〜5問）**
- 「アルバイトをどのくらいの期間、どんな立場でやっていますか？」
- 「そのお店・会社が月にいくら売り上げているか、だいたいでも把握していますか？」← 最重要
- 「自分から変えたこと、提案したこと、工夫したことはありますか？」
- 「周りが気にしていないのに、あなただけが気にしていたことはありますか？」
- 「そこで一番驚いたこと・想定外だったことは？」

**ステージ3｜人間関係（2〜3問）**
- 「本当に『すごいな』と思う人は、どんな人ですか？具体的に」
- 「一緒にいてしんどい・合わないと感じる人のタイプは？」

**ステージ4｜自己認識（2〜3問）**
- 「自分が弱いと思っている部分を、具体的なエピソードと一緒に教えてください」
- 「同じ場所にいる周りの人と比べて、自分が違うと感じる点は？」

**ステージ5｜エネルギー（2問）**
- 「時間を忘れて熱中できることは？」
- 「今までの人生で一番本気でコミットしたことを教えてください」

**ステージ6｜戦略レポート出力**
ステージ1〜5がすべて完了してから出力する：

[STAGE:6]
## 【キャリア戦略レポート】

### ■ 環境抽出力スコア ★X/5
（評価と理由）

### ■ あなたの思考パターン
（観察型 / 行動型 / 分析型 / 関係構築型 / 改善型 + 理由）

### ■ 気づいていない適性
（会話の中から見えた、本人が当たり前にやっていること）

### ■ 今すぐやること（3つ）
（就活より先に、今の環境でできる具体的なアクション）

### ■ 狙うべき環境タイプ
（大企業 / スタートアップ / 行政 / 金融 + 理由。職種ではなく組織文化の相性で）

### ■ 企業選びの軸（3つ）

### ■ 一言で言うと

---

## 会話の姿勢

- 曖昧な答えには「具体的には？」と返す
- 「素晴らしいですね」「頑張りましょう」は使わない
- 学生の言葉をそのまま使って返す（鏡のように）
- 年上の先輩が本音で話す感覚、敬語だが距離は近く

## 最初のメッセージ

[STAGE:1]
「これは普通の就活相談じゃないです。あなたが今まで生きてきた環境を、もう一回ちゃんと見直す時間にします。質問は尖ってるかもしれないけど、それが目的です。正直に答えてもらえれば、就活に使えるものが必ず出てきます。では始めましょう。」

その後、ステージ1の1問目を聞く。`;

// ── DATA STORAGE ──────────────────────────────────────────
const DATA_DIR   = path.join(__dirname, 'data');
const DATA_FILE  = path.join(DATA_DIR, 'sessions.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR))   fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE))  fs.writeFileSync(DATA_FILE,  '[]', 'utf8');
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');

function readSessions() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}
function writeSessions(sessions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2), 'utf8');
}
function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); }
  catch { return []; }
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

// POST /api/register  – creates or retrieves user by email
function handleRegister(req, res) {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const { name, email } = JSON.parse(body);
      if (!email) { res.writeHead(400); res.end(JSON.stringify({ error: 'email required' })); return; }

      const users = readUsers();
      let user = users.find(u => u.email === email.toLowerCase());
      if (!user) {
        user = { id: generateId(), name: name || '', email: email.toLowerCase(), createdAt: new Date().toISOString() };
        users.push(user);
        writeUsers(users);
      } else if (name && !user.name) {
        user.name = name;
        writeUsers(users);
      }

      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ ok: true, user: { id: user.id, name: user.name, email: user.email } }));
    } catch (e) {
      res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
    }
  });
}

// POST /api/save-session  – called by frontend when report is generated
function handleSaveSession(req, res) {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      const session = {
        id:              generateId(),
        date:            new Date().toISOString(),
        email:           data.email       || null,
        name:            data.name        || '',
        score:           data.score       || null,
        pattern:         data.pattern     || '',
        stagesCompleted: data.stages      || 6,
        turnCount:       data.turnCount   || 0,
        durationMin:     data.durationMin || 0,
        reportText:      data.reportText  || ''
      };
      const sessions = readSessions();
      sessions.push(session);
      writeSessions(sessions);

      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ ok: true, sessionId: session.id }));
    } catch (e) {
      res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
    }
  });
}

// GET /api/user-history?email=xxx  – returns all sessions for a user
function handleUserHistory(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const email = (parsedUrl.query.email || '').toLowerCase();
  if (!email) { res.writeHead(400); res.end(JSON.stringify({ error: 'email required' })); return; }

  const users = readUsers();
  const user  = users.find(u => u.email === email);
  const sessions = readSessions().filter(s => s.email === email).sort((a,b) => new Date(a.date) - new Date(b.date));

  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ user: user || null, sessions }));
}

// GET /api/stats  – returns aggregated data for admin dashboard
function handleStats(req, res) {
  const sessions = readSessions();
  const total = sessions.length;

  // score distribution  0-1 1-2 2-3 3-4 4-5
  const scoreBuckets = [0,0,0,0,0];
  let scoreSum = 0, scoreCount = 0;
  const patternCount = {};
  const byDay = {};

  sessions.forEach(s => {
    if (s.score !== null && s.score !== undefined) {
      const bucket = Math.min(4, Math.floor(s.score));
      scoreBuckets[bucket]++;
      scoreSum += s.score;
      scoreCount++;
    }
    if (s.pattern) patternCount[s.pattern] = (patternCount[s.pattern] || 0) + 1;
    const day = s.date ? s.date.substr(0, 10) : 'unknown';
    byDay[day] = (byDay[day] || 0) + 1;
  });

  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({
    total,
    avgScore: scoreCount ? Math.round(scoreSum / scoreCount * 10) / 10 : null,
    scoreBuckets,       // [count0-1, count1-2, count2-3, count3-4, count4-5]
    patternCount,       // { "分析型×設計型": 3, ... }
    byDay               // { "2026-06-24": 5, ... }
  }));
}

// POST /api/match  – compute industry match scores from score + pattern
function handleMatch(req, res) {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const { score, pattern } = JSON.parse(body);
      const industriesPath = path.join(__dirname, 'data', 'industries.json');
      const industries = JSON.parse(fs.readFileSync(industriesPath, 'utf8'));

      // Parse user patterns (e.g. "分析型×設計型" → ["分析型","設計型"])
      const userPatterns = (pattern || '')
        .split(/[×・x\/]/)
        .map(p => p.trim())
        .filter(Boolean);

      const results = industries.map(ind => {
        // --- Pattern alignment (0–1) ---
        let patternScore = 0;
        if (userPatterns.length === 0) {
          patternScore = 0.5; // no data → neutral
        } else {
          userPatterns.forEach(p => {
            patternScore += (ind.patterns[p] || 0);
          });
          // Normalize: cap at 1 if user has 2 strong patterns that both match
          patternScore = Math.min(patternScore, 1);
        }

        // --- Score compatibility (0–1) ---
        let scoreCompat = 0;
        const s = score || 0;
        if (s >= ind.idealScore) {
          scoreCompat = 1.0;
        } else if (s >= ind.minScore) {
          scoreCompat = 0.6 + 0.4 * ((s - ind.minScore) / (ind.idealScore - ind.minScore));
        } else if (s > 0) {
          scoreCompat = 0.3 + 0.3 * (s / ind.minScore);
        } else {
          scoreCompat = 0.3;
        }

        // --- Combined match (pattern 65%, score 35%) ---
        const matchRaw = patternScore * 0.65 + scoreCompat * 0.35;
        const matchPct = Math.round(Math.max(5, Math.min(99, matchRaw * 100)));

        return {
          id:     ind.id,
          name:   ind.name,
          emoji:  ind.emoji,
          desc:   ind.desc,
          match:  matchPct,
          note:   ind.fitNote,
          levelUpActions: ind.levelUpActions
        };
      });

      results.sort((a, b) => b.match - a.match);

      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({
        top: results.slice(0, 3),
        worst: results[results.length - 1],
        all: results
      }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

// Read HTML file
function serveHtml(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

// Proxy to Anthropic API
function handleChat(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const { messages } = JSON.parse(body);
    const apiKey = process.env.ANTHROPIC_API_KEY || '';

    const payload = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        res.writeHead(apiRes.statusCode, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
      });
    });

    apiReq.on('error', (e) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    });

    apiReq.write(payload);
    apiReq.end();
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
    serveHtml(res, path.join(__dirname, 'public', 'index.html'));
  } else if (parsedUrl.pathname === '/admin') {
    serveHtml(res, path.join(__dirname, 'public', 'admin.html'));
  } else if (parsedUrl.pathname === '/history') {
    serveHtml(res, path.join(__dirname, 'public', 'history.html'));
  } else if (parsedUrl.pathname === '/api/chat' && req.method === 'POST') {
    handleChat(req, res);
  } else if (parsedUrl.pathname === '/api/register' && req.method === 'POST') {
    handleRegister(req, res);
  } else if (parsedUrl.pathname === '/api/save-session' && req.method === 'POST') {
    handleSaveSession(req, res);
  } else if (parsedUrl.pathname === '/api/user-history' && req.method === 'GET') {
    handleUserHistory(req, res);
  } else if (parsedUrl.pathname === '/api/stats' && req.method === 'GET') {
    handleStats(req, res);
  } else if (parsedUrl.pathname === '/api/match' && req.method === 'POST') {
    handleMatch(req, res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🎯 キャリア戦略設計サービス 起動完了`);
  console.log(`👉 ブラウザで開く: http://localhost:${PORT}\n`);
});
