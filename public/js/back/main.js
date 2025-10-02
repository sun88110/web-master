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
const API_BASE = 'http://localhost:3000'; // 서버 API 기본 URL (로그인/가계부 모두 처리)

// ⭐⭐⭐ 핵심 수정: 현재 로그인된 사용자의 ID를 저장할 변수
let CURRENT_USER_ID = null;
let CURRENT_USERNAME = null;
// ⭐⭐⭐ (실제 환경에서는 LocalStorage나 SessionStorage 사용 권장)


// =======================================================
// 유틸리티 함수
// =======================================================

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null) return '0원';
    return new Intl.NumberFormat('ko-KR').format(Math.abs(amount)) + '원';
}

function handleFetchError(error, defaultMsg) {
    console.error('API 처리 중 오류 발생:', error);
    alert(`${defaultMsg} 잠시 후 다시 시도해 주세요. 상세: ${error.message || '알 수 없는 오류'}`);
}

/**
 * 로그인 상태에 따라 UI를 업데이트합니다.
 */
function updateLoginUI() {
    const loginStatus = document.getElementById('login-status');
    const authSection = document.getElementById('auth-section'); // 가정: 로그인 폼을 포함하는 섹션 ID
    const appSection = document.getElementById('app-section'); // 가정: 가계부 기능을 포함하는 섹션 ID

    if (CURRENT_USER_ID) {
        // 로그인 상태
        loginStatus.textContent = `${CURRENT_USERNAME}님 로그인 중`;
        // authSection.style.display = 'none'; // 로그인 폼 숨김 (주석 처리)
        // appSection.style.display = 'block'; // 가계부 기능 표시 (주석 처리)
        loadInitialData(); // 로그인 성공 후 데이터 로드
    } else {
        // 로그아웃 상태
        loginStatus.textContent = `로그아웃됨`;
        // authSection.style.display = 'block'; 
        // appSection.style.display = 'none'; 
        // 데이터 초기화 등 처리
        document.getElementById('total-budget').textContent = '로그인 필요';
        renderTransactions([]);
    }
}


// =======================================================
// UI 업데이트 및 초기화
// =======================================================

function renderTransactions(transactions) {
    const ul = document.getElementById('transactions');
    ul.innerHTML = ''; // 기존 목록 초기화

    if (!transactions || transactions.length === 0) {
        ul.innerHTML = '<li class="no-data">최근 거래 내역이 없습니다.</li>';
        attachDeleteListeners();
        return;
    }

    transactions.forEach(tx => {
        const li = document.createElement('li');
        const typeClass = tx.type === 'INCOME' ? 'income' : 'expense';
        const sign = tx.type === 'INCOME' ? '+' : '-';
        
        const categoryName = CATEGORIES_MAP.find(c => c.id === tx.category_id)?.name || '알 수 없음';
        
        li.className = typeClass;
        li.dataset.id = tx.transaction_id; 
        
        li.innerHTML = `
            <span>${tx.date} | ${categoryName} | ${tx.description}</span> 
            ${sign}${formatCurrency(tx.amount)} 
            <button class="delete-btn">X</button>
        `;
        ul.appendChild(li);
    });

    attachDeleteListeners(); // 렌더링 후 삭제 리스너 다시 붙이기
}


/**
 * 서버에서 초기 예산 및 거래 내역을 가져와 화면에 표시합니다.
 * ⭐ 수정: user_id를 쿼리 파라미터로 전송합니다.
 */
async function loadInitialData() {
    if (!CURRENT_USER_ID) return; // 로그인 안 되어 있으면 중단

    try {
        // ⭐ API 엔드포인트 수정: user_id를 Query Parameter로 추가
        const response = await fetch(`${API_BASE}/data?user_id=${CURRENT_USER_ID}`); 
        
        if (!response.ok) {
             const errorResult = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
             throw new Error(errorResult.message || `데이터 로딩 실패 (상태: ${response.status})`);
        }
        
        const data = await response.json();

        // 예산 업데이트
        document.getElementById('total-budget').textContent = formatCurrency(data.totalBudget);
        
        // 거래 내역 업데이트 및 리스너 등록
        renderTransactions(data.recentTransactions);
        
        // 차트 업데이트 (서버에서 받은 분석 데이터 사용)
        // updateChart(data.categoryAnalysis); 

    } catch (error) {
        handleFetchError(error, "초기 데이터 로딩에 실패했습니다.");
    }
}


// =======================================================
// 인증 이벤트 핸들러 (새로 추가)
// =======================================================

/**
 * 로그인 요청을 처리합니다.
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    // 가정: #login-form 안에 #login-username, #login-password 입력 필드가 존재
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
            // ⭐ 핵심: 로그인 성공 시 USER_ID와 USERNAME 저장
            CURRENT_USER_ID = result.user_id; 
            CURRENT_USERNAME = result.username;
            alert(`${result.username}님, 로그인 성공!`);
            document.getElementById('login-form')?.reset();
            updateLoginUI(); // UI 및 데이터 로드 시작
        } else {
            throw new Error(result.message || '로그인 실패');
        }

    } catch (error) {
        handleFetchError(error, "로그인 처리 중 오류가 발생했습니다.");
    }
}

/**
 * 로그아웃을 처리합니다.
 */
function handleLogout() {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    
    // ⭐ 핵심: 저장된 ID 초기화
    CURRENT_USER_ID = null;
    CURRENT_USERNAME = null;
    alert("로그아웃 되었습니다.");
    updateLoginUI(); // UI 업데이트 및 데이터 초기화
}


// =======================================================
// Chart.js 설정 및 업데이트 (기존 코드 유지)
// =======================================================

let myChart; 

function initChart() {
    const ctx = document.getElementById('age-analysis-chart').getContext('2d');
    const chartData = [30, 15, 10, 5, 10, 5, 5, 5, 10, 5]; 
    
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: CATEGORY_NAMES, 
            datasets: [{
                label: '지출 비중',
                data: chartData,
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


// =======================================================
// 이벤트 핸들러: 예산 등록 (POST /api/budgets)
// =======================================================

/**
 * ⭐ 수정: user_id를 Body에 추가하여 전송합니다.
 */
async function handleBudgetSubmit(e) {
    e.preventDefault();
    
    if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }
    
    const month = document.getElementById('budget-month').value;
    const categoryId = document.getElementById('budget-category').value; 
    const amount = parseInt(document.getElementById('budget-amount-input').value);
    
    if (isNaN(amount) || amount <= 0) {
        alert("유효한 금액을 입력해 주세요.");
        return;
    }
    
    const budgetData = {
        month: month, 
        category_id: categoryId ? parseInt(categoryId) : null, 
        amount: amount,
        user_id: CURRENT_USER_ID // ⭐ 핵심: 사용자 ID 추가
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

/**
 * ⭐ 수정: user_id를 Body에 추가하여 전송합니다.
 */
async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }

    const type = document.querySelector('input[name="transaction-type"]:checked').value;
    const categoryId = document.getElementById('category-select').value; 
    const description = document.getElementById('description').value.trim();
    const amount = parseInt(document.getElementById('amount-input').value);
    const date = document.getElementById('date').value; 
    
    if (!categoryId) {
        alert("카테고리를 선택해 주세요.");
        return;
    }
    if (isNaN(amount) || amount <= 0) {
        alert("유효한 금액을 입력해 주세요.");
        return;
    }

    const transactionData = {
        type: type === '지출' ? 'EXPENSE' : 'INCOME', 
        category_id: parseInt(categoryId), 
        description: description,
        amount: amount,
        date: date,
        user_id: CURRENT_USER_ID // ⭐ 핵심: 사용자 ID 추가
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
            loadInitialData(); // 데이터 새로고침
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
        button.removeEventListener('click', handleDeleteTransaction);
        button.addEventListener('click', handleDeleteTransaction);
    });
}

/**
 * ⭐ 수정: user_id를 Body에 추가하여 전송합니다.
 */
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
        // DELETE 요청 시 Body에 user_id를 포함하여 전송
        const response = await fetch(`${API_BASE}/api/transactions/${transactionId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ user_id: CURRENT_USER_ID }), // ⭐ 핵심: 사용자 ID 추가
        });
        
        if (response.ok) {
            alert("거래가 성공적으로 삭제되었습니다.");
            listItem.remove(); 
            loadInitialData(); // 데이터 새로고침
        } else {
            const result = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
            throw new Error(result.message || '거래 삭제에 실패했습니다.');
        }
    } catch (error) {
        handleFetchError(error, "거래 삭제 처리 중 오류가 발생했습니다.");
    }
}


// =======================================================
// 최종 초기화
// =======================================================

window.onload = function() {
    // 1. 차트 렌더링
    initChart();
    
    // 2. 초기 데이터 로딩 (로그인 상태에 따라 달라짐)
    updateLoginUI(); // 로그인 상태 확인 및 UI 초기화

    // 3. 폼 이벤트 리스너 등록
    // ⭐ 인증 폼 리스너 추가 (HTML에 #login-form이 있다고 가정)
    document.getElementById('login-form')?.addEventListener('submit', handleLoginSubmit);
    // ⭐ 로그아웃 버튼 리스너 추가 (HTML에 #logout-btn이 있다고 가정)
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    document.getElementById('budget-form')?.addEventListener('submit', handleBudgetSubmit);
    document.getElementById('transaction-form')?.addEventListener('submit', handleTransactionSubmit);
    
    // 4. 현재 날짜로 초기 설정
    document.getElementById('date').valueAsDate = new Date();
};