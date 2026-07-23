import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class ResetDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5433/parking_db";
        String user = "parking_user";
        String password = "ParkingDB@2024!";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Dropping schema public...");
            stmt.execute("DROP SCHEMA public CASCADE;");
            
            System.out.println("Creating schema public...");
            stmt.execute("CREATE SCHEMA public;");
            
            System.out.println("Database reset successful! Please restart the Spring Boot backend.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
