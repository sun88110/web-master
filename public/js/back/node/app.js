const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");
const path = require('path');

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

// 💡 유틸리티 함수: 현재 월 YYYYMM 형식 반환
function getCurrentMonthYYYYMM() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
}

// 💡 유틸리티 함수: DB 연결 닫기 (코드 간결화)
async function closeConnection(connection) {
    if (connection) {
        try {
            await connection.close();
        } catch (err) {
            console.error("※Error closing connection:", err);
            // 연결 닫기 오류는 서버 종료로 이어지지 않게 처리
        }
    }
}


// 3. Oracle DB 연결 풀 초기화 함수
async function initialize() {
    try {
        await oracledb.createPool(dbConfig);
        console.log("Oracle DB 연결 풀 생성 성공! 🐘");
    } catch (err) {
        console.log("Oracle DB 연결 실패:");
        console.error(err);
        process.exit(1); // 연결 실패 시 서버 종료
    }
}

const app = express();
app.use(cors());
app.use(express.json()); // 클라이언트에서 전송된 JSON 데이터를 처리하기 위해 필수
app.use(express.static(path.join(__dirname))); // 정적 파일 라우팅 추가 (html 등 파일을 위해)

// =======================================================
// 📌 1. 회원 인증/정보 라우트 (/users)
// =======================================================

// 1.1. 회원 로그인 인증 (POST /users/login)
app.post('/users/login', async (req, res) => {
    const { username, password } = req.body;
    let connection;

    try {
        if (!username || !password) {
            return res.status(400).json({ message: "아이디와 비밀번호를 모두 입력해야 합니다." });
        }
        
        connection = await oracledb.getConnection(dbConfig.poolAlias);

        const sql = `SELECT USER_ID, USERNAME, PASSWORD_HASH FROM USERS WHERE UPPER(USERNAME) = UPPER(:username)`;
        const result = await connection.execute(sql, { username: username });
        const user = result.rows[0];

        if (!user || (password !== user.PASSWORD_HASH)) {
            return res.status(401).json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
        }

        // 로그인 성공 
        res.status(200).json({
            success: true,
            message: "로그인 성공!",
            username: user.USERNAME,
            user_id: user.USER_ID
        });

    } catch (err) {
        console.error("※Error during login process:", err);
        res.status(500).json({ error: "로그인 처리 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        await closeConnection(connection);
    }
});

// 1.2. 회원가입 라우트 (POST /users/register)
app.post('/users/register', async (req, res) => {
    const { username, password, email, birthYear } = req.body;
    let connection;

    if (!username || !password || !email || !birthYear) {
        return res.status(400).json({ message: "필수 정보를 모두 입력해야 합니다." });
    }
    const passwordHash = password;

    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);

        const registerSql = "INSERT INTO USERS (USERNAME, PASSWORD_HASH, EMAIL, BIRTH_YEAR) VALUES (:username, :passwordHash, :email, :birthYear) RETURNING USER_ID INTO :out_id";

        const binds = {
            username: username,
            passwordHash: passwordHash,
            email: email,
            birthYear: parseInt(birthYear),
            out_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        };

        const result = await connection.execute(registerSql, binds, { autoCommit: true });
        const newUserId = result.outBinds.out_id[0];

        res.status(201).json({ success: true, message: "회원가입 성공! 이제 로그인할 수 있습니다.", user_id: newUserId });

    } catch (err) {
        console.error("※Error during registration process:", err);

        // ORA-00001: unique constraint violated (고유 제약조건 위반)
        if (err.errorNum === 1) {
            return res.status(409).json({ message: "이미 사용 중인 아이디 또는 이메일입니다." });
        }

        res.status(500).json({ error: "회원가입 처리 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        await closeConnection(connection);
    }
});

// 1.3. 회원 정보 조회 (GET /users/:id) - 마이페이지 데이터 로딩용
app.get('/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    let connection;

    if (isNaN(userId)) {
        return res.status(400).json({ message: "유효한 사용자 ID가 필요합니다." });
    }

    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);

        const sql = `SELECT USER_ID, USERNAME, EMAIL, BIRTH_YEAR FROM USERS WHERE USER_ID = :userId`;
        const result = await connection.execute(sql, { userId: userId });
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: "해당 사용자 정보를 찾을 수 없습니다." });
        }

        const userInfo = {
            user_id: user.USER_ID,
            username: user.USERNAME,
            email: user.EMAIL,
            birth_year: user.BIRTH_YEAR
        };

        res.status(200).json({ success: true, user: userInfo });

    } catch (err) {
        console.error("※Error loading user data for mypage:", err);
        res.status(500).json({ error: "사용자 정보 로딩 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        await closeConnection(connection);
    }
});


// =======================================================
// 📌 2. 가계부 API 라우트 (/api)
// =======================================================

// 2.1. 거래 등록 (POST /api/transactions)
app.post('/api/transactions', async (req, res) => {
    const { type, category_id, description, amount, date, user_id } = req.body;
    const USER_ID_TO_USE = parseInt(user_id);
    const DB_TYPE = type; // '수입' 또는 '지출'
    const parsed_category_id = parseInt(category_id);
    const parsed_amount = parseFloat(amount);
    let connection;

    try {
        if (!DB_TYPE || isNaN(USER_ID_TO_USE) || isNaN(parsed_category_id) || !description || isNaN(parsed_amount) || parsed_amount <= 0 || !date) {
            return res.status(400).json({ message: "모든 필수 거래 정보를 입력해야 하며, 금액/카테고리/사용자 정보가 유효해야 합니다." });
        }

        connection = await oracledb.getConnection(dbConfig.poolAlias);

        const sql = "INSERT INTO TRANSACTIONS (USER_ID, CATEGORY_ID, \"TRANSACTION_DATE\", AMOUNT, DESCRIPTION, \"TYPE\") VALUES (:user_id, :category_id, TO_DATE(:txn_date_val, 'YYYY-MM-DD'), :txn_amount, :description, :txn_type_val)";

        const binds = {
            user_id: USER_ID_TO_USE,
            category_id: parsed_category_id,
            txn_date_val: date, // 'YYYY-MM-DD' 문자열 그대로 전달
            txn_amount: parsed_amount,
            description: description,
            txn_type_val: DB_TYPE
        };

        const result = await connection.execute(sql, binds, { autoCommit: true });

        if (result.rowsAffected === 1) {
            res.status(201).json({ success: true, message: "거래가 성공적으로 등록되었습니다." });
        } else {
            res.status(400).json({ error: "거래 등록에 실패했습니다. (DB 오류: 0건 반영)" });
        }
    } catch (err) {
        console.error("※Error during transaction registration:", err);
        res.status(500).json({ error: "거래 등록 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        await closeConnection(connection);
    }
});

// 2.2. 거래 삭제 (DELETE /api/transactions/:id)
app.delete('/api/transactions/:id', async (req, res) => {
    const transactionId = req.params.id;
    const userIdToDelete = parseInt(req.body.user_id);
    let connection;

    if (isNaN(userIdToDelete)) {
        return res.status(400).json({ message: "유효한 사용자 ID가 필요합니다." });
    }

    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);

        const sql = "DELETE FROM TRANSACTIONS WHERE TRANSACTION_ID = :transactionId AND USER_ID = :userId";

        const binds = {
            transactionId: transactionId,
            userId: userIdToDelete
        };
        
        const result = await connection.execute(sql, binds, { autoCommit: true });

        if (result.rowsAffected === 1) {
            res.status(200).json({ success: true, message: `${transactionId}번 거래가 성공적으로 삭제되었습니다.` });
        } else {
            res.status(404).json({ message: "해당 거래 내역을 찾거나 삭제 권한이 없습니다." });
        }

    } catch (err) {
        console.error("※Error during transaction deletion:", err);
        res.status(500).json({ error: "거래 삭제 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        await closeConnection(connection);
    }
});


// 2.3. 예산 등록 (POST /api/budgets)
app.post('/api/budgets', async (req, res) => {
    const { month, category_id, amount, user_id } = req.body;
    const USER_ID_TO_USE = parseInt(user_id);
    const BUDGET_MONTH_DB = month;
    let connection;

    try {
        if (!month || !amount || isNaN(USER_ID_TO_USE)) {
            return res.status(400).json({ message: "예산 월, 금액, 사용자 ID를 모두 입력해야 합니다." });
        }

        connection = await oracledb.getConnection(dbConfig.poolAlias);

        const sql = "MERGE INTO BUDGETS B USING (SELECT :user_id AS USER_ID, :month AS BUDGET_MONTH, :category_id AS CATEGORY_ID FROM DUAL) D ON (B.USER_ID = D.USER_ID AND B.BUDGET_MONTH = D.BUDGET_MONTH AND (B.CATEGORY_ID = D.CATEGORY_ID OR (B.CATEGORY_ID IS NULL AND D.CATEGORY_ID IS NULL))) WHEN MATCHED THEN UPDATE SET B.BUDGET_AMOUNT = :amount WHEN NOT MATCHED THEN INSERT (USER_ID, BUDGET_MONTH, CATEGORY_ID, BUDGET_AMOUNT) VALUES (:user_id, :month, :category_id, :amount)";

        const binds = {
            user_id: USER_ID_TO_USE,
            month: BUDGET_MONTH_DB,
            category_id: category_id ? parseInt(category_id) : null,
            amount: amount
        };

        const result = await connection.execute(sql, binds, { autoCommit: true });

        if (result.rowsAffected >= 1) {
            res.status(201).json({ success: true, message: "예산이 성공적으로 등록 또는 업데이트되었습니다." });
        } else {
            res.status(400).json({ error: "예산 처리 중 DB 오류가 발생했습니다." });
        }
    } catch (err) {
        console.error("※Error during budget registration:", err);
        res.status(500).json({ error: "예산 처리 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        await closeConnection(connection);
    }
});

// 2.4. 카테고리 목록 조회 (GET /api/categories)
app.get('/api/categories', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);
        const sql = `SELECT CATEGORY_ID, CATEGORY_NAME, CATEGORY_TYPE FROM CATEGORIES ORDER BY CATEGORY_ID`;
        const result = await connection.execute(sql);
        
        const categories = result.rows.map(row => ({
            id: row.CATEGORY_ID,
            name: row.CATEGORY_NAME,
            type: row.CATEGORY_TYPE 
        }));

        res.status(200).json({ success: true, categories: categories });

    } catch (err) {
        console.error("※Error loading categories:", err);
        res.status(500).json({ error: "카테고리 정보 로딩 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        await closeConnection(connection);
    }
});


// -------------------------------------------------------
// 2.5. 초기 대시보드 데이터 로딩 (GET /api/data) 
// -------------------------------------------------------
app.get('/api/data', async (req, res) => {
    const USER_ID = parseInt(req.query.user_id);
    let connection;

    if (isNaN(USER_ID)) {
        return res.status(400).json({ error: "사용자 ID를 지정해야 합니다." });
    }

    try {
        connection = await oracledb.getConnection(dbConfig.poolAlias);
        const currentMonth = getCurrentMonthYYYYMM();

        // 1. 이번 달 총 예산 조회
        const budgetSql = "SELECT BUDGET_AMOUNT FROM BUDGETS WHERE USER_ID = :userId AND BUDGET_MONTH = :currentMonth AND CATEGORY_ID IS NULL";
        const budgetResult = await connection.execute(budgetSql, { userId: USER_ID, currentMonth: currentMonth });
        const totalBudgetSet = budgetResult.rows[0] ? budgetResult.rows[0].BUDGET_AMOUNT : 0; 

        // 2. 이번 달 지출/수입 합계 계산
        const balanceSql = "SELECT SUM(CASE WHEN TYPE = '지출' THEN AMOUNT ELSE 0 END) AS TOTAL_EXPENSE, SUM(CASE WHEN TYPE = '수입' THEN AMOUNT ELSE 0 END) AS TOTAL_INCOME FROM TRANSACTIONS WHERE USER_ID = :userId AND TO_CHAR(\"TRANSACTION_DATE\", 'YYYYMM') = :currentMonth";
        const balanceResult = await connection.execute(balanceSql, { userId: USER_ID, currentMonth: currentMonth });
        const balanceRow = balanceResult.rows[0] || {};

        const totalExpense = balanceRow.TOTAL_EXPENSE || 0;
        const totalIncome = balanceRow.TOTAL_INCOME || 0;
        const totalBalance = totalBudgetSet - totalExpense + totalIncome;

        // 3. 최근 5개 거래 내역 조회
        const transactionsSql = "SELECT * FROM (SELECT T.TRANSACTION_ID, T.TYPE, T.CATEGORY_ID, T.DESCRIPTION, T.AMOUNT, TO_CHAR(T.\"TRANSACTION_DATE\", 'YYYY-MM-DD') AS TRANSACTION_DATE FROM TRANSACTIONS T WHERE T.USER_ID = :userId ORDER BY T.\"TRANSACTION_DATE\" DESC, T.TRANSACTION_ID DESC) WHERE ROWNUM <= 5";
        const transactionsResult = await connection.execute(transactionsSql, { userId: USER_ID });

        const recentTransactions = transactionsResult.rows.map(row => ({
            transaction_id: row.TRANSACTION_ID,
            type: row.TYPE,
            category_id: row.CATEGORY_ID,
            description: row.DESCRIPTION,
            amount: row.AMOUNT,
            date: row.TRANSACTION_DATE
        }));

        // 4. 나이대 지출 분석 데이터 조회 (예시)
        const AGE_GROUP = '30대';
        const analysisSql = "SELECT C.CATEGORY_NAME, S.TOTAL_SPENT, S.RANKING_ORDER FROM AGE_CATEGORY_SUMMARY S JOIN CATEGORIES C ON S.CATEGORY_ID = C.CATEGORY_ID WHERE S.AGE_GROUP = :ageGroup AND S.REPORT_MONTH = :currentMonth ORDER BY S.RANKING_ORDER ASC";

        const analysisResult = await connection.execute(analysisSql, { ageGroup: AGE_GROUP, currentMonth: currentMonth });
        const categoryAnalysis = analysisResult.rows;

        res.status(200).json({
            success: true,
            totalBudget: totalBalance,
            recentTransactions: recentTransactions,
            categoryAnalysis: categoryAnalysis,
            userAgeGroup: AGE_GROUP,
            reportMonth: currentMonth
        });

    } catch (err) {
        console.error("※Error loading dashboard data:", err);
        res.status(500).json({ error: "대시보드 데이터 로딩 중 서버 오류가 발생했습니다.", detail: err.message });
    } finally {
        await closeConnection(connection);
    }
});


const port = 3000;

// 5. 서버 시작
async function startServer() {
    await initialize();
    app.listen(port, () => {
        console.log(`Server is listening on http://localhost:${port}`);
    });
}

startServer();