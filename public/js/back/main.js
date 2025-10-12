// =======================================================
// 전역 설정: 카테고리 데이터 및 서버 엔드포인트
// =======================================================

// 서버 DB와 연동될 카테고리 목록
const CATEGORIES_MAP = [
    { id: 1, name: '식비' },
    { id: 2, name: '교통' },
    { id: 3, name: '생활' },
    { id: 4, name: '주거' },
    { id: 5, name: '통신' },
    { id: 6, name: '의료' },
    { id: 7, name: '교육' },
    { id: 8, name: '저축' },
    { id: 9, name: '쇼핑' },
    { id: 10, name: '기타' },
];

const CATEGORY_NAMES = CATEGORIES_MAP.map(c => c.name);
const API_BASE = 'http://localhost:3000'; // 서버 API 기본 URL

// ⭐ 핵심: 현재 로그인된 사용자의 ID와 이름 (URL 쿼리 파라미터로 초기화됨)
let CURRENT_USER_ID = null;
let CURRENT_USERNAME = null;


// =======================================================
// 유틸리티 함수
// =======================================================

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null) return '0원';
    // Math.abs(amount)를 사용하여 금액에 부호가 있더라도 원화 표시만 함
    return new Intl.NumberFormat('ko-KR').format(Math.abs(amount)) + '원';
}

function handleFetchError(error, defaultMsg) {
    console.error('API 처리 중 오류 발생:', error);
    alert(`${defaultMsg} 잠시 후 다시 시도해 주세요. 상세: ${error.message || '알 수 없는 오류'}`);
}


// =======================================================
// UI 업데이트 및 초기화
// =======================================================

/**
 * 메인 화면에 사용자 이름을 표시하고, 분석 섹션의 제목을 업데이트합니다.
 * @param {string | null} username 현재 로그인된 사용자 이름
 */
function updateUserDisplay(username) {
    const welcomeEl = document.getElementById('user-welcome-message'); 
    if (welcomeEl) {
        if (username) {
            welcomeEl.innerHTML = `👋 <strong style="color: #4CAF50;">${username}</strong>님의 가계부`; 
        } else {
            welcomeEl.innerHTML = `💸 나의 가계부`; 
        }
    }
    
    // 연령대 분석 섹션 제목 업데이트
    const ageInfoEl = document.getElementById('user-age-group-info');
    if (ageInfoEl) {
        const pEl = ageInfoEl.querySelector('p');
        if (pEl) {
            pEl.innerHTML = `<strong style="font-size: 1.1em;">나의 재정 현황 및 연령대 지출 비교</strong>`;
        }
    }
}


/**
 * 로그인 상태에 따라 UI를 업데이트하고 데이터를 로드합니다.
 */
function updateLoginUI() {
    if (CURRENT_USER_ID) {
        updateUserDisplay(CURRENT_USERNAME);
        loadInitialData(); // 로그인 성공 후 데이터 로드
    } else {
        updateUserDisplay(null);
        // HTML에 'total-budget' ID가 있는지 확인
        if (document.getElementById('total-budget')) {
            document.getElementById('total-budget').textContent = '로그인 필요';
        }
        renderTransactions([]);
    }
}

function renderTransactions(transactions) {
    const ul = document.getElementById('transactions');
    if (!ul) return; // ul 엘리먼트가 없으면 중단
    
    ul.innerHTML = ''; // 기존 목록 초기화

    if (!transactions || transactions.length === 0) {
        ul.innerHTML = '<li class="no-data">최근 거래 내역이 없습니다.</li>';
        attachDeleteListeners();
        return;
    }

    // 거래 내역은 최신순 (날짜 기준 내림차순)으로 정렬하여 표시
    // Oracle DATE 타입은 YYYY-MM-DD 형식의 문자열로 넘어왔다고 가정
    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.forEach(tx => {
        const li = document.createElement('li');
        const typeClass = tx.type === '수입' || tx.type === 'INCOME' ? 'income' : 'expense';
        const sign = tx.type === '수입' || tx.type === 'INCOME' ? '+' : '-';
        
        const categoryName = CATEGORIES_MAP.find(c => c.id === tx.category_id)?.name || '기타';
        
        li.className = typeClass;
        li.dataset.id = tx.transaction_id; 
        
        const displayDate = tx.date ? tx.date.substring(0, 10) : '날짜 미상';
        
        li.innerHTML = `
            <span>${displayDate} | ${categoryName} | ${tx.description}</span> 
            <strong class="amount-display">${sign}${formatCurrency(tx.amount)}</strong>
            <button class="delete-btn">X</button>
        `;
        ul.appendChild(li);
    });

    attachDeleteListeners(); // 렌더링 후 삭제 리스너 다시 붙이기
}


/**
 * 서버에서 초기 예산 및 거래 내역을 가져와 화면에 표시합니다.
 * (서버의 /api/data 엔드포인트는 이제 잔액을 totalBudget 필드로 반환함)
 */
async function loadInitialData() {
    if (!CURRENT_USER_ID) return; 

    try {
        const response = await fetch(`${API_BASE}/api/data?user_id=${CURRENT_USER_ID}`); 
        
        if (!response.ok) {
            const errorResult = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
            throw new Error(errorResult.message || `데이터 로딩 실패 (상태: ${response.status})`);
        }
        
        const data = await response.json();

        // 예산 업데이트 (서버가 계산한 잔액을 표시)
        const totalBudgetEl = document.getElementById('total-budget');
        if(totalBudgetEl) {
            totalBudgetEl.textContent = formatCurrency(data.totalBudget || 0);
        }
        
        // 거래 내역 업데이트
        renderTransactions(data.recentTransactions);
        
        // ⭐ [수정] 차트 업데이트 로직 추가
        updateChart(data.categoryAnalysis); 

    } catch (error) {
        handleFetchError(error, "초기 데이터 로딩에 실패했습니다.");
    }
}


// =======================================================
// 인증 이벤트 핸들러 (로그인/로그아웃)
// =======================================================

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    // 이 함수는 login.html에서 실행되는 것을 가정합니다.
    const username = document.getElementById('login-username')?.value;
    const password = document.getElementById('login-password')?.value;

    if (!username || !password) {
        alert("아이디와 비밀번호를 입력해 주세요.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(`${result.username}님, 로그인 성공!`);
            // 핵심: 로그인 성공 후 main.html로 이동하며 사용자 ID와 이름을 쿼리 파라미터로 전달
            window.location.href = `main.html?user_id=${result.user_id}&username=${result.username}`;
        } else {
            throw new Error(result.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
        }

    } catch (error) {
        handleFetchError(error, "로그인 처리 중 오류가 발생했습니다.");
    }
}

function handleLogout() {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    
    // 핵심: 저장된 ID 초기화
    CURRENT_USER_ID = null;
    CURRENT_USERNAME = null;
    alert("로그아웃 되었습니다.");
    
    window.location.href = 'login.html'; 
}


// =======================================================
// Chart.js 설정 및 업데이트
// =======================================================

let myChart; 

function initChart() {
    const ctx = document.getElementById('age-analysis-chart')?.getContext('2d');
    if (!ctx) return;
    
    // 초기에는 빈 데이터로 차트를 생성하거나, 기본 값으로 생성합니다.
    const initialData = CATEGORIES_MAP.map(() => 0); 
    
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: CATEGORY_NAMES, 
            datasets: [{
                label: '지출 비중',
                data: initialData,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#4D4DFF', '#8AC926', '#FFCA3A', '#6A4C93'
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: '내 연령대 카테고리 지출 비중' }
            }
        }
    });
}

/**
 * 서버에서 가져온 지출 분석 데이터를 Chart.js에 반영합니다.
 * @param {Array<Object>} analysisData - 서버에서 반환된 분석 데이터 (CATEGORY_NAME, TOTAL_SPENT, RANKING_ORDER 포함)
 */
function updateChart(analysisData) {
    if (!myChart || !analysisData) return;

    // 1. 차트 레이블과 데이터를 초기화합니다.
    const dataMap = new Map();
    analysisData.forEach(item => {
        // CATEGORY_NAME을 키로, TOTAL_SPENT를 값으로 저장
        dataMap.set(item.CATEGORY_NAME, item.TOTAL_SPENT || 0);
    });

    // 2. CATEGORIES_MAP 순서에 맞춰 레이블과 데이터를 구성합니다.
    const newLabels = CATEGORY_NAMES; // 전역 카테고리 이름 사용
    const newData = newLabels.map(name => dataMap.get(name) || 0);

    // 3. 차트 업데이트
    myChart.data.labels = newLabels;
    myChart.data.datasets[0].data = newData;
    myChart.update();
}


// =======================================================
// 이벤트 핸들러: 예산 등록 (POST /api/budgets)
// =======================================================

async function handleBudgetSubmit(e) {
    e.preventDefault();
    
    if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }
    
    const monthInput = document.getElementById('budget-month').value;
    if (!monthInput) {
        alert("예산 월을 선택해 주세요.");
        return;
    }
    const month = monthInput.replace('-', ''); // YYYYMM 형식으로 변경
    const categoryId = document.getElementById('budget-category').value; 
    const amount = parseInt(document.getElementById('budget-amount-input').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert("유효한 금액을 입력해 주세요.");
        return;
    }
    
    const budgetData = {
        month: month, // YYYYMM 형식의 문자열 (DB BUDGET_MONTH 컬럼)
        category_id: categoryId ? parseInt(categoryId) : null, 
        amount: amount, 
        user_id: CURRENT_USER_ID
    };
    
    console.log('예산 등록 요청 데이터:', budgetData);
    
    try {
        const response = await fetch(`${API_BASE}/api/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(budgetData),
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`예산이 성공적으로 등록되었습니다: ${formatCurrency(amount)}`);
            document.getElementById('budget-form').reset();
            loadInitialData(); // 데이터 새로고침
        } else {
            throw new Error(result.message || '예산 등록에 실패했습니다.');
        }
    } catch (error) {
        handleFetchError(error, "예산 등록 처리 중 오류가 발생했습니다.");
    }
}


// =======================================================
// 이벤트 핸들러: 거래 등록 (POST /api/transactions)
// =======================================================

async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }

    const type = document.querySelector('input[name="transaction-type"]:checked')?.value; // '수입' 또는 '지출'
    const categoryId = document.getElementById('category-select').value; 
    const description = document.getElementById('description').value.trim();
    const amountInput = document.getElementById('amount-input').value;
    const date = document.getElementById('date').value; // YYYY-MM-DD
    
    const amount = parseInt(amountInput);
    
    // 유효성 검사
    if (!type) {
         alert("거래 유형 (수입/지출)을 선택해 주세요.");
         return;
    }
    if (!categoryId) {
        alert("카테고리를 선택해 주세요.");
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert("유효한 금액을 입력해 주세요.");
        return;
    }
    if (!date) {
        alert("날짜를 선택해 주세요.");
        return;
    }

    // ⭐ 거래 데이터 객체 선언 
    const transactionData = {
        type: type, 
        category_id: parseInt(categoryId), 
        description: description,
        amount: amount,
        date: date, 
        user_id: CURRENT_USER_ID 
    };

    console.log('거래 등록 요청 데이터:', transactionData);

    try {
        const response = await fetch(`${API_BASE}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(transactionData),
        });

        const result = await response.json();

        if (response.ok) {
            alert(`거래가 성공적으로 등록되었습니다: ${type} ${formatCurrency(amount)}`);
            document.getElementById('transaction-form').reset();
            loadInitialData(); // 데이터 새로고침 (잔액 및 목록 업데이트)
        } else {
            throw new Error(result.message || '거래 등록에 실패했습니다.');
        }
    } catch (error) {
        handleFetchError(error, "거래 등록 처리 중 오류가 발생했습니다.");
    }
}


// =======================================================
// 이벤트 핸들러: 거래 삭제 (DELETE /api/transactions/:id)
// =======================================================

function attachDeleteListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        // ⭐ 중복 리스너 방지: 기존 리스너 제거 후 새로 등록
        button.removeEventListener('click', handleDeleteTransaction);
        button.addEventListener('click', handleDeleteTransaction);
    });
}

async function handleDeleteTransaction(e) {
    if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }

    if (!confirm('정말로 이 거래를 삭제하시겠습니까?')) {
        return;
    }
    
    const listItem = e.currentTarget.closest('li');
    const transactionId = listItem.dataset.id; 
    
    if (!transactionId) {
        alert("삭제할 거래 ID를 찾을 수 없습니다.");
        return;
    }

    console.log(`거래 삭제 요청 ID: ${transactionId}`);
    
    try {
        const response = await fetch(`${API_BASE}/api/transactions/${transactionId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ user_id: CURRENT_USER_ID }), 
        });
        
        if (response.ok) {
            alert("거래가 성공적으로 삭제되었습니다.");
            listItem.remove(); 
            loadInitialData(); // 데이터 새로고침 (잔액 및 목록 업데이트)
        } else {
            const result = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
            throw new Error(result.message || '거래 삭제에 실패했습니다. (권한 없음)'); 
        }
    } catch (error) {
        handleFetchError(error, "거래 삭제 처리 중 오류가 발생했습니다.");
    }
}


// =======================================================
// 최종 초기화
// =======================================================

window.onload = function() {
    // 1. URL 쿼리 파라미터에서 사용자 정보 확인 및 설정
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    const username = urlParams.get('username');
    
    if (userId && username) {
        CURRENT_USER_ID = parseInt(userId);
        CURRENT_USERNAME = decodeURIComponent(username); // URL 디코딩 추가
        // URL에서 정보 제거 (주소창에 ID 노출 방지)
        history.replaceState(null, '', window.location.pathname); 
    }
    
    // 2. 차트 렌더링
    initChart();
    
    // 3. 초기 데이터 로딩 (로그인 상태에 따라 달라짐)
    updateLoginUI(); 

    // 4. 폼 이벤트 리스너 등록
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        // ⭐ 로그아웃 중복 팝업 문제 해결을 위해 removeEventListener를 먼저 시도 (HTML onclick 제거가 더 확실함)
        // 하지만 JS 단에서도 안전성을 높이기 위해 유지
        logoutBtn.removeEventListener('click', handleLogout); 
        logoutBtn.addEventListener('click', handleLogout);
    }

    document.getElementById('budget-form')?.addEventListener('submit', handleBudgetSubmit);
    document.getElementById('transaction-form')?.addEventListener('submit', handleTransactionSubmit);
    
    // 5. 현재 날짜로 초기 설정
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
};