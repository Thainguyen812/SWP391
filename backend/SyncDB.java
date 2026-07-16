import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class SyncDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5433/parking_db";
        String user = "parking_user";
        String password = "ParkingDB@2024!";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to the PostgreSQL server successfully.");
            
            // Fix zones
            String updateSql = "UPDATE zones SET current_occupied = (" +
                               "SELECT COUNT(*) FROM parking_sessions WHERE session_status = 'ACTIVE' AND assigned_zone_id = zones.id" +
                               ")";
            try (PreparedStatement pstmt = conn.prepareStatement(updateSql)) {
                int affectedRows = pstmt.executeUpdate();
                System.out.println("Sync completed! Updated " + affectedRows + " zones.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
