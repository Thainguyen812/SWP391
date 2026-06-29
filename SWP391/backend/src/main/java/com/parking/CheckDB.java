package com.parking;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckDB {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5433/parking_db", "parking_user", "ParkingDB@2024!");
            Statement stmt = conn.createStatement();
            
            System.out.println("--- ZONES ---");
            ResultSet rs = stmt.executeQuery("SELECT zone_code, allowed_sizes, total_slots, current_occupied FROM zones");
            while (rs.next()) {
                System.out.println(rs.getString("zone_code") + " | " + rs.getString("allowed_sizes") + " | Slots: " + rs.getInt("total_slots") + " | Occ: " + rs.getInt("current_occupied"));
            }
            
            System.out.println("\n--- PRICING RULES ---");
            rs = stmt.executeQuery("SELECT vehicle_size FROM pricing_rules");
            while (rs.next()) {
                System.out.println(rs.getString("vehicle_size"));
            }
            
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
