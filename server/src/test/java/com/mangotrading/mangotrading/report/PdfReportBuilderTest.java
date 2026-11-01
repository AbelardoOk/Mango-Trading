package com.mangotrading.mangotrading.report;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfReportBuilderTest {

    @Test
    void generatesPdfDocument() {
        byte[] content = PdfReportBuilder.build(
                "Histórico de transações",
                "Relatório de teste",
                List.of("Registros: 1"),
                List.of("ATIVO", "PREÇO"),
                List.of(List.of("AURA3", "M$ 12,50")));

        String header = new String(content, 0, 4, StandardCharsets.ISO_8859_1);
        assertTrue(header.startsWith("%PDF"));
        assertTrue(content.length > 500);
    }
}
