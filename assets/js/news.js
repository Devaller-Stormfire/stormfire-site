(async function () {

const container = document.getElementById("newsContainer");

try{

const res = await fetch("./data/news.json");
const data = await res.json();

const posts = data.posts.sort((a,b)=>
new Date(b.ts) - new Date(a.ts)
);

posts.forEach(post=>{

const card = document.createElement("div");
card.className="postCard";

card.innerHTML = `
<div class="meta">
${post.date} • ${post.type} • ${post.author}
</div>

<h2>${post.title}</h2>

<p style="white-space:pre-line;">
${post.body}
</p>

<div class="tags">
${post.tags.map(t=>`<span class="tag">${t}</span>`).join("")}
</div>
`;

container.appendChild(card);

});

}catch(e){

console.error(e);

container.innerHTML=`
<div class="postCard">
<h2>Fehler beim Laden der News</h2>
<p>Die Devlogs konnten nicht geladen werden.</p>
</div>
`;

}

})();