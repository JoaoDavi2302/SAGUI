package com.ufpa.SAGUI.repository.user;

import org.springframework.data.jpa.domain.Specification;

import com.ufpa.SAGUI.enums.EntityStatus;
import com.ufpa.SAGUI.enums.UserRole;
import com.ufpa.SAGUI.models.user.User;

public final class UserSpecifications {

    private UserSpecifications() {}

    public static Specification<User> withFilters(UserRole role, EntityStatus status, String search) {
        return (root, query, criteriaBuilder) -> {
            var predicates = criteriaBuilder.conjunction();

            if (role != null) {
                predicates = criteriaBuilder.and(predicates, criteriaBuilder.equal(root.get("role"), role));
            }

            if (status != null) {
                predicates = criteriaBuilder.and(predicates, criteriaBuilder.equal(root.get("status"), status));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                var nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern);
                var emailMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), pattern);
                predicates = criteriaBuilder.and(predicates, criteriaBuilder.or(nameMatch, emailMatch));
            }

            return predicates;
        };
    }
}
