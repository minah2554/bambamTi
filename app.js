const USERS = [
  { id: "admin", password: "2026", role: "admin", name: "관리자" },
  { id: "10101", password: "1234", role: "student", studentId: "10101" },
  { id: "10102", password: "1234", role: "student", studentId: "10102" },
  { id: "10103", password: "1234", role: "student", studentId: "10103" },
];

const STUDENTS = [
  {
    id: "10101",
    name: "김코딩",
    photo: "assets/10101_김코딩.jpg",
    grades: {
      "정보 수행평가": "A",
      "웹앱 프로젝트": "92점",
      "디지털 윤리 퀴즈": "88점",
      "수업 참여도": "상",
    },
    traits: [
      "문제 해결 과정을 차분히 설명합니다.",
      "새 도구를 시도할 때 기록을 꼼꼼히 남깁니다.",
      "제출 전 확인 습관을 더 연습하면 좋습니다.",
    ],
    teacherMemo: "프론트엔드 구조 이해가 빠르며, 팀원 질문에 답하는 태도가 좋습니다.",
  },
  {
    id: "10102",
    name: "박개발",
    photo: "assets/10102_박개발.jpg",
    grades: {
      "정보 수행평가": "B+",
      "웹앱 프로젝트": "86점",
      "디지털 윤리 퀴즈": "91점",
      "수업 참여도": "중상",
    },
    traits: [
      "협업 중 역할 분담을 잘 지킵니다.",
      "UI 수정 아이디어를 자주 제안합니다.",
      "프로젝트 범위를 작게 나누는 연습이 필요합니다.",
    ],
    teacherMemo: "기능 구현 의욕이 높고, 오류가 날 때 원인을 함께 추적하려는 태도가 좋습니다.",
  },
  {
    id: "10103",
    name: "이교사",
    photo: "assets/10103_이교사.jpg",
    grades: {
      "정보 수행평가": "A-",
      "웹앱 프로젝트": "89점",
      "디지털 윤리 퀴즈": "95점",
      "수업 참여도": "상",
    },
    traits: [
      "학습 내용을 자기 언어로 정리합니다.",
      "개선할 지점을 발견하면 근거를 함께 제시합니다.",
      "코드 주석을 더 구체적으로 쓰면 좋습니다.",
    ],
    teacherMemo: "질문의 초점이 좋고, 개선 방향을 토의하는 데 적극적입니다.",
  },
];

const loginForm = document.querySelector("#loginForm");
const userIdInput = document.querySelector("#userId");
const passwordInput = document.querySelector("#password");
const loginMessage = document.querySelector("#loginMessage");
const logoutButton = document.querySelector("#logoutButton");
const loginView = document.querySelector("#loginView");
const studentView = document.querySelector("#studentView");
const adminView = document.querySelector("#adminView");

let currentUser = null;

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = userIdInput.value.trim();
  const password = passwordInput.value;
  const user = USERS.find((item) => item.id === id && item.password === password);

  if (!user) {
    loginMessage.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  currentUser = user;
  loginMessage.textContent = "";
  loginForm.reset();

  if (user.role === "admin") {
    renderAdminDashboard();
  } else {
    const student = STUDENTS.find((item) => item.id === user.studentId);
    renderStudentPage(student);
  }
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  showOnly(loginView);
  logoutButton.classList.add("hidden");
  userIdInput.focus();
});

function showOnly(targetView) {
  [loginView, studentView, adminView].forEach((view) => view.classList.add("hidden"));
  targetView.classList.remove("hidden");
}

function renderStudentPage(student) {
  if (!student) {
    loginMessage.textContent = "학생 정보를 찾을 수 없습니다.";
    showOnly(loginView);
    return;
  }

  studentView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Student</p>
        <h2>${student.name} 학생 페이지</h2>
        <p>로그인한 학생의 학습 현황을 확인합니다.</p>
      </div>
    </div>

    <div class="student-layout">
      <article class="student-profile">
        <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
        <div class="profile-body">
          <h3>${student.name}</h3>
          <p class="student-number">학번 ${student.id}</p>
          <div class="tag-row" aria-label="학습 키워드">
            <span class="tag">정보</span>
            <span class="tag">프로젝트</span>
          </div>
        </div>
      </article>

      <div class="content-stack">
        ${renderGrades(student.grades, false, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
      </div>
    </div>
  `;

  showOnly(studentView);
  logoutButton.classList.remove("hidden");
}

// AI 학생 상담 관련 전역 변수
let selectedStudentForAI = null;

function renderAdminDashboard() {
  adminView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Admin</p>
        <h2>관리자 대시보드</h2>
        <p>학생 3명의 학습 현황을 한 화면에서 비교합니다.</p>
      </div>
    </div>

    <section class="admin-grid" aria-label="전체 학생 정보">
      ${STUDENTS.map(renderStudentCard).join("")}
    </section>

    <!-- AI 학생 상담 전략 도우미 섹션 -->
    <section id="aiCounselorSection" class="ai-counselor-section">
      <div class="section-title">
        <h3>💡 AI 학생 상담 전략 도우미</h3>
      </div>
      <div class="ai-counselor-container">
        <!-- 1. 선택된 학생 표시 영역 -->
        <div class="ai-student-selector">
          <p class="ai-helper-desc">대시보드의 학생 카드에서 <strong>"상담 전략 요청"</strong> 버튼을 누르면 상담 대상 학생이 여기에 선택됩니다.</p>
          <div id="aiSelectedStudentInfo" class="ai-selected-student-info hidden">
            <div class="ai-student-info-row">
              <span class="info-label">화면용 정보:</span>
              <span id="aiScreenInfo" class="info-value">-</span>
            </div>
            <div class="ai-student-info-row">
              <span class="info-label">AI 전송용 가명:</span>
              <span id="aiAliasInfo" class="info-value-badge">-</span>
            </div>
          </div>
        </div>

        <!-- 2. 교사 고민 입력 textarea -->
        <div class="ai-concern-input">
          <label for="aiTeacherConcern">교사 상담 고민 입력</label>
          <textarea 
            id="aiTeacherConcern" 
            placeholder="상담 대상 학생을 선택하고 교사의 고민을 직접 입력해 주세요. (예시:\n- 수업 참여는 좋은데 평가 결과가 낮습니다. 어떻게 상담하면 좋을까요?\n- 과제 제출이 자주 늦습니다. 혼내기보다는 원인을 파악하고 싶은데 어떻게 접근하면 좋을까요?\n- 친구들과 협업할 때 소극적인 편입니다. 어떤 질문으로 대화를 시작하면 좋을까요?)"
            disabled
          ></textarea>
        </div>

        <!-- 3. 전송 데이터 미리보기 영역 -->
        <div class="ai-preview-area">
          <p class="preview-title">📡 Gemini 전송 데이터 미리보기 (이름, 학번, 사진 자동 제외)</p>
          <pre><code id="aiRequestPreview">{}</code></pre>
        </div>

        <!-- 4. AI 상담 전략 받기 버튼 -->
        <div class="ai-action-area">
          <button id="aiSubmitButton" class="primary-button" disabled>AI 상담 전략 받기</button>
        </div>

        <!-- 5. 오류 메시지 표시 영역 -->
        <div id="aiErrorMessage" class="ai-error-message hidden" role="alert"></div>

        <!-- 6. Gemini 응답 결과 표시 영역 -->
        <div id="aiResultArea" class="ai-result-area hidden">
          <h4>🤖 AI 학생 상담 전략 제안</h4>
          <div id="aiResultContent" class="ai-result-content"></div>
        </div>
      </div>
      <p class="ai-counselor-disclaimer">
        ⚠️ AI 상담 전략은 참고용입니다. 최종 판단과 실제 상담은 교사가 학생의 상황을 종합적으로 고려하여 진행해야 합니다.
      </p>
    </section>
  `;

  showOnly(adminView);
  logoutButton.classList.remove("hidden");

  // 이벤트 리스너 바인딩
  const aiTeacherConcern = document.getElementById("aiTeacherConcern");
  const aiSubmitButton = document.getElementById("aiSubmitButton");

  if (aiTeacherConcern) {
    aiTeacherConcern.addEventListener("input", updateAIPreview);
  }

  if (aiSubmitButton) {
    aiSubmitButton.addEventListener("click", requestAICounselingStrategy);
  }

  // 이전 선택 학생이 있었다면 복원
  if (selectedStudentForAI) {
    selectStudentForCounseling(selectedStudentForAI.id);
  }
}

function renderStudentCard(student) {
  return `
    <article class="student-card">
      <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
      <div class="student-card-body">
        <h3>${student.name}</h3>
        <p class="student-number">학번 ${student.id}</p>
        ${renderGrades(student.grades, true, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
        <button class="ghost-button" onclick="selectStudentForCounseling('${student.id}')" style="width: 100%; margin-top: 14px;">상담 전략 요청</button>
      </div>
    </article>
  `;
}

function renderGrades(grades, compact = false, headingId = "gradesTitle") {
  const rows = Object.entries(grades)
    .map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`)
    .join("");

  return `
    <section aria-labelledby="${headingId}">
      <div class="section-title">
        <h3 id="${headingId}">성적 정보</h3>
      </div>
      <table class="grade-table ${compact ? "compact-table" : ""}">
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderTraits(student) {
  return `
    <section aria-labelledby="traitsTitle-${student.id}">
      <div class="section-title">
        <h3 id="traitsTitle-${student.id}">학습 특성 및 교사 메모</h3>
      </div>
      <ul class="memo-list">
        ${student.traits.map((trait) => `<li>${trait}</li>`).join("")}
        <li>${student.teacherMemo}</li>
      </ul>
    </section>
  `;
}

// AI 학생 상담 도우미 관련 비즈니스 로직
function selectStudentForCounseling(studentId) {
  const student = STUDENTS.find(s => s.id === studentId);
  if (!student) return;

  selectedStudentForAI = student;

  const studentIndex = STUDENTS.findIndex(s => s.id === studentId);
  const aliasLetter = String.fromCharCode(65 + studentIndex); // 0 -> A, 1 -> B, 2 -> C
  const studentAlias = `학생 ${aliasLetter}`;

  const aiSelectedStudentInfo = document.getElementById("aiSelectedStudentInfo");
  const aiScreenInfo = document.getElementById("aiScreenInfo");
  const aiAliasInfo = document.getElementById("aiAliasInfo");
  const aiTeacherConcern = document.getElementById("aiTeacherConcern");
  const aiSubmitButton = document.getElementById("aiSubmitButton");

  if (aiScreenInfo) aiScreenInfo.textContent = `${student.name} (학번: ${student.id})`;
  if (aiAliasInfo) aiAliasInfo.textContent = studentAlias;
  
  if (aiSelectedStudentInfo) aiSelectedStudentInfo.classList.remove("hidden");
  if (aiTeacherConcern) {
    aiTeacherConcern.removeAttribute("disabled");
    aiTeacherConcern.focus();
  }
  if (aiSubmitButton) aiSubmitButton.removeAttribute("disabled");

  updateAIPreview();

  // 이전 결과 및 에러 초기화
  const aiResultArea = document.getElementById("aiResultArea");
  const aiErrorMessage = document.getElementById("aiErrorMessage");
  if (aiResultArea) aiResultArea.classList.add("hidden");
  if (aiErrorMessage) aiErrorMessage.classList.add("hidden");
}

function updateAIPreview() {
  if (!selectedStudentForAI) return;

  const studentId = selectedStudentForAI.id;
  const studentIndex = STUDENTS.findIndex(s => s.id === studentId);
  const aliasLetter = String.fromCharCode(65 + studentIndex);
  const studentAlias = `학생 ${aliasLetter}`;

  const gradeSummary = Object.entries(selectedStudentForAI.grades)
    .map(([key, val]) => `${key}: ${val}`)
    .join(", ");
  
  const learningTraits = selectedStudentForAI.traits.join(", ");
  
  const aiTeacherConcern = document.getElementById("aiTeacherConcern");
  const teacherConcern = aiTeacherConcern ? aiTeacherConcern.value.trim() : "";

  // 보안 점검용 주석:
  // 1. 프론트엔드에 API 키를 넣으면 개발자 도구에서 노출될 수 있어 Vercel Serverless Function에서 간접 호출합니다.
  // 2. Gemini로 전송하는 데이터는 이름, 학번, 사진 경로를 제외하여 개인정보를 차단하고 가명(studentAlias) 처리합니다.
  const previewData = {
    studentAlias,
    gradeSummary,
    learningTraits,
    teacherConcern: teacherConcern || "(고민을 입력해 주세요)"
  };

  const aiRequestPreview = document.getElementById("aiRequestPreview");
  if (aiRequestPreview) {
    aiRequestPreview.textContent = JSON.stringify(previewData, null, 2);
  }
}

async function requestAICounselingStrategy() {
  const aiTeacherConcern = document.getElementById("aiTeacherConcern");
  const aiSubmitButton = document.getElementById("aiSubmitButton");
  const aiErrorMessage = document.getElementById("aiErrorMessage");
  const aiResultArea = document.getElementById("aiResultArea");
  const aiResultContent = document.getElementById("aiResultContent");

  const concernText = aiTeacherConcern ? aiTeacherConcern.value.trim() : "";
  if (!concernText) {
    if (aiErrorMessage) {
      aiErrorMessage.textContent = "상담 고민을 먼저 입력해주세요.";
      aiErrorMessage.classList.remove("hidden");
    }
    if (aiResultArea) aiResultArea.classList.add("hidden");
    return;
  }

  if (aiErrorMessage) aiErrorMessage.classList.add("hidden");
  if (aiResultArea) aiResultArea.classList.add("hidden");

  if (aiSubmitButton) {
    aiSubmitButton.setAttribute("disabled", "true");
    aiSubmitButton.textContent = "AI가 상담 전략을 생성하는 중입니다...";
  }

  const studentId = selectedStudentForAI.id;
  const studentIndex = STUDENTS.findIndex(s => s.id === studentId);
  const aliasLetter = String.fromCharCode(65 + studentIndex);
  const studentAlias = `학생 ${aliasLetter}`;
  
  const gradeSummary = Object.entries(selectedStudentForAI.grades)
    .map(([key, val]) => `${key}: ${val}`)
    .join(", ");
  
  const learningTraits = selectedStudentForAI.traits.join(", ");

  const payload = {
    studentAlias,
    gradeSummary,
    learningTraits,
    teacherConcern: concernText
  };

  try {
    const response = await fetch("/api/gemini-counseling", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "상담 전략 조회에 실패했습니다.");
    }

    if (aiResultContent) {
      aiResultContent.innerHTML = formatAIResult(data.result);
    }
    if (aiResultArea) {
      aiResultArea.classList.remove("hidden");
    }
  } catch (error) {
    console.error("AI Request Failed:", error);
    if (aiErrorMessage) {
      aiErrorMessage.textContent = "AI 상담 전략을 불러오지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요.";
      aiErrorMessage.classList.remove("hidden");
    }
  } finally {
    if (aiSubmitButton) {
      aiSubmitButton.removeAttribute("disabled");
      aiSubmitButton.textContent = "AI 상담 전략 받기";
    }
  }
}

function formatAIResult(text) {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // ### Header -> <h5>Header</h5>
  html = html.replace(/^(?:###|##|#)\s+(.*)$/gm, "<h5>$1</h5>");

  const lines = html.split("\n");
  let listOpen = false;
  
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const content = trimmed.substring(1).trim();
      let prefix = "";
      if (!listOpen) {
        prefix = "<ul>";
        listOpen = true;
      }
      return `${prefix}<li>${content}</li>`;
    } else {
      let suffix = "";
      if (listOpen) {
        suffix = "</ul>";
        listOpen = false;
      }
      if (trimmed.startsWith("<h")) {
        return `${suffix}${trimmed}`;
      }
      if (!trimmed) {
        return suffix;
      }
      return `${suffix}<p>${trimmed}</p>`;
    }
  });

  if (listOpen) {
    formattedLines.push("</ul>");
  }

  return formattedLines.join("\n");
}

showOnly(loginView);
