package com.mangotrading.mangotrading.controller;

import com.mangotrading.mangotrading.report.ReportFile;
import com.mangotrading.mangotrading.security.UserDetailsImpl;
import com.mangotrading.mangotrading.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/trades")
    public ResponseEntity<byte[]> trades(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "csv") String format) {
        return download(reportService.tradesReport(currentUser.getId(), from, to, type, format));
    }

    @GetMapping("/portfolio")
    public ResponseEntity<byte[]> portfolio(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam(defaultValue = "csv") String format) {
        return download(reportService.portfolioReport(currentUser.getId(), format));
    }

    @GetMapping("/ranking")
    public ResponseEntity<byte[]> ranking(@RequestParam(defaultValue = "csv") String format) {
        return download(reportService.rankingReport(format));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/stocks")
    public ResponseEntity<byte[]> adminStocks(@RequestParam(defaultValue = "csv") String format) {
        return download(reportService.adminStocksReport(format));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/users")
    public ResponseEntity<byte[]> adminUsers(@RequestParam(defaultValue = "csv") String format) {
        return download(reportService.adminUsersReport(format));
    }

    private ResponseEntity<byte[]> download(ReportFile file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(file.contentType()));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(file.filename())
                .build());
        headers.setCacheControl("no-store");
        headers.setContentLength(file.content().length);
        return new ResponseEntity<>(file.content(), headers, HttpStatus.OK);
    }
}
