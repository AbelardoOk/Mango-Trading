package com.mangotrading.mangotrading.config;

import com.mangotrading.mangotrading.entity.Portfolio;
import com.mangotrading.mangotrading.entity.User;
import com.mangotrading.mangotrading.entity.enums.Role;
import com.mangotrading.mangotrading.repository.PortfolioRepository;
import com.mangotrading.mangotrading.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:}")
    private String adminEmail;

    @Value("${admin.password:}")
    private String adminPassword;

    @Value("${admin.name:Administrador}")
    private String adminName;

    @Override
    @Transactional
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.info("AdminSeeder skipped: ADMIN_EMAIL or ADMIN_PASSWORD not set (see .env.example)");
            return;
        }

        if (userRepository.existsByEmail(adminEmail)) {
            // ensure existing user is ADMIN (idempotent)
            userRepository.findByEmail(adminEmail).ifPresent(user -> {
                if (user.getRole() != Role.ADMIN) {
                    user.setRole(Role.ADMIN);
                    userRepository.save(user);
                    log.info("AdminSeeder: promoted existing user {} to ADMIN", adminEmail);
                } else {
                    log.info("AdminSeeder: admin {} already exists, skipping", adminEmail);
                }
            });
            return;
        }

        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build();
        admin = userRepository.save(admin);

        Portfolio portfolio = Portfolio.builder()
                .user(admin)
                .build();
        portfolioRepository.save(portfolio);

        log.info("AdminSeeder: created ADMIN user {} (id={})", adminEmail, admin.getId());
    }
}
