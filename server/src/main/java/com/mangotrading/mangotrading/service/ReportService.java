package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.response.PortfolioItemResponse;
import com.mangotrading.mangotrading.dto.response.PortfolioResponse;
import com.mangotrading.mangotrading.dto.response.RankingResponse;
import com.mangotrading.mangotrading.dto.response.StockResponse;
import com.mangotrading.mangotrading.dto.response.UserResponse;
import com.mangotrading.mangotrading.entity.Transaction;
import com.mangotrading.mangotrading.entity.enums.TransactionType;
import com.mangotrading.mangotrading.exception.BadRequestException;
import com.mangotrading.mangotrading.report.CsvReportWriter;
import com.mangotrading.mangotrading.report.PdfReportBuilder;
import com.mangotrading.mangotrading.report.ReportFile;
import com.mangotrading.mangotrading.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Locale PT_BR = new Locale("pt", "BR");

    private final TransactionRepository transactionRepository;
    private final PortfolioService portfolioService;
    private final RankingService rankingService;
    private final StockService stockService;
    private final UserService userService;

    @Transactional(readOnly = true)
    public ReportFile tradesReport(Long userId, LocalDate from, LocalDate to, String type, String format) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(t -> from == null || !t.getCreatedAt().toLocalDate().isBefore(from))
                .filter(t -> to == null || !t.getCreatedAt().toLocalDate().isAfter(to))
                .filter(t -> type == null || type.isBlank()
                        || t.getType().name().equalsIgnoreCase(type))
                .toList();

        List<String> headers = List.of("DATA E HORA", "OPERAÇÃO", "ATIVO", "EMPRESA",
                "QTD.", "PREÇO", "TOTAL");
        List<List<String>> rows = new ArrayList<>();
        BigDecimal totalBuy = BigDecimal.ZERO;
        BigDecimal totalSell = BigDecimal.ZERO;
        for (Transaction t : transactions) {
            BigDecimal total = t.getPrice().multiply(BigDecimal.valueOf(t.getQuantity()));
            if (t.getType() == TransactionType.BUY) {
                totalBuy = totalBuy.add(total);
            } else {
                totalSell = totalSell.add(total);
            }
            rows.add(List.of(
                    DATE_TIME.format(t.getCreatedAt()),
                    t.getType() == TransactionType.BUY ? "Compra" : "Venda",
                    t.getStock().getSymbol(),
                    t.getStock().getName(),
                    String.valueOf(t.getQuantity()),
                    money(t.getPrice()),
                    money(total)));
        }

        List<String> summary = List.of(
                "Período: " + period(from, to),
                "Tipo: " + typeLabel(type),
                "Registros: " + transactions.size(),
                "Total comprado: " + money(totalBuy),
                "Total vendido: " + money(totalSell));

        return build("Histórico de transações", summary, headers, rows, format, "historico");
    }

    @Transactional(readOnly = true)
    public ReportFile portfolioReport(Long userId, String format) {
        PortfolioResponse portfolio = portfolioService.getPortfolioByUserId(userId);
        List<String> headers = List.of("ATIVO", "EMPRESA", "SETOR", "QTD.",
                "PREÇO MÉDIO", "ATUAL", "VALOR ATUAL", "RESULTADO", "RESULTADO %");
        List<List<String>> rows = new ArrayList<>();
        for (PortfolioItemResponse item : portfolio.getItems()) {
            rows.add(List.of(
                    item.getStockSymbol(),
                    item.getStockName(),
                    nullSafe(item.getSector()),
                    String.valueOf(item.getQuantity()),
                    money(item.getAveragePrice()),
                    money(item.getCurrentPrice()),
                    money(item.getCurrentValue()),
                    money(item.getProfitLoss()),
                    percent(item.getProfitLossPercent())));
        }

        List<String> summary = List.of(
                "Saldo disponível: " + money(portfolio.getBalance()),
                "Valor em ações: " + money(portfolio.getTotalCurrentValue()),
                "Patrimônio total: " + money(portfolio.getTotalPatrimony()),
                "Resultado total: " + money(portfolio.getTotalProfitLoss()),
                "Gerado em: " + DATE_TIME.format(LocalDateTime.now()));

        return build("Relatório da carteira", summary, headers, rows, format, "carteira");
    }

    @Transactional(readOnly = true)
    public ReportFile rankingReport(String format) {
        List<RankingResponse> ranking = rankingService.getRanking();
        List<String> headers = List.of("POSIÇÃO", "JOGADOR", "SALDO",
                "VALOR EM AÇÕES", "PATRIMÔNIO");
        List<List<String>> rows = new ArrayList<>();
        for (RankingResponse row : ranking) {
            rows.add(List.of(
                    String.valueOf(row.getPosition()),
                    row.getUserName(),
                    money(row.getBalance()),
                    money(row.getStockValue()),
                    money(row.getTotalPatrimony())));
        }

        List<String> summary = List.of(
                "Jogadores: " + ranking.size(),
                "Gerado em: " + DATE_TIME.format(LocalDateTime.now()));

        return build("Ranking de jogadores", summary, headers, rows, format, "ranking");
    }

    @Transactional(readOnly = true)
    public ReportFile adminStocksReport(String format) {
        List<StockResponse> stocks = stockService.findAll();
        long active = stocks.stream().filter(s -> Boolean.TRUE.equals(s.getActive())).count();
        List<String> headers = List.of("EMPRESA", "SÍMBOLO", "SETOR", "PREÇO",
                "VOLATILIDADE", "STATUS");
        List<List<String>> rows = new ArrayList<>();
        for (StockResponse stock : stocks) {
            rows.add(List.of(
                    stock.getName(),
                    stock.getSymbol(),
                    nullSafe(stock.getSector()),
                    money(stock.getCurrentPrice()),
                    stock.getVolatility() != null ? stock.getVolatility().toPlainString() : "0",
                    Boolean.TRUE.equals(stock.getActive()) ? "Ativa" : "Desativada"));
        }

        List<String> summary = List.of(
                "Total de ações: " + stocks.size(),
                "Ativas: " + active,
                "Desativadas: " + (stocks.size() - active),
                "Gerado em: " + DATE_TIME.format(LocalDateTime.now()));

        return build("Catálogo de ações", summary, headers, rows, format, "acoes");
    }

    @Transactional(readOnly = true)
    public ReportFile adminUsersReport(String format) {
        List<UserResponse> users = userService.findAll();
        long admins = users.stream().filter(u -> "ADMIN".equals(u.getRole())).count();
        List<String> headers = List.of("NOME", "E-MAIL", "PERFIL", "SALDO", "CADASTRO");
        List<List<String>> rows = new ArrayList<>();
        for (UserResponse user : users) {
            rows.add(List.of(
                    user.getName(),
                    user.getEmail(),
                    "ADMIN".equals(user.getRole()) ? "Administrador" : "Usuário comum",
                    money(user.getBalance()),
                    user.getCreatedAt() != null ? DATE.format(user.getCreatedAt()) : ""));
        }

        List<String> summary = List.of(
                "Total de usuários: " + users.size(),
                "Administradores: " + admins,
                "Usuários comuns: " + (users.size() - admins),
                "Gerado em: " + DATE_TIME.format(LocalDateTime.now()));

        return build("Usuários cadastrados", summary, headers, rows, format, "usuarios");
    }

    private ReportFile build(
            String title,
            List<String> summary,
            List<String> headers,
            List<List<String>> rows,
            String format,
            String baseName) {

        String normalized = format == null ? "csv" : format.trim().toLowerCase();
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        if ("csv".equals(normalized)) {
            return new ReportFile(
                    CsvReportWriter.write(headers, rows),
                    "mango-" + baseName + "-" + date + ".csv",
                    "text/csv;charset=UTF-8");
        }
        if ("pdf".equals(normalized)) {
            return new ReportFile(
                    PdfReportBuilder.build(title, "Relatório gerado pelo Mango Trading", summary, headers, rows),
                    "mango-" + baseName + "-" + date + ".pdf",
                    "application/pdf");
        }
        throw new BadRequestException("Formato inválido: " + format + ". Use csv ou pdf");
    }

    private String period(LocalDate from, LocalDate to) {
        if (from == null && to == null) return "todas as transações";
        if (from != null && to != null) return DATE.format(from) + " a " + DATE.format(to);
        if (from != null) return "a partir de " + DATE.format(from);
        return "até " + DATE.format(to);
    }

    private String typeLabel(String type) {
        if (type == null || type.isBlank()) return "Todas";
        if ("BUY".equalsIgnoreCase(type)) return "Compra";
        if ("SELL".equalsIgnoreCase(type)) return "Venda";
        throw new BadRequestException("Tipo inválido: " + type + ". Use BUY ou SELL");
    }

    private String money(BigDecimal value) {
        return "M$ " + numberFormat().format(value != null ? value : BigDecimal.ZERO);
    }

    private String percent(BigDecimal value) {
        return numberFormat().format(value != null ? value : BigDecimal.ZERO) + "%";
    }

    private DecimalFormat numberFormat() {
        DecimalFormat format = new DecimalFormat("#,##0.00", new DecimalFormatSymbols(PT_BR));
        format.setRoundingMode(java.math.RoundingMode.HALF_UP);
        return format;
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
