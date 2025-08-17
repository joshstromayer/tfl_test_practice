// --- helpers ---
function toggleBlur(el){
    el.classList.toggle('blur');
    const btn = el.previousElementSibling;
    if(btn && btn.tagName === 'BUTTON'){
      btn.textContent = el.classList.contains('blur') ? 'Reveal Answers' : 'Hide Answers';
    }
  }
  window.toggleBlur = toggleBlur; // needed for inline onclick
  
  function makeQuickfireItem(idx, prompt, answer, explain){
    const id = 'qf-'+idx;
    return `
      <div class="card">
        <div class="pill">Sentence ${idx+1}</div>
        <p style="margin-top:8px;">${prompt}</p>
        <div class="row" style="margin-top:8px;">
          <input type="text" placeholder="Type your corrected sentence…" aria-label="Correct sentence ${idx+1}" id="${id}-input" />
          <button class="btn small" onclick="document.getElementById('${id}-ans').classList.remove('blur')">Reveal Answer</button>
        </div>
        <div class="answer">
          <div class="blur" id="${id}-ans">
            <p><b>Model correction:</b> ${answer}</p>
            <p class="muted"><b>Why:</b> ${explain}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  function makeParagraphItem(idx, faulty, fixed, explain){
    const id = 'para-'+idx;
    return `
      <div class="card">
        <div class="pill">Paragraph ${idx+1}</div>
        <p class="muted" style="margin-top:8px;">Fix the text below.</p>
  
        <!-- Always-visible faulty text -->
        <div class="faulty-box" style="margin:8px 0; padding:12px; border:1px dashed rgba(148,163,184,0.35); border-radius:10px; background: rgba(148,163,184,0.06);">
          <p style="margin:0 0 6px 0;"><b>Original (with errors):</b></p>
          <p style="margin:0;">${faulty}</p>
        </div>
  
        <!-- User rewrite area -->
        <textarea rows="6" placeholder="Rewrite the paragraph with correct grammar and punctuation…" aria-label="Rewrite paragraph ${idx+1}" id="${id}-input"></textarea>
  
        <!-- Model answer behind Reveal -->
        <div class="answer">
          <button class="btn small" onclick="toggleBlur(document.getElementById('${id}-ans'))">Reveal Answer</button>
          <div class="blur" id="${id}-ans">
            <p><b>Model correction:</b></p>
            <p>${fixed}</p>
            <p class="muted"><b>Why:</b> ${explain}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  
  function makeHomophoneItem(idx, stem, choices, correct, tip){
    const id = 'homo-'+idx;
    const opts = choices.map(c=>`<label><input type="radio" name="${id}" value="${c}"> ${c}</label>`).join('<br>');
    return `
      <div class="card">
        <div class="pill">Word choice ${idx+1}</div>
        <p style="margin-top:6px;">${stem}</p>
        <div style="margin:8px 0;">
          ${opts}
        </div>
        <button class="btn small" onclick="checkChoice('${id}','${correct}','${tip}')">Check</button>
        <p id="${id}-res" class="muted" style="margin-top:8px;"></p>
      </div>
    `;
  }
  
  function checkChoice(id, correct, tip){
    const sel = document.querySelector('input[name="'+id+'"]:checked');
    const out = document.getElementById(id+'-res');
    if(!sel){ out.innerHTML = '<span class="bad"><b>Please select an option.</b></span>'; return; }
    if(sel.value === correct){
      out.innerHTML = '<span class="ok"><b>Correct.</b></span> '+ tip;
    } else {
      out.innerHTML = '<span class="bad"><b>Not quite.</b></span> Correct answer: <b>'+correct+'</b>. ' + tip;
    }
  }
  window.checkChoice = checkChoice; // for inline onclick
  
  // --- data ---
  const quickfire = [
    {
      p: "the customer forgot there card and wants too borrow a pen can i help them",
      a: "The customer forgot their card and wants to borrow a pen. Can I help them?",
      e: "Capital letters, their/there, too/to, two sentences need a full stop, question needs a question mark."
    },
    {
      p: "Trains to stratford is delayed due to an incident please listen for further announcements",
      a: "Trains to Stratford are delayed due to an incident. Please listen for further announcements.",
      e: "Proper noun capitalisation (Stratford), subject–verb agreement (trains are), add full stop."
    },
    {
      p: "If you have any questions ask a member of staff they will be happy to help",
      a: "If you have any questions, ask a member of staff; they will be happy to help.",
      e: "Comma after the opening clause; use a semicolon (or a full stop) to avoid a run-on sentence."
    },
    {
      p: "Childrens tickets arent valid before 9 30 am on weekdays",
      a: "Children’s tickets aren’t valid before 09:30 am on weekdays.",
      e: "Apostrophes (children’s, aren’t), time formatting (09:30), spacing and capitalisation for 'am' is acceptable either lower or upper case if consistent."
    },
    {
      p: "Please keep you’re belongings with you at all times",
      a: "Please keep your belongings with you at all times.",
      e: "your/you’re confusion: 'you’re' = 'you are'. Here we need the possessive 'your'."
    },
    {
      p: "the station managers decision was final it cant be appealed",
      a: "The Station Manager’s decision was final; it can’t be appealed.",
      e: "Capitalise the job title when used before a role, apostrophe for possession (Manager’s), and fix the run-on (semicolon)."
    },
    {
      p: "Im sorry the lift isnt working today were arranging a repair",
      a: "I’m sorry, the lift isn’t working today; we’re arranging a repair.",
      e: "Contractions need apostrophes (I’m, isn’t, we’re) and punctuation to split independent clauses."
    },
    {
      p: "there is no services to ealing broadway after 10 pm tonight",
      a: "There are no services to Ealing Broadway after 10 pm tonight.",
      e: "There are (plural), capitalise proper nouns (Ealing Broadway)."
    },
    {
      p: "Lost property are kept at the ticket office please fill in the form",
      a: "Lost property is kept at the ticket office. Please fill in the form.",
      e: "‘Lost property’ is treated as singular; split into two sentences."
    },
    {
      p: "you must validate your oyster before enter the gateline",
      a: "You must validate your Oyster before entering the gateline.",
      e: "Capitalise brand names (Oyster) and use the -ing form after 'before' when describing the action."
    }
  ];
  
  const paras = [
    {
      faulty: "due to scheduled engineering works the district line will be part suspended between west kensington and earls court from 21:00 on friday services will resume at 06:00 on saturday customers should allow extra time and follow staff advise signs will be posted at the entrance",
      fixed: "Due to scheduled engineering works, the District line will be part-suspended between West Kensington and Earl’s Court from 21:00 on Friday. Services will resume at 06:00 on Saturday. Customers should allow extra time and follow staff advice. Signs will be posted at the entrance.",
      explain: "Capitalisation of proper nouns; hyphen in compound adjective (part-suspended); punctuation to split sentences; advice (noun) not advise (verb)."
    },
    {
      faulty: "we apologise for any inconvenience please note mobility assistance is available however you need to contact the station team atleast 24 hours before your journey",
      fixed: "We apologise for any inconvenience. Please note, mobility assistance is available; however, you need to contact the station team at least 24 hours before your journey.",
      explain: "Split run-ons into sentences; comma after introductory phrase; semicolon before conjunctive adverb 'however'; 'at least' is two words."
    }
  ];
  
  const homos = [
    { stem: "Please stand behind the yellow (line / lign).", choices:["line","lign"], correct:"line", tip:"Spelling: 'line' is correct." },
    { stem: "The train has (departed / deported) from Platform 3.", choices:["departed","deported"], correct:"departed", tip:"'Departed' means left; 'deported' is removed from a country." },
    { stem: "Customers must (buy / by) a valid ticket before travel.", choices:["buy","by"], correct:"buy", tip:"'Buy' = purchase; 'by' = preposition." },
    { stem: "Please mind (there / their / they’re) belongings.", choices:["there","their","they’re"], correct:"their", tip:"Possessive form for belongings." },
    { stem: "If (it’s / its) urgent, speak to a member of staff.", choices:["it’s","its"], correct:"it’s", tip:"'it’s' = 'it is'; 'its' is possessive." }
  ];
  
  const timetable = [
    { svc:"A1", from:"Walthamstow Central", to:"Oxford Circus", depart:"08:10", arrive:"08:34", stops:7 },
    { svc:"B7", from:"Ealing Broadway", to:"Paddington", depart:"08:12", arrive:"08:27", stops:4 },
    { svc:"C3", from:"Stratford", to:"Liverpool Street", depart:"08:15", arrive:"08:23", stops:2 },
    { svc:"D4", from:"Victoria", to:"Green Park", depart:"08:18", arrive:"08:22", stops:1 },
    { svc:"E2", from:"Acton Town", to:"Hammersmith", depart:"08:20", arrive:"08:35", stops:5 }
  ];
  
  const ttQs = [
    "Which service gets you from Stratford to Liverpool Street the fastest?",
    "If you leave Ealing Broadway at 08:12 on B7, what time do you arrive?",
    "How many stops are there between Victoria and Green Park on D4?",
    "Which services arrive by 08:25?",
    "You must be at Oxford Circus by 08:35. Which service should you take from the list?"
  ];
  
  const ttAns = [
    "C3 is fastest from Stratford to Liverpool Street (08:15 → 08:23).",
    "B7 arrives at 08:27.",
    "D4 has 1 stop between Victoria and Green Park.",
    "C3 (arrives 08:23) and D4 (arrives 08:22) arrive by 08:25.",
    "Take A1 (Walthamstow Central → Oxford Circus, arrives 08:34) to make 08:35."
  ];
  
  const tickets = [
    {
      title: "Off-Peak Day Travelcard (Zones 1–4), dated today, used at 08:15 on a weekday",
      ask: "Valid or invalid? Why?",
      answer: "Likely <b>Invalid</b> at 08:15 on a weekday if off-peak validity starts after the morning peak (typically after 09:30). <br><span class='muted'>Reason:</span> Off-peak products usually aren’t valid during morning peak times."
    },
    {
      title: "Child Oyster (11–15 Zip) used by a 17-year-old",
      ask: "Valid or invalid?",
      answer: "<b>Invalid</b>. The age entitlement has expired; a 17-year-old needs the correct product or adult fare."
    },
    {
      title: "Paper ticket Zone 1–2, journey entirely in Zone 2",
      ask: "Valid or invalid?",
      answer: "<b>Valid</b> for travel wholly within Zones 1–2, including Zone 2 only. <span class='muted'>(Provided date/time conditions are met.)</span>"
    },
    {
      title: "Damaged paper ticket: date unreadable",
      ask: "What should you do?",
      answer: "Treat as <b>not clearly valid</b>; follow local process (e.g., refer to a supervisor, revenue protection guidance). Avoid accusations; stay polite and procedural."
    },
    {
      title: "Photocard required but not presented (season ticket)",
      ask: "Valid or invalid? Next step?",
      answer: "<b>Not valid for use</b> without the matching photocard. Next step: follow policy (e.g., issue a report or advise the customer how to prove entitlement) per local guidance."
    }
  ];
  
  // --- render ---
  function render(){
    // Quickfire
    const qf = document.getElementById('quickfire');
    qf.innerHTML = quickfire.map((q,i)=> makeQuickfireItem(i,q.p,q.a,q.e)).join('');
  
    // Paragraphs
    const parasWrap = document.getElementById('paragraphs');
    parasWrap.innerHTML = paras.map((q,i)=> makeParagraphItem(i,q.faulty,q.fixed,q.explain)).join('');
  
    // Homophones
    const homoWrap = document.getElementById('homophones');
    homoWrap.innerHTML = homos.map((h,i)=> makeHomophoneItem(i,h.stem,h.choices,h.correct,h.tip)).join('');
  
    // Timetable rows
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = timetable.map(r=>`
      <tr><td>${r.svc}</td><td>${r.from}</td><td>${r.to}</td><td>${r.depart}</td><td>${r.arrive}</td><td>${r.stops}</td></tr>
    `).join('');
  
    // Timetable Qs + model answers
    document.getElementById('tt-qs').innerHTML = ttQs.map(q=>`<li>${q}</li>`).join('');
    document.getElementById('tt-soln').innerHTML = '<ol>' + ttAns.map(a=>`<li>${a}</li>`).join('') + '</ol>';
  
    // Ticket cases
    const tc = document.getElementById('ticket-cases');
    tc.innerHTML = tickets.map((t,i)=>`
      <div class="card">
        <div class="pill">Case ${i+1}</div>
        <h3 style="margin-top:8px;">${t.title}</h3>
        <p class="muted">${t.ask}</p>
        <textarea rows="3" placeholder="Type your decision and reason…"></textarea>
        <div class="answer">
          <button class="btn small" onclick="toggleBlur(this.nextElementSibling)">Reveal Answer</button>
          <div class="blur"><p>${t.answer}</p></div>
        </div>
      </div>
    `).join('');
  
    // Nav active state
    const links = document.querySelectorAll('nav a');
    function setActive(){
      const hash = window.location.hash || '#home';
      links.forEach(a=> a.classList.toggle('active', a.getAttribute('href')===hash));
    }
    window.addEventListener('hashchange', setActive);
    setActive();
  }
  
  document.addEventListener('DOMContentLoaded', render);
  
