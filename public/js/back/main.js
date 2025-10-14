// main.js (가계부 메인 페이지 최종 완성본 - 나이대 비교 제거)

// =======================================================
// 전역 설정: 카테고리 데이터 및 서버 엔드포인트
// =======================================================

const EXPENSE_CATEGORIES = [
    { id: 1, name: '식비' }, { id: 2, name: '교통' }, { id: 3, name: '생활' },
    { id: 4, name: '주거' }, { id: 5, name: '통신' }, { id: 6, name: '의료' },
    { id: 7, name: '교육' }, { id: 9, name: '쇼핑' }, { id: 10, name: '기타' }, 
];

const INCOME_CATEGORIES = [
    { id: 8, name: '저축' }, { id: 23, name: '월급' }, 
    { id: 24, name: '용돈' }, { id: 25, name: '이자/배당' }, 
];

// 카테고리 ID로 이름을 찾기 위한 Map 생성
const CATEGORIES_MAP = new Map();
[...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].forEach(c => {
    const type = EXPENSE_CATEGORIES.some(exp => exp.id === c.id) ? '지출' : '수입';
    CATEGORIES_MAP.set(c.id, { name: c.name, type: type });
});

const API_BASE = 'http://192.168.0.9:3000'; 

// 로컬 스토리지를 통해 현재 사용자 정보 로드
let CURRENT_USER_ID = localStorage.getItem('user_id') ? parseInt(localStorage.getItem('user_id')) : null;
let CURRENT_USERNAME = localStorage.getItem('username') || null;


// =======================================================
// 유틸리티 함수
// =======================================================

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null) return '0원';
    // Math.abs()를 사용하여 항상 양수로 포맷하고, 부호는 별도로 처리하도록 합니다.
    return new Intl.NumberFormat('ko-KR').format(Math.abs(amount)) + '원';
}

function handleFetchError(error, defaultMsg) {
    console.error('API 처리 중 오류 발생:', error);
    alert(`${defaultMsg} 잠시 후 다시 시도해 주세요. 상세: ${error.message || '알 수 없는 오류'}`);
}


// =======================================================
// UI 업데이트 및 초기화
// =======================================================

function renderCategoryOptions(selectEl, categories, includeDefault = false) {
    if (!selectEl) return;
    
    selectEl.innerHTML = ''; 

    if (includeDefault) {
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "카테고리 선택";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectEl.appendChild(defaultOption);
    }
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        selectEl.appendChild(option);
    });
}

function handleTransactionTypeChange(e) {
    const selectedType = e.currentTarget.value;
    const selectEl = document.getElementById('category-select');
    
    if (selectedType === '지출') {
        renderCategoryOptions(selectEl, EXPENSE_CATEGORIES, true);
    } else if (selectedType === '수입') {
        renderCategoryOptions(selectEl, INCOME_CATEGORIES, true);
    }
}

function updateLoginUI() {
    if (CURRENT_USER_ID) {
        const welcomeEl = document.getElementById('user-welcome-message'); 
        if (welcomeEl) {
            welcomeEl.innerHTML = `👋 <strong style="color: #4CAF50;">${CURRENT_USERNAME}</strong>님의 가계부`; 
        }
        
        loadInitialData(); 
    } else {
        const welcomeEl = document.getElementById('user-welcome-message'); 
        if (welcomeEl) welcomeEl.innerHTML = `💸 나의 가계부 (로그인 필요)`; 
        
        const totalBudgetEl = document.getElementById('total-budget');
        if (totalBudgetEl) totalBudgetEl.textContent = '로그인 필요';
        
        renderTransactions([]);
        updateChart({ categoryAnalysis: [] }); 
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
    }
}

/**
 * 거래 내역을 렌더링하고, 금액 표시와 삭제 버튼을 정렬하기 위해 <div class="amount-group">으로 감쌉니다.
 */
function renderTransactions(transactions) {
    const ul = document.getElementById('transactions');
    if (!ul) return; 
    
    ul.innerHTML = ''; 

    if (!transactions || transactions.length === 0) {
        ul.innerHTML = '<li class="no-data" style="text-align: center; color: #999;">최근 거래 내역이 없습니다.</li>';
        return;
    }

    transactions.forEach(tx => {
        const li = document.createElement('li');
        // amount가 양수이면 수입, 음수이면 지출로 가정합니다.
        const isIncome = tx.type === '수입' || tx.amount > 0; 
        const typeClass = isIncome ? 'income' : 'expense';
        const sign = isIncome ? '+' : '-'; 
        
        const categoryName = CATEGORIES_MAP.get(tx.category_id)?.name || '미분류';
        
        li.className = typeClass;
        li.dataset.id = tx.transaction_id; 
        
        const displayDate = tx.date ? tx.date.substring(0, 10) : '날짜 미상';
        
        // ⭐ 수정 부분: 금액과 삭제 버튼을 amount-group으로 묶음 ⭐
        li.innerHTML = `
            <span>${displayDate} | ${categoryName} | ${tx.description}</span> 
            <div class="amount-group"> 
                <strong class="amount-display">${sign}${formatCurrency(tx.amount)}</strong>
                <button class="delete-btn">X</button>
            </div>
        `;
        ul.appendChild(li);
    });

    attachDeleteListeners(); 
}

async function loadInitialData() {
    if (!CURRENT_USER_ID) return; 

    try {
        // ⭐ 수정 1: 캐시를 무시하고 항상 최신 데이터를 가져오도록 설정
        const response = await fetch(`${API_BASE}/api/data?user_id=${CURRENT_USER_ID}`, {
             cache: 'no-cache' 
        }); 
        
        if (!response.ok) {
            const errorResult = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
            throw new Error(errorResult.message || `데이터 로딩 실패 (상태: ${response.status})`);
        }
        
        const data = await response.json();

        const totalBudgetEl = document.getElementById('total-budget');
        if(totalBudgetEl) {
            const budgetValue = data.totalBudget || 0;
            const isNegative = budgetValue < 0;
            
            const sign = isNegative ? '-' : ''; // 음수일 경우 formatCurrency에서 이미 처리되었으므로 빈 문자열
            const formattedAmount = formatCurrency(budgetValue); 

            totalBudgetEl.textContent = `${sign}${formattedAmount}`; 
            
            totalBudgetEl.style.color = isNegative ? '#e74c3c' : '#4CAF50';
        }
        
        renderTransactions(data.recentTransactions);
        updateChart(data); 

    } catch (error) {
        handleFetchError(error, "초기 데이터 로딩에 실패했습니다.");
    }
}


// =======================================================
// Chart.js 설정 및 업데이트 (지출 분석)
// =======================================================

let myChart; 

function initChart() {
    const ctx = document.getElementById('age-analysis-chart')?.getContext('2d');
    if (!ctx) return;
    
    const expenseCategoryNames = EXPENSE_CATEGORIES.map(c => c.name);
    
    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(ctx, {
        type: 'pie', 
        data: {
            labels: expenseCategoryNames, 
            datasets: [{
                label: '지출 비중',
                data: expenseCategoryNames.map(() => 0), 
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
                title: { display: true, text: '카테고리별 지출 비중' }
            }
        }
    });
}

/**
 * 서버에서 받은 분석 데이터를 기반으로 차트와 TOP 5 목록을 업데이트합니다.
 * 나이대 비교 정보는 표시하지 않습니다.
 */
function updateChart(data) {
    const analysisData = data.categoryAnalysis || [];
    const topListEl = document.getElementById('top-category-list');
    const ageGroupInfoEl = document.getElementById('user-age-group-info');
    
    if (!myChart || !topListEl || !ageGroupInfoEl) return;

    // 1. 분석 영역의 제목 업데이트 (사용자 지출 분포만 표시)
    const reportMonth = data.reportMonth || '이번 달';
    
    ageGroupInfoEl.innerHTML = `
        <p><strong>나의 카테고리 지출 분포</strong></p>
        <p style="font-size: 0.8em; color: #555;">(기준 월: ${reportMonth})</p>
        <canvas id="age-analysis-chart"></canvas>
    `;
    // DOM 재구성으로 인해 차트 인스턴스 재초기화
    initChart(); 
    if (!myChart) return;

    // 2. 차트 데이터 준비
    const dataMap = new Map();
    // 지출(expense)만 차트에 반영합니다.
    analysisData.forEach(item => {
        // 지출은 amount가 DB에서 음수로 저장되는 경우 Math.abs()를 사용합니다.
        dataMap.set(item.CATEGORY_ID, Math.abs(item.TOTAL_SPENT) || 0); 
    });

    const expenseCategoryNames = EXPENSE_CATEGORIES.map(c => c.name);
    const newData = EXPENSE_CATEGORIES.map(c => dataMap.get(c.id) || 0); 
    
    const totalSpent = newData.reduce((sum, current) => sum + current, 0);

    // 3. 차트 데이터 바인딩 및 업데이트
    myChart.data.labels = expenseCategoryNames;
    
    if (totalSpent === 0) {
        myChart.data.datasets[0].data = expenseCategoryNames.map(() => 0);
        topListEl.innerHTML = '<li style="color: #999;">집계된 지출 내역이 없습니다.</li>';
    } else {
        myChart.data.datasets[0].data = newData;
        // 4. TOP 5 목록 업데이트
        updateTopFiveList(analysisData, totalSpent, topListEl); 
    }

    myChart.update();
}

/**
 * TOP 5 목록 업데이트 로직
 */
function updateTopFiveList(analysisData, totalSpent, topListEl) {
    topListEl.innerHTML = ''; // 초기화
    
    // 지출액 (절대값) 기준으로 정렬
    const topCategories = analysisData
        .sort((a, b) => Math.abs(b.TOTAL_SPENT) - Math.abs(a.TOTAL_SPENT)) 
        .slice(0, 5); 

    topCategories.forEach((d, index) => {
        const li = document.createElement('li');
        const expenseAmount = Math.abs(d.TOTAL_SPENT);
        const percentage = totalSpent > 0 ? ((expenseAmount / totalSpent) * 100).toFixed(1) : 0;
        const categoryName = CATEGORIES_MAP.get(d.CATEGORY_ID)?.name || '미분류';

        li.innerHTML = `
            <span class="rank-badge">${index + 1}위</span>
            <span class="category-name">${categoryName}</span>
            <span class="amount-spent">${percentage}% (${formatCurrency(expenseAmount)})</span>
        `;
        topListEl.appendChild(li);
    });
}


// =======================================================
// 이벤트 핸들러: 폼 제출 및 삭제
// =======================================================

async function handleBudgetSubmit(e) {
    e.preventDefault();
    
    if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }
    
    const monthInput = document.getElementById('budget-month').value;
    if (!monthInput) { alert("예산 월을 선택해 주세요."); return; }
    
    const month = monthInput.replace('-', ''); 
    const budgetAmountEl = document.getElementById('budget-amount-input'); 

    const amount = parseInt(budgetAmountEl.value);
    
    if (isNaN(amount) || amount <= 0) { alert("유효한 금액을 입력해 주세요."); return; }
    
    const budgetData = {
        month: month,
        amount: amount, 
        user_id: CURRENT_USER_ID
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify(budgetData),
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`예산이 성공적으로 등록/업데이트되었습니다: ${formatCurrency(amount)}`);
            
            document.getElementById('budget-form').reset();
            budgetAmountEl.value = ''; 
            
            loadInitialData();
        } else {
            throw new Error(result.message || '예산 등록에 실패했습니다.');
        }
    } catch (error) {
        handleFetchError(error, "예산 등록 처리 중 오류가 발생했습니다.");
    }
}

async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }

    const type = document.querySelector('input[name="transaction-type"]:checked')?.value; 
    const categoryId = document.getElementById('category-select').value; 
    const description = document.getElementById('description').value.trim();
    const amountInput = document.getElementById('amount-input').value;
    const date = document.getElementById('date').value; 
    
    const amount = parseInt(amountInput);
    
    if (!type || !categoryId || isNaN(amount) || amount <= 0 || !date || description === "") {
        alert("모든 필드를 올바르게 채워주세요.");
        return;
    }

    const transactionData = {
        type: type, 
        category_id: parseInt(categoryId), 
        description: description,
        // 현재 로직은 amount를 양수로 전달하는 것으로 유지합니다.
        amount: amount, 
        date: date, 
        user_id: CURRENT_USER_ID 
    };

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
            // 기본 카테고리를 다시 '지출'로 초기화
            document.getElementById('type-expense').checked = true;
            renderCategoryOptions(document.getElementById('category-select'), EXPENSE_CATEGORIES, true);
            
            // ⭐ 수정 2: 50ms 지연 후 데이터 로드 (서버의 잔액 계산 완료를 기다림) ⭐
            await new Promise(resolve => setTimeout(resolve, 50)); 
            
            loadInitialData(); 
        } else {
            throw new Error(result.message || '거래 등록에 실패했습니다.');
        }
    } catch (error) {
        handleFetchError(error, "거래 등록 처리 중 오류가 발생했습니다.");
    }
}

function attachDeleteListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', handleDeleteTransaction); 
        button.addEventListener('click', handleDeleteTransaction);
    });
}

async function handleDeleteTransaction(e) {
    if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }

    if (!confirm('정말로 이 거래를 삭제하시겠습니까?')) return;
    
    const listItem = e.currentTarget.closest('li');
    const transactionId = listItem.dataset.id; 
    
    if (!transactionId) { alert("삭제할 거래 ID를 찾을 수 없습니다."); return; }
    
    try {
        const response = await fetch(`${API_BASE}/api/transactions/${transactionId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({ user_id: CURRENT_USER_ID }), 
        });
        
        if (response.ok) {
            alert("거래가 성공적으로 삭제되었습니다.");
            listItem.remove(); 
            // ⭐ 지연 후 데이터 로드 (서버의 잔액 계산 완료를 기다림) ⭐
            await new Promise(resolve => setTimeout(resolve, 50)); 
            loadInitialData(); 
        } else {
            const result = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
            throw new Error(result.message || '거래 삭제에 실패했습니다. (권한 없음)'); 
        }
    } catch (error) {
        handleFetchError(error, "거래 삭제 처리 중 오류가 발생했습니다.");
    }
}

// =======================================================
// 최종 초기화 및 이벤트 등록
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. 로그인 정보 로드 및 설정
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('user_id');
    const urlUsername = urlParams.get('username');
    
    if (urlUserId && urlUsername) {
        localStorage.setItem('user_id', urlUserId);
        localStorage.setItem('username', decodeURIComponent(urlUsername));
        
        CURRENT_USER_ID = parseInt(urlUserId);
        CURRENT_USERNAME = decodeURIComponent(urlUsername);
        
        history.replaceState(null, '', window.location.pathname); 
    }
    
    // 2. 날짜 초기 설정
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const budgetMonthInput = document.getElementById('budget-month');
    if (budgetMonthInput) budgetMonthInput.value = currentMonth;

    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.valueAsDate = today;

    // 3. 차트 초기 렌더링
    if (typeof Chart !== 'undefined' && CURRENT_USER_ID) {
        initChart();
    }
    
    // 4. 초기 데이터 로딩
    updateLoginUI(); 

    // 5. 폼 및 로그아웃 이벤트 리스너 등록
    document.querySelector('.logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        alert("로그아웃되었습니다.");
        window.location.href = 'login.html';
    });

    document.getElementById('budget-form')?.addEventListener('submit', handleBudgetSubmit);
    document.getElementById('transaction-form')?.addEventListener('submit', handleTransactionSubmit);
    
    // 6. 거래 유형 변경 리스너 및 초기 카테고리 설정
    const transactionTypeInputs = document.querySelectorAll('input[name="transaction-type"]');
    const categorySelect = document.getElementById('category-select');
    
    transactionTypeInputs.forEach(input => {
        input.addEventListener('change', handleTransactionTypeChange);
    });
    renderCategoryOptions(categorySelect, EXPENSE_CATEGORIES, true); 

    // 7. 마이페이지 이동 이벤트 등록
    document.getElementById('mypage-btn')?.addEventListener('click', (e) => {
        e.preventDefault(); 
        if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }
        
        const encodedUsername = encodeURIComponent(CURRENT_USERNAME);
        window.location.href = `mypage.html?user_id=${CURRENT_USER_ID}&username=${encodedUsername}`;
    });
    
    // 8. 전체 내역 조회 버튼 이벤트 등록
    document.getElementById('view-all-history-btn')?.addEventListener('click', (e) => {
        e.preventDefault(); 
        if (!CURRENT_USER_ID) { alert("로그인이 필요합니다."); return; }
        
        const encodedUsername = encodeURIComponent(CURRENT_USERNAME);
        window.location.href = `full_history.html?user_id=${CURRENT_USER_ID}&username=${encodedUsername}`;
    });
});