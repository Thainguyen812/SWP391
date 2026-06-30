import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class UpdateVip {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5433/parking_db";
        String user = "parking_user";
        String password = "ParkingDB@2024!";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            int rows = stmt.executeUpdate("UPDATE parking_sessions SET is_vip = true WHERE session_status = 'ACTIVE' AND random() < 0.25");
            System.out.println("Updated " + rows + " rows.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
