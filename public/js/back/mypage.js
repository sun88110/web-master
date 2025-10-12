// mypage.js 파일 완성본

const API_BASE_URL = '/api';

/**
 * 금액을 원화 형식으로 포맷팅하는 함수
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '0원';
    return Number(amount).toLocaleString('ko-KR') + '원';
}

/**
 * 목표 예산 표시를 업데이트하는 함수
 */
function updateGoalDisplay(goalAmount) {
    const strongElement = document.querySelector('#goal-display strong');
    
    if (goalAmount > 0) {
        strongElement.textContent = formatCurrency(goalAmount);
    } else {
        strongElement.textContent = '목표 미설정';
    }
}

/**
 * 최근 거래 내역 테이블을 채우는 함수
 */
function renderTransactions(transactions) {
    const tableBody = document.querySelector('.transaction-history-section tbody');
    tableBody.innerHTML = ''; 

    if (transactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="px-4 sm:px-6 py-4 text-center text-gray-500">
                    아직 등록된 거래 내역이 없습니다.
                </td>
            </tr>
        `;
        return;
    }

    transactions.forEach(transaction => {
        const date = transaction.TRANSACTION_DATE; 
        const type = transaction.TYPE;
        const amount = transaction.AMOUNT;
        // CATEGORY_NAME은 서버에서 JOIN을 통해 가져왔다고 가정
        const description = transaction.DESCRIPTION || transaction.CATEGORY_NAME; 
        
        const amountSign = type === '수입' ? '+' : '-';
        const typeColor = type === '수입' ? 'text-green-600' : 'text-red-600';
        const amountColor = type === '수입' ? 'text-green-700' : 'text-red-700';

        const row = `
            <tr class="hover:bg-gray-50">
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap">${date}</td>
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap ${typeColor} font-medium">${type} (${transaction.CATEGORY_NAME})</td>
                <td class="px-4 sm:px-6 py-4">${description}</td>
                <td class="px-4 sm:px-6 py-4 whitespace-nowrap font-bold text-right ${amountColor}">
                    ${amountSign} ${formatCurrency(amount)}
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}


/**
 * 페이지 초기화 및 데이터 로드 함수
 */
async function initMypage() {
    // ⭐ login.js에서 저장된 user_id를 가져옴
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // 서버의 마이페이지 API 엔드포인트 호출
        const url = `${API_BASE_URL}/mypage_data?user_id=${userId}`; 
        
        const response = await fetch(url);
        
        // fetch 성공했으나 JSON 파싱에 실패하면 (예: HTML 응답) '연결할 수 없습니다' 오류로 이어질 수 있음
        const data = await response.json(); 

        if (response.ok) {
            updateGoalDisplay(data.goalBudget);
            renderTransactions(data.recentTransactions);
        } else {
            console.error('Failed to load mypage data:', data.detail || data.message);
            alert('데이터 로드에 실패했습니다: ' + (data.detail || data.message || '서버 응답 오류'));
        }
    } catch (error) {
        // ⭐ 이전에 발생했던 오류 지점: fetch 자체가 실패한 경우
        console.error('Network or server error:', error);
        alert('서버에 연결할 수 없습니다. Node.js 서버가 실행 중이고 DB에 연결되었는지 확인해주세요.');
    }
}

// 페이지 로드 시 initMypage 함수 실행
window.onload = initMypage;