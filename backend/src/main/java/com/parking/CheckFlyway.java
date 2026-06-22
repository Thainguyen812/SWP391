package com.parking;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckFlyway {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5433/parking_db", "parking_user", "ParkingDB@2024!");
            Statement stmt = conn.createStatement();
            
            System.out.println("--- FLYWAY HISTORY ---");
            ResultSet rs = stmt.executeQuery("SELECT version, description, success FROM flyway_schema_history");
            while (rs.next()) {
                System.out.println("V" + rs.getString("version") + " - " + rs.getString("description") + " - Success: " + rs.getBoolean("success"));
            }
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
