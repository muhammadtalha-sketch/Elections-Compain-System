import { ImportUploader } from "@/components/import/import-uploader";

// FUTURE BACKEND INTEGRATION
// TODO: Excel Import Processing — POST /api/import/members
// TODO: Parse XLSX/CSV on server with SheetJS or csv-parser
// TODO: JWT Authorization required
// TODO: Return import report: inserted / skipped / errors

export default function ImportPage() {
  return <ImportUploader />;
}
