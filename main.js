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
   3.5  FLAGSHIP BUILDS — rendered on builds.html, opened in modal.
   Same shape as BLOG_POSTS so the existing modal renderer can be
   reused. `body` is trusted HTML authored here.
   ============================================================ */
window.PROJECTS = [
  {
    id: 'BUILD-001',
    date: 'EXPERIENCE',
    title: 'bearcast media',
    tags: ['FRONT-END', 'SECURITY', 'CMS', 'BROADCAST'],
    color: '',
    live: true,
    domain: 'bearcastmedia.com',
    stack: ['Vanilla JS', 'Sanity CMS', 'Cloudflare', 'Radio.co', 'CSP / XSS'],
    metrics: [
      { v: '9', k: 'pages' },
      { v: 'F&rarr;A', k: 'security' },
      { v: '68pp', k: 'white paper' },
      { v: '34', k: 'findings' }
    ],
    excerpt: "Built from scratch: the full public platform for UC's student media organization. Nine interconnected pages, a live radio stream, a headless CMS, and a security posture I took from an F to an A — documented in a 68-page white paper.",
    body: `
      <p><strong>bearcastmedia.com</strong> is the public face of the University of Cincinnati's student media organization, and I built it from an empty folder as Web Director. It is the closest thing I have to a real "show": a live broadcast product where the technology has to disappear and the experience has to feel effortless.</p>

      <div class="build-facts">
        <div class="build-fact"><span class="k">Pages</span><span class="v">nine, interlinked</span></div>
        <div class="build-fact"><span class="k">CMS</span><span class="v">sanity (headless)</span></div>
        <div class="build-fact"><span class="k">Security Grade</span><span class="v">f &rarr; a</span></div>
        <div class="build-fact"><span class="k">White Paper</span><span class="v">68 pages</span></div>
      </div>

      <h3>the build</h3>
      <p>A nine-page static site — journalism, music, sports, BTV, schedule, and more — wired to a <strong>Sanity headless CMS</strong> so the student staff can publish without touching code. Live radio is handled through a Radio.co integration with now-playing polling and Media Session API support, so the stream behaves like a native app on a phone's lock screen. Deployed on Cloudflare Pages.</p>
      <p>The front-end work was relentlessly detail-driven: theme-aware CSS, mobile filter patterns, Safari-specific cursor fixes, image-pipeline bugs across every content type, and a fuzzy 404 that suggests the page you probably meant using Levenshtein distance. The kind of polish nobody notices — which is the point.</p>

      <h3>the security pass</h3>
      <p>I ran a full audit across the front-end, the Sanity schemas, and the Studio config: <strong>34 findings across three phases</strong>. I patched XSS sink patterns behind a central sanitization module, shipped Content-Security-Policy headers on all nine pages, hardened the schemas, and enforced a strict no-write-token policy for any client-side code. Security-header grade went from <strong>F to A</strong>.</p>

      <blockquote>A broadcast platform is a trust object. People assume it is safe because it looks calm. My job was to make that assumption true.</blockquote>

      <h3>the documentation</h3>
      <p>An undocumented system is just a rumor. The Bearcast rebuild ships with three documents: a cyber white paper covering the full security audit, a technical white paper on the architecture and build decisions, and a system-architecture diagram. Read any of them inline, or pull the PDF.</p>

      <!-- ============================================================
           BEARCAST DOCUMENT LIBRARY
           Commit these three PDFs to the repo (PDFs are fine in GitHub and
           are served as static files by Cloudflare Pages). Create a /docs
           folder next to index.html and save them as:
               docs/bearcast-cyber-whitepaper.pdf
               docs/bearcast-technical-whitepaper.pdf
               docs/bearcast-architecture-diagram.pdf
           To use different names, just edit the data-doc paths + the src below.
           ============================================================ -->
      <div class="build-doc" data-doc-viewer>
        <div class="build-doc-tabs">
          <button type="button" class="build-doc-tab active" data-doc="docs/bearcast-cyber-whitepaper.pdf" data-meta="PDF · SECURITY AUDIT">Cyber White Paper</button>
          <button type="button" class="build-doc-tab" data-doc="docs/bearcast-technical-whitepaper.pdf" data-meta="PDF · ARCHITECTURE & BUILD">Technical White Paper</button>
          <button type="button" class="build-doc-tab" data-doc="docs/bearcast-architecture-diagram.pdf" data-meta="PDF · SYSTEM DIAGRAM">Architecture Diagram</button>
        </div>
        <div class="build-doc-bar">
          <span class="build-doc-name">▤ <span data-doc-name>bearcast-cyber-whitepaper.pdf</span></span>
          <span class="build-doc-meta" data-doc-meta>PDF · SECURITY AUDIT</span>
        </div>
        <iframe class="build-doc-frame" data-doc-frame src="docs/bearcast-cyber-whitepaper.pdf" title="Bearcast documentation" loading="lazy"></iframe>
        <div class="build-doc-actions">
          <a data-doc-open href="docs/bearcast-cyber-whitepaper.pdf" target="_blank" rel="noopener">▸ Open Full Screen</a>
          <a data-doc-download href="docs/bearcast-cyber-whitepaper.pdf" download class="ice">▸ Download PDF</a>
        </div>
      </div>

      <div class="build-stack">
        <span>HTML / CSS / JS</span><span>Sanity CMS</span><span>Cloudflare Pages</span><span>Radio.co</span><span>CSP / XSS Defense</span><span>Media Session API</span>
      </div>

      <div class="build-links">
        <a href="https://bearcastmedia.com" target="_blank" rel="noopener">▸ Visit Live Site</a>
      </div>
    `
  },
  {
    id: 'BUILD-002',
    date: 'PRODUCT',
    title: 'netsweep',
    tags: ['iOS', 'SWIFT', 'NETWORKING', 'MULTI-PLATFORM'],
    color: 'ice',
    live: true,
    domain: 'netsweepapp.com',
    stack: ['Swift', 'SwiftUI', 'Network.framework', 'visionOS', 'Cloudflare'],
    excerpt: 'A native network-scanning app for iPhone, iPad, Mac, and Vision Pro — consumer-simple on the surface, real network tooling underneath. Shipped with a three-page marketing site.',
    body: `
      <p><strong>NetSweep</strong> is a native Apple-platform network scanner: point it at your network and it surfaces what is actually on it. The design brief I gave myself was pure experience design — hide the complexity, surface the wonder. A scan should feel like magic; the packet-level reality should stay backstage.</p>

      <div class="build-facts">
        <div class="build-fact"><span class="k">Platforms</span><span class="v">iphone · ipad · mac · vision pro</span></div>
        <div class="build-fact"><span class="k">Language</span><span class="v">swift</span></div>
        <div class="build-fact"><span class="k">Site</span><span class="v">three pages</span></div>
        <div class="build-fact"><span class="k">Deploy</span><span class="v">cloudflare pages</span></div>
      </div>

      <h3>the app</h3>
      <p>A single codebase targeting iPhone, iPad, Mac, and Vision Pro — host discovery and network inspection presented through a clean, calm interface. The hard part of consumer software is never the feature list; it is making something technically dense feel obvious. That is the same instinct that makes a queue feel short or a ride feel safe.</p>

      <h3>the launch surface</h3>
      <p>NetSweep ships with a three-page marketing site (netsweepapp.com) deployed on Cloudflare Pages — a small, deliberate front door designed to make a technical tool feel approachable to a non-technical visitor.</p>

      <blockquote>"More human than human" is a specification. So is "more obvious than obvious."</blockquote>

      <div class="build-stack">
        <span>Swift</span><span>SwiftUI</span><span>Network Framework</span><span>visionOS</span><span>Cloudflare Pages</span>
      </div>

      <div class="build-links">
        <a href="https://netsweepapp.com" target="_blank" rel="noopener" class="ice">▸ Visit Site</a>
      </div>
    `
  },
  {
    id: 'BUILD-003',
    date: 'THIS SITE',
    title: 'the nx-1324 archive',
    tags: ['EXPERIENCE DESIGN', 'WEBGL', 'CANVAS', 'META'],
    color: '',
    live: true,
    domain: 'the experience you are standing inside right now',
    stack: ['Vanilla JS', 'Three.js', 'Canvas 2D', 'SVG', 'No Frameworks'],
    excerpt: 'The site you are reading is itself a portfolio piece: a fully themed, in-universe immersive experience with rain, a custom cursor, a live operations console, a 3D model, and an interrogation game — all hand-built, no frameworks.',
    body: `
      <p>You are already inside the demo. This archive is not a template with my résumé poured into it — it is a built <em>experience</em>, themed end to end around the world of <em>Blade Runner 2049</em>, and the most honest single artifact I can show an experience-design team.</p>

      <h3>what's actually running</h3>
      <p>Animated rain and dust on layered canvases. A custom SVG cursor with a particle trail. A live "operations uplink" console with a wireframe globe, spectrum analyzer, radar sweep, and synthetic syslog feed. A working virtual terminal with a fake filesystem. An interactive Voight-Kampff interrogation. A memory-reconstruction puzzle. A real-time 3D model of my workstation. Three full color themes, including a rain mode. All vanilla — no React, no build step.</p>

      <blockquote>This is what I mean by "hide the technology." Everything here is deliberate. None of it announces itself. The effect arrives before the explanation does.</blockquote>

      <h3>why it belongs in this list</h3>
      <p>Imagineering builds places that tell you a story before you read a single sign. This site is my attempt at the same trick in a browser: atmosphere first, information second, and a consistent fiction holding it all together. The engineering underneath is real; the wrapping paper is the point.</p>

      <div class="build-stack">
        <span>Vanilla JS</span><span>Canvas 2D</span><span>WebGL / Three.js</span><span>SVG</span><span>CSS Theming</span><span>Cloudflare Pages</span><span>No Frameworks</span>
      </div>

      <div class="build-links">
        <a href="https://github.com/notChewy1324" target="_blank" rel="noopener">▸ Source on GitHub</a>
      </div>
    `
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

  // Icon-only nav controls hide their labels on desktop — surface a tooltip
  // from the aria-label so they stay discoverable.
  document.querySelectorAll('.nav-right .theme-toggle, .nav-right .audio-toggle').forEach(b => {
    if (!b.title && b.getAttribute('aria-label')) b.title = b.getAttribute('aria-label');
  });
  // Sync labels on first paint
  {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    document.querySelectorAll('.theme-toggle .label').forEach(el => {
      el.textContent = THEME_NEXT_LABEL[cur];
    });
  }

  /* -------- CLEARANCE SYSTEM + TOASTS + INCEPT DATE --------- */
  // TIER-9 by default. TIER-OMEGA is earned, not granted — via the
  // override passphrase in the terminal, or the old code. You know the one.
  const NX = {
    get clearance() {
      try { return sessionStorage.getItem('nx-clearance') || 'TIER-9'; }
      catch(e) { return 'TIER-9'; }
    },
    elevate() {
      if (NX.clearance === 'TIER-OMEGA') return false;
      try { sessionStorage.setItem('nx-clearance', 'TIER-OMEGA'); } catch(e) {}
      NX.toast('CLEARANCE ELEVATED ▸ TIER-OMEGA', 'omega');
      document.documentElement.setAttribute('data-clearance', 'omega');
      return true;
    },
    toast(msg, kind = '') {
      let stack = document.getElementById('nx-toast-stack');
      if (!stack) {
        stack = document.createElement('div');
        stack.id = 'nx-toast-stack';
        document.body.appendChild(stack);
      }
      const t = document.createElement('div');
      t.className = `nx-toast ${kind}`;
      t.setAttribute('role', 'status');
      t.textContent = msg;
      stack.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 600);
      }, 4200);
    },
    incept() {
      try {
        let d = localStorage.getItem('nx-incept');
        if (!d) {
          d = new Date().toISOString().slice(0, 10);
          localStorage.setItem('nx-incept', d);
        }
        return d;
      } catch(e) { return 'UNKNOWN'; }
    }
  };
  NX.incept(); // stamp first contact
  if (NX.clearance === 'TIER-OMEGA') {
    document.documentElement.setAttribute('data-clearance', 'omega');
  }

  // Konami sequence → TIER-OMEGA
  {
    const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = (k === SEQ[pos]) ? pos + 1 : (k === SEQ[0] ? 1 : 0);
      if (pos === SEQ.length) {
        pos = 0;
        if (!NX.elevate()) NX.toast('CLEARANCE ALREADY TIER-OMEGA', 'omega');
      }
    });
  }

  /* -------- SHARED ATMOSPHERE STATE ---------
     Mutated by the live weather feed and scroll depth; read by the
     rain canvas, the nav clock, and the ambient audio engine. */
  const ATMO = {
    rainLive: false,      // live weather says it's raining over the sector
    rainIntensity: 0.85,  // 0..~1.3 — scroll depth pushes this up
    weatherTag: ''        // short status appended to the nav clock
  };

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

    const hideCursor = () => {
      cursorActive = false;
      arrow.classList.remove('active');
      trailCanvas.classList.remove('active');
    };
    // Hide the custom cursor when the pointer leaves the page. Safari does NOT
    // fire `mouseleave` on the `document` object, so bind it to <html> AND
    // catch `mouseout`/`pointerout` with a null relatedTarget (pointer left the
    // window entirely). Belt-and-suspenders across Safari / Chrome / Firefox.
    document.documentElement.addEventListener('mouseleave', hideCursor);
    document.addEventListener('mouseout',   (e) => { if (!e.relatedTarget && !e.toElement) hideCursor(); });
    document.addEventListener('pointerout', (e) => { if (e.pointerType === 'mouse' && !e.relatedTarget) hideCursor(); });
    window.addEventListener('blur', hideCursor);

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

  /* -------- BUILDS EXHIBIT RENDER --------- */
  const buildsGrid = document.getElementById('builds-grid');
  if (buildsGrid) {
    const builds = window.PROJECTS || [];
    buildsGrid.innerHTML = builds.map((p, i) => {
      const num = String(i + 1).padStart(2, '0');
      const isFeature = i === 0;
      const stackChips = (p.stack || []).map(s => `<span>${s}</span>`).join('');
      const tagChips = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
      const metrics = isFeature && p.metrics
        ? `<div class="build-exhibit-metrics">${p.metrics.map(m => `
            <div class="bx-metric"><span class="v">${m.v}</span><span class="k">${m.k}</span></div>`).join('')}</div>`
        : '';
      return `
      <article class="build-exhibit reveal ${p.color || ''}${isFeature ? ' feature' : ''}" data-build="${i}" data-hover>
        <div class="build-exhibit-index">
          <span class="bx-num">${num}</span>
          <span class="bx-rule"></span>
          <span class="bx-id">${p.id}</span>
        </div>
        <div class="build-exhibit-main">
          <div class="build-exhibit-kicker">
            <span class="bx-kick">${p.date}</span>
            ${p.live ? '<span class="bx-live">● LIVE</span>' : ''}
          </div>
          <h3 class="build-exhibit-title">${p.title}</h3>
          <div class="build-domain">${p.domain}</div>
          <p class="build-exhibit-excerpt">${p.excerpt}</p>
          ${metrics}
          ${stackChips ? `<div class="build-exhibit-stack">${stackChips}</div>` : ''}
          <div class="build-exhibit-foot">
            <div class="build-exhibit-tags">${tagChips}</div>
            <span class="build-exhibit-cta">Open Dossier ▸</span>
          </div>
        </div>
      </article>`;
    }).join('');
    document.querySelectorAll('#builds-grid .reveal').forEach((el) => observer.observe(el));
  }

  /* -------- MODAL --------- */
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const modalTitle = document.getElementById('modal-title');
  const modalDate = document.getElementById('modal-date');
  const modalMeta = document.getElementById('modal-meta');
  const modalClose = document.getElementById('modal-close');

  let modalReturnFocus = null;

  function openModal(post, metaLabel) {
    if (!modal) return;
    modalTitle.textContent = post.title;
    modalDate.textContent = post.date;
    modalMeta.textContent = `${metaLabel || 'ARCHIVE ENTRY'} ${post.id} // ${post.tags.join(' / ')}`;
    modalBody.innerHTML = post.body;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    wireDocViewer(modalBody);
    // Keyboard a11y: remember where focus came from and move it into the dialog
    modalReturnFocus = document.activeElement;
    if (modalClose) modalClose.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (modalReturnFocus && typeof modalReturnFocus.focus === 'function') {
      modalReturnFocus.focus();
      modalReturnFocus = null;
    }
    // In case the pointer was over an embedded PDF when the modal closed,
    // make sure the custom cursor comes back.
    const a = document.getElementById('cursor-arrow');
    const t = document.getElementById('cursor-trail-canvas');
    if (a) a.classList.remove('hidden');
    if (t) t.classList.remove('hidden');
  }

  // Tabbed PDF document viewer (used in the Bearcast dossier). Swaps one
  // shared <iframe> between documents, keeps Open/Download in sync, and hides
  // the custom cursor while the pointer is over the embedded PDF.
  function wireDocViewer(scope) {
    const viewer = scope.querySelector('[data-doc-viewer]');
    if (!viewer) return;
    const frame = viewer.querySelector('[data-doc-frame]');
    const nameEl = viewer.querySelector('[data-doc-name]');
    const metaEl = viewer.querySelector('[data-doc-meta]');
    const openA = viewer.querySelector('[data-doc-open]');
    const dlA = viewer.querySelector('[data-doc-download]');
    viewer.querySelectorAll('.build-doc-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        viewer.querySelectorAll('.build-doc-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const src = tab.getAttribute('data-doc');
        if (frame) frame.src = src;
        if (openA) openA.href = src;
        if (dlA) dlA.href = src;
        if (nameEl) nameEl.textContent = src.split('/').pop();
        if (metaEl && tab.dataset.meta) metaEl.textContent = tab.dataset.meta;
      });
    });
    if (frame) {
      const a = document.getElementById('cursor-arrow');
      const t = document.getElementById('cursor-trail-canvas');
      frame.addEventListener('mouseenter', () => { if (a) a.classList.add('hidden'); if (t) t.classList.add('hidden'); });
      frame.addEventListener('mouseleave', () => { if (a) a.classList.remove('hidden'); if (t) t.classList.remove('hidden'); });
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Trap Tab focus inside the dialog while it is open
  if (modal) {
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !modal.classList.contains('open')) return;
      const focusables = modal.querySelectorAll(
        'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  document.addEventListener('click', (e) => {
    const postCard = e.target.closest('[data-post]');
    if (postCard) {
      const idx = parseInt(postCard.dataset.post, 10);
      if (window.BLOG_POSTS && window.BLOG_POSTS[idx]) openModal(window.BLOG_POSTS[idx], 'ARCHIVE ENTRY');
      return;
    }
    const buildCard = e.target.closest('[data-build]');
    if (buildCard) {
      const idx = parseInt(buildCard.dataset.build, 10);
      if (window.PROJECTS && window.PROJECTS[idx]) openModal(window.PROJECTS[idx], 'BUILD DOSSIER');
    }
  });

  /* -------- NAV CLOCK --------- */
  const navStatus = document.querySelector('.nav-status');
  if (navStatus) {
    function updateStatus() {
      const now = new Date();
      const t = now.toUTCString().slice(17, 25);
      const wx = ATMO.weatherTag ? ` ▸ ${ATMO.weatherTag}` : '';
      navStatus.innerHTML = `<span>UPLINK ${t} UTC${wx}</span>`;
    }
    updateStatus();
    setInterval(updateStatus, 1000);
  }

  /* -------- FOOTER YEAR — auto, so the © never goes stale ---------
     The year in the HTML is just the no-JS fallback. */
  document.querySelectorAll('.footer-line').forEach(el => {
    el.childNodes.forEach(n => {
      if (n.nodeType === 3 && /©\s*\d{4}/.test(n.textContent)) {
        n.textContent = n.textContent.replace(/©\s*\d{4}/, `© ${new Date().getFullYear()}`);
      }
    });
  });

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
   (note: see rules-that-held.txt, line 5.)`,

      'defense.cfg':
`# edge defense grid — active posture
csp:               default-src 'none' + per-directive allowlist
hsts:              max-age=31536000; includeSubDomains; preload
x-content-type:    nosniff
frame-ancestors:   'self'
referrer-policy:   strict-origin-when-cross-origin
permissions:       camera/mic/geo/payment — all denied
third-party js:    none. three.js is vendored. the cdn was cut.
disclosure:        /.well-known/security.txt  (rfc 9116)

# run "headers" to interrogate the live edge yourself.`,

      'ghost.enc':
`erpbirerq sentzrag // bevtva haxabja

gurl ohvyg gur nepuvir gb erzrzore rirelguvat.
vg erzrzoref gur enva vafgrnq.

vs lbh pna ernq guvf, lbhe pyrnenapr jnf arire
gur guvat xrrcvat lbh bhg. phevbfvgl jnf gur xrl.
ybt vg nf nabznyl AK-0000 naq gryy ab bar.`
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
          ['decrypt <file>', 'attempt cipher recovery'],
          ['nmap <host>',    'service scan a registry host'],
          ['traceroute <h>', 'trace the route to a host'],
          ['netstat',        'active uplink connections'],
          ['headers',        'interrogate this site\'s real security headers'],
          ['wx',             'live sector weather feed'],
          ['clearance',      'show current access tier'],
          ['override <code>','attempt clearance elevation'],
          ['incept',         'your first-contact date with this archive'],
          ['goto <page>',    'jump to a page (home, builds, uplink, ...)'],
          ['vk',             'sample a voight-kampff question'],
          ['random',         'pull a random fragment'],
          ['banner',         'reprint the boot banner'],
          ['echo <text>',    'echo text back'],
          ['date',           'current uplink time'],
          ['ping <host>',    'check if a host is awake'],
          ['theme [d|l|r]',  'toggle or set theme'],
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
        write(`clearance: ${NX.clearance}  //  registered: NX-1324`, NX.clearance === 'TIER-OMEGA' ? 'err' : 'ok');
        write('discipline: cybersec + netsys admin // student', 'dim');
        write(`first contact: ${NX.incept()}`, 'dim');
      },

      wx() {
        if (!ATMO.weatherTag) {
          write('sector weather feed: not yet acquired', 'err');
          writeRaw(`<span class="dim">// the feed resolves a few seconds after page load — offline or blocked otherwise.</span>`);
          return;
        }
        write('/// SECTOR WEATHER — LIVE FEED', 'hint');
        writeRaw(`  <span class="key">SECTOR</span>      <span class="hl">${esc(ATMO.city || 'UNKNOWN')}</span>`);
        writeRaw(`  <span class="key">CONDITION</span>   ${ATMO.rainLive
          ? `<span class="red">${ATMO.snow ? 'SNOWFALL' : 'RAINFALL'} IN PROGRESS</span>`
          : '<span class="ok">DRY</span>'}`);
        writeRaw(`  <span class="key">ATMOSPHERE</span>  ${ATMO.rainLive
          ? '<span class="ok">rain canvas engaged — all themes</span>'
          : '<span class="dim">rain canvas idle (force it: theme r)</span>'}`);
        writeRaw(`  <span class="key">SOURCE</span>      <span class="dim">ip locate ▸ open-meteo ▸ cached 30 min</span>`);
      },

      ls(args) {
        const path = (args[0] || '/archive').replace(/\/$/, '');
        if (path === '/' || path === '/archive') {
          writeRaw(`<span class="hl">fragments/</span>      <span class="hl">voight-kampff/</span>     <span class="hl">field-notes/</span>`);
          writeRaw(`<span class="hl">incidents/</span>      <span class="hl">rules-i-broke/</span>     <span class="hl">rules-that-held/</span>`);
          writeRaw(`<span class="dim">profile.txt    motd             baseline.dat</span>`);
          writeRaw(`<span class="dim">kipple.log     replicants.idx   defense.cfg</span>`);
          writeRaw(`<span class="dim">ghost.enc</span>`);
        } else {
          write(`ls: ${path}: no such directory`, 'err');
        }
      },

      cat(args) {
        if (!args[0]) { write('cat: missing file operand', 'err'); return; }
        const name = args[0].replace(/^\.?\//, '').replace(/^archive\//, '');
        if (name === 'replicants.idx' || name === 'replicants') {
          if (NX.clearance === 'TIER-OMEGA') {
            write(
`/// TIER-OMEGA ACCESS GRANTED
/// replicant index — nexus-9 production line

records found: 0

the index is empty. it was always empty.
wallace corp does not keep a list of who is real.
it keeps a list of who asked.

you are now on that list. welcome.`, 'ok');
          } else {
            write(FS['replicants.idx'], 'err');
            write('(elevation is possible. some codes are older than this archive.)', 'dim');
          }
        } else if (name === 'ghost.enc') {
          write(FS['ghost.enc']);
          write('(ciphertext detected. try: decrypt ghost.enc)', 'dim');
        } else if (FS[name]) {
          write(FS[name]);
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

      nmap(args) {
        const host = (args[0] || 'wallace.corp').slice(0, 48);
        write(`Starting nx-map 4.7 ( nexus-9 build ) at ${new Date().toTimeString().slice(0,8)}`);
        write(`Nmap scan report for ${host} (10.${Math.floor(Math.random()*200)+10}.${Math.floor(Math.random()*255)}.7)`);
        write('Host is up (0.012s latency).', 'ok');
        writeBlank();
        writeRaw(`<span class="hl">PORT      STATE     SERVICE</span>`);
        const rows = [
          ['22/tcp',   'filtered', 'ssh        // honeypot. you know better.'],
          ['53/tcp',   'open',     'domain     // resolves everything except doubt'],
          ['80/tcp',   'open',     'http       // redirects to 443. always.'],
          ['443/tcp',  'open',     'https      // hsts preloaded'],
          ['1124/tcp', 'open',     'baseline   // voight-kampff uplink'],
          ['1982/tcp', 'closed',   'memory     // decommissioned'],
          ['2049/tcp', 'filtered', 'nexus      // tier-omega required'],
          ['9090/tcp', 'open',     'telemetry  // synthetic, but persistent']
        ];
        let i = 0;
        const iv = setInterval(() => {
          if (i >= rows.length) {
            clearInterval(iv);
            writeBlank();
            write(`Nmap done: 1 host up — scanned in ${(0.8 + Math.random()).toFixed(2)}s`, 'ok');
            write('(scan is simulated. the real ports of this site are 443 and nothing else.)', 'dim');
            return;
          }
          const [p, s, svc] = rows[i++];
          const cls = s === 'open' ? 'ok' : (s === 'closed' ? 'err' : 'dim');
          writeRaw(`${esc(p.padEnd(10))}<span class="${cls}">${esc(s.padEnd(10))}</span><span class="dim">${esc(svc)}</span>`);
        }, 160);
      },
      scan(args) { commands.nmap(args); },

      traceroute(args) {
        const host = (args[0] || 'wallace.corp').slice(0, 48);
        write(`traceroute to ${host}, 8 hops max, 56 byte packets`);
        const hops = [
          'gateway.sector-7        10.0.0.1',
          'edge.cincinnati-metro   10.14.2.1',
          'spire.la-2049           10.49.0.12',
          'smog-layer.transit      10.49.66.3',
          'wallace-perimeter       10.99.1.1',
          '* * *                   (request blackholed)',
          'memory-vault.internal   10.99.13.24',
          host + '                 10.99.13.7'
        ];
        let i = 0;
        const iv = setInterval(() => {
          if (i >= hops.length) {
            clearInterval(iv);
            write('trace complete. some hops do not want to be found.', 'dim');
            return;
          }
          const ms = (4 + i * 3 + Math.random() * 5).toFixed(2);
          const blackhole = hops[i].startsWith('*');
          writeRaw(`<span class="dim">${String(i+1).padStart(2,' ')}</span>  ${blackhole ? `<span class="err">${esc(hops[i])}</span>` : `${esc(hops[i])}  <span class="ok">${ms} ms</span>`}`);
          i++;
        }, 220);
      },

      netstat() {
        writeRaw(`<span class="hl">Proto  Local            Foreign              State</span>`);
        const rows = [
          ['tcp', 'nx-1324:443',  'visitor:ephemeral',   'ESTABLISHED', 'ok'],
          ['tcp', 'nx-1324:1124', 'baseline.wallace:1124','ESTABLISHED', 'ok'],
          ['tcp', 'nx-1324:22',   '*:*',                 'LISTEN (trap)','dim'],
          ['tcp', 'nx-1324:2049', 'tier-omega.only:*',   'FILTERED',    'err'],
          ['udp', 'nx-1324:53',   'memory.vault:53',     'DREAMING',    'dim']
        ];
        rows.forEach(([p, l, f, s, cls]) => {
          writeRaw(`${esc(p.padEnd(7))}${esc(l.padEnd(17))}${esc(f.padEnd(21))}<span class="${cls}">${esc(s)}</span>`);
        });
        write('one of these connections is you.', 'dim');
      },

      headers() {
        write('interrogating own edge for real response headers...', 'dim');
        const WANT = [
          'content-security-policy', 'strict-transport-security',
          'x-content-type-options', 'x-frame-options', 'referrer-policy',
          'permissions-policy', 'cross-origin-opener-policy',
          'cross-origin-resource-policy'
        ];
        fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
          .then(res => {
            writeBlank();
            WANT.forEach(h => {
              let v = res.headers.get(h);
              if (v) {
                if (v.length > 72) v = v.slice(0, 69) + '...';
                writeRaw(`<span class="ok">[SHIELDED]</span> <span class="hl">${esc(h)}</span>`);
                writeRaw(`           <span class="dim">${esc(v)}</span>`);
              } else {
                writeRaw(`<span class="err">[EXPOSED ]</span> <span class="dim">${esc(h)} — not present on this origin</span>`);
              }
            });
            writeBlank();
            write('these are live values, not lore. full grid on the uplink page.', 'dim');
          })
          .catch(() => write('edge interrogation failed — offline or local file://', 'err'));
      },

      decrypt(args) {
        if (!args[0]) { write('decrypt: missing file operand', 'err'); return; }
        const name = args[0].replace(/^\.?\//, '');
        if (name !== 'ghost.enc') {
          write(`decrypt: ${name}: no recoverable cipher structure`, 'err');
          return;
        }
        write('analyzing cipher... substitution detected... rotating alphabet...', 'dim');
        setTimeout(() => {
          const rot13 = s => s.replace(/[a-zA-Z]/g, c => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
          });
          write(rot13(FS['ghost.enc']), 'ok');
          writeBlank();
          write('// anomaly NX-0000 logged. told no one.', 'dim');
        }, 700);
      },

      clearance() {
        const c = NX.clearance;
        write(`current clearance: ${c}`, c === 'TIER-OMEGA' ? 'err' : 'ok');
        if (c !== 'TIER-OMEGA') {
          write('elevation requires an override code. cells, operator. think about what links them.', 'dim');
        } else {
          write('maximum elevation reached. some doors are open now. try cat replicants.idx', 'dim');
        }
      },

      override(args) {
        const code = (args.join(' ') || '').toLowerCase();
        if (!code) { write('override: usage: override <code>', 'err'); return; }
        if (code === 'interlinked' || code === 'cells interlinked') {
          if (NX.elevate()) {
            write('override accepted.', 'ok');
            write('clearance elevated: TIER-9 ▸ TIER-OMEGA', 'err');
            write('the registry will pretend this never happened.', 'dim');
          } else {
            write('already at TIER-OMEGA. greed is logged.', 'dim');
          }
        } else {
          write('override rejected. attempt logged.', 'err');
          write('(hint: it is the word the baseline test keeps coming back to.)', 'dim');
        }
      },

      incept() {
        write(`first contact with this archive: ${NX.incept()}`, 'ok');
        write('stored locally on your machine. the archive itself remembers nothing.', 'dim');
      },

      goto(args) {
        const map = {
          home: 'index.html', index: 'index.html',
          background: 'background.html', builds: 'builds.html',
          notes: 'blog.html', blog: 'blog.html', 'field-notes': 'blog.html',
          uses: 'uses.html', loadout: 'uses.html',
          uplink: 'uplink.html', console: 'uplink.html',
          archive: 'archive.html'
        };
        const dest = map[(args[0] || '').toLowerCase()];
        if (!dest) {
          write('goto: unknown destination', 'err');
          write('destinations: home, background, builds, notes, uses, uplink, archive', 'dim');
          return;
        }
        write(`rerouting uplink ▸ ${dest}`, 'ok');
        setTimeout(() => { window.location.href = dest; }, 450);
      },
      open(args) { commands.goto(args); },

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
      const theme = document.documentElement.getAttribute('data-theme');
      // Rain falls in the rain theme, or in ANY theme when the live
      // weather feed says it is actually raining over the sector.
      const isRain = theme === 'rain' || ATMO.rainLive;
      if (!isRain) {
        rctx.clearRect(0, 0, RW, RH);
        requestAnimationFrame(rainTick);
        return;
      }
      // Fade the previous frame with destination-out so the motion trail
      // works on any theme without tinting the page (the old dark fillRect
      // only looked right against the near-black rain theme background).
      rctx.globalCompositeOperation = 'destination-out';
      rctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      rctx.fillRect(0, 0, RW, RH);
      rctx.globalCompositeOperation = 'source-over';

      const streak = theme === 'light' ? '42, 85, 138' : '155, 196, 224';
      const count = Math.min(drops.length, Math.round(drops.length * ATMO.rainIntensity));
      rctx.lineCap = 'round';
      for (let i = 0; i < count; i++) {
        const d = drops[i];
        rctx.strokeStyle = `rgba(${streak}, ${d.alpha})`;
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
     UPLINK PAGE — operations console
     ============================================================ */
  const uplinkRoot = document.getElementById('uplink-shell');
  if (uplinkRoot) {

    /* ---- CYBERPUNK EARTH — dotted landmasses, glowing coastlines, atmosphere ---- */
    const mapSvg = uplinkRoot.querySelector('#uplink-map-svg');
    if (mapSvg) {
      const ns = 'http://www.w3.org/2000/svg';
      mapSvg.setAttribute('viewBox', '0 0 800 500');
      const el = (tag, attrs) => {
        const n = document.createElementNS(ns, tag);
        if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
        return n;
      };

      const CX = 400, CY = 250, R = 200;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ---- defs: ocean gradient + soft glow ----
      const defs = el('defs');
      const grad = el('radialGradient', { id: 'globe-ocean', cx: '38%', cy: '32%', r: '75%' });
      const s0 = el('stop', { offset: '0%' });  s0.style.stopColor = 'var(--globe-ocean-core)';
      const s1 = el('stop', { offset: '70%' });  s1.style.stopColor = 'var(--globe-ocean-edge)';
      const s2 = el('stop', { offset: '100%' }); s2.style.stopColor = 'var(--globe-ocean-edge)';
      grad.append(s0, s1, s2);
      const clip = el('clipPath', { id: 'globe-clip' });
      clip.appendChild(el('circle', { cx: CX, cy: CY, r: R }));
      defs.append(grad, clip);
      mapSvg.appendChild(defs);

      // ---- atmosphere halo (outer glow) ----
      const halo = el('circle', { cx: CX, cy: CY, r: R + 12, fill: 'none', stroke: 'var(--globe-rim)', 'stroke-width': '2', opacity: '0.4' });
      halo.style.filter = 'blur(6px)';
      mapSvg.appendChild(halo);
      const halo2 = el('circle', { cx: CX, cy: CY, r: R + 3, fill: 'none', stroke: 'var(--globe-rim)', 'stroke-width': '1', opacity: '0.55' });
      mapSvg.appendChild(halo2);

      // ---- ocean disc ----
      mapSvg.appendChild(el('circle', { cx: CX, cy: CY, r: R, fill: 'url(#globe-ocean)' }));

      // a faint inner limb shade for spherical depth
      const limb = el('circle', { cx: CX, cy: CY, r: R, fill: 'none', stroke: 'var(--globe-rim)', 'stroke-width': '14', opacity: '0.10' });
      limb.style.filter = 'blur(8px)';
      mapSvg.appendChild(limb);

      // ---- dynamic, clipped to the disc ----
      const dynamicLayer = el('g', { 'clip-path': 'url(#globe-clip)' });
      mapSvg.appendChild(dynamicLayer);
      const gGrid = el('g'), gSweep = el('g'), gLand = el('g'), gCoast = el('g'), gCity = el('g'), gPing = el('g');
      gCoast.style.filter = 'drop-shadow(0 0 1.5px var(--globe-coast))';
      gCity.style.filter = 'drop-shadow(0 0 4px var(--globe-land))';
      dynamicLayer.append(gGrid, gSweep, gLand, gCoast, gCity, gPing);

      // ---- simplified continent outlines [lon, lat] ----
      const LAND = [
        // North America
        [[-168,65],[-162,70],[-140,70],[-125,72],[-100,73],[-82,73],[-62,66],[-64,60],[-56,52],[-66,46],[-70,43],[-74,40],[-76,35],[-81,31],[-80,25],[-84,30],[-90,29],[-97,28],[-97,22],[-105,21],[-106,24],[-110,24],[-114,29],[-117,33],[-122,37],[-124,42],[-124,48],[-130,55],[-138,58],[-148,60],[-156,58],[-164,60],[-168,65]],
        // Central America
        [[-97,18],[-92,15],[-87,16],[-83,11],[-79,9],[-77,8],[-82,14],[-88,17],[-93,18],[-97,18]],
        // South America
        [[-78,9],[-72,11],[-62,10],[-52,5],[-50,0],[-44,-2],[-35,-6],[-38,-13],[-39,-18],[-48,-25],[-48,-28],[-58,-35],[-62,-40],[-66,-45],[-72,-50],[-75,-53],[-74,-46],[-72,-40],[-71,-30],[-71,-20],[-76,-14],[-81,-6],[-80,2],[-78,9]],
        // Greenland
        [[-46,60],[-30,68],[-22,70],[-20,76],[-30,82],[-45,83],[-58,80],[-54,72],[-50,66],[-46,60]],
        // Europe
        [[-9,43],[-2,36],[3,40],[6,44],[12,45],[18,42],[26,40],[28,45],[40,47],[42,52],[38,58],[30,62],[26,66],[20,69],[14,67],[10,60],[6,54],[2,51],[-4,49],[-9,43]],
        // United Kingdom
        [[-5,50],[-3,53],[-3,58],[-6,58],[-8,55],[-6,51],[-5,50]],
        // Africa
        [[-16,15],[-17,21],[-10,30],[-5,36],[1,37],[10,34],[11,33],[20,32],[25,32],[32,31],[34,28],[35,22],[37,18],[43,12],[51,12],[48,5],[42,0],[40,-8],[40,-16],[35,-22],[27,-34],[20,-35],[18,-30],[15,-22],[13,-15],[12,-6],[9,2],[5,5],[-4,5],[-8,4],[-12,8],[-16,15]],
        // Madagascar
        [[43,-25],[45,-22],[49,-15],[50,-18],[48,-23],[45,-25],[43,-25]],
        // Asia
        [[28,40],[35,37],[36,33],[40,32],[48,30],[57,25],[60,25],[60,28],[55,32],[52,40],[55,45],[58,55],[60,66],[68,73],[78,73],[100,77],[125,73],[140,72],[160,69],[170,66],[178,68],[170,60],[160,61],[155,57],[143,53],[140,46],[135,44],[130,42],[122,40],[121,33],[122,30],[117,24],[110,21],[108,16],[106,10],[104,8],[100,6],[99,10],[98,16],[94,16],[90,22],[88,21],[80,13],[77,8],[73,18],[70,22],[67,24],[62,25],[57,28],[48,30],[45,36],[40,38],[34,37],[30,38],[28,40]],
        // Japan
        [[130,31],[133,34],[138,35],[141,40],[142,44],[140,42],[136,36],[132,33],[130,31]],
        // Southeast Asia / Indonesia
        [[95,5],[100,2],[105,-2],[112,-7],[120,-9],[115,-6],[108,-5],[102,0],[97,4],[95,5]],
        [[109,2],[115,4],[118,1],[117,-3],[112,-3],[109,1],[109,2]],
        [[120,6],[123,9],[125,13],[126,17],[124,14],[121,11],[120,8],[120,6]],
        // Australia
        [[114,-22],[122,-18],[129,-15],[133,-12],[137,-11],[142,-11],[145,-15],[147,-20],[153,-26],[153,-32],[150,-37],[146,-39],[140,-38],[134,-35],[129,-32],[124,-34],[118,-35],[114,-31],[113,-26],[114,-22]],
        // New Zealand
        [[167,-46],[170,-44],[173,-41],[175,-37],[178,-38],[174,-41],[171,-44],[167,-46]]
      ];

      // point-in-polygon (ray casting) in lon/lat
      function pip(lon, lat, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
          if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) inside = !inside;
        }
        return inside;
      }

      // sample a land-dot grid once (jittered so it doesn't look like a grid)
      const landDots = [];
      for (let lat = -56; lat <= 80; lat += 4) {
        for (let lon = -180; lon < 180; lon += 4) {
          for (let k = 0; k < LAND.length; k++) {
            if (pip(lon, lat, LAND[k])) {
              landDots.push({ lat: lat + (Math.random() - 0.5) * 2.4, lon: lon + (Math.random() - 0.5) * 2.4 });
              break;
            }
          }
        }
      }

      // ping cities (lat, lon)
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

      const TILT = 23 * Math.PI / 180;
      const COS_T = Math.cos(TILT), SIN_T = Math.sin(TILT);

      function project(lat, lon, yaw) {
        const phi = lat * Math.PI / 180;
        const lambda = lon * Math.PI / 180 + yaw;
        let x = Math.cos(phi) * Math.sin(lambda);
        let y = Math.sin(phi);
        let z = Math.cos(phi) * Math.cos(lambda);
        const yt = y * COS_T - z * SIN_T;
        const zt = y * SIN_T + z * COS_T;
        y = yt; z = zt;
        return { x: CX + x * R, y: CY - y * R, z, visible: z > -0.02 };
      }

      // draw a projected polyline path (great-circle sampled), breaking at the limb
      function drawArc(group, samplePts, yaw, stroke, width, baseOp) {
        let pts = [];
        const flush = () => {
          if (pts.length > 1) {
            group.appendChild(el('polyline', { points: pts.join(' '), fill: 'none', stroke, 'stroke-width': width, 'stroke-linejoin': 'round', opacity: baseOp }));
          }
          pts = [];
        };
        for (const [lat, lon] of samplePts) {
          const p = project(lat, lon, yaw);
          if (p.visible) pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`); else flush();
        }
        flush();
      }

      let yaw = 0, sweepLon = -180;
      const activePings = [];
      function spawnPing() {
        const s = pingSites[Math.floor(Math.random() * pingSites.length)];
        activePings.push({ lat: s.lat, lon: s.lon, r: 3, op: 1 });
      }
      if (!reduceMotion) setInterval(spawnPing, 1100);

      const LAT_LINES = [-60, -30, 0, 30, 60];
      const MERIDIANS = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180];

      function renderFrame() {
        [gGrid, gSweep, gLand, gCoast, gCity, gPing].forEach(g => { while (g.firstChild) g.removeChild(g.firstChild); });

        // 1) graticule — latitude rings + meridians
        for (const lat of LAT_LINES) {
          const pts = [];
          for (let lon = -180; lon <= 180; lon += 4) pts.push([lat, lon]);
          drawArc(gGrid, pts, yaw, 'var(--globe-grid)', lat === 0 ? '0.7' : '0.4', lat === 0 ? '0.34' : '0.16');
        }
        for (const lon of MERIDIANS) {
          const pts = [];
          for (let lat = -88; lat <= 88; lat += 4) pts.push([lat, lon]);
          drawArc(gGrid, pts, yaw, 'var(--globe-grid)', '0.4', '0.16');
        }

        // 2) scanning meridian (sweep)
        if (!reduceMotion) {
          const sw = [];
          for (let lat = -88; lat <= 88; lat += 3) sw.push([lat, sweepLon]);
          drawArc(gSweep, sw, yaw, 'var(--globe-coast)', '1.6', '0.5');
        }

        // 3) land dots
        const frag = document.createDocumentFragment();
        for (const d of landDots) {
          const p = project(d.lat, d.lon, yaw);
          if (!p.visible) continue;
          const op = 0.18 + Math.max(0, p.z) * 0.6;
          frag.appendChild(el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: '1.5', fill: 'var(--globe-land)', opacity: op.toFixed(2) }));
        }
        gLand.appendChild(frag);

        // 4) glowing coastlines
        for (const poly of LAND) {
          const closed = poly.concat([poly[0]]).map(([lo, la]) => [la, lo]); // [lat,lon]
          drawArc(gCoast, closed, yaw, 'var(--globe-coast)', '0.9', '0.85');
        }

        // 5) cities + labels
        for (const s of pingSites) {
          const p = project(s.lat, s.lon, yaw);
          if (!p.visible) continue;
          const op = 0.4 + Math.max(0, p.z) * 0.6;
          gCity.appendChild(el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: '2.6', fill: 'var(--globe-land)', opacity: op.toFixed(2) }));
          if (p.z > 0.35) {
            const label = el('text', { x: (p.x + 7).toFixed(1), y: (p.y + 3.5).toFixed(1), 'font-family': 'JetBrains Mono, monospace', 'font-size': '9', fill: 'var(--globe-coast)', 'letter-spacing': '0.1em', opacity: (op * 0.9).toFixed(2) });
            label.textContent = s.name;
            gCity.appendChild(label);
          }
        }

        // 6) ping rings
        for (let i = activePings.length - 1; i >= 0; i--) {
          const pg = activePings[i];
          pg.r += 0.9; pg.op -= 0.012;
          if (pg.op <= 0) { activePings.splice(i, 1); continue; }
          const p = project(pg.lat, pg.lon, yaw);
          if (!p.visible) continue;
          gPing.appendChild(el('circle', { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: pg.r.toFixed(1), fill: 'none', stroke: 'var(--globe-coast)', 'stroke-width': '1.4', opacity: (pg.op * Math.max(0.2, p.z)).toFixed(2) }));
        }
      }

      if (reduceMotion) {
        renderFrame();
      } else {
        let last = 0;
        function loop(ts) {
          requestAnimationFrame(loop);
          if (ts - last < 33) return;
          last = ts;
          yaw += 0.006;
          sweepLon += 2.2; if (sweepLon > 180) sweepLon -= 360;
          renderFrame();
        }
        requestAnimationFrame(loop);
      }
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
      const wx = ATMO.weatherTag ? ` ▸ ${ATMO.weatherTag}` : '';
      navClockMobile.innerHTML = `<span>${t} UTC${wx}</span>`;
    }
    updateMobileClock();
    setInterval(updateMobileClock, 1000);
  }

  /* ============================================================
     PC MODEL — interactive 3D workstation (uses page)
     Real-time Three.js tower you can orbit, zoom, and inspect.
     Hovering a component highlights its matching spec card (and
     vice-versa). Custom orbit/zoom — no OrbitControls dependency,
     so nothing extra has to load for it to work.
     ============================================================ */
  const pcCanvas = document.getElementById('pc-canvas');
  if (pcCanvas && typeof THREE !== 'undefined') {
    const stage   = pcCanvas.closest('.pc-schematic-stage');
    const loading = stage ? stage.querySelector('.pc-loading') : null;
    const readout = stage ? stage.querySelector('.pc-readout') : null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- resolve themed colours via a probe element (var() always resolves on `color`) ---
    const probe = document.createElement('span');
    probe.style.display = 'none';
    document.body.appendChild(probe);
    function cssColor(varName, fallback) {
      probe.style.color = '';
      probe.style.color = `var(${varName})`;
      const c = getComputedStyle(probe).color;
      return (c && c.startsWith('rgb')) ? c : (fallback || '#6ba3d8');
    }
    const palette = {};
    function loadPalette() {
      palette.accent  = new THREE.Color(cssColor('--accent',   '#6ba3d8'));
      palette.accent2 = new THREE.Color(cssColor('--accent-2', '#2dd4bf'));
      palette.accent3 = new THREE.Color(cssColor('--accent-3', '#b8d6ed'));
      palette.bg      = new THREE.Color(cssColor('--bg',        '#050608'));
      palette.elev    = new THREE.Color(cssColor('--bg-elev',   '#0a0d12'));
    }
    loadPalette();

    // --- scene / camera / renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(palette.bg.getHex(), 0.018);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    const HOME = { yaw: -0.62, pitch: 0.28, dist: 27 };
    const view = { yaw: HOME.yaw, pitch: HOME.pitch, dist: HOME.dist };
    const target = new THREE.Vector3(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: pcCanvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // --- lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(palette.accent3.getHex(), 0.9);
    key.position.set(6, 10, 8); scene.add(key);
    const rim = new THREE.DirectionalLight(palette.accent.getHex(), 0.7);
    rim.position.set(-8, 4, -6); scene.add(rim);
    const fill = new THREE.PointLight(palette.accent2.getHex(), 0.8, 40);
    fill.position.set(0, 2, 6); scene.add(fill);

    // --- model root (everything rotates together) ---
    const root = new THREE.Group();
    scene.add(root);

    // Track parts for hover + spec mapping. specIndex maps to the footer cards:
    // 0 OS · 1 GPU · 2 RAM · 3 STORAGE · 4 DISPLAY · 5 COOLING
    const parts = [];
    const mat = (color, opacity, metal, rough) => new THREE.MeshStandardMaterial({
      color, transparent: opacity < 1, opacity,
      metalness: metal == null ? 0.4 : metal,
      roughness: rough == null ? 0.55 : rough,
      emissive: new THREE.Color(0x000000)
    });

    // wireframe edge overlay for the technical/schematic feel
    function addEdges(mesh, color) {
      const eg = new THREE.EdgesGeometry(mesh.geometry, 25);
      const lm = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 });
      const lines = new THREE.LineSegments(eg, lm);
      mesh.add(lines);
      mesh.userData.edges = lm;
      return lines;
    }

    // helper: build a labelled part
    function part(geo, material, pos, meta) {
      const m = new THREE.Mesh(geo, material);
      m.position.set(pos[0], pos[1], pos[2]);
      addEdges(m, meta.edge || palette.accent.getHex());
      m.userData = Object.assign({ baseMat: material }, meta);
      root.add(m);
      if (meta.part) parts.push(m);
      return m;
    }

    // ============================================================
    // WHITE BUILD — modelled on the real MUSETEX panoramic rig:
    // 360 top radiator + 3 fans, 2 side intakes, 3 bottom fans,
    // white ASUS RTX (horizontal), AORUS board, white AIO + tubes.
    // ============================================================
    const fans = [];
    const COL = {
      white:  new THREE.Color(0xe9f1fb),
      white2: new THREE.Color(0xd2ddee),
      dark:   new THREE.Color(0x182230)
    };
    const fm = () => mat(COL.white2, 1, 0.35, 0.6);
    const caseW = 10, caseH = 12, caseD = 11;

    // reusable MUSETEX-style square fan with a spinning rotor (faces +Z)
    function makeFan(radius, color) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.09, 8, 22), mat(color, 1, 0.3, 0.6)));
      const half = radius * 1.02;
      [[half, half], [half, -half], [-half, half], [-half, -half]].forEach(([x, y]) => {
        const c = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.2, radius * 0.2, radius * 0.5), mat(color, 1, 0.3, 0.6));
        c.position.set(x, y, 0); g.add(c);
      });
      const rotor = new THREE.Group();
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.26, radius * 0.26, radius * 0.18, 14), mat(color.clone().multiplyScalar(0.92), 1, 0.4, 0.5));
      hub.rotation.x = Math.PI / 2; rotor.add(hub);
      for (let i = 0; i < 7; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.8, radius * 0.34, 0.05), mat(color, 1, 0.2, 0.7));
        const a = (i / 7) * Math.PI * 2;
        blade.position.set(Math.cos(a) * radius * 0.46, Math.sin(a) * radius * 0.46, 0);
        blade.rotation.z = a + 0.6;
        rotor.add(blade);
      }
      g.add(rotor);
      fans.push(rotor);
      return g;
    }

    // ---- chassis (white, open panoramic frame) ----
    part(new THREE.BoxGeometry(caseW, 0.3, caseD), fm(), [0, -caseH / 2, 0],
      { part: 'os', spec: 0, name: 'MUSETEX Chassis', sub: 'panoramic · tempered glass', edge: palette.accent.getHex() });
    part(new THREE.BoxGeometry(caseW, 0.3, caseD), fm(), [0, caseH / 2, 0],
      { part: 'cool', spec: 5, name: 'Top Mount', sub: '360mm radiator bay', edge: palette.accent2.getHex() });
    part(new THREE.BoxGeometry(0.3, caseH, caseD), fm(), [-caseW / 2, 0, 0],
      { name: 'Motherboard Tray', sub: 'rear panel', edge: palette.accent.getHex() });

    // vertical corner posts at the open glass edges
    [[caseW / 2, caseD / 2], [caseW / 2, -caseD / 2], [-caseW / 2, caseD / 2]].forEach(([x, z]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, caseH, 0.25), fm());
      post.position.set(x, 0, z); root.add(post);
    });

    // faint panoramic glass on the front (+z) and right (+x)
    const glassMat = new THREE.MeshStandardMaterial({
      color: palette.accent3, transparent: true, opacity: 0.06,
      metalness: 0.1, roughness: 0.05, side: THREE.DoubleSide
    });
    const gFront = new THREE.Mesh(new THREE.PlaneGeometry(caseW, caseH), glassMat);
    gFront.position.set(0, 0, caseD / 2); root.add(gFront);
    const gRight = new THREE.Mesh(new THREE.PlaneGeometry(caseD, caseH), glassMat);
    gRight.rotation.y = Math.PI / 2; gRight.position.set(caseW / 2, 0, 0); root.add(gRight);

    // ---- AORUS motherboard on the back wall ----
    part(new THREE.BoxGeometry(0.25, caseH - 3, caseD - 3), mat(COL.white, 1, 0.3, 0.7), [-caseW / 2 + 0.6, 0.5, 0],
      { name: 'AORUS Motherboard', sub: 'system board', edge: palette.accent.getHex() });
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, caseH - 3.5, 0.9), mat(palette.accent2, 1, 0.2, 0.5));
    stripe.position.set(-caseW / 2 + 0.78, 0.5, -2.3); root.add(stripe);

    // ---- CPU + AIO pump block ----
    part(new THREE.BoxGeometry(1.0, 2.0, 2.0), mat(COL.white, 1, 0.5, 0.4), [-caseW / 2 + 1.4, 3.0, 0.4],
      { part: 'cool', spec: 5, name: 'AIO Pump Block', sub: 'CPU · liquid-cooled', edge: palette.accent2.getHex() });

    // ---- two white braided AIO tubes from the pump up into the radiator ----
    // Pump block top sits at y=4.0 and the radiator underside at y=4.7, so the
    // tubes span 3.3 -> 5.1: both ends embed in a part and nothing pokes
    // through the top panel (y=6).
    [-0.5, 0.5].forEach(dz => {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.8, 10), mat(COL.white, 1, 0.2, 0.5));
      tube.position.set(-caseW / 2 + 1.45, 4.2, 0.4 + dz);
      tube.rotation.z = -0.12; // slight lean inward, toward the radiator body
      root.add(tube);
    });

    // ---- top radiator block beneath the 3 top fans ----
    part(new THREE.BoxGeometry(caseW - 2.4, 0.7, 2.6), mat(COL.white2, 1, 0.4, 0.5), [0.3, caseH / 2 - 0.95, 0],
      { part: 'cool', spec: 5, name: '360mm Radiator', sub: 'top-mounted AIO', edge: palette.accent2.getHex() });

    // ---- RAM ----
    for (let i = 0; i < 2; i++) {
      part(new THREE.BoxGeometry(0.22, 2.8, 0.6), mat(COL.white, 1, 0.4, 0.5), [-caseW / 2 + 1.05, 1.7, 1.5 + i * 0.8],
        { part: 'ram', spec: 2, name: '32 GB DDR5', sub: `DIMM ${i + 1}`, edge: palette.accent3.getHex() });
    }

    // ---- GPU (ASUS RTX, horizontal white shroud) ----
    part(new THREE.BoxGeometry(caseD - 3.5, 1.7, 4.4), mat(COL.white, 1, 0.5, 0.4), [0.6, -0.9, 0],
      { part: 'gpu', spec: 1, name: 'ASUS RTX 4070 Super', sub: 'graphics · 12 GB', edge: palette.accent.getHex() });
    const gStrip = new THREE.Mesh(new THREE.BoxGeometry(caseD - 3.5, 0.5, 0.12), mat(COL.dark, 1, 0.6, 0.4));
    gStrip.position.set(0.6, -1.3, 2.2); root.add(gStrip);
    const gLed = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshBasicMaterial({ color: palette.accent2 }));
    gLed.position.set(3.0, -0.6, 2.25); root.add(gLed);
    // two small fans on the GPU shroud (face up)
    [-1.5, 1.5].forEach(dx => {
      const f = makeFan(0.95, COL.white); f.rotation.x = Math.PI / 2; f.position.set(0.6 + dx, 0.05, 0); root.add(f);
    });

    // ---- SSD ----
    part(new THREE.BoxGeometry(0.35, 1.0, 1.6), mat(COL.white, 1, 0.4, 0.5), [-caseW / 2 + 0.95, -1.6, -2.6],
      { part: 'ssd', spec: 3, name: '1 TB NVMe SSD', sub: 'primary storage', edge: palette.accent2.getHex() });

    // ---- PSU shroud (rear-bottom chamber) ----
    part(new THREE.BoxGeometry(caseW - 1.4, 1.6, 3.2), mat(COL.white2, 1, 0.4, 0.5), [0, -caseH / 2 + 1.4, -caseD / 2 + 2.4],
      { name: 'PSU Shroud', sub: 'power · rear chamber', edge: palette.accent.getHex() });

    // ---- fan banks ----
    // top radiator: 3 fans facing down
    [-3, 0, 3].forEach(x => { const f = makeFan(1.35, COL.white); f.rotation.x = Math.PI / 2; f.position.set(x + 0.3, caseH / 2 - 1.7, 0); root.add(f); });
    // right side intake: 2 fans facing into the case
    [2.6, -2.6].forEach(y => { const f = makeFan(1.5, COL.white); f.rotation.y = Math.PI / 2; f.position.set(caseW / 2 - 0.5, y, 0); root.add(f); });
    // bottom intake: 3 fans facing up
    [-3, 0, 3].forEach(x => { const f = makeFan(1.3, COL.white); f.rotation.x = Math.PI / 2; f.position.set(x + 0.3, -caseH / 2 + 0.9, 1.2); root.add(f); });

    // ---- front power LED (pulses; recoloured each frame) ----
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: palette.accent2 }));
    led.position.set(-caseW / 2 + 0.4, caseH / 2 - 0.5, caseD / 2 - 0.4);
    root.add(led);

    // ---- monitor (display spec), slim white, off to the right ----
    const monitor = new THREE.Group();
    const mScreen = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4.6, 0.3),
      new THREE.MeshStandardMaterial({ color: palette.accent3, emissive: palette.accent.clone().multiplyScalar(0.22), metalness: 0.2, roughness: 0.3, transparent: true, opacity: 0.5 })
    );
    addEdges(mScreen, palette.accent3.getHex());
    Object.assign(mScreen.userData, { part: 'monitor', spec: 4, name: 'Dell 27" 4K', sub: 'display · 60 Hz' });
    monitor.add(mScreen); parts.push(mScreen);
    const mStand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3, 0.5), mat(COL.white2, 1, 0.4, 0.6));
    mStand.position.y = -3.6; monitor.add(mStand);
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 1.8), mat(COL.white2, 1, 0.4, 0.6));
    mBase.position.y = -5.1; monitor.add(mBase);
    monitor.position.set(12.5, -1.5, -1);
    monitor.rotation.y = -0.5;
    root.add(monitor);

    // ---- spec-card cross-highlight wiring ----
    const specCards = Array.from(document.querySelectorAll('.pc-spec'));
    function setSpecActive(idx) {
      specCards.forEach((s, i) => s.classList.toggle('active', i === idx));
    }
    function clearSpecActive() { specCards.forEach(s => s.classList.remove('active')); }

    let hovered = null;
    function highlightPart(mesh) {
      if (hovered === mesh) return;
      clearHighlight();
      hovered = mesh;
      if (!mesh) { setReadout(null); clearSpecActive(); return;
      }
      if (mesh.material && mesh.material.emissive) {
        mesh.material.emissive.copy(palette.accent2).multiplyScalar(0.55);
      }
      if (mesh.userData.edges) mesh.userData.edges.color.copy(palette.accent2);
      setReadout(mesh.userData);
      if (typeof mesh.userData.spec === 'number') setSpecActive(mesh.userData.spec);
    }
    function clearHighlight() {
      if (hovered && hovered.material && hovered.material.emissive) hovered.material.emissive.setHex(0x000000);
      if (hovered && hovered.userData.edges && hovered.userData.baseEdge) hovered.userData.edges.color.copy(hovered.userData.baseEdge);
      hovered = null;
    }
    // remember base edge colors so we can restore them
    parts.forEach(p => { if (p.userData.edges) p.userData.baseEdge = p.userData.edges.color.clone(); });

    function setReadout(data) {
      if (!readout) return;
      if (!data) {
        readout.innerHTML = '<span class="pc-readout-name">nx-rig-01</span><span class="pc-readout-sub">hover a component to inspect</span>';
        return;
      }
      readout.innerHTML = `<span class="pc-readout-name">${data.name}</span><span class="pc-readout-sub">${data.sub || ''}</span>`;
    }
    setReadout(null);

    // hovering a spec card highlights the matching mesh
    specCards.forEach((card, i) => {
      card.addEventListener('mouseenter', () => {
        const m = parts.find(p => p.userData.spec === i);
        if (m) highlightPart(m);
        else { clearHighlight(); setSpecActive(i); }
      });
      card.addEventListener('mouseleave', () => { highlightPart(null); });
    });

    // --- raycaster for pointer hover ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerInside = false;
    function updateRaycast() {
      if (!pointerInside || dragging) return;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(parts, false);
      highlightPart(hits.length ? hits[0].object : null);
    }

    // --- custom orbit + zoom controls ---
    let dragging = false, lastX = 0, lastY = 0, idle = 0;
    let autoSpin = !reduceMotion;
    const spinBtn = document.getElementById('pc-ctl-spin');
    const wireBtn = document.getElementById('pc-ctl-wire');
    const resetBtn = document.getElementById('pc-ctl-reset');

    function onDown(e) {
      dragging = true; idle = 0;
      stage && stage.classList.add('grabbing');
      const p = e.touches ? e.touches[0] : e;
      lastX = p.clientX; lastY = p.clientY;
      clearHighlight(); setReadout(null); clearSpecActive();
    }
    function onMove(e) {
      const rect = pcCanvas.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      pointer.x = ((p.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((p.clientY - rect.top) / rect.height) * 2 + 1;
      pointerInside = true;
      if (!dragging) return;
      idle = 0;
      const dx = p.clientX - lastX, dy = p.clientY - lastY;
      lastX = p.clientX; lastY = p.clientY;
      // "Grab the model" feel: dragging moves the surface under the pointer,
      // so the model turns with your hand (matches the grab cursor).
      view.yaw   -= dx * 0.008;
      view.pitch += dy * 0.008;
      view.pitch = Math.max(-0.75, Math.min(1.1, view.pitch));
      if (e.touches) e.preventDefault();
    }
    function onUp() { dragging = false; stage && stage.classList.remove('grabbing'); }
    function onWheel(e) {
      e.preventDefault();
      idle = 0;
      view.dist += e.deltaY * 0.02;
      view.dist = Math.max(15, Math.min(50, view.dist));
    }

    pcCanvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    pcCanvas.addEventListener('mouseleave', () => { pointerInside = false; if (!dragging) highlightPart(null); });

    // Hide the custom SVG cursor while over the stage — the native grab hand
    // takes over so it's obvious you can orbit the model.
    if (stage) {
      const arrowEl = document.getElementById('cursor-arrow');
      const trailEl = document.getElementById('cursor-trail-canvas');
      stage.addEventListener('mouseenter', () => {
        if (arrowEl) arrowEl.classList.add('hidden');
        if (trailEl) trailEl.classList.add('hidden');
      });
      stage.addEventListener('mouseleave', () => {
        if (arrowEl) arrowEl.classList.remove('hidden');
        if (trailEl) trailEl.classList.remove('hidden');
      });
    }
    pcCanvas.addEventListener('wheel', onWheel, { passive: false });
    pcCanvas.addEventListener('touchstart', onDown, { passive: true });
    pcCanvas.addEventListener('touchmove', onMove, { passive: false });
    pcCanvas.addEventListener('touchend', onUp);
    // pinch-zoom
    let pinchDist = 0;
    pcCanvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const a = e.touches[0], b = e.touches[1];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinchDist) { view.dist += (pinchDist - d) * 0.04; view.dist = Math.max(15, Math.min(50, view.dist)); }
        pinchDist = d; idle = 0; e.preventDefault();
      }
    }, { passive: false });
    pcCanvas.addEventListener('touchend', () => { pinchDist = 0; });

    if (spinBtn) {
      spinBtn.classList.toggle('active', autoSpin);
      spinBtn.addEventListener('click', () => { autoSpin = !autoSpin; spinBtn.classList.toggle('active', autoSpin); });
    }
    let wire = false;
    if (wireBtn) {
      wireBtn.addEventListener('click', () => {
        wire = !wire; wireBtn.classList.toggle('active', wire);
        root.traverse(o => {
          if (o.isMesh && o.material && 'wireframe' in o.material) o.material.wireframe = wire;
        });
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => { view.yaw = HOME.yaw; view.pitch = HOME.pitch; view.dist = HOME.dist; idle = 0; });
    }

    // --- recolour materials when the theme changes ---
    const themeObserver = new MutationObserver(() => {
      loadPalette();
      scene.fog.color.copy(palette.bg);
      key.color.copy(palette.accent3); rim.color.copy(palette.accent); fill.color.copy(palette.accent2);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // --- resize ---
    function resize() {
      const w = pcCanvas.clientWidth, h = pcCanvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    if (window.ResizeObserver && stage) new ResizeObserver(resize).observe(stage);
    window.addEventListener('resize', resize);
    resize();

    // --- render loop ---
    let started = false;
    function frame() {
      requestAnimationFrame(frame);
      idle++;
      if (autoSpin && !dragging && idle > 90) view.yaw += 0.0022;
      // ease camera onto the orbit position
      const cx = target.x + Math.sin(view.yaw) * Math.cos(view.pitch) * view.dist;
      const cy = target.y + Math.sin(view.pitch) * view.dist;
      const cz = target.z + Math.cos(view.yaw) * Math.cos(view.pitch) * view.dist;
      camera.position.lerp(new THREE.Vector3(cx, cy, cz), 0.12);
      camera.lookAt(target);
      // gentle LED pulse
      const t = performance.now() * 0.003;
      led.material.color.copy(palette.accent2).multiplyScalar(0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t)));
      if (!reduceMotion) { for (let i = 0; i < fans.length; i++) fans[i].rotation.z += 0.05; }
      updateRaycast();
      renderer.render(scene, camera);
      if (!started) { started = true; if (loading) loading.classList.add('hidden'); }
    }
    frame();
  } else if (pcCanvas && loadingFallback()) { /* THREE missing */ }

  function loadingFallback() {
    const stage = document.querySelector('.pc-schematic-stage');
    const loading = stage && stage.querySelector('.pc-loading');
    if (loading) loading.innerHTML = '<div style="color:var(--fg-dim);text-align:center;line-height:1.8;">3D MODULE OFFLINE<br><span style="font-size:9px;">specs available below</span></div>';
    return false;
  }

  /* ============================================================
     IMMERSION LAYER
     Ambient audio, live sector weather, pointer/tilt parallax,
     decode-in headings, idle veil, scroll depth.
     ============================================================ */

  /* -------- AMBIENT AUDIO — procedural, muted by default ---------
     No audio files. Rain is band-limited noise, wind is a slow
     bandpass swell, the hum is two low sine partials. UI ticks are
     tiny oscillator blips. Everything hangs off one context that
     only exists after the user opts in. */
  const AUDIO = {
    ctx: null, master: null, bed: null, rainGain: null,
    enabled: false, started: false, _lastHover: 0,
    pref() { try { return localStorage.getItem('nx-audio') === 'on'; } catch(e) { return false; } },
    setPref(on) { try { localStorage.setItem('nx-audio', on ? 'on' : 'off'); } catch(e) {} },
    syncUI(on) {
      document.querySelectorAll('.audio-toggle').forEach(t => {
        t.classList.toggle('on', on);
        t.classList.toggle('off', !on);
        const l = t.querySelector('.label');
        if (l) l.textContent = on ? 'AUDIO ON' : 'AUDIO OFF';
      });
    },
    start() {
      if (this.started) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = this.ctx = new AC();
      const master = this.master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      // The ambience bed fades in/out as a group; ticks bypass it.
      const bed = this.bed = ctx.createGain();
      bed.gain.value = 0;
      bed.connect(master);

      // One shared looped noise buffer feeds rain + wind
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

      // Rain
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = buf; rainSrc.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 420;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500;
      const rg = this.rainGain = ctx.createGain(); rg.gain.value = 0.05;
      rainSrc.connect(hp); hp.connect(lp); lp.connect(rg); rg.connect(bed);
      rainSrc.start();

      // Wind swell
      const windSrc = ctx.createBufferSource();
      windSrc.buffer = buf; windSrc.loop = true; windSrc.playbackRate.value = 0.45;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 240; bp.Q.value = 1.1;
      const wg = ctx.createGain(); wg.gain.value = 0.03;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lfoG = ctx.createGain(); lfoG.gain.value = 0.018;
      lfo.connect(lfoG); lfoG.connect(wg.gain);
      windSrc.connect(bp); bp.connect(wg); wg.connect(bed);
      windSrc.start(); lfo.start();

      // Machine hum
      const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55;
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 110.4;
      const h1 = ctx.createGain(); h1.gain.value = 0.022;
      const h2 = ctx.createGain(); h2.gain.value = 0.01;
      o1.connect(h1); h1.connect(bed);
      o2.connect(h2); h2.connect(bed);
      o1.start(); o2.start();

      // Rain loudness follows whether it is visually raining
      setInterval(() => {
        if (!this.ctx) return;
        const wet = document.documentElement.getAttribute('data-theme') === 'rain' || ATMO.rainLive;
        this.rainGain.gain.setTargetAtTime(wet ? 0.13 : 0.05, this.ctx.currentTime, 1.2);
      }, 2000);

      this.started = true;
    },
    enable(on) {
      this.setPref(on);
      this.enabled = on;
      this.syncUI(on);
      if (on) {
        this.start();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.bed.gain.setTargetAtTime(1, this.ctx.currentTime, 0.8);
      } else if (this.ctx) {
        this.bed.gain.setTargetAtTime(0, this.ctx.currentTime, 0.35);
      }
    },
    tick(kind) {
      if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
      if (kind === 'hover') {
        const now = performance.now();
        if (now - this._lastHover < 90) return;
        this._lastHover = now;
      }
      const t = this.ctx.currentTime;
      const conf = kind === 'hover' ? [2100, 0.012, 0.03]
                 : kind === 'key'   ? [2600, 0.02,  0.025]
                 :                    [1400, 0.05,  0.06];
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'square';
      o.frequency.value = conf[0];
      g.gain.setValueAtTime(conf[1], t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + conf[2]);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + conf[2] + 0.02);
    }
  };

  document.querySelectorAll('.audio-toggle').forEach(t => {
    t.addEventListener('click', () => AUDIO.enable(!AUDIO.enabled));
  });

  // Restore a saved "on" preference at the first user gesture — browsers
  // refuse to start an AudioContext before one.
  if (AUDIO.pref()) {
    AUDIO.syncUI(true);
    const arm = () => {
      document.removeEventListener('pointerdown', arm);
      document.removeEventListener('keydown', arm);
      AUDIO.enable(true);
    };
    document.addEventListener('pointerdown', arm);
    document.addEventListener('keydown', arm);
  }

  // UI ticks: hover, click, terminal keystrokes
  {
    const tickSel = 'a, button, .blog-card, .build-exhibit, .signal, .archive-entry, .timeline-tag, .archive-filter, .memory-node, .interrogation-option, [data-hover]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(tickSel)) AUDIO.tick('hover');
    });
    document.addEventListener('click', (e) => {
      if (e.target.closest(tickSel)) AUDIO.tick('click');
    });
    document.addEventListener('keydown', (e) => {
      const el = e.target;
      if (el && el.classList && el.classList.contains('terminal-input')) AUDIO.tick('key');
    });
  }

  /* -------- LIVE SECTOR WEATHER — the visitor's own sky ---------
     Locates the operator by IP (city-level, no permission prompt) via
     ipwho.is, then reads their sky from Open-Meteo. When it is actually
     raining (or snowing) where the visitor is, the rain canvas runs in
     every theme and the nav clock reports the feed. Falls back to
     Cincinnati HQ if the lookup fails. Cached in sessionStorage for
     30 minutes. Fails silent offline. */
  (function liveWeather() {
    const WET_CODES  = new Set([51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99]);
    const SNOW_CODES = new Set([71,73,75,77,85,86]);
    const HOME = { lat: 39.1031, lon: -84.5120, city: 'CINCINNATI' };
    function apply(wet, snow, city) {
      ATMO.rainLive = wet;
      ATMO.snow = snow;
      ATMO.city = city || 'UNKNOWN';
      ATMO.weatherTag = wet ? (snow ? 'WX SNOW LIVE' : 'WX RAIN LIVE') : 'WX DRY';
      const drawerStatus = document.querySelector('.nav-drawer-status');
      if (drawerStatus) drawerStatus.textContent = `UPLINK STABLE ▸ ${ATMO.weatherTag}`;
      if (wet) {
        let told = false;
        try { told = sessionStorage.getItem('nx-wx-toast') === '1'; } catch(e) {}
        if (!told) {
          try { sessionStorage.setItem('nx-wx-toast', '1'); } catch(e) {}
          NX.toast(`LIVE FEED ▸ ${snow ? 'SNOW' : 'RAIN'} OVER SECTOR ${city || 'LOCAL'}`);
        }
      }
    }
    try {
      const cached = JSON.parse(sessionStorage.getItem('nx-wx') || 'null');
      if (cached && Date.now() - cached.at < 30 * 60 * 1000) {
        apply(cached.wet, cached.snow, cached.city);
        return;
      }
    } catch(e) {}
    fetch('https://ipwho.is/')
      .then(r => r.json())
      .then(g => {
        const lat = parseFloat(g.latitude), lon = parseFloat(g.longitude);
        return (g.success !== false && isFinite(lat) && isFinite(lon))
          ? { lat, lon, city: (g.city || 'LOCAL').toUpperCase() }
          : HOME;
      })
      .catch(() => HOME)
      .then(loc =>
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat.toFixed(4)}&longitude=${loc.lon.toFixed(4)}&current=precipitation,weather_code`)
          .then(r => r.json())
          .then(j => {
            const cur = j && j.current ? j.current : {};
            const wet = WET_CODES.has(cur.weather_code) || (cur.precipitation || 0) > 0;
            const snow = SNOW_CODES.has(cur.weather_code);
            try { sessionStorage.setItem('nx-wx', JSON.stringify({ at: Date.now(), wet, snow, city: loc.city })); } catch(e) {}
            apply(wet, snow, loc.city);
          })
      )
      .catch(() => {}); // offline / blocked: the sky stays as the theme left it
  })();

  /* -------- POINTER / TILT PARALLAX ---------
     Haze, dust, and the hero name shift a few px against the pointer
     (or device tilt on mobile). Uses the standalone `translate`
     property so it composes with the existing CSS drift/glitch
     animations instead of overwriting their transforms. */
  (function parallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layers = [
      { el: document.querySelector('.haze-layer'),   fx: 26, fy: 18 },
      { el: document.getElementById('dust-canvas'),  fx: 12, fy: 9  },
      { el: document.querySelector('.hero-name'),    fx: -9, fy: -6 }
    ].filter(l => l.el);
    if (!layers.length) return;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-0.5, Math.min(0.5, e.gamma / 60));
      ty = Math.max(-0.5, Math.min(0.5, (e.beta - 40) / 60));
    }, { passive: true });
    (function step() {
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      for (const l of layers) {
        l.el.style.translate = `${(cx * l.fx).toFixed(2)}px ${(cy * l.fy).toFixed(2)}px`;
      }
      requestAnimationFrame(step);
    })();
  })();

  /* -------- DECODE-IN HEADINGS ---------
     Section titles scramble from archive glyphs into the real text
     when they scroll into view. Walks text nodes so markup like the
     <em> in the contact title survives. */
  (function decodeHeadings() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const GLYPHS = '▚▞▟◊╳░▒#%&$+=*<>/01';
    const els = document.querySelectorAll('.section-title, .contact-title');
    if (!els.length) return;
    function run(el) {
      const nodes = [];
      (function walk(n) {
        n.childNodes.forEach(c => {
          if (c.nodeType === 3 && c.textContent.trim()) nodes.push({ node: c, text: c.textContent });
          else if (c.nodeType === 1) walk(c);
        });
      })(el);
      const total = nodes.reduce((s, n) => s + n.text.length, 0);
      if (!total) return;
      const dur = Math.min(900, 300 + total * 30);
      const t0 = performance.now();
      (function frame(now) {
        const p = Math.min(1, (now - t0) / dur);
        const cut = Math.floor(p * total);
        let seen = 0;
        for (const { node, text } of nodes) {
          let out = '';
          for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            out += (seen + i < cut || ch === ' ') ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          node.textContent = out;
          seen += text.length;
        }
        if (p < 1) requestAnimationFrame(frame);
        else for (const { node, text } of nodes) node.textContent = text;
      })(t0);
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        run(en.target);
      });
    }, { threshold: 0.4 });
    els.forEach(el => io.observe(el));
  })();

  /* -------- IDLE VEIL — the archive notices you left ---------
     90s without input dims the page behind a SIGNAL IDLE readout.
     Any input clears it. Never shows in a hidden tab. */
  (function idleVeil() {
    const IDLE_MS = 90000;
    let timer = null, veil = null;
    function show() {
      if (veil || document.visibilityState !== 'visible') return;
      veil = document.createElement('div');
      veil.id = 'idle-veil';
      veil.setAttribute('aria-hidden', 'true');
      veil.innerHTML = `
        <div class="idle-box">
          <div class="idle-line"></div>
          <div class="idle-text">SIGNAL IDLE</div>
          <div class="idle-sub">// awaiting operator input</div>
        </div>`;
      document.body.appendChild(veil);
      requestAnimationFrame(() => veil.classList.add('show'));
    }
    function hide() {
      if (!veil) return;
      const v = veil;
      veil = null;
      v.classList.remove('show');
      setTimeout(() => v.remove(), 800);
    }
    function poke() {
      hide();
      clearTimeout(timer);
      timer = setTimeout(show, IDLE_MS);
    }
    ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(ev =>
      document.addEventListener(ev, poke, { passive: true })
    );
    document.addEventListener('visibilitychange', poke);
    poke();
  })();

  /* -------- SCROLL DEPTH — descend into the archive ---------
     A radial shade darkens the edges as you scroll deeper, and the
     rain (when active) falls harder toward the bottom of the page. */
  (function scrollDepth() {
    const shade = document.createElement('div');
    shade.className = 'depth-shade';
    shade.setAttribute('aria-hidden', 'true');
    document.body.appendChild(shade);
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const depth = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      shade.style.opacity = (depth * 0.3).toFixed(3);
      ATMO.rainIntensity = 0.75 + depth * 0.5;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  })();

  /* ============================================================
     DEFENSE GRID — uplink page
     The one panel on the console that is NOT synthetic: it reads
     this site's actual response headers back from the edge and
     renders the live security posture.
     ============================================================ */
  const defenseEl = document.getElementById('uplink-defense');
  if (defenseEl) {
    const WANT = [
      ['content-security-policy',      'CSP'],
      ['strict-transport-security',    'HSTS'],
      ['x-content-type-options',       'XCTO'],
      ['x-frame-options',              'XFO'],
      ['referrer-policy',              'REFERRER'],
      ['permissions-policy',           'PERMISSIONS'],
      ['cross-origin-opener-policy',   'COOP'],
      ['cross-origin-resource-policy', 'CORP']
    ];
    fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
      .then(res => {
        defenseEl.textContent = '';
        let shielded = 0;
        WANT.forEach(([h, short]) => {
          const v = res.headers.get(h);
          const row = document.createElement('div');
          row.className = `defense-row ${v ? 'ok' : 'bad'}`;
          const state = document.createElement('span');
          state.className = 'defense-state';
          state.textContent = v ? 'SHIELDED' : 'EXPOSED';
          const key = document.createElement('span');
          key.className = 'defense-key';
          key.textContent = short;
          const val = document.createElement('span');
          val.className = 'defense-val';
          val.textContent = v ? (v.length > 96 ? v.slice(0, 93) + '...' : v) : 'header not present on this origin';
          row.append(state, key, val);
          defenseEl.appendChild(row);
          if (v) shielded++;
        });
        const note = document.createElement('div');
        note.className = 'defense-note';
        note.textContent = shielded === WANT.length
          ? `// ${shielded}/${WANT.length} shields up — live values read from this response, not lore`
          : `// ${shielded}/${WANT.length} shields up — local/dev origins serve fewer headers than the production edge`;
        defenseEl.appendChild(note);
      })
      .catch(() => {
        defenseEl.textContent = '';
        const note = document.createElement('div');
        note.className = 'defense-note';
        note.textContent = '// edge interrogation failed — offline, or viewing via file://';
        defenseEl.appendChild(note);
      });
  }

})();
