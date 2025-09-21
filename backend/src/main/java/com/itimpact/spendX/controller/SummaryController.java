package com.itimpact.spendX.controller;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
public class SummaryController {
    private final JdbcTemplate jdbcTemplate;

    public SummaryController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/summary")
    public Map<String, Object> getUserSummary(@RequestParam("userId") Long userId) {
        String sql = "SELECT * FROM usersummary WHERE userId = ?";
        try {
            return jdbcTemplate.queryForMap(sql, userId);
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Summary not found for userId=" + userId);
        }
    }

    @GetMapping("/investment")
    public Map<String, Object> getUserInvestmentSummary(@RequestParam("userId") Long userId) {
        // Prepare summary query
        String summarySql = "SELECT " +
                "SUM(amount) AS totalInvestment, " +
                "SUM(currentValue - amount) AS totalReturn, " +
                "SUM(currentValue) AS totalCurrentValue, " +
                "COUNT(*) AS totalTransactions " +
                "FROM investments WHERE userId = ?";
        // Prepare transactions query
        String transactionsSql = "SELECT investmentId,userId,type,amount,currentValue,"+
            "((SUM(currentValue) OVER (PARTITION BY userId) - SUM(amount) OVER (PARTITION BY userId)) / SUM(amount) OVER (PARTITION BY userId)) * 100 AS returnRate,"+
            " createdAt, description FROM investments WHERE userId = ?";

        try {
            Map<String, Object> summary = jdbcTemplate.queryForMap(summarySql, userId);
            // Query for transactions
            var transactions = jdbcTemplate.query(transactionsSql, new Object[]{userId}, (rs, rowNum) -> Map.of(
                    "investmentId", rs.getLong("investmentId"),
                    "userId", rs.getLong("userId"),
                    "type", rs.getString("type"),
                    "amount", rs.getDouble("amount"),
                    "currentValue", rs.getDouble("currentValue"),
                    "returnRate", rs.getDouble("returnRate"),
                    "createdAt", rs.getTimestamp("createdAt"),
                    "description", rs.getString("description")
            ));
            summary.put("transactions", transactions);
            return summary;
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Summary not found for userId=" + userId);
        }
    }
}
