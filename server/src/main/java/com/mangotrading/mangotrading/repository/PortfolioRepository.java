package com.mangotrading.mangotrading.repository;

import com.mangotrading.mangotrading.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    Optional<Portfolio> findByUserId(Long userId);

    @Query("select distinct p.user.id from Portfolio p where exists "
            + "(select 1 from PortfolioItem i where i.portfolio = p)")
    List<Long> findUserIdsWithItems();
}
