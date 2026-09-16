package com.mangotrading.mangotrading;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class MangoTradingApplication {

	public static void main(String[] args) {
		SpringApplication.run(MangoTradingApplication.class, args);
	}

}
