package com.mangotrading.mangotrading.report;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CsvReportWriterTest {

    @Test
    void writesUtf8BomAndSemicolonSeparator() {
        byte[] content = CsvReportWriter.write(
                List.of("ATIVO", "PREÇO"),
                List.of(List.of("AURA3", "M$ 12,50")));

        assertEquals((byte) 0xEF, content[0]);
        assertEquals((byte) 0xBB, content[1]);
        assertEquals((byte) 0xBF, content[2]);

        String csv = new String(content, 3, content.length - 3, StandardCharsets.UTF_8);
        assertTrue(csv.startsWith("ATIVO;PREÇO"));
        assertTrue(csv.contains("AURA3;M$ 12,50"));
    }

    @Test
    void escapesQuotesAndNeutralizesFormulaInjection() {
        byte[] content = CsvReportWriter.write(
                List.of("NOME"),
                List.of(List.of("=SUM(A1:A2)"), List.of("Nome; com aspas \"x\"")));

        String csv = new String(content, 3, content.length - 3, StandardCharsets.UTF_8);
        assertTrue(csv.contains("'=SUM(A1:A2)"));
        assertTrue(csv.contains("\"Nome; com aspas \"\"x\"\"\""));
    }
}
