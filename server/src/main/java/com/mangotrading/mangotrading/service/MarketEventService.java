package com.mangotrading.mangotrading.service;

import com.mangotrading.mangotrading.dto.request.MarketEventRequest;
import com.mangotrading.mangotrading.dto.response.MarketEventResponse;
import com.mangotrading.mangotrading.entity.MarketEvent;
import com.mangotrading.mangotrading.entity.enums.EventDirection;
import com.mangotrading.mangotrading.entity.enums.EventScope;
import com.mangotrading.mangotrading.entity.enums.MarketImpact;
import com.mangotrading.mangotrading.entity.enums.RecurrenceType;
import com.mangotrading.mangotrading.exception.ResourceNotFoundException;
import com.mangotrading.mangotrading.repository.MarketEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
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
    public List<MarketEventResponse> findVisibleForPlayer() {
        LocalDateTime now = LocalDateTime.now();
        // Return all, but toResponse will compute status; frontend filters ACTIVE/UPCOMING
        // For efficiency, include those with enabled and (nextRunAt within visibility window or active)
        return marketEventRepository.findAll().stream()
                .filter(e -> Boolean.TRUE.equals(e.getEnabled()))
                .map(this::toResponse)
                .filter(r -> "ACTIVE".equals(r.getStatus()) || "UPCOMING".equals(r.getStatus()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MarketEventResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public MarketEventResponse create(MarketEventRequest request) {
        MarketEvent event = buildFromRequest(request);
        // compute nextRunAt if recurring
        if (event.getRecurrenceType() != RecurrenceType.NONE && Boolean.TRUE.equals(event.getEnabled())) {
            event.setNextRunAt(computeNextRunAt(event, LocalDateTime.now()));
            if (event.getRecurrenceType() == RecurrenceType.NONE) {
                // single shot uses startDate as nextRunAt if provided
                if (event.getNextRunAt() == null && event.getStartDate() != null) {
                    event.setNextRunAt(event.getStartDate());
                }
            }
        } else if (event.getRecurrenceType() == RecurrenceType.NONE && event.getStartDate() != null) {
            event.setNextRunAt(event.getStartDate());
        }
        event = marketEventRepository.save(event);
        return toResponse(event);
    }

    @Transactional
    public MarketEventResponse update(Long id, MarketEventRequest request) {
        MarketEvent event = getOrThrow(id);
        updateFromRequest(event, request);
        // recompute nextRunAt if recurrence changed
        if (event.getRecurrenceType() != RecurrenceType.NONE && Boolean.TRUE.equals(event.getEnabled())) {
            event.setNextRunAt(computeNextRunAt(event, LocalDateTime.now()));
        } else if (event.getRecurrenceType() == RecurrenceType.NONE) {
            event.setNextRunAt(event.getStartDate());
        }
        event = marketEventRepository.save(event);
        return toResponse(event);
    }

    @Transactional
    public void delete(Long id) {
        MarketEvent event = getOrThrow(id);
        marketEventRepository.delete(event);
    }

    @Transactional(readOnly = true)
    public List<LocalDateTime> previewNextRuns(Long id, int count) {
        MarketEvent event = getOrThrow(id);
        List<LocalDateTime> res = new ArrayList<>();
        LocalDateTime cursor = LocalDateTime.now();
        for (int i = 0; i < count; i++) {
            LocalDateTime next = computeNextRunAt(event, cursor);
            if (next == null) break;
            res.add(next);
            cursor = next.plusMinutes(1);
        }
        return res;
    }

    @Transactional
    public MarketEventResponse trigger(Long id) {
        MarketEvent event = getOrThrow(id);
        event.setNextRunAt(LocalDateTime.now());
        event = marketEventRepository.save(event);
        return toResponse(event);
    }

    private MarketEvent getOrThrow(Long id) {
        return marketEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado: " + id));
    }

    private MarketEvent buildFromRequest(MarketEventRequest r) {
        MarketEvent event = MarketEvent.builder()
                .title(r.getTitle())
                .description(r.getDescription())
                .impact(r.getImpact() != null ? MarketImpact.valueOf(r.getImpact().toUpperCase()) : MarketImpact.MEDIUM)
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .recurrenceType(parseRecurrence(r.getRecurrenceType()))
                .dailyTime(r.getDailyTime())
                .randomMinMinutes(parseMinutes(r.getRandomMinMinutes(), r.getRandomMin()))
                .randomMaxMinutes(parseMinutes(r.getRandomMaxMinutes(), r.getRandomMax()))
                .durationMinutes(r.getDurationMinutes() != null ? r.getDurationMinutes() : 60)
                .scope(parseScope(r.getScope()))
                .sector(r.getSector())
                .priceDeltaPercent(r.getPriceDeltaPercent())
                .direction(parseDirection(r.getDirection()))
                .enabled(r.getEnabled() != null ? r.getEnabled() : true)
                .visibilityMinutes(r.getVisibilityMinutes() != null ? r.getVisibilityMinutes() : 3)
                .daysOfWeek(r.getDaysOfWeek() != null ? r.getDaysOfWeek() : "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY")
                .build();
        // normalize sector when scope ALL
        if (event.getScope() == EventScope.ALL) event.setSector(null);
        return event;
    }

    private void updateFromRequest(MarketEvent e, MarketEventRequest r) {
        e.setTitle(r.getTitle());
        e.setDescription(r.getDescription());
        if (r.getImpact() != null) e.setImpact(MarketImpact.valueOf(r.getImpact().toUpperCase()));
        e.setStartDate(r.getStartDate());
        e.setEndDate(r.getEndDate());
        if (r.getRecurrenceType() != null) e.setRecurrenceType(parseRecurrence(r.getRecurrenceType()));
        if (r.getDailyTime() != null) e.setDailyTime(r.getDailyTime());
        if (r.getRandomMin() != null || r.getRandomMinMinutes() != null) e.setRandomMinMinutes(parseMinutes(r.getRandomMinMinutes(), r.getRandomMin()));
        if (r.getRandomMax() != null || r.getRandomMaxMinutes() != null) e.setRandomMaxMinutes(parseMinutes(r.getRandomMaxMinutes(), r.getRandomMax()));
        if (r.getDurationMinutes() != null) e.setDurationMinutes(r.getDurationMinutes());
        if (r.getScope() != null) e.setScope(parseScope(r.getScope()));
        e.setSector(r.getSector());
        e.setPriceDeltaPercent(r.getPriceDeltaPercent());
        if (r.getDirection() != null) e.setDirection(parseDirection(r.getDirection()));
        if (r.getEnabled() != null) e.setEnabled(r.getEnabled());
        if (r.getVisibilityMinutes() != null) e.setVisibilityMinutes(r.getVisibilityMinutes());
        if (r.getDaysOfWeek() != null) e.setDaysOfWeek(r.getDaysOfWeek());
        if (e.getScope() == EventScope.ALL) e.setSector(null);
    }

    private RecurrenceType parseRecurrence(String s) {
        if (s == null || s.isBlank()) return RecurrenceType.NONE;
        return RecurrenceType.valueOf(s.toUpperCase());
    }

    private EventScope parseScope(String s) {
        if (s == null || s.isBlank()) return EventScope.ALL;
        return EventScope.valueOf(s.toUpperCase());
    }

    private EventDirection parseDirection(String s) {
        if (s == null || s.isBlank()) return EventDirection.RANDOM;
        return EventDirection.valueOf(s.toUpperCase());
    }

    private Integer parseMinutes(Integer direct, String textual) {
        if (direct != null) return direct;
        if (textual == null || textual.isBlank()) return null;
        String t = textual.trim().toLowerCase();
        try {
            if (t.endsWith("h")) {
                String num = t.substring(0, t.length() - 1);
                return (int) (Double.parseDouble(num) * 60);
            } else if (t.endsWith("m")) {
                String num = t.substring(0, t.length() - 1);
                return (int) Double.parseDouble(num);
            } else {
                return Integer.parseInt(t);
            }
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public LocalDateTime computeNextRunAt(MarketEvent event, LocalDateTime from) {
        if (Boolean.FALSE.equals(event.getEnabled())) return null;
        RecurrenceType rt = event.getRecurrenceType();
        if (rt == null || rt == RecurrenceType.NONE) {
            return event.getStartDate() != null && event.getStartDate().isAfter(from) ? event.getStartDate() : null;
        }
        if (rt == RecurrenceType.DAILY) {
            LocalTime dt = event.getDailyTime() != null ? event.getDailyTime() : LocalTime.of(9, 0);
            LocalDateTime candidate = from.toLocalDate().atTime(dt);
            if (!candidate.isAfter(from)) candidate = candidate.plusDays(1);
            // respect daysOfWeek
            Set<DayOfWeek> allowed = parseDays(event.getDaysOfWeek());
            int guard = 0;
            while (!allowed.contains(candidate.getDayOfWeek()) && guard++ < 14) {
                candidate = candidate.plusDays(1);
            }
            return candidate;
        }
        if (rt == RecurrenceType.RANDOM) {
            int min = event.getRandomMinMinutes() != null ? event.getRandomMinMinutes() : 30;
            int max = event.getRandomMaxMinutes() != null ? event.getRandomMaxMinutes() : 120;
            if (min > max) { int tmp = min; min = max; max = tmp; }
            if (min < 1) min = 1;
            int delta = ThreadLocalRandom.current().nextInt(min, max + 1);
            return from.plusMinutes(delta);
        }
        return null;
    }

    private Set<DayOfWeek> parseDays(String csv) {
        if (csv == null || csv.isBlank()) return Set.of(DayOfWeek.values());
        try {
            return java.util.Arrays.stream(csv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .map(s -> DayOfWeek.valueOf(s.toUpperCase()))
                    .collect(Collectors.toSet());
        } catch (Exception e) {
            return Set.of(DayOfWeek.values());
        }
    }

    private MarketEventResponse toResponse(MarketEvent e) {
        String status = computeStatus(e);
        Long secondsToStart = null;
        if ("UPCOMING".equals(status) && e.getNextRunAt() != null) {
            secondsToStart = Duration.between(LocalDateTime.now(), e.getNextRunAt()).getSeconds();
            if (secondsToStart < 0) secondsToStart = 0L;
        }
        return MarketEventResponse.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .impact(e.getImpact() != null ? e.getImpact().name() : null)
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .createdAt(e.getCreatedAt())
                .recurrenceType(e.getRecurrenceType() != null ? e.getRecurrenceType().name() : null)
                .dailyTime(e.getDailyTime())
                .randomMinMinutes(e.getRandomMinMinutes())
                .randomMaxMinutes(e.getRandomMaxMinutes())
                .durationMinutes(e.getDurationMinutes())
                .scope(e.getScope() != null ? e.getScope().name() : null)
                .sector(e.getSector())
                .priceDeltaPercent(e.getPriceDeltaPercent())
                .direction(e.getDirection() != null ? e.getDirection().name() : null)
                .enabled(e.getEnabled())
                .nextRunAt(e.getNextRunAt())
                .lastRunAt(e.getLastRunAt())
                .visibilityMinutes(e.getVisibilityMinutes())
                .daysOfWeek(e.getDaysOfWeek())
                .status(status)
                .secondsToStart(secondsToStart)
                .build();
    }

    private String computeStatus(MarketEvent e) {
        LocalDateTime now = LocalDateTime.now();
        // ACTIVE: now between startDate and endDate
        if (e.getStartDate() != null && e.getEndDate() != null && !now.isBefore(e.getStartDate()) && now.isBefore(e.getEndDate())) {
            return "ACTIVE";
        }
        // UPCOMING: nextRunAt within visibility window
        if (e.getNextRunAt() != null && Boolean.TRUE.equals(e.getEnabled())) {
            int vis = e.getVisibilityMinutes() != null ? e.getVisibilityMinutes() : 3;
            LocalDateTime visStart = e.getNextRunAt().minusMinutes(vis);
            if (!now.isBefore(visStart) && now.isBefore(e.getNextRunAt())) {
                return "UPCOMING";
            }
            if (now.isBefore(e.getNextRunAt())) {
                return "SCHEDULED";
            }
        }
        // Check if single shot upcoming
        if (e.getRecurrenceType() == RecurrenceType.NONE && e.getStartDate() != null && e.getStartDate().isAfter(now)) {
            int vis = e.getVisibilityMinutes() != null ? e.getVisibilityMinutes() : 3;
            if (!now.isBefore(e.getStartDate().minusMinutes(vis)) && now.isBefore(e.getStartDate())) {
                return "UPCOMING";
            }
            return "SCHEDULED";
        }
        if (e.getEndDate() != null && now.isAfter(e.getEndDate())) return "ENDED";
        return "SCHEDULED";
    }
}
