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

  // Vercel menyimpan private key dengan literal \n — kita konversi ke newline asli
  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

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
