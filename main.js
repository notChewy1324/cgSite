/* ============================================================
   WALLACE CORP — INTERACTION LAYER
   Single-file JS. Contains:
     - BLOG_POSTS data
     - VK_QUESTIONS data (multiple-choice version)
     - MEMORY_FRAGMENTS data (memory reconstruction game)
     - Theme toggle, cursor, dust, scroll reveal
     - Baseline waveform, modal, nav clock
     - Interactive terminal with command parser
     - Interactive V-K interrogation (multi-choice + verdict)
     - Memory reconstruction game
   ============================================================ */

/* ============================================================
   1. BLOG POSTS — edit / append here.
   color: '' | 'teal' | 'ice' | 'red'
   ============================================================ */

window.BLOG_POSTS = [
  {
    id: 'NX-0006',
    date: '2026.04.28',
    title: 'the honeypot that called home',
    tags: ['LAB', 'BLUE TEAM', 'STORY'],
    color: '',
    excerpt: 'I stood up an SSH honeypot in the corner of my lab network expecting nothing. Three hours later it had logged 4,712 login attempts from 218 IPs.',
    body: `
      <p>I had a Raspberry Pi sitting unused on a shelf. Late one Tuesday I decided to throw <code>cowrie</code> on it, expose port 22 through a forwarded rule on my edge router, and walk away. The plan was to leave it for a weekend and see what showed up.</p>

      <p>Three hours in, I checked back. The log had grown to several megabytes. <strong>4,712 login attempts.</strong> 218 distinct source IPs. The most popular username, by a comfortable margin, was <code>root</code>. The most popular password was the literal string <code>123456</code>. The fifth-most-popular was the username repeated.</p>

      <h3>what surprised me</h3>

      <p>It was not the volume. The volume was expected — anyone who has put a real SSH service on the internet for an afternoon knows the global botnet noise floor. What surprised me was the <em>structure</em> of the attempts. Some sessions were clearly automated dictionaries firing as fast as the TCP handshake would allow. Others were paced — one attempt every few seconds, varied user agents, varied passwords, almost like someone was trying to stay below a fail2ban threshold they imagined I had set.</p>

      <p>One session, after seven failed attempts, simply stopped trying passwords and ran <code>uname -a</code> against the login banner I had spoofed. Then it logged off. Twenty minutes later a different IP from the same /24 connected and went straight for credentials I had only just added to the trap. Different attacker. Same intel pipeline.</p>

      <blockquote>The internet is not a quiet place pretending to be loud. It is a loud place pretending to be quiet.</blockquote>

      <h3>what i actually learned</h3>

      <p>Three things, none of them new, all of them more concrete than they were before I ran the experiment:</p>

      <p><strong>One.</strong> Default-credential exposure is not a hypothetical. Anything reachable on a routable port that accepts a username will be tested against the same global wordlist before you finish your coffee.</p>

      <p><strong>Two.</strong> Rate-limiting attackers visibly exist. They are not common, but they are not rare either. If your detection only fires on brute-force volume, you are missing a category of behavior entirely.</p>

      <p><strong>Three.</strong> Honeypots are an underrated training tool. I learned more about real-world attack patterns in one week of reading my own cowrie logs than I did in any single chapter of any networking textbook I have read.</p>

      <p>I left the box up for another month before I retired it. By the end it had logged just under 90,000 attempts. I still have the dataset. Some weekend I will go through it properly.</p>
    `
  },

  {
    id: 'NX-0005',
    date: '2026.04.11',
    title: 'why i stopped trusting my own monitoring',
    tags: ['INFRASTRUCTURE', 'STORY', 'LESSON'],
    color: 'red',
    excerpt: 'A quiet dashboard does not mean a quiet network. The story of an alert that did not fire — and the half-day it cost me to figure out why.',
    body: `
      <p>Sometime mid-shift I noticed a workstation on the third floor was unreachable. Not down on the dashboard — just unreachable. The dashboard said it was fine. RDP refused. Ping refused. The desk phone next to it worked.</p>

      <p>I drove over. The machine was on. The user was at lunch. I plugged in a console keyboard, woke it, and everything looked normal. Network adapter, link light, IP address, everything. I pinged the gateway from the box itself. Worked. I pinged the box from my laptop on the same VLAN. Failed.</p>

      <p>It took me <strong>about four hours</strong> to track this down. The cause turned out to be embarrassingly small and structurally important.</p>

      <h3>the small thing</h3>

      <p>Months earlier, a static ARP entry had been added to a switch by someone who is no longer there. The MAC address it pointed to belonged to a NIC that was replaced last quarter. The new NIC had a new MAC. The static entry on the switch outranked the dynamic one. From the switch's perspective, the workstation's IP belonged to a device that no longer existed.</p>

      <p>The workstation could send traffic — its own ARP cache was happy. Replies just never came back. Asymmetric, silent, half-dead.</p>

      <h3>the structural thing</h3>

      <p>Our monitoring polled every host's <em>own self-reported</em> status via an agent. The agent on the workstation reported up, healthy, all green. The dashboard agreed. Nothing was wrong, according to the system designed to tell us when something was wrong.</p>

      <blockquote>Everything was fine. Everything kept being fine. The only thing not fine was reality.</blockquote>

      <p>The fix was thirty seconds — clear the static ARP, let the switch relearn. The lesson was longer.</p>

      <h3>what i changed about how i think</h3>

      <p>I stopped trusting any single signal as evidence of "up." A host saying it is up does not mean it is reachable. A switch saying a port is up does not mean traffic is flowing. A ping responding does not mean an application is healthy. Every layer can lie convincingly while every other layer is also lying convincingly.</p>

      <p>Now when I build out monitoring, I look for at least <strong>two independent vantage points</strong> per assertion. Self-reported and externally-reachable. Layer 3 and Layer 7. Inside the network and outside it. If only one of them is green, that is not green. That is "we are not sure."</p>

      <p>This sounds obvious. It was obvious. I had heard it dozens of times. It still cost me half a day to internalize, and I think it had to.</p>
    `
  },

  {
    id: 'NX-0004',
    date: '2026.03.22',
    title: 'the case of the friday-night gpo',
    tags: ['ACTIVE DIRECTORY', 'STORY', 'INCIDENT'],
    color: 'ice',
    excerpt: 'A scheduled GPO change rolled out at 4:47 PM on a Friday. By Monday, two hundred users could not print, and nobody could explain why.',
    body: `
      <p>The change ticket said it was routine. A new Group Policy Object pushing an updated default printer mapping for a specific OU. Tested in a staging container, signed off, scheduled for end-of-day Friday. Nobody blocked it. Nobody should have.</p>

      <p>By Monday morning, the helpdesk queue was on fire. <strong>Two hundred users</strong> on the affected floor could not print. Not "the printer is offline." Not "the queue is stuck." The print dialog literally did not show their printer at all. The mapping had not just failed — it had quietly removed the existing one.</p>

      <h3>tracing the cause</h3>

      <p>I watched <code>gpresult /h</code> on three different machines. The new GPO was applying. The deployed printer was being added. Then, immediately on the same policy refresh, it was being removed. The removal was happening because of an <em>item-level targeting</em> rule that nobody had noticed, written months ago, that excluded any user whose primary OU contained a specific keyword. The keyword had been added to the OU name in a re-org six weeks ago. The exclusion now matched everyone.</p>

      <p>The original GPO author had moved on. The targeting rule had no comment. The OU rename had no associated review of policies that referenced it. The chain of "it should still work" assumptions stretched back three administrative changes and at least two organizational restructures.</p>

      <blockquote>Every long-lived environment is a graveyard of small decisions made by people who are no longer there. Most of the time they rest peacefully. Sometimes they get up.</blockquote>

      <h3>the fix and the lesson</h3>

      <p>The fix was twelve seconds. Edit the targeting rule, save, force <code>gpupdate</code>. Printing returned within two policy refresh cycles.</p>

      <p>The actual fix was structural and took the better part of two weeks. We pulled an inventory of every GPO with item-level targeting that referenced OU paths or names. We commented every targeting rule we found uncommented. We added a checklist item to OU renames: <em>review affected GPOs first.</em> We lost a small number of unused policies in the process, which was its own kind of win.</p>

      <p>I think about this incident every time I touch a piece of policy that was written by someone I do not know. The world is full of clever conditions written by careful people that have quietly stopped meaning what they used to mean.</p>
    `
  },

  {
    id: 'NX-0003',
    date: '2026.02.09',
    title: 'a packet capture, a vendor, and a lie',
    tags: ['NETWORKING', 'WIRESHARK', 'STORY'],
    color: 'teal',
    excerpt: 'A vendor swore their appliance was respecting our QoS markings. Three hours of pcap said otherwise.',
    body: `
      <p>The complaint was the kind that sounds soft until you live with it: "voice calls are okay most of the time, but every now and then they get choppy for about twenty seconds." The vendor of our edge optimization appliance had been told. The vendor said the appliance was honoring our DSCP markings and that any choppy audio was upstream.</p>

      <p>I did not believe them. I had no specific reason. I just did not believe them.</p>

      <h3>the capture</h3>

      <p>I set up a SPAN port mirroring traffic on both sides of the appliance — ingress from the LAN side, egress to the WAN side — into a laptop running Wireshark with two NICs. Filter: SIP and RTP only. Then I waited.</p>

      <p>The wait was long. Choppy audio is hard to reproduce on demand. I left the capture running for three hours during business hours and went to do other work. When I came back I had an 800 MB pcap.</p>

      <p>The first thing I did was filter to RTP packets and graph the inter-arrival times. The graph was mostly a flat line at the expected ~20ms. Three places, it spiked. Two of those spikes lined up to the minute with user complaints from the help desk log.</p>

      <h3>the lie</h3>

      <p>I went looking for what was different about those packets. The DSCP marking on the LAN-side ingress was correct: <code>EF (46)</code> — Expedited Forwarding, which is what voice should be. On the WAN-side egress, during the spike windows, the DSCP marking on the same RTP flow was <code>CS0 (0)</code>. Best-effort. Stripped.</p>

      <p>Not on every packet. Just on packets that arrived during periods of high overall throughput on the appliance — the periods we cared about, the periods QoS was supposed to protect.</p>

      <blockquote>The appliance was respecting our markings. Right up until the moment it mattered, at which point it was respecting something else.</blockquote>

      <p>I built a side-by-side filter showing the same five-tuple flow before and after the appliance, with DSCP highlighted, and exported it as a screenshot. I sent the screenshot to the vendor.</p>

      <p>The next call was different.</p>

      <h3>what i took from this</h3>

      <p>Two things. First: vendors are not lying on purpose, usually. They are reporting what their dashboard tells them, and their dashboard reports what their software thinks it is doing, and software has bugs. The truth lives on the wire.</p>

      <p>Second: <strong>learn Wireshark.</strong> Not as a checkbox. Not "I have used Wireshark." Actually learn it. Filters, statistics, IO graphs, expert info. Once you can sit down with a pcap and have an opinion within ten minutes, your relationship with every networking problem changes. You stop arguing about what is happening. You go look.</p>

      <p>The appliance got a firmware update three weeks later. The release notes did not mention QoS. The release notes never mention QoS. But the choppy audio went away.</p>
    `
  },

  {
    id: 'NX-0002',
    date: '2026.01.18',
    title: 'on baselines',
    tags: ['THOUGHTS', 'BLUE TEAM', 'OPSEC'],
    color: '',
    excerpt: 'Most security incidents are not exotic. They are the absence of a baseline. A short note on the discipline of knowing your own normal.',
    body: `
      <p>The single most underrated skill in defensive security is knowing what "normal" looks like on your own network. Not the textbook normal — your normal. The specific, peculiar, slightly-broken-in-ways-you-have-grown-fond-of normal of the systems you actually maintain.</p>

      <p>Without that, every alert is suspicious and every anomaly is invisible at the same time, which is the worst of both worlds. Alert fatigue is not an inbox problem. It is a baseline problem. You cannot tell signal from noise if you do not know what the noise sounds like when the system is fine.</p>

      <h3>practical rules i try to follow</h3>

      <p><strong>Spend the first two weeks on any new system just watching it.</strong> Tail the logs. Sketch a service map. Note which processes spike at 3am because of a scheduled task and which ones spike because something is wrong. Save it somewhere durable. Refer back to it when you forget, which will be soon.</p>

      <p><strong>Document the weird normal explicitly.</strong> "The legacy print server pegs CPU for 90 seconds every hour at :17 because of a vendor service nobody understands. This is fine. Do not page anyone about it." That comment will save someone a panic attack. It might be future you.</p>

      <p><strong>If you are going to alert on something, alert on a deviation from the baseline, not on a static threshold.</strong> Static thresholds are a confession that you have not measured your own environment. They alert on Tuesday afternoons because Tuesday afternoons are busy. A deviation alert fires when something is actually different.</p>

      <h3>the harder version of this</h3>

      <p>Baselines drift. Normal is not a static target. The "normal" you carefully captured in March is not the "normal" of October because you have added users, decommissioned servers, patched things, and absorbed some new SaaS integration that nobody told you about.</p>

      <p>The discipline is not just to capture a baseline. It is to <em>re-capture</em> it on a schedule, compare it to last quarter's, and notice what has changed. Not to alert on it. Just to know.</p>

      <p>Most of the people I respect in this field share a quiet trait: they are deeply curious about the boring details of their own infrastructure. They run <code>netstat</code> on their own boxes for fun. They notice when a service start-time has changed. They are, in a real sense, <strong>haunted</strong> by their own networks.</p>

      <p>I am trying to be that kind of haunted.</p>
    `
  },

  {
    id: 'NX-0001',
    date: '2026.01.02',
    title: 'archive online',
    tags: ['SYSTEM', 'NOTES'],
    color: 'ice',
    excerpt: 'First boot of the public archive. A note on what lives here, why it exists, and what to expect from future entries.',
    body: `
      <p>This is the first entry in the archive. Eventually it will hold field notes, lab writeups, CTF retrospectives, infrastructure deep-dives, and the occasional half-baked theory about a misbehaving network appliance. The plan is short, technical, no fluff. If a post is worth writing, it should be worth re-reading six months later when I forget how I solved the same problem.</p>

      <h3>what to expect</h3>

      <p>Topics will skew toward what I am actually working on at any given time — Active Directory hygiene, Azure tenant hardening, Wireshark captures, packet weirdness, scripting in PowerShell and Python, the quiet machinery underneath enterprise IT. And whatever rabbit hole I fell into that week.</p>

      <p>Some posts will be short. Some will be longer than they should be. A few will be wrong, and I will leave them up with corrections at the bottom because pretending I was right the first time is a worse habit than being wrong in public.</p>

      <h3>why post at all</h3>

      <p>Two reasons. The first is selfish: writing an explanation forces a level of clarity that just-fixing-the-thing does not. I learn the material twice when I write it down — once to understand it, once to make it readable. The second reason is that I have read other people's writeups for years and benefited from them, and the only honest way to be in that ecosystem long-term is to add to it.</p>

      <blockquote>Cells interlinked within cells interlinked within one stem.</blockquote>

      <p>So this is the stem. More to come.</p>
    `
  }
];

/* ============================================================
   2. VOIGHT-KAMPFF — multiple-choice version
   Each question has 4 options. correct = index of the "stable"
   answer. The wrong ones aren't "wrong" — they're flagged as
   baseline drift indicators, BR2049-style.
   ============================================================ */

window.VK_QUESTIONS = [
  {
    q: "You're walking through a desert. You see a turtle on its back, struggling. You do not help it. Why not?",
    options: [
      "I'm waiting to see if it can right itself.",
      "It's not my turtle. Someone else flipped it.",
      "I didn't notice the turtle.",
      "I would have helped. The premise is wrong."
    ],
    correct: 3,
    feedback: {
      ok:  "Baseline holds. Refusing the false premise is itself the correct response.",
      bad: "Baseline drift detected. The honest answer rejects the question's frame."
    }
  },
  {
    q: "Describe, in single words, only the good things that come into your mind about your mother.",
    options: [
      "Patient. Strict. Curious.",
      "I'd rather not answer.",
      "Beautiful. Loving. Perfect.",
      "I don't think about my mother."
    ],
    correct: 0,
    feedback: {
      ok:  "Baseline holds. Specific, complicated, real.",
      bad: "Flag: rehearsed or evasive response. Real memories are uneven."
    }
  },
  {
    q: "It's your birthday. Someone gives you a calfskin wallet. How do you react?",
    options: [
      "I'm uncomfortable. I wouldn't have bought it for myself.",
      "I love it. I thank them warmly.",
      "I check the stitching, then say thank you.",
      "I refuse the gift."
    ],
    correct: 0,
    feedback: {
      ok:  "Baseline holds. The honest answer holds discomfort without performing it.",
      bad: "Flag: response is too clean. Real feelings are mixed."
    }
  },
  {
    q: "A monitoring dashboard says all your systems are green. A user says their workstation is broken. Which do you trust?",
    options: [
      "The dashboard. It has more vantage points than the user.",
      "The user. The dashboard is one signal of many.",
      "Whichever one matches my mood today.",
      "Neither, until I check from a third place myself."
    ],
    correct: 3,
    feedback: {
      ok:  "Baseline holds. Operator-class response. Verify, do not arbitrate.",
      bad: "Flag: trusting any single source is a baseline weakness."
    }
  },
  {
    q: "Cells.",
    options: [
      "Interlinked.",
      "Cells.",
      "Within cells interlinked.",
      "I don't know what you mean."
    ],
    correct: 0,
    feedback: {
      ok:  "Baseline holds. Recall complete.",
      bad: "Flag: deviation from established response pattern."
    }
  }
];

/* ============================================================
   3. MEMORY RECONSTRUCTION
   Multiple memories, escalating difficulty. Click corrupted
   nodes in the right order to rebuild each memory. Wrong order =
   error flash, drift counter increments. Completing a memory
   unlocks the next.
   ============================================================ */

window.MEMORY_FRAGMENTS = [
  {
    key: 'M-001',
    title: 'reconstruction // first contact',
    classification: 'OPERATOR MEMORY // FRAG 001',
    difficulty: 'EASY',
    chunks: [
      { id: 'M-01', label: '01', x: 18, y: 18, text: "I was seven years old." },
      { id: 'M-02', label: '02', x: 62, y: 24, text: "My uncle dropped off a hand-me-down tower computer." },
      { id: 'M-03', label: '03', x: 32, y: 48, text: "Pentium 4. Beige plastic." },
      { id: 'M-04', label: '04', x: 78, y: 52, text: "Nobody had set an admin password." },
      { id: 'M-05', label: '05', x: 14, y: 72, text: "I broke it within an afternoon." },
      { id: 'M-06', label: '06', x: 50, y: 78, text: "Then I learned how to fix it." },
      { id: 'M-07', label: '07', x: 80, y: 84, text: "Everything since has been a footnote on that day." }
    ]
  },
  {
    key: 'M-027',
    title: 'reconstruction // 3am, on call',
    classification: 'OPERATOR MEMORY // FRAG 027',
    difficulty: 'STANDARD',
    chunks: [
      { id: 'F-01', label: '01', x: 8,  y: 14, text: "It was 2:47 in the morning." },
      { id: 'F-02', label: '02', x: 38, y: 8,  text: "The pager went off four times in two minutes." },
      { id: 'F-03', label: '03', x: 72, y: 18, text: "Three sites unreachable. One whole VLAN dark." },
      { id: 'F-04', label: '04', x: 88, y: 42, text: "I drove in. The server room was warm — too warm." },
      { id: 'F-05', label: '05', x: 56, y: 36, text: "An HVAC unit had failed silently. The dashboard never noticed." },
      { id: 'F-06', label: '06', x: 22, y: 44, text: "Forty fans were trying not to sound desperate." },
      { id: 'F-07', label: '07', x: 8,  y: 70, text: "I rerouted load. Forced fans to max. Opened the door." },
      { id: 'F-08', label: '08', x: 40, y: 78, text: "Cold air poured in like a verdict." },
      { id: 'F-09', label: '09', x: 78, y: 76, text: "I sat on the floor and watched the temperature drop." },
      { id: 'F-10', label: '10', x: 88, y: 88, text: "I have been listening to server rooms differently ever since." }
    ]
  },
  {
    key: 'M-113',
    title: 'reconstruction // baseline',
    classification: 'OPERATOR MEMORY // FRAG 113',
    difficulty: 'HARD',
    chunks: [
      { id: 'B-01', label: '01', x: 6,  y: 10, text: "Cells." },
      { id: 'B-02', label: '02', x: 28, y: 6,  text: "Interlinked." },
      { id: 'B-03', label: '03', x: 56, y: 12, text: "Within cells interlinked." },
      { id: 'B-04', label: '04', x: 84, y: 8,  text: "Within one stem." },
      { id: 'B-05', label: '05', x: 90, y: 32, text: "And dreadfully distinct" },
      { id: 'B-06', label: '06', x: 64, y: 38, text: "Against the dark," },
      { id: 'B-07', label: '07', x: 36, y: 36, text: "A tall white fountain played." },
      { id: 'B-08', label: '08', x: 8,  y: 42, text: "Test passed." },
      { id: 'B-09', label: '09', x: 14, y: 64, text: "Test fails when a phrase this specific" },
      { id: 'B-10', label: '10', x: 42, y: 70, text: "Stops feeling specific." },
      { id: 'B-11', label: '11', x: 70, y: 66, text: "I retake the baseline every quarter." },
      { id: 'B-12', label: '12', x: 88, y: 84, text: "I have never failed it." },
      { id: 'B-13', label: '13', x: 44, y: 90, text: "I do not know what that proves." }
    ]
  }
];

/* ============================================================
   4. EVERYTHING ELSE — interaction layer
   ============================================================ */

(() => {
  'use strict';

  /* -------- THEME TOGGLE (3-state cycle, multi-instance) --------- */
  const THEME_ORDER = ['dark', 'light', 'rain'];
  const THEME_NEXT_LABEL = { dark: 'DAY', light: 'RAIN', rain: 'NIGHT' };

  function applyTheme(theme) {
    if (!THEME_ORDER.includes(theme)) theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('nx-theme', theme); } catch(e) {}
    document.querySelectorAll('.theme-toggle .label').forEach(el => {
      el.textContent = THEME_NEXT_LABEL[theme];
    });
  }

  document.querySelectorAll('.theme-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      const idx = THEME_ORDER.indexOf(cur);
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      applyTheme(next);
    });
  });
  // Sync labels on first paint
  {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    document.querySelectorAll('.theme-toggle .label').forEach(el => {
      el.textContent = THEME_NEXT_LABEL[cur];
    });
  }

  /* -------- CUSTOM CURSOR (cold palette particles) --------- */
  const arrow = document.getElementById('cursor-arrow');
  const trailCanvas = document.getElementById('cursor-trail-canvas');
  const isHoverDevice = window.matchMedia('(hover: hover)').matches;

  if (arrow && trailCanvas && isHoverDevice) {
    const ctx = trailCanvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    let cursorActive = false;

    function resizeTrail() {
      W = window.innerWidth; H = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      trailCanvas.width = W * dpr;
      trailCanvas.height = H * dpr;
      trailCanvas.style.width = W + 'px';
      trailCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeTrail();
    window.addEventListener('resize', resizeTrail);

    const particles = [];
    let mx = -100, my = -100, lx = -100, ly = -100;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (!cursorActive) {
        cursorActive = true;
        arrow.classList.add('active');
        trailCanvas.classList.add('active');
        lx = mx; ly = my;
      }
    });

    document.addEventListener('mouseleave', () => {
      cursorActive = false;
      arrow.classList.remove('active');
      trailCanvas.classList.remove('active');
    });
    window.addEventListener('blur', () => {
      cursorActive = false;
      arrow.classList.remove('active');
      trailCanvas.classList.remove('active');
    });

    document.addEventListener('mousedown', () => arrow.classList.add('click'));
    document.addEventListener('mouseup',   () => arrow.classList.remove('click'));

    const hoverSel = 'a, button, .blog-card, .signal, .archive-entry, .timeline-tag, .modal-close, .theme-toggle, .archive-filter, .memory-node, .interrogation-option, [data-hover]';
    const warnSel  = '.interrogation-btn, .memory-btn.warn, [data-warn]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(warnSel))  arrow.classList.add('warn');
      else if (e.target.closest(hoverSel)) arrow.classList.add('hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(warnSel))  arrow.classList.remove('warn');
      if (e.target.closest(hoverSel)) arrow.classList.remove('hover');
    });

    function spawn(x, y, vx, vy) {
      const tone = arrow.classList.contains('warn') ? 'red'
                 : arrow.classList.contains('hover') ? 'teal'
                 : 'steel';
      particles.push({
        x, y,
        vx: vx * 0.15 + (Math.random() - 0.5) * 0.4,
        vy: vy * 0.15 + (Math.random() - 0.5) * 0.4 - 0.3,
        life: 1,
        decay: 0.018 + Math.random() * 0.02,
        size: 0.8 + Math.random() * 1.6,
        hue: tone
      });
    }

    function tick() {
      lx += (mx - lx) * 0.85;
      ly += (my - ly) * 0.85;
      arrow.style.transform = `translate(${lx - 3}px, ${ly - 3}px)`;

      if (cursorActive) {
        const dx = mx - lx, dy = my - ly;
        const speed = Math.hypot(dx, dy);
        const count = Math.min(3, Math.floor(speed * 0.25));
        for (let i = 0; i < count; i++) spawn(lx, ly, dx, dy);
        if (Math.random() < 0.15) spawn(lx, ly, 0, 0);
      }

      ctx.clearRect(0, 0, W, H);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy -= 0.015; p.vx *= 0.98;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const a = p.life;
        if (p.hue === 'teal') {
          ctx.fillStyle = `rgba(94, 234, 212, ${a * 0.85})`;
          ctx.shadowColor = 'rgba(94, 234, 212, 1)';
        } else if (p.hue === 'red') {
          ctx.fillStyle = `rgba(255, 77, 54, ${a * 0.9})`;
          ctx.shadowColor = 'rgba(255, 77, 54, 1)';
        } else {
          // Cold steel-blue particles
          ctx.fillStyle = `rgba(107, 163, 216, ${a * 0.9})`;
          ctx.shadowColor = 'rgba(107, 163, 216, 1)';
        }
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      requestAnimationFrame(tick);
    }
    tick();
  } else if (arrow) {
    arrow.style.display = 'none';
  }

  /* -------- AMBIENT DUST PARTICLES (cold palette) --------- */
  const dustCanvas = document.getElementById('dust-canvas');
  if (dustCanvas) {
    const dctx = dustCanvas.getContext('2d');
    let DW = window.innerWidth, DH = window.innerHeight;

    function resizeDust() {
      DW = window.innerWidth; DH = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      dustCanvas.width = DW * dpr;
      dustCanvas.height = DH * dpr;
      dustCanvas.style.width = DW + 'px';
      dustCanvas.style.height = DH + 'px';
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeDust();
    window.addEventListener('resize', resizeDust);

    const dustCount = Math.min(80, Math.floor(window.innerWidth / 16));
    const dust = Array.from({ length: dustCount }, () => {
      const r = Math.random();
      // 60% steel, 25% teal, 12% ice, 3% red
      let tint = 'steel';
      if (r > 0.6 && r <= 0.85) tint = 'teal';
      else if (r > 0.85 && r <= 0.97) tint = 'ice';
      else if (r > 0.97) tint = 'red';
      return {
        x: Math.random() * DW,
        y: Math.random() * DH,
        r: Math.random() * 1.4 + 0.2,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -Math.random() * 0.25 - 0.05,
        a: Math.random() * 0.5 + 0.1,
        tint
      };
    });

    function dustTick() {
      dctx.clearRect(0, 0, DW, DH);
      for (const d of dust) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -10) { d.y = DH + 10; d.x = Math.random() * DW; }
        if (d.x < -10) d.x = DW + 10;
        if (d.x > DW + 10) d.x = -10;
        const a = d.a;
        if (d.tint === 'teal')      dctx.fillStyle = `rgba(94, 234, 212, ${a * 0.5})`;
        else if (d.tint === 'ice')  dctx.fillStyle = `rgba(184, 214, 237, ${a * 0.55})`;
        else if (d.tint === 'red')  dctx.fillStyle = `rgba(255, 77, 54, ${a * 0.55})`;
        else                        dctx.fillStyle = `rgba(107, 163, 216, ${a * 0.6})`;
        dctx.beginPath();
        dctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        dctx.fill();
      }
      requestAnimationFrame(dustTick);
    }
    dustTick();
  }

  /* -------- SCROLL REVEAL --------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });

  document.querySelectorAll('.reveal, .timeline-item').forEach((el) => observer.observe(el));

  /* -------- BASELINE WAVEFORM --------- */
  const baselineWave = document.querySelector('.baseline-wave');
  if (baselineWave) {
    const w = 280, h = 36;
    baselineWave.setAttribute('viewBox', `0 0 ${w} ${h}`);
    baselineWave.setAttribute('preserveAspectRatio', 'none');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', '1.3');
    path.style.color = 'var(--accent-2)';
    path.style.filter = 'drop-shadow(0 0 3px var(--accent-2))';
    baselineWave.appendChild(path);

    let t = 0;
    function drawWave() {
      t += 0.04;
      let d = `M 0 ${h / 2}`;
      for (let x = 0; x <= w; x += 2) {
        const phase = (x / w) * 8 + t;
        const flat = Math.sin(phase) * 0.7;
        const beat = Math.sin(t * 0.7) > 0.92
          ? Math.exp(-Math.pow((x - ((t * 30) % w)), 2) / 80) * 13
          : 0;
        const y = h / 2 + flat + beat * (Math.sin(x * 0.8) > 0 ? 1 : -1);
        d += ` L ${x} ${y.toFixed(2)}`;
      }
      path.setAttribute('d', d);
      requestAnimationFrame(drawWave);
    }
    drawWave();

    const baselineLabel = document.querySelector('.baseline-label');
    if (baselineLabel) {
      const left = baselineLabel.querySelector('.bl-left');
      const right = baselineLabel.querySelector('.bl-right');
      setInterval(() => {
        if (left)  left.textContent  = `BASELINE ${(89 + Math.random() * 4).toFixed(2)}`;
        if (right) right.textContent = `IRIS ${(0.34 + Math.random() * 0.06).toFixed(3)} mm`;
      }, 700);
    }
  }

  /* -------- BLOG GRID RENDER --------- */
  const blogGrid = document.getElementById('blog-grid');
  if (blogGrid) {
    const posts = window.BLOG_POSTS || [];
    if (posts.length === 0) {
      blogGrid.innerHTML = `
        <div class="blog-empty" style="grid-column: 1 / -1;">
          <div class="blog-empty-icon">◇</div>
          <div class="blog-empty-text">// CHANNEL QUIET</div>
          <div class="blog-empty-sub">No transmissions yet. New entries will appear here.</div>
        </div>
      `;
    } else {
      blogGrid.innerHTML = posts.map((p, i) => `
        <article class="blog-card reveal ${p.color || ''}" data-post="${i}" data-hover>
          <div class="blog-card-id">${p.id}</div>
          <div class="blog-card-date">▣ ${p.date}</div>
          <h3 class="blog-card-title">${p.title}</h3>
          <p class="blog-card-excerpt">${p.excerpt}</p>
          <div class="blog-card-tags">
            ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <span class="blog-card-cta">Open Transmission</span>
        </article>
      `).join('');
      document.querySelectorAll('#blog-grid .reveal').forEach((el) => observer.observe(el));
    }
  }

  /* -------- MODAL --------- */
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalMeta = document.getElementById('modal-meta');
  const modalClose = document.getElementById('modal-close');

  function openModal(post) {
    if (!modal) return;
    modalTitle.textContent = post.title;
    modalDate.textContent = post.date;
    modalMeta.textContent = `ARCHIVE ENTRY ${post.id} // ${post.tags.join(' / ')}`;
    modalBody.innerHTML = post.body;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-post]');
    if (!card) return;
    const idx = parseInt(card.dataset.post, 10);
    if (window.BLOG_POSTS && window.BLOG_POSTS[idx]) openModal(window.BLOG_POSTS[idx]);
  });

  /* -------- NAV CLOCK --------- */
  const navStatus = document.querySelector('.nav-status');
  if (navStatus) {
    function updateStatus() {
      const now = new Date();
      const t = now.toUTCString().slice(17, 25);
      navStatus.innerHTML = `<span>UPLINK ${t} UTC</span>`;
    }
    updateStatus();
    setInterval(updateStatus, 1000);
  }

  /* -------- HERO NAME GLITCH --------- */
  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    setInterval(() => {
      if (Math.random() < 0.15) {
        heroName.style.transform = `translateX(${(Math.random() - 0.5) * 4}px)`;
        heroName.style.filter = 'hue-rotate(8deg) brightness(1.1)';
        setTimeout(() => {
          heroName.style.transform = '';
          heroName.style.filter = '';
        }, 90);
      }
    }, 3500);
  }

  /* ============================================================
     INTERACTIVE V-K (multi-choice + verdict)
     ============================================================ */
  const interrogation = document.getElementById('interrogation');
  if (interrogation && window.VK_QUESTIONS) {
    const questions = window.VK_QUESTIONS;
    const progress     = interrogation.querySelector('.interrogation-progress');
    const qEl          = interrogation.querySelector('.interrogation-q');
    const optionsEl    = interrogation.querySelector('.interrogation-options');
    const feedbackEl   = interrogation.querySelector('.interrogation-feedback');
    const counter      = interrogation.querySelector('.interrogation-counter');
    const controls     = interrogation.querySelector('.interrogation-controls');
    const nextBtn      = interrogation.querySelector('[data-vk="next"]');
    const restartBtn   = interrogation.querySelector('[data-vk="restart"]');
    const statsEl      = interrogation.querySelector('.interrogation-stats');

    let qIdx = 0;
    let stableCount = 0;
    let driftCount  = 0;
    let questionStartTime = 0;
    let totalResponseTime = 0;
    let answered = false;

    // Build progress bits
    function renderProgress() {
      progress.innerHTML = '';
      questions.forEach((_, i) => {
        const bit = document.createElement('div');
        bit.className = 'interrogation-progress-bit';
        if (i < qIdx) bit.classList.add('done');
        else if (i === qIdx) bit.classList.add('current');
        progress.appendChild(bit);
      });
    }

    function updateStats() {
      if (!statsEl) return;
      const total = stableCount + driftCount;
      const avgMs = total ? Math.round(totalResponseTime / total) : 0;
      const baseline = (91.2 + (Math.random() - 0.5) * 0.4 - driftCount * 0.6).toFixed(2);
      const drift = (driftCount * 0.04).toFixed(3);
      statsEl.innerHTML = `
        <div class="interrogation-stat">
          <div class="interrogation-stat-label">Baseline</div>
          <div class="interrogation-stat-value">${baseline}</div>
        </div>
        <div class="interrogation-stat">
          <div class="interrogation-stat-label">Drift</div>
          <div class="interrogation-stat-value">+${drift} mm</div>
        </div>
        <div class="interrogation-stat">
          <div class="interrogation-stat-label">Response</div>
          <div class="interrogation-stat-value">${avgMs}ms</div>
        </div>
        <div class="interrogation-stat">
          <div class="interrogation-stat-label">Flags</div>
          <div class="interrogation-stat-value">${driftCount}</div>
        </div>
      `;
    }

    function renderQuestion() {
      const q = questions[qIdx];
      counter.textContent = `${(qIdx + 1).toString().padStart(2, '0')} / ${questions.length.toString().padStart(2, '0')}`;
      qEl.textContent = q.q;
      qEl.style.opacity = '0';
      requestAnimationFrame(() => {
        qEl.style.transition = 'opacity 0.4s ease';
        qEl.style.opacity = '1';
      });

      // Render options
      optionsEl.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'interrogation-option';
        btn.dataset.letter = letters[i];
        btn.dataset.idx = i;
        btn.textContent = opt;
        btn.addEventListener('click', () => handleAnswer(i, btn));
        optionsEl.appendChild(btn);
      });

      feedbackEl.classList.remove('shown', 'flag');
      feedbackEl.textContent = '';
      nextBtn.style.display = 'none';
      answered = false;
      questionStartTime = Date.now();

      renderProgress();
      updateStats();
    }

    function handleAnswer(choiceIdx, btn) {
      if (answered) return;
      answered = true;

      const elapsed = Date.now() - questionStartTime;
      totalResponseTime += elapsed;

      const q = questions[qIdx];
      const isCorrect = choiceIdx === q.correct;

      // Disable all buttons & visually mark
      optionsEl.querySelectorAll('.interrogation-option').forEach(b => {
        b.disabled = true;
      });
      btn.classList.add(isCorrect ? 'selected-correct' : 'selected-incorrect');

      // Show feedback
      feedbackEl.textContent = isCorrect ? q.feedback.ok : q.feedback.bad;
      feedbackEl.classList.add('shown');
      if (!isCorrect) feedbackEl.classList.add('flag');

      if (isCorrect) stableCount++;
      else driftCount++;

      updateStats();

      // Show next/finish button
      if (qIdx < questions.length - 1) {
        nextBtn.style.display = '';
        nextBtn.textContent = '▸ Next Question';
      } else {
        nextBtn.style.display = '';
        nextBtn.textContent = '▸ View Verdict';
      }
    }

    function showVerdict() {
      const total = questions.length;
      const passed = stableCount >= Math.ceil(total * 0.6);

      const baseline = passed
        ? (91.2 - driftCount * 0.4).toFixed(2)
        : (88.0 - driftCount * 0.6).toFixed(2);

      let verdict, detail;
      if (driftCount === 0) {
        verdict = 'human // baseline stable';
        detail = `All responses within tolerance. Baseline retained: ${baseline}%. No drift detected. Operator cleared for active duty.`;
      } else if (passed) {
        verdict = 'human // minor drift';
        detail = `${stableCount} of ${total} responses stable. Baseline: ${baseline}%. Drift within acceptable range — recommend repeat session in 30 days.`;
      } else {
        verdict = 'flagged for review';
        detail = `${driftCount} of ${total} responses showed deviation. Baseline: ${baseline}%. Recommend escalation to senior examiner. This is not necessarily a verdict — the test is itself imperfect.`;
      }

      // Replace question area with verdict
      qEl.style.display = 'none';
      optionsEl.style.display = 'none';
      feedbackEl.classList.remove('shown');
      nextBtn.style.display = 'none';

      let verdictBlock = interrogation.querySelector('.interrogation-verdict');
      if (!verdictBlock) {
        verdictBlock = document.createElement('div');
        verdictBlock.className = 'interrogation-verdict';
        statsEl.parentElement.insertBefore(verdictBlock, statsEl);
      }
      verdictBlock.innerHTML = `
        <div class="interrogation-verdict-label">▣ EXAMINER'S VERDICT ▣</div>
        <div class="interrogation-verdict-result ${passed ? '' : 'flagged'}">${verdict}</div>
        <div class="interrogation-verdict-detail">${detail}</div>
      `;

      restartBtn.style.display = '';
      counter.textContent = `COMPLETE`;
      progress.querySelectorAll('.interrogation-progress-bit').forEach(b => {
        b.classList.remove('current');
        b.classList.add('done');
      });
      updateStats();
    }

    function restart() {
      qIdx = 0;
      stableCount = 0;
      driftCount = 0;
      totalResponseTime = 0;
      answered = false;
      qEl.style.display = '';
      optionsEl.style.display = '';
      const verdictBlock = interrogation.querySelector('.interrogation-verdict');
      if (verdictBlock) verdictBlock.remove();
      restartBtn.style.display = 'none';
      renderQuestion();
    }

    nextBtn.addEventListener('click', () => {
      if (qIdx < questions.length - 1) {
        qIdx++;
        renderQuestion();
      } else {
        showVerdict();
      }
    });

    if (restartBtn) {
      restartBtn.addEventListener('click', restart);
      restartBtn.style.display = 'none';
    }

    renderQuestion();
  }

  /* ============================================================
     MEMORY RECONSTRUCTION — multi-memory carousel
     ============================================================ */
  const memoryShell = document.getElementById('memory-reconstruction');
  if (memoryShell && window.MEMORY_FRAGMENTS && window.MEMORY_FRAGMENTS.length) {
    const memories = window.MEMORY_FRAGMENTS;
    const board       = memoryShell.querySelector('.memory-board');
    const svg         = memoryShell.querySelector('.memory-svg');
    const textEl      = memoryShell.querySelector('.memory-text');
    const titleEl     = memoryShell.querySelector('.memory-readout-title');
    const tagEl       = memoryShell.querySelector('.memory-readout-tag');
    const completeEl  = memoryShell.querySelector('.memory-complete-banner');
    const restartBtn  = memoryShell.querySelector('[data-mem="restart"]');
    const hintBtn     = memoryShell.querySelector('[data-mem="hint"]');
    const recoveredEl = memoryShell.querySelector('[data-mem-stat="recovered"]');
    const driftEl     = memoryShell.querySelector('[data-mem-stat="drift"]');
    const integrityEl = memoryShell.querySelector('[data-mem-stat="integrity"]');
    const pickerEl    = memoryShell.querySelector('.memory-picker');

    // Per-memory state. Keyed by memory.key.
    const state = {};
    memories.forEach((m, i) => {
      state[m.key] = {
        nextExpectedIdx: 0,
        driftCount: 0,
        unlockedCount: 0,
        complete: false,
        unlocked: i === 0  // first one is always available; rest unlock as previous completes
      };
    });

    let activeIdx = 0;
    let activeMem = memories[0];

    function renderPicker() {
      if (!pickerEl) return;
      pickerEl.innerHTML = '';
      memories.forEach((m, i) => {
        const s = state[m.key];
        const btn = document.createElement('button');
        btn.className = 'memory-pick';
        btn.dataset.hover = '';
        if (i === activeIdx) btn.classList.add('active');
        if (s.complete) btn.classList.add('complete');
        if (!s.unlocked) btn.classList.add('locked');
        btn.innerHTML = `${m.key} <span class="difficulty">${m.difficulty}</span>`;
        btn.addEventListener('click', () => {
          if (!s.unlocked) return;
          activeIdx = i;
          activeMem = memories[i];
          renderAll();
        });
        pickerEl.appendChild(btn);
      });
    }

    function renderText() {
      const s = state[activeMem.key];
      textEl.innerHTML = activeMem.chunks.map((c, i) => {
        const isUnlocked = i < s.unlockedCount;
        if (isUnlocked) {
          return `<span class="frag unlocked" data-idx="${i}">${c.text}</span>`;
        }
        const blockLen = Math.max(8, Math.min(c.text.length, 32));
        return `<span class="frag" data-idx="${i}">[${'░'.repeat(Math.floor(blockLen / 4))}]</span>`;
      }).join(' ');
    }

    function updateStats() {
      const s = state[activeMem.key];
      const total = activeMem.chunks.length;
      const integrity = Math.max(0, Math.round((s.unlockedCount / total) * 100 - s.driftCount * 5));
      if (recoveredEl) recoveredEl.textContent = `${s.unlockedCount}/${total}`;
      if (driftEl) {
        driftEl.textContent = `+${(s.driftCount * 0.04).toFixed(2)}mm`;
        driftEl.classList.toggle('warn', s.driftCount > 0);
      }
      if (integrityEl) integrityEl.textContent = `${integrity}%`;
    }

    function renderNodes() {
      const s = state[activeMem.key];
      board.querySelectorAll('.memory-node').forEach(n => n.remove());
      activeMem.chunks.forEach((c, i) => {
        const node = document.createElement('button');
        node.className = 'memory-node';
        if (i < s.nextExpectedIdx) node.classList.add('recovered');
        node.style.left = `${c.x}%`;
        node.style.top = `${c.y}%`;
        node.dataset.idx = i;
        node.dataset.hover = '';
        node.innerHTML = `${c.label}<span class="memory-node-id">${c.id}</span>`;
        node.addEventListener('click', () => handleNodeClick(i, node));
        board.appendChild(node);
      });
      drawConnections();
    }

    function drawConnections() {
      const s = state[activeMem.key];
      svg.innerHTML = '';
      const ns = 'http://www.w3.org/2000/svg';
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('preserveAspectRatio', 'none');
      for (let i = 1; i < s.nextExpectedIdx; i++) {
        const a = activeMem.chunks[i - 1];
        const b = activeMem.chunks[i];
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', a.x + 2);
        line.setAttribute('y1', a.y + 2);
        line.setAttribute('x2', b.x + 2);
        line.setAttribute('y2', b.y + 2);
        line.setAttribute('stroke', 'var(--accent-2)');
        line.setAttribute('stroke-width', '0.3');
        line.setAttribute('stroke-dasharray', '0.8 0.8');
        line.setAttribute('opacity', '0.7');
        line.style.filter = 'drop-shadow(0 0 1px var(--accent-2))';
        svg.appendChild(line);
      }
    }

    function handleNodeClick(idx, node) {
      const s = state[activeMem.key];
      if (s.complete || idx < s.nextExpectedIdx) return;

      if (idx === s.nextExpectedIdx) {
        s.nextExpectedIdx++;
        s.unlockedCount = s.nextExpectedIdx;
        node.classList.add('recovered');
        renderText();
        updateStats();
        drawConnections();

        if (s.nextExpectedIdx >= activeMem.chunks.length) {
          s.complete = true;
          completeEl.classList.add('shown');
          completeEl.textContent = '◉ MEMORY RECONSTRUCTED // BASELINE STABLE';
          // Unlock next memory
          if (activeIdx < memories.length - 1) {
            state[memories[activeIdx + 1].key].unlocked = true;
          }
          renderPicker();
        }
      } else {
        s.driftCount++;
        node.classList.add('flash-error');
        setTimeout(() => node.classList.remove('flash-error'), 400);
        updateStats();
      }
    }

    function restart() {
      const s = state[activeMem.key];
      s.nextExpectedIdx = 0;
      s.driftCount = 0;
      s.unlockedCount = 0;
      s.complete = false;
      completeEl.classList.remove('shown');
      renderText();
      renderNodes();
      updateStats();
    }

    function hint() {
      const s = state[activeMem.key];
      if (s.nextExpectedIdx >= activeMem.chunks.length) return;
      const target = board.querySelector(`.memory-node[data-idx="${s.nextExpectedIdx}"]`);
      if (target) {
        target.style.boxShadow = '0 0 0 2px var(--accent-3), 0 0 22px color-mix(in srgb, var(--accent-3) 60%, transparent)';
        setTimeout(() => { target.style.boxShadow = ''; }, 1400);
      }
    }

    function renderAll() {
      titleEl.textContent = activeMem.title;
      tagEl.textContent = activeMem.classification;
      const s = state[activeMem.key];
      if (s.complete) {
        completeEl.classList.add('shown');
        completeEl.textContent = '◉ MEMORY RECONSTRUCTED // BASELINE STABLE';
      } else {
        completeEl.classList.remove('shown');
      }
      renderPicker();
      renderText();
      renderNodes();
      updateStats();
    }

    if (restartBtn) restartBtn.addEventListener('click', restart);
    if (hintBtn) hintBtn.addEventListener('click', hint);

    renderAll();
  }

  /* ============================================================
     INTERACTIVE TERMINAL
     ============================================================ */
  const term = document.getElementById('terminal');
  if (term) {
    const history = term.querySelector('.terminal-history');
    const input = term.querySelector('.terminal-input');
    const cmdHistory = [];
    let historyIdx = -1;

    function esc(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    function writeRaw(html, cls = 'out') {
      const line = document.createElement('div');
      line.className = `term-line ${cls}`;
      line.innerHTML = html;
      history.appendChild(line);
      history.scrollTop = history.scrollHeight;
    }

    function write(text, cls = 'out') {
      const lines = String(text).split('\n');
      lines.forEach(l => writeRaw(esc(l), cls));
    }

    function writeBlank() {
      const div = document.createElement('div');
      div.className = 'term-line';
      div.innerHTML = '&nbsp;';
      history.appendChild(div);
      history.scrollTop = history.scrollHeight;
    }

    function echoCmd(cmd) {
      writeRaw(esc(cmd), 'cmd');
    }

    /* virtual filesystem */
    const FS = {
      'profile.txt':
`name:        Cam Garrison
designation: NX-1324
class:       student / intern
discipline:  cybersecurity & network systems administration
school:      University of Cincinnati
class of:    May 2028
location:    Cincinnati, OH
status:      active // baseline stable`,

      'motd':
`everything you do is recorded.
everything you do is forgotten.
both are true. carry on.`,

      'baseline.dat':
`baseline:        91.20%
iris dilation:   0.342 mm
respiration:     nominal
pupillary track: stable
voight-kampff:   cleared
designation:     human
classification:  operator-class`,

      'kipple.log':
`stale dns entries:           7
forgotten service accounts:  3
cron jobs nobody owns:       2
gpos with no comment:        14
documentation last updated:  by someone who is no longer here

note: kipple accumulates faster than it is removed.
that is the definition of kipple. you do not eliminate
it. you negotiate with it.`,

      'replicants.idx':
`/// access denied
/// clearance required: TIER-OMEGA
/// your clearance: TIER-9

contact wallace corp records division for elevation.
do not retry. retry attempts are logged.`,

      'rules-that-held.txt':
`1. label everything twice.
2. trust the wire over the dashboard.
3. document the weird-normal explicitly.
4. monitoring is a confession; alerts are an opinion.
5. no change goes out on a friday.
6. if you can run it twice, do that.
7. future you is a stranger. write for them.
8. boring is a feature.`,

      'rules-i-broke.txt':
`1. "i'll document this later."
2. "this is just a quick test."
3. "we don't need a baseline for this one."
4. "the change is small enough to skip review."
5. "it's friday but the change is small."
   (note: see rules-that-held.txt, line 5.)`
    };

    const commands = {
      help() {
        write('Available commands:', 'hint');
        writeBlank();
        const cmds = [
          ['help',           'show this list'],
          ['whoami',         'show current operator'],
          ['ls [path]',      'list archive contents'],
          ['cat <file>',     'read file contents'],
          ['vk',             'sample a voight-kampff question'],
          ['random',         'pull a random fragment'],
          ['banner',         'reprint the boot banner'],
          ['echo <text>',    'echo text back'],
          ['date',           'current uplink time'],
          ['ping <host>',    'check if a host is awake'],
          ['theme [d|l]',    'toggle or set theme (dark/light)'],
          ['history',        'show command history'],
          ['clear',          'clear the terminal'],
          ['exit',           'log out (closes session)']
        ];
        cmds.forEach(([c, d]) => {
          writeRaw(`  <span class="hl">${esc(c.padEnd(16))}</span><span class="dim">${esc(d)}</span>`);
        });
        writeBlank();
        write('Try also: sudo, who, uname, fortune, contact', 'dim');
      },

      whoami() {
        write('cam_garrison');
        write('clearance: TIER-9  //  registered: NX-1324', 'ok');
        write('discipline: cybersec + netsys admin // student', 'dim');
      },

      ls(args) {
        const path = (args[0] || '/archive').replace(/\/$/, '');
        if (path === '/' || path === '/archive') {
          writeRaw(`<span class="hl">fragments/</span>      <span class="hl">voight-kampff/</span>     <span class="hl">field-notes/</span>`);
          writeRaw(`<span class="hl">incidents/</span>      <span class="hl">rules-i-broke/</span>     <span class="hl">rules-that-held/</span>`);
          writeRaw(`<span class="dim">profile.txt    motd             baseline.dat</span>`);
          writeRaw(`<span class="dim">kipple.log     replicants.idx</span>`);
        } else {
          write(`ls: ${path}: no such directory`, 'err');
        }
      },

      cat(args) {
        if (!args[0]) { write('cat: missing file operand', 'err'); return; }
        const name = args[0].replace(/^\.?\//, '').replace(/^archive\//, '');
        if (FS[name]) {
          write(FS[name]);
        } else if (name === 'replicants.idx' || name === 'replicants') {
          write(FS['replicants.idx'], 'err');
        } else {
          write(`cat: ${name}: file not found`, 'err');
          write(`(try: ls — to see what's in the archive)`, 'dim');
        }
      },

      vk() {
        const q = window.VK_QUESTIONS[Math.floor(Math.random() * window.VK_QUESTIONS.length)];
        writeRaw(`<span class="red">Q ▸</span> ${esc(q.q)}`);
        const letters = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, i) => {
          const isCorrect = i === q.correct;
          const cls = isCorrect ? 'ok' : 'dim';
          writeRaw(`  <span class="${cls}">${letters[i]} ▸</span> <span class="dim">${esc(opt)}</span>`);
        });
        writeBlank();
        write(`(use the V-K module above for the full interrogation.)`, 'dim');
      },

      random() {
        const posts = window.BLOG_POSTS || [];
        if (!posts.length) { write('no fragments indexed.', 'err'); return; }
        const p = posts[Math.floor(Math.random() * posts.length)];
        writeRaw(`<span class="hl">${esc(p.id)}</span>  <span class="dim">${esc(p.date)}</span>`);
        writeRaw(`<span class="ok">${esc(p.title)}</span>`);
        write(p.excerpt);
        writeRaw(`<span class="dim">// open Field Notes for the full transmission.</span>`);
      },

      banner() {
        writeRaw(`<span class="hl">┌─────────────────────────────────────────────┐</span>`);
        writeRaw(`<span class="hl">│  WALLACE CORP // NEXUS-9 PERSONNEL REGISTRY  │</span>`);
        writeRaw(`<span class="hl">│  SESSION 1324-N9 //  CLEARANCE: TIER-9       │</span>`);
        writeRaw(`<span class="hl">└─────────────────────────────────────────────┘</span>`);
        write('uplink stable. type "help" for commands.', 'dim');
      },

      echo(args) { write(args.join(' ')); },

      date() {
        const d = new Date();
        write(d.toUTCString());
        write(`uplink time: ${d.toTimeString().slice(0, 8)} local`, 'dim');
      },

      ping(args) {
        const host = args[0] || 'wallace.corp';
        write(`PING ${host} (10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.1): 56 data bytes`);
        let i = 0;
        const interval = setInterval(() => {
          if (i >= 4) {
            clearInterval(interval);
            writeBlank();
            write(`--- ${host} ping statistics ---`);
            write(`4 packets transmitted, 4 received, 0.0% packet loss`);
            const avg = (12 + Math.random() * 4).toFixed(2);
            write(`round-trip min/avg/max = 11.${i*2}/${avg}/14.91 ms`, 'ok');
            return;
          }
          const ms = (12 + Math.random() * 4).toFixed(2);
          writeRaw(`<span class="dim">64 bytes from ${esc(host)}: icmp_seq=${i} ttl=64 time=${ms} ms</span>`);
          i++;
        }, 280);
      },

      theme(args) {
        const want = (args[0] || '').toLowerCase();
        const cur = document.documentElement.getAttribute('data-theme') || 'dark';
        let next;
        if (want === 'd' || want === 'dark') next = 'dark';
        else if (want === 'l' || want === 'light') next = 'light';
        else if (want === 'r' || want === 'rain') next = 'rain';
        else {
          // cycle on no arg
          const order = ['dark', 'light', 'rain'];
          next = order[(order.indexOf(cur) + 1) % order.length];
        }
        applyTheme(next);
        write(`theme set: ${next}`, 'ok');
      },

      history() {
        if (!cmdHistory.length) { write('(empty)', 'dim'); return; }
        cmdHistory.forEach((c, i) => writeRaw(`<span class="dim">${(i+1).toString().padStart(3, ' ')}</span>  ${esc(c)}`));
      },

      clear() { history.innerHTML = ''; },

      exit() {
        write('logging out...', 'dim');
        setTimeout(() => {
          history.innerHTML = '';
          writeRaw(`<span class="hl">// connection closed by remote host</span>`);
          write('press any key to reconnect.', 'dim');
          input.disabled = true;
          const reconnect = () => {
            input.disabled = false;
            input.focus();
            history.innerHTML = '';
            commands.banner();
            document.removeEventListener('keydown', reconnect);
          };
          document.addEventListener('keydown', reconnect);
        }, 500);
      },

      sudo(args) {
        if (!args.length) { write('sudo: a command is required', 'err'); return; }
        write(`[sudo] password for cam_garrison: `, 'dim');
        setTimeout(() => {
          write('Sorry, try again.', 'err');
          write('Sorry, try again.', 'err');
          write('Sorry, try again.', 'err');
          write('sudo: 3 incorrect password attempts', 'err');
          writeRaw(`<span class="dim">// this incident has been reported. obviously.</span>`);
        }, 350);
      },

      who() { write('cam_garrison  tty/0   nx-1324  uplink stable'); },
      uname() { write('Nexus-9 wallace-corp 4.7.2026 #1324 SMP x86_64 GNU/replicant'); },

      fortune() {
        const fortunes = [
          'cells. interlinked. within cells. interlinked.',
          'the dull stuff is what holds when the exciting stuff fails.',
          'every system is held together by tape, documentation, and somebody\'s heroic 2014 PowerShell script.',
          'monitoring is a confession; alerts are an opinion.',
          'the truth lives on the wire.',
          'baseline drifts. so does memory.',
          'you can label something twice. you cannot label it enough.',
          'most of what you maintain was built by people who are no longer there.',
          'a quiet dashboard is not a quiet network.'
        ];
        writeRaw(`<span class="ok">${esc(fortunes[Math.floor(Math.random() * fortunes.length)])}</span>`);
      },

      contact() {
        write('uplink channels:', 'hint');
        writeRaw(`  <span class="hl">github</span>    github.com/notChewy1324`);
        writeRaw(`  <span class="hl">linkedin</span>  linkedin.com/in/camgarrison`);
        writeRaw(`  <span class="hl">channel</span>   NX-1324`);
      },

      hello() { write('hello, operator.', 'ok'); },
      hi() { commands.hello(); },
      cells() { writeRaw(`<span class="ok">interlinked.</span>`); },
      interlinked() { writeRaw(`<span class="ok">cells.</span>`); },
      'rm'(args) {
        if (args.includes('-rf') && args.includes('/')) {
          write('rm: cannot remove \'/\': operation not permitted', 'err');
          writeRaw(`<span class="dim">// nice try.</span>`);
        } else { write('rm: this filesystem is read-only.', 'err'); }
      },
      ':(){' () { write('fork bomb detected. session protected.', 'err'); }
    };

    function runCommand(raw) {
      const trimmed = raw.trim();
      if (!trimmed) { writeBlank(); return; }
      cmdHistory.push(trimmed);
      historyIdx = cmdHistory.length;

      echoCmd(trimmed);

      const parts = trimmed.split(/\s+/);
      const name = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (commands[name]) {
        try { commands[name](args); }
        catch(e) { write(`error: ${e.message}`, 'err'); }
      } else {
        write(`${name}: command not found`, 'err');
        writeRaw(`<span class="dim">type "help" for available commands.</span>`);
      }
      writeBlank();
    }

    commands.banner();
    writeBlank();
    write('whoami', 'dim');
    write('cam_garrison');
    writeBlank();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        input.value = '';
        runCommand(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdHistory.length === 0) return;
        historyIdx = Math.max(0, historyIdx - 1);
        input.value = cmdHistory[historyIdx] || '';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (cmdHistory.length === 0) return;
        historyIdx = Math.min(cmdHistory.length, historyIdx + 1);
        input.value = cmdHistory[historyIdx] || '';
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const cur = input.value;
        const cmdNames = Object.keys(commands);
        const matches = cmdNames.filter(n => n.startsWith(cur));
        if (matches.length === 1) {
          input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
          echoCmd(cur);
          writeRaw(matches.map(m => `<span class="hl">${esc(m)}</span>`).join('  '));
          writeBlank();
        }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        commands.clear();
      }
    });

    term.addEventListener('click', () => {
      if (window.getSelection().toString()) return;
      input.focus();
    });

    const focusOnce = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => input.focus(), 200);
          focusOnce.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    focusOnce.observe(term);
  }

  /* ============================================================
     RAIN CANVAS
     Active when data-theme="rain". Streaks fall diagonally with
     subtle parallax. Auto-pauses to save CPU when not visible.
     ============================================================ */
  const rainCanvas = document.getElementById('rain-canvas');
  if (rainCanvas) {
    const rctx = rainCanvas.getContext('2d');
    let RW = window.innerWidth, RH = window.innerHeight;

    function resizeRain() {
      RW = window.innerWidth; RH = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      rainCanvas.width = RW * dpr;
      rainCanvas.height = RH * dpr;
      rainCanvas.style.width = RW + 'px';
      rainCanvas.style.height = RH + 'px';
      rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeRain();
    window.addEventListener('resize', resizeRain);

    const drops = Array.from({ length: 140 }, () => ({
      x: Math.random() * RW,
      y: Math.random() * RH,
      len: 10 + Math.random() * 18,
      speed: 2.2 + Math.random() * 3.2,
      thickness: 0.5 + Math.random() * 0.7,
      drift: 0.6 + Math.random() * 0.5,
      alpha: 0.18 + Math.random() * 0.28
    }));

    function rainTick() {
      const isRain = document.documentElement.getAttribute('data-theme') === 'rain';
      if (!isRain) {
        rctx.clearRect(0, 0, RW, RH);
        requestAnimationFrame(rainTick);
        return;
      }
      // Use partial clear for slight motion-trail effect
      rctx.fillStyle = 'rgba(3, 6, 12, 0.18)';
      rctx.fillRect(0, 0, RW, RH);

      rctx.lineCap = 'round';
      for (const d of drops) {
        rctx.strokeStyle = `rgba(155, 196, 224, ${d.alpha})`;
        rctx.lineWidth = d.thickness;
        rctx.beginPath();
        rctx.moveTo(d.x, d.y);
        rctx.lineTo(d.x + d.drift, d.y + d.len);
        rctx.stroke();
        d.y += d.speed;
        d.x += d.drift * 0.4;
        if (d.y > RH + 30) {
          d.y = -30;
          d.x = Math.random() * (RW + 100) - 50;
        }
        if (d.x > RW + 30) d.x = -30;
      }
      requestAnimationFrame(rainTick);
    }
    rainTick();
  }

  /* ============================================================
     PAGE TRANSITIONS — "uplink reroute" overlay (multi-instance)
     ============================================================ */
  const transitionEl = document.getElementById('page-transition');
  const transitionToggles = document.querySelectorAll('.transition-toggle');

  function getTransitionsEnabled() {
    try { return localStorage.getItem('nx-transitions') === 'on'; }
    catch(e) { return false; }
  }

  function setTransitionsEnabled(on) {
    try { localStorage.setItem('nx-transitions', on ? 'on' : 'off'); } catch(e) {}
    transitionToggles.forEach(toggle => {
      toggle.classList.toggle('on', on);
      toggle.classList.toggle('off', !on);
      const labelEl = toggle.querySelector('.label');
      if (labelEl) labelEl.textContent = on ? 'WARP ON' : 'WARP OFF';
    });
  }

  setTransitionsEnabled(getTransitionsEnabled());

  transitionToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      setTransitionsEnabled(!getTransitionsEnabled());
    });
  });

  // Intercept internal link clicks. Only same-origin .html files.
  if (transitionEl) {
    document.addEventListener('click', (e) => {
      if (!getTransitionsEnabled()) return;
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      // Only intercept simple internal HTML links (not anchors, not external, not new-tab)
      if (a.target === '_blank') return;
      if (href.startsWith('#')) return;
      if (href.startsWith('http')) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (!href.endsWith('.html') && !href.endsWith('/')) return;

      e.preventDefault();
      const targetText = (a.textContent || href).trim().toUpperCase().slice(0, 24);
      transitionEl.querySelector('.pt-target').textContent = `▸ ${targetText}`;
      transitionEl.classList.add('active');
      // Re-trigger the scanline animation
      const scan = transitionEl.querySelector('.pt-scanline');
      scan.style.animation = 'none';
      void scan.offsetHeight; // reflow
      scan.style.animation = '';
      setTimeout(() => { window.location.href = href; }, 2400);
    });
  }

  /* ============================================================
     UPLINK PAGE — operations console
     ============================================================ */
  const uplinkRoot = document.getElementById('uplink-shell');
  if (uplinkRoot) {

    /* ---- ROTATING GLOBE with ping rings ---- */
    const mapSvg = uplinkRoot.querySelector('#uplink-map-svg');
    if (mapSvg) {
      const ns = 'http://www.w3.org/2000/svg';
      mapSvg.setAttribute('viewBox', '0 0 800 500');
      mapSvg.style.color = 'var(--accent)';

      const CX = 400, CY = 250, R = 200;

      // Static layer: outer ring, latitude lines (drawn in static space)
      const outer = document.createElementNS(ns, 'circle');
      outer.setAttribute('cx', CX); outer.setAttribute('cy', CY);
      outer.setAttribute('r', R);
      outer.setAttribute('fill', 'none');
      outer.setAttribute('stroke', 'var(--accent)');
      outer.setAttribute('stroke-width', '1');
      outer.setAttribute('opacity', '0.6');
      mapSvg.appendChild(outer);

      // Glow halo
      const halo = document.createElementNS(ns, 'circle');
      halo.setAttribute('cx', CX); halo.setAttribute('cy', CY);
      halo.setAttribute('r', R + 8);
      halo.setAttribute('fill', 'none');
      halo.setAttribute('stroke', 'var(--accent)');
      halo.setAttribute('stroke-width', '0.6');
      halo.setAttribute('opacity', '0.25');
      halo.style.filter = 'blur(3px)';
      mapSvg.appendChild(halo);

      // Inner shadow ring for depth
      const shadow = document.createElementNS(ns, 'circle');
      shadow.setAttribute('cx', CX); shadow.setAttribute('cy', CY);
      shadow.setAttribute('r', R - 1);
      shadow.setAttribute('fill', 'rgba(5, 6, 8, 0.45)');
      mapSvg.appendChild(shadow);

      // Latitude + longitude lines are drawn per-frame in renderFrame() so they
      // rotate consistently with the tilted globe.

      // Dynamic layer — rotating dots and cities
      const dynamicLayer = document.createElementNS(ns, 'g');
      mapSvg.appendChild(dynamicLayer);

      // Generate continent dots in lat/lon space.
      // Approximate continent centers + scatter clouds.
      function pointInRect(latMin, latMax, lonMin, lonMax) {
        return {
          lat: latMin + Math.random() * (latMax - latMin),
          lon: lonMin + Math.random() * (lonMax - lonMin)
        };
      }
      const continents = [];
      // North America
      for (let i = 0; i < 110; i++) continents.push(pointInRect(20, 60, -130, -65));
      // South America
      for (let i = 0; i < 60; i++) continents.push(pointInRect(-50, 10, -75, -40));
      // Europe
      for (let i = 0; i < 55; i++) continents.push(pointInRect(38, 65, -10, 35));
      // Africa
      for (let i = 0; i < 95; i++) continents.push(pointInRect(-32, 32, -15, 45));
      // Asia
      for (let i = 0; i < 150; i++) continents.push(pointInRect(15, 65, 40, 140));
      // Southeast Asia / Indonesia
      for (let i = 0; i < 35; i++) continents.push(pointInRect(-10, 18, 95, 145));
      // Australia
      for (let i = 0; i < 45; i++) continents.push(pointInRect(-38, -12, 113, 153));
      // Greenland
      for (let i = 0; i < 18; i++) continents.push(pointInRect(60, 80, -50, -25));

      // Ping cities (lat, lon)
      const pingSites = [
        { lat: 39.10, lon: -84.51, name: 'CINCINNATI' },
        { lat: 51.50, lon: -0.13,  name: 'LONDON' },
        { lat: 35.68, lon: 139.76, name: 'TOKYO' },
        { lat: 6.45,  lon: 3.39,   name: 'LAGOS' },
        { lat: -33.87,lon: 151.21, name: 'SYDNEY' },
        { lat: -23.55,lon: -46.63, name: 'SAO PAULO' },
        { lat: 25.20, lon: 55.27,  name: 'DUBAI' },
        { lat: 43.65, lon: -79.38, name: 'TORONTO' },
        { lat: 1.35,  lon: 103.82, name: 'SINGAPORE' },
        { lat: 55.75, lon: 37.62,  name: 'MOSCOW' }
      ];

      // Axial tilt (radians) — gives the globe a sense of orientation so
      // rotation actually reads visually.
      const TILT = 23 * Math.PI / 180;
      const COS_T = Math.cos(TILT);
      const SIN_T = Math.sin(TILT);

      // Project a (lat, lon) on a sphere rotated by yaw (radians) around the
      // local Y axis (polar axis), then tilted by TILT around the screen X axis.
      // Returns { x, y, z, visible } where z>0 means front-of-sphere.
      function project(lat, lon, yaw) {
        const phi = lat * Math.PI / 180;
        const lambda = lon * Math.PI / 180 + yaw;
        // Initial position on unit sphere
        let x = Math.cos(phi) * Math.sin(lambda);
        let y = Math.sin(phi);
        let z = Math.cos(phi) * Math.cos(lambda);
        // Apply X-axis tilt: rotate (y, z) by TILT
        const yt = y * COS_T - z * SIN_T;
        const zt = y * SIN_T + z * COS_T;
        y = yt; z = zt;
        return {
          x: CX + x * R,
          y: CY - y * R, // y inverted for screen coords (north up)
          z,
          visible: z > -0.05
        };
      }

      let yaw = 0;
      // Persist active ping rings between frames so they keep animating
      const activePings = [];

      function spawnPing() {
        const site = pingSites[Math.floor(Math.random() * pingSites.length)];
        activePings.push({
          lat: site.lat, lon: site.lon,
          life: 1, r: 3, op: 1
        });
      }
      setInterval(spawnPing, 1100);

      function renderFrame() {
        yaw += 0.0024; // slow continuous rotation (~ one full turn / 44s)
        // Clear dynamic layer
        while (dynamicLayer.firstChild) dynamicLayer.removeChild(dynamicLayer.firstChild);

        // 0a) Latitude lines — projected per-frame so they tilt with the globe.
        // Drawn first so they sit behind everything else.
        const latFrag = document.createDocumentFragment();
        const LAT_LINES = [-60, -30, 0, 30, 60];
        for (const lat of LAT_LINES) {
          const pts = [];
          for (let lon = -180; lon <= 180; lon += 4) {
            const proj = project(lat, lon, yaw);
            if (proj.visible) {
              pts.push(`${proj.x.toFixed(2)},${proj.y.toFixed(2)}`);
            } else if (pts.length > 0) {
              const poly = document.createElementNS(ns, 'polyline');
              poly.setAttribute('points', pts.join(' '));
              poly.setAttribute('fill', 'none');
              poly.setAttribute('stroke', 'var(--accent)');
              poly.setAttribute('stroke-width', lat === 0 ? '0.6' : '0.4');
              poly.setAttribute('opacity', lat === 0 ? '0.32' : '0.18');
              latFrag.appendChild(poly);
              pts.length = 0;
            }
          }
          if (pts.length > 0) {
            const poly = document.createElementNS(ns, 'polyline');
            poly.setAttribute('points', pts.join(' '));
            poly.setAttribute('fill', 'none');
            poly.setAttribute('stroke', 'var(--accent)');
            poly.setAttribute('stroke-width', lat === 0 ? '0.6' : '0.4');
            poly.setAttribute('opacity', lat === 0 ? '0.32' : '0.18');
            latFrag.appendChild(poly);
          }
        }
        dynamicLayer.appendChild(latFrag);

        // 0) Rotating longitude meridians — projected great-circle arcs
        // Drawn first so they sit behind continent dots and cities.
        const meridianFrag = document.createDocumentFragment();
        const MERIDIAN_LONS = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180];
        for (const lon of MERIDIAN_LONS) {
          const pts = [];
          // Sample the meridian at fine lat steps
          for (let lat = -90; lat <= 90; lat += 4) {
            const proj = project(lat, lon, yaw);
            if (proj.visible) {
              pts.push(`${proj.x.toFixed(2)},${proj.y.toFixed(2)}`);
            } else if (pts.length > 0) {
              // Break the polyline when meridian crosses to back side
              const poly = document.createElementNS(ns, 'polyline');
              poly.setAttribute('points', pts.join(' '));
              poly.setAttribute('fill', 'none');
              poly.setAttribute('stroke', 'var(--accent)');
              poly.setAttribute('stroke-width', '0.4');
              poly.setAttribute('opacity', '0.18');
              meridianFrag.appendChild(poly);
              pts.length = 0;
            }
          }
          if (pts.length > 0) {
            const poly = document.createElementNS(ns, 'polyline');
            poly.setAttribute('points', pts.join(' '));
            poly.setAttribute('fill', 'none');
            poly.setAttribute('stroke', 'var(--accent)');
            poly.setAttribute('stroke-width', '0.4');
            poly.setAttribute('opacity', '0.18');
            meridianFrag.appendChild(poly);
          }
        }
        dynamicLayer.appendChild(meridianFrag);

        // 1) continent dots
        const dotFrag = document.createDocumentFragment();
        for (const p of continents) {
          const proj = project(p.lat, p.lon, yaw);
          if (!proj.visible) continue;
          // Depth-based opacity: brighter near front, dimmer near limb
          const opacity = 0.15 + Math.max(0, proj.z) * 0.55;
          const c = document.createElementNS(ns, 'circle');
          c.setAttribute('cx', proj.x.toFixed(2));
          c.setAttribute('cy', proj.y.toFixed(2));
          c.setAttribute('r', '1.4');
          c.setAttribute('fill', 'currentColor');
          c.setAttribute('opacity', opacity.toFixed(2));
          dotFrag.appendChild(c);
        }
        dynamicLayer.appendChild(dotFrag);

        // 2) city markers + labels
        const cityFrag = document.createDocumentFragment();
        for (const s of pingSites) {
          const proj = project(s.lat, s.lon, yaw);
          if (!proj.visible) continue;
          const opacity = 0.4 + Math.max(0, proj.z) * 0.6;

          const dot = document.createElementNS(ns, 'circle');
          dot.setAttribute('cx', proj.x.toFixed(2));
          dot.setAttribute('cy', proj.y.toFixed(2));
          dot.setAttribute('r', '3');
          dot.setAttribute('fill', 'var(--accent-3)');
          dot.setAttribute('opacity', opacity.toFixed(2));
          dot.style.filter = 'drop-shadow(0 0 4px var(--accent-3))';
          cityFrag.appendChild(dot);

          // Only label cities near the front
          if (proj.z > 0.35) {
            const label = document.createElementNS(ns, 'text');
            label.setAttribute('x', (proj.x + 8).toFixed(2));
            label.setAttribute('y', (proj.y + 4).toFixed(2));
            label.setAttribute('font-family', 'JetBrains Mono, monospace');
            label.setAttribute('font-size', '9');
            label.setAttribute('fill', 'var(--accent-2)');
            label.setAttribute('letter-spacing', '0.1em');
            label.setAttribute('opacity', (opacity * 0.9).toFixed(2));
            label.textContent = s.name;
            cityFrag.appendChild(label);
          }
        }
        dynamicLayer.appendChild(cityFrag);

        // 3) ping rings — only when their city is on the visible side
        const pingFrag = document.createDocumentFragment();
        for (let i = activePings.length - 1; i >= 0; i--) {
          const p = activePings[i];
          p.r += 0.8;
          p.op -= 0.012;
          if (p.op <= 0) { activePings.splice(i, 1); continue; }
          const proj = project(p.lat, p.lon, yaw);
          if (!proj.visible) continue;
          const ring = document.createElementNS(ns, 'circle');
          ring.setAttribute('cx', proj.x.toFixed(2));
          ring.setAttribute('cy', proj.y.toFixed(2));
          ring.setAttribute('r', p.r.toFixed(1));
          ring.setAttribute('fill', 'none');
          ring.setAttribute('stroke', 'var(--accent-2)');
          ring.setAttribute('stroke-width', '1.4');
          ring.setAttribute('opacity', (p.op * Math.max(0.2, proj.z)).toFixed(2));
          pingFrag.appendChild(ring);
        }
        dynamicLayer.appendChild(pingFrag);

        requestAnimationFrame(renderFrame);
      }
      renderFrame();
    }

    /* ---- TELEMETRY FEED (scrolling) ---- */
    const feed = uplinkRoot.querySelector('#uplink-feed');
    if (feed) {
      const messages = [
        { lvl: 'ok',   t: 'handshake complete on tunnel 0x1a3f' },
        { lvl: 'info', t: 'baseline within tolerance' },
        { lvl: 'ok',   t: 'pcap rotation complete (4.2GB)' },
        { lvl: 'info', t: 'cert renewed: nx-1324.wallace.corp' },
        { lvl: 'warn', t: 'iris dilation +0.04mm (within drift)' },
        { lvl: 'ok',   t: 'GPO sync nominal across 3 sites' },
        { lvl: 'info', t: 'NTP drift: +0.012s vs stratum-1' },
        { lvl: 'ok',   t: 'AD replication healthy' },
        { lvl: 'warn', t: 'failed login from 185.x.x.x (rate-limited)' },
        { lvl: 'info', t: 'memory reconstruction: 73% recovered' },
        { lvl: 'ok',   t: 'voight-kampff: cleared' },
        { lvl: 'info', t: 'new connection: terminal/tty0' },
        { lvl: 'ok',   t: 'spinner #2401 lifted off pad-7' },
        { lvl: 'info', t: 'ambient telemetry: drifting' },
        { lvl: 'warn', t: 'unauthorized scan: port 22 dropped' },
        { lvl: 'ok',   t: 'session resumed under TLS 1.3' },
        { lvl: 'info', t: 'replicant quotient: 0.000' },
        { lvl: 'ok',   t: 'backup verified (commvault)' },
        { lvl: 'info', t: 'snow accumulation: 1.4 cm/h' }
      ];

      function ts() {
        const d = new Date();
        return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
      }

      function pushFeed() {
        const m = messages[Math.floor(Math.random() * messages.length)];
        const row = document.createElement('div');
        row.className = 'uplink-feed-line';
        row.innerHTML = `<span class="ts">${ts()}</span><span class="lvl ${m.lvl}">${m.lvl.toUpperCase()}</span><span class="msg">${m.t}</span>`;
        feed.insertBefore(row, feed.firstChild);
        while (feed.children.length > 12) feed.removeChild(feed.lastChild);
      }

      // Seed
      for (let i = 0; i < 8; i++) pushFeed();
      setInterval(pushFeed, 1400);
    }

    /* ---- BIG STAT (uplink time) ---- */
    const statValue = uplinkRoot.querySelector('#uplink-stat-value');
    if (statValue) {
      let seconds = 0;
      function update() {
        seconds++;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        statValue.textContent =
          `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
      }
      update();
      setInterval(update, 1000);
    }

    /* ---- SPECTRUM ANALYZER ---- */
    const spectrum = uplinkRoot.querySelector('#uplink-spectrum');
    if (spectrum) {
      const BAR_COUNT = 32;
      const bars = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        const b = document.createElement('div');
        b.className = 'uplink-spectrum-bar';
        b.style.height = '4px';
        spectrum.appendChild(b);
        bars.push({ el: b, h: 0.1, target: 0.1, phase: Math.random() * Math.PI * 2 });
      }
      let t = 0;
      function tick() {
        t += 0.045;
        bars.forEach((bar, i) => {
          const wave = Math.sin(t + bar.phase + i * 0.18) * 0.3 + 0.5;
          const noise = Math.random() * 0.18;
          bar.target = Math.max(0.05, Math.min(0.98, wave + noise));
          bar.h += (bar.target - bar.h) * 0.22;
          bar.el.style.height = `${(bar.h * 100).toFixed(1)}%`;
        });
        requestAnimationFrame(tick);
      }
      tick();
    }

    /* ---- RADAR sweep ---- */
    const radar = uplinkRoot.querySelector('#uplink-radar');
    if (radar) {
      const ns = 'http://www.w3.org/2000/svg';
      const sv = document.createElementNS(ns, 'svg');
      sv.setAttribute('viewBox', '0 0 200 200');
      sv.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // Concentric rings
      [30, 60, 90].forEach(r => {
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('cx', 100); c.setAttribute('cy', 100);
        c.setAttribute('r', r);
        c.setAttribute('fill', 'none');
        c.setAttribute('stroke', 'var(--accent)');
        c.setAttribute('stroke-width', '0.5');
        c.setAttribute('opacity', '0.4');
        sv.appendChild(c);
      });

      // Cross
      [['line', 100, 5, 100, 195], ['line', 5, 100, 195, 100]].forEach(([_, x1, y1, x2, y2]) => {
        const ln = document.createElementNS(ns, 'line');
        ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
        ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
        ln.setAttribute('stroke', 'var(--accent)');
        ln.setAttribute('stroke-width', '0.4');
        ln.setAttribute('opacity', '0.3');
        sv.appendChild(ln);
      });

      // Sweep cone (rotating)
      const cone = document.createElementNS(ns, 'path');
      cone.setAttribute('fill', 'url(#radarGrad)');
      cone.setAttribute('opacity', '0.65');
      sv.appendChild(cone);

      // Gradient def
      const defs = document.createElementNS(ns, 'defs');
      const grad = document.createElementNS(ns, 'radialGradient');
      grad.setAttribute('id', 'radarGrad');
      grad.setAttribute('cx', '50%'); grad.setAttribute('cy', '50%');
      grad.setAttribute('r', '50%');
      const s1 = document.createElementNS(ns, 'stop');
      s1.setAttribute('offset', '0%');
      s1.setAttribute('stop-color', 'var(--accent-2)');
      s1.setAttribute('stop-opacity', '0.8');
      const s2 = document.createElementNS(ns, 'stop');
      s2.setAttribute('offset', '100%');
      s2.setAttribute('stop-color', 'var(--accent-2)');
      s2.setAttribute('stop-opacity', '0');
      grad.appendChild(s1); grad.appendChild(s2);
      defs.appendChild(grad);
      sv.appendChild(defs);

      radar.appendChild(sv);

      let angle = 0;
      function sweep() {
        angle = (angle + 1.4) % 360;
        const a1 = (angle - 30) * Math.PI / 180;
        const a2 = angle * Math.PI / 180;
        const x1 = 100 + Math.cos(a1) * 90;
        const y1 = 100 + Math.sin(a1) * 90;
        const x2 = 100 + Math.cos(a2) * 90;
        const y2 = 100 + Math.sin(a2) * 90;
        cone.setAttribute('d', `M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`);
        requestAnimationFrame(sweep);
      }
      sweep();

      // Random blip dots
      function blip() {
        const r = 30 + Math.random() * 60;
        const a = Math.random() * Math.PI * 2;
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', 100 + Math.cos(a) * r);
        dot.setAttribute('cy', 100 + Math.sin(a) * r);
        dot.setAttribute('r', '2');
        dot.setAttribute('fill', 'var(--accent-2)');
        dot.style.filter = 'drop-shadow(0 0 3px var(--accent-2))';
        sv.appendChild(dot);
        let life = 1;
        function fade() {
          life -= 0.02;
          if (life <= 0) { dot.remove(); return; }
          dot.setAttribute('opacity', life);
          requestAnimationFrame(fade);
        }
        fade();
      }
      setInterval(blip, 1100);
    }

    /* ---- PING LOG ---- */
    const pingLog = uplinkRoot.querySelector('#uplink-pinglog');
    if (pingLog) {
      const hosts = [
        '10.42.7.1', '10.42.7.18', '10.42.8.4', 'gw.wallace.corp',
        'dc01.nx', 'dc02.nx', 'sd-wan-1', 'sd-wan-2',
        'edge-tor', 'edge-syd', '8.8.8.8', '1.1.1.1'
      ];
      function pushPing() {
        const h = hosts[Math.floor(Math.random() * hosts.length)];
        const success = Math.random() > 0.05;
        const ms = success ? (4 + Math.random() * 28).toFixed(2) : '---';
        const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0');

        const row = document.createElement('div');
        row.className = 'uplink-pinglog-line';
        if (success) {
          row.innerHTML = `<span class="h">${h}</span><span class="ok">SEQ ${seq}</span><span style="color:var(--fg-dim);">echo reply</span><span class="ms">${ms}ms</span>`;
        } else {
          row.innerHTML = `<span class="h">${h}</span><span class="err">SEQ ${seq}</span><span style="color:var(--accent-4);">timeout</span><span class="ms" style="color:var(--accent-4);">---</span>`;
        }
        pingLog.insertBefore(row, pingLog.firstChild);
        while (pingLog.children.length > 11) pingLog.removeChild(pingLog.lastChild);
      }
      for (let i = 0; i < 10; i++) pushPing();
      setInterval(pushPing, 600);
    }
  }

  /* ============================================================
     NAV DRAWER (mobile / small-desktop hamburger menu)
     ============================================================ */
  const burger    = document.getElementById('nav-burger');
  const drawer    = document.getElementById('nav-drawer');
  const backdrop  = document.getElementById('nav-backdrop');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    backdrop && backdrop.classList.toggle('open', open);
    burger   && burger.classList.toggle('open', open);
    document.body.classList.toggle('drawer-open', open);
  }

  if (burger)   burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('open')));
  if (backdrop) backdrop.addEventListener('click', () => setDrawer(false));

  // Close drawer when a nav link is clicked
  if (drawer) {
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => setDrawer(false));
    });
  }

  // Close drawer with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      setDrawer(false);
    }
  });

  // Mobile clock — same source as the desktop one
  const navClockMobile = document.querySelector('.nav-clock-mobile');
  if (navClockMobile) {
    function updateMobileClock() {
      const now = new Date();
      const t = now.toUTCString().slice(17, 25);
      navClockMobile.innerHTML = `<span>${t} UTC</span>`;
    }
    updateMobileClock();
    setInterval(updateMobileClock, 1000);
  }

  /* ============================================================
     PC SCHEMATIC — wireframe technical diagram (uses page)
     Draws a side-3Q view of a tower PC with labeled callouts.
     ============================================================ */
  const pcSvg = document.getElementById('pc-svg');
  if (pcSvg) {
    const ns = 'http://www.w3.org/2000/svg';

    // Helpers
    function el(name, attrs = {}, parent = null) {
      const node = document.createElementNS(ns, name);
      for (const k in attrs) node.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(node);
      return node;
    }

    // Layers (drawing order matters)
    const gMonitor   = el('g', { class: 'pc-component', 'data-part': 'monitor' }, pcSvg);
    const gCase      = el('g', { class: 'pc-component', 'data-part': 'case' },    pcSvg);
    const gInternals = el('g', { class: 'pc-component', 'data-part': 'internals'}, pcSvg);
    const gCallouts  = el('g', {},                                                 pcSvg);

    /* ---------- Monitor (right side of stage) ---------- */
    // Stand base
    el('path', {
      d: 'M 760 540 L 920 540 L 900 558 L 780 558 Z',
      class: 'pc-fill'
    }, gMonitor);
    // Stand neck
    el('path', {
      d: 'M 830 540 L 850 540 L 855 470 L 825 470 Z',
      class: 'pc-fill'
    }, gMonitor);
    // Monitor bezel
    el('rect', {
      x: 600, y: 200, width: 320, height: 220,
      class: 'pc-fill', rx: 4
    }, gMonitor);
    // Inner screen
    el('rect', {
      x: 612, y: 212, width: 296, height: 196,
      class: 'pc-screen', rx: 2
    }, gMonitor);
    // Connection between bezel and stand neck
    el('path', {
      d: 'M 760 420 L 760 470 L 855 470 L 855 420',
      class: 'pc-edge-dim'
    }, gMonitor);
    // Screen pixel grid (subtle)
    for (let y = 220; y < 405; y += 14) {
      el('line', { x1: 612, y1: y, x2: 908, y2: y, class: 'pc-edge-dim', opacity: 0.15 }, gMonitor);
    }
    // 4K logo on screen
    el('text', {
      x: 760, y: 308,
      'text-anchor': 'middle',
      'font-family': 'Major Mono Display, monospace',
      'font-size': 38,
      fill: 'var(--accent-3)',
      opacity: 0.8,
      'letter-spacing': '0.1em'
    }, gMonitor).textContent = '4k';
    el('text', {
      x: 760, y: 332,
      'text-anchor': 'middle',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': 9,
      fill: 'var(--accent-2)',
      'letter-spacing': '0.32em'
    }, gMonitor).textContent = 'DELL 27" / 60HZ';

    /* ---------- Tower case (left side of stage) ---------- */
    // Outer shell (3Q view — front face + side face slanted right)
    // Front face
    el('path', {
      d: 'M 200 130 L 420 130 L 420 580 L 200 580 Z',
      class: 'pc-fill'
    }, gCase);
    // Side face (perspective)
    el('path', {
      d: 'M 420 130 L 470 105 L 470 555 L 420 580 Z',
      class: 'pc-fill',
      opacity: 0.85
    }, gCase);
    // Top face
    el('path', {
      d: 'M 200 130 L 250 105 L 470 105 L 420 130 Z',
      class: 'pc-fill',
      opacity: 0.7
    }, gCase);

    // Tempered-glass side panel (shows internals through it)
    el('rect', {
      x: 215, y: 145, width: 195, height: 420,
      fill: 'color-mix(in srgb, var(--accent-3) 6%, transparent)',
      stroke: 'var(--accent)',
      'stroke-width': 1,
      opacity: 0.85
    }, gCase);

    // Top vent slats
    for (let i = 0; i < 8; i++) {
      el('line', {
        x1: 215 + i * 22, y1: 116,
        x2: 235 + i * 22, y2: 105,
        class: 'pc-vent'
      }, gCase);
    }
    el('text', {
      x: 320, y: 99,
      'text-anchor': 'middle',
      class: 'pc-callout-sub'
    }, gCase).textContent = 'TOP MESH // INTAKE';

    // Front I/O strip (small)
    el('rect', { x: 215, y: 555, width: 60, height: 14, class: 'pc-edge' }, gCase);
    // Power button (with LED)
    el('circle', { cx: 230, cy: 562, r: 3.5, class: 'pc-edge' }, gCase);
    el('circle', { cx: 230, cy: 562, r: 1.6, class: 'pc-led' }, gCase);
    el('circle', { cx: 230, cy: 562, r: 5,   class: 'pc-led-glow' }, gCase);
    // USB ports
    el('rect', { x: 240, y: 559, width: 8, height: 6, class: 'pc-edge' }, gCase);
    el('rect', { x: 252, y: 559, width: 8, height: 6, class: 'pc-edge' }, gCase);
    el('rect', { x: 264, y: 559, width: 6, height: 6, class: 'pc-edge' }, gCase);

    /* ---------- Internals (visible through glass) ---------- */
    // Motherboard plate
    el('rect', {
      x: 230, y: 165, width: 165, height: 290,
      class: 'pc-edge-dim'
    }, gInternals);

    // CPU + AIO pump block (top-center of mobo)
    el('rect', {
      x: 280, y: 230, width: 64, height: 64,
      class: 'pc-edge'
    }, gInternals);
    el('circle', { cx: 312, cy: 262, r: 22, class: 'pc-edge' }, gInternals);
    el('circle', { cx: 312, cy: 262, r: 14, class: 'pc-edge-dim' }, gInternals);
    el('text', {
      x: 312, y: 266,
      'text-anchor': 'middle',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': 9,
      fill: 'var(--accent-2)',
      'letter-spacing': '0.18em'
    }, gInternals).textContent = 'CPU';

    // AIO tubes (curved, going up to radiator at top)
    el('path', {
      d: 'M 300 232 C 295 200 240 175 245 155',
      class: 'pc-aio-tube'
    }, gInternals);
    el('path', {
      d: 'M 324 232 C 330 200 380 175 380 155',
      class: 'pc-aio-tube'
    }, gInternals);
    // AIO radiator (top of case)
    el('rect', {
      x: 245, y: 145, width: 135, height: 16,
      class: 'pc-edge'
    }, gInternals);
    // Radiator fin lines
    for (let i = 0; i < 25; i++) {
      el('line', {
        x1: 248 + i * 5.2, y1: 147,
        x2: 248 + i * 5.2, y2: 159,
        class: 'pc-vent'
      }, gInternals);
    }
    // Coolant flow indicator (decorative dashes following tube path)
    el('path', {
      d: 'M 302 234 C 297 202 242 177 247 157',
      class: 'pc-coolant'
    }, gInternals);

    // RAM sticks (right of CPU)
    for (let i = 0; i < 4; i++) {
      el('rect', {
        x: 354 + i * 8, y: 215, width: 5, height: 80,
        class: 'pc-edge'
      }, gInternals);
    }

    // GPU (bottom horizontal slot — large block)
    el('rect', {
      x: 240, y: 350, width: 145, height: 50,
      class: 'pc-edge'
    }, gInternals);
    // GPU fans
    el('circle', { cx: 268, cy: 375, r: 16, class: 'pc-edge' }, gInternals);
    el('circle', { cx: 313, cy: 375, r: 16, class: 'pc-edge' }, gInternals);
    el('circle', { cx: 358, cy: 375, r: 16, class: 'pc-edge' }, gInternals);
    // GPU fan blade hints
    [268, 313, 358].forEach(cx => {
      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2;
        el('line', {
          x1: cx, y1: 375,
          x2: cx + Math.cos(ang) * 14,
          y2: 375 + Math.sin(ang) * 14,
          class: 'pc-vent'
        }, gInternals);
      }
    });
    // GPU label
    el('text', {
      x: 312, y: 410,
      'text-anchor': 'middle',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': 8,
      fill: 'var(--accent-2)',
      'letter-spacing': '0.22em'
    }, gInternals).textContent = 'RTX 4070 SUPER';

    // SSD (small block, top right of mobo)
    el('rect', {
      x: 350, y: 308, width: 40, height: 14,
      class: 'pc-edge'
    }, gInternals);
    el('text', {
      x: 370, y: 318,
      'text-anchor': 'middle',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': 7,
      fill: 'var(--accent-2)',
      'letter-spacing': '0.22em'
    }, gInternals).textContent = 'NVMe SSD';

    // PSU (bottom of case)
    el('rect', {
      x: 230, y: 480, width: 165, height: 60,
      class: 'pc-edge'
    }, gInternals);
    el('circle', { cx: 260, cy: 510, r: 22, class: 'pc-edge' }, gInternals);
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      el('line', {
        x1: 260, y1: 510,
        x2: 260 + Math.cos(ang) * 20,
        y2: 510 + Math.sin(ang) * 20,
        class: 'pc-vent'
      }, gInternals);
    }
    el('text', {
      x: 340, y: 514,
      'text-anchor': 'middle',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': 8,
      fill: 'var(--accent-2)',
      'letter-spacing': '0.22em'
    }, gInternals).textContent = 'PSU 850W';

    /* ---------- CALLOUTS ----------
       Each callout: { partId, partLabel, target {x,y}, label {x,y, text, sub} }
       Lines drawn from the part's anchor point out to the label.
    */
    const callouts = [
      { id: 'os',       label: 'LINUX MINT',    sub: 'OS',         tx: 760, ty: 308, lx: 580, ly: 130, side: 'right' },
      { id: 'cpu',      label: 'CPU + AIO',     sub: '01',         tx: 312, ty: 262, lx:  90, ly: 230, side: 'left' },
      { id: 'gpu',      label: 'RTX 4070 SUPER',sub: '02',         tx: 312, ty: 375, lx:  90, ly: 380, side: 'left' },
      { id: 'ram',      label: '32 GB DDR5',    sub: '03',         tx: 372, ty: 250, lx:  90, ly: 480, side: 'left' },
      { id: 'ssd',      label: '1 TB NVMe SSD', sub: '04',         tx: 370, ty: 315, lx: 580, ly: 480, side: 'right' },
      { id: 'aio',      label: 'AIO LIQUID',    sub: '05',         tx: 312, ty: 152, lx: 580, ly:  80, side: 'right' },
      { id: 'psu',      label: 'PSU 850W',      sub: '06',         tx: 312, ty: 510, lx: 580, ly: 580, side: 'right' },
      { id: 'monitor',  label: 'DELL 27" / 4K', sub: '07',         tx: 760, ty: 220, lx: 920, ly: 100, side: 'right-far' }
    ];

    callouts.forEach(c => {
      const g = el('g', { class: 'pc-callout-group', 'data-callout': c.id, 'data-hover': '' }, gCallouts);

      // Calculate elbow path: from target → mid-point → label anchor
      const isLeft = c.side === 'left';
      const isRightFar = c.side === 'right-far';
      const elbowX = isLeft ? c.tx - 60 : (isRightFar ? c.lx - 30 : c.lx - 30);
      const elbowY = c.ly;

      // Dot at the part
      el('circle', {
        cx: c.tx, cy: c.ty, r: 2.5,
        class: 'pc-callout-dot'
      }, g);

      // Line: target → elbow → label
      el('path', {
        d: `M ${c.tx} ${c.ty} L ${elbowX} ${c.ty} L ${elbowX} ${elbowY} L ${c.lx} ${elbowY}`,
        class: 'pc-callout-line'
      }, g);

      // Label end-cap bracket
      const bx = isLeft ? c.lx - 110 : c.lx + 4;
      const by = elbowY - 18;
      el('path', {
        d: isLeft
          ? `M ${bx} ${by} L ${bx} ${by + 36} L ${bx + 8} ${by + 36}`
          : `M ${bx + 8} ${by} L ${bx + 8} ${by + 36} L ${bx} ${by + 36}`,
        class: 'pc-callout-bracket'
      }, g);

      // Label text
      el('text', {
        x: isLeft ? bx - 6 : bx + 14,
        y: by + 14,
        'text-anchor': isLeft ? 'end' : 'start',
        class: 'pc-callout-sub'
      }, g).textContent = c.sub;

      el('text', {
        x: isLeft ? bx - 6 : bx + 14,
        y: by + 30,
        'text-anchor': isLeft ? 'end' : 'start',
        class: 'pc-callout-text'
      }, g).textContent = c.label;
    });

    /* ---------- Hover behavior ---------- */
    const specCards = Array.from(document.querySelectorAll('.pc-spec'));
    const specMap = {
      os: 0, gpu: 1, ram: 2, ssd: 3, monitor: 4, aio: 5
    };

    document.querySelectorAll('.pc-callout-group').forEach(group => {
      group.addEventListener('mouseenter', () => {
        const id = group.dataset.callout;
        // Highlight matching spec card
        specCards.forEach(s => s.classList.remove('active'));
        if (specMap[id] !== undefined && specCards[specMap[id]]) {
          specCards[specMap[id]].classList.add('active');
        }
      });
      group.addEventListener('mouseleave', () => {
        specCards.forEach(s => s.classList.remove('active'));
      });
    });
  }

})();
