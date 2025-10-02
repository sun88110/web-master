const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");

// 1. 결과 형식을 객체로 설정 (사용권장)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// 2. DateBase 연결 정보
const dbConfig = {
    user: "scott",
    password: "tiger",
    connectString: "localhost:1521/xe", // Oracle XE의 기본 설정
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0,
    poolAlias: "APP_POOL",
};

// 3. Oracle DB 연결 풀 초기화 함수
async function initialize() {
    try {
        await oracledb.createPool(dbConfig);
        console.log("Oracle DB 연결 풀 생성 성공!");
    } catch (err) {
        console.log("Oracle DB 연결 실패:");
        console.error(err);
        process.exit(1); // 연결 실패 시 서버 종료
    }
}

const app = express();
app.use(cors());
app.use(express.json()); // 클라이언트에서 전송된 JSON 데이터를 처리하기 위해 필수

// =======================================================
// 📌 0. 기본 및 게시판 라우트
// =======================================================

app.get("/", (req, res) => { // 주소창에 http://localhost:3000/ 쓰면 호출
    res.send('Root 페이지가 요청되었습니다 - 가계부 서버가 작동 중입니다.');
});

// 게시글 목록 (페이징)
app.get('/board/:page', async (req, res) => {
    let page = req.params.page;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);
        const sql = `select b.*
					 from (select /*+ INDEX_DESC(a PK_BOARD_T) */ rownum rn, a.*
						   from board_t a ) b
					 where b.rn > (${page} - 1) * 10
					 and   b.rn <= (${page} * 10)`;
        const result = await connection.execute(sql);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("※Error executing board query:", err);
        res.status(500).json({ error: "게시글 조회 중 오류가 발생했습니다.", detail: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error("※Error closing connection:", err); }
        }
    }
});

// =======================================================
// 📌 1. 회원 인증/정보 라우트 (/users)
// =======================================================

// 회원가입 (USERS 테이블 등록)
app.post('/users/register', async (req, res) => {
    const { username, password, email, birthYear } = req.body;
    // ⚠️ 보안 경고: 실제 운영 환경에서는 반드시 비밀번호를 해싱해야 합니다.
    const passwordHash = password;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);
        const sql = `
			 INSERT INTO USERS (USERNAME, PASSWORD_HASH, EMAIL, BIRTH_YEAR, JOIN_DATE)
			 VALUES (:username, :passwordHash, :email, :birthYear, SYSDATE)
		 `;
        const binds = { username: username, passwordHash: passwordHash, email: email, birthYear: parseInt(birthYear) };
        const options = { autoCommit: true, outFormat: oracledb.OUT_FORMAT_OBJECT };

        const result = await connection.execute(sql, binds, options);

        if (result.rowsAffected === 1) {
            res.status(201).json({ success: true, message: "사용자 계정이 성공적으로 생성되었습니다." });
        } else {
            res.status(400).json({ error: "사용자 등록에 실패했습니다. (DB 오류)" });
        }
    } catch (err) {
        if (connection) { try { await connection.rollback(); } catch (rbErr) { console.error("※Error during rollback:", rbErr); } }
        console.error("※Error executing register query:", err);
        res.status(500).json({ error: "회원가입 중 서버 오류가 발생했습니다. (아이디/이메일 중복 등)", detail: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (err) { console.error("※Error closing connection:", err); } }
    }
});

// 회원 로그인 인증
app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    let connection;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: "아이디와 비밀번호를 모두 입력해야 합니다." });
        }
        connection = await oracledb.getConnection(dbConfig.poolAlias);
        
        // ⭐ SQL 수정: USER_ID를 포함하여 조회합니다.
        const sql = `SELECT USER_ID, USERNAME, PASSWORD_HASH FROM USERS WHERE USERNAME = :username`;
        const result = await connection.execute(sql, { username: username });
        const user = result.rows[0];

        // ⚠️ 보안 경고: 실제 운영 환경에서는 bcrypt.compare(password, user.PASSWORD_HASH) 사용
        if (!user || (password !== user.PASSWORD_HASH)) {
            return res.status(401).json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
        }

        // 로그인 성공 (실제로는 JWT 토큰 발급 로직 추가)
        // ⭐ 응답 수정: USER_ID를 포함하여 클라이언트에게 반환합니다.
        res.status(200).json({ 
            success: true, 
            message: "로그인 성공!", 
            username: user.USERNAME,
            user_id: user.USER_ID // <--- 이 값을 클라이언트가 저장합니다.
        });

    } catch (err) {
        console.error("※Error during login process:", err);
        res.status(500).json({ error: "로그인 처리 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (err) { console.error("※Error closing connection:", err); } }
    }
});

// 회원 목록 조회
app.get("/emp/:USER_ID/:USERNAME/:BIRTH_YEAR", async (req, res) => {
    const { USER_ID, USERNAME, BIRTH_YEAR } = req.params;
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);
        const sql = `SELECT *
			 FROM users
			 where USER_ID = DECODE ('${USER_ID}', 'ALL', USER_ID, '${USER_ID}')
			 and   USERNAME = DECODE ('${USERNAME}', 'ALL', USERNAME, '${USERNAME}')
			 and   BIRTH_YEAR = DECODE (${BIRTH_YEAR}, -1, BIRTH_YEAR, ${BIRTH_YEAR})`;
        const result = await connection.execute(sql);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("※Error executing user list query:", err);
        res.status(500).json({ error: "데이터 조회 중 오류가 발생했습니다.", detail: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (err) { console.error("※Error closing connection:", err); } }
    }
});


// =======================================================
// 📌 2. 가계부 API 라우트 (/api)
// =======================================================

// -------------------------------------------------------
// 2.1. 거래 등록 (POST /api/transactions) - 사용자 ID 동적 처리 완료
// -------------------------------------------------------

app.post('/api/transactions', async (req, res) => {
    // ⭐ Body에서 user_id를 받습니다.
    const { type, category_id, description, amount, date, user_id } = req.body;
    
    // ⭐ 받은 user_id를 사용합니다.
    const USER_ID_TO_USE = parseInt(user_id); 
    const DB_TYPE = type === 'EXPENSE' ? '지출' : (type === 'INCOME' ? '수입' : null);
    
    // 안전한 데이터 처리를 위해 숫자 타입으로 명시적 변환
    const parsed_category_id = parseInt(category_id);
    const parsed_amount = parseFloat(amount); 
    
    let connection;

    try {
        // 유효성 검사 시 user_id도 체크
        if (!DB_TYPE || isNaN(USER_ID_TO_USE) || isNaN(parsed_category_id) || !description || isNaN(parsed_amount) || !date) {
            return res.status(400).json({ message: "모든 필수 거래 정보를 입력해야 하며, 금액/카테고리/사용자 정보가 유효해야 합니다." });
        }

        connection = await oracledb.getConnection(dbConfig.poolAlias);
        
        const sql = `
			 INSERT INTO TRANSACTIONS (TRANSACTION_ID, USER_ID, CATEGORY_ID, TRANSACTION_DATE, AMOUNT, DESCRIPTION, TYPE)
			 VALUES (TRANSACTIONS_SEQ.NEXTVAL, :user_id, :category_id, TO_DATE(:date, 'YYYY-MM-DD'), :amount, :description, :type)
		 `;
        
        // ⭐ Bind 변수: USER_ID_TO_USE 사용
        const binds = { 
            user_id: USER_ID_TO_USE, 
            category_id: parsed_category_id, 
            date: date, 
            amount: parsed_amount, 
            description: description, 
            type: DB_TYPE 
        };
        
        const options = { autoCommit: true };

        const result = await connection.execute(sql, binds, options);

        if (result.rowsAffected === 1) {
            res.status(201).json({ success: true, message: "거래가 성공적으로 등록되었습니다." });
        } else {
            res.status(400).json({ error: "거래 등록에 실패했습니다. (DB 오류: 0건 반영)" });
        }
    } catch (err) {
        console.error("※🚨🚨 실제 발생한 DB 오류 🚨🚨:", err); 
        console.error("※Error during transaction registration:", err);
        res.status(500).json({ error: "거래 등록 중 서버 오류가 발생했습니다. (DB 시퀀스/FK 확인 필요)", detail: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (err) { console.error("※Error closing connection:", err); } }
    }
});
// -------------------------------------------------------
// 2.2. 거래 삭제 (DELETE /api/transactions/:id) - 사용자 ID 동적 처리로 수정
// -------------------------------------------------------
app.delete('/api/transactions/:id', async (req, res) => {
    const transactionId = req.params.id;
    // ⭐ Body에서 user_id를 받아서 사용합니다. (클라이언트에서 전송 필요)
    const userIdToDelete = parseInt(req.body.user_id); 
    
    if (isNaN(userIdToDelete)) {
        return res.status(400).json({ message: "유효한 사용자 ID가 필요합니다." });
    }
    
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);
        const sql = `
			 DELETE FROM TRANSACTIONS
			 WHERE TRANSACTION_ID = :transactionId AND USER_ID = :userId
		 `;

        // ⭐ userIdToDelete 사용
        const binds = { transactionId: transactionId, userId: userIdToDelete };
        const options = { autoCommit: true };

        const result = await connection.execute(sql, binds, options);

        if (result.rowsAffected === 1) {
            res.status(200).json({ success: true, message: `${transactionId}번 거래가 성공적으로 삭제되었습니다.` });
        } else {
            res.status(404).json({ message: "해당 거래 내역을 찾거나 삭제 권한이 없습니다." });
        }

    } catch (err) {
        console.error("※Error during transaction deletion:", err);
        res.status(500).json({ error: "거래 삭제 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (err) { console.error("※Error closing connection:", err); } }
    }
});


// -------------------------------------------------------
// 2.3. 예산 등록 (POST /api/budgets) - 사용자 ID 동적 처리로 수정
// -------------------------------------------------------
app.post('/api/budgets', async (req, res) => {
    // ⭐ Body에서 user_id를 받습니다.
    const { month, category_id, amount, user_id } = req.body; 
    
    const USER_ID_TO_USE = parseInt(user_id); // 사용할 사용자 ID
    const BUDGET_MONTH_DB = month.replace('-', ''); // DB 형식 YYYYMM
    
    let connection;

    try {
        if (!month || !amount || isNaN(USER_ID_TO_USE)) {
            return res.status(400).json({ message: "예산 월, 금액, 사용자 ID를 모두 입력해야 합니다." });
        }

        connection = await oracledb.getConnection(dbConfig.poolAlias);

        // MERGE INTO 문을 사용하여 이미 존재하는 예산이 있다면 업데이트, 없다면 삽입 처리
        const sql = `
			 MERGE INTO BUDGETS B
			 USING (SELECT :user_id AS USER_ID, :month AS BUDGET_MONTH, :category_id AS CATEGORY_ID FROM DUAL) D
			 ON (B.USER_ID = D.USER_ID AND B.BUDGET_MONTH = D.BUDGET_MONTH AND 
				 (B.CATEGORY_ID = D.CATEGORY_ID OR (B.CATEGORY_ID IS NULL AND D.CATEGORY_ID IS NULL)))
			 WHEN MATCHED THEN
				 UPDATE SET B.BUDGET_AMOUNT = :amount
			 WHEN NOT MATCHED THEN
				 INSERT (USER_ID, BUDGET_MONTH, CATEGORY_ID, BUDGET_AMOUNT)
				 VALUES (:user_id, :month, :category_id, :amount)
		 `;

        const binds = {
            // ⭐ USER_ID_TO_USE 사용
            user_id: USER_ID_TO_USE,
            month: BUDGET_MONTH_DB,
            category_id: category_id ? parseInt(category_id) : null,
            amount: amount
        };

        const options = { autoCommit: true };
        const result = await connection.execute(sql, binds, options);

        if (result.rowsAffected >= 1) {
            res.status(201).json({ success: true, message: "예산이 성공적으로 등록 또는 업데이트되었습니다." });
        } else {
            res.status(400).json({ error: "예산 처리 중 DB 오류가 발생했습니다." });
        }
    } catch (err) {
        console.error("※Error during budget registration:", err);
        res.status(500).json({ error: "예산 처리 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (err) { console.error("※Error closing connection:", err); } }
    }
});


// -------------------------------------------------------
// 2.4. 초기 대시보드 데이터 로딩 (GET /api/data) - 사용자 ID 동적 처리로 수정
// -------------------------------------------------------
app.get('/api/data', async (req, res) => {
    // ⭐ Query Parameter에서 user_id를 받아서 사용합니다.
    const USER_ID = parseInt(req.query.user_id); 
    
    if (isNaN(USER_ID)) {
        return res.status(400).json({ error: "사용자 ID를 지정해야 합니다." });
    }
    
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);

        // 현재 월 (YYYYMM) 계산
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const currentMonth = `${year}${month}`;

        // 1. 이번 달 총 예산 조회
        const budgetSql = `
			 SELECT BUDGET_AMOUNT FROM BUDGETS 
			 WHERE USER_ID = :userId AND BUDGET_MONTH = :currentMonth AND CATEGORY_ID IS NULL
		 `;
        const budgetResult = await connection.execute(budgetSql, { userId: USER_ID, currentMonth: currentMonth });
        const totalBudget = budgetResult.rows[0] ? budgetResult.rows[0].BUDGET_AMOUNT : 0;

        // 2. 최근 5개 거래 내역 조회
        const transactionsSql = `
			 SELECT * FROM (
				 SELECT 
                    T.TRANSACTION_ID, 
                    T.TYPE, 
                    T.CATEGORY_ID, 
                    T.DESCRIPTION, 
                    T.AMOUNT, 
                    TO_CHAR(T.TRANSACTION_DATE, 'YYYY-MM-DD') AS TRANSACTION_DATE
				 FROM TRANSACTIONS T 
				 WHERE T.USER_ID = :userId 
                 ORDER BY T.TRANSACTION_DATE DESC, T.TRANSACTION_ID DESC
			 ) WHERE ROWNUM <= 5
		 `;
        const transactionsResult = await connection.execute(transactionsSql, { userId: USER_ID });
        
        // ⭐ 클라이언트 (main.js)가 예상하는 소문자 키와 'INCOME'/'EXPENSE' 값으로 변환
        const recentTransactions = transactionsResult.rows.map(row => ({
            transaction_id: row.TRANSACTION_ID,
            type: row.TYPE === '수입' ? 'INCOME' : 'EXPENSE', // DB: '수입'/'지출' -> Client: 'INCOME'/'EXPENSE'
            category_id: row.CATEGORY_ID,
            description: row.DESCRIPTION,
            amount: row.AMOUNT,
            date: row.TRANSACTION_DATE // YYYY-MM-DD 형식의 문자열
        }));

        // 3. 나이대 지출 분석 데이터 조회
        const AGE_GROUP = '30대';
        const analysisSql = `
			 SELECT C.CATEGORY_NAME, S.TOTAL_SPENT, S.RANKING_ORDER
			 FROM AGE_CATEGORY_SUMMARY S JOIN CATEGORIES C ON S.CATEGORY_ID = C.CATEGORY_ID
			 WHERE S.AGE_GROUP = :ageGroup AND S.REPORT_MONTH = :currentMonth
			 ORDER BY S.RANKING_ORDER ASC
		 `;
        const analysisResult = await connection.execute(analysisSql, { ageGroup: AGE_GROUP, currentMonth: currentMonth });
        const categoryAnalysis = analysisResult.rows;

        res.status(200).json({
            success: true,
            totalBudget: totalBudget,
            recentTransactions: recentTransactions, 
            categoryAnalysis: categoryAnalysis,
            userAgeGroup: AGE_GROUP,
            reportMonth: currentMonth
        });

    } catch (err) {
        console.error("※Error loading dashboard data:", err);
        res.status(500).json({ error: "대시보드 데이터 로딩 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        if (connection) { try { await connection.close(); } catch (err) { console.error("※Error closing connection:", err); } }
    }
});


const port = 3000;

// 5. 서버 시작 전에 initialize()를 완료하고 성공했을 때만 listen()실행
async function startServer() {
    await initialize();
    app.listen(port, () => {
        console.log(`Server is listening on http://localhost:${port}`);
    });
}

startServer();