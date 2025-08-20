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
        <div style="margin-top:8px;">
          <button class="btn small" onclick="markDone('qf',${idx})">✓ Mark as done</button>
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
  
        <div class="faulty-box" style="margin:8px 0; padding:12px; border:1px dashed rgba(148,163,184,0.35); border-radius:10px; background: rgba(148,163,184,0.06);">
          <p style="margin:0 0 6px 0;"><b>Original (with errors):</b></p>
          <p style="margin:0;">${faulty}</p>
        </div>
  
        <textarea rows="6" placeholder="Rewrite the paragraph with correct grammar and punctuation…" aria-label="Rewrite paragraph ${idx+1}" id="${id}-input"></textarea>
  
        <div class="answer" style="margin-top:8px;">
          <button class="btn small" onclick="toggleBlur(document.getElementById('${id}-ans'))">Reveal Answer</button>
          <div class="blur" id="${id}-ans">
            <p><b>Model correction:</b></p>
            <p>${fixed}</p>
            <p class="muted"><b>Why:</b> ${explain}</p>
          </div>
        </div>
  
        <div style="margin-top:8px;">
          <button class="btn small" onclick="markDone('para',${idx})">✓ Mark as done</button>
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
  
        <div style="margin-top:8px;">
          <button class="btn small" onclick="markDone('homo',${idx})">✓ Mark as done</button>
        </div>
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

// Mark as done + persist
function markDone(type, idx){
  const key = type + "-done";
  const done = JSON.parse(localStorage.getItem(key) || "[]");
  if(!done.includes(idx)){
    done.push(idx);
    localStorage.setItem(key, JSON.stringify(done));
  }
  render(); // re-render to hide the item
}
window.markDone = markDone; // if you're using inline onclick


  
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
    },
    {
      p: "i seen the passenger drop there wallet on the plat form",
      a: "I saw the passenger drop their wallet on the platform.",
      e: "Past tense 'saw', their/there, platform spelling, capitalisation."
    },
    {
      p: "staff was told too check the fire alarm every morning",
      a: "Staff were told to check the fire alarm every morning.",
      e: "Staff = plural, so 'were'; too/to confusion."
    },
    {
      p: "please use the stairs lift is out of order",
      a: "Please use the stairs. The lift is out of order.",
      e: "Two separate sentences needed."
    },
    {
      p: "customers should of validated there tickets",
      a: "Customers should have validated their tickets.",
      e: "Common mistake: 'should of' → 'should have'; their/there."
    },
    {
      p: "Were closing the station at 11 pm for cleaning",
      a: "We’re closing the station at 23:00 for cleaning.",
      e: "We’re vs were; consistent 24-hour clock."
    },
    {
      p: "can you help me find my seat its number 42",
      a: "Can you help me find my seat? It’s number 42.",
      e: "Capitalisation; question mark; It’s = it is."
    },
    {
      p: "were happy to announce the lift is back in service",
      a: "We’re happy to announce the lift is back in service.",
      e: "We’re = we are; capitalisation."
    },
    {
      p: "please leave youre bags unattended at your own risk",
      a: "Please do not leave your bags unattended; it is at your own risk.",
      e: "Negative imperative; your/you’re confusion."
    },
    {
      p: "station close at 11 pm tonight",
      a: "The station closes at 23:00 tonight.",
      e: "Subject–verb agreement; consistent 24-hour time."
    },
    {
      p: "the toilets is on the right",
      a: "The toilets are on the right.",
      e: "Subject–verb agreement."
    },
    {
      p: "passangers are adviced to stand clear of the doors",
      a: "Passengers are advised to stand clear of the doors.",
      e: "Spelling (passengers), verb form (advised)."
    },
    {
      p: "dont cross the track its dangerus",
      a: "Don’t cross the track; it’s dangerous.",
      e: "Contraction apostrophes; spelling (dangerous)."
    },
    {
      p: "i will meet you their at 9 am",
      a: "I will meet you there at 09:00.",
      e: "Their/there confusion; time formatting."
    },
    {
      p: "there was less people waiting today",
      a: "There were fewer people waiting today.",
      e: "Less/fewer distinction; subject–verb agreement."
    },
    {
      p: "tickets must of been validated before boarding",
      a: "Tickets must have been validated before boarding.",
      e: "Must have, not must of."
    },
    {
      p: "the gates is closing please stand back",
      a: "The gates are closing. Please stand back.",
      e: "Verb agreement; split sentences."
    },
    {
      p: "we apologise for delay train broke down",
      a: "We apologise for the delay; the train broke down.",
      e: "Article needed; semicolon for run-on."
    },
    {
      p: "customers should follow signs its on platform three",
      a: "Customers should follow the signs; it’s on platform three.",
      e: "Article needed; it’s = it is."
    },
    {
      p: "staff were told check the alarms",
      a: "Staff were told to check the alarms.",
      e: "Infinitive needs 'to'."
    },
    {
      p: "the ticket costed five pounds",
      a: "The ticket cost five pounds.",
      e: "Irregular verb: cost, not costed."
    },
    {
      p: "please be quite in the waiting room",
      a: "Please be quiet in the waiting room.",
      e: "Spelling mistake: quiet/quite."
    },
    {
      p: "im sure your going the right way",
      a: "I’m sure you’re going the right way.",
      e: "Contractions and apostrophes (I’m, you’re)."
    },
    {
      p: "she gave me advise about travel",
      a: "She gave me advice about travel.",
      e: "Advice (noun) vs advise (verb)."
    },
    {
      p: "the lift arent working properly",
      a: "The lift isn’t working properly.",
      e: "Subject–verb agreement; contraction."
    },
    {
      p: "there tickets was invalid",
      a: "Their tickets were invalid.",
      e: "Their/there confusion; verb agreement."
    },
    {
      p: "the customers didnt had enough balance",
      a: "The customers didn’t have enough balance.",
      e: "Past tense auxiliary: didn’t + have."
    },
    {
      p: "i seen the bus leave already",
      a: "I saw the bus leave already.",
      e: "Seen vs saw (simple past)."
    },
    {
      p: "the station is busyer than usual",
      a: "The station is busier than usual.",
      e: "Comparative spelling: busier."
    },
    {
      p: "were expecting a delay due too signalling issue",
      a: "We’re expecting a delay due to a signalling issue.",
      e: "We’re vs were; too/to confusion; article needed."
    },
    {
      p: "the annoucement wasnt clear enough",
      a: "The announcement wasn’t clear enough.",
      e: "Spelling (announcement); apostrophe."
    },
    {
      p: "the ticket machine dont work today",
      a: "The ticket machine doesn’t work today.",
      e: "Subject–verb agreement; contraction."
    },
    {
      p: "were not allow to enter without staff permission",
      a: "We’re not allowed to enter without staff permission.",
      e: "Past participle: allowed; we’re vs were."
    },
    {
      p: "the passanger said there going home",
      a: "The passenger said they’re going home.",
      e: "Passenger spelling; there/they’re confusion."
    },
    {
      p: "please be awear of slippery floors",
      a: "Please be aware of slippery floors.",
      e: "Awear/aware confusion."
    },
    {
      p: "we was late for the meeting",
      a: "We were late for the meeting.",
      e: "Verb agreement: we were."
    },
    {
      p: "the staff dont knows the answer",
      a: "The staff don’t know the answer.",
      e: "Staff treated as plural; know not knows."
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
    },
    {
      faulty: "due to scheduled engineering works the district line will be part suspended between west kensington and earls court from 21:00 on friday services will resume at 06:00 on saturday customers should allow extra time and follow staff advise signs will be posted at the entrance",
      fixed: "Due to scheduled engineering works, the District line will be part-suspended between West Kensington and Earl’s Court from 21:00 on Friday. Services will resume at 06:00 on Saturday. Customers should allow extra time and follow staff advice. Signs will be posted at the entrance.",
      explain: "Capitalisation of proper nouns; hyphen in compound adjective (part-suspended); punctuation to split sentences; advice not advise."
    },
    {
      faulty: "we apologise for any inconvenience please note mobility assistance is available however you need to contact the station team atleast 24 hours before your journey",
      fixed: "We apologise for any inconvenience. Please note, mobility assistance is available; however, you need to contact the station team at least 24 hours before your journey.",
      explain: "Split run-ons; semicolon before 'however'; 'at least' is two words."
    },
    {
      faulty: "for your safety we ask all passengers to remain behind the yellow line dont cross until the train has stopped doors have opened and staff have confirmed it is safe",
      fixed: "For your safety, we ask all passengers to remain behind the yellow line. Do not cross until the train has stopped, the doors have opened, and staff have confirmed it is safe.",
      explain: "Comma after introductory phrase; separate sentences; consistent imperatives; Oxford comma improves clarity."
    },
    {
      faulty: "customers are reminded smoking eating and drinking is not allow anywhere in the station please dispose rubbish responsibly",
      fixed: "Customers are reminded that smoking, eating, and drinking are not allowed anywhere in the station. Please dispose of rubbish responsibly.",
      explain: "Parallel structure; verb agreement (are not allowed); add missing 'of'; punctuation."
    },
    {
      faulty: "customers is requested to keep noise levels low in the waiting area this include phone conversations music and group discussions thank you for your cooperation",
      fixed: "Customers are requested to keep noise levels low in the waiting area. This includes phone conversations, music, and group discussions. Thank you for your cooperation.",
      explain: "Verb agreement; split run-ons; parallel list punctuation."
    },
    {
      faulty: "due to the bad wheather trains may be delayed we apologies for any inconvenience caused passengers should check displays for updates",
      fixed: "Due to the bad weather, trains may be delayed. We apologise for any inconvenience caused. Passengers should check displays for updates.",
      explain: "Spelling (weather); punctuation; capitalisation."
    },
    {
      faulty: "the last train to richmond leave at 23:30 on weekdays please make sure you board before this time otherwise you may need alternative travel",
      fixed: "The last train to Richmond leaves at 23:30 on weekdays. Please make sure you board before this time; otherwise, you may need alternative travel.",
      explain: "Capitalisation; subject–verb agreement; semicolon for conjunctive adverb."
    },
    {
      faulty: "items found unattended will be removed and may not return to there owner please keep your belongings with you",
      fixed: "Items found unattended will be removed and may not be returned to their owner. Please keep your belongings with you.",
      explain: "Verb form; there/their confusion; split run-on."
    },
    {
      faulty: "for safety reasons pushchairs must be fold before entering the escalator staff will assist if required",
      fixed: "For safety reasons, pushchairs must be folded before entering the escalator. Staff will assist if required.",
      explain: "Verb form; punctuation; comma after introductory phrase."
    },
    {
      faulty: "passangers are not aloud beyond this point unless accompanied by staff failure to follow rules may result in removal",
      fixed: "Passengers are not allowed beyond this point unless accompanied by staff. Failure to follow the rules may result in removal.",
      explain: "Spelling (passengers, allowed); split run-on; missing article."
    },
    {
      faulty: "there is currently engineering work effecting the victoria line services will resume normaly at 05:30 on monday",
      fixed: "There is currently engineering work affecting the Victoria line. Services will resume normally at 05:30 on Monday.",
      explain: "Affecting/effecting confusion; capitalisation; spelling (normally)."
    },
    {
      faulty: "please note dogs must be keep on a lead at all times in the station failure may lead to penalty",
      fixed: "Please note, dogs must be kept on a lead at all times in the station. Failure to do so may lead to a penalty.",
      explain: "Verb form; add 'to do so'; article before penalty."
    },
    {
      faulty: "customers with valid tickits can enter through gate b however staff will check randomly",
      fixed: "Customers with valid tickets can enter through Gate B; however, staff will check randomly.",
      explain: "Spelling (tickets); capitalisation; semicolon before 'however'."
    },
    {
      faulty: "all lost properties is stored in the office customers may collect items with proof of ownership",
      fixed: "All lost property is stored in the office. Customers may collect items with proof of ownership.",
      explain: "‘Lost property’ treated as singular; punctuation."
    }
  ];
  
  const homos = [
    { stem: "Please stand behind the yellow (line / lign).", choices:["line","lign"], correct:"line", tip:"Spelling: 'line' is correct." },
    { stem: "The train has (departed / deported) from Platform 3.", choices:["departed","deported"], correct:"departed", tip:"'Departed' means left; 'deported' is removed from a country." },
    { stem: "Customers must (buy / by) a valid ticket before travel.", choices:["buy","by"], correct:"buy", tip:"'Buy' = purchase; 'by' = preposition." },
    { stem: "Please mind (there / their / they’re) belongings.", choices:["there","their","they’re"], correct:"their", tip:"Possessive form for belongings." },
    { stem: "If (it’s / its) urgent, speak to a member of staff.", choices:["it’s","its"], correct:"it’s", tip:"'it’s' = 'it is'; 'its' is possessive." },
    { stem: "Please (accept / except) our apologies for the delay.", choices:["accept","except"], correct:"accept", tip:"'Accept' = receive/agree; 'except' = apart from." },
    { stem: "Your train is due later (than / then) expected.", choices:["than","then"], correct:"than", tip:"'Than' for comparison; 'then' for sequence/time." },
    { stem: "The ticket machine is out of (order / ordour).", choices:["order","ordour"], correct:"order", tip:"'Order' = correct word; 'odour' = smell." },
    { stem: "Please take a (complement / compliment) slip at the desk.", choices:["complement","compliment"], correct:"compliment", tip:"Compliment = polite remark; complement = completes something." },
    { stem: "The escalator is (stationary / stationery) for repairs.", choices:["stationary","stationery"], correct:"stationary", tip:"Stationary = not moving; stationery = paper, pens, etc." },
    { stem: "He may (lose / loose) his ticket if not careful.", choices:["lose","loose"], correct:"lose", tip:"Lose = misplace; loose = not tight." },
    { stem: "This update will not (affect / effect) your journey.", choices:["affect","effect"], correct:"affect", tip:"Affect = verb (influence); effect = noun (result)." },
    { stem: "The Oyster reader is not working, please try (again / gain).", choices:["again","gain"], correct:"again", tip:"'Again' means once more; 'gain' = obtain." },
    { stem: "If (it’s / its) urgent, speak to staff immediately.", choices:["it’s","its"], correct:"it’s", tip:"It’s = it is; its = possessive." },
    { stem: "Please mind (there / their / they’re) luggage at all times.", choices:["there","their","they’re"], correct:"their", tip:"Possessive form for belongings." }
  
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
    const doneQF = JSON.parse(localStorage.getItem("qf-done") || "[]");
    qf.innerHTML = quickfire
      .map((q,i)=> doneQF.includes(i) ? "" : makeQuickfireItem(i,q.p,q.a,q.e))
      .join('');
  
    // Paragraphs
    const parasWrap = document.getElementById('paragraphs');
    const donePara = JSON.parse(localStorage.getItem("para-done") || "[]");
    parasWrap.innerHTML = paras
      .map((q,i)=> donePara.includes(i) ? "" : makeParagraphItem(i,q.faulty,q.fixed,q.explain))
      .join('');
  
    // Homophones
    const homoWrap = document.getElementById('homophones');
    const doneHomo = JSON.parse(localStorage.getItem("homo-done") || "[]");
    homoWrap.innerHTML = homos
      .map((h,i)=> doneHomo.includes(i) ? "" : makeHomophoneItem(i,h.stem,h.choices,h.correct,h.tip))
      .join('');
  
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
