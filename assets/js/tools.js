/* Interactive architecture tools. Each tool exposes { id, name, icon, blurb, render(rootEl) }. */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Segmented control helper: renders buttons and calls onChange(value).
  function seg(name, options, value) {
    return `<div class="seg" data-seg="${name}">${options.map(([v, l]) =>
      `<button type="button" data-v="${v}" class="${v === value ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  }
  function bindSeg(root, state, rerender) {
    $$('[data-seg]', root).forEach(g => $$('button', g).forEach(b => b.onclick = () => {
      state[g.dataset.seg] = b.dataset.v; rerender();
    }));
  }

  // ---------------------------------------------------------------- DR
  const TIME_STEPS = [
    { s: 0, l: 'Near zero' }, { s: 30, l: '30 seconds' }, { s: 60, l: '1 minute' }, { s: 300, l: '5 minutes' },
    { s: 900, l: '15 minutes' }, { s: 1800, l: '30 minutes' }, { s: 3600, l: '1 hour' }, { s: 14400, l: '4 hours' },
    { s: 43200, l: '12 hours' }, { s: 86400, l: '24 hours' }, { s: 259200, l: '72 hours' }
  ];
  // Rule-of-thumb lower bounds each strategy can typically achieve (seconds).
  const DR = [
    { id: 'backup', name: 'Backup & restore', minRto: 14400, minRpo: 3600, cost: 1, rtoText: 'Hours', rpoText: 'Hours (backup frequency)',
      how: 'Back up data (AWS Backup, EBS/RDS snapshots, S3 replication) to another Region. Provision infrastructure with IaC (CloudFormation/CDK) only when disaster strikes.',
      svcs: 'AWS Backup, S3 CRR, EBS/RDS snapshot copy, CloudFormation' },
    { id: 'pilot', name: 'Pilot light', minRto: 900, minRpo: 60, cost: 2, rtoText: 'Tens of minutes', rpoText: 'Minutes',
      how: 'Core data is live-replicated (e.g. RDS cross-Region read replica, Aurora Global Database). Compute is provisioned but switched off or not yet created — scale it out at failover.',
      svcs: 'Aurora Global Database, RDS read replicas, AMIs, Auto Scaling (min 0), Route 53' },
    { id: 'warm', name: 'Warm standby', minRto: 300, minRpo: 30, cost: 3, rtoText: 'Minutes', rpoText: 'Seconds',
      how: 'A scaled-down but fully functional copy runs in the recovery Region all the time. At failover, scale it up to production capacity and shift traffic.',
      svcs: 'Auto Scaling (small min), Aurora Global Database, DynamoDB global tables, Route 53 failover' },
    { id: 'active', name: 'Multi-site active/active', minRto: 0, minRpo: 0, cost: 4, rtoText: 'Near zero', rpoText: 'Near zero',
      how: 'Full production capacity serves traffic from multiple Regions simultaneously. Losing a Region just removes it from routing.',
      svcs: 'DynamoDB global tables, Aurora Global Database (write forwarding), Route 53 latency/ARC, Global Accelerator' }
  ];

  function renderDR(root) {
    const st = { rto: 7, rpo: 6 };
    // Sliders are rendered once; only the output is redrawn so dragging isn't interrupted.
    root.innerHTML = `
      <div class="card stack">
        <label class="field"><span>Recovery Time Objective (RTO) — how long can you be down? <b class="mono" id="rtoLbl"></b></span>
          <input type="range" min="0" max="${TIME_STEPS.length - 1}" value="${st.rto}" id="rto"></label>
        <label class="field"><span>Recovery Point Objective (RPO) — how much data can you lose? <b class="mono" id="rpoLbl"></b></span>
          <input type="range" min="0" max="${TIME_STEPS.length - 1}" value="${st.rpo}" id="rpo"></label>
      </div>
      <div id="drOut"></div>
      <div class="callout" style="margin-top:18px">
        <p><b>How the exam frames it:</b> pick the <em>cheapest</em> strategy that still satisfies the stated RTO and RPO. "Lowest cost, recovery within 24 hours" → backup & restore. "RTO in minutes, keep costs down" → warm standby, not active/active.</p>
        <p class="small">RTO/RPO ranges above are rules of thumb from the AWS Well-Architected Reliability Pillar; real values depend on your automation and data replication.</p>
      </div>`;
    function update() {
      const rto = TIME_STEPS[st.rto].s, rpo = TIME_STEPS[st.rpo].s;
      const fits = DR.filter(d => d.minRto <= rto && d.minRpo <= rpo);
      const pick = fits[0];
      $('#rtoLbl', root).textContent = TIME_STEPS[st.rto].l;
      $('#rpoLbl', root).textContent = TIME_STEPS[st.rpo].l;
      $('#drOut', root).innerHTML = `
        <div class="result-box" style="margin:18px 0">
          <div class="small muted">Lowest-cost strategy that meets both objectives</div>
          <h3>${pick.name}</h3>
          <p style="margin:0">${pick.how}</p>
          <p class="small" style="margin:8px 0 0"><b>Typical services:</b> ${pick.svcs}</p>
        </div>
        <div class="strategy-grid">
          ${DR.map(d => `<div class="strategy ${d === pick ? 'on' : ''}">
            <h4>${d.name}</h4>
            <div class="small muted">Cost / complexity</div>
            <div class="meter">${[1, 2, 3, 4].map(i => `<i class="${i <= d.cost ? 'f' : ''}"></i>`).join('')}</div>
            <div class="small"><b>RTO:</b> ${d.rtoText}<br><b>RPO:</b> ${d.rpoText}</div>
            <div class="small" style="margin-top:6px">${fits.includes(d) ? '✅ Meets your targets' : '❌ Too slow for your targets'}</div>
          </div>`).join('')}
        </div>`;
    }
    $('#rto', root).oninput = e => { st.rto = +e.target.value; update(); };
    $('#rpo', root).oninput = e => { st.rpo = +e.target.value; update(); };
    update();
  }

  // ---------------------------------------------------------------- S3
  const S3_CLASSES = [
    ['S3 Standard', '≥3', 'None', 'None', 'Milliseconds', 'None'],
    ['S3 Intelligent-Tiering', '≥3', 'None', 'None (objects <128 KB stay in frequent tier)', 'Milliseconds (opt-in archive tiers: minutes–hours)', 'None; small monitoring fee per object'],
    ['S3 Standard-IA', '≥3', '30 days', '128 KB', 'Milliseconds', 'Per GB retrieved'],
    ['S3 One Zone-IA', '1', '30 days', '128 KB', 'Milliseconds', 'Per GB retrieved'],
    ['S3 Glacier Instant Retrieval', '≥3', '90 days', '128 KB', 'Milliseconds', 'Per GB retrieved (higher)'],
    ['S3 Glacier Flexible Retrieval', '≥3', '90 days', '40 KB overhead', 'Expedited 1–5 min · Standard 3–5 h · Bulk 5–12 h', 'Per GB (bulk is free)'],
    ['S3 Glacier Deep Archive', '≥3', '180 days', '40 KB overhead', 'Standard within 12 h · Bulk within 48 h', 'Per GB retrieved']
  ];
  function renderS3(root) {
    const st = { pattern: 'unknown', speed: 'ms', az: 'multi' };
    function recommend() {
      const { pattern, speed, az } = st;
      if (pattern === 'frequent') return ['S3 Standard', 'Frequently accessed data: lowest request and retrieval cost, no minimum duration.'];
      if (pattern === 'unknown') return ['S3 Intelligent-Tiering', 'Unknown or changing access patterns: S3 moves objects between tiers automatically with no retrieval fees — you pay a small per-object monitoring fee.'];
      if (pattern === 'infrequent') {
        if (az === 'single') return ['S3 One Zone-IA', 'Infrequent access, and the data can be re-created if one AZ is lost (e.g. secondary backup copies, thumbnails). ~20% cheaper than Standard-IA.'];
        return ['S3 Standard-IA', 'Accessed less than about once a month but needs millisecond access and multi-AZ resilience.'];
      }
      // archive
      if (speed === 'ms') return ['S3 Glacier Instant Retrieval', 'Archive data accessed about once a quarter that still needs millisecond retrieval (e.g. medical images, news archives).'];
      if (speed === 'minutes') return ['S3 Glacier Flexible Retrieval', 'Archives where minutes (expedited) to hours is acceptable; free bulk retrieval suits large, rare restores.'];
      return ['S3 Glacier Deep Archive', 'Lowest-cost storage for data retained 7–10+ years for compliance, rarely or never read. Restores within 12 hours (standard) or 48 hours (bulk).'];
    }
    function draw() {
      const [name, why] = recommend();
      root.innerHTML = `
        <div class="card stack">
          <div><div class="field"><span>How often is the data accessed?</span></div>
            ${seg('pattern', [['frequent', 'Frequently'], ['infrequent', 'Monthly or less'], ['archive', 'Rarely (archive)'], ['unknown', 'Unknown / changes']], st.pattern)}</div>
          ${st.pattern === 'archive' ? `<div><div class="field"><span>How fast must a retrieval complete?</span></div>
            ${seg('speed', [['ms', 'Milliseconds'], ['minutes', 'Minutes to hours'], ['hours', '12–48 hours is fine']], st.speed)}</div>` : ''}
          ${st.pattern === 'infrequent' ? `<div><div class="field"><span>Can the data survive the loss of one Availability Zone?</span></div>
            ${seg('az', [['multi', 'No — needs multi-AZ'], ['single', 'Yes — it is re-creatable']], st.az)}</div>` : ''}
        </div>
        <div class="result-box" style="margin:18px 0"><div class="small muted">Recommended storage class</div><h3>${name}</h3><p style="margin:0">${why}</p></div>
        <h3>Storage class reference</h3>
        <table><thead><tr><th>Class</th><th>AZs</th><th>Min. storage duration</th><th>Min. billable size</th><th>First-byte latency</th><th>Retrieval fee</th></tr></thead>
        <tbody>${S3_CLASSES.map(r => `<tr${r[0] === name ? ' style="background:var(--accent-soft)"' : ''}>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
        <div class="callout warn"><b>Common trap:</b> lifecycle transitions to Standard-IA or One Zone-IA require objects to be at least 30 days old in S3 Standard. Deleting before the minimum duration still bills for the full minimum.</div>`;
      bindSeg(root, st, draw);
    }
    draw();
  }

  // ---------------------------------------------------------------- CIDR
  function ipToInt(ip) { return ip.split('.').reduce((a, o) => (a << 8) + (+o), 0) >>> 0; }
  function intToIp(n) { return [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.'); }
  function renderCIDR(root) {
    const st = { cidr: '10.0.0.0/16', prefix: 24 };
    // Inputs are rendered once; only the output is redrawn so typing and dragging aren't interrupted.
    root.innerHTML = `
      <div class="card">
        <label class="field"><span>VPC CIDR block</span><input type="text" id="cidr" value="${st.cidr}" spellcheck="false" autocomplete="off" class="mono"></label>
        <label class="field" style="margin:0"><span>Subnet size: <b class="mono" id="preLbl"></b></span>
          <input type="range" id="pre" min="16" max="28" value="${st.prefix}"></label>
      </div>
      <div id="cidrOut"></div>
      <div class="callout">
        <p><b>The 5 reserved addresses</b> in every subnet (example <code>10.0.0.0/24</code>):</p>
        <ul style="margin:0"><li><code>10.0.0.0</code> — network address</li><li><code>10.0.0.1</code> — VPC router</li>
        <li><code>10.0.0.2</code> — Amazon-provided DNS</li><li><code>10.0.0.3</code> — reserved for future use</li>
        <li><code>10.0.0.255</code> — broadcast (not supported in a VPC, so AWS reserves it)</li></ul>
      </div>
      <p class="small muted">Exam favourite: "needs 29 EC2 instances in a subnet" → a /27 has 32 − 5 = 27 usable, too few; choose /26 (59 usable).</p>`;
    const slider = $('#pre', root);

    function update() {
      const m = st.cidr.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
      const out = $('#cidrOut', root);
      $('#preLbl', root).textContent = '/' + st.prefix;
      if (!m || m.slice(1, 5).some(o => +o > 255)) {
        out.innerHTML = `<div class="callout warn">Enter an IPv4 CIDR such as <code>10.0.0.0/16</code>.</div>`;
        return;
      }
      const vp = +m[5];
      if (vp < 16 || vp > 28) {
        out.innerHTML = `<div class="callout warn">A VPC CIDR block must be between <code>/16</code> (65,536 addresses) and <code>/28</code> (16 addresses).</div>`;
        return;
      }
      // Subnets can't be larger than the VPC itself.
      slider.min = vp;
      if (st.prefix < vp) { st.prefix = vp; slider.value = vp; $('#preLbl', root).textContent = '/' + vp; }
      const mask = (~0 << (32 - vp)) >>> 0;
      const given = ipToInt(m.slice(1, 5).join('.'));
      const base = (given & mask) >>> 0;
      const size = 2 ** (32 - st.prefix);
      const count = 2 ** (st.prefix - vp);
      const shown = Math.min(count, 16);
      const rows = [];
      for (let k = 0; k < shown; k++) {
        const s = base + k * size;
        rows.push(`<tr class="subnet-row"><td>${intToIp(s)}/${st.prefix}</td><td>${intToIp(s + 4)} – ${intToIp(s + size - 2)}</td><td>${size - 5}</td></tr>`);
      }
      const rfc1918 = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(intToIp(base));
      out.innerHTML = `
        ${given !== base ? `<div class="callout warn" style="margin-top:16px"><code>${m.slice(1, 5).join('.')}</code> isn't on a /${vp} boundary — the network address is <code>${intToIp(base)}/${vp}</code>.</div>` : ''}
        <div class="grid three" style="margin:16px 0">
          <div class="card"><div class="small muted">VPC range</div><strong class="mono">${intToIp(base)} – ${intToIp(base + 2 ** (32 - vp) - 1)}</strong><div class="small muted">${(2 ** (32 - vp)).toLocaleString()} addresses</div></div>
          <div class="card"><div class="small muted">Subnets of /${st.prefix}</div><strong>${count.toLocaleString()}</strong><div class="small muted">${size.toLocaleString()} addresses each</div></div>
          <div class="card"><div class="small muted">Usable per subnet</div><strong>${(size - 5).toLocaleString()}</strong><div class="small muted">AWS reserves 5 per subnet</div></div>
        </div>
        ${rfc1918 ? '' : '<div class="callout warn">This range is not RFC 1918 private space. AWS allows it, but it can collide with public addresses — prefer 10.0.0.0/8, 172.16.0.0/12 or 192.168.0.0/16.</div>'}
        <table><thead><tr><th>Subnet</th><th>Usable host range</th><th>Usable IPs</th></tr></thead><tbody>${rows.join('')}</tbody></table>
        ${count > shown ? `<p class="small muted">Showing the first ${shown} of ${count.toLocaleString()} subnets.</p>` : ''}`;
    }
    $('#cidr', root).oninput = e => { st.cidr = e.target.value; update(); };
    slider.oninput = e => { st.prefix = +e.target.value; update(); };
    update();
  }

  // ---------------------------------------------------------------- Database chooser
  const DB_TREE = {
    q: 'What does the data and access pattern look like?',
    opts: [
      { l: 'Relational (SQL, joins, transactions)', next: {
        q: 'Which matters most?',
        opts: [
          { l: 'Commercial engine (Oracle, SQL Server) or Db2', r: ['Amazon RDS', 'RDS runs Oracle, SQL Server, Db2, MySQL, MariaDB and PostgreSQL as a managed service. Use Multi-AZ for high availability and read replicas for read scaling.'] },
          { l: 'MySQL/PostgreSQL with high performance and auto-growing storage', r: ['Amazon Aurora', 'Storage is 6 copies across 3 AZs and grows automatically up to 128 TiB; up to 15 low-latency read replicas; fast failover.'] },
          { l: 'Unpredictable or spiky load', r: ['Aurora Serverless v2', 'Scales capacity (ACUs) in fine-grained steps within seconds, so you pay for what you use without managing instance sizes.'] },
          { l: 'Global reads and Region-level DR', r: ['Aurora Global Database', 'One primary Region plus read-only secondary Regions with typical replication lag under a second; promote a secondary for DR.'] }
        ] } },
      { l: 'Key-value / simple lookups at any scale', next: {
        q: 'Any extra requirement?',
        opts: [
          { l: 'Single-digit ms at any scale, serverless', r: ['Amazon DynamoDB', 'Fully managed, serverless key-value and document database. On-demand or provisioned capacity; streams for event-driven processing.'] },
          { l: 'Microsecond reads for a read-heavy DynamoDB table', r: ['DynamoDB + DAX', 'DynamoDB Accelerator is an in-memory write-through cache API-compatible with DynamoDB — minimal code changes.'] },
          { l: 'Multi-Region active/active writes', r: ['DynamoDB global tables', 'Multi-Region, multi-active replication; applications read and write locally in each Region.'] }
        ] } },
      { l: 'In-memory cache or session store', next: {
        q: 'Must the data be durable?',
        opts: [
          { l: 'No — cache in front of a database', r: ['Amazon ElastiCache', 'Managed Valkey, Redis OSS or Memcached. Choose Valkey/Redis for replication, persistence options, pub/sub and sorted sets; Memcached for simple multithreaded caching.'] },
          { l: 'Yes — in-memory primary database', r: ['Amazon MemoryDB', 'Redis/Valkey-compatible, durable in-memory database with a Multi-AZ transaction log; microsecond reads.'] }
        ] } },
      { l: 'JSON documents (MongoDB-compatible)', r: ['Amazon DocumentDB', 'Managed document database with MongoDB API compatibility; storage architecture similar to Aurora.'] },
      { l: 'Highly connected data (relationships)', r: ['Amazon Neptune', 'Graph database for social networks, fraud detection, knowledge graphs, recommendation engines. Supports Gremlin, openCypher and SPARQL.'] },
      { l: 'Time-series (IoT, metrics)', r: ['Amazon Timestream', 'Purpose-built time-series storage and query with built-in time-series functions; Timestream for InfluxDB is also available.'] },
      { l: 'Wide-column, Cassandra workloads', r: ['Amazon Keyspaces', 'Serverless, Apache Cassandra-compatible (CQL) database.'] },
      { l: 'Analytics / data warehouse (OLAP)', r: ['Amazon Redshift', 'Columnar, massively parallel data warehouse; Redshift Spectrum queries data in S3. For ad-hoc SQL directly on S3 without a warehouse, use Amazon Athena.'] },
      { l: 'Full-text search and log analytics', r: ['Amazon OpenSearch Service', 'Managed OpenSearch for search, log analytics and observability dashboards.'] },
      { l: 'Immutable, verifiable ledger', r: ['Aurora PostgreSQL (QLDB is retired)', 'Amazon QLDB reached end of support in July 2025. AWS recommends Aurora PostgreSQL for ledger-style workloads; older exam material may still mention QLDB.'] }
    ]
  };
  function renderDB(root) {
    let path = [];
    function draw() {
      let node = DB_TREE;
      const steps = [];
      for (const i of path) { steps.push({ q: node.q, a: node.opts[i].l }); node = node.opts[i].next || node.opts[i]; }
      const result = node.r;
      root.innerHTML = `
        ${steps.map((s, k) => `<div class="tree-step"><div class="small muted">${s.q}</div><b>${s.a}</b>
          <button class="btn sm ghost" data-back="${k}">change</button></div>`).join('')}
        ${result ? `<div class="result-box"><div class="small muted">Best fit</div><h3>${result[0]}</h3><p style="margin:0">${result[1]}</p></div>
          <div class="row" style="margin-top:14px"><button class="btn" id="restart">Start over</button></div>`
        : `<div class="card"><h3>${node.q}</h3><div class="options">${node.opts.map((o, i) =>
            `<button class="opt" data-o="${i}"><span class="letter">${'ABCDEFGHIJ'[i]}</span><span>${o.l}</span></button>`).join('')}</div></div>`}
        <div class="callout" style="margin-top:18px">Exam pattern: the question usually hides the data model in the scenario ("customers who bought X also bought Y" → graph; "sensor readings every second" → time-series). Spot the model first, then the operational constraint (serverless, global, lowest overhead).</div>`;
      $$('[data-o]', root).forEach(b => b.onclick = () => { path.push(+b.dataset.o); draw(); });
      $$('[data-back]', root).forEach(b => b.onclick = () => { path = path.slice(0, +b.dataset.back); draw(); });
      const r = $('#restart', root); if (r) r.onclick = () => { path = []; draw(); };
    }
    draw();
  }

  // ---------------------------------------------------------------- EC2 pricing
  function renderEC2(root) {
    const st = { interrupt: 'no', usage: 'steady', commit: 'yes', flex: 'yes', dedicated: 'no' };
    function recommend() {
      const out = [];
      if (st.dedicated === 'yes') out.push(['Dedicated Hosts', 'Bring-your-own-license software bound to physical cores/sockets, or compliance requiring a physical server dedicated to you. (Dedicated Instances isolate hardware but do not expose sockets/cores.)']);
      if (st.interrupt === 'yes') out.push(['Spot Instances', 'Up to 90% off On-Demand for fault-tolerant, stateless or flexible work (batch, CI, big data, rendering). Instances can be reclaimed with a 2-minute warning — diversify instance types with Spot Fleet / EC2 Fleet or an ASG with mixed instances.']);
      if (st.usage === 'steady' && st.commit === 'yes') {
        if (st.flex === 'yes') out.push(['Compute Savings Plans', 'Commit to $/hour for 1 or 3 years; discount applies across instance family, size, Region, OS, and to Fargate and Lambda. Up to 66% off.']);
        else out.push(['EC2 Instance Savings Plans or Reserved Instances', 'Highest discount (up to 72%) when you commit to a specific instance family in a Region. Standard RIs can be sold on the RI Marketplace; Convertible RIs allow exchanges.']);
      }
      if (st.usage !== 'steady' || st.commit === 'no') out.push(['On-Demand', 'Short-term, spiky or unpredictable workloads that cannot be interrupted, or when you cannot commit. Pay per second (Linux) with no commitment.']);
      if (st.usage === 'scheduled') out.push(['On-Demand Capacity Reservations', 'Reserve capacity in a specific AZ for a known event without a term commitment. Combine with Savings Plans to get a discount on the reserved capacity.']);
      return out;
    }
    function q(label, key, opts) { return `<div style="margin-bottom:14px"><div class="field" style="margin-bottom:6px"><span>${label}</span></div>${seg(key, opts, st[key])}</div>`; }
    function draw() {
      const recs = recommend();
      root.innerHTML = `
        <div class="card">
          ${q('Can the workload tolerate interruption?', 'interrupt', [['no', 'No'], ['yes', 'Yes']])}
          ${q('How does usage look?', 'usage', [['steady', 'Steady 24/7 baseline'], ['spiky', 'Spiky / unpredictable'], ['scheduled', 'Known short event']])}
          ${st.usage === 'steady' ? q('Can you commit for 1 or 3 years?', 'commit', [['yes', 'Yes'], ['no', 'No']]) : ''}
          ${st.usage === 'steady' && st.commit === 'yes' ? q('Do you need flexibility to change instance family, Region, or move to Fargate/Lambda?', 'flex', [['yes', 'Yes'], ['no', 'No — it is fixed']]) : ''}
          ${q('Licensing or compliance needs a dedicated physical server?', 'dedicated', [['no', 'No'], ['yes', 'Yes']])}
        </div>
        <div class="stack" style="margin-top:18px">
          ${recs.map((r, i) => `<div class="${i === 0 ? 'result-box' : 'card'}"><div class="small muted">${i === 0 ? 'Primary recommendation' : 'Also consider'}</div><h3>${r[0]}</h3><p style="margin:0">${r[1]}</p></div>`).join('')}
        </div>
        <div class="callout" style="margin-top:18px"><b>Classic blended answer:</b> cover the steady baseline with Savings Plans/RIs, scale for peaks with On-Demand, and run interruption-tolerant work on Spot. Discount percentages are AWS's published "up to" figures.</div>`;
      bindSeg(root, st, draw);
    }
    draw();
  }

  // ---------------------------------------------------------------- Route 53 game
  const POLICIES = {
    simple: 'Simple', weighted: 'Weighted', latency: 'Latency-based', failover: 'Failover',
    geolocation: 'Geolocation', geoproximity: 'Geoproximity', multivalue: 'Multivalue answer', ip: 'IP-based'
  };
  const R53 = [
    ['Send 10% of traffic to a new application version and 90% to the current one.', 'weighted', 'Weighted routing splits traffic by relative weights — ideal for canary releases and A/B tests.'],
    ['Users in Germany must only be served content from servers in the EU for legal reasons.', 'geolocation', 'Geolocation routes on the user\'s location (continent, country, US state) — use it for compliance and localisation, not performance.'],
    ['Route each user to the Region that gives them the lowest network latency.', 'latency', 'Latency-based routing uses AWS latency measurements between users\' networks and Regions.'],
    ['Serve a static "we\'ll be right back" site from S3 when the primary ALB fails health checks.', 'failover', 'Failover routing sends traffic to a secondary record when the primary\'s health check fails (active-passive).'],
    ['Shift more traffic toward one Region by expanding its geographic catchment area with a bias.', 'geoproximity', 'Geoproximity routes by distance between users and resources and lets you grow or shrink a region with a bias value.'],
    ['Return up to eight healthy IP addresses at random for a simple client-side load balancing approach.', 'multivalue', 'Multivalue answer returns up to 8 healthy records chosen at random; it is not a substitute for a load balancer.'],
    ['A single web server with one IP address; no health checks needed.', 'simple', 'Simple routing returns one record (or several values in random order) with no health checks.'],
    ['Route users from a known ISP\'s CIDR ranges to a specific endpoint to optimise their network path.', 'ip', 'IP-based routing maps client CIDR blocks to endpoints — useful when you know where your users\' IP ranges are.'],
    ['Gradually migrate traffic from on-premises to AWS by moving 20% more each week.', 'weighted', 'Adjusting weights over time gives a controlled, reversible migration.'],
    ['Active-passive DR: all traffic to us-east-1 unless it becomes unhealthy, then to us-west-2.', 'failover', 'Primary/secondary records with health checks = failover routing.']
  ];
  function renderR53(root) {
    let order = R53.map((_, i) => i).sort(() => Math.random() - .5);
    let i = 0, picked = null, score = 0;
    function draw() {
      if (i >= order.length) {
        root.innerHTML = `<div class="card center"><h2>${score} / ${order.length}</h2><p class="muted">${score === order.length ? 'Perfect — you know your routing policies.' : 'Review the ones you missed, then try again.'}</p>
          <button class="btn primary" id="again">Play again</button></div>${refTable()}`;
        $('#again', root).onclick = () => { order = order.sort(() => Math.random() - .5); i = 0; score = 0; picked = null; draw(); };
        return;
      }
      const [stem, ans, why] = R53[order[i]];
      root.innerHTML = `
        <div class="row small muted" style="margin-bottom:10px"><span>Scenario ${i + 1} of ${order.length}</span><span class="spacer"></span><span>Score: <b>${score}</b></span></div>
        <div class="card">
          <div class="q-stem">${stem}</div>
          <div class="grid two" style="gap:10px">${Object.entries(POLICIES).map(([k, l]) => {
            let cls = 'opt';
            if (picked) { if (k === ans) cls += ' correct'; else if (k === picked) cls += ' wrong'; }
            return `<button class="${cls}" data-p="${k}" ${picked ? 'disabled' : ''}><span>${l}</span></button>`;
          }).join('')}</div>
          ${picked ? `<div class="explain ${picked === ans ? 'ok' : 'bad'}"><h4>${picked === ans ? '✅ Correct' : '❌ It\'s ' + POLICIES[ans]}</h4><p>${why}</p></div>
            <div class="row" style="margin-top:14px"><button class="btn primary" id="next">Next →</button></div>` : ''}
        </div>${refTable()}`;
      $$('[data-p]', root).forEach(b => b.onclick = () => { picked = b.dataset.p; if (picked === ans) score++; draw(); });
      const n = $('#next', root); if (n) n.onclick = () => { i++; picked = null; draw(); };
    }
    function refTable() {
      return `<h3 style="margin-top:24px">Cheat sheet</h3><table><thead><tr><th>Policy</th><th>Use it when…</th><th>Health checks</th></tr></thead><tbody>
        <tr><td>Simple</td><td>One resource, no special routing</td><td>No</td></tr>
        <tr><td>Weighted</td><td>Split traffic by percentage (canary, A/B, migration)</td><td>Yes</td></tr>
        <tr><td>Latency-based</td><td>Best performance across Regions</td><td>Yes</td></tr>
        <tr><td>Failover</td><td>Active-passive disaster recovery</td><td>Required on primary</td></tr>
        <tr><td>Geolocation</td><td>Compliance, localisation, content rights by user location</td><td>Yes</td></tr>
        <tr><td>Geoproximity</td><td>Route by distance, shift traffic with bias</td><td>Yes</td></tr>
        <tr><td>Multivalue answer</td><td>Up to 8 healthy random records</td><td>Yes</td></tr>
        <tr><td>IP-based</td><td>Route by client CIDR range</td><td>Yes</td></tr></tbody></table>`;
    }
    draw();
  }

  // ---------------------------------------------------------------- SG vs NACL
  const NACL_IN = [
    { id: 'n90', no: 90, action: 'DENY', label: 'All traffic from 198.51.100.7/32', match: t => t.src === 'bad' },
    { id: 'n100', no: 100, action: 'ALLOW', label: 'TCP 443 from 0.0.0.0/0', match: t => t.port === '443' },
    { id: 'n110', no: 110, action: 'ALLOW', label: 'TCP 22 from 0.0.0.0/0', match: t => t.port === '22' }
  ];
  const SG_IN = [
    { id: 's443', label: 'HTTPS (443) from 0.0.0.0/0', match: t => t.port === '443' },
    { id: 's22', label: 'SSH (22) from 198.51.100.0/24 (admin network)', match: t => t.port === '22' && t.src !== 'user' }
  ];
  function renderSGNACL(root) {
    const st = { src: 'user', port: '443', on: { n90: true, n100: true, n110: false, s443: true, s22: true, out: false } };
    const check = (id, label, extra) => `<label class="chk small">
      <input type="checkbox" data-c="${id}" ${st.on[id] ? 'checked' : ''}> ${extra || ''}<span>${label}</span></label>`;
    function evaluate() {
      const t = { src: st.src, port: st.port };
      const steps = [];
      // NACL inbound: lowest rule number first, first match wins, implicit deny at the end.
      const rule = NACL_IN.filter(r => st.on[r.id]).sort((a, b) => a.no - b.no).find(r => r.match(t));
      const naclIn = rule ? rule.action === 'ALLOW' : false;
      steps.push({ name: 'Network ACL — inbound', ok: naclIn,
        why: rule ? `Rule ${rule.no} (${rule.action} ${rule.label}) is the first match. Rules are evaluated in number order and evaluation stops at the first match.` : 'No numbered rule matched, so the final * DENY rule applies.' });
      if (!naclIn) return steps;
      const sg = SG_IN.find(r => st.on[r.id] && r.match(t));
      steps.push({ name: 'Security group — inbound', ok: !!sg,
        why: sg ? `Allowed by "${sg.label}". Security groups evaluate all rules; any allow is enough.` : 'No allow rule matches. Security groups deny by default — and you cannot write deny rules in them.' });
      if (!sg) return steps;
      steps.push({ name: 'EC2 instance handles the request', ok: true, why: `Request arrives on port ${t.port}.` });
      steps.push({ name: 'Security group — return traffic', ok: true, why: 'Security groups are stateful: the response to an allowed request is allowed automatically, whatever the outbound rules say.' });
      steps.push({ name: 'Network ACL — outbound (response)', ok: st.on.out,
        why: st.on.out ? 'The ephemeral-port rule (TCP 1024–65535) lets the response leave the subnet.' : 'NACLs are stateless: the response goes to the client\'s ephemeral port (1024–65535) and needs its own outbound allow rule. Without it the client times out.' });
      return steps;
    }
    function draw() {
      const steps = evaluate();
      const success = steps.length === 5 && steps.every(s => s.ok);
      root.innerHTML = `
        <div class="grid two">
          <div class="card">
            <h3>Request</h3>
            <div class="field"><span>Source</span></div>
            ${seg('src', [['user', 'Internet user 203.0.113.10'], ['bad', 'Suspicious IP 198.51.100.7']], st.src)}
            <div class="field" style="margin-top:12px"><span>Destination port</span></div>
            ${seg('port', [['443', 'HTTPS 443'], ['22', 'SSH 22']], st.port)}
          </div>
          <div class="card">
            <h3>Security group (instance)</h3>
            <div class="small muted">Inbound allow rules — stateful</div>
            ${SG_IN.map(r => check(r.id, r.label)).join('')}
          </div>
          <div class="card">
            <h3>Network ACL (subnet)</h3>
            <div class="small muted">Inbound rules — stateless, lowest number first</div>
            ${NACL_IN.map(r => check(r.id, `${r.no} · ${r.action} · ${r.label}`)).join('')}
            <div class="small muted" style="margin:4px 0 0 26px">* · DENY · everything else</div>
            <div class="small muted" style="margin-top:10px">Outbound rules</div>
            ${check('out', '100 · ALLOW · TCP 1024–65535 to 0.0.0.0/0 (ephemeral ports)')}
            <div class="small muted" style="margin:4px 0 0 26px">* · DENY · everything else</div>
          </div>
        </div>
        <h3 style="margin-top:22px">Packet walk</h3>
        <div class="stack">${steps.map((s, i) => `<div class="explain ${s.ok ? 'ok' : 'bad'}" style="margin:0">
          <h4>${s.ok ? '✅' : '⛔'} ${i + 1}. ${s.name}</h4><p>${s.why}</p></div>`).join('')}</div>
        <div class="result-box" style="margin-top:16px"><h3>${success ? 'Connection succeeds' : 'Connection fails'}</h3>
          <p style="margin:0">${success ? 'Both layers allowed the request and the response.' : 'Change the rules above to see what it takes to let this traffic through — or keep it blocked.'}</p></div>
        <table style="margin-top:22px"><thead><tr><th></th><th>Security group</th><th>Network ACL</th></tr></thead><tbody>
          <tr><td>Applies to</td><td>Elastic network interface (instance)</td><td>Subnet</td></tr>
          <tr><td>Rules</td><td>Allow only</td><td>Allow and deny</td></tr>
          <tr><td>State</td><td>Stateful — return traffic automatic</td><td>Stateless — return traffic needs a rule</td></tr>
          <tr><td>Evaluation</td><td>All rules, any allow wins</td><td>In number order, first match wins</td></tr>
          <tr><td>Default</td><td>New SG: deny all in, allow all out</td><td>Default NACL allows all; a custom NACL denies all until you add rules</td></tr>
        </tbody></table>
        <div class="callout"><b>Exam pattern:</b> "block a specific malicious IP" → network ACL deny rule (or AWS WAF for HTTP traffic at the ALB/CloudFront). Security groups can't deny.</div>`;
      bindSeg(root, st, draw);
      $$('[data-c]', root).forEach(c => c.onchange = () => { st.on[c.dataset.c] = c.checked; draw(); });
    }
    draw();
  }

  // ---------------------------------------------------------------- Data transfer
  function renderTransfer(root) {
    const st = { tb: 100, mbps: 1000, util: 80, device: 80, ship: 7 };
    const field = (id, label, min, max, step) => `<label class="field"><span>${label}</span>
      <input type="number" id="${id}" value="${st[id]}" min="${min}" max="${max}" step="${step}"></label>`;
    root.innerHTML = `
      <div class="card">
        <div class="grid two" style="gap:0 16px">
          ${field('tb', 'Data to move (TB)', 0.1, 100000, 'any')}
          ${field('mbps', 'Network bandwidth (Mbps)', 1, 400000, 'any')}
          ${field('util', 'Bandwidth you can actually use (%)', 1, 100, 1)}
          ${field('device', 'Usable capacity per Snowball Edge device (TB)', 1, 1000, 'any')}
          ${field('ship', 'Offline round trip: ship, load, return, import (days)', 1, 60, 1)}
        </div>
        <p class="small muted" style="margin:0">Device capacity and turnaround vary by model and location — the defaults are assumptions to change, not AWS figures.</p>
      </div>
      <div id="xferOut"></div>`;
    const fmtDays = d => d < 1 ? `${(d * 24).toFixed(1)} hours` : `${d.toFixed(1)} days`;
    function update() {
      ['tb', 'mbps', 'util', 'device', 'ship'].forEach(k => { st[k] = Math.max(0, parseFloat($('#' + k, root).value) || 0); });
      const out = $('#xferOut', root);
      if (!st.tb || !st.mbps || !st.util || !st.device || !st.ship) { out.innerHTML = '<div class="callout warn">Enter a positive number in every field.</div>'; return; }
      const tbPerDay = st.mbps * 1e6 * (st.util / 100) * 86400 / 8 / 1e12;
      const onlineDays = st.tb / tbPerDay;
      const devices = Math.ceil(st.tb / st.device);
      const offlineDays = st.ship;
      const online = onlineDays <= offlineDays;
      out.innerHTML = `
        <div class="grid two" style="margin:16px 0">
          <div class="card ${online ? 'result-box' : ''}"><div class="small muted">Over the network (DataSync, S3 Transfer Acceleration, DX/VPN)</div>
            <h3>${fmtDays(onlineDays)}</h3><div class="small muted">${tbPerDay.toFixed(2)} TB/day at ${st.util}% of ${st.mbps.toLocaleString()} Mbps</div></div>
          <div class="card ${online ? '' : 'result-box'}"><div class="small muted">Offline (AWS Snowball Edge)</div>
            <h3>≈ ${fmtDays(offlineDays)}</h3><div class="small muted">${devices} device${devices > 1 ? 's' : ''} of ${st.device} TB, loaded in parallel</div></div>
        </div>
        <div class="callout"><b>${online ? 'Use the network.' : 'Ship it with Snowball Edge.'}</b> ${online
          ? 'Online transfer finishes before an offline round trip would. AWS DataSync handles scheduling, encryption, integrity checks and incremental syncs.'
          : 'The link would take longer than shipping devices. Load Snowball Edge devices for the bulk copy, then use DataSync over the network to catch up on changes made during transit.'}</div>
        <div class="callout warn"><b>Rule of thumb:</b> 1 Gbps fully used moves about 10.8 TB per day. Bandwidth used for migration competes with production traffic, so exam scenarios that say "must not affect existing traffic" push you to offline transfer or a dedicated connection.</div>`;
    }
    $$('input', root).forEach(i => i.oninput = update);
    update();
  }

  window.Tools = {
    list: [
      { id: 'dr', name: 'DR strategy explorer', icon: '🛟', blurb: 'Move the RTO and RPO sliders to see which disaster-recovery strategy fits — and what it costs.', render: renderDR },
      { id: 's3', name: 'S3 storage class picker', icon: '🪣', blurb: 'Answer three questions to pick the right S3 storage class, with a full comparison table.', render: renderS3 },
      { id: 'cidr', name: 'VPC subnet calculator', icon: '🧮', blurb: 'Carve a VPC CIDR into subnets and see usable IPs after AWS\'s 5 reserved addresses.', render: renderCIDR },
      { id: 'db', name: 'Database chooser', icon: '🗄️', blurb: 'Walk a decision tree to the purpose-built AWS database for a scenario.', render: renderDB },
      { id: 'ec2', name: 'EC2 pricing advisor', icon: '💸', blurb: 'On-Demand, Savings Plans, Reserved, Spot or Dedicated? Describe the workload and find out.', render: renderEC2 },
      { id: 'sgnacl', name: 'Security group vs NACL', icon: '🛡️', blurb: 'Toggle firewall rules and watch a packet walk through the network ACL and security group — both ways.', render: renderSGNACL },
      { id: 'transfer', name: 'Data transfer calculator', icon: '🚚', blurb: 'How long will it take to move your data to AWS — over the wire or on Snowball Edge devices?', render: renderTransfer },
      { id: 'r53', name: 'Route 53 routing game', icon: '🧭', blurb: 'Match real exam-style requirements to the right Route 53 routing policy.', render: renderR53 }
    ]
  };
})();
