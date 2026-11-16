const user="korneevscp";

async function github(endpoint){
 const r=await fetch(`https://api.github.com/${endpoint}`);
 if(!r.ok) throw new Error(`GitHub API: ${r.status}`);
 return r.json();
}

function initNeonBackground(){
 const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const canvas=document.createElement("canvas");
 canvas.className="neon-scene";
 canvas.setAttribute("aria-hidden","true");
 document.body.prepend(canvas);
 const ctx=canvas.getContext("2d");
 if(!ctx)return;
 const trail=document.createElement("div");
 trail.className="mouse-trail";
 trail.setAttribute("aria-hidden","true");
 document.body.append(trail);
 const pointerFine=window.matchMedia("(pointer: fine)").matches;
 let width=0,height=0,dpr=1,mouseX=-100,mouseY=-100,ringX=-100,ringY=-100;
 const particles=[];
 function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  width=window.innerWidth;height=window.innerHeight;
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  canvas.style.width=width+"px";canvas.style.height=height+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const count=Math.min(70,Math.max(28,Math.round(width*height/22000)));
  while(particles.length<count)particles.push({
   x:Math.random()*width,y:Math.random()*height,
   vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,
   size:Math.random()*1.5+.6,hue:Math.random()>.55?185:285,
   alpha:Math.random()*.45+.18
  });
  particles.length=count;
 }
 resize();
 window.addEventListener("resize",resize,{passive:true});
 if(pointerFine)window.addEventListener("pointermove",e=>{
  mouseX=e.clientX;mouseY=e.clientY;
  trail.style.opacity="1";
 },{passive:true});
 document.addEventListener("pointerover",e=>{
  if(e.target.closest("a,button"))trail.classList.add("is-hovering");
 });
 document.addEventListener("pointerout",e=>{
  if(e.target.closest("a,button"))trail.classList.remove("is-hovering");
 });
 function draw(){
  ctx.clearRect(0,0,width,height);
  for(let i=0;i<particles.length;i++){
   const p=particles[i];
   if(!reduceMotion){p.x+=p.vx;p.y+=p.vy}
   if(p.x<0||p.x>width)p.vx*=-1;
   if(p.y<0||p.y>height)p.vy*=-1;
   ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
   ctx.fillStyle=`hsla(${p.hue},100%,65%,${p.alpha})`;ctx.fill();
   for(let j=i+1;j<particles.length;j++){
    const q=particles[j],dx=p.x-q.x,dy=p.y-q.y,distance=Math.hypot(dx,dy);
    if(distance<125){
     ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
     ctx.strokeStyle=`rgba(0,217,255,${.12*(1-distance/125)})`;ctx.stroke();
    }
   }
  }
  if(pointerFine&&mouseX>=0){
   ringX+=(mouseX-ringX)*.18;ringY+=(mouseY-ringY)*.18;
   trail.style.left=ringX+"px";trail.style.top=ringY+"px";
   ctx.beginPath();ctx.arc(mouseX,mouseY,25,0,Math.PI*2);
   ctx.strokeStyle="rgba(0,217,255,.28)";ctx.lineWidth=1;ctx.stroke();
  }
  if(!reduceMotion)requestAnimationFrame(draw);
 }
 draw();
}

async function loadProfile(){
 const el=document.getElementById("github-info");
 if(!el) return;
 const p=await github(`users/${user}`);
 el.innerHTML=`<div class="card"><h2>GitHub</h2><p>${p.bio||"Développeur cybersécurité"}</p><p>👥 ${p.followers} followers • 📦 ${p.public_repos} repositories</p></div>`;
}

function escapeHtml(value){
 return String(value).replace(/[&<>"']/g,char=>{
  if(char==="&")return "&amp;";
  if(char==="<")return "&lt;";
  if(char===">")return "&gt;";
  if(char==='"')return "&quot;";
  return "&#39;";
 });
}

async function loadRepos(){
 const box=document.getElementById("repos");
 if(!box)return;
 const repos=await github(`users/${user}/repos?sort=updated&per_page=100`);
 box.innerHTML=repos.map(r=>{
  const tags=[...new Set([r.language,...(Array.isArray(r.topics)?r.topics:[])].filter(Boolean))].slice(0,5);
  if(!tags.length)tags.push("Projet GitHub");
  return `
 <div class="card project-card">
 <h3>${r.name}</h3>
 <p>${r.description||"Projet open source"}</p>
 <div class="project-tags" aria-label="Langages et sujets du projet">
  ${tags.map(tag=>`<span class="project-tag">${escapeHtml(tag)}</span>`).join("")}
 </div>
 <div class="project-stats"><span class="tag">⭐ ${r.stargazers_count}</span><span class="tag">🍴 ${r.forks_count}</span></div>
 <p>${new Date(r.updated_at).toLocaleDateString()}</p>
 <a class="cybr-btn" href="project.html?repo=${encodeURIComponent(r.name)}">
   Voir le projet<span aria-hidden="true">_</span>
   <span aria-hidden="true" class="cybr-btn__glitch">Voir le projet_</span>
   <span aria-hidden="true" class="cybr-btn__tag">R25</span>
 </a>
 </div>`;
 }).join("");
}

async function loadProject(){
 const name=new URLSearchParams(location.search).get("repo");
 if(!name)return;
 const project=document.getElementById("project");
 const readme=document.getElementById("readme");
 try {
  const r=await github(`repos/${user}/${encodeURIComponent(name)}`);
  const title=document.getElementById("chat-project-name");
  const githubLink=document.getElementById("project-github-link");
  if(title)title.textContent=r.name;
  if(githubLink)githubLink.href=r.html_url;
  document.title=`${r.name} · Portfolio`;
  const tags=[...new Set([r.language,...(Array.isArray(r.topics)?r.topics:[])].filter(Boolean))].slice(0,5);
  project.innerHTML=`
   <article class="chat-bubble chat-bubble--received">
    <p class="chat-message-label">PROJET · PRÉSENTATION</p>
    <h1>${escapeHtml(r.name)}</h1>
    <p>${escapeHtml(r.description||"Projet open source de korneevscp.")}</p>
    <time class="chat-message-time" datetime="${r.updated_at}">Mis à jour le ${new Date(r.updated_at).toLocaleDateString("fr-FR")}</time>
   </article>
   <article class="chat-bubble chat-bubble--sent">
    <p class="chat-message-label">TECHNOLOGIES &amp; SUJETS</p>
    <div class="project-tags" aria-label="Langages et sujets du projet">
     ${tags.length?tags.map(tag=>`<span class="project-tag">${escapeHtml(tag)}</span>`).join(""):'<span class="project-tag">Projet GitHub</span>'}
    </div>
    <p class="chat-project-stats">⭐ ${r.stargazers_count} étoiles <span>·</span> 🍴 ${r.forks_count} forks</p>
   </article>
   <article class="chat-bubble chat-bubble--received">
    <p class="chat-message-label">LIEN DU DÉPÔT</p>
    <p>Le code et les fichiers du projet sont disponibles ici :</p>
    <a class="chat-code-link" href="${r.html_url}" target="_blank" rel="noopener noreferrer">Ouvrir sur GitHub <span aria-hidden="true">↗</span></a>
   </article>`;
  const response=await fetch(`https://raw.githubusercontent.com/${user}/${encodeURIComponent(name)}/${encodeURIComponent(r.default_branch)}/README.md`);
  if(!response.ok)throw new Error("README introuvable");
  const markdown=await response.text();
  if(window.marked&&window.DOMPurify){
   readme.innerHTML=DOMPurify.sanitize(marked.parse(markdown));
  }else{
   readme.textContent=markdown;
  }
 }catch(error){
  if(readme)readme.textContent="Impossible de charger le README de ce projet.";
  if(project&&!project.children.length){
   const message=document.createElement("p");
   message.className="chat-bubble chat-bubble--received";
   message.textContent="Impossible de charger les informations du projet.";
   project.append(message);
  }
  console.error(error);
 }
}

async function loadCommitNotifications(){
 const panel=document.createElement("aside");
 panel.className="commit-notifications";
 panel.setAttribute("aria-label","Commits publics des quatre derniers jours");
 panel.setAttribute("aria-live","polite");
 panel.innerHTML='<p class="commit-notifications__loading">Chargement des commits récents…</p>';
 document.body.append(panel);
 try{
  const events=await github(`users/${user}/events/public?per_page=100`);
  const cutoff=Date.now()-4*24*60*60*1000;
  const commits=[];
  const seen=new Set();
  for(const event of events){
   if(event.type!=="PushEvent"||!event.created_at||new Date(event.created_at).getTime()<cutoff)continue;
   const repo=event.repo?.name||user;
   for(const commit of event.payload?.commits||[]){
    if(!commit.sha||seen.has(commit.sha))continue;
    seen.add(commit.sha);
    commits.push({sha:commit.sha,repo,message:(commit.message||"Commit sans message").split("\n")[0],date:event.created_at});
   }
  }
  commits.sort((a,b)=>new Date(b.date)-new Date(a.date));
  panel.replaceChildren();
  if(!commits.length){
   const empty=document.createElement("p");
   empty.className="commit-notifications__empty";
   empty.textContent="Aucun commit public récent.";
   panel.append(empty);
   return;
  }
  const heading=document.createElement("h2");
  heading.className="commit-notifications__title";
  heading.textContent="Commits récents";
  panel.append(heading);
  for(const commit of commits){
   const item=document.createElement("article");
   item.className="commit-toast";
   const close=document.createElement("button");
   close.className="commit-toast__close";
   close.type="button";
   close.setAttribute("aria-label","Masquer cette notification");
   close.textContent="×";
   close.addEventListener("click",()=>item.remove());
   const title=document.createElement("h3");
   title.textContent=commit.message;
   const link=document.createElement("a");
   link.className="commit-toast__repo";
   link.href=`https://github.com/${commit.repo}/commit/${encodeURIComponent(commit.sha)}`;
   link.target="_blank";
   link.rel="noopener noreferrer";
   link.textContent=commit.repo;
   const date=document.createElement("time");
   date.className="commit-toast__date";
   date.dateTime=commit.date;
   date.textContent=new Date(commit.date).toLocaleString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
   item.append(close,title,link,date);
   panel.append(item);
  }
 }catch(error){
  panel.replaceChildren();
  const unavailable=document.createElement("p");
  unavailable.className="commit-notifications__empty";
  unavailable.textContent="Les commits récents sont momentanément indisponibles.";
  panel.append(unavailable);
  console.error(error);
 }
}

initNeonBackground();
loadProfile();loadRepos();loadProject();loadCommitNotifications();
