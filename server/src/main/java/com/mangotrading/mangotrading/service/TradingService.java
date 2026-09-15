package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.response.TransactionResponse;
import com.mangotrading.mangotrading.entity.Portfolio;
import com.mangotrading.mangotrading.entity.PortfolioItem;
import com.mangotrading.mangotrading.entity.Stock;
import com.mangotrading.mangotrading.entity.Transaction;
import com.mangotrading.mangotrading.entity.User;
import com.mangotrading.mangotrading.entity.enums.TransactionType;
import com.mangotrading.mangotrading.exception.BadRequestException;
import com.mangotrading.mangotrading.exception.InsufficientBalanceException;
import com.mangotrading.mangotrading.exception.InsufficientQuantityException;
import com.mangotrading.mangotrading.exception.ResourceNotFoundException;
import com.mangotrading.mangotrading.repository.PortfolioItemRepository;
import com.mangotrading.mangotrading.repository.PortfolioRepository;
import com.mangotrading.mangotrading.repository.StockRepository;
import com.mangotrading.mangotrading.repository.TransactionRepository;
import com.mangotrading.mangotrading.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TradingService {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final PortfolioRepository portfolioRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public TransactionResponse buy(Long userId, Long stockId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Quantidade deve ser maior que zero");
        }

        User user = getUserOrThrow(userId);
        Stock stock = getStockOrThrow(stockId);

        if (!stock.getActive()) {
            throw new BadRequestException("Ação inativa: " + stock.getSymbol());
        }

        BigDecimal price = stock.getCurrentPrice();
        BigDecimal totalCost = price.multiply(BigDecimal.valueOf(quantity));

        if (user.getBalance().compareTo(totalCost) < 0) {
            throw new InsufficientBalanceException(
                    String.format("Saldo insuficiente. Necessário: %s, Disponível: %s", totalCost, user.getBalance()));
        }

        Portfolio portfolio = getOrCreatePortfolio(user);

        // Atualizar saldo
        user.setBalance(user.getBalance().subtract(totalCost));
        userRepository.save(user);

        // Atualizar PortfolioItem com preço médio ponderado
        Optional<PortfolioItem> existingOpt = portfolioItemRepository.findByPortfolioIdAndStockId(portfolio.getId(), stockId);
        PortfolioItem item;
        if (existingOpt.isPresent()) {
            item = existingOpt.get();
            int oldQty = item.getQuantity();
            BigDecimal oldAvg = item.getAveragePrice();
            int newQty = oldQty + quantity;
            // (oldQty*oldAvg + quantity*price) / newQty
            BigDecimal newAvg = oldAvg.multiply(BigDecimal.valueOf(oldQty))
                    .add(price.multiply(BigDecimal.valueOf(quantity)))
                    .divide(BigDecimal.valueOf(newQty), 4, RoundingMode.HALF_UP);
            item.setQuantity(newQty);
            item.setAveragePrice(newAvg);
        } else {
            item = PortfolioItem.builder()
                    .portfolio(portfolio)
                    .stock(stock)
                    .quantity(quantity)
                    .averagePrice(price)
                    .build();
        }
        portfolioItemRepository.save(item);

        // Criar transação
        Transaction tx = Transaction.builder()
                .user(user)
                .stock(stock)
                .type(TransactionType.BUY)
                .quantity(quantity)
                .price(price)
                .build();
        tx = transactionRepository.save(tx);

        return toResponse(tx);
    }

    @Transactional
    public TransactionResponse sell(Long userId, Long stockId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("Quantidade deve ser maior que zero");
        }

        User user = getUserOrThrow(userId);
        Stock stock = getStockOrThrow(stockId);
        Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada"));

        PortfolioItem item = portfolioItemRepository.findByPortfolioIdAndStockId(portfolio.getId(), stockId)
                .orElseThrow(() -> new InsufficientQuantityException("Você não possui esta ação"));

        if (item.getQuantity() < quantity) {
            throw new InsufficientQuantityException(
                    String.format("Quantidade insuficiente. Possui: %d, Tentou vender: %d", item.getQuantity(), quantity));
        }

        BigDecimal price = stock.getCurrentPrice();
        BigDecimal totalValue = price.multiply(BigDecimal.valueOf(quantity));

        // Creditar saldo
        user.setBalance(user.getBalance().add(totalValue));
        userRepository.save(user);

        // Atualizar item
        int remaining = item.getQuantity() - quantity;
        if (remaining == 0) {
            portfolioItemRepository.delete(item);
        } else {
            item.setQuantity(remaining);
            portfolioItemRepository.save(item);
        }

        Transaction tx = Transaction.builder()
                .user(user)
                .stock(stock)
                .type(TransactionType.SELL)
                .quantity(quantity)
                .price(price)
                .build();
        tx = transactionRepository.save(tx);

        return toResponse(tx);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getHistory(Long userId) {
        getUserOrThrow(userId);
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + userId));
    }

    private Stock getStockOrThrow(Long stockId) {
        return stockRepository.findById(stockId)
                .orElseThrow(() -> new ResourceNotFoundException("Ação não encontrada: " + stockId));
    }

    private Portfolio getOrCreatePortfolio(User user) {
        return portfolioRepository.findByUserId(user.getId())
                .orElseGet(() -> portfolioRepository.save(Portfolio.builder().user(user).build()));
    }

    private TransactionResponse toResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .userId(tx.getUser().getId())
                .stockId(tx.getStock().getId())
                .stockSymbol(tx.getStock().getSymbol())
                .stockName(tx.getStock().getName())
                .type(tx.getType().name())
                .quantity(tx.getQuantity())
                .price(tx.getPrice())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
