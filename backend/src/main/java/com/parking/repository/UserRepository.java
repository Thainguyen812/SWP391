package com.parking.repository;

import com.parking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface UserRepository extends JpaRepository<User, UUID> {
    List<User> findAllByUsername(String username);

    default Optional<User> findByUsername(String username) {
        List<User> list = findAllByUsername(username);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    List<User> findAllByEmail(String email);

    default Optional<User> findByEmail(String email) {
        List<User> list = findAllByEmail(email);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}
