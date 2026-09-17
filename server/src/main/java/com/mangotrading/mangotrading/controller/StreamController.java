package com.mangotrading.mangotrading.controller;

import com.mangotrading.mangotrading.dto.response.MarketEventResponse;
import com.mangotrading.mangotrading.dto.response.StockResponse;
import com.mangotrading.mangotrading.security.JwtTokenProvider;
import com.mangotrading.mangotrading.service.MarketEventService;
import com.mangotrading.mangotrading.service.SseService;
import com.mangotrading.mangotrading.service.StockService;
import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/stream")
@RequiredArgsConstructor
public class StreamController {

    private final SseService sseService;
    private final JwtTokenProvider tokenProvider;
    private final StockService stockService;
    private final MarketEventService marketEventService;
    private final ObjectMapper objectMapper;

    private boolean isValid(String token) {
        return token != null && !token.isBlank() && tokenProvider.validateToken(token);
    }

    @GetMapping(value = "/stocks", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stocks(@RequestParam(required = false) String token) {
        if (!isValid(token)) {
            SseEmitter emitter = new SseEmitter(0L);
            try {
                emitter.send(SseEmitter.event().name("error").data("Unauthorized"));
            } catch (Exception ignored) {}
            emitter.complete();
            return emitter;
        }
        SseEmitter emitter = sseService.subscribeStocks();
        try {
            List<StockResponse> stocks = stockService.findActive();
            emitter.send(SseEmitter.event().name("stocks").data(objectMapper.writeValueAsString(stocks)));
        } catch (Exception ignored) {}
        return emitter;
    }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter events(@RequestParam(required = false) String token) {
        if (!isValid(token)) {
            SseEmitter emitter = new SseEmitter(0L);
            try { emitter.send(SseEmitter.event().name("error").data("Unauthorized")); } catch (Exception ignored) {}
            emitter.complete();
            return emitter;
        }
        SseEmitter emitter = sseService.subscribeEvents();
        try {
            List<MarketEventResponse> events = marketEventService.findVisibleForPlayer();
            emitter.send(SseEmitter.event().name("events").data(objectMapper.writeValueAsString(events)));
        } catch (Exception ignored) {}
        return emitter;
    }
}
