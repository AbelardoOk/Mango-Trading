package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.request.MarketEventRequest;
import com.mangotrading.mangotrading.dto.response.MarketEventResponse;
import com.mangotrading.mangotrading.entity.MarketEvent;
import com.mangotrading.mangotrading.entity.enums.MarketImpact;
import com.mangotrading.mangotrading.exception.ResourceNotFoundException;
import com.mangotrading.mangotrading.repository.MarketEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketEventService {

    private final MarketEventRepository marketEventRepository;

    @Transactional(readOnly = true)
    public List<MarketEventResponse> findAll() {
        return marketEventRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MarketEventResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public MarketEventResponse create(MarketEventRequest request) {
        MarketEvent event = MarketEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .impact(MarketImpact.valueOf(request.getImpact().toUpperCase()))
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
        event = marketEventRepository.save(event);
        return toResponse(event);
    }

    @Transactional
    public MarketEventResponse update(Long id, MarketEventRequest request) {
        MarketEvent event = getOrThrow(id);
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setImpact(MarketImpact.valueOf(request.getImpact().toUpperCase()));
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event = marketEventRepository.save(event);
        return toResponse(event);
    }

    @Transactional
    public void delete(Long id) {
        MarketEvent event = getOrThrow(id);
        marketEventRepository.delete(event);
    }

    private MarketEvent getOrThrow(Long id) {
        return marketEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado: " + id));
    }

    private MarketEventResponse toResponse(MarketEvent e) {
        return MarketEventResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .impact(e.getImpact().name())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
