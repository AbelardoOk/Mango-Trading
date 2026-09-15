package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.request.StockRequest;
import com.mangotrading.mangotrading.dto.response.StockResponse;
import com.mangotrading.mangotrading.entity.Stock;
import com.mangotrading.mangotrading.entity.StockPriceHistory;
import com.mangotrading.mangotrading.exception.BadRequestException;
import com.mangotrading.mangotrading.exception.ResourceNotFoundException;
import com.mangotrading.mangotrading.repository.StockPriceHistoryRepository;
import com.mangotrading.mangotrading.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final StockPriceHistoryRepository priceHistoryRepository;

    @Transactional(readOnly = true)
    public List<StockResponse> findAll() {
        return stockRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StockResponse> findActive() {
        return stockRepository.findByActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StockResponse findById(Long id) {
        Stock stock = getStockOrThrow(id);
        return toResponse(stock);
    }

    @Transactional
    public StockResponse create(StockRequest request) {
        if (stockRepository.existsBySymbol(request.getSymbol())) {
            throw new BadRequestException("Símbolo já existe: " + request.getSymbol());
        }
        Stock stock = Stock.builder()
                .name(request.getName())
                .symbol(request.getSymbol().toUpperCase())
                .description(request.getDescription())
                .sector(request.getSector())
                .currentPrice(request.getCurrentPrice())
                .volatility(request.getVolatility() != null ? request.getVolatility() : BigDecimal.ZERO)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        stock = stockRepository.save(stock);
        savePriceHistory(stock);
        return toResponse(stock);
    }

    @Transactional
    public StockResponse update(Long id, StockRequest request) {
        Stock stock = getStockOrThrow(id);

        if (!stock.getSymbol().equalsIgnoreCase(request.getSymbol())
                && stockRepository.existsBySymbol(request.getSymbol())) {
            throw new BadRequestException("Símbolo já existe: " + request.getSymbol());
        }

        BigDecimal oldPrice = stock.getCurrentPrice();

        stock.setName(request.getName());
        stock.setSymbol(request.getSymbol().toUpperCase());
        stock.setDescription(request.getDescription());
        stock.setSector(request.getSector());
        stock.setCurrentPrice(request.getCurrentPrice());
        if (request.getVolatility() != null) stock.setVolatility(request.getVolatility());
        if (request.getActive() != null) stock.setActive(request.getActive());

        stock = stockRepository.save(stock);

        if (oldPrice == null || oldPrice.compareTo(request.getCurrentPrice()) != 0) {
            savePriceHistory(stock);
        }

        return toResponse(stock);
    }

    @Transactional
    public void delete(Long id) {
        Stock stock = getStockOrThrow(id);
        stockRepository.delete(stock);
    }

    @Transactional
    public StockResponse updatePrice(Long id, BigDecimal newPrice) {
        Stock stock = getStockOrThrow(id);
        stock.setCurrentPrice(newPrice);
        stock = stockRepository.save(stock);
        savePriceHistory(stock);
        return toResponse(stock);
    }

    private Stock getStockOrThrow(Long id) {
        return stockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ação não encontrada: " + id));
    }

    private void savePriceHistory(Stock stock) {
        StockPriceHistory history = StockPriceHistory.builder()
                .stock(stock)
                .price(stock.getCurrentPrice())
                .build();
        priceHistoryRepository.save(history);
    }

    private StockResponse toResponse(Stock stock) {
        return StockResponse.builder()
                .id(stock.getId())
                .name(stock.getName())
                .symbol(stock.getSymbol())
                .description(stock.getDescription())
                .sector(stock.getSector())
                .currentPrice(stock.getCurrentPrice())
                .volatility(stock.getVolatility())
                .active(stock.getActive())
                .createdAt(stock.getCreatedAt())
                .updatedAt(stock.getUpdatedAt())
                .build();
    }
}
