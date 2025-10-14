// full_history.js

// ----------------------------------------------------
// [Node.js/Oracle 환경] 상수 및 전역 변수 설정
// ----------------------------------------------------
const BASE_API_URL = 'http://192.168.0.9:3000/api/transactions'; 

// main.js와 동일한 카테고리 정의 (일관성 유지)
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

// 세션 정보 추출
const urlParams = new URLSearchParams(window.location.search);
const USER_ID = urlParams.get('user_id') || 'guest';
const USER_NAME = urlParams.get('username') ? decodeURIComponent(urlParams.get('username')) : '';

const ITEMS_PER_PAGE = 10;
let currentPage = 1;

// --- 유틸리티 함수 ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};
const handleFetchError = (error, defaultMsg) => {
    console.error('API 처리 중 오류 발생:', error);
    // 서버에서 detail 메시지를 받은 경우 포함하여 경고 메시지 개선
    alert(`${defaultMsg} 잠시 후 다시 시도해 주세요. 상세: ${error.detail || error.message || '알 수 없는 오류'}`);
};


// ----------------------------------------------------
// 핵심 기능: 내역 조회 (필터링 및 페이지네이션 포함)
// ----------------------------------------------------
async function fetchHistory(page = 1) {
    const container = document.getElementById('transaction-list-body');
    const pagingControls = document.getElementById('paging-controls');
    
    // 로딩 메시지 표시
    container.innerHTML = '<div class="transaction-item" style="text-align: center;">데이터를 서버에서 조회 중입니다...</div>';
    pagingControls.innerHTML = '';
    
    currentPage = page;

    const fromDate = document.getElementById('filter-from-date').value;
    const toDate = document.getElementById('filter-to-date').value;
    const description = document.getElementById('filter-description').value.trim();
    const categoryName = document.getElementById('filter-category').value; 
    
    if (USER_ID === 'guest') {
         container.innerHTML = '<div class="transaction-item" style="text-align: center;">로그인 정보가 없어 거래 내역을 조회할 수 없습니다.</div>';
         return;
    }

    if (!fromDate || !toDate) {
        container.innerHTML = '<div class="transaction-item" style="text-align: center;">날짜 범위를 선택해 주세요.</div>';
        return;
    }
    
    // 💡 카테고리 이름으로 ID를 찾아 필터에 사용 (개선: "전체"일 경우 명확히 null 처리)
    let categoryId = null;
    if (categoryName && categoryName !== "전체") {
        const categoryMapItem = CATEGORIES_MAP.find(c => c.name === categoryName);
        categoryId = categoryMapItem ? categoryMapItem.id : null;
    }

    const filters = {
        userId: USER_ID,
        fromDate: fromDate,
        toDate: toDate,
        description: description || null,
        categoryId: categoryId, // null 또는 숫자 ID가 전송됨
        page: page,
        limit: ITEMS_PER_PAGE
    };

    try {
        const response = await fetch(`${BASE_API_URL}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters)
        });
        
        if (!response.ok) {
            // 서버에서 보낸 에러 상세 정보(detail)를 받아오기 시도
            const errorResult = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
            // 서버에서 받은 상세 메시지(detail)를 에러 객체에 추가
            const error = new Error(errorResult.message || `데이터 로딩 실패 (상태: ${response.status})`);
            error.detail = errorResult.detail; 
            throw error;
        }

        const data = await response.json();

        if (data.success && data.transactions) {
            const totalCount = data.totalCount || 0;
            
            // 서버에서 받은 데이터를 클라이언트 형식에 맞게 가공
            const transactions = data.transactions.map(tx => ({
                id: tx.id, // 수정: TRANSACTION_ID -> ID
                date: tx.date.substring(0, 10),
                category: CATEGORIES_MAP.find(c => c.id === tx.category_id)?.name || '미분류',
                description: tx.description,
                amount: Math.abs(tx.amount), 
                // 서버에서 amount가 양수면 수입, 음수면 지출로 가정
                type: tx.amount > 0 ? 'income' : 'expense' 
            }));

            renderTransactions(transactions);
            
            const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
            renderPagination(page, totalPages);

        } else {
            container.innerHTML = `<div class="transaction-item" style="text-align: center;">조회된 내역이 없습니다.</div>`;
            renderPagination(1, 1);
        }

    } catch (error) {
        console.error("거래 내역 로드 실패:", error);
        // 사용자에게 서버 오류의 상세 내용(detail)을 포함하여 알림
        handleFetchError(error, "거래 내역 조회 중 오류가 발생했습니다.");
        container.innerHTML = '<div class="transaction-item" style="text-align: center; color: #e74c3c;">서버 연결 실패 또는 DB 오류가 발생했습니다. 자세한 내용은 콘솔을 확인하세요.</div>';
        renderPagination(1, 1);
    }
}


// ----------------------------------------------------
// UI 렌더링 및 삭제 로직
// (생략: 변경 없음)
// ----------------------------------------------------

/**
 * 거래 내역 목록을 화면에 렌더링합니다.
 */
function renderTransactions(transactions) {
    const container = document.getElementById('transaction-list-body');
    container.innerHTML = '';
    
    if (transactions.length === 0) {
        container.innerHTML = '<div class="transaction-item" style="text-align: center;">조회된 내역이 없습니다.</div>';
        return;
    }

    transactions.forEach(tx => {
        const isIncome = tx.type === 'income';
        const sign = isIncome ? '+' : '-';
        // HTML 스타일에 맞게 색상 정의
        const color = isIncome ? 'color: #27ae60; font-weight: 700;' : 'color: #c0392b; font-weight: 700;';
        
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.dataset.id = tx.id; // 삭제 기능을 위해 ID 저장

        item.innerHTML = `
            <div class="item-details">
                <span class="tx-date">${tx.date}</span>
                <span class="tx-description">${tx.description}</span>
                <span class="tx-category">${tx.category}</span>
                <span class="tx-amount" style="${color}">${sign} ${formatCurrency(tx.amount)}</span>
            </div>
            <button class="delete-btn" data-id="${tx.id}">X</button>
        `;
        container.appendChild(item);
    });
    
    // 삭제 버튼 이벤트 리스너 등록
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteTransaction);
    });
}

/**
 * 페이지네이션 컨트롤을 렌더링합니다.
 */
function renderPagination(current, total) {
    const controls = document.getElementById('paging-controls');
    controls.innerHTML = '';
    if (total <= 1) return;

    // 이전 버튼
    const prev = document.createElement('button');
    prev.textContent = '◀️ 이전';
    prev.disabled = current === 1;
    prev.onclick = () => fetchHistory(current - 1);
    controls.appendChild(prev);

    // 페이지 번호 표시
    const span = document.createElement('span');
    span.textContent = `${current} / ${total}`;
    controls.appendChild(span);

    // 다음 버튼
    const next = document.createElement('button');
    next.textContent = '다음 ▶️';
    next.disabled = current === total;
    next.onclick = () => fetchHistory(current + 1);
    controls.appendChild(next);
}

/**
 * 거래 삭제 요청을 처리합니다.
 */
async function handleDeleteTransaction(e) {
    if (!USER_ID || USER_ID === 'guest') { 
        alert("로그인이 필요합니다."); 
        return; 
    }
    
    const transactionId = e.currentTarget.dataset.id;
    if (!transactionId || !confirm(`거래 ID ${transactionId}를 삭제하시겠습니까?`)) return;

    try {
        const response = await fetch(`${BASE_API_URL}/${transactionId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: USER_ID }), 
        });
        
        if (response.ok) {
            alert("거래가 성공적으로 삭제되었습니다.");
            fetchHistory(currentPage); // 현재 페이지를 다시 로드
        } else {
            const result = await response.json().catch(() => ({ message: `HTTP 오류: ${response.status}` }));
            // 서버에서 받은 상세 메시지(detail)를 에러 객체에 추가하여 handleFetchError로 전달
            const error = new Error(result.message || '삭제에 실패했습니다.');
            error.detail = result.detail;
            throw error;
        }
    } catch (error) {
        handleFetchError(error, "거래 삭제 처리 중 오류가 발생했습니다.");
    }
}


// ----------------------------------------------------
// 초기화 및 이벤트 등록
// (생략: 변경 없음)
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. 페이지 제목 설정
    const titleEl = document.querySelector('.history-container h2');
    if (titleEl && USER_NAME) {
        titleEl.textContent = `${USER_NAME}님의 전체 거래 내역 조회`;
    } else {
         titleEl.textContent = `가계부 전체 내역 조회 ${USER_ID !== 'guest' ? '(ID: ' + USER_ID + ')' : ''}`;
    }

    // 2. 메인으로 돌아가기 버튼 연결 (세션 유지)
    const mainBackBtn = document.getElementById('main-back-btn-full');
    if (mainBackBtn) {
        mainBackBtn.onclick = () => {
            const encodedUsername = encodeURIComponent(USER_NAME);
            window.location.href = `main.html?user_id=${USER_ID}&username=${encodedUsername}`;
        };
    }
    
    // 3. 기본 날짜 설정
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const todayStr = today.toISOString().substring(0, 10);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().substring(0, 10);
    
    document.getElementById('filter-from-date').value = thirtyDaysAgoStr;
    document.getElementById('filter-to-date').value = todayStr;

    // 4. 검색 폼 이벤트 등록
    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        fetchHistory(1); 
    });
    
    // 5. 초기 데이터 로드
    fetchHistory(1); 
});