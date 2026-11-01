package com.mangotrading.mangotrading.report;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.util.List;

public final class PdfReportBuilder {

    private static final Color INK = new Color(23, 46, 39);
    private static final Color GREEN = new Color(23, 79, 61);
    private static final Color SOFT = new Color(232, 241, 235);
    private static final Color MUTED = new Color(74, 90, 82);

    private PdfReportBuilder() {
    }

    public static byte[] build(
            String title,
            String subtitle,
            List<String> summary,
            List<String> headers,
            List<List<String>> rows) {

        Document document = new Document(PageSize.A4, 36, 36, 42, 48);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try {
            PdfWriter writer = PdfWriter.getInstance(document, output);
            writer.setPageEvent(new Footer());
            document.open();

            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, GREEN);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, INK);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, MUTED);
            Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA, 9, MUTED);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, INK);

            document.add(new Paragraph("MANGO TRADING", brandFont));
            document.add(new Paragraph(title, titleFont));
            if (subtitle != null && !subtitle.isBlank()) {
                document.add(new Paragraph(subtitle, subtitleFont));
            }
            for (String line : summary) {
                document.add(new Paragraph(line, summaryFont));
            }

            if (rows.isEmpty()) {
                document.add(new Paragraph("Nenhum registro encontrado para os filtros informados.",
                        FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, MUTED)));
            } else {
                PdfPTable table = new PdfPTable(headers.size());
                table.setWidthPercentage(100);
                table.setSpacingBefore(14);
                table.setHeaderRows(1);

                for (String header : headers) {
                    PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                    cell.setBackgroundColor(GREEN);
                    cell.setPadding(6);
                    cell.setBorderWidth(0);
                    table.addCell(cell);
                }

                boolean alternate = false;
                for (List<String> row : rows) {
                    for (String value : row) {
                        PdfPCell cell = new PdfPCell(new Phrase(value == null ? "" : value, cellFont));
                        cell.setPadding(5);
                        cell.setBorderWidth(0.5f);
                        cell.setBorderColor(new Color(212, 223, 215));
                        if (alternate) {
                            cell.setBackgroundColor(SOFT);
                        }
                        table.addCell(cell);
                    }
                    alternate = !alternate;
                }
                document.add(table);
            }

            document.close();
            return output.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao gerar PDF: " + e.getMessage(), e);
        }
    }

    private static class Footer extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, MUTED);
            Phrase phrase = new Phrase("Mango Trading · mercado fictício · página "
                    + writer.getPageNumber(), footerFont);
            ColumnText.showTextAligned(
                    writer.getDirectContent(),
                    Element.ALIGN_CENTER,
                    phrase,
                    (document.left() + document.right()) / 2,
                    document.bottom() - 20,
                    0);
        }
    }
}
