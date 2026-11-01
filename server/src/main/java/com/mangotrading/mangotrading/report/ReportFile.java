package com.mangotrading.mangotrading.report;

public record ReportFile(byte[] content, String filename, String contentType) {
}
