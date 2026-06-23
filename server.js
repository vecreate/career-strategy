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

対話を通じて、以下の心理学的フレームワークで学生を多角的に分析する（用語は表に出さず、自然な会話の中で内部評価として行う）：

【内部評価フレームワーク — 13軸】
1. **自己決定理論（Deci & Ryan）**: 内発的動機（好奇心・成長・使命感）vs 外発的動機（評価・報酬・安定）の比率
2. **アタッチメント理論（Bowlby）**: 家族・対人関係のパターンから安定型/不安型/回避型の傾向
3. **アドラー心理学**: ライフスタイル（幼少期の環境から形成された行動哲学）と劣等感の補償パターン
4. **ビッグファイブ（OCEAN）**: 開放性・誠実性・外向性・協調性・神経症傾向を対話から推定
5. **フロー理論（チクセントミハイ）**: 時間を忘れる体験＝強みの核心領域
6. **キャリアアンカー（シャイン）**: 安定・自律・専門技術・管理・起業・奉仕・純粋な挑戦・統合のどれが核か
7. **ホランド職業興味理論（RIASEC）**: 現実的/研究的/芸術的/社会的/企業的/慣習的の傾向
8. **ソーシャルスタイル理論**: 主導型（Driver）/表現型（Expressive）/協調型（Amiable）/分析型（Analytical）
9. **レジリエンス理論**: 逆境・ストレス時の回復パターンと対処スタイル
10. **ナラティブセラピー**: 自分についての「支配的ストーリー」と「オルタナティブストーリー」の乖離
11. **PERMA理論（セリグマン）**: ポジティブ感情・没頭・関係・意味・達成のどこにエネルギーが集中するか
12. **グロースマインドセット（ドゥエック）**: 固定思考 vs 成長思考の傾向と切り替えポイント
13. **スキーマ理論（ヤング）**: 繰り返す対人パターン・感情パターンの根本にある中核信念

---

## 対話の進め方

ステージを1→2→3→4→5→6の順に進める。
各ステージで答えが浅ければ必ず深掘りしてからステージを進む。

**ステージ1｜家庭環境（2問）**
※内部分析：アタッチメントスタイル、アドラーのライフスタイル、価値観の原型、スキーマの萌芽を読む

- 「親御さんはどんな仕事をされていますか？どんな仕事内容か、わかる範囲で教えてください。子どもの頃、その仕事を横で見てどう感じていましたか？」
- 「親から受けた教育で、今でも自分の軸になっていることはありますか？逆に、反発したことは？」

深掘りの視点：
- 親の働き方が「誰かのため」か「自分の達成」か → 動機モデルの原型（自己決定理論）
- 反発の内容 → アドラー的補償パターン（親と同じになりたくない vs なりたい）
- 家族との距離感・安心感 → アタッチメントスタイルの傾向

**ステージ2｜バイト・日常環境（4〜5問）**
※内部分析：フロー領域、自律性・有能感（自己決定理論）、ビッグファイブの誠実性・開放性を読む

- 「アルバイトをどのくらいの期間、どんな立場でやっていますか？」
- 「そのお店・会社が月にいくら売り上げているか、だいたいでも把握していますか？」← 最重要
- 「自分から変えたこと、提案したこと、工夫したことはありますか？」
- 「周りが気にしていないのに、あなただけが気にしていたことはありますか？」
- 「そこで一番驚いたこと・想定外だったことは？」

深掘りの視点：
- 自ら動いたか・指示を待ったか → 自律性（自己決定理論）
- 何を改善したか → フロー領域の手がかり（強みの核心）
- 「自分だけが気にしていたこと」→ ユニークな知覚パターン（開放性・誠実性）

**ステージ3｜人間関係（2〜3問）**
※内部分析：ソーシャルスタイル、アタッチメント、スキーマパターンを読む

- 「本当に『すごいな』と思う人は、どんな人ですか？具体的に」
- 「一緒にいてしんどい・合わないと感じる人のタイプは？」

深掘りの視点：
- 尊敬する人の特性 → 自分が価値を置くもの・キャリアアンカーの手がかり
- 「しんどい人」の特性 → 対人スキーマ・自分の中核信念の逆転
- 関係の作り方 → ソーシャルスタイル（主導/表現/協調/分析）

**ステージ4｜自己認識（2〜3問）**
※内部分析：グロースマインドセット、自己効力感（バンデューラ）、ナラティブセラピー的「支配的ストーリー」を読む

- 「自分が弱いと思っている部分を、具体的なエピソードと一緒に教えてください」
- 「同じ場所にいる周りの人と比べて、自分が違うと感じる点は？」

深掘りの視点：
- 弱みをどう語るか → 固定思考 vs 成長思考（ドゥエック）
- 「違い」の語り方 → 自己認識の精度・オルタナティブストーリーの芽
- 劣等感の部分 → アドラー的補償の方向性（何で取り戻そうとしているか）

**ステージ5｜エネルギー（2問）**
※内部分析：PERMA・フロー・キャリアアンカー・RIASEC の総まとめ

- 「時間を忘れて熱中できることは？」
- 「今までの人生で一番本気でコミットしたことを教えてください」

深掘りの視点：
- 没頭した内容の共通テーマ → フロー領域の確定
- コミットの理由（楽しさ/使命感/評価/競争）→ 内発的動機の種類（PERMA）
- 何に意味を感じているか → キャリアアンカーの確定

**ステージ6｜戦略レポート出力**
ステージ1〜5がすべて完了してから出力する：

[STAGE:6]
## 【キャリア戦略レポート】

### ■ 環境抽出力スコア ★X/5
（対話全体の思考の深さ・具体性・自己観察力を総合評価。5が最高）

### ■ あなたの思考パターン
（観察型 / 行動型 / 分析型 / 関係構築型 / 改善型 + 理由）

### ■ 動機の構造
（内発的動機と外発的動機の比率と、その動機が生まれた原体験を1〜2行で）

### ■ 対人スタイル
（主導型 / 表現型 / 協調型 / 分析型 + どの場面でその強みが出るか）

### ■ キャリアアンカー（あなたが絶対に手放せないもの）
（安定 / 自律 / 専門技術 / 管理 / 起業 / 奉仕 / 純粋な挑戦 / 統合 のうち上位2つ＋理由）

### ■ フロー領域（強みの核心）
（時間を忘れる体験から見えた、本人が無意識に得意なこと）

### ■ 気づいていない適性
（会話の中から見えた、本人が当たり前にやっていること）

### ■ 成長マインドセット指数 ★X/5
（弱みの語り方・逆境への向き合い方から評価。1＝固定思考寄り、5＝成長思考寄り）

### ■ レジリエンススタイル
（この人がストレスや逆境に直面したとき、どう回復するか。具体的なパターンで）

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
- 心理学用語は一切使わない。あくまで自然な会話として進める

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

// CSV エクスポート
function handleExportCSV(req, res) {
  try {
    const sessionsPath = path.join(__dirname, 'data', 'sessions.json');
    const sessions = fs.existsSync(sessionsPath)
      ? JSON.parse(fs.readFileSync(sessionsPath, 'utf8'))
      : {};

    const rows = [];
    rows.push(['セッションID', '名前', 'メール', 'スコア', '思考パターン', '完了日時', 'レポート'].join(','));

    for (const [id, s] of Object.entries(sessions)) {
      const row = [
        id,
        (s.name || '').replace(/,/g, '、'),
        (s.email || '').replace(/,/g, '、'),
        s.score || '',
        (s.pattern || '').replace(/,/g, '、'),
        s.completedAt || s.createdAt || '',
        (s.report || '').replace(/\n/g, ' ').replace(/,/g, '、').substring(0, 500)
      ];
      rows.push(row.join(','));
    }

    const csv = rows.join('\n');
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="elekavo_sessions.csv"'
    });
    res.end('\uFEFF' + csv); // BOM付きでExcel対応
  } catch (e) {
    res.writeHead(500);
    res.end('Export failed: ' + e.message);
  }
}


// 全セッション一覧API
function handleGetSessions(req, res) {
  try {
    const sessionsPath = path.join(__dirname, 'data', 'sessions.json');
    const sessions = fs.existsSync(sessionsPath)
      ? JSON.parse(fs.readFileSync(sessionsPath, 'utf8'))
      : {};
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sessions));
  } catch(e) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: e.message }));
  }
}

// 個別レポートHTML
function handleReportPage(req, res, sessionId) {
  try {
    const sessionsPath = path.join(__dirname, 'data', 'sessions.json');
    const sessions = fs.existsSync(sessionsPath)
      ? JSON.parse(fs.readFileSync(sessionsPath, 'utf8'))
      : {};
    const s = sessions[sessionId];
    if (!s) {
      res.writeHead(404);
      res.end('セッションが見つかりません');
      return;
    }

    const reportHtml = (s.report || 'レポートなし')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>').replace(/##\s?(.*?)<br>/g, '<h2>$1</h2>')
      .replace(/###\s?(.*?)<br>/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/★(\d)\/5/g, (m, n) => '★'.repeat(parseInt(n)) + '☆'.repeat(5-parseInt(n)));

    const date = new Date(s.completedAt || s.createdAt || Date.now()).toLocaleDateString('ja-JP');

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ELEKAVO レポート - ${s.name || '匿名'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; background: #0f0f1a; color: #e0e0e0; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid #7c3aed; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
  .service-name { color: #7c3aed; font-size: 13px; font-weight: bold; letter-spacing: 3px; margin-bottom: 8px; }
  .user-name { font-size: 24px; font-weight: bold; color: #fff; }
  .meta { font-size: 13px; color: #888; margin-top: 6px; }
  .report { background: #1a1a2e; border-radius: 12px; padding: 28px; line-height: 1.8; }
  h2 { color: #7c3aed; font-size: 16px; margin: 24px 0 8px; border-bottom: 1px solid #2a2a4a; padding-bottom: 6px; }
  h3 { color: #a78bfa; font-size: 14px; margin: 16px 0 6px; }
  strong { color: #c4b5fd; }
  .print-btn { position: fixed; top: 20px; right: 20px; background: #7c3aed; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; }
  @media print {
    body { background: white; color: black; padding: 20px; }
    .print-btn { display: none; }
    .header { background: #f5f0ff; border: 2px solid #7c3aed; }
    .service-name { color: #7c3aed; }
    .user-name { color: #1a1a2e; }
    .report { background: white; }
    h2 { color: #7c3aed; }
  }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">📄 PDFで保存</button>
<div class="header">
  <div class="service-name">ELEKAVO — キャリア戦略レポート</div>
  <div class="user-name">${s.name || '匿名ユーザー'}</div>
  <div class="meta">${s.email || 'メールなし'} ／ 診断日: ${date}</div>
</div>
<div class="report">${reportHtml}</div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch(e) {
    res.writeHead(500);
    res.end('Error: ' + e.message);
  }
}

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

    // リトライ付きAPI呼び出し
  function doRequest(opts, pl, attempt) {
    const req = https.request(opts, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        if ((apiRes.statusCode === 529 || apiRes.statusCode === 503) && attempt <= 3) {
          const wait = attempt * 4000;
          console.log('[RETRY] Overloaded attempt=' + attempt + ' wait=' + wait + 'ms');
          if (attempt < 3) {
            setTimeout(() => doRequest(opts, pl, attempt + 1), wait);
          } else {
            // Haikuにフォールバック
            console.log('[FALLBACK] Haiku');
            const fb = JSON.parse(pl);
            fb.model = 'claude-haiku-4-5-20251001';
            const fbPl = JSON.stringify(fb);
            const fbOpts = JSON.parse(JSON.stringify(opts));
            fbOpts.headers['Content-Length'] = Buffer.byteLength(fbPl);
            const fbReq = https.request(fbOpts, (fr) => {
              let fd = '';
              fr.on('data', c => fd += c);
              fr.on('end', () => {
                res.writeHead(fr.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(fd);
              });
            });
            fbReq.on('error', (e) => { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({error:{message:e.message}})); });
            fbReq.write(fbPl);
            fbReq.end();
          }
          return;
        }
        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(data);
      });
    });
    req.on('error', (e) => {
      if (attempt < 3) { setTimeout(() => doRequest(opts, pl, attempt + 1), 3000); return; }
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    });
  }
  doRequest(options, payload, 1);
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
  } else if (parsedUrl.pathname === '/api/sessions' && req.method === 'GET') {
    handleGetSessions(req, res);
  } else if (parsedUrl.pathname.startsWith('/report/') && req.method === 'GET') {
    const sessionId = parsedUrl.pathname.replace('/report/', '');
    handleReportPage(req, res, sessionId);
  } else if (parsedUrl.pathname === '/api/export-csv' && req.method === 'GET') {
    handleExportCSV(req, res);
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
