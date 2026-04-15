import ExcelJS from 'exceljs';
import type {
  RfpOutput,
  ChecklistItem,
  VendorAssessment,
  TargetedVendor,
  DiscardedVendor,
} from '../types';

// ── Public API ────────────────────────────────────────────────────────────

export async function downloadExcelReport(output: RfpOutput): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Contoso RFP Generator';
  workbook.created = new Date();

  addChecklistSheet(workbook, 'Prerequisites Checklist', output.prerequisitesChecklist ?? [], '#1F4E79');
  addChecklistSheet(workbook, 'Technical Checklist', output.technicalChecklist ?? [], '#14375A');
  addChecklistSheet(workbook, 'Functional Checklist', output.functionalChecklist ?? [], '#1F497D');
  addVendorSheet(workbook, 'Vendor Assessment', output.vendorAssessment ?? []);
  addRetainedSheet(workbook, output.retainedVendors ?? []);
  addDiscardedSheet(workbook, output.discardedVendors ?? []);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const safeName = output.rfpTopic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  triggerDownload(blob, `rfp_${safeName}.xlsx`);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function addChecklistSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  items: ChecklistItem[],
  headerColor: string,
): void {
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = [
    { header: 'Category', key: 'category', width: 28 },
    { header: 'Checklist Item', key: 'item', width: 70 },
    { header: 'Priority', key: 'priority', width: 18 },
    { header: 'Completed', key: 'completed', width: 14 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + headerColor.replace('#', '') } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } } };
  });
  headerRow.height = 22;

  items.forEach((item, index) => {
    const row = sheet.addRow({
      category: item.category ?? '',
      item: item.item ?? '',
      priority: item.priority ?? '',
      completed: item.completed ? '✓' : '☐',
    });
    row.height = 18;

    const isEven = index % 2 === 0;
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isEven ? 'FFF0F4F8' : 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFD0D8E0' } } };
    });

    const priorityCell = row.getCell('priority');
    if (item.priority === 'Must-have' || item.priority === 'Mandatory') {
      priorityCell.font = { color: { argb: 'FFC00000' }, bold: true };
    } else if (item.priority === 'Nice-to-have') {
      priorityCell.font = { color: { argb: 'FF7F7F7F' } };
    }

    row.getCell('completed').alignment = { horizontal: 'center', vertical: 'middle' };
  });

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: 'D1' };
}

function addVendorSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  vendors: VendorAssessment[],
): void {
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = [
    { header: 'Vendor ID', key: 'vendorId', width: 14 },
    { header: 'Vendor Name', key: 'name', width: 30 },
    { header: 'Country', key: 'country', width: 14 },
    { header: 'Category', key: 'category', width: 22 },
    { header: 'Risk Score', key: 'riskScore', width: 13 },
    { header: 'Risk Level', key: 'riskLevel', width: 13 },
    { header: 'Eligible', key: 'eligible', width: 11 },
    { header: 'Category Match', key: 'categoryMatch', width: 16 },
    { header: 'Justification', key: 'justification', width: 50 },
  ];

  styleHeaderRow(sheet, 'FF2E4057');

  vendors.forEach((vendor, index) => {
    const isEven = index % 2 === 0;
    const row = sheet.addRow(vendor);
    row.height = 18;
    styleDataRow(row, isEven ? 'FFF0F7EE' : 'FFFFFFFF');
    styleRiskCell(row, vendor.riskLevel);

    const eligibleCell = row.getCell('eligible');
    eligibleCell.value = vendor.eligible ? '✓ Yes' : '✗ No';
    eligibleCell.font = { color: { argb: vendor.eligible ? 'FF375623' : 'FFC00000' }, bold: true };
    eligibleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const matchCell = row.getCell('categoryMatch');
    matchCell.value = vendor.categoryMatch ? '✓ Yes' : '✗ No';
    matchCell.font = { color: { argb: vendor.categoryMatch ? 'FF375623' : 'FFC00000' } };
    matchCell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  freezeAndFilter(sheet);
}

function addRetainedSheet(
  workbook: ExcelJS.Workbook,
  vendors: TargetedVendor[],
): void {
  const sheet = workbook.addWorksheet('Retained Vendors');

  sheet.columns = [
    { header: 'Vendor ID', key: 'vendorId', width: 14 },
    { header: 'Vendor Name', key: 'name', width: 30 },
    { header: 'Country', key: 'country', width: 14 },
    { header: 'Risk Score', key: 'riskScore', width: 13 },
    { header: 'Risk Level', key: 'riskLevel', width: 13 },
    { header: 'Justification', key: 'justification', width: 55 },
  ];

  styleHeaderRow(sheet, 'FF375623');

  vendors.forEach((vendor, index) => {
    const row = sheet.addRow(vendor);
    row.height = 18;
    styleDataRow(row, index % 2 === 0 ? 'FFF0F7EE' : 'FFFFFFFF');
    styleRiskCell(row, vendor.riskLevel);
  });

  freezeAndFilter(sheet);
}

function addDiscardedSheet(
  workbook: ExcelJS.Workbook,
  vendors: DiscardedVendor[],
): void {
  const sheet = workbook.addWorksheet('Discarded Vendors');

  sheet.columns = [
    { header: 'Vendor ID', key: 'vendorId', width: 14 },
    { header: 'Vendor Name', key: 'name', width: 30 },
    { header: 'Country', key: 'country', width: 14 },
    { header: 'Risk Score', key: 'riskScore', width: 13 },
    { header: 'Risk Level', key: 'riskLevel', width: 13 },
    { header: 'Reason for Disqualification', key: 'reason', width: 55 },
  ];

  styleHeaderRow(sheet, 'FF8B0000');

  vendors.forEach((vendor, index) => {
    const row = sheet.addRow(vendor);
    row.height = 18;
    styleDataRow(row, index % 2 === 0 ? 'FFFFF0F0' : 'FFFFFFFF');
    styleRiskCell(row, vendor.riskLevel);
  });

  freezeAndFilter(sheet);
}

// ── Shared styling helpers ────────────────────────────────────────────────

function styleHeaderRow(sheet: ExcelJS.Worksheet, argbColor: string): void {
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argbColor } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } } };
  });
  headerRow.height = 22;
}

function styleDataRow(row: ExcelJS.Row, bgArgb: string): void {
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFD0D8E0' } } };
  });
}

function styleRiskCell(row: ExcelJS.Row, riskLevel: string): void {
  const riskCell = row.getCell('riskLevel');
  if (riskLevel === 'High') {
    riskCell.font = { color: { argb: 'FFC00000' }, bold: true };
  } else if (riskLevel === 'Medium') {
    riskCell.font = { color: { argb: 'FF9C5700' }, bold: true };
  } else if (riskLevel === 'Low') {
    riskCell.font = { color: { argb: 'FF375623' }, bold: true };
  }
}

function freezeAndFilter(sheet: ExcelJS.Worksheet): void {
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  if (sheet.columns.length > 0) {
    sheet.autoFilter = { from: 'A1', to: { row: 1, column: sheet.columns.length } };
  }
}
