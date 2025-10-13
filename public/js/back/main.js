// main.js

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

const CATEGORIES_MAP = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
const API_BASE = 'http://localhost:3000'; 

let CURRENT_USER_ID = null;
let CURRENT_USERNAME = null;


// =======================================================
// 유틸리티 함수
// =======================================================

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null) return '0원';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
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
    }
}

function renderTransactions(transactions) {
    const ul = document.getElementById('transactions');
    if (!ul) return; 
    
    ul.innerHTML = ''; 

    if (!transactions || transactions.length === 0) {
        ul.innerHTML = '<li class="no-data" style="text-align: center; color: #999;">최근 거래 내역이 없습니다.</li>';
        return;
    }

    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.forEach(tx => {
        const li = document.createElement('li');
        const isIncome = INCOME_CATEGORIES.some(c => c.id === tx.category_id);
        const typeClass = isIncome ? 'income' : 'expense';
        const sign = isIncome ? '+' : '-';
        
        const categoryName = CATEGORIES_MAP.find(c => c.id === tx.category_id)?.name || '미분류';
        
        li.className = typeClass;
        li.dataset.id = tx.transaction_id; 
        
        const displayDate = tx.date ? tx.date.substring(0, 10) : '날짜 미상';
        
        li.innerHTML = `
            <span>${displayDate} | ${categoryName} | ${tx.description}</span> 
            <strong class="amount-display">${sign}${formatCurrency(Math.abs(tx.amount))}</strong>
            <button class="delete-btn">X</button>
        `;
        ul.appendChild(li);
    });

    attachDeleteListeners(); 
}

async function loadInitialData() {
    if (!CURRENT_USER_ID) return; 

    try {
        const response = await fetch(`${API_BASE}/api/data?user_id=${CURRENT_USER_ID}`); 
        
        if (!response.ok) {
            const errorResult = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
            throw new Error(errorResult.message || `데이터 로딩 실패 (상태: ${response.status})`);
        }
        
        const data = await response.json();

        const totalBudgetEl = document.getElementById('total-budget');
        if(totalBudgetEl) {
            totalBudgetEl.textContent = formatCurrency(data.totalBudget || 0);
            totalBudgetEl.style.color = (data.totalBudget < 0) ? '#e74c3c' : '#4CAF50';
        }
        
        renderTransactions(data.recentTransactions);
        updateChart(data); 

    } catch (error) {
        handleFetchError(error, "초기 데이터 로딩에 실패했습니다.");
    }
}


// =======================================================
// Chart.js 설정 및 업데이트
// =======================================================

let myChart; 

function initChart() {
    const ctx = document.getElementById('age-analysis-chart')?.getContext('2d');
    if (!ctx) return;
    
    const expenseCategoryNames = EXPENSE_CATEGORIES.map(c => c.name);
    
    myChart = new Chart(ctx, {
        type: 'doughnut',
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

function updateChart(data) {
    const analysisData = data.categoryAnalysis || [];
    const topListEl = document.getElementById('top-category-list');
    
    if (!myChart || !topListEl) return;

    const dataMap = new Map();
    analysisData.forEach(item => {
        if (EXPENSE_CATEGORIES.some(c => c.name === item.CATEGORY_NAME)) {
             dataMap.set(item.CATEGORY_NAME, item.TOTAL_SPENT || 0);
        }
    });

    const expenseCategoryNames = EXPENSE_CATEGORIES.map(c => c.name);
    const newData = expenseCategoryNames.map(name => dataMap.get(name) || 0); 
    
    const totalSpent = newData.reduce((sum, current) => sum + current, 0);

    myChart.data.labels = expenseCategoryNames;
    myChart.data.datasets[0].data = newData;
    myChart.update();
    
    topListEl.innerHTML = '';
    const topCategories = analysisData.filter(item => EXPENSE_CATEGORIES.some(c => c.name === item.CATEGORY_NAME))
                                     .sort((a, b) => b.TOTAL_SPENT - a.TOTAL_SPENT)
                                     .slice(0, 5); 

    if (topCategories.length === 0) {
           topListEl.innerHTML = '<li style="color: #999;">집계된 지출 내역이 없습니다.</li>';
           return;
    }

    topCategories.forEach((d, index) => {
        const li = document.createElement('li');
        const percentage = totalSpent > 0 ? ((d.TOTAL_SPENT / totalSpent) * 100).toFixed(1) : 0;
        li.textContent = `${index + 1}. ${d.CATEGORY_NAME} - ${percentage}% (${formatCurrency(d.TOTAL_SPENT)})`; 
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
    const categoryId = document.getElementById('budget-category').value; 
    const amount = parseInt(document.getElementById('budget-amount-input').value);
    
    if (isNaN(amount) || amount <= 0) { alert("유효한 금액을 입력해 주세요."); return; }
    
    const budgetData = {
        month: month,
        category_id: categoryId ? parseInt(categoryId) : null,
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
    
    if (!type || !categoryId || isNaN(amount) || amount <= 0 || !date) {
        alert("모든 필드를 올바르게 채워주세요.");
        return;
    }

    const transactionData = {
        type: type, 
        category_id: parseInt(categoryId), 
        description: description,
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
// 최종 초기화 (⭐마이페이지 이동 로직이 여기에 인라인으로 구현됨)
// =======================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. URL 쿼리 파라미터에서 사용자 정보 확인 및 설정
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    const username = urlParams.get('username');
    
    if (userId && username) {
        CURRENT_USER_ID = parseInt(userId);
        CURRENT_USERNAME = decodeURIComponent(username); 
        history.replaceState(null, '', window.location.pathname); 
    }
    
    // 2. 날짜 초기 설정 (현재 날짜/월)
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const budgetMonthInput = document.getElementById('budget-month');
    if (budgetMonthInput) budgetMonthInput.value = currentMonth;

    const dateInput = document.getElementById('date');
    if (dateInput) dateInput.valueAsDate = today;

    // 3. 차트 렌더링
    if (typeof Chart !== 'undefined') {
        initChart();
    }
    
    // 4. 초기 데이터 로딩 (로그인 상태에 따라)
    updateLoginUI(); 

    // 5. 폼 및 로그아웃 이벤트 리스너 등록
    document.querySelector('.logout-btn')?.addEventListener('click', () => {
           alert("로그아웃되었습니다.");
           window.location.href = 'login.html';
    });

    document.getElementById('budget-form')?.addEventListener('submit', handleBudgetSubmit);
    document.getElementById('transaction-form')?.addEventListener('submit', handleTransactionSubmit);
    
    // 6. 거래 유형 변경 리스너 및 초기 카테고리 설정
    const transactionTypeInputs = document.querySelectorAll('input[name="transaction-type"]');
    const categorySelect = document.getElementById('category-select');
    
    const budgetCategorySelect = document.getElementById('budget-category');
    renderCategoryOptions(budgetCategorySelect, EXPENSE_CATEGORIES.filter(c => c.id !== 10), false); 

    transactionTypeInputs.forEach(input => {
        input.addEventListener('change', handleTransactionTypeChange);
    });
    renderCategoryOptions(categorySelect, EXPENSE_CATEGORIES, true); 

    // 7. 마이페이지 이동 이벤트 등록 (⭐하드코딩 인라인 구현)
    document.getElementById('mypage-btn')?.addEventListener('click', (e) => {
        e.preventDefault(); 

        if (!CURRENT_USER_ID || !CURRENT_USERNAME) {
            alert("로그인 정보가 유효하지 않습니다. 먼저 로그인해 주세요.");
            window.location.href = 'login.html'; 
            return;
        }
        
        // 함수 호출 없이, 여기서 직접 파라미터를 인코딩하고 mypage.html로 이동
        const encodedUsername = encodeURIComponent(CURRENT_USERNAME);
        window.location.href = `mypage.html?user_id=${CURRENT_USER_ID}&username=${encodedUsername}`;
    });
});