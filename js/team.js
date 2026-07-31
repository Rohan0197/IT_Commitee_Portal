// Renders TEAM_MEMBERS (from team-data.js) as a grid of cards.
// Runs once on page load - team data is static, no Firestore needed.

function initials(name) {
  return name
    .split(" ")
    .map(function (part) {
      return part[0];
    })
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function teamCardHtml(member) {
  return (
    '<article class="team-card">' +
    '<div class="avatar" style="background:' + member.color + ';">' + initials(member.name) + "</div>" +
    "<h3>" + member.name + "</h3>" +
    '<p class="role">' + member.role + "</p>" +
    '<p class="bio">' + member.bio + "</p>" +
    "</article>"
  );
}

document.getElementById("teamGrid").innerHTML = TEAM_MEMBERS.map(teamCardHtml).join("");
