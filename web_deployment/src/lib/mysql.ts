import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'bqcqdhri_trade_journal',
  password: process.env.DB_PASSWORD || 'p5zrRTeYVmW8PLtyNd6K',
  database: process.env.DB_NAME || 'bqcqdhri_trade_journal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

export async function query(sql: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getConnection() {
  return await pool.getConnection()
}

// Helper functions for common operations
export async function getUserById(userId: string) {
  const [rows] = await pool.execute(
    'SELECT * FROM profiles WHERE id = ?',
    [userId]
  )
  return rows[0]
}

export async function createTrade(tradeData: any) {
  const {
    user_id,
    account_id,
    pair,
    entry_date,
    entry_time,
    session,
    direction,
    result_rr,
    risk_percent,
    risk_amount,
    pnl,
    balance_after,
    psychology_state,
    confidence_score,
    template_type,
    strategy_data
  } = tradeData

  const [result] = await pool.execute(
    `INSERT INTO trades
     (user_id, account_id, pair, entry_date, entry_time, session, direction,
      result_rr, risk_percent, risk_amount, pnl, balance_after,
      psychology_state, confidence_score, template_type, strategy_data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [user_id, account_id, pair, entry_date, entry_time, session, direction,
     result_rr, risk_percent, risk_amount, pnl, balance_after,
     psychology_state, confidence_score, template_type, JSON.stringify(strategy_data)]
  )

  return result
}

export async function getTradesByUser(userId: string) {
  const [rows] = await pool.execute(
    'SELECT * FROM trades WHERE user_id = ? ORDER BY entry_date DESC, entry_time DESC',
    [userId]
  )
  return rows
}