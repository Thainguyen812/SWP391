package com.parking;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixFlyway {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5433/parking_db", "parking_user", "ParkingDB@2024!");
            Statement stmt = conn.createStatement();
            int rows = stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE success = false");
            System.out.println("Deleted " + rows + " failed flyway migrations.");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
