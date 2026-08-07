const user="korneevscp";

async function github(endpoint){
 const r=await fetch(`https://api.github.com/${endpoint}`);
 return r.json();
}

async function loadProfile(){
 const el=document.getElementById("github-info");
 if(!el) return;
 const p=await github(`users/${user}`);
 el.innerHTML=`<div class="card"><h2>GitHub</h2><p>${p.bio||"Développeur cybersécurité"}</p><p>👥 ${p.followers} followers • 📦 ${p.public_repos} repositories</p></div>`;
}

async function loadRepos(){
 const box=document.getElementById("repos");
 if(!box)return;
 const repos=await github(`users/${user}/repos?sort=updated&per_page=100`);
 box.innerHTML=repos.map(r=>`
 <div class="card">
 <h3>${r.name}</h3>
 <p>${r.description||"Projet open source"}</p>
 <span class="tag">${r.language||"Code"}</span>
 <span class="tag">⭐ ${r.stargazers_count}</span>
 <span class="tag">🍴 ${r.forks_count}</span>
 <p>${new Date(r.updated_at).toLocaleDateString()}</p>
 <a href="project.html?repo=${encodeURIComponent(r.name)}">Voir le projet →</a>
 </div>`).join("");
}

async function loadProject(){
 const name=new URLSearchParams(location.search).get("repo");
 if(!name)return;
 const r=await github(`repos/${user}/${name}`);
 document.getElementById("project").innerHTML=`
 <div class="card">
 <h1>${r.name}</h1>
 <p>${r.description||""}</p>
 <span class="tag">${r.language||"N/A"}</span>
 <span class="tag">⭐ ${r.stargazers_count}</span>
 <span class="tag">🍴 ${r.forks_count}</span>
 <p>Dernière mise à jour : ${new Date(r.updated_at).toLocaleDateString()}</p>
 <a href="${r.html_url}" target="_blank">Voir le code GitHub</a>
 </div>`;
 const read=await fetch(`https://raw.githubusercontent.com/${user}/${name}/main/README.md`);
 if(read.ok) document.getElementById("readme").innerText=await read.text();
}
loadProfile();loadRepos();loadProject();
