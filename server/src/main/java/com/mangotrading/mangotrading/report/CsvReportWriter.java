package com.mangotrading.mangotrading.report;

import java.nio.charset.StandardCharsets;
import java.util.List;

public final class CsvReportWriter {

    private static final byte[] UTF8_BOM = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};

    private CsvReportWriter() {
    }

    public static byte[] write(List<String> headers, List<List<String>> rows) {
        StringBuilder csv = new StringBuilder();
        appendRow(csv, headers);
        for (List<String> row : rows) {
            appendRow(csv, row);
        }

        byte[] content = csv.toString().getBytes(StandardCharsets.UTF_8);
        byte[] result = new byte[UTF8_BOM.length + content.length];
        System.arraycopy(UTF8_BOM, 0, result, 0, UTF8_BOM.length);
        System.arraycopy(content, 0, result, UTF8_BOM.length, content.length);
        return result;
    }

    private static void appendRow(StringBuilder csv, List<String> values) {
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) csv.append(';');
            csv.append(escape(values.get(i)));
        }
        csv.append("\r\n");
    }

    private static String escape(String value) {
        String text = value == null ? "" : value;
        if (!text.isEmpty() && "=+-@\t\r".indexOf(text.charAt(0)) >= 0) {
            text = "'" + text;
        }
        if (text.contains(";") || text.contains("\"") || text.contains("\n") || text.contains("\r")) {
            text = "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }
}
