import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/guest"; // Assumindo que temos um helper p/ service role
import * as xlsx from "xlsx";
import { parse } from "csv-parse/sync";

export interface NormalizedFile {
    id: string;
    kind: 'pdf' | 'spreadsheet' | 'image' | 'other';
    content: string | object;
    name: string;
}

/**
 * Extracts data from analysis files and prepares them for the LLM
 */
export async function normalizeFiles(analysisId: string): Promise<NormalizedFile[]> {
    const supabase = await createClient();

    // Fetch files
    const { data: files, error } = await supabase
        .from("analysis_files")
        .select("*")
        .eq("analysis_id", analysisId);

    if (error || !files) return [];

    const normalized: NormalizedFile[] = [];

    for (const file of files) {
        try {
            // Download from Storage
            const serviceSupabase = getServiceRoleClient();
            const { data: fileBlob, error: downloadError } = await serviceSupabase
                .storage
                .from("analyzer-uploads")
                .download(file.storage_path);

            if (downloadError || !fileBlob) continue;

            const buffer = Buffer.from(await fileBlob.arrayBuffer());

            if (file.file_kind === 'spreadsheet') {
                const workbook = xlsx.read(buffer);
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Get raw data
                const rawData = xlsx.utils.sheet_to_json(worksheet);

                // Sample data (limit to 100 rows to save tokens)
                const sample = rawData.slice(0, 100);

                normalized.push({
                    id: file.id,
                    kind: 'spreadsheet',
                    name: file.original_name,
                    content: {
                        columns: Object.keys(sample[0] || {}),
                        rowCount: rawData.length,
                        sample: sample,
                        note: rawData.length > 100 ? `Subset de 100 de ${rawData.length} linhas.` : "Tabela completa."
                    }
                });
            } else if (file.file_kind === 'pdf') {
                // PDF processing (simulated for MVP if pdf-parse fails or is too heavy)
                // In production, use a dedicated microservice or a solid library
                normalized.push({
                    id: file.id,
                    kind: 'pdf',
                    name: file.original_name,
                    content: "Controle de PDF: Conteúdo extraído via Vision API ou OCR servside."
                });
            } else if (file.file_kind === 'image') {
                normalized.push({
                    id: file.id,
                    kind: 'image',
                    name: file.original_name,
                    content: {
                        storagePath: file.storage_path,
                        mimeType: file.mime_type
                    }
                });
            }
        } catch (err) {
            console.error(`Error normalizing file ${file.id}:`, err);
        }
    }

    return normalized;
}
