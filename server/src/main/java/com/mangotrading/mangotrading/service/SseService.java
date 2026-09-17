package com.mangotrading.mangotrading.service;

import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class SseService {

    private final ObjectMapper objectMapper;
    private final List<SseEmitter> stockEmitters = new CopyOnWriteArrayList<>();
    private final List<SseEmitter> eventEmitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribeStocks() {
        SseEmitter emitter = new SseEmitter(0L);
        stockEmitters.add(emitter);
        emitter.onCompletion(() -> stockEmitters.remove(emitter));
        emitter.onTimeout(() -> stockEmitters.remove(emitter));
        emitter.onError(e -> stockEmitters.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("init").data("connected"));
        } catch (IOException e) {
            stockEmitters.remove(emitter);
        }
        log.info("SSE stock subscriber added, total {}", stockEmitters.size());
        return emitter;
    }

    public SseEmitter subscribeEvents() {
        SseEmitter emitter = new SseEmitter(0L);
        eventEmitters.add(emitter);
        emitter.onCompletion(() -> eventEmitters.remove(emitter));
        emitter.onTimeout(() -> eventEmitters.remove(emitter));
        emitter.onError(e -> eventEmitters.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("init").data("connected"));
        } catch (IOException e) {
            eventEmitters.remove(emitter);
        }
        log.info("SSE event subscriber added, total {}", eventEmitters.size());
        return emitter;
    }

    public void broadcastStocks(Object payload) {
        broadcast(stockEmitters, "stocks", payload);
    }

    public void broadcastEvents(Object payload) {
        broadcast(eventEmitters, "events", payload);
    }

    private void broadcast(List<SseEmitter> emitters, String eventName, Object payload) {
        if (emitters.isEmpty()) return;
        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            log.error("SSE serialize error", e);
            return;
        }
        for (SseEmitter emitter : List.copyOf(emitters)) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(json));
            } catch (Exception e) {
                emitters.remove(emitter);
                log.debug("SSE emitter removed on error", e);
            }
        }
        log.debug("SSE broadcast {} to {} emitters", eventName, emitters.size());
    }
}
