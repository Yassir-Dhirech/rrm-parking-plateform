package com.rrm.parking.avis.repository;

import com.rrm.parking.avis.entity.AvisFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AvisFeedbackRepository extends JpaRepository<AvisFeedback, Long> {
    @Query("select a.noteSatisfaction, count(a) from AvisFeedback a group by a.noteSatisfaction")
    List<Object[]> repartirParNote();

    @Query("select a from AvisFeedback a left join fetch a.parking order by a.dateCreation desc, a.id desc")
    List<AvisFeedback> tousAvecParking();

    @Query(value = "select a from AvisFeedback a left join fetch a.parking",
            countQuery = "select count(a) from AvisFeedback a")
    Page<AvisFeedback> pageAvecParking(Pageable pageable);
}
