const skillList = [
  'Bercakap / pembentang',
  'Menulis',
  'Melukis / mereka bentuk',
  'Teknologi',
  'Mencari maklumat',
  'Mengurus kumpulan',
  'Membantu rakan'
];

const sampleStudents = [
  {
    name: 'Aiman',
    className: '5A',
    interests: 'Sains, teknologi, eksperimen',
    strengths: 'Cepat belajar aplikasi, tenang ketika menyelesaikan masalah',
    likes: 'Membuat projek digital, mencari idea baru',
    skills: ['Teknologi', 'Mencari maklumat', 'Membantu rakan']
  },
  {
    name: 'Siti',
    className: '5B',
    interests: 'Seni, reka bentuk, warna',
    strengths: 'Pandai mencipta visual dan poster menarik',
    likes: 'Mereka bentuk poster, menyiapkan bahan pembentangan',
    skills: ['Melukis / mereka bentuk', 'Menulis', 'Membantu rakan']
  },
  {
    name: 'Amir',
    className: '5C',
    interests: 'Penceritaan, kerja berkumpulan, media',
    strengths: 'Pandai bercakap dengan jelas dan memimpin perbincangan',
    likes: 'Bercakap semasa pembentangan, menyusun idea',
    skills: ['Bercakap / pembentang', 'Mengurus kumpulan', 'Menulis']
  },
  {
    name: 'Aina',
    className: '5A',
    interests: 'Penyelidikan, sejarah, maklumat',
    strengths: 'Pandai mencari maklumat yang tepat dan ringkas',
    likes: 'Membuat nota, menyusun fakta, meneliti bahan',
    skills: ['Mencari maklumat', 'Menulis', 'Membantu rakan']
  },
  {
    name: 'Hafiz',
    className: '6B',
    interests: 'Sukan, organisasi, ketua pasukan',
    strengths: 'Boleh menggerakkan rakan dan memastikan semua tugas selesai',
    likes: 'Menyusun jadual, membantu kumpulan',
    skills: ['Mengurus kumpulan', 'Membantu rakan', 'Bercakap / pembentang']
  }
];

const appState = {
  currentStudent: null,
  selectedRole: ''
};

const screens = document.querySelectorAll('.screen');
const form = document.getElementById('studentForm');
const matchListEl = document.getElementById('matchList');
const teamListEl = document.getElementById('teamList');
const growOptionsEl = document.getElementById('growOptions');
const roleResultEl = document.getElementById('roleResult');

function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === id);
  });
}

function goToNext(targetId) {
  showScreen(targetId);
}

function getSelectedSkills() {
  return Array.from(document.querySelectorAll('input[name="skills"]:checked')).map((input) => input.value);
}

function parseList(input) {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildStrengthList(profile) {
  const list = [
    ...parseList(profile.strengths),
    ...profile.skills.map((skill) => `Boleh membantu dalam ${skill.toLowerCase()}`),
    ...parseList(profile.likes).slice(0, 2)
  ];
  return list.slice(0, 4);
}

function buildInterestList(profile) {
  const list = parseList(profile.interests);
  return list.length ? list.slice(0, 4) : ['Mencari pengalaman baru'];
}

function buildSuitableSkills(profile) {
  const chosen = profile.skills.length ? profile.skills : ['Membantu rakan'];
  return chosen.slice(0, 4);
}

function buildTrySkills(profile) {
  const chosenSet = new Set(profile.skills);
  return skillList.filter((skill) => !chosenSet.has(skill)).slice(0, 3);
}

function renderAnalysis(profile) {
  const strengthList = document.getElementById('strengthList');
  const interestList = document.getElementById('interestList');
  const suitableList = document.getElementById('suitableList');
  const tryList = document.getElementById('tryList');

  strengthList.innerHTML = buildStrengthList(profile)
    .map((item) => `<li>${item}</li>`)
    .join('');
  interestList.innerHTML = buildInterestList(profile)
    .map((item) => `<li>${item}</li>`)
    .join('');
  suitableList.innerHTML = buildSuitableSkills(profile)
    .map((item) => `<li>${item}</li>`)
    .join('');
  tryList.innerHTML = buildTrySkills(profile)
    .map((item) => `<li>${item}</li>`)
    .join('');
}

function scoreStudentCompatibility(current, candidate) {
  const currentSet = new Set(current.skills);
  const otherSet = new Set(candidate.skills);

  let score = 0;
  for (const skill of currentSet) {
    if (!otherSet.has(skill)) score += 1;
  }
  for (const skill of otherSet) {
    if (!currentSet.has(skill)) score += 1;
  }

  const shared = [...currentSet].filter((skill) => otherSet.has(skill)).length;
  score += shared * 2;

  return score;
}

function buildMatchList(profile) {
  const matched = sampleStudents
    .map((candidate) => ({
      ...candidate,
      compatibility: scoreStudentCompatibility(profile, candidate)
    }))
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 3);

  const intro = `Berdasarkan ${profile.name}, TAGBUDDY cadangkan murid yang boleh melengkapi kemahiran anda dalam kumpulan.`;
  document.getElementById('matchIntro').textContent = intro;

  matchListEl.innerHTML = matched
    .map((student) => {
      const badges = student.skills.slice(0, 3).map((skill) => `<span class="badge-pill">${skill}</span>`).join('');
      return `
        <article class="match-card">
          <div class="person">
            <strong>${student.name}</strong>
            <span>${student.className} • ${student.interests}</span>
          </div>
          <div class="tag-badges">${badges}</div>
        </article>
      `;
    })
    .join('');
}

function buildTeam(profile) {
  const pool = [
    ...sampleStudents,
    {
      name: profile.name,
      className: profile.className,
      interests: profile.interests,
      strengths: profile.strengths,
      likes: profile.likes,
      skills: profile.skills
    }
  ];

  const sorted = pool
    .map((student) => ({
      ...student,
      score: student.skills.reduce((sum, skill) => sum + (profile.skills.includes(skill) ? 0 : 1), 0)
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);

  const team = [
    {
      groupName: 'Kumpulan A',
      members: [
        { name: profile.name, role: profile.skills[0] || 'Penyumbang' },
        { name: sorted[1]?.name || 'Aiman', role: sorted[1]?.skills[0] || 'Teknologi' },
        { name: sorted[2]?.name || 'Siti', role: sorted[2]?.skills[0] || 'Reka bentuk' },
        { name: sorted[3]?.name || 'Aina', role: sorted[3]?.skills[0] || 'Pencari maklumat' }
      ]
    }
  ];

  return team;
}

function renderTeam(profile) {
  const team = buildTeam(profile);
  teamListEl.innerHTML = team
    .map((group) => {
      const members = group.members
        .map(
          (person) => `
            <div class="member-pill">
              <strong>${person.name}</strong>
              <span>${person.role}</span>
            </div>
          `
        )
        .join('');

      return `
        <article class="team-card">
          <div class="team-header">
            <h4>${group.groupName}</h4>
          </div>
          <div class="members">${members}</div>
        </article>
      `;
    })
    .join('');
}

function renderGrowOptions() {
  const options = [
    'Pembentang',
    'Pereka',
    'Teknologi',
    'Ketua',
    'Pencari maklumat'
  ];

  growOptionsEl.innerHTML = options
    .map(
      (option, index) => `
        <button class="role-btn ${index === 0 ? 'selected' : ''}" data-role="${option}">${option}</button>
      `
    )
    .join('');

  const buttons = growOptionsEl.querySelectorAll('.role-btn');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.classList.remove('selected'));
      button.classList.add('selected');
      appState.selectedRole = button.dataset.role;
      roleResultEl.textContent = `${button.dataset.role} ialah pilihan yang bagus untuk anda cuba pada projek seterusnya. Anda boleh membina keyakinan dan menambah pengalaman baharu.`;
    });
  });

  const firstOption = growOptionsEl.querySelector('.role-btn');
  if (firstOption) {
    firstOption.click();
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  const data = new FormData(form);
  const profile = {
    name: data.get('name')?.toString().trim() || 'Murid',
    className: data.get('className')?.toString().trim() || 'Unknown',
    interests: data.get('interests')?.toString().trim() || 'Membaca, teknologi',
    strengths: data.get('strengths')?.toString().trim() || 'Pandai menolong',
    likes: data.get('likes')?.toString().trim() || 'Bekerjasama',
    skills: getSelectedSkills()
  };

  appState.currentStudent = profile;
  renderAnalysis(profile);
  buildMatchList(profile);
  renderTeam(profile);
  goToNext('analysis');
}

document.querySelectorAll('[data-next]').forEach((button) => {
  button.addEventListener('click', () => {
    const nextId = button.dataset.next;
    if (nextId) goToNext(nextId);
  });
});

document.querySelectorAll('[data-back]').forEach((button) => {
  button.addEventListener('click', () => {
    const backId = button.dataset.back;
    if (backId) showScreen(backId);
  });
});

form.addEventListener('submit', handleFormSubmit);

document.getElementById('finalResetBtn').addEventListener('click', () => {
  form.reset();
  appState.selectedRole = '';
  roleResultEl.textContent = '';
  showScreen('home');
});

showScreen('home');
renderGrowOptions();
