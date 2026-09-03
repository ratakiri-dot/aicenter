import { google } from "googleapis";

// ─────────────────────────────────────────────────────────────────────────────
// Auth & Sheet Config
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inisialisasi Google Sheets API client menggunakan Service Account.
 * Private key di Vercel/env disimpan dengan literal \n, kita replace ke newline asli.
 */
function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !rawPrivateKey || !sheetId) {
    throw new Error(
      "Google Sheets env vars tidak lengkap: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, dan GOOGLE_SHEET_ID harus di-set."
    );
  }

  let privateKey = rawPrivateKey.trim();
  // Strip surrounding quotes if the user pasted quotes into Vercel UI
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
  // Convert literal \n strings to real line breaks
  privateKey = privateKey.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, sheetId };
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatHistoryEntry {
  timestamp: string;
  userId: string;
  message: string;
  response: string;
}

export interface AppendChatParams {
  userId: string;
  message: string;
  response: string;
}

export interface AppendAnalysisParams {
  userId?: string;
  query: string;
  mode?: string;
  status: string;
  analysis: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// appendChatHistory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Menambahkan satu baris baru ke Google Sheet dengan kolom:
 * [timestamp, userId, message, response]
 *
 * Sheet harus memiliki tab bernama "ChatHistory" dengan header di baris pertama:
 * | Timestamp | User ID | Message | Response |
 *
 * @throws Error jika autentikasi atau API call gagal
 */
export async function appendChatHistory({
  userId,
  message,
  response,
}: AppendChatParams): Promise<void> {
  const { sheets, sheetId } = getSheetsClient();

  const timestamp = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "ChatHistory!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[timestamp, userId, message, response]],
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// appendAnalysisHistory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Menambahkan satu baris baru analisis bahan kritis / pencarian ID halal ke Google Sheet:
 * Tab: "BahanKritis!A:F"
 * Kolom: | Timestamp | User ID | Mode | Nama Bahan / Query | Status | Hasil Analisis |
 *
 * Jika tab "BahanKritis" belum dibuat, sistem otomatis menulis ke tab "ChatHistory" sebagai fallback.
 */
export async function appendAnalysisHistory({
  userId = "anonymous",
  query,
  mode = "analyze",
  status,
  analysis,
}: AppendAnalysisParams): Promise<void> {
  const { sheets, sheetId } = getSheetsClient();
  const timestamp = new Date().toISOString();

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "BahanKritis!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[timestamp, userId, mode, query, status, analysis]],
      },
    });
  } catch (err: any) {
    console.warn(
      "[GoogleSheets] Gagal menulis ke tab 'BahanKritis', beralih ke tab 'ChatHistory':",
      err?.message || err
    );
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "ChatHistory!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            timestamp,
            userId,
            `[Analisis Bahan (${mode})] ${query}`,
            `[Status: ${status}] ${analysis}`,
          ],
        ],
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getChatHistory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mengambil semua riwayat chat untuk userId tertentu dari Google Sheet.
 * Baris pertama (header) akan dilewati secara otomatis.
 *
 * @param userId - ID user yang ingin diambil riwayat chatnya
 * @returns Array of ChatHistoryEntry, diurutkan dari yang terlama (sesuai urutan di sheet)
 */
export async function getChatHistory(userId: string): Promise<ChatHistoryEntry[]> {
  const { sheets, sheetId } = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "ChatHistory!A:D",
  });

  const rows = res.data.values;

  if (!rows || rows.length <= 1) {
    // Tidak ada data (atau hanya header)
    return [];
  }

  // Skip baris pertama (header), lalu filter berdasarkan userId (kolom B = index 1)
  const history: ChatHistoryEntry[] = rows
    .slice(1)
    .filter((row) => row[1] === userId)
    .map((row) => ({
      timestamp: row[0] ?? "",
      userId: row[1] ?? "",
      message: row[2] ?? "",
      response: row[3] ?? "",
    }));

  return history;
}
